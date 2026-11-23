<?php

namespace App\Services;

use App\Models\Animal;
use App\Models\FeedingLog;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ZooService
{
    /**
     * @return array<string, mixed>
     */
    public function dashboardData(): array
    {
        $today = now()->toDateString();

        return [
            'summary' => [
                'animalCount' => Animal::query()->count(),
                'feedingCountToday' => FeedingLog::query()->whereDate('feeding_date', $today)->count(),
                'feedQuantityToday' => (float) FeedingLog::query()
                    ->whereDate('feeding_date', $today)
                    ->sum('feed_quantity_kg'),
                'vetReviewCount' => FeedingLog::query()->where('vet_check_required', true)->count(),
            ],
            'speciesBreakdown' => Animal::query()
                ->select('species')
                ->selectRaw('count(*) as total')
                ->groupBy('species')
                ->orderByDesc('total')
                ->orderBy('species')
                ->limit(5)
                ->get(),
            'recentFeedings' => FeedingLog::query()
                ->with(['animal:id,animal_tag_id,species', 'zookeeper:id,name', 'feedType:id,name'])
                ->latest('feeding_date')
                ->latest('feeding_time')
                ->limit(6)
                ->get(),
        ];
    }

    /**
     * @return array{total: int, needsReview: int, totalQuantity: float}
     */
    public function feedingLogSummary(): array
    {
        return [
            'total' => FeedingLog::query()->count(),
            'needsReview' => FeedingLog::query()->where('vet_check_required', true)->count(),
            'totalQuantity' => (float) FeedingLog::query()->sum('feed_quantity_kg'),
        ];
    }

    /**
     * @return Collection<int, float>
     */
    public function dailyFeedingTotals(string $date): Collection
    {
        return FeedingLog::query()
            ->whereDate('feeding_date', $date)
            ->selectRaw('animal_id, SUM(feed_quantity_kg) as total_quantity')
            ->groupBy('animal_id')
            ->pluck('total_quantity', 'animal_id')
            ->map(fn ($quantity) => (float) $quantity);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createAnimal(array $data): Animal
    {
        return DB::transaction(fn () => Animal::create($this->sanitizeAnimalData($data)));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateAnimal(Animal $animal, array $data): Animal
    {
        return DB::transaction(function () use ($animal, $data) {
            $animal->update($this->sanitizeAnimalData($data));

            return $animal->refresh();
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createFeedingLog(array $data): FeedingLog
    {
        return DB::transaction(function () use ($data) {
            $animal = Animal::query()->lockForUpdate()->findOrFail($data['animal_id']);
            $data = $this->sanitizeFeedingLogData($data);
            $this->validateDailyFeedLimit($animal, $data['feeding_date'], (float) $data['feed_quantity_kg']);

            return FeedingLog::create($data);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateFeedingLog(FeedingLog $feedingLog, array $data): FeedingLog
    {
        return DB::transaction(function () use ($feedingLog, $data) {
            $data = $this->sanitizeFeedingLogData($data);
            $healthCondition = $data['health_condition'] ?? $feedingLog->health_condition;
            if (is_string($healthCondition) && strcasecmp($healthCondition, 'Poor') === 0) {
                $data['vet_check_required'] = true;
            }

            $animalId = $data['animal_id'] ?? $feedingLog->animal_id;
            $feedingDate = $data['feeding_date'] ?? $feedingLog->feeding_date->toDateString();
            $animal = Animal::query()->lockForUpdate()->findOrFail($animalId);
            $quantity = (float) ($data['feed_quantity_kg'] ?? $feedingLog->feed_quantity_kg);

            $this->validateDailyFeedLimit($animal, $feedingDate, $quantity, $feedingLog);
            $feedingLog->update($data);

            return $feedingLog->refresh();
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function sanitizeAnimalData(array $data): array
    {
        foreach (['animal_tag_id', 'species'] as $field) {
            if (isset($data[$field])) {
                $data[$field] = trim(strip_tags((string) $data[$field]));
            }
        }

        if (isset($data['animal_tag_id'])) {
            $data['animal_tag_id'] = strtoupper($data['animal_tag_id']);
        }

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function sanitizeFeedingLogData(array $data): array
    {
        if (array_key_exists('health_condition', $data) && $data['health_condition'] !== null) {
            $data['health_condition'] = trim(strip_tags((string) $data['health_condition']));
        }

        if (isset($data['feed_quantity_kg'])) {
            $data['feed_quantity_kg'] = number_format((float) $data['feed_quantity_kg'], 3, '.', '');
        }

        $healthCondition = $data['health_condition'] ?? null;
        if (is_string($healthCondition) && strcasecmp($healthCondition, 'Poor') === 0) {
            $data['vet_check_required'] = true;
        }

        return $data;
    }

    private function validateDailyFeedLimit(
        Animal $animal,
        string $feedingDate,
        float $quantity,
        ?FeedingLog $currentLog = null,
    ): void {
        $limits = config('zoo.daily_feed_limits_kg', []);
        $limit = null;

        foreach ($limits as $species => $speciesLimit) {
            if (strcasecmp(trim((string) $species), trim($animal->species)) === 0) {
                $limit = $speciesLimit;
                break;
            }
        }

        if (! is_numeric($limit) || (float) $limit <= 0) {
            throw ValidationException::withMessages([
                'animal_id' => "No valid daily dietary standard is configured for {$animal->species}.",
            ]);
        }

        $consumed = FeedingLog::query()
            ->where('animal_id', $animal->id)
            ->whereDate('feeding_date', $feedingDate)
            ->when($currentLog, fn ($query) => $query->whereKeyNot($currentLog->getKey()))
            ->sum('feed_quantity_kg');

        if ((float) $consumed + $quantity > (float) $limit) {
            throw ValidationException::withMessages([
                'feed_quantity_kg' => "The daily feed quantity would exceed the {$limit} kg limit for {$animal->species}.",
            ]);
        }
    }
}

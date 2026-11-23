<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFeedingLogRequest;
use App\Http\Requests\UpdateFeedingLogRequest;
use App\Models\Animal;
use App\Models\FeedingLog;
use App\Models\FeedType;
use App\Models\Zookeeper;
use App\Services\ZooService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

use Inertia\Inertia;
use Inertia\Response;

class FeedingLogController extends Controller
{
    public function index(Request $request, ZooService $service): JsonResponse|Response
    {
        $search = trim((string) $request->query('search', ''));
        $review = $request->query('review') === 'needs-review' ? 'needs-review' : 'all';
        $query = FeedingLog::query()
            ->with(['animal:id,animal_tag_id,species,enclosure_id', 'animal.enclosure:id,zone_name', 'zookeeper:id,name', 'feedType:id,name'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('health_condition', 'like', "%{$search}%")
                        ->orWhereHas('animal', function ($query) use ($search) {
                            $query->where('animal_tag_id', 'like', "%{$search}%")
                                ->orWhere('species', 'like', "%{$search}%");
                        })
                        ->orWhereHas('zookeeper', fn ($query) => $query->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('feedType', fn ($query) => $query->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($review === 'needs-review', fn ($query) => $query->where('vet_check_required', true))
            ->latest('feeding_date')
            ->latest('feeding_time');
        $logs = (clone $query)->paginate(12)->withQueryString();

        if ($request->wantsJson()) {
            return response()->json($logs);
        }

        return Inertia::render('feedings/index', [
            'logs' => $logs,
            'filters' => ['search' => $search, 'review' => $review],
            'summary' => $service->feedingLogSummary(),
        ]);
    }

    public function create(ZooService $service): JsonResponse|Response
    {
        $animals = Animal::query()
            ->with('enclosure:id,zone_name')
            ->orderBy('animal_tag_id')
            ->get(['id', 'animal_tag_id', 'species', 'enclosure_id']);
        $today = now()->toDateString();
        $options = [
            'animals' => $animals,
            'zookeepers' => Zookeeper::query()->orderBy('name')->get(['id', 'name']),
            'feed_types' => FeedType::query()->orderBy('name')->get(['id', 'name']),
            'dailyTotals' => $service->dailyFeedingTotals($today),
            'dailyFeedLimits' => config('zoo.daily_feed_limits_kg', []),
        ];

        if (request()->wantsJson()) {
            return response()->json($options);
        }

        return Inertia::render('feedings/create', [
            ...$options,
            'today' => $today,
            'currentTime' => now()->format('H:i'),
        ]);
    }

    public function store(StoreFeedingLogRequest $request, ZooService $service): JsonResponse|RedirectResponse
    {
        $feedingLog = $service->createFeedingLog($request->validated());

        if ($request->wantsJson()) {
            return response()->json(
                $feedingLog->load(['animal.enclosure', 'zookeeper', 'feedType']),
                201,
            );
        }

        return to_route('feeding-logs.create')->with('success', 'Feeding record saved successfully.');
    }

    public function update(UpdateFeedingLogRequest $request, string $id, ZooService $service): JsonResponse
    {
        $feedingLog = FeedingLog::query()->findOrFail($id);

        return response()->json(
            $service->updateFeedingLog($feedingLog, $request->validated())
                ->load(['animal.enclosure', 'zookeeper', 'feedType']),
        );
    }
}

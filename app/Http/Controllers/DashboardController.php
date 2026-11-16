<?php

namespace App\Http\Controllers;

use App\Models\Animal;
use App\Models\FeedingLog;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $today = now()->toDateString();

        return Inertia::render('dashboard', [
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
        ]);
    }
}

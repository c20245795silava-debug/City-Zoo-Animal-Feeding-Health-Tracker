<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAnimalRequest;
use App\Http\Requests\UpdateAnimalRequest;
use App\Models\Animal;
use App\Models\Enclosure;
use App\Services\ZooService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnimalController extends Controller
{
    public function index(Request $request): JsonResponse|Response
    {
        $search = trim((string) $request->query('search', ''));
        $animals = Animal::query()
            ->with('enclosure:id,zone_name')
            ->withCount('feedingLogs')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('animal_tag_id', 'like', "%{$search}%")
                        ->orWhere('species', 'like', "%{$search}%")
                        ->orWhereHas('enclosure', fn ($query) => $query->where('zone_name', 'like', "%{$search}%"));
                });
            })
            ->orderBy('animal_tag_id')
            ->paginate(12)
            ->withQueryString();

        if ($request->wantsJson()) {
            return response()->json($animals);
        }

        return Inertia::render('animals/index', [
            'animals' => $animals,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('animals/create', [
            'enclosures' => Enclosure::query()->orderBy('zone_name')->get(['id', 'zone_name']),
            'species' => array_keys(config('zoo.daily_feed_limits_kg', [])),
        ]);
    }

    public function store(StoreAnimalRequest $request, ZooService $service): JsonResponse|RedirectResponse
    {
        $animal = $service->createAnimal($request->validated());

        if ($request->wantsJson()) {
            return response()->json($animal->load('enclosure'), 201);
        }

        return to_route('animals.index')->with('success', 'Animal registered successfully.');
    }

    public function update(UpdateAnimalRequest $request, string $id, ZooService $service): JsonResponse
    {
        $animal = Animal::query()->findOrFail($id);

        return response()->json($service->updateAnimal($animal, $request->validated())->load('enclosure'));
    }
}

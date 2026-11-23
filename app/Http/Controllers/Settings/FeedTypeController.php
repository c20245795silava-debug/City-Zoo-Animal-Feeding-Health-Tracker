<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\FeedType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedTypeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('settings/feed-types', [
            'feedTypes' => FeedType::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (is_string($request->input('name'))) {
            $request->merge(['name' => trim(strip_tags($request->input('name')))]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:feed_types,name'],
        ]);

        FeedType::query()->create($validated);

        return to_route('settings.feed-types')->with('success', 'Feed type added.');
    }
}
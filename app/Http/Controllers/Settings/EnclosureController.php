<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Enclosure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EnclosureController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('settings/enclosures', [
            'enclosures' => Enclosure::query()->orderBy('zone_name')->get(['id', 'zone_name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (is_string($request->input('zone_name'))) {
            $request->merge(['zone_name' => trim(strip_tags($request->input('zone_name')))]);
        }

        $validated = $request->validate([
            'zone_name' => ['required', 'string', 'max:255', 'unique:enclosures,zone_name'],
        ]);

        Enclosure::query()->create($validated);

        return to_route('settings.enclosures')->with('success', 'Enclosure added.');
    }
}
<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Zookeeper;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ZookeeperController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('settings/zookeepers', [
            'zookeepers' => Zookeeper::query()->orderBy('name')->orderBy('id')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (is_string($request->input('name'))) {
            $request->merge(['name' => trim(strip_tags($request->input('name')))]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        Zookeeper::query()->create($validated);

        return to_route('settings.zookeepers')->with('success', 'Zookeeper added.');
    }
}
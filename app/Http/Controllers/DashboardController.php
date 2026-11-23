<?php

namespace App\Http\Controllers;

use App\Services\ZooService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(ZooService $service): Response
    {
        return Inertia::render('dashboard', $service->dashboardData());
    }
}

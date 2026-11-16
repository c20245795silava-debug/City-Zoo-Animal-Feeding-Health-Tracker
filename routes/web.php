<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AnimalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FeedingLogController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('animals', AnimalController::class)->only(['index', 'create', 'store', 'update']);
    Route::resource('feeding-logs', FeedingLogController::class)->only(['index', 'create', 'store', 'update']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

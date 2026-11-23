<?php

use App\Http\Controllers\Settings\EnclosureController;
use App\Http\Controllers\Settings\FeedTypeController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\ZookeeperController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    Route::get('settings/enclosures', [EnclosureController::class, 'index'])->name('settings.enclosures');
    Route::post('settings/enclosures', [EnclosureController::class, 'store'])->name('settings.enclosures.store');

    Route::get('settings/feed-types', [FeedTypeController::class, 'index'])->name('settings.feed-types');
    Route::post('settings/feed-types', [FeedTypeController::class, 'store'])->name('settings.feed-types.store');

    Route::get('settings/zookeepers', [ZookeeperController::class, 'index'])->name('settings.zookeepers');
    Route::post('settings/zookeepers', [ZookeeperController::class, 'store'])->name('settings.zookeepers.store');
});

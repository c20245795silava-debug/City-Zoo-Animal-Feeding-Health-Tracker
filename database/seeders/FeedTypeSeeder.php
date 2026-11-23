<?php

namespace Database\Seeders;

use App\Models\FeedType;
use Illuminate\Database\Seeder;

class FeedTypeSeeder extends Seeder
{
    public function run(): void
    {
        $browse = FeedType::query()->where('name', 'Browse')->first();
        $grainExists = FeedType::query()->where('name', 'Grain')->exists();

        if ($browse && !$grainExists) {
            $browse->update(['name' => 'Grain']);
        }

        foreach (['Fish', 'Fresh produce', 'Hay', 'Meat', 'Pellets', 'Grain'] as $name) {
            FeedType::query()->firstOrCreate(['name' => $name]);
        }
    }
}



<?php

namespace Database\Seeders;

use App\Models\FeedType;
use Illuminate\Database\Seeder;

class FeedTypeSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Browse', 'Fish', 'Fresh produce', 'Hay', 'Meat', 'Pellets'] as $name) {
            FeedType::query()->firstOrCreate(['name' => $name]);
        }
    }
}



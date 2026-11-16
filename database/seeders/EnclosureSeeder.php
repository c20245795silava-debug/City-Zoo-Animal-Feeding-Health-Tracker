<?php

namespace Database\Seeders;

use App\Models\Enclosure;
use Illuminate\Database\Seeder;

class EnclosureSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Savannah', 'Rainforest', 'Aquatic'] as $zoneName) {
            Enclosure::query()->firstOrCreate(['zone_name' => $zoneName]);
        }
    }
}

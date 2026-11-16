<?php

namespace Database\Seeders;

use App\Models\Zookeeper;
use Illuminate\Database\Seeder;

class ZookeeperSeeder extends Seeder
{
    public function run(): void
    {
        Zookeeper::query()->firstOrCreate(['name' => 'Demo Keeper']);
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ZooReferenceSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            EnclosureSeeder::class,
            ZookeeperSeeder::class,
            FeedTypeSeeder::class,
        ]);
    }
}

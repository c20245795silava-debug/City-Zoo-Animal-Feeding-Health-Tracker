<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\Enclosure;
use App\Models\FeedingLog;
use App\Models\FeedType;
use App\Models\User;
use App\Models\Zookeeper;
use Database\Seeders\EnclosureSeeder;
use Database\Seeders\FeedTypeSeeder;
use Database\Seeders\ZooReferenceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ZooArchitectureTest extends TestCase
{
    use RefreshDatabase;

    public function test_animal_tags_are_uppercased_and_html_is_removed_from_species(): void
    {
        $this->actingAs(User::factory()->create());
        $enclosure = Enclosure::create(['zone_name' => 'Savannah']);

        $this->postJson(route('animals.store'), [
            'animal_tag_id' => '  lion-01 ',
            'species' => '<b>Lion</b>',
            'enclosure_id' => $enclosure->id,
        ])->assertCreated()
            ->assertJsonPath('animal_tag_id', 'LION-01')
            ->assertJsonPath('species', 'Lion');
    }

    public function test_animal_updates_normalize_tags_and_sanitize_species(): void
    {
        $this->actingAs(User::factory()->create());
        $animal = $this->createAnimal('LION-11', 'Lion');

        $this->putJson(route('animals.update', $animal), [
            'animal_tag_id' => '  lion-12 ',
            'species' => '<b>White Lion</b>',
        ])->assertOk()
            ->assertJsonPath('animal_tag_id', 'LION-12')
            ->assertJsonPath('species', 'White Lion');
    }

    public function test_animal_create_page_renders_with_enclosure_options(): void
    {
        $this->actingAs(User::factory()->create());
        Enclosure::create(['zone_name' => 'Savannah']);

        $this->get(route('animals.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('animals/create')
                ->has('enclosures', 1)
                ->where('enclosures.0.zone_name', 'Savannah')
                ->has('species'));
    }

    public function test_animal_edit_page_renders_existing_animal_and_enclosure_options(): void
    {
        $this->actingAs(User::factory()->create());
        $animal = $this->createAnimal('BIRD-001', 'Ostriche');

        $this->get(route('animals.edit', $animal))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('animals/edit')
                ->where('animal.animal_tag_id', 'BIRD-001')
                ->where('animal.species', 'Ostriche')
                ->where('animal.enclosure_id', $animal->enclosure_id)
                ->has('enclosures', 1)
                ->has('species'));
    }

    public function test_animal_can_be_updated_from_the_browser(): void
    {
        $this->actingAs(User::factory()->create());
        $animal = $this->createAnimal('BIRD-001', 'Ostriche');

        $this->put(route('animals.update', $animal), [
            'animal_tag_id' => 'BIRD-001',
            'species' => 'Ostrich',
            'enclosure_id' => $animal->enclosure_id,
        ])->assertRedirect(route('animals.index'))
            ->assertSessionHas('success', 'Animal updated successfully.');

        $this->assertDatabaseHas('animals', [
            'id' => $animal->id,
            'species' => 'Ostrich',
        ]);
    }

    public function test_animal_directory_renders_searchable_paginated_animals(): void
    {
        $this->actingAs(User::factory()->create());
        $enclosure = Enclosure::create(['zone_name' => 'Savannah']);
        $lion = Animal::create([
            'animal_tag_id' => 'LION-10',
            'species' => 'Lion',
            'enclosure_id' => $enclosure->id,
        ]);
        Animal::create([
            'animal_tag_id' => 'ZEBRA-10',
            'species' => 'Zebra',
            'enclosure_id' => Enclosure::create(['zone_name' => 'Plains'])->id,
        ]);

        $this->get(route('animals.index', ['search' => 'LION']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('animals/index')
                ->where('filters.search', 'LION')
                ->where('animals.total', 1)
                ->has('animals.data', 1)
                ->where('animals.data.0.animal_tag_id', 'LION-10')
                ->where('animals.data.0.enclosure.zone_name', 'Savannah')
                ->where('animals.data.0.feeding_logs_count', 0));

        $this->getJson(route('animals.index', ['search' => 'Zebra']))
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.animal_tag_id', 'ZEBRA-10');
    }

    public function test_browser_animal_submission_redirects_to_directory_with_success_message(): void
    {
        $this->actingAs(User::factory()->create());
        $enclosure = Enclosure::create(['zone_name' => 'Savannah']);

        $this->post(route('animals.store'), [
            'animal_tag_id' => 'lion-02',
            'species' => 'Lion',
            'enclosure_id' => $enclosure->id,
        ])->assertRedirect(route('animals.index'))
            ->assertSessionHas('success', 'Animal registered successfully.');

        $this->assertDatabaseHas('animals', [
            'animal_tag_id' => 'LION-02',
            'species' => 'Lion',
            'enclosure_id' => $enclosure->id,
        ]);
    }

    public function test_enclosure_seeder_creates_starter_zones_idempotently(): void
    {
        $this->seed(EnclosureSeeder::class);
        $this->seed(EnclosureSeeder::class);

        $this->assertDatabaseCount('enclosures', 6);
        foreach (['Savannah', 'Rainforest', 'Aquatic', 'Grassland', 'Tropical Forest and Grasslands', 'Wetland'] as $zoneName) {
            $this->assertDatabaseHas('enclosures', ['zone_name' => $zoneName]);
        }
    }

    public function test_zoo_reference_seeder_populates_feed_types_and_a_demo_keeper_idempotently(): void
    {
        $this->seed(ZooReferenceSeeder::class);
        $this->seed(ZooReferenceSeeder::class);

        $this->assertDatabaseHas('zookeepers', ['name' => 'Demo Keeper']);
        $this->assertDatabaseCount('zookeepers', 1);
        $this->assertDatabaseCount('feed_types', 6);
        $this->assertDatabaseHas('feed_types', ['name' => 'Fish']);
        $this->assertDatabaseHas('feed_types', ['name' => 'Meat']);
        $this->assertDatabaseHas('feed_types', ['name' => 'Hay']);
        $this->assertDatabaseHas('feed_types', ['name' => 'Grain']);
        $this->assertDatabaseMissing('feed_types', ['name' => 'Browse']);
    }

    public function test_feed_type_seeder_renames_the_obsolete_browse_type_to_grain(): void
    {
        $browse = FeedType::create(['name' => 'Browse']);

        $this->seed(FeedTypeSeeder::class);

        $this->assertDatabaseHas('feed_types', ['id' => $browse->id, 'name' => 'Grain']);
        $this->assertDatabaseMissing('feed_types', ['name' => 'Browse']);
    }

    public function test_daily_species_feed_limit_is_enforced(): void
    {
        config()->set('zoo.daily_feed_limits_kg', ['Lion' => 10]);
        $this->actingAs(User::factory()->create());
        $animal = $this->createAnimal('LION-02', 'Lion');
        $keeper = Zookeeper::create(['name' => 'Keeper']);
        $feed = FeedType::create(['name' => 'Meat']);

        $this->postJson(route('feeding-logs.store'), $this->feedingLogPayload($animal, $keeper, $feed, 6))
            ->assertCreated();

        $this->postJson(route('feeding-logs.store'), $this->feedingLogPayload($animal, $keeper, $feed, 4.001))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('feed_quantity_kg');
    }

    public function test_feeding_create_page_renders_with_dependencies_and_daily_limits(): void
    {
        $this->travelTo(Carbon::parse('2026-11-09 12:00:00'));
        config()->set('zoo.daily_feed_limits_kg', ['Lion' => 10]);
        $this->actingAs(User::factory()->create());
        $animal = $this->createAnimal('LION-06', 'Lion');
        $keeper = Zookeeper::create(['name' => 'Keeper']);
        $feed = FeedType::create(['name' => 'Meat']);
        FeedingLog::create([
            ...$this->feedingLogPayload($animal, $keeper, $feed, 8),
            'feeding_date' => '2026-11-08',
        ]);
        FeedingLog::create([
            ...$this->feedingLogPayload($animal, $keeper, $feed, 2),
            'feeding_date' => '2026-11-09',
        ]);

        $this->get(route('feeding-logs.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('feedings/create')
                ->has('animals', 1)
                ->where('animals.0.animal_tag_id', 'LION-06')
                ->has('zookeepers', 1)
                ->has('feed_types', 1)
                ->where("dailyTotals.{$animal->id}", 2)
                ->where('dailyFeedLimits.Lion', 10)
                ->has('today')
                ->has('currentTime'));
    }

    public function test_feeding_directory_renders_search_and_vet_review_filter(): void
    {
        $this->actingAs(User::factory()->create());
        $animal = $this->createAnimal('LION-08', 'Lion');
        $keeper = Zookeeper::create(['name' => 'Keeper']);
        $meat = FeedType::create(['name' => 'Meat']);
        $fish = FeedType::create(['name' => 'Fish']);
        FeedingLog::create([
            ...$this->feedingLogPayload($animal, $keeper, $meat, 3),
            'feeding_date' => now()->toDateString(),
            'vet_check_required' => true,
            'health_condition' => 'Poor',
        ]);
        FeedingLog::create([
            ...$this->feedingLogPayload($animal, $keeper, $fish, 2),
            'feeding_date' => now()->toDateString(),
            'health_condition' => 'Good',
            'vet_check_required' => false,
        ]);

        $this->get(route('feeding-logs.index', ['search' => 'LION-08', 'review' => 'needs-review']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('feedings/index')
                ->where('filters.search', 'LION-08')
                ->where('filters.review', 'needs-review')
                ->where('summary.total', 2)
                ->where('summary.needsReview', 1)
                ->where('summary.totalQuantity', 5)
                ->where('logs.total', 1)
                ->has('logs.data', 1)
                ->where('logs.data.0.animal.animal_tag_id', 'LION-08')
                ->where('logs.data.0.feed_type.name', 'Meat')
                ->where('logs.data.0.vet_check_required', true));

        $this->getJson(route('feeding-logs.index', ['search' => 'Fish']))
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.feed_type.name', 'Fish');
    }

    public function test_browser_feeding_submission_redirects_back_with_success_message(): void
    {
        config()->set('zoo.daily_feed_limits_kg', ['Lion' => 10]);
        $this->actingAs(User::factory()->create());
        $animal = $this->createAnimal('LION-07', 'Lion');
        $keeper = Zookeeper::create(['name' => 'Keeper']);
        $feed = FeedType::create(['name' => 'Meat']);

        $this->post(route('feeding-logs.store'), $this->feedingLogPayload($animal, $keeper, $feed, 2))
            ->assertRedirect(route('feeding-logs.create'))
            ->assertSessionHas('success', 'Feeding record saved successfully.');

        $this->assertDatabaseHas('feeding_logs', [
            'animal_id' => $animal->id,
            'feed_quantity_kg' => 2,
            'health_condition' => 'Good',
        ]);
    }

    public function test_poor_health_condition_is_sanitized_and_requires_vet_check(): void
    {
        config()->set('zoo.daily_feed_limits_kg', ['Lion' => 10]);
        $this->actingAs(User::factory()->create());
        $animal = $this->createAnimal('LION-03', 'Lion');
        $keeper = Zookeeper::create(['name' => 'Keeper']);
        $feed = FeedType::create(['name' => 'Meat']);

        $response = $this->postJson(route('feeding-logs.store'), [
            ...$this->feedingLogPayload($animal, $keeper, $feed, 2),
            'health_condition' => '<b>Poor</b>',
            'vet_check_required' => false,
        ]);

        $response->assertCreated()
            ->assertJsonPath('health_condition', 'Poor')
            ->assertJsonPath('vet_check_required', true);
    }

    public function test_updating_health_to_poor_forces_a_vet_check_even_if_unchecked(): void
    {
        config()->set('zoo.daily_feed_limits_kg', ['Lion' => 10]);
        $this->actingAs(User::factory()->create());
        $animal = $this->createAnimal('LION-12', 'Lion');
        $keeper = Zookeeper::create(['name' => 'Keeper']);
        $feed = FeedType::create(['name' => 'Meat']);
        $log = FeedingLog::create($this->feedingLogPayload($animal, $keeper, $feed, 2));

        $this->putJson(route('feeding-logs.update', $log), [
            'health_condition' => '<b>Poor</b>',
            'vet_check_required' => false,
        ])->assertOk()
            ->assertJsonPath('health_condition', 'Poor')
            ->assertJsonPath('vet_check_required', true);
    }

    public function test_feed_creation_requires_a_species_standard_to_be_configured(): void
    {
        config()->set('zoo.daily_feed_limits_kg', []);
        $this->actingAs(User::factory()->create());
        $animal = $this->createAnimal('LION-04', 'Lion');
        $keeper = Zookeeper::create(['name' => 'Keeper']);
        $feed = FeedType::create(['name' => 'Meat']);

        $this->postJson(route('feeding-logs.store'), $this->feedingLogPayload($animal, $keeper, $feed, 2))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('animal_id');
    }

    public function test_updating_a_log_excludes_its_existing_quantity_from_daily_limit(): void
    {
        config()->set('zoo.daily_feed_limits_kg', ['Lion' => 10]);
        $this->actingAs(User::factory()->create());
        $animal = $this->createAnimal('LION-05', 'Lion');
        $keeper = Zookeeper::create(['name' => 'Keeper']);
        $feed = FeedType::create(['name' => 'Meat']);
        $log = FeedingLog::create($this->feedingLogPayload($animal, $keeper, $feed, 6));

        $this->putJson(route('feeding-logs.update', $log), ['feed_quantity_kg' => 7])
            ->assertOk()
            ->assertJsonPath('feed_quantity_kg', '7.000');

        $this->putJson(route('feeding-logs.update', $log), ['feed_quantity_kg' => 11])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('feed_quantity_kg');
    }

    private function createAnimal(string $tag, string $species): Animal
    {
        $enclosure = Enclosure::create(['zone_name' => "Zone {$tag}"]);

        return Animal::create([
            'animal_tag_id' => $tag,
            'species' => $species,
            'enclosure_id' => $enclosure->id,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function feedingLogPayload(Animal $animal, Zookeeper $keeper, FeedType $feed, float $quantity): array
    {
        return [
            'animal_id' => $animal->id,
            'zookeeper_id' => $keeper->id,
            'feed_type_id' => $feed->id,
            'feed_quantity_kg' => $quantity,
            'feeding_date' => '2026-11-09',
            'feeding_time' => '09:30',
            'health_condition' => 'Good',
        ];
    }
}

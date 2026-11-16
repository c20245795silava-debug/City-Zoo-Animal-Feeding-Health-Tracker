<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\Enclosure;
use App\Models\FeedType;
use App\Models\FeedingLog;
use App\Models\User;
use App\Models\Zookeeper;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $this->actingAs($user = User::factory()->create());

        $this->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('summary.animalCount', 0)
                ->where('summary.feedingCountToday', 0)
                ->where('summary.feedQuantityToday', 0)
                ->where('summary.vetReviewCount', 0)
                ->has('speciesBreakdown', 0)
                ->has('recentFeedings', 0));
    }

    public function test_dashboard_shows_current_collection_and_recent_feeding_data()
    {
        $this->actingAs(User::factory()->create());
        $enclosure = Enclosure::create(['zone_name' => 'Savannah']);
        $animal = Animal::create([
            'animal_tag_id' => 'LION-01',
            'species' => 'Lion',
            'enclosure_id' => $enclosure->id,
        ]);
        $keeper = Zookeeper::create(['name' => 'Keeper']);
        $feedType = FeedType::create(['name' => 'Meat']);
        FeedingLog::create([
            'animal_id' => $animal->id,
            'zookeeper_id' => $keeper->id,
            'feed_type_id' => $feedType->id,
            'feed_quantity_kg' => 3.5,
            'feeding_date' => now()->toDateString(),
            'feeding_time' => '09:30',
            'health_condition' => 'Good',
            'vet_check_required' => false,
        ]);

        $this->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('summary.animalCount', 1)
                ->where('summary.feedingCountToday', 1)
                ->where('summary.feedQuantityToday', 3.5)
                ->has('speciesBreakdown', 1)
                ->where('speciesBreakdown.0.species', 'Lion')
                ->where('speciesBreakdown.0.total', 1)
                ->has('recentFeedings', 1)
                ->where('recentFeedings.0.animal.animal_tag_id', 'LION-01'));
    }
}

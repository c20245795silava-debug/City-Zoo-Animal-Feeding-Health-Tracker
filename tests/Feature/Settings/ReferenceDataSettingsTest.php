<?php

namespace Tests\Feature\Settings;

use App\Models\Enclosure;
use App\Models\FeedType;
use App\Models\User;
use App\Models\Zookeeper;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReferenceDataSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_reference_data_settings_require_authentication(): void
    {
        $this->get('/settings/enclosures')->assertRedirect('/login');
        $this->get('/settings/feed-types')->assertRedirect('/login');
        $this->get('/settings/zookeepers')->assertRedirect('/login');
    }

    public function test_reference_data_settings_list_existing_records(): void
    {
        $this->actingAs(User::factory()->create());
        $enclosure = Enclosure::create(['zone_name' => 'Savannah']);
        $feedType = FeedType::create(['name' => 'Hay']);
        $zookeeper = Zookeeper::create(['name' => 'Alex Morgan']);

        $this->get('/settings/enclosures')->assertInertia(fn (Assert $page) => $page
            ->component('settings/enclosures')
            ->where('enclosures.0.id', $enclosure->id)
            ->where('enclosures.0.zone_name', 'Savannah'));

        $this->get('/settings/feed-types')->assertInertia(fn (Assert $page) => $page
            ->component('settings/feed-types')
            ->where('feedTypes.0.id', $feedType->id)
            ->where('feedTypes.0.name', 'Hay'));

        $this->get('/settings/zookeepers')->assertInertia(fn (Assert $page) => $page
            ->component('settings/zookeepers')
            ->where('zookeepers.0.id', $zookeeper->id)
            ->where('zookeepers.0.name', 'Alex Morgan'));
    }

    public function test_enclosure_can_be_added_and_duplicate_names_are_rejected(): void
    {
        $this->actingAs(User::factory()->create());

        $this->post('/settings/enclosures', ['zone_name' => ' <b>North Habitat</b> '])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/settings/enclosures');

        $this->assertDatabaseHas('enclosures', ['zone_name' => 'North Habitat']);

        $this->from('/settings/enclosures')
            ->post('/settings/enclosures', ['zone_name' => 'North Habitat'])
            ->assertSessionHasErrors('zone_name');
    }

    public function test_feed_type_can_be_added_and_duplicate_names_are_rejected(): void
    {
        $this->actingAs(User::factory()->create());

        $this->post('/settings/feed-types', ['name' => 'Vegetables'])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/settings/feed-types');

        $this->assertDatabaseHas('feed_types', ['name' => 'Vegetables']);

        $this->from('/settings/feed-types')
            ->post('/settings/feed-types', ['name' => 'Vegetables'])
            ->assertSessionHasErrors('name');
    }

    public function test_zookeeper_can_be_added(): void
    {
        $this->actingAs(User::factory()->create());

        $this->post('/settings/zookeepers', ['name' => 'Alex Morgan'])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/settings/zookeepers');

        $this->assertDatabaseHas('zookeepers', ['name' => 'Alex Morgan']);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedingLog extends Model
{
    protected $fillable = [
        'animal_id',
        'zookeeper_id',
        'feed_type_id',
        'feed_quantity_kg',
        'feeding_date',
        'feeding_time',
        'health_condition',
        'vet_check_required',
    ];

    protected function casts(): array
    {
        return [
            'feed_quantity_kg' => 'decimal:3',
            'feeding_date' => 'date',
            'vet_check_required' => 'boolean',
        ];
    }

    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    public function zookeeper(): BelongsTo
    {
        return $this->belongsTo(Zookeeper::class);
    }

    public function feedType(): BelongsTo
    {
        return $this->belongsTo(FeedType::class);
    }
}

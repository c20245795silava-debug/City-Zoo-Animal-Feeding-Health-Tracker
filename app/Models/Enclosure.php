<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Enclosure extends Model
{
    protected $fillable = ['zone_name'];

    public function animals(): HasMany
    {
        return $this->hasMany(Animal::class);
    }
}

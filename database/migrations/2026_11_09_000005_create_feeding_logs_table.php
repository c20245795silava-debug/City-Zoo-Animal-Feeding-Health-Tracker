<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feeding_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('animal_id')->constrained()->cascadeOnDelete();
            $table->foreignId('zookeeper_id')->constrained()->restrictOnDelete();
            $table->foreignId('feed_type_id')->constrained()->restrictOnDelete();
            $table->decimal('feed_quantity_kg', 8, 3);
            $table->date('feeding_date');
            $table->time('feeding_time');
            $table->text('health_condition')->nullable();
            $table->boolean('vet_check_required')->default(false);
            $table->timestamps();
            $table->index(['animal_id', 'feeding_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feeding_logs');
    }
};

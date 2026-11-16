<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreFeedingLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'animal_id' => ['required', 'integer', 'exists:animals,id'],
            'zookeeper_id' => ['required', 'integer', 'exists:zookeepers,id'],
            'feed_type_id' => ['required', 'integer', 'exists:feed_types,id'],
            'feed_quantity_kg' => ['required', 'numeric', 'gt:0', 'decimal:0,3'],
            'feeding_date' => ['required', 'date'],
            'feeding_time' => ['required', 'date_format:H:i'],
            'health_condition' => ['nullable', 'string', 'max:5000'],
            'vet_check_required' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'feed_quantity_kg.decimal' => 'Feed quantity must have no more than three decimal places.',
            'feed_quantity_kg.gt' => 'Feed quantity must be greater than zero.',
        ];
    }
}

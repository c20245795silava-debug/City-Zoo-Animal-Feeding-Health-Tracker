<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateFeedingLogRequest extends FormRequest
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
            'animal_id' => ['sometimes', 'required', 'integer', 'exists:animals,id'],
            'zookeeper_id' => ['sometimes', 'required', 'integer', 'exists:zookeepers,id'],
            'feed_type_id' => ['sometimes', 'required', 'integer', 'exists:feed_types,id'],
            'feed_quantity_kg' => ['sometimes', 'required', 'numeric', 'gt:0', 'decimal:0,3'],
            'feeding_date' => ['sometimes', 'required', 'date'],
            'feeding_time' => ['sometimes', 'required', 'date_format:H:i'],
            'health_condition' => ['sometimes', 'nullable', 'string', 'max:5000'],
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

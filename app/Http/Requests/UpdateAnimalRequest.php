<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAnimalRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('animal_tag_id') && is_string($this->input('animal_tag_id'))) {
            $this->merge(['animal_tag_id' => strtoupper(trim($this->input('animal_tag_id')))]);
        }
    }

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
            'animal_tag_id' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('animals', 'animal_tag_id')->ignore($this->route('animal'))],
            'species' => ['sometimes', 'required', 'string', 'max:120'],
            'enclosure_id' => ['sometimes', 'required', 'integer', 'exists:enclosures,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'animal_tag_id.unique' => 'This animal tag is already registered.',
            'enclosure_id.exists' => 'The selected enclosure does not exist.',
        ];
    }
}

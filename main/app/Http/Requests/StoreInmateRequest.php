<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInmateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Adjust authorization logic as needed
    }

    public function rules(): array
    {
        return [
            // Personal Information
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'birthdate' => ['required', 'date', 'before:today'],
            'gender' => ['required', Rule::in(['Male', 'Female'])],
            'civil_status' => ['nullable', Rule::in(['Single', 'Married', 'Separated', 'Widowed', 'Other'])],
            
            // Address Information
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'province' => ['required', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['required', 'string', 'max:255'],
            
            // Legal Information
            'crime' => ['required', 'string', 'max:255'],
            'sentence' => ['required', 'string', 'max:255'],
            'job' => ['nullable', 'string', 'max:255'],
            'date_of_admission' => ['required', 'date'],
            'status' => ['required', Rule::in(['Active', 'Released', 'Transferred', 'Medical'])],
            'cell_id' => ['nullable'],
            'admitted_by_user_id' => ['nullable', 'exists:users,id'],
            
            // Medical Information
            'medical_status' => ['required', Rule::in(['Healthy', 'Under Treatment', 'Critical', 'Not Assessed'])],
            'last_medical_check' => ['nullable', 'date'],
            'medical_notes' => ['nullable', 'string'],
            
            // Points System
            'initial_points' => ['required', 'integer', 'min:0', 'max:500'],
            'current_points' => ['required', 'integer', 'min:0', 'max:500'],
            
            // Additional data (for future use)
            'points_history' => ['nullable', 'array'],
            'allowed_visitors' => ['nullable', 'array'],
            'allowed_visitors.*.name' => ['required', 'string', 'max:255'],
            'allowed_visitors.*.phone' => ['nullable', 'string', 'max:20'],
            'allowed_visitors.*.contact_number' => ['nullable', 'string', 'max:20'], // Support old field name
            'allowed_visitors.*.email' => ['nullable', 'email', 'max:255'],
            'allowed_visitors.*.relationship' => ['nullable', 'string', 'max:100'],
            'allowed_visitors.*.id_type' => ['nullable', 'string', 'max:50'],
            'allowed_visitors.*.id_number' => ['nullable', 'string', 'max:50'],
            'allowed_visitors.*.address' => ['nullable', 'string'],
            'recent_visits' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required.',
            'last_name.required' => 'Last name is required.',
            'birthdate.required' => 'Date of birth is required.',
            'birthdate.before' => 'Date of birth must be before today.',
            'gender.required' => 'Gender is required.',
            'gender.in' => 'Gender must be either Male or Female.',
            'address_line1.required' => 'Address line 1 is required.',
            'city.required' => 'City is required.',
            'province.required' => 'Province is required.',
            'country.required' => 'Country is required.',
            'crime.required' => 'Crime is required.',
            'sentence.required' => 'Sentence is required.',
            'date_of_admission.required' => 'Date of admission is required.',
            'status.required' => 'Status is required.',
            'medical_status.required' => 'Medical status is required.',
            'initial_points.required' => 'Initial points are required.',
            'current_points.required' => 'Current points are required.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Map JavaScript field names to database field names
        $this->merge([
            'first_name' => $this->input('firstName'),
            'middle_name' => $this->input('middleName'),
            'last_name' => $this->input('lastName'),
            'birthdate' => $this->input('dateOfBirth'),
            'gender' => $this->input('gender'),
            'civil_status' => $this->input('civilStatus'),
            'address_line1' => $this->input('addressLine1'),
            'address_line2' => $this->input('addressLine2'),
            'city' => $this->input('city'),
            'province' => $this->input('province'),
            'postal_code' => $this->input('postalCode'),
            'country' => $this->input('country'),
            'crime' => $this->input('crime'),
            'sentence' => $this->input('sentence'),
            'job' => $this->input('job'),
            'date_of_admission' => $this->input('admissionDate'),
            'status' => $this->input('status'),
            'cell_id' => $this->input('cellId'),
            'medical_status' => $this->input('medicalStatus'),
            'last_medical_check' => $this->input('lastMedicalCheck'),
            'medical_notes' => $this->input('medicalNotes'),
            'initial_points' => $this->input('initialPoints'),
            'current_points' => $this->input('currentPoints'),
            'points_history' => $this->input('pointsHistory'),
            'allowed_visitors' => $this->input('allowedVisitors'),
            'recent_visits' => $this->input('recentVisits'),
        ]);
    }
}

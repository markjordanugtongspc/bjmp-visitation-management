/**
 * Inmate API Client Module
 * Handles all API communications for inmate management
 */

class InmateApiClient {
    constructor() {
        this.baseUrl = '/api/inmates';
        this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    }

    /**
     * Get all inmates with optional filtering
     */
    async getAll(filters = {}, page = 1, perPage = 15) {
        try {
            const params = new URLSearchParams({
                page: page,
                per_page: perPage,
                ...filters
            });

            const response = await fetch(`${this.baseUrl}?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching inmates:', error);
            throw error;
        }
    }

    /**
     * Get a single inmate by ID
     */
    async getById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching inmate ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create a new inmate
     */
    async create(inmateData) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken
                },
                body: JSON.stringify(inmateData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating inmate:', error);
            throw error;
        }
    }

    /**
     * Update an existing inmate
     */
    async update(id, inmateData) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken
                },
                body: JSON.stringify(inmateData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error updating inmate ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete an inmate
     */
    async delete(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error deleting inmate ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get inmate statistics
     */
    async getStatistics() {
        try {
            const response = await fetch(`${this.baseUrl}/statistics`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching statistics:', error);
            throw error;
        }
    }

    /**
     * Search inmates
     */
    async search(query) {
        try {
            const params = new URLSearchParams({ query });
            const response = await fetch(`${this.baseUrl}/search?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching inmates:', error);
            throw error;
        }
    }

    /**
     * Update inmate points
     */
    async updatePoints(id, points, activity, note = null) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}/points`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken
                },
                body: JSON.stringify({
                    points,
                    activity,
                    note
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error updating points for inmate ${id}:`, error);
            throw error;
        }
    }

    /**
     * Transform JavaScript form data to API format
     */
    transformFormData(formData) {
        // Ensure medical status has a default value
        const medicalStatus = formData.medicalStatus || 'Not Assessed';
        
        return {
            firstName: formData.firstName,
            middleName: formData.middleName,
            lastName: formData.lastName,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            civilStatus: formData.civilStatus || null,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2 || null,
            city: formData.city,
            province: formData.province,
            postalCode: formData.postalCode || null,
            country: formData.country,
            crime: formData.crime,
            sentence: formData.sentence,
            job: formData.job || null,
            admissionDate: formData.admissionDate,
            status: formData.status,
            medicalStatus: medicalStatus,
            lastMedicalCheck: formData.lastMedicalCheck || null,
            medicalNotes: formData.medicalNotes || null,
            initialPoints: formData.initialPoints || 0,
            currentPoints: formData.currentPoints || 0,
            pointsHistory: formData.pointsHistory || [],
            allowedVisitors: formData.allowedVisitors || [],
            recentVisits: formData.recentVisits || []
        };
    }
}

// Export the class for use in other modules
export default InmateApiClient;

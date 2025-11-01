/**
 * Visitor API Client Module
 * Handles all API communications for visitor management
 */

class VisitorApiClient {
    constructor() {
        this.baseUrl = '/api/visitors';
        this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    }

    async updateStatus(id, status) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error updating visitor ${id} status:`, error);
            throw error;
        }
    }

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
                    'X-CSRF-TOKEN': this.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching visitors:', error);
            throw error;
        }
    }

    async listAllowed(filters = {}, page = 1, perPage = 15) {
        return this.getAll({ ...filters, is_allowed: 1 }, page, perPage);
    }

    async getById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching visitor ${id}:`, error);
            throw error;
        }
    }

    async create(formData) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                let errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
                
                // Include validation errors if present
                if (errorData.errors) {
                    const validationErrors = Object.values(errorData.errors).flat().join(', ');
                    errorMessage += ': ' + validationErrors;
                }
                
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating visitor:', error);
            throw error;
        }
    }

    async update(id, formData) {
        try {
            formData.append('_method', 'PATCH');
            
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error updating visitor ${id}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error deleting visitor ${id}:`, error);
            throw error;
        }
    }

    /**
     * Update visitation log status (for requests page)
     */
    async updateVisitationLogStatus(id, status) {
        try {
            const response = await fetch(`/api/visitation-requests/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error updating visitation log ${id} status:`, error);
            throw error;
        }
    }
}

export default VisitorApiClient;

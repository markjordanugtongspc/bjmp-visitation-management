/**
 * Medical Visitation Scheduler Component for Nurse Dashboard
 * Handles one-time and recurring medical visit scheduling
 */

/**
 * Medical Visitation Scheduler Manager Class
 * Manages scheduling of medical visits for inmates
 */
export class MedicalVisitationSchedulerManager {
    constructor() {
        this.currentInmate = null;
        this.scheduledVisits = [];
        this.schedulerContainer = null;
        
        // Initialize event listeners
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for scheduler functionality
     * Listens for inmate selection and scheduler initialization events
     */
    initializeEventListeners() {
        // Listen for scheduler initialization events
        document.addEventListener('initializeMedicalScheduler', (e) => {
            this.initializeScheduler(e.detail.inmate);
        });

        // Listen for inmate cleared events
        document.addEventListener('inmateCleared', () => {
            this.clearScheduler();
        });
    }

    /**
     * Initialize scheduler UI for selected inmate
     * @param {Object} inmate - Selected inmate object
     */
    async initializeScheduler(inmate) {
        this.currentInmate = inmate;
        this.schedulerContainer = document.getElementById('medical-visitation-scheduler');
        
        if (!this.schedulerContainer) return;

        try {
            // Load existing scheduled visits
            await this.loadScheduledVisits(inmate.id);
            
            // Render scheduler UI
            this.renderScheduler();
            
        } catch (error) {
            console.error('Error initializing medical scheduler:', error);
            this.showError('Failed to load visit schedule. Please try again.');
        }
    }

    /**
     * Load scheduled visits for inmate
     * @param {number} inmateId - Inmate ID
     */
    async loadScheduledVisits(inmateId) {
        try {
            // TODO: Replace with actual API call when backend is ready
            // For now, using mock data to demonstrate functionality
            console.log('Loading mock scheduled visits for inmate:', inmateId);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Mock data for demonstration
            this.scheduledVisits = [
                {
                    id: 1,
                    inmate_id: inmateId,
                    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
                    visit_type: 'one-time',
                    recurring_frequency: null,
                    recurring_until: null,
                    status: 'scheduled',
                    notes: 'Regular check-up appointment',
                    created_by: 'Dr. Smith',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 2,
                    inmate_id: inmateId,
                    scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
                    visit_type: 'recurring',
                    recurring_frequency: 'weekly',
                    recurring_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                    status: 'scheduled',
                    notes: 'Weekly medication review',
                    created_by: 'Nurse Johnson',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 3,
                    inmate_id: inmateId,
                    scheduled_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                    visit_type: 'one-time',
                    recurring_frequency: null,
                    recurring_until: null,
                    status: 'completed',
                    notes: 'Blood pressure check completed',
                    created_by: 'Dr. Brown',
                    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                }
            ];
            
            console.log('Mock scheduled visits loaded:', this.scheduledVisits.length, 'visits');
            
        } catch (error) {
            console.error('Error loading scheduled visits:', error);
            this.scheduledVisits = [];
        }
    }

    /**
     * Render the complete scheduler UI
     */
    renderScheduler() {
        if (!this.schedulerContainer) return;

        this.schedulerContainer.innerHTML = `
            <div class="space-y-6">
                <!-- Schedule New Visit Section -->
                <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Schedule New Visit</h4>
                    
                    <!-- Visit Type Toggle -->
                    <div class="mb-4">
                        <div class="flex items-center gap-4">
                            <label class="flex items-center cursor-pointer">
                                <input type="radio" name="visit-type" value="one-time" checked 
                                       class="mr-2 text-blue-600 focus:ring-blue-500" 
                                       onchange="window.medicalScheduler.toggleScheduleType('one-time')">
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">One-time Visit</span>
                            </label>
                            <label class="flex items-center cursor-pointer">
                                <input type="radio" name="visit-type" value="recurring" 
                                       class="mr-2 text-blue-600 focus:ring-blue-500" 
                                       onchange="window.medicalScheduler.toggleScheduleType('recurring')">
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Recurring Visit</span>
                            </label>
                        </div>
                    </div>

                    <!-- One-time Visit Form -->
                    <div id="one-time-form" class="space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Visit Date
                                </label>
                                <input type="date" id="visit-date" 
                                       class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Visit Time
                                </label>
                                <input type="time" id="visit-time" 
                                       class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea id="visit-notes" rows="3" 
                                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="Add any notes about this visit..."></textarea>
                        </div>
                        <button onclick="window.medicalScheduler.saveOneTimeVisit()" 
                                class="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                            Schedule One-time Visit
                        </button>
                    </div>

                    <!-- Recurring Visit Form -->
                    <div id="recurring-form" class="space-y-4 hidden">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Start Date
                                </label>
                                <input type="date" id="recurring-start-date" 
                                       class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Start Time
                                </label>
                                <input type="time" id="recurring-start-time" 
                                       class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Frequency
                                </label>
                                <select id="recurring-frequency" 
                                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="daily">Daily</option>
                                    <option value="weekly" selected>Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    End Date
                                </label>
                                <input type="date" id="recurring-end-date" 
                                       class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea id="recurring-notes" rows="3" 
                                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="Add any notes about this recurring visit..."></textarea>
                        </div>
                        <button onclick="window.medicalScheduler.saveRecurringVisit()" 
                                class="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                            Schedule Recurring Visit
                        </button>
                    </div>
                </div>

                <!-- Scheduled Visits List -->
                <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Scheduled Visits</h4>
                    ${this.renderScheduledVisitsList()}
                </div>
            </div>
        `;

        // Set default values
        this.setDefaultValues();
    }

    /**
     * Set default values for form inputs
     */
    setDefaultValues() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dateInput = document.getElementById('visit-date');
        const recurringDateInput = document.getElementById('recurring-start-date');
        
        if (dateInput) {
            dateInput.value = tomorrow.toISOString().split('T')[0];
        }
        if (recurringDateInput) {
            recurringDateInput.value = tomorrow.toISOString().split('T')[0];
        }
    }

    /**
     * Toggle between one-time and recurring visit forms
     * @param {string} type - Visit type ('one-time' or 'recurring')
     */
    toggleScheduleType(type) {
        const oneTimeForm = document.getElementById('one-time-form');
        const recurringForm = document.getElementById('recurring-form');
        
        if (type === 'one-time') {
            oneTimeForm.classList.remove('hidden');
            recurringForm.classList.add('hidden');
        } else {
            oneTimeForm.classList.add('hidden');
            recurringForm.classList.remove('hidden');
        }
    }

    /**
     * Save one-time visit
     */
    async saveOneTimeVisit() {
        const date = document.getElementById('visit-date').value;
        const time = document.getElementById('visit-time').value;
        const notes = document.getElementById('visit-notes').value;

        if (!date || !time) {
            this.showError('Please fill in all required fields.');
            return;
        }

        try {
            // TODO: Replace with actual API call when backend is ready
            // For now, using mock functionality
            console.log('Saving one-time visit:', { date, time, notes });
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Create new visit object
            const newVisit = {
                id: Date.now(), // Mock ID
                inmate_id: this.currentInmate.id,
                scheduled_at: `${date}T${time}:00`,
                visit_type: 'one-time',
                recurring_frequency: null,
                recurring_until: null,
                status: 'scheduled',
                notes: notes.trim(),
                created_by: 'Current User', // Mock creator
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Add to scheduled visits
            this.scheduledVisits.unshift(newVisit);
            
            this.showSuccess('One-time visit scheduled successfully! (Mock)');
            
            // Update display
            this.updateScheduledVisitsDisplay();
            
            // Clear form
            this.clearOneTimeForm();
            
        } catch (error) {
            console.error('Error saving one-time visit:', error);
            this.showError('Failed to schedule visit. Please try again.');
        }
    }

    /**
     * Save recurring visit
     */
    async saveRecurringVisit() {
        const startDate = document.getElementById('recurring-start-date').value;
        const startTime = document.getElementById('recurring-start-time').value;
        const frequency = document.getElementById('recurring-frequency').value;
        const endDate = document.getElementById('recurring-end-date').value;
        const notes = document.getElementById('recurring-notes').value;

        if (!startDate || !startTime || !endDate) {
            this.showError('Please fill in all required fields.');
            return;
        }

        try {
            // TODO: Replace with actual API call when backend is ready
            // For now, using mock functionality
            console.log('Saving recurring visit:', { startDate, startTime, frequency, endDate, notes });
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Create new recurring visit object
            const newVisit = {
                id: Date.now(), // Mock ID
                inmate_id: this.currentInmate.id,
                scheduled_at: `${startDate}T${startTime}:00`,
                visit_type: 'recurring',
                recurring_frequency: frequency,
                recurring_until: endDate,
                status: 'scheduled',
                notes: notes.trim(),
                created_by: 'Current User', // Mock creator
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Add to scheduled visits
            this.scheduledVisits.unshift(newVisit);
            
            this.showSuccess('Recurring visit scheduled successfully! (Mock)');
            
            // Update display
            this.updateScheduledVisitsDisplay();
            
            // Clear form
            this.clearRecurringForm();
            
        } catch (error) {
            console.error('Error saving recurring visit:', error);
            this.showError('Failed to schedule recurring visit. Please try again.');
        }
    }

    /**
     * Render scheduled visits list
     * @returns {string} HTML string for visits list
     */
    renderScheduledVisitsList() {
        if (this.scheduledVisits.length === 0) {
            return `
                <div class="text-center py-8">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                    </div>
                    <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Scheduled Visits</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">No medical visits are currently scheduled for this inmate.</p>
                </div>
            `;
        }

        // Desktop table view
        const desktopTable = `
            <div class="hidden md:block overflow-x-auto">
                <div class="max-h-96 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table class="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                        <thead class="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                            <tr>
                                <th scope="col" class="px-4 py-3 whitespace-nowrap">Scheduled Date</th>
                                <th scope="col" class="px-4 py-3">Type</th>
                                <th scope="col" class="px-4 py-3">Frequency</th>
                                <th scope="col" class="px-4 py-3">Status</th>
                                <th scope="col" class="px-4 py-3">Notes</th>
                                <th scope="col" class="px-4 py-3">Created By</th>
                                <th scope="col" class="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.scheduledVisits.map(visit => this.renderVisitRow(visit)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Mobile cards view
        const mobileCards = `
            <div class="md:hidden space-y-4">
                ${this.scheduledVisits.map(visit => this.renderVisitCard(visit)).join('')}
            </div>
        `;

        return desktopTable + mobileCards;
    }

    /**
     * Render a single visit table row
     * @param {Object} visit - Visit object
     * @returns {string} HTML string for table row
     */
    renderVisitRow(visit) {
        const scheduledDate = new Date(visit.scheduled_at);
        const frequency = visit.visit_type === 'recurring' ? visit.recurring_frequency : '—';
        const statusClass = this.getStatusClass(visit.status);

        return `
            <tr class="border-b border-gray-200 dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td class="align-top px-4 py-3 whitespace-nowrap">${this.formatDateTime(scheduledDate)}</td>
                <td class="align-top px-4 py-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${visit.visit_type === 'one-time' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'}">
                        ${visit.visit_type === 'one-time' ? 'One-time' : 'Recurring'}
                    </span>
                </td>
                <td class="align-top px-4 py-3 text-gray-600 dark:text-gray-400">${frequency}</td>
                <td class="align-top px-4 py-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
                        ${visit.status}
                    </span>
                </td>
                <td class="align-top px-4 py-3 text-gray-600 dark:text-gray-400">${visit.notes || '—'}</td>
                <td class="align-top px-4 py-3 text-gray-500 dark:text-gray-500">${visit.created_by || '—'}</td>
                <td class="align-top px-4 py-3">
                    <div class="flex items-center gap-2">
                        <button onclick="window.medicalScheduler.editVisit(${visit.id})" 
                                class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        <button onclick="window.medicalScheduler.deleteVisit(${visit.id})" 
                                class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 cursor-pointer">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Render a single visit card for mobile
     * @param {Object} visit - Visit object
     * @returns {string} HTML string for card
     */
    renderVisitCard(visit) {
        const scheduledDate = new Date(visit.scheduled_at);
        const frequency = visit.visit_type === 'recurring' ? visit.recurring_frequency : null;
        const statusClass = this.getStatusClass(visit.status);

        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h4 class="font-semibold text-gray-900 dark:text-gray-100">${this.formatDateTime(scheduledDate)}</h4>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${visit.visit_type === 'one-time' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'}">
                                ${visit.visit_type === 'one-time' ? 'One-time' : 'Recurring'}
                            </span>
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
                                ${visit.status}
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="window.medicalScheduler.editVisit(${visit.id})" 
                                class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        <button onclick="window.medicalScheduler.deleteVisit(${visit.id})" 
                                class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 cursor-pointer">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="space-y-2 text-sm">
                    ${frequency ? `
                        <div>
                            <span class="font-medium text-gray-700 dark:text-gray-300">Frequency:</span>
                            <span class="text-gray-600 dark:text-gray-400 ml-2">${frequency}</span>
                        </div>
                    ` : ''}
                    
                    <div>
                        <span class="font-medium text-gray-700 dark:text-gray-300">Created by:</span>
                        <span class="text-gray-600 dark:text-gray-400 ml-2">${visit.created_by || 'Unknown'}</span>
                    </div>
                    
                    ${visit.notes ? `
                        <div>
                            <span class="font-medium text-gray-700 dark:text-gray-300">Notes:</span>
                            <span class="text-gray-600 dark:text-gray-400 ml-2">${visit.notes}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Edit a scheduled visit
     * @param {number} visitId - Visit ID
     */
    editVisit(visitId) {
        const visit = this.scheduledVisits.find(v => v.id === visitId);
        if (!visit) return;

        // TODO: Implement edit functionality
        console.log('Editing visit:', visit);
        this.showError('Edit functionality will be implemented soon.');
    }

    /**
     * Delete a scheduled visit
     * @param {number} visitId - Visit ID
     */
    async deleteVisit(visitId) {
        if (!confirm('Are you sure you want to delete this scheduled visit?')) {
            return;
        }

        try {
            // TODO: Replace with actual API call when backend is ready
            // For now, using mock functionality
            console.log('Deleting visit:', visitId);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Remove from scheduled visits array
            this.scheduledVisits = this.scheduledVisits.filter(visit => visit.id !== visitId);
            
            this.showSuccess('Visit deleted successfully! (Mock)');
            
            // Update display
            this.updateScheduledVisitsDisplay();
            
        } catch (error) {
            console.error('Error deleting visit:', error);
            this.showError('Failed to delete visit. Please try again.');
        }
    }

    /**
     * Clear one-time visit form
     */
    clearOneTimeForm() {
        const dateInput = document.getElementById('visit-date');
        const timeInput = document.getElementById('visit-time');
        const notesInput = document.getElementById('visit-notes');
        
        if (dateInput) dateInput.value = '';
        if (timeInput) timeInput.value = '';
        if (notesInput) notesInput.value = '';
    }

    /**
     * Clear recurring visit form
     */
    clearRecurringForm() {
        const startDateInput = document.getElementById('recurring-start-date');
        const startTimeInput = document.getElementById('recurring-start-time');
        const frequencySelect = document.getElementById('recurring-frequency');
        const endDateInput = document.getElementById('recurring-end-date');
        const notesInput = document.getElementById('recurring-notes');
        
        if (startDateInput) startDateInput.value = '';
        if (startTimeInput) startTimeInput.value = '';
        if (frequencySelect) frequencySelect.value = 'weekly';
        if (endDateInput) endDateInput.value = '';
        if (notesInput) notesInput.value = '';
    }

    /**
     * Update the scheduled visits display in the DOM
     */
    updateScheduledVisitsDisplay() {
        const visitsContainer = this.schedulerContainer?.querySelector('.bg-white.dark\\:bg-gray-800.rounded-lg.border.border-gray-200.dark\\:border-gray-700.p-4.sm\\:p-6');
        if (!visitsContainer) return;

        const visitsListContainer = visitsContainer.querySelector('.space-y-4, .overflow-x-auto');
        if (visitsListContainer) {
            visitsListContainer.innerHTML = this.renderScheduledVisitsList();
        }
    }

    /**
     * Clear scheduler and reset state
     */
    clearScheduler() {
        this.currentInmate = null;
        this.scheduledVisits = [];
        this.schedulerContainer = null;
    }

    // Utility methods

    /**
     * Format date and time for display
     * @param {Date} date - Date object
     * @returns {string} Formatted date and time
     */
    formatDateTime(date) {
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    /**
     * Get status badge classes
     * @param {string} status - Visit status
     * @returns {string} CSS classes for status badge
     */
    getStatusClass(status) {
        const statusClasses = {
            'scheduled': 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
            'completed': 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
            'missed': 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
            'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
        };
        
        return statusClasses[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        // Create a temporary success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg max-w-sm';
        successDiv.innerHTML = `
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm font-medium">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="ml-2 text-green-500 hover:text-green-700 cursor-pointer">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        // Create a temporary error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-sm';
        errorDiv.innerHTML = `
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm font-medium">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="ml-2 text-red-500 hover:text-red-700 cursor-pointer">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

/**
 * Initialize medical visitation scheduler component
 * Creates global instance and sets up event handling
 */
export function initializeMedicalVisitationScheduler() {
    // Create global instance for easy access
    window.medicalScheduler = new MedicalVisitationSchedulerManager();
    
    console.log('Medical Visitation Scheduler initialized');
    return window.medicalScheduler;
}

/**
 * Export for use in other components
 */
export default MedicalVisitationSchedulerManager;

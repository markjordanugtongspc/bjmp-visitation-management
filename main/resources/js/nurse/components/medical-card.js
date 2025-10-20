/**
 * Medical Card Component for Nurse Dashboard
 * Displays inmate medical information in a card format (not modal)
 * Adapted from inmates.js modal content
 */

import { createMedicalRecordsManager } from '../../inmates/components/medical-records-system.js';
import InmateApiClient from '../../inmates/components/inmateApi.js';

/**
 * Medical Card Manager Class
 * Manages the display of inmate medical information in card format
 */
export class MedicalCardManager {
    constructor() {
        this.apiClient = new InmateApiClient();
        this.medicalRecordsManager = createMedicalRecordsManager();
        this.currentInmate = null;
        
        // DOM elements
        this.medicalCardContainer = document.getElementById('medical-info-card');
        
        // Initialize event listeners
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for medical card functionality
     * Listens for inmate selection events
     */
    initializeEventListeners() {
        // Listen for inmate selection events
        document.addEventListener('inmateSelected', (e) => {
            this.loadInmateMedicalInfo(e.detail.inmate);
        });

        // Listen for inmate cleared events
        document.addEventListener('inmateCleared', () => {
            this.hideMedicalCard();
        });
    }

    /**
     * Load and display medical information for selected inmate
     * @param {Object} inmate - Selected inmate object
     */
    async loadInmateMedicalInfo(inmate) {
        try {
            this.currentInmate = inmate;
            
            // Fetch complete inmate data including medical records
            const response = await this.apiClient.getById(inmate.id);
            const fullInmateData = response.data;
            
            // Render medical card
            this.renderMedicalCard(fullInmateData);
            
        } catch (error) {
            console.error('Error loading inmate medical info:', error);
            this.showError('Failed to load medical information. Please try again.');
        }
    }

    /**
     * Render the complete medical information card
     * @param {Object} inmate - Complete inmate data with medical records
     */
    renderMedicalCard(inmate) {
        if (!this.medicalCardContainer) return;

        const fullName = [inmate.firstName, inmate.middleName, inmate.lastName].filter(Boolean).join(' ');
        
        this.medicalCardContainer.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <!-- Card Header -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden ring-2 ring-blue-200 bg-blue-100 flex items-center justify-center">
                                ${inmate.avatarUrl ? 
                                    `<img src="${inmate.avatarUrl}" alt="${fullName}" class="w-full h-full object-cover">` :
                                    `<svg class="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                    </svg>`
                                }
                            </div>
                            <div>
                                <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">${fullName}</h2>
                                <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    ID: ${inmate.id.toString().padStart(4, '0')} • ${inmate.gender} • Age: ${inmate.age || 'N/A'}
                                </div>
                                <div class="text-sm text-gray-600 dark:text-gray-400">
                                    Cell: ${inmate.cell?.name || 'Not Assigned'} • Status: ${inmate.status || 'Active'}
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${this.getStatusBadgeClasses(inmate.status)}">
                                ${inmate.status || 'Active'}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Card Content -->
                <div class="p-4 sm:p-6 space-y-6">
                    <!-- Basic Information Section -->
                    <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
                        </div>
                        <div class="p-4">
                            <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                                <div>
                                    <dt class="text-gray-500 dark:text-gray-400 font-medium">Date of Birth</dt>
                                    <dd class="text-gray-900 dark:text-gray-200 mt-1">${this.formatDate(inmate.dateOfBirth)}</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-500 dark:text-gray-400 font-medium">Age</dt>
                                    <dd class="text-gray-900 dark:text-gray-200 mt-1">${inmate.age || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-500 dark:text-gray-400 font-medium">Gender</dt>
                                    <dd class="text-gray-900 dark:text-gray-200 mt-1">${inmate.gender}</dd>
                                </div>
                                <div class="sm:col-span-2 lg:col-span-3">
                                    <dt class="text-gray-500 dark:text-gray-400 font-medium">Address</dt>
                                    <dd class="text-gray-900 dark:text-gray-200 mt-1">${this.formatAddress(inmate) || 'Not provided'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <!-- Legal & Assignment Section -->
                    <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Legal & Assignment</h3>
                        </div>
                        <div class="p-4">
                            <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                                <div>
                                    <dt class="text-gray-500 dark:text-gray-400 font-medium">Admission Date</dt>
                                    <dd class="text-gray-900 dark:text-gray-200 mt-1">${this.formatDate(inmate.admissionDate)}</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-500 dark:text-gray-400 font-medium">Work / Job</dt>
                                    <dd class="text-gray-900 dark:text-gray-200 mt-1">${inmate.job || 'Not assigned'}</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-500 dark:text-gray-400 font-medium">Days in Custody</dt>
                                    <dd class="text-gray-900 dark:text-gray-200 mt-1">${this.calculateDaysInCustody(inmate.admissionDate)} days</dd>
                                </div>
                                <div class="sm:col-span-2 lg:col-span-3">
                                    <dt class="text-gray-500 dark:text-gray-400 font-medium">Crime Committed</dt>
                                    <dd class="text-gray-900 dark:text-gray-200 mt-1">${inmate.crime || 'Not specified'}</dd>
                                </div>
                                <div class="sm:col-span-2 lg:col-span-3">
                                    <dt class="text-gray-500 dark:text-gray-400 font-medium">Sentence</dt>
                                    <dd class="text-gray-900 dark:text-gray-200 mt-1">${this.formatSentenceWithReduction(inmate, true)}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <!-- Medical Records Section -->
                    <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Medical Records History</h3>
                            <button id="add-medical-record-btn" 
                                    class="inline-flex items-center px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                </svg>
                                Add Medical Record
                            </button>
                        </div>
                        <div class="p-4">
                            ${this.renderMedicalRecordsSection(inmate)}
                        </div>
                    </div>

                    <!-- Medical Visitation Schedule Section -->
                    <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Medical Visitation Schedule</h3>
                        </div>
                        <div class="p-4">
                            <div id="medical-visitation-scheduler">
                                <!-- Medical visitation scheduler will be rendered here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Show the medical card
        this.medicalCardContainer.classList.remove('hidden');
        
        // Initialize medical records functionality
        this.initializeMedicalRecordsHandlers(inmate);
        
        // Initialize medical visitation scheduler
        this.initializeMedicalVisitationScheduler(inmate);
    }

    /**
     * Render medical records section with responsive table/cards
     * @param {Object} inmate - Inmate data with medical records
     * @returns {string} HTML string for medical records section
     */
    renderMedicalRecordsSection(inmate) {
        const records = inmate.medicalRecords || [];
        
        if (records.length === 0) {
            return `
                <div class="text-center py-8">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                    </div>
                    <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Medical Records</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">This inmate has no medical records yet.</p>
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
                                <th scope="col" class="px-4 py-3 whitespace-nowrap">Date</th>
                                <th scope="col" class="px-4 py-3">Diagnosis</th>
                                <th scope="col" class="px-4 py-3">Treatment</th>
                                <th scope="col" class="px-4 py-3">Vitals</th>
                                <th scope="col" class="px-4 py-3">Allergies</th>
                                <th scope="col" class="px-4 py-3">Medications</th>
                                <th scope="col" class="px-4 py-3">Notes</th>
                                <th scope="col" class="px-4 py-3 whitespace-nowrap">Recorded By</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${records.map(record => this.renderMedicalRecordRow(record)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Mobile cards view
        const mobileCards = `
            <div class="md:hidden space-y-4">
                ${records.map(record => this.renderMedicalRecordCard(record)).join('')}
            </div>
        `;

        return desktopTable + mobileCards;
    }

    /**
     * Render a single medical record table row
     * @param {Object} record - Medical record object
     * @returns {string} HTML string for table row
     */
    renderMedicalRecordRow(record) {
        const vitalsText = this.formatVitals(record.vitals);
        const allergiesText = Array.isArray(record.allergies) && record.allergies.length ? 
            record.allergies.join(', ') : '—';
        const medicationsText = Array.isArray(record.medications) && record.medications.length ? 
            record.medications.join(', ') : '—';

        return `
            <tr class="border-b border-gray-200 dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td class="align-top px-4 py-3 whitespace-nowrap">${this.formatDate(record.date)}</td>
                <td class="align-top px-4 py-3 font-semibold text-teal-600 dark:text-teal-400">${record.diagnosis || '—'}</td>
                <td class="align-top px-4 py-3">${record.treatment || '—'}</td>
                <td class="align-top px-4 py-3 text-gray-600 dark:text-gray-400">${vitalsText}</td>
                <td class="align-top px-4 py-3 text-gray-600 dark:text-gray-400">${allergiesText}</td>
                <td class="align-top px-4 py-3 text-gray-600 dark:text-gray-400">${medicationsText}</td>
                <td class="align-top px-4 py-3 text-gray-600 dark:text-gray-400">${record.notes ? `<span class="italic">"${record.notes}"</span>` : '—'}</td>
                <td class="align-top px-4 py-3 text-gray-500 dark:text-gray-500">${record.recordedBy || '—'}</td>
            </tr>
        `;
    }

    /**
     * Render a single medical record card for mobile
     * @param {Object} record - Medical record object
     * @returns {string} HTML string for card
     */
    renderMedicalRecordCard(record) {
        const vitalsText = this.formatVitals(record.vitals);
        const allergiesText = Array.isArray(record.allergies) && record.allergies.length ? 
            record.allergies.join(', ') : 'None';
        const medicationsText = Array.isArray(record.medications) && record.medications.length ? 
            record.medications.join(', ') : 'None';

        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h4 class="font-semibold text-gray-900 dark:text-gray-100">${record.diagnosis || 'No diagnosis'}</h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${this.formatDate(record.date)}</p>
                    </div>
                    <span class="text-xs text-gray-500 dark:text-gray-400">${record.recordedBy || 'Unknown'}</span>
                </div>
                
                <div class="space-y-2 text-sm">
                    ${record.treatment ? `
                        <div>
                            <span class="font-medium text-gray-700 dark:text-gray-300">Treatment:</span>
                            <span class="text-gray-600 dark:text-gray-400 ml-2">${record.treatment}</span>
                        </div>
                    ` : ''}
                    
                    ${vitalsText !== '—' ? `
                        <div>
                            <span class="font-medium text-gray-700 dark:text-gray-300">Vitals:</span>
                            <span class="text-gray-600 dark:text-gray-400 ml-2">${vitalsText}</span>
                        </div>
                    ` : ''}
                    
                    <div>
                        <span class="font-medium text-gray-700 dark:text-gray-300">Allergies:</span>
                        <span class="text-gray-600 dark:text-gray-400 ml-2">${allergiesText}</span>
                    </div>
                    
                    <div>
                        <span class="font-medium text-gray-700 dark:text-gray-300">Medications:</span>
                        <span class="text-gray-600 dark:text-gray-400 ml-2">${medicationsText}</span>
                    </div>
                    
                    ${record.notes ? `
                        <div>
                            <span class="font-medium text-gray-700 dark:text-gray-300">Notes:</span>
                            <span class="text-gray-600 dark:text-gray-400 ml-2 italic">"${record.notes}"</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Initialize medical records handlers
     * @param {Object} inmate - Current inmate data
     */
    initializeMedicalRecordsHandlers(inmate) {
        const addRecordBtn = document.getElementById('add-medical-record-btn');
        if (addRecordBtn) {
            addRecordBtn.addEventListener('click', () => {
                this.openAddMedicalRecordModal(inmate);
            });
        }
    }

    /**
     * Open add medical record modal
     * @param {Object} inmate - Current inmate data
     */
    openAddMedicalRecordModal(inmate) {
        // Use the existing medical records manager to open the modal
        this.medicalRecordsManager.openAddMedicalRecordModal(inmate.id, inmate.medicalStatus || '', (newRecord) => {
            // Refresh the medical card when a new record is added
            this.loadInmateMedicalInfo(this.currentInmate);
        });
    }

    /**
     * Initialize medical visitation scheduler
     * @param {Object} inmate - Current inmate data
     */
    initializeMedicalVisitationScheduler(inmate) {
        const schedulerContainer = document.getElementById('medical-visitation-scheduler');
        if (schedulerContainer) {
            // Dispatch event for medical visitation scheduler to initialize
            const event = new CustomEvent('initializeMedicalScheduler', {
                detail: { inmate }
            });
            document.dispatchEvent(event);
        }
    }

    /**
     * Hide the medical card
     */
    hideMedicalCard() {
        if (this.medicalCardContainer) {
            this.medicalCardContainer.classList.add('hidden');
        }
        this.currentInmate = null;
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        if (this.medicalCardContainer) {
            this.medicalCardContainer.innerHTML = `
                <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div class="flex items-center gap-3">
                        <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-red-800 dark:text-red-200">${message}</span>
                    </div>
                </div>
            `;
            this.medicalCardContainer.classList.remove('hidden');
        }
    }

    // Utility methods adapted from inmates.js

    /**
     * Format vitals for display
     * @param {Object} vitals - Vitals object
     * @returns {string} Formatted vitals string
     */
    formatVitals(vitals) {
        if (!vitals) return '—';
        const parts = [];
        if (vitals.blood_pressure) parts.push(`BP: ${vitals.blood_pressure}`);
        if (vitals.heart_rate) parts.push(`HR: ${vitals.heart_rate} bpm`);
        if (vitals.temperature) parts.push(`Temp: ${vitals.temperature}°C`);
        if (vitals.weight) parts.push(`Weight: ${vitals.weight}kg`);
        return parts.length ? parts.join(' / ') : '—';
    }

    /**
     * Format address for display
     * @param {Object} inmate - Inmate object
     * @returns {string} Formatted address
     */
    formatAddress(inmate) {
        if (!inmate.address) return null;
        return inmate.address;
    }

    /**
     * Format date for display
     * @param {string} dateString - Date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'N/A';
        }
    }

    /**
     * Calculate days in custody
     * @param {string} admissionDate - Admission date string
     * @returns {number} Days in custody
     */
    calculateDaysInCustody(admissionDate) {
        if (!admissionDate) return 0;
        try {
            const admission = new Date(admissionDate);
            const now = new Date();
            const diffTime = Math.abs(now - admission);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch {
            return 0;
        }
    }

    /**
     * Format sentence with reduction
     * @param {Object} inmate - Inmate object
     * @param {boolean} showEmoji - Whether to show emoji
     * @returns {string} Formatted sentence
     */
    formatSentenceWithReduction(inmate, showEmoji = false) {
        if (!inmate.sentence) return 'Not specified';
        
        const emoji = showEmoji ? '📅 ' : '';
        const reduction = inmate.sentenceReduction || 0;
        
        if (reduction > 0) {
            return `${emoji}${inmate.sentence} (${reduction} days reduced)`;
        }
        
        return `${emoji}${inmate.sentence}`;
    }

    /**
     * Get status badge classes
     * @param {string} status - Inmate status
     * @returns {string} CSS classes for status badge
     */
    getStatusBadgeClasses(status) {
        const statusClasses = {
            'Active': 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
            'Released': 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
            'Transferred': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
            'Medical': 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        };
        
        return statusClasses[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
}

/**
 * Initialize medical card component
 * Creates global instance and sets up event handling
 */
export function initializeMedicalCard() {
    // Create global instance for easy access
    window.medicalCard = new MedicalCardManager();
    
    console.log('Medical Card initialized');
    return window.medicalCard;
}

/**
 * Export for use in other components
 */
export default MedicalCardManager;

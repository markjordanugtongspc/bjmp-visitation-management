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
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div class="flex items-center gap-3 sm:gap-4">
                            <div class="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden ring-2 ring-blue-200 bg-blue-100 flex items-center justify-center flex-shrink-0">
                                ${inmate.avatarUrl ? 
                                    `<img src="${inmate.avatarUrl}" alt="${fullName}" class="w-full h-full object-cover">` :
                                    `<svg class="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                    </svg>`
                                }
                            </div>
                            <div class="min-w-0 flex-1">
                                <h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">${fullName}</h2>
                                <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    <span class="inline-block">ID: ${inmate.id.toString().padStart(4, '0')}</span>
                                    <span class="mx-1">•</span>
                                    <span class="inline-block">${inmate.gender}</span>
                                    <span class="mx-1">•</span>
                                    <span class="inline-block">Age: ${inmate.age || 'N/A'}</span>
                                </div>
                                <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                    <span class="inline-block">Cell: ${inmate.cell?.name || 'Not Assigned'}</span>
                                    <span class="mx-1">•</span>
                                    <span class="inline-block">Status: ${inmate.status || 'Active'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 flex-shrink-0">
                            <span class="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${this.getStatusBadgeClasses(inmate.status)}">
                                ${inmate.status || 'Active'}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Card Content -->
                <div class="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
                    <!-- Basic Information Section -->
                    <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <div class="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
                        </div>
                        <div class="p-3 sm:p-4">
                            <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-xs sm:text-sm">
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
                        <div class="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Legal & Assignment</h3>
                        </div>
                        <div class="p-3 sm:p-4">
                            <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-xs sm:text-sm">
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
                        <div class="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                            <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Medical Records History</h3>
                            <button id="add-medical-record-btn" 
                                    class="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-medium rounded-lg cursor-pointer transition-colors self-start sm:self-auto">
                                <svg class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                </svg>
                                <span class="hidden sm:inline">Add Medical Record</span>
                                <span class="sm:hidden">Add Record</span>
                            </button>
                        </div>
                        <div class="p-3 sm:p-4">
                            ${this.renderMedicalRecordsSection(inmate)}
                        </div>
                    </div>

                    <!-- Medical File Upload Section -->
                    <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <div class="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                            <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Medical Documents & Files</h3>
                            <button id="upload-medical-file-btn" 
                                    class="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium rounded-lg cursor-pointer transition-colors self-start sm:self-auto">
                                <svg class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                </svg>
                                <span class="hidden sm:inline">Upload Medical File</span>
                                <span class="sm:hidden">Upload File</span>
                            </button>
                        </div>
                        <div class="p-3 sm:p-4">
                            ${this.renderMedicalFilesSection(inmate)}
                        </div>
                    </div>

                    <!-- Medical Visitation Schedule Section -->
                    <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <div class="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Medical Visitation Schedule</h3>
                        </div>
                        <div class="p-3 sm:p-4">
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
        
        // Initialize medical file upload functionality
        this.initializeMedicalFileUploadHandlers(inmate);
        
        // Initialize medical files carousel if needed
        this.initializeMedicalFilesCarousel(inmate);
        
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
     * Render medical files section with responsive table design
     * @param {Object} inmate - Inmate data with medical files
     * @returns {string} HTML string for medical files section
     */
    renderMedicalFilesSection(inmate) {
        const files = inmate.medicalFiles || [];
        
        if (files.length === 0) {
            return `
                <div class="text-center py-8">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                    </div>
                    <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Medical Files</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">No medical documents have been uploaded yet.</p>
                </div>
            `;
        }

        // Use table view for all files
        return this.renderMedicalDocumentsTable(inmate);
    }

    /**
     * Render medical files carousel with pagination
     * @param {Array} files - Array of medical files
     * @returns {string} HTML string for carousel
     */
    renderMedicalFilesCarousel(files) {
        const desktopLimit = 3;
        const mobileLimit = 2;
        const desktopPages = Math.ceil(files.length / desktopLimit);
        const mobilePages = Math.ceil(files.length / mobileLimit);
        const currentDesktopFiles = files.slice(0, desktopLimit);
        const currentMobileFiles = files.slice(0, mobileLimit);

        return `
            <div class="relative">
                <!-- Desktop carousel -->
                <div class="hidden md:block">
                    <div id="medical-files-slide-desktop" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${currentDesktopFiles.map(file => this.renderMedicalFileCard(file)).join('')}
                    </div>
                    
                    <!-- Desktop Controls -->
                    <div class="mt-4 flex items-center justify-between">
                        <button id="medical-files-prev-desktop" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:bg-white dark:disabled:hover:bg-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M15 18l-6-6 6-6"/>
                            </svg>
                        </button>
                        <div id="medical-files-indicators-desktop" class="flex items-center gap-2">
                            ${Array.from({length: desktopPages}, (_, i) => `
                                <button data-page="${i + 1}" class="h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-blue-600' : 'bg-gray-300'} hover:bg-blue-500 transition-colors cursor-pointer" aria-label="Go to page ${i + 1}"></button>
                            `).join('')}
                        </div>
                        <button id="medical-files-next-desktop" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:bg-white dark:disabled:hover:bg-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Mobile carousel -->
                <div class="md:hidden">
                    <div id="medical-files-slide-mobile" class="flex justify-center">
                        <div class="w-full max-w-sm h-64 flex items-center justify-center">
                            ${currentMobileFiles.slice(0, 1).map(file => this.renderMedicalFileMobileCard(file)).join('')}
                        </div>
                    </div>
                    
                    <!-- Mobile Controls -->
                    <div class="mt-4 flex items-center justify-between">
                        <button id="medical-files-prev-mobile" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:bg-white dark:disabled:hover:bg-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M15 18l-6-6 6-6"/>
                            </svg>
                        </button>
                        <div id="medical-files-indicators-mobile" class="flex items-center gap-2">
                            ${Array.from({length: mobilePages}, (_, i) => `
                                <button data-page="${i + 1}" class="h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-blue-600' : 'bg-gray-300'} hover:bg-blue-500 transition-colors cursor-pointer" aria-label="Go to page ${i + 1}"></button>
                            `).join('')}
                        </div>
                        <button id="medical-files-next-mobile" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:bg-white dark:disabled:hover:bg-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render medical documents table with responsive design
     * @param {Object} inmate - Inmate data with medical files
     * @returns {string} HTML string for medical documents table
     */
    renderMedicalDocumentsTable(inmate) {
        const files = inmate.medicalFiles || [];
        
        if (files.length === 0) {
            return `
                <div class="text-center py-8">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                    </div>
                    <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Medical Documents</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">No medical documents have been uploaded yet.</p>
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
                                <th scope="col" class="px-4 py-3">File Name</th>
                                <th scope="col" class="px-4 py-3">Notes</th>
                                <th scope="col" class="px-4 py-3">Uploaded By</th>
                                <th scope="col" class="px-4 py-3 whitespace-nowrap">Upload Date</th>
                                <th scope="col" class="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${files.map(file => this.renderMedicalDocumentRow(file)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Mobile cards view
        const mobileCards = `
            <div class="md:hidden space-y-4">
                ${files.map(file => this.renderMedicalDocumentCard(file)).join('')}
            </div>
        `;

        return desktopTable + mobileCards;
    }

    /**
     * Truncate file name if it's too long
     * @param {string} fileName - File name to truncate
     * @param {number} maxLength - Maximum length before truncation
     * @returns {string} Truncated file name
     */
    truncateFileName(fileName, maxLength = 30) {
        if (!fileName || fileName.length <= maxLength) {
            return fileName;
        }
        
        // Get file extension
        const lastDotIndex = fileName.lastIndexOf('.');
        const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
        const nameWithoutExt = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
        
        // Calculate how much of the name we can show
        const availableLength = maxLength - extension.length - 3; // 3 for "..."
        
        if (availableLength <= 0) {
            return fileName.substring(0, maxLength - 3) + '...';
        }
        
        return nameWithoutExt.substring(0, availableLength) + '...' + extension;
    }

    /**
     * Render a single medical document table row for desktop
     * @param {Object} file - Medical file object
     * @returns {string} HTML string for table row
     */
    renderMedicalDocumentRow(file) {
        const fileSize = this.formatFileSize(file.file_size);
        const notes = file.notes || 'N/A';
        const uploadedBy = file.uploaded_by || 'Unknown';
        const uploadDate = this.formatDate(file.created_at);
        const displayName = this.truncateFileName(file.file_name, 35);
        
        return `
            <tr class="border-b border-gray-200 dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <div class="min-w-0">
                            <p class="font-medium text-gray-900 dark:text-gray-100" title="${file.file_name}">${displayName}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">${fileSize}</p>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <p class="text-gray-600 dark:text-gray-400 line-clamp-2">${notes}</p>
                </td>
                <td class="px-4 py-3">
                    <p class="text-gray-600 dark:text-gray-400">${uploadedBy}</p>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                    <p class="text-gray-600 dark:text-gray-400">${uploadDate}</p>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="window.medicalCard.downloadMedicalFile('${file.id}', '${file.file_name}')" 
                                class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                                title="Download">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                        </button>
                        <button onclick="window.medicalCard.deleteMedicalFile('${file.id}')" 
                                class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                                title="Delete">
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
     * Render a single medical document card for mobile
     * @param {Object} file - Medical file object
     * @returns {string} HTML string for card
     */
    renderMedicalDocumentCard(file) {
        const fileSize = this.formatFileSize(file.file_size);
        const notes = file.notes || 'N/A';
        const uploadedBy = file.uploaded_by || 'Unknown';
        const uploadDate = this.formatDate(file.created_at);
        const displayName = this.truncateFileName(file.file_name, 40);
        
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div class="flex items-start gap-3 mb-3">
                    <div class="flex-shrink-0">
                        <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-semibold text-gray-900 dark:text-gray-100 break-words" title="${file.file_name}">${displayName}</h4>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${fileSize}</p>
                    </div>
                </div>
                
                <div class="space-y-2 text-sm mb-4">
                    <div>
                        <span class="font-medium text-gray-700 dark:text-gray-300">Notes:</span>
                        <span class="text-gray-600 dark:text-gray-400 ml-2">${notes}</span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-700 dark:text-gray-300">Uploaded By:</span>
                        <span class="text-gray-600 dark:text-gray-400 ml-2">${uploadedBy}</span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-700 dark:text-gray-300">Upload Date:</span>
                        <span class="text-gray-600 dark:text-gray-400 ml-2">${uploadDate}</span>
                    </div>
                </div>
                
                <div class="flex gap-2">
                    <button onclick="window.medicalCard.downloadMedicalFile('${file.id}', '${file.file_name}')" 
                            class="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Download
                    </button>
                    <button onclick="window.medicalCard.deleteMedicalFile('${file.id}')" 
                            class="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render medical files in a simple grid (for 3 or fewer files)
     * @param {Array} files - Array of medical files
     * @returns {string} HTML string for grid
     */
    renderMedicalFilesGrid(files) {
        return `
            <!-- Desktop grid view -->
            <div class="hidden md:block">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${files.map(file => this.renderMedicalFileCard(file)).join('')}
                </div>
            </div>

            <!-- Mobile carousel view (1 card per view) -->
            <div class="md:hidden">
                <div id="medical-files-slide-mobile" class="flex justify-center">
                    <div class="w-full max-w-sm h-64 flex items-center justify-center">
                        ${files.slice(0, 1).map(file => this.renderMedicalFileMobileCard(file)).join('')}
                    </div>
                </div>
                
                ${files.length > 1 ? `
                    <!-- Mobile Controls -->
                    <div class="mt-4 flex items-center justify-between">
                        <button id="medical-files-prev-mobile" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:bg-white dark:disabled:hover:bg-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M15 18l-6-6 6-6"/>
                            </svg>
                        </button>
                        <div id="medical-files-indicators-mobile" class="flex items-center gap-2">
                            ${Array.from({length: Math.ceil(files.length / 1)}, (_, i) => `
                                <button data-page="${i + 1}" class="h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-blue-600' : 'bg-gray-300'} hover:bg-blue-500 transition-colors cursor-pointer" aria-label="Go to page ${i + 1}"></button>
                            `).join('')}
                        </div>
                        <button id="medical-files-next-mobile" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:bg-white dark:disabled:hover:bg-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
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
     * Render a single medical file card for desktop with improved responsive design
     * @param {Object} file - Medical file object
     * @returns {string} HTML string for file card
     */
    renderMedicalFileCard(file) {
        const categoryBadge = this.getCategoryBadge(file.category);
        const fileSize = this.formatFileSize(file.file_size);
        
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:shadow-md transition-shadow h-full flex flex-col">
                <div class="flex items-start gap-3 flex-1">
                    <div class="flex-shrink-0">
                        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0 flex flex-col">
                        <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h4 class="font-medium text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">${file.file_name}</h4>
                            <div class="flex-shrink-0">
                                ${categoryBadge}
                            </div>
                        </div>
                        <div class="flex-1">
                            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">${fileSize}</p>
                            <p class="text-xs text-gray-400 dark:text-gray-500 mb-2">Uploaded: ${this.formatDateTime(file.created_at)}</p>
                            ${file.notes ? `<p class="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">${file.notes}</p>` : '<div class="mb-3"></div>'}
                        </div>
                        <div class="flex flex-wrap items-center gap-1 sm:gap-2 mt-auto">
                            <button onclick="window.medicalCard.autoDownload('${file.id}', '${file.file_name}')" 
                                    class="inline-flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded cursor-pointer transition-colors">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                <span class="hidden sm:inline">Download</span>
                            </button>
                            <button onclick="window.medicalCard.editFileCategory('${file.id}', '${file.category}', '${file.notes || ''}')" 
                                    class="inline-flex items-center px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded cursor-pointer transition-colors">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                                </svg>
                                <span class="hidden sm:inline">Category</span>
                            </button>
                            <button onclick="window.medicalCard.editFileNotes('${file.id}', '${file.notes || ''}')" 
                                    class="inline-flex items-center px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded cursor-pointer transition-colors">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                                <span class="hidden sm:inline">Notes</span>
                            </button>
                            <button onclick="window.medicalCard.deleteFile('${file.id}')" 
                                    class="inline-flex items-center px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded cursor-pointer transition-colors">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                                <span class="hidden sm:inline">Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render a single medical file card for mobile with improved responsive design
     * @param {Object} file - Medical file object
     * @returns {string} HTML string for mobile file card
     */
    renderMedicalFileMobileCard(file) {
        const categoryBadge = this.getCategoryBadge(file.category);
        const fileSize = this.formatFileSize(file.file_size);
        
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 w-full h-56 flex flex-col shadow-sm">
                <div class="flex items-start gap-4 flex-1">
                    <div class="flex-shrink-0">
                        <div class="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0 flex flex-col">
                        <div class="flex flex-col gap-2 mb-3">
                            <h4 class="font-medium text-gray-900 dark:text-gray-100 truncate text-base leading-tight">${file.file_name}</h4>
                            <div class="flex-shrink-0">
                                ${categoryBadge}
                            </div>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">${fileSize}</p>
                            <p class="text-sm text-gray-400 dark:text-gray-500 mb-3">Uploaded: ${this.formatDateTime(file.created_at)}</p>
                            ${file.notes ? `<p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-tight">${file.notes}</p>` : '<div class="mb-4"></div>'}
                        </div>
                    </div>
                </div>
                <div class="flex flex-wrap items-center gap-2 mt-auto">
                    <button onclick="window.medicalCard.autoDownload('${file.id}', '${file.file_name}')" 
                            class="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded cursor-pointer transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3"/>
                        </svg>
                        Download
                    </button>
                    <button onclick="window.medicalCard.editFileCategory('${file.id}', '${file.category}', '${file.notes || ''}')" 
                            class="inline-flex items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded cursor-pointer transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                        </svg>
                        Category
                    </button>
                    <button onclick="window.medicalCard.editFileNotes('${file.id}', '${file.notes || ''}')" 
                            class="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded cursor-pointer transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        Notes
                    </button>
                    <button onclick="window.medicalCard.deleteFile('${file.id}')" 
                            class="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded cursor-pointer transition-colors">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Delete
                    </button>
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
     * Initialize medical file upload handlers
     * @param {Object} inmate - Current inmate data
     */
    initializeMedicalFileUploadHandlers(inmate) {
        const uploadBtn = document.getElementById('upload-medical-file-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                this.openFileUploadModal(inmate);
            });
        }
    }

    /**
     * Open file upload modal using SweetAlert2
     * @param {Object} inmate - Current inmate data
     */
    openFileUploadModal(inmate) {
        // Create file upload modal HTML content
        const modalContent = `
            <div class="space-y-4">
                <!-- File Category Selection -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        File Category <span class="text-red-500">*</span>
                    </label>
                    <select id="medical-file-category" required
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Select category...</option>
                        <option value="lab_results">Lab Results</option>
                        <option value="medical_certificate">Medical Certificate</option>
                        <option value="prescription">Prescription</option>
                        <option value="xray_scan">X-Ray / Scan</option>
                        <option value="diagnosis_report">Diagnosis Report</option>
                        <option value="treatment_plan">Treatment Plan</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <!-- File Upload Area -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Medical File <span class="text-red-500">*</span>
                    </label>
                    <div id="file-upload-area" class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-purple-500 transition-colors cursor-pointer">
                        <div class="space-y-1 text-center">
                            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <div class="text-sm text-gray-600 dark:text-gray-400">
                                <span class="font-medium text-purple-600 hover:text-purple-500">Click to upload</span>
                                <span class="mx-2">or</span>
                                <span class="font-medium text-purple-600 hover:text-purple-500">drag and drop</span>
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                PDF, DOC, DOCX, JPG, PNG up to 10MB
                            </p>
                        </div>
                    </div>
                    
                    <!-- File Preview Area (initially hidden) -->
                    <div id="file-preview-area" class="hidden mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                </div>
                                <div>
                                    <p id="file-preview-name" class="text-sm font-medium text-gray-900 dark:text-gray-100"></p>
                                    <p id="file-preview-size" class="text-xs text-gray-500 dark:text-gray-400"></p>
                                </div>
                            </div>
                            <button id="remove-file-btn" class="text-red-600 hover:text-red-800 cursor-pointer">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                    </div>
                </div>
                
                    <!-- Hidden file input -->
                    <input id="medical-file-input" type="file" class="sr-only" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" multiple>
                </div>
                
                <!-- Short Notes/Summary -->
                <div>
                    <label for="file-notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Short Notes (Optional)
                    </label>
                    <textarea id="file-notes" rows="3" maxlength="200"
                              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                              placeholder="Add a brief summary or notes about this file (max 200 characters)"></textarea>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span id="notes-counter">0</span>/200 characters
                    </p>
                </div>
            </div>
        `;

        // Show SweetAlert2 modal with custom HTML
        // Get theme-aware colors from ThemeManager
        const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
        
        Swal.fire({
            title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Upload Medical File</span>`,
            html: modalContent,
            width: '600px',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Upload File',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#3B82F6', // Blue color to match inmate-cells
            cancelButtonColor: isDarkMode ? '#111827' : '#6B7280', // Theme-aware cancel button
            background: isDarkMode ? '#111827' : '#FFFFFF', // Theme-aware background
            color: isDarkMode ? '#F9FAFB' : '#111827', // Theme-aware text color
            allowOutsideClick: true,
            allowEscapeKey: true,
            backdrop: true,
            customClass: {
                popup: 'swal-responsive-popup',
                container: 'swal-responsive-container',
                content: 'swal-responsive-content',
                title: isDarkMode ? 'text-gray-100' : 'text-gray-900',
                htmlContainer: isDarkMode ? 'text-gray-300' : 'text-gray-700',
                closeButton: isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600',
                confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors',
                cancelButton: isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg px-4 py-2 transition-colors' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg px-4 py-2 transition-colors'
            },
            didOpen: () => {
                // Initialize file input handler after modal opens
                const fileInput = document.getElementById('medical-file-input');
                const categorySelect = document.getElementById('medical-file-category');
                const notesTextarea = document.getElementById('file-notes');
                const notesCounter = document.getElementById('notes-counter');
                const confirmBtn = document.querySelector('.swal2-confirm');
                const uploadArea = document.getElementById('file-upload-area');
                const previewArea = document.getElementById('file-preview-area');
                const previewName = document.getElementById('file-preview-name');
                const previewSize = document.getElementById('file-preview-size');
                const removeFileBtn = document.getElementById('remove-file-btn');
                
                if (fileInput && confirmBtn) {
                    // Initially disable confirm button
                    confirmBtn.disabled = true;
                    confirmBtn.style.opacity = '0.5';
                    confirmBtn.style.cursor = 'not-allowed';
                    
                    // Character counter for notes
                    if (notesTextarea && notesCounter) {
                        notesTextarea.addEventListener('input', (e) => {
                            const length = e.target.value.length;
                            notesCounter.textContent = length;
                            
                            if (length > 180) {
                                notesCounter.classList.add('text-yellow-500');
                            } else {
                                notesCounter.classList.remove('text-yellow-500');
                            }
                        });
                    }
                    
                    // File handling functions
                    const handleFiles = (files) => {
                        if (files && files.length > 0) {
                            const file = files[0]; // Handle first file for preview
                            
                            // Show preview
                            previewName.textContent = file.name;
                            previewSize.textContent = this.formatFileSize(file.size);
                            uploadArea.classList.add('hidden');
                            previewArea.classList.remove('hidden');
                            
                            // Update file input
                            fileInput.files = files;
                            checkFormValidity();
                        }
                    };
                    
                    const resetFileUpload = () => {
                        uploadArea.classList.remove('hidden');
                        previewArea.classList.add('hidden');
                        fileInput.value = '';
                        checkFormValidity();
                    };
                    
                    // Click to upload - make entire upload area clickable
                    if (uploadArea) {
                        uploadArea.addEventListener('click', () => {
                            fileInput.click();
                        });
                    }
                    
                    // Drag and drop functionality
                    if (uploadArea) {
                        uploadArea.addEventListener('dragover', (e) => {
                            e.preventDefault();
                            uploadArea.classList.add('border-purple-500', 'bg-purple-50', 'dark:bg-purple-900/20');
                        });
                        
                        uploadArea.addEventListener('dragleave', (e) => {
                            e.preventDefault();
                            uploadArea.classList.remove('border-purple-500', 'bg-purple-50', 'dark:bg-purple-900/20');
                        });
                        
                        uploadArea.addEventListener('drop', (e) => {
                            e.preventDefault();
                            uploadArea.classList.remove('border-purple-500', 'bg-purple-50', 'dark:bg-purple-900/20');
                            
                            const files = e.dataTransfer.files;
                            handleFiles(files);
                        });
                    }
                    
                    // Remove file button
                    if (removeFileBtn) {
                        removeFileBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            resetFileUpload();
                        });
                    }
                    
                    // File input change handler
                    fileInput.addEventListener('change', (e) => {
                        handleFiles(e.target.files);
                    });
                    
                    // Check if form is valid
                    const checkFormValidity = () => {
                        const hasFiles = fileInput.files && fileInput.files.length > 0;
                        const hasCategory = categorySelect && categorySelect.value;
                        
                        if (hasFiles && hasCategory) {
                            confirmBtn.disabled = false;
                            confirmBtn.style.opacity = '1';
                            confirmBtn.style.cursor = 'pointer';
                            confirmBtn.textContent = `Upload ${fileInput.files.length} File${fileInput.files.length > 1 ? 's' : ''}`;
                        } else {
                            confirmBtn.disabled = true;
                            confirmBtn.style.opacity = '0.5';
                            confirmBtn.style.cursor = 'not-allowed';
                            confirmBtn.textContent = 'Upload File';
                        }
                    };
                    
                    if (categorySelect) {
                        categorySelect.addEventListener('change', checkFormValidity);
                    }
                }
            },
            preConfirm: () => {
                const fileInput = document.getElementById('medical-file-input');
                const categorySelect = document.getElementById('medical-file-category');
                const notesTextarea = document.getElementById('file-notes');
                
                if (!fileInput.files || fileInput.files.length === 0) {
                    Swal.showValidationMessage('Please select at least one file to upload');
                    return false;
                }
                
                if (!categorySelect.value) {
                    Swal.showValidationMessage('Please select a file category');
                    return false;
                }
                
                // Validate file types
                const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
                const files = Array.from(fileInput.files);
                const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
                
                if (invalidFiles.length > 0) {
                    Swal.showValidationMessage(`Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Please upload PDF, DOC, DOCX, JPG, or PNG files only.`);
                    return false;
                }
                
                // Validate file sizes (10MB max per file)
                const maxSize = 10 * 1024 * 1024; // 10MB in bytes
                const oversizedFiles = files.filter(file => file.size > maxSize);
                
                if (oversizedFiles.length > 0) {
                    Swal.showValidationMessage(`File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum file size is 10MB.`);
                    return false;
                }
                
                // Store files and metadata for upload
                this.pendingUpload = {
                    inmateId: inmate.id,
                    files: fileInput.files,
                    category: categorySelect.value,
                    notes: notesTextarea ? notesTextarea.value.trim() : ''
                };
                
                return true;
            }
        }).then((result) => {
            if (result.isConfirmed && this.pendingUpload) {
                // Upload files when user confirms
                this.uploadFiles(this.pendingUpload.inmateId, this.pendingUpload.files, this.pendingUpload.category, this.pendingUpload.notes);
                this.pendingUpload = null;
            }
        }).catch((error) => {
            console.error('Modal error:', error);
        });
    }

    /**
     * Upload files for inmate
     * @param {number} inmateId - Inmate ID
     * @param {FileList} files - Files to upload
     * @param {string} category - File category
     * @param {string} notes - File notes
     */
    async uploadFiles(inmateId, files, category, notes = '') {
        try {
            
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('inmate_id', inmateId);
            formData.append('category', category);
            formData.append('notes', notes ? notes.substring(0, 200) : '');
            
            // Add files to FormData
            for (let i = 0; i < files.length; i++) {
                formData.append('files[]', files[i]);
            }
            
            // Show loading state with SweetAlert2
            Swal.fire({
                title: 'Uploading Files...',
                html: `
                    <div class="flex flex-col items-center space-y-3">
                        <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p class="text-gray-300">Please wait while we upload your files...</p>
                    </div>
                `,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                backdrop: true,
                background: '#111827', // Dark background to match inmate-cells
                color: '#F9FAFB', // Light text to match inmate-cells
                customClass: {
                    popup: 'swal-responsive-popup',
                    container: 'swal-responsive-container',
                    content: 'swal-responsive-content',
                    title: 'text-gray-100'
                }
            });
            
            // Upload files to API endpoint
            const response = await fetch(`/api/inmates/${inmateId}/medical-files/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });
            
            let result;
            
            try {
                // Check if response is JSON before parsing
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    result = await response.json();
                } else {
                    // If not JSON, get text and handle as error
                    const text = await response.text();
                    throw new Error(`Server returned non-JSON response: ${text.substring(0, 200)}...`);
                }
            } catch (parseError) {
                throw new Error('Failed to parse server response. Please try again.');
            }
            
            if (response.ok && result && result.success) {
                // Close loading modal and refresh medical card
                Swal.close();
                this.loadInmateMedicalInfo(this.currentInmate);
                
                // Show success message with SweetAlert2
                Swal.fire({
                    title: 'Success!',
                    text: result.message || 'Files uploaded successfully!',
                    icon: 'success',
                    confirmButtonColor: '#3B82F6',
                    background: '#111827',
                    color: '#F9FAFB',
                    customClass: {
                        popup: 'swal-responsive-popup',
                        container: 'swal-responsive-container',
                        content: 'swal-responsive-content',
                        title: 'text-gray-100',
                        htmlContainer: 'text-gray-300'
                    }
                });
            } else {
                // Handle validation errors and server errors
                let errorMessage = 'Failed to upload files. Please try again.';
                
                if (result && result.errors) {
                    // Laravel validation errors
                    const errorMessages = Object.values(result.errors).flat();
                    errorMessage = errorMessages.join('\n');
                } else if (result && result.message) {
                    errorMessage = result.message;
                } else if (response.status === 500) {
                    errorMessage = 'Server error occurred. Please check your file and try again.';
                } else if (response.status === 422) {
                    errorMessage = 'Validation failed. Please check your file and form data.';
                } else {
                    errorMessage = `Upload failed with status ${response.status}. Please try again.`;
                }
                
                throw new Error(errorMessage);
            }
            
        } catch (error) {
            console.error('Error uploading files:', error);
            
            // Close loading modal and show error
            Swal.close();
            
            const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
            
            // Format error message for better display
            let errorMessage = error.message || 'Failed to upload files. Please try again.';
            
            // Handle specific error types
            if (errorMessage.includes('Unexpected token') || errorMessage.includes('not valid JSON')) {
                errorMessage = 'Server error occurred. The server returned an unexpected response.\n\n💡 Please try again or contact support if the issue persists.';
            } else if (errorMessage.includes('non-JSON response')) {
                errorMessage = 'Server error occurred. The server returned an error page instead of a proper response.\n\n💡 Please check your file and try again.';
            } else if (errorMessage.includes('mimes') || errorMessage.includes('file type')) {
                errorMessage += '\n\n💡 Tip: Try using PDF, DOC, DOCX, JPG, or PNG files.';
            } else if (errorMessage.includes('max') || errorMessage.includes('size')) {
                errorMessage += '\n\n💡 Tip: Make sure your file is smaller than 10MB.';
            } else if (errorMessage.includes('storage') || errorMessage.includes('directory')) {
                errorMessage += '\n\n💡 Tip: There might be a server storage issue. Please try again later.';
            } else if (errorMessage.includes('notes') || errorMessage.includes('200 characters')) {
                errorMessage += '\n\n💡 Tip: Keep your notes under 200 characters.';
            }
            
            Swal.fire({
                title: 'Upload Failed',
                html: `<div class="text-sm whitespace-pre-line">${errorMessage}</div>`,
                icon: 'error',
                confirmButtonColor: '#EF4444',
                background: isDarkMode ? '#111827' : '#FFFFFF',
                color: isDarkMode ? '#F9FAFB' : '#111827',
                customClass: {
                    popup: 'swal-responsive-popup',
                    container: 'swal-responsive-container',
                    content: 'swal-responsive-content',
                    title: isDarkMode ? 'text-gray-100' : 'text-gray-900',
                    htmlContainer: isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }
            });
        }
    }

    /**
     * Download medical file (for table section)
     * @param {string} fileId - File ID
     * @param {string} fileName - File name
     */
    async downloadMedicalFile(fileId, fileName) {
        try {
            // Show loading state
            const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
            
            Swal.fire({
                title: 'Downloading...',
                html: `
                    <div class="flex flex-col items-center space-y-3">
                        <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p class="${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Preparing <strong>${fileName}</strong> for download...</p>
                    </div>
                `,
                showConfirmButton: false,
                allowOutsideClick: false,
                background: isDarkMode ? '#111827' : '#FFFFFF',
                color: isDarkMode ? '#F9FAFB' : '#111827'
            });
            
            const response = await fetch(`/api/inmates/medical-files/${fileId}/download`);
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                Swal.close();
                
                // Show success message
                Swal.fire({
                    title: 'Success!',
                    text: 'File downloaded successfully!',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: isDarkMode ? '#111827' : '#FFFFFF',
                    color: isDarkMode ? '#F9FAFB' : '#111827'
                });
            } else {
                throw new Error('Download failed');
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            Swal.close();
            this.showErrorMessage('Failed to download file. Please try again.');
        }
    }

    /**
     * Delete medical file (for table section)
     * @param {string} fileId - File ID
     */
    async deleteMedicalFile(fileId) {
        const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
        
        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Delete Medical File?',
            text: 'Are you sure you want to delete this medical file? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: isDarkMode ? '#374151' : '#6B7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            background: isDarkMode ? '#111827' : '#FFFFFF',
            color: isDarkMode ? '#F9FAFB' : '#111827',
            customClass: {
                confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-4 py-2 transition-colors',
                cancelButton: isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg px-4 py-2 transition-colors' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg px-4 py-2 transition-colors'
            }
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/inmates/medical-files/${fileId}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });
                
                if (response.ok) {
                    // Reload medical info to refresh the table
                    this.loadInmateMedicalInfo(this.currentInmate);
                    
                    // Show success message
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'File deleted successfully!',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                        background: isDarkMode ? '#111827' : '#FFFFFF',
                        color: isDarkMode ? '#F9FAFB' : '#111827'
                    });
                } else {
                    throw new Error('Delete failed');
                }
            } catch (error) {
                console.error('Error deleting file:', error);
                this.showErrorMessage('Failed to delete file. Please try again.');
            }
        }
    }

    /**
     * Download medical file (legacy method for carousel section)
     * @param {string} fileId - File ID
     */
    async downloadFile(fileId) {
        try {
            const response = await fetch(`/api/inmates/medical-files/${fileId}/download`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'medical-file';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                throw new Error('Download failed');
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            this.showErrorMessage('Failed to download file. Please try again.');
        }
    }

    /**
     * Delete medical file
     * @param {string} fileId - File ID
     */
    async deleteFile(fileId) {
        // Show confirmation dialog with SweetAlert2
        const result = await Swal.fire({
            title: 'Delete Medical File',
            text: 'Are you sure you want to delete this medical file? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444', // Red color to match inmate-cells
            cancelButtonColor: '#111827', // Dark color to match inmate-cells
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            allowOutsideClick: true,
            backdrop: true,
            background: '#111827', // Dark background to match inmate-cells
            color: '#F9FAFB', // Light text to match inmate-cells
            customClass: {
                popup: 'swal-responsive-popup',
                container: 'swal-responsive-container',
                content: 'swal-responsive-content',
                title: 'text-gray-100',
                htmlContainer: 'text-gray-300',
                confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-4 py-2 transition-colors',
                cancelButton: 'bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg px-4 py-2 transition-colors'
            }
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/inmates/medical-files/${fileId}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });
                
                if (response.ok) {
                    this.loadInmateMedicalInfo(this.currentInmate);
                    
                    // Show success message with SweetAlert2
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'File deleted successfully!',
                        icon: 'success',
                        confirmButtonColor: '#3B82F6', // Blue color to match inmate-cells
                        background: '#111827', // Dark background to match inmate-cells
                        color: '#F9FAFB', // Light text to match inmate-cells
                        customClass: {
                            popup: 'swal-responsive-popup',
                            container: 'swal-responsive-container',
                            content: 'swal-responsive-content',
                            title: 'text-gray-100',
                            htmlContainer: 'text-gray-300'
                        }
                    });
                } else {
                    throw new Error('Delete failed');
                }
            } catch (error) {
                console.error('Error deleting file:', error);
                
                // Show error message with SweetAlert2
                Swal.fire({
                    title: 'Delete Failed',
                    text: 'Failed to delete file. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#EF4444', // Red color to match inmate-cells
                    background: '#111827', // Dark background to match inmate-cells
                    color: '#F9FAFB', // Light text to match inmate-cells
                    customClass: {
                        popup: 'swal-responsive-popup',
                        container: 'swal-responsive-container',
                        content: 'swal-responsive-content',
                        title: 'text-gray-100',
                        htmlContainer: 'text-gray-300'
                    }
                });
            }
        }
    }

    /**
     * Initialize medical files carousel functionality
     * @param {Object} inmate - Current inmate data
     */
    initializeMedicalFilesCarousel(inmate) {
        const files = inmate.medicalFiles || [];
        
        if (files.length <= 3) {
            // Initialize mobile carousel for grid view if more than 1 file
            if (files.length > 1) {
                this.initializeMobileCarousel(files);
            }
            return; // No desktop carousel needed
        }

        // Initialize desktop carousel
        this.initializeDesktopCarousel(files);
        
        // Initialize mobile carousel
        this.initializeMobileCarousel(files);
    }

    /**
     * Initialize desktop carousel (3 cards per view)
     * @param {Array} files - Array of medical files
     */
    initializeDesktopCarousel(files) {
        const slideEl = document.getElementById('medical-files-slide-desktop');
        const prevBtn = document.getElementById('medical-files-prev-desktop');
        const nextBtn = document.getElementById('medical-files-next-desktop');
        const indicatorsEl = document.getElementById('medical-files-indicators-desktop');

        if (!slideEl || !prevBtn || !nextBtn || !indicatorsEl) {
            return;
        }

        const limit = 3;
        const totalPages = Math.ceil(files.length / limit);
        let currentPage = 1;

        const self = this; // Store reference to this context
        
        function renderSlide(page) {
            const startIndex = (page - 1) * limit;
            const endIndex = Math.min(startIndex + limit, files.length);
            const pageFiles = files.slice(startIndex, endIndex);
            
            slideEl.innerHTML = '';
            slideEl.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
            pageFiles.forEach(file => {
                slideEl.insertAdjacentHTML('beforeend', self.renderMedicalFileCard(file));
            });
        }

        function renderIndicators(activePage) {
            indicatorsEl.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const isActive = i === activePage;
                indicatorsEl.insertAdjacentHTML('beforeend', `
                    <button data-page="${i}" class="h-2.5 w-2.5 rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-300'} hover:bg-blue-500 transition-colors cursor-pointer" aria-label="Go to page ${i}"></button>
                `);
            }
        }

        function updateControlsState() {
            prevBtn.disabled = currentPage <= 1;
            nextBtn.disabled = currentPage >= totalPages;
        }

        function goToPage(pageIndex) {
            const clamped = Math.max(1, Math.min(totalPages, pageIndex));
            if (clamped === currentPage) return;
            
            currentPage = clamped;
            renderSlide(currentPage);
            renderIndicators(currentPage);
            updateControlsState();
        }

        // Initialize
        renderSlide(currentPage);
        renderIndicators(currentPage);
        updateControlsState();

        // Event listeners
        prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
        nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
        indicatorsEl.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-page]');
            if (!btn) return;
            const p = parseInt(btn.getAttribute('data-page')) || 1;
            goToPage(p);
        });
    }

    /**
     * Initialize mobile carousel (1 card per view)
     * @param {Array} files - Array of medical files
     */
    initializeMobileCarousel(files) {
        const slideEl = document.getElementById('medical-files-slide-mobile');
        const prevBtn = document.getElementById('medical-files-prev-mobile');
        const nextBtn = document.getElementById('medical-files-next-mobile');
        const indicatorsEl = document.getElementById('medical-files-indicators-mobile');

        if (!slideEl || !prevBtn || !nextBtn || !indicatorsEl) {
            return;
        }

        const limit = 1;
        const totalPages = Math.ceil(files.length / limit);
        let currentPage = 1;

        const self = this; // Store reference to this context
        
        function renderSlide(page) {
            const startIndex = (page - 1) * limit;
            const endIndex = Math.min(startIndex + limit, files.length);
            const pageFiles = files.slice(startIndex, endIndex);
            
            slideEl.innerHTML = '';
            slideEl.className = 'flex justify-center';
            
            // Create fixed container for single card
            const container = document.createElement('div');
            container.className = 'w-full max-w-sm h-64 flex items-center justify-center';
            
            pageFiles.forEach(file => {
                container.insertAdjacentHTML('beforeend', self.renderMedicalFileMobileCard(file));
            });
            
            slideEl.appendChild(container);
        }

        function renderIndicators(activePage) {
            indicatorsEl.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const isActive = i === activePage;
                indicatorsEl.insertAdjacentHTML('beforeend', `
                    <button data-page="${i}" class="h-2.5 w-2.5 rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-300'} hover:bg-blue-500 transition-colors cursor-pointer" aria-label="Go to page ${i}"></button>
                `);
            }
        }

        function updateControlsState() {
            prevBtn.disabled = currentPage <= 1;
            nextBtn.disabled = currentPage >= totalPages;
        }

        function goToPage(pageIndex) {
            const clamped = Math.max(1, Math.min(totalPages, pageIndex));
            if (clamped === currentPage) return;
            
            currentPage = clamped;
            renderSlide(currentPage);
            renderIndicators(currentPage);
            updateControlsState();
        }

        // Initialize
        renderSlide(currentPage);
        renderIndicators(currentPage);
        updateControlsState();

        // Event listeners
        prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
        nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
        indicatorsEl.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-page]');
            if (!btn) return;
            const p = parseInt(btn.getAttribute('data-page')) || 1;
            goToPage(p);
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
     * Format address for display by combining all address fields
     * @param {Object} inmate - Inmate object
     * @returns {string} Formatted address
     */
    formatAddress(inmate) {
        if (!inmate) return 'Not provided';
        
        const addressParts = [];
        
        // Add address_line1 if it exists
        if (inmate.address_line1) {
            addressParts.push(inmate.address_line1);
        }
        
        // Add address_line2 if it exists (leave empty if not)
        if (inmate.address_line2) {
            addressParts.push(inmate.address_line2);
        }
        
        // Add city if it exists
        if (inmate.city) {
            addressParts.push(inmate.city);
        }
        
        // Add province if it exists
        if (inmate.province) {
            addressParts.push(inmate.province);
        }
        
        // Add postal_code if it exists
        if (inmate.postal_code) {
            addressParts.push(inmate.postal_code);
        }
        
        // Add country if it exists
        if (inmate.country) {
            addressParts.push(inmate.country);
        }
        
        // Return combined address or 'Not provided' if no address parts
        return addressParts.length > 0 ? addressParts.join(', ') : 'Not provided';
    }

    /**
     * Format date for display (date only, no time)
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
     * Format date with time for display
     * @param {string} dateString - Date string
     * @returns {string} Formatted date with time
     */
    formatDateTime(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
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

    /**
     * Get file icon based on file type
     * @param {string} fileType - File type/extension
     * @returns {string} SVG path for file icon
     */
    getFileIcon(fileType) {
        const type = fileType.toLowerCase();
        if (type === 'pdf') {
            return `<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>`;
        } else if (type.includes('doc')) {
            return `<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>`;
        } else if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png')) {
            return `<path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>`;
        } else {
            return `<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>`;
        }
    }

    /**
     * Get file icon color based on file type
     * @param {string} fileType - File type/extension
     * @returns {string} CSS classes for file icon color
     */
    getFileIconColor(fileType) {
        const type = fileType.toLowerCase();
        if (type === 'pdf') {
            return 'bg-red-500';
        } else if (type.includes('doc')) {
            return 'bg-blue-500';
        } else if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png')) {
            return 'bg-green-500';
        } else {
            return 'bg-gray-500';
        }
    }

    /**
     * Format file size for display
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    /**
     * Show success message using SweetAlert2
     * @param {string} message - Success message
     */
    showSuccessMessage(message) {
        Swal.fire({
            title: 'Success!',
            text: message,
            icon: 'success',
            confirmButtonColor: '#3B82F6', // Blue color to match inmate-cells
            background: '#111827', // Dark background to match inmate-cells
            color: '#F9FAFB', // Light text to match inmate-cells
            customClass: {
                popup: 'swal-responsive-popup',
                container: 'swal-responsive-container',
                content: 'swal-responsive-content',
                title: 'text-gray-100',
                htmlContainer: 'text-gray-300'
            }
        });
    }

    /**
     * Show error message using SweetAlert2
     * @param {string} message - Error message
     */
    showErrorMessage(message) {
        Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonColor: '#EF4444', // Red color to match inmate-cells
            background: '#111827', // Dark background to match inmate-cells
            color: '#F9FAFB', // Light text to match inmate-cells
            customClass: {
                popup: 'swal-responsive-popup',
                container: 'swal-responsive-container',
                content: 'swal-responsive-content',
                title: 'text-gray-100',
                htmlContainer: 'text-gray-300'
            }
        });
    }

    /**
     * Get category badge HTML with improved responsive design
     * @param {string} category - File category
     * @returns {string} HTML string
     */
    getCategoryBadge(category) {
        const categories = {
            'lab_results': { label: 'Lab Results', color: 'bg-blue-500/10 text-blue-500' },
            'medical_certificate': { label: 'Medical Certificate', color: 'bg-green-500/10 text-green-500' },
            'prescription': { label: 'Prescription', color: 'bg-purple-500/10 text-purple-500' },
            'xray_scan': { label: 'X-Ray/Scan', color: 'bg-cyan-500/10 text-cyan-500' },
            'diagnosis_report': { label: 'Diagnosis Report', color: 'bg-red-500/10 text-red-500' },
            'treatment_plan': { label: 'Treatment Plan', color: 'bg-yellow-500/10 text-yellow-500' },
            'other': { label: 'Other', color: 'bg-gray-500/10 text-gray-500' }
        };
        
        const cat = categories[category] || categories['other'];
        return `<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${cat.color} whitespace-nowrap">${cat.label}</span>`;
    }

    /**
     * Format file size
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    /**
     * Format date
     * @param {string} dateString - Date string
     * @returns {string} Formatted date
     */

    /**
     * Manual Download - Shows confirmation modal
     */
    async confirmDownload(fileId, fileName) {
        const result = await Swal.fire({
            title: 'Download File?',
            html: `Do you want to download <strong>${fileName}</strong>?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, download it!',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#3B82F6',
            cancelButtonColor: '#6B7280'
        });
        
        if (result.isConfirmed) {
            await this.performDownload(fileId, fileName);
        }
    }

    /**
     * Auto Download - Shows loading animation then downloads
     */
    async autoDownload(fileId, fileName) {
        Swal.fire({
            title: 'Downloading...',
            html: `
                <div class="flex flex-col items-center space-y-3">
                    <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p>Preparing <strong>${fileName}</strong> for download...</p>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        
        await this.performDownload(fileId, fileName);
        Swal.close();
    }

    /**
     * Perform actual file download
     */
    async performDownload(fileId, fileName) {
        try {
            const response = await fetch(`/api/inmates/medical-files/${fileId}/download`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            this.showErrorMessage('Failed to download file');
        }
    }

    /**
     * Edit file category and notes
     */
    async editFileCategory(fileId, currentCategory, currentNotes) {
        const categoryOptions = {
            'lab_results': 'Lab Results',
            'medical_certificate': 'Medical Certificate',
            'prescription': 'Prescription',
            'xray_scan': 'X-Ray/Scan',
            'diagnosis_report': 'Diagnosis Report',
            'treatment_plan': 'Treatment Plan',
            'other': 'Other'
        };

        const { value: formValues } = await Swal.fire({
            title: 'Edit File Details',
            html: `
                <div class="space-y-4">
                    <!-- Category Selection -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            File Category <span class="text-red-500">*</span>
                        </label>
                        <select id="edit-file-category" required
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            ${Object.entries(categoryOptions).map(([value, label]) => 
                                `<option value="${value}" ${value === currentCategory ? 'selected' : ''}>${label}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <!-- Notes -->
                    <div>
                        <label for="edit-file-notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Short Notes (Optional)
                        </label>
                        <textarea id="edit-file-notes" rows="3" maxlength="200"
                                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                  placeholder="Add a brief summary or notes about this file (max 200 characters)">${currentNotes}</textarea>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span id="edit-notes-counter">${currentNotes.length}</span>/200 characters
                        </p>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save Changes',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#3B82F6',
            cancelButtonColor: '#6B7280',
            background: '#111827',
            color: '#F9FAFB',
            customClass: {
                popup: 'swal-responsive-popup',
                container: 'swal-responsive-container',
                content: 'swal-responsive-content',
                title: 'text-gray-100',
                htmlContainer: 'text-gray-300',
                confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors',
                cancelButton: 'bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg px-4 py-2 transition-colors'
            },
            didOpen: () => {
                const notesTextarea = document.getElementById('edit-file-notes');
                const notesCounter = document.getElementById('edit-notes-counter');
                
                if (notesTextarea && notesCounter) {
                    notesTextarea.addEventListener('input', (e) => {
                        const length = e.target.value.length;
                        notesCounter.textContent = length;
                        
                        if (length > 180) {
                            notesCounter.classList.add('text-yellow-500');
                        } else {
                            notesCounter.classList.remove('text-yellow-500');
                        }
                    });
                }
            },
            preConfirm: () => {
                const categorySelect = document.getElementById('edit-file-category');
                const notesTextarea = document.getElementById('edit-file-notes');
                
                if (!categorySelect.value) {
                    Swal.showValidationMessage('Please select a file category');
                    return false;
                }
                
                return {
                    category: categorySelect.value,
                    notes: notesTextarea ? notesTextarea.value.trim() : ''
                };
            }
        });
        
        if (formValues) {
            await this.updateFileDetails(fileId, formValues.category, formValues.notes);
        }
    }

    /**
     * Edit file notes
     */
    async editFileNotes(fileId, currentNotes) {
        const { value: notes } = await Swal.fire({
            title: 'Edit File Notes',
            input: 'textarea',
            inputLabel: 'Short Notes',
            inputValue: currentNotes,
            inputAttributes: {
                maxlength: 200
            },
            showCancelButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#3B82F6',
            cancelButtonColor: '#6B7280',
            background: '#111827',
            color: '#F9FAFB',
            customClass: {
                popup: 'swal-responsive-popup',
                container: 'swal-responsive-container',
                content: 'swal-responsive-content',
                title: 'text-gray-100',
                htmlContainer: 'text-gray-300',
                confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors',
                cancelButton: 'bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg px-4 py-2 transition-colors'
            }
        });
        
        if (notes !== undefined) {
            await this.updateFileNotes(fileId, notes);
        }
    }

    /**
     * Update file details (category and notes) via API
     */
    async updateFileDetails(fileId, category, notes) {
        try {
            const response = await fetch(`/api/inmates/medical-files/${fileId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ category, notes })
            });
            
            if (response.ok) {
                this.showSuccessMessage('File details updated successfully');
                this.loadInmateMedicalInfo(this.currentInmate);
            } else {
                throw new Error('Failed to update file details');
            }
        } catch (error) {
            console.error('Error updating file details:', error);
            this.showErrorMessage('Failed to update file details');
        }
    }

    /**
     * Update file notes via API
     */
    async updateFileNotes(fileId, notes) {
        try {
            const response = await fetch(`/api/inmates/medical-files/${fileId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ notes })
            });
            
            if (response.ok) {
                this.showSuccessMessage('Notes updated successfully');
                this.loadInmateMedicalInfo(this.currentInmate);
            }
        } catch (error) {
            this.showErrorMessage('Failed to update notes');
        }
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

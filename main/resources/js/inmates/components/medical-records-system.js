// Medical Records System Component
// - Manages medical records history for inmates
// - Provides form rendering and record management
// - Integrates with SweetAlert2 for modal interactions

export function createMedicalRecordsManager() {
  
  function renderAddRecordButton() {
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    return `
      <button type="button" id="add-medical-record" class="inline-flex items-center px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-md cursor-pointer transition-colors">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Add Medical Record
      </button>
    `;
  }

  function renderMedicalRecordsHistory(records = []) {
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    if (!records || records.length === 0) {
      return `<div class="text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">No medical records yet</div>`;
    }

    return records.map(record => `
      <div class="p-3 ${isDarkMode ? 'bg-gray-800/40 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded border">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <span class="text-sm font-semibold ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}">${record.diagnosis}</span>
            <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1">${record.date}</div>
          </div>
        </div>
        <div class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-2">Treatment: ${record.treatment}</div>
        ${record.notes ? `<div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 italic">Notes: ${record.notes}</div>` : ''}
        ${record.recordedBy ? `<div class="text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1">By: ${record.recordedBy}</div>` : `<div class="text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1">By: System</div>`}
      </div>
    `).join('');
  }

  function renderMedicalRecordForm(inmateId, medicalStatus = '') {
    const isMobile = () => window.innerWidth < 640;
    
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    return `
      <div class="space-y-3 text-left max-h-96 overflow-y-auto pr-2">
        <div>
          <label class="block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Record Date *</label>
          <input id="med-date" type="date" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                 value="${new Date().toISOString().split('T')[0]}" />
        </div>
        <div>
          <label class="block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Diagnosis *</label>
          <input id="med-diagnosis" type="text" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                 placeholder="e.g., Common Cold, Hypertension" />
        </div>
        <div>
          <label class="block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Treatment *</label>
          <textarea id="med-treatment" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    rows="2" placeholder="Treatment provided..."></textarea>
        </div>
        <div>
          <label class="block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Nurse Notes</label>
          <textarea id="med-notes" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    rows="2" placeholder="Additional observations..."></textarea>
        </div>

        <!-- Vitals -->
        <div class="border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} pt-3">
          <label class="block text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold">Vitals</label>
          <div class="grid grid-cols-2 gap-2">
            <input type="text" id="med-bp" class="w-full rounded ${isDarkMode ? 'border-gray-600 bg-gray-800/60 text-white' : 'border-gray-300 bg-white text-gray-900'} px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                   placeholder="BP (e.g., 120/80)" />
            <input type="text" id="med-hr" class="w-full rounded ${isDarkMode ? 'border-gray-600 bg-gray-800/60 text-white' : 'border-gray-300 bg-white text-gray-900'} px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                   placeholder="HR (bpm)" />
            <input type="text" id="med-temp" class="w-full rounded ${isDarkMode ? 'border-gray-600 bg-gray-800/60 text-white' : 'border-gray-300 bg-white text-gray-900'} px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                   placeholder="Temp (°C)" />
            <input type="text" id="med-weight" class="w-full rounded ${isDarkMode ? 'border-gray-600 bg-gray-800/60 text-white' : 'border-gray-300 bg-white text-gray-900'} px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                   placeholder="Weight (kg)" />
          </div>
        </div>

        <!-- Allergies -->
        <div class="border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} pt-3">
          <label class="block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold">Allergies <span class="text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}">(comma-separated)</span></label>
          <input type="text" id="med-allergies" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                 placeholder="e.g., Penicillin, Peanuts" />
        </div>

        <!-- Medications -->
        <div class="border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} pt-3">
          <label class="block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold">Medications <span class="text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}">(comma-separated)</span></label>
          <input type="text" id="med-medications" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                 placeholder="e.g., Aspirin 100mg, Amoxicillin" />
        </div>

        <div class="border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} pt-3">
          <label class="block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Update Medical Status</label>
          <select id="med-status-update" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Keep current status</option>
            <option value="Healthy">Healthy</option>
            <option value="Under Treatment">Under Treatment</option>
            <option value="Critical">Critical</option>
            <option value="Not Assessed">Not Assessed</option>
          </select>
        </div>
      </div>
    `;
  }

  function openAddMedicalRecordModal(inmateId, currentStatus, onSuccess) {
    const isMobile = () => window.innerWidth < 640;
    
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    return window.Swal.fire({
      title: 'Add Medical Record',
      html: renderMedicalRecordForm(inmateId, currentStatus),
      width: isMobile() ? '95%' : '600px',
      showCancelButton: true,
      confirmButtonText: 'Add Record',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#14B8A6',
      cancelButtonColor: '#DC2626',
      background: isDarkMode ? '#1F2937' : '#FFFFFF',
      color: isDarkMode ? '#F9FAFB' : '#111827',
      preConfirm: () => {
        const date = document.getElementById('med-date').value;
        const diagnosis = document.getElementById('med-diagnosis').value;
        const treatment = document.getElementById('med-treatment').value;
        const notes = document.getElementById('med-notes').value;
        const medicalStatus = document.getElementById('med-status-update').value;

        // Vitals
        const bp = document.getElementById('med-bp').value.trim();
        const hr = document.getElementById('med-hr').value.trim();
        const temp = document.getElementById('med-temp').value.trim();
        const weight = document.getElementById('med-weight').value.trim();
        const vitals = (bp || hr || temp || weight) ? {
          blood_pressure: bp || null,
          heart_rate: hr || null,
          temperature: temp || null,
          weight: weight || null
        } : null;

        // Allergies
        const allergiesStr = document.getElementById('med-allergies').value.trim();
        const allergies = allergiesStr ? allergiesStr.split(',').map(a => a.trim()).filter(a => a) : null;

        // Medications
        const medicationsStr = document.getElementById('med-medications').value.trim();
        const medications = medicationsStr ? medicationsStr.split(',').map(m => m.trim()).filter(m => m) : null;
        
        if (!date || !diagnosis || !treatment) {
          window.Swal.showValidationMessage('Please fill all required fields');
          return false;
        }
        
        return { date, diagnosis, treatment, notes, vitals, allergies, medications, medical_status: medicalStatus };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const response = await fetch(`/api/inmates/${inmateId}/medical-records/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({
              record_date: result.value.date,
              diagnosis: result.value.diagnosis,
              treatment: result.value.treatment,
              notes: result.value.notes,
              vitals: result.value.vitals,
              allergies: result.value.allergies,
              medications: result.value.medications,
              medical_status: result.value.medical_status
            })
          });
          
          const data = await response.json();
          
          if (data.success) {
            window.Swal.fire({
              icon: 'success',
              title: 'Record Added!',
              text: 'Medical record saved successfully',
              timer: 1500,
              showConfirmButton: false,
              background: isDarkMode ? '#1F2937' : '#FFFFFF',
              color: isDarkMode ? '#F9FAFB' : '#111827'
            });
            
            // Call success callback with updated data
            if (onSuccess && typeof onSuccess === 'function') {
              onSuccess(data.data, result.value);
            }
          } else {
            throw new Error(data.message);
          }
        } catch (error) {
          window.Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to add medical record',
            background: isDarkMode ? '#1F2937' : '#FFFFFF',
            color: isDarkMode ? '#F9FAFB' : '#111827'
          });
        }
      }
    });
  }

  return {
    renderAddRecordButton,
    renderMedicalRecordsHistory,
    renderMedicalRecordForm,
    openAddMedicalRecordModal
  };
}

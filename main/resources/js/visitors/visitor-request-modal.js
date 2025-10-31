// New Visitation Request Modal with Visitor Selection
export async function openVisitationRequestModal(inmate) {
  // Fetch registered visitors for this inmate
  let registeredVisitors = [];
  try {
    const response = await fetch(`/api/visitors?inmate_id=${inmate.id}`);
    const data = await response.json();
    if (data.success && data.data) {
      registeredVisitors = data.data.filter(v => v.is_allowed);
    }
  } catch (error) {
    console.error('Failed to fetch visitors:', error);
  }

  const visitorOptions = registeredVisitors.map(v => 
    `<option value="${v.id}" data-visitor='${JSON.stringify(v)}'>${v.name} - ${v.relationship || 'N/A'}</option>`
  ).join('');

  const html = `
    <div class="text-left">
      <h3 class="text-base sm:text-lg font-semibold text-white mb-3">New Visitation Request</h3>
      <div class="mb-4 text-xs sm:text-sm text-gray-300">Creating visit request for <span class="font-semibold text-white">${inmate.name}</span> (ID ${String(inmate.id).padStart(4,'0')})</div>
      
      <form class="max-w-full mx-auto">
        <!-- Visitor Selection Type -->
        <div class="mb-6">
          <label class="block mb-2 text-sm font-medium text-gray-400">Select Visitor Type</label>
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <label class="inline-flex items-center cursor-pointer">
              <input type="radio" name="visitor-type" value="existing" id="visitor-type-existing" class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500" ${registeredVisitors.length > 0 ? 'checked' : 'disabled'}>
              <span class="ml-2 text-xs sm:text-sm text-gray-300">Select Registered Visitor</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input type="radio" name="visitor-type" value="new" id="visitor-type-new" class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500" ${registeredVisitors.length === 0 ? 'checked' : ''}>
              <span class="ml-2 text-xs sm:text-sm text-gray-300">Register New Visitor</span>
            </label>
          </div>
        </div>

        <!-- Existing Visitor Selection -->
        <div id="existing-visitor-section" class="${registeredVisitors.length === 0 ? 'hidden' : ''}">
          <div class="relative z-0 w-full mb-5 group">
            <label for="select-visitor" class="block mb-2 text-sm font-medium text-gray-400">Registered Visitors</label>
            <select id="select-visitor" class="block w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500">
              <option value="" selected>Choose a visitor...</option>
              ${visitorOptions}
            </select>
          </div>
        </div>

        <!-- New Visitor Form (Initially Hidden) -->
        <div id="new-visitor-section" class="hidden">
          <div class="space-y-4 md:space-y-6">
            <!-- Name & Relationship -->
            <div class="grid md:grid-cols-2 md:gap-6">
              <div class="relative z-0 w-full mb-5 group">
                  <input type="text" id="mr-v-name" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                  <label for="mr-v-name" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left">Name</label>
              </div>
              <div class="relative z-0 w-full mb-5 group">
                  <label for="mr-v-rel" class="block mb-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Relationship</label>
                  <select id="mr-v-rel" class="block w-full px-2 py-2 text-xs sm:text-sm text-gray-900 bg-white border-b-2 border-r border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700">
                    <option value="" selected disabled>Select Relationship</option>
                    <option>Mother</option>
                    <option>Father</option>
                    <option>Brother</option>
                    <option>Sister</option>
                    <option>Wife/Husband</option>
                  </select>
              </div>
            </div>
            
            <!-- Email & Phone -->
            <div class="grid md:grid-cols-2 md:gap-6">
              <div class="relative z-0 w-full mb-5 group">
                  <input type="email" id="mr-v-email" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                  <label for="mr-v-email" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left">Email</label>
              </div>
              <div class="relative z-0 w-full mb-5 group">
                <span class="absolute left-0 bottom-2.5 text-sm text-gray-500 dark:text-gray-400 select-none">+63</span>
                <input type="tel" id="mr-v-phone" class="peer block py-2.5 pl-12 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600" placeholder=" " />
                <label for="mr-v-phone" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 left-12 -z-10 origin-left">Phone</label>
              </div>
            </div>
            
            <!-- ID Type & ID Number -->
            <div class="grid md:grid-cols-2 md:gap-6">
              <div class="relative z-0 w-full mb-5 group">
                <label for="mr-v-id-type" class="block mb-2 text-sm font-medium text-gray-400">ID Type</label>
                <select id="mr-v-id-type" class="block w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-600">
                  <option value="" selected disabled>Select ID Type</option>
                  <option>Philippine National ID (PhilSys)</option>
                  <option>Driver's License</option>
                  <option>Passport</option>
                  <option>SSS ID</option>
                  <option>GSIS ID</option>
                  <option>UMID</option>
                  <option>PhilHealth ID</option>
                  <option>Voter's ID (COMELEC)</option>
                  <option>Postal ID</option>
                  <option>TIN ID</option>
                  <option>PRC ID</option>
                  <option>Senior Citizen ID</option>
                  <option>PWD ID</option>
                  <option>Student ID</option>
                  <option>Company ID</option>
                  <option>Barangay ID</option>
                </select>
              </div>
              <div class="relative z-0 w-full mb-5 group">
                  <input type="text" id="mr-v-id-number" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                  <label for="mr-v-id-number" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left">ID Number</label>
              </div>
            </div>
            
            <!-- Address -->
            <div class="relative z-0 w-full mb-5 group">
                <input type="text" id="mr-v-address" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                <label for="mr-v-address" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left">Address</label>
            </div>
            
            <!-- Photo -->
            <div class="relative z-0 w-full mb-5 group">
                <input type="file" id="mr-v-photo" accept="image/*" class="mt-2 block w-full text-sm text-gray-900 bg-transparent border-0 border-transparent appearance-none dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-transparent file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
                <label for="mr-v-photo" class="block mb-2 text-sm font-medium text-gray-400">Photo</label>
            </div>
          </div>
        </div>

        <!-- Visit Details (Always Visible) -->
        <div class="border-t border-gray-700 pt-5 mt-5">
          <h4 class="text-sm font-semibold text-white mb-4">Visit Details</h4>
          <div class="grid md:grid-cols-2 md:gap-6">
            <div class="relative z-0 w-full mb-5 group">
                <input type="datetime-local" id="mr-v-sched" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                <label for="mr-v-sched" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left">Schedule</label>
            </div>
            <div class="relative z-0 w-full mb-5 group">
                <input type="text" id="mr-v-reason" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " maxlength="500" />
                <label for="mr-v-reason" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left">Reason for Visit</label>
            </div>
          </div>
        </div>
      </form>
    </div>`;

  const swalInstance = await window.Swal.fire({
    title: '<span class="text-white">New Visitation Request</span>',
    html,
    background: '#111827',
    color: '#F9FAFB',
    showCancelButton: true,
    showConfirmButton: true,
    confirmButtonText: 'Submit Request',
    cancelButtonText: 'Cancel',
    heightAuto: false,
    scrollbarPadding: false,
    buttonsStyling: false,
    customClass: {
      popup: 'm-0 w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[56rem] p-4 sm:p-5 !rounded-2xl',
      confirmButton: 'inline-flex items-center justify-center px-3 py-2 sm:px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium cursor-pointer',
      cancelButton: 'inline-flex items-center justify-center px-3 py-2 sm:px-4 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs sm:text-sm font-medium ml-2 cursor-pointer'
    },
    didOpen: () => {
      // Toggle sections based on visitor type selection
      const existingRadio = document.getElementById('visitor-type-existing');
      const newRadio = document.getElementById('visitor-type-new');
      const existingSection = document.getElementById('existing-visitor-section');
      const newSection = document.getElementById('new-visitor-section');

      function toggleSections() {
        if (existingRadio?.checked) {
          existingSection?.classList.remove('hidden');
          newSection?.classList.add('hidden');
        } else {
          existingSection?.classList.add('hidden');
          newSection?.classList.remove('hidden');
        }
      }

      existingRadio?.addEventListener('change', toggleSections);
      newRadio?.addEventListener('change', toggleSections);
      toggleSections();
    },
    preConfirm: async () => {
      const visitorType = document.querySelector('input[name="visitor-type"]:checked')?.value;
      const sched = document.getElementById('mr-v-sched')?.value;
      const reason = document.getElementById('mr-v-reason')?.value.trim();

      if (!sched) {
        window.Swal.showValidationMessage('Schedule is required');
        return false;
      }

      let visitorId = null;
      let isNewVisitor = false;

      if (visitorType === 'existing') {
        const selectedVisitor = document.getElementById('select-visitor')?.value;
        if (!selectedVisitor) {
          window.Swal.showValidationMessage('Please select a visitor');
          return false;
        }
        visitorId = selectedVisitor;
      } else {
        // New visitor registration
        isNewVisitor = true;
        const name = document.getElementById('mr-v-name')?.value.trim();
        const rel = document.getElementById('mr-v-rel')?.value.trim();
        const email = document.getElementById('mr-v-email')?.value.trim();
        const phoneInput = document.getElementById('mr-v-phone')?.value.trim();
        const phoneDigits = phoneInput.replace(/\D+/g, '');
        const phone = phoneDigits ? `+63 ${phoneDigits}` : '';
        const idType = document.getElementById('mr-v-id-type')?.value.trim();
        const idNumber = document.getElementById('mr-v-id-number')?.value.trim();
        const address = document.getElementById('mr-v-address')?.value.trim();
        const photo = document.getElementById('mr-v-photo')?.files[0] || null;

        if (!name) {
          window.Swal.showValidationMessage('Visitor name is required');
          return false;
        }

        // Create new visitor
        const form = new FormData();
        form.append('inmate_id', String(inmate.id));
        form.append('name', name);
        if (rel) form.append('relationship', rel);
        if (email) form.append('email', email);
        if (phone) form.append('phone', phone);
        if (idType) form.append('id_type', idType);
        if (idNumber) form.append('id_number', idNumber);
        if (address) form.append('address', address);
        form.append('schedule', sched);
        if (reason) form.append('reason_for_visit', reason);
        if (photo) form.append('avatar', photo);

        try {
          let VisitorApiClient;
          ({ default: VisitorApiClient } = await import('./components/visitorClient.js'));
          const visitorApi = new VisitorApiClient();
          const response = await visitorApi.create(form);
          
          window.Swal.fire({
            title: 'Success!',
            text: 'Visitation request submitted successfully',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: '#111827',
            color: '#F9FAFB',
          }).then(() => {
            // After success modal closes, reload the entire page
            setTimeout(() => {
              window.location.reload();
            }, 500);
          });
          
          // Reload visitors and update statistics
          if (typeof loadBackendVisitors === 'function') {
            await loadBackendVisitors();
            // Trigger statistics update with animation
            if (typeof updateStatistics === 'function') {
              updateStatistics();
            }
          }
        } catch (error) {
          window.Swal.showValidationMessage(`Failed to submit request: ${error.message}`);
          return false;
        }
      }

      // If existing visitor, create visitation log
      if (!isNewVisitor && visitorId) {
        try {
          const response = await fetch('/api/visitation-logs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              visitor_id: visitorId,
              inmate_id: inmate.id,
              schedule: sched,
              reason_for_visit: reason,
              status: 2 // Pending
            })
          });

          if (!response.ok) throw new Error('Failed to create visitation request');

          window.Swal.fire({
            title: 'Success!',
            text: 'Visitation request submitted successfully',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: '#111827',
            color: '#F9FAFB',
          }).then(() => {
            // After success modal closes, reload the entire page
            setTimeout(() => {
              window.location.reload();
            }, 500);
          });

          if (typeof loadBackendVisitors === 'function') {
            await loadBackendVisitors();
            // Trigger statistics update with animation
            if (typeof updateStatistics === 'function') {
              updateStatistics();
            }
          }
        } catch (error) {
          window.Swal.showValidationMessage(`Failed to submit request: ${error.message}`);
          return false;
        }
      }

      return true;
    }
  });
}

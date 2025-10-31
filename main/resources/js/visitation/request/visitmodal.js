        // SweetAlert2 quick actions on visitor request buttons
        document.addEventListener('DOMContentLoaded', () => {
            const manualBtn = document.getElementById('btn-manual');
            const autoBtn = document.getElementById('btn-auto');
            const conjugalBtn = document.getElementById('btn-conjugal');
            
            // Get theme-aware colors from ThemeManager
            const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
            
            if (manualBtn) {
                manualBtn.addEventListener('click', async () => {
                    await window.Swal.fire({
                        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Manual Request</span>`,
                        text: 'Proceed to fill out the manual visitation request form?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Continue',
                        cancelButtonText: 'Cancel',
                        confirmButtonColor: '#3B82F6',
                        cancelButtonColor: isDarkMode ? '#111827' : '#6B7280',
                        backdrop: true,
                        background: isDarkMode ? '#0F172A' : '#FFFFFF',
                        color: isDarkMode ? '#F9FAFB' : '#111827'
                    });
                });
            }
            if (autoBtn) {
                autoBtn.addEventListener('click', async () => {
                    await window.Swal.fire({
                        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Automatic Request</span>`,
                        html: `<p class="text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}">We'll try to pre-fill your details based on previous visits. You can still edit everything.</p>`,
                        icon: 'info',
                        confirmButtonText: 'Try it',
                        confirmButtonColor: '#3B82F6',
                        backdrop: true,
                        background: isDarkMode ? '#0F172A' : '#FFFFFF',
                        color: isDarkMode ? '#F9FAFB' : '#111827'
                    });
                });
            }

            if (conjugalBtn) {
                conjugalBtn.addEventListener('click', async () => {
                  await window.Swal.fire({
                    title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Conjugal Visit Request</span>`,
                    html: `
                      <div class="text-left space-y-3">
                        <p class="text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}">
                          Conjugal visits are exclusively for legally recognized <span class="font-semibold ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}">Wife</span> or <span class="font-semibold ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}">Husband</span>, or partners in a live-in relationship of at least <span class="font-semibold ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}">5 years</span>.
                        </p>
                        <div class="text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-600'} space-y-2">
                          <p class="font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Requirements:</p>
                          <ul class="list-disc pl-5 space-y-1">
                            <li>Live-in Cohabitation Certificate issued by Barangay Official</li>
                            <li>Marriage Contract (if legally married)</li>
                          </ul>
                        </div>
                        <div class="text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-600'} space-y-2">
                          <p class="font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Visit Details:</p>
                          <ul class="list-disc pl-5 space-y-1">
                            <li>Time limit: 30 to 45 minutes (can extend to 1 hour)</li>
                            <li>Available for the whole day</li>
                            <li>₱50 payment required per session</li>
                            <li>No limit on number of visits per month</li>
                          </ul>
                        </div>
                        <p class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} italic">All visits are subject to facility rules on privacy, safety, and conduct.</p>
                      </div>
                    `,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Proceed',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#EC4899', // Tailwind pink-500
                    cancelButtonColor: isDarkMode ? '#111827' : '#6B7280',
                    backdrop: true,
                    background: isDarkMode ? '#0F172A' : '#FFFFFF',
                    color: isDarkMode ? '#F9FAFB' : '#111827'
                  });
                });
              }
        });
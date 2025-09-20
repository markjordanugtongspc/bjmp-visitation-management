
        // SweetAlert2 quick actions on visitor request buttons
        document.addEventListener('DOMContentLoaded', () => {
            const manualBtn = document.getElementById('btn-manual');
            const autoBtn = document.getElementById('btn-auto');
            const conjugalBtn = document.getElementById('btn-conjugal');
            if (manualBtn) {
                manualBtn.addEventListener('click', async () => {
                    await window.Swal.fire({
                        title: 'Manual Request',
                        text: 'Proceed to fill out the manual visitation request form?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Continue',
                        cancelButtonText: 'Cancel',
                        confirmButtonColor: '#3B82F6',
                        cancelButtonColor: '#111827',
                        backdrop: true,
                        background: '#0F172A',
                        color: '#F9FAFB'
                    });
                });
            }
            if (autoBtn) {
                autoBtn.addEventListener('click', async () => {
                    await window.Swal.fire({
                        title: 'Automatic Request',
                        html: '<p class="text-sm text-white">We\'ll try to pre-fill your details based on previous visits. You can still edit everything.</p>',
                        icon: 'info',
                        confirmButtonText: 'Try it',
                        confirmButtonColor: '#3B82F6',
                        backdrop: true,
                        background: '#0F172A',
                        color: '#F9FAFB'
                    });
                });
            }

            if (conjugalBtn) {
                conjugalBtn.addEventListener('click', async () => {
                  await window.Swal.fire({
                    title: 'Conjugal Visit Request',
                    html: `
                      <div class="text-left space-y-3">
                        <p class="text-sm text-white">
                          Conjugal visits are exclusively for legally recognized <span class="font-semibold text-pink-400">Wife</span> or <span class="font-semibold text-pink-400">Husband</span>, or partners in a live-in relationship of at least <span class="font-semibold text-pink-400">5 years</span>.
                        </p>
                        <div class="text-sm text-gray-200 space-y-2">
                          <p class="font-medium text-gray-300">Requirements:</p>
                          <ul class="list-disc pl-5 space-y-1">
                            <li>Live-in Cohabitation Certificate issued by Barangay Official</li>
                            <li>Marriage Contract (if legally married)</li>
                          </ul>
                        </div>
                        <div class="text-sm text-gray-200 space-y-2">
                          <p class="font-medium text-gray-300">Visit Details:</p>
                          <ul class="list-disc pl-5 space-y-1">
                            <li>Time limit: 30 to 45 minutes (can extend to 1 hour)</li>
                            <li>Available for the whole day</li>
                            <li>₱50 payment required per session</li>
                            <li>No limit on number of visits per month</li>
                          </ul>
                        </div>
                        <p class="text-xs text-gray-400 italic">All visits are subject to facility rules on privacy, safety, and conduct.</p>
                      </div>
                    `,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Proceed',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#EC4899', // Tailwind pink-500
                    cancelButtonColor: '#111827', // Tailwind gray-900
                    backdrop: true,
                    background: '#0F172A', // Tailwind slate-900
                    color: '#F9FAFB' // Tailwind gray-50
                  });
                });
              }
        });
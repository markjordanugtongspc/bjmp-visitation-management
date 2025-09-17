
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
                          <div class="text-left space-y-2">
                            <p class="text-sm text-white">Conjugal visits are subject to facility policies and approval.</p>
                            <ul class="list-disc pl-5 text-sm text-gray-200 space-y-1">
                              <li>Requires identity verification and clearance.</li>
                              <li>Schedule availability is limited; processing may take longer.</li>
                              <li>All rules on privacy, safety, and conduct strictly apply.</li>
                            </ul>
                          </div>
                        `,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Proceed',
                        cancelButtonText: 'Cancel',
                        confirmButtonColor: '#EC4899', // pink-500
                        cancelButtonColor: '#111827',
                        backdrop: true,
                        background: '#0F172A',
                        color: '#F9FAFB'
                    });
                });
            }
        });
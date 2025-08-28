
        // SweetAlert2 quick actions on visitor request buttons
        document.addEventListener('DOMContentLoaded', () => {
            const manualBtn = document.getElementById('btn-manual');
            const autoBtn = document.getElementById('btn-auto');
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
        });
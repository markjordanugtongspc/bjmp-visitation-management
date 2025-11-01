// Bump Message System for Assistant Warden
class BumpMessageSystem {
    constructor() {
        this.init();
    }

    init() {
        // Only initialize for Assistant Warden (role_id = 2)
        const userRole = document.querySelector('[data-user-role]')?.getAttribute('data-user-role');
        if (userRole !== '2') return;

        this.setupEventListeners();
        this.loadWardens();
        this.setupCharacterCounter();
    }

    setupEventListeners() {
        const form = document.getElementById('bump-message-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    setupCharacterCounter() {
        const textarea = document.getElementById('message-content');
        const charCount = document.getElementById('char-count');
        
        if (textarea && charCount) {
            textarea.addEventListener('input', () => {
                const length = textarea.value.length;
                charCount.textContent = length;
                
                // Change color when approaching limit
                if (length > 900) {
                    charCount.className = 'text-xs text-red-500 dark:text-red-400 text-right';
                } else if (length > 800) {
                    charCount.className = 'text-xs text-yellow-600 dark:text-yellow-400 text-right';
                } else {
                    charCount.className = 'text-xs text-gray-500 dark:text-gray-400 text-right';
                }
            });
        }
    }

    async loadWardens() {
        try {
            const response = await fetch('/api/users/wardens', {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const wardens = await response.json();
                this.populateWardenSelect(wardens);
            }
        } catch (error) {
            console.error('Error loading wardens:', error);
            this.showError('Failed to load wardens list');
        }
    }

    populateWardenSelect(wardens) {
        const select = document.getElementById('recipient-id');
        if (!select) return;

        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        wardens.forEach(warden => {
            const option = document.createElement('option');
            option.value = warden.user_id;
            option.textContent = warden.full_name || warden.name;
            select.appendChild(option);
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalContent = submitButton.innerHTML;

        try {
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
            `;

            const response = await fetch('/api/warden-messages', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipient_id: parseInt(formData.get('recipient_id')),
                    message: formData.get('message'),
                    priority: formData.get('priority') || 'normal'
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.showSuccess('Message sent successfully!');
                form.reset();
                document.getElementById('char-count').textContent = '0';
                
                // Close modal after delay
                setTimeout(() => {
                    const modal = form.closest('[x-data]');
                    if (modal && modal.__x) {
                        modal.__x.$data.open = false;
                    }
                }, 1500);
            } else {
                this.showError(data.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.showError('Network error. Please try again.');
        } finally {
            // Restore button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalContent;
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
        
        // Style based on type
        if (type === 'success') {
            notification.className += ' bg-green-500 text-white';
        } else if (type === 'error') {
            notification.className += ' bg-red-500 text-white';
        } else {
            notification.className += ' bg-blue-500 text-white';
        }

        notification.innerHTML = `
            <div class="flex items-center gap-2">
                ${type === 'success' ? 
                    '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>' :
                    '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
                }
                <span class="text-sm font-medium">${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
            notification.classList.add('translate-x-0');
        }, 100);

        // Remove after delay
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BumpMessageSystem();
});

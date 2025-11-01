// Warden Notifications System - Handles incoming messages from Assistant Warden
class WardenNotificationSystem {
    constructor() {
        this.init();
    }

    init() {
        // Only initialize for Warden (role_id = 1)
        const userRole = document.querySelector('[data-user-role]')?.getAttribute('data-user-role');
        if (userRole !== '1') return;

        this.setupEventListeners();
        this.loadNotifications();
        this.startPolling();
    }

    setupEventListeners() {
        // Refresh notifications when bell is clicked
        const notificationBell = document.querySelector('[x-data] button[aria-label="Notifications"]');
        if (notificationBell) {
            notificationBell.addEventListener('click', () => {
                this.loadNotifications();
            });
        }

        // Clear all notifications button
        const clearAllButton = document.getElementById('clear-all-notifications');
        if (clearAllButton) {
            clearAllButton.addEventListener('click', () => this.clearAllNotifications());
        }
    }

    async loadNotifications() {
        try {
            const response = await fetch('/api/warden-messages', {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const messages = await response.json();
                this.displayNotifications(messages);
                this.updateUnreadCount();
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    async updateUnreadCount() {
        try {
            const response = await fetch('/api/warden-messages/unread-count', {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateBadge(data.count);
            }
        } catch (error) {
            console.error('Error updating unread count:', error);
        }
    }

    updateBadge(count) {
        const badge = document.getElementById('notification-badge');
        const countSpan = document.getElementById('notification-count');
        
        if (!badge || !countSpan) return;

        if (count > 0) {
            badge.style.display = 'flex';
            countSpan.textContent = count > 99 ? '99+' : count;
        } else {
            badge.style.display = 'none';
        }
    }

    displayNotifications(messages) {
        const notificationList = document.getElementById('notification-items');
        const loadingState = document.getElementById('notification-loading');
        const emptyState = document.getElementById('notification-empty');
        const viewAllLink = document.getElementById('view-all-notifications');
        
        if (!notificationList) return;

        // Hide loading state
        if (loadingState) {
            loadingState.style.display = 'none';
        }

        // Clear existing notifications
        notificationList.innerHTML = '';

        // Filter messages (show only unread first, then recent)
        const sortedMessages = messages.sort((a, b) => {
            // Unread first
            if (a.is_read !== b.is_read) {
                return a.is_read ? 1 : -1;
            }
            // Then by date (newest first)
            return new Date(b.created_at) - new Date(a.created_at);
        });

        if (sortedMessages.length === 0) {
            // Show empty state
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            // Hide "View all" link when no notifications
            if (viewAllLink) {
                viewAllLink.style.display = 'none';
            }
            return;
        }

        // Hide empty state
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        // Show/hide "View all notifications" link based on count
        // Only show if there are more than 3 notifications (4+)
        if (viewAllLink) {
            if (sortedMessages.length > 3) {
                viewAllLink.style.display = 'inline-block';
            } else {
                viewAllLink.style.display = 'none';
            }
        }

        // Display messages (limit to 10 in dropdown)
        sortedMessages.slice(0, 10).forEach(message => {
            const notificationEl = this.createNotificationElement(message);
            notificationList.appendChild(notificationEl);
        });
    }

    createNotificationElement(message) {
        const div = document.createElement('div');
        const isUnread = !message.is_read;
        const priorityColors = {
            normal: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
            high: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
            urgent: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        };
        
        const priorityBadges = {
            normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            high: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            urgent: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
        };

        div.className = `px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 ${priorityColors[message.priority]} ${isUnread ? 'font-semibold' : ''}`;
        
        div.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                        <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            ${message.sender?.full_name || 'Assistant Warden'}
                        </p>
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityBadges[message.priority]}">
                            ${message.priority}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        ${message.message}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-500">
                        ${this.formatTime(message.created_at)}
                    </p>
                </div>
                ${isUnread ? '<div class="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>' : ''}
            </div>
        `;

        // Add click handler to mark as read
        if (isUnread) {
            div.addEventListener('click', () => this.markAsRead(message.id));
        }

        return div;
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    async markAsRead(messageId) {
        try {
            const response = await fetch(`/api/warden-messages/${messageId}/read`, {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Refresh notifications
                this.loadNotifications();
            }
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    }

    startPolling() {
        // Poll for new messages every 30 seconds
        setInterval(() => {
            this.updateUnreadCount();
        }, 30000);
    }

    async clearAllNotifications() {
        // Mark all messages as read in backend
        try {
            const response = await fetch('/api/warden-messages/mark-all-read', {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                // Clear the notification display after successful backend update
                const notificationItems = document.getElementById('notification-items');
                const emptyState = document.getElementById('notification-empty');
                const badge = document.getElementById('notification-badge');
                const viewAllLink = document.getElementById('view-all-notifications');
                
                if (notificationItems) {
                    notificationItems.innerHTML = '';
                }
                
                if (emptyState) {
                    emptyState.style.display = 'block';
                }
                
                if (badge) {
                    badge.style.display = 'none';
                }
                
                // Hide "View all" link when cleared
                if (viewAllLink) {
                    viewAllLink.style.display = 'none';
                }
                
                // Show success message with count
                this.showClearNotification(data.count);
            } else {
                console.error('Error marking all messages as read');
                this.showErrorNotification();
            }
        } catch (error) {
            console.error('Error marking all messages as read:', error);
            this.showErrorNotification();
        }
    }

    showClearNotification(count = 0) {
        const message = count > 0 
            ? `${count} message${count > 1 ? 's' : ''} marked as read`
            : 'Notifications cleared';
            
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-green-500 text-white transform transition-all duration-300 translate-x-full';
        
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-sm font-medium">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
            notification.classList.add('translate-x-0');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    showErrorNotification() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-red-500 text-white transform transition-all duration-300 translate-x-full';
        
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span class="text-sm font-medium">Failed to mark messages as read</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
            notification.classList.add('translate-x-0');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new WardenNotificationSystem();
});

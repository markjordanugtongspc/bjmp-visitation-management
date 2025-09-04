/*
 * Edit Profile Modal
 * - Uses SweetAlert2 to create a profile editing modal
 * - Handles profile image upload preview
 * - Updates user name in UI
 */

document.addEventListener('DOMContentLoaded', function() {
    // Find all edit profile buttons across different pages
    const editProfileBtns = [
        document.getElementById('edit-profile-btn'),
        document.getElementById('edit-profile-btn-admin'),
        document.getElementById('edit-profile-btn-template'),
        document.getElementById('mobile-edit-profile-btn')
    ].filter(Boolean);
    
    const showProfileModal = () => {
        Swal.fire({
            title: 'Edit Profile',
            html: `
                <div class="text-left">
                    <div class="flex justify-center mb-4">
                        <div class="relative group">
                            <div class="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                                <img id="profile-preview" src="${getUserProfileImage()}" class="h-full w-full object-cover" alt="Profile Photo">
                                <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                    </svg>
                                </div>
                            </div>
                            <input type="file" id="profile-upload" class="hidden" accept="image/*">
                        </div>
                    </div>
                    <label class="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Full Name</label>
                    <input id="profile-name" type="text" class="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 mb-3" value="${getUserName()}">
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: '#3B82F6',
            cancelButtonColor: '#111827',
            background: '#0F172A',
            color: '#F9FAFB',
            customClass: {
                popup: 'rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
                confirmButton: 'bg-brand-button-primary-light hover:bg-brand-button-hover-light dark:bg-brand-button-primary-dark dark:hover:bg-brand-button-hover-dark text-white px-4 py-2 rounded-lg cursor-pointer',
                cancelButton: 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg ml-2 cursor-pointer',
            },
            didOpen: () => {
                // Setup image upload functionality
                const profileUpload = document.getElementById('profile-upload');
                const profilePreview = document.getElementById('profile-preview');
                const profileContainer = profilePreview.closest('.relative');
                
                profileContainer.addEventListener('click', () => {
                    profileUpload.click();
                });
                
                profileUpload.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            profilePreview.src = event.target.result;
                        };
                        reader.readAsDataURL(e.target.files[0]);
                    }
                });
            },
            preConfirm: () => {
                const name = document.getElementById('profile-name').value.trim();
                if (!name) {
                    Swal.showValidationMessage('Name is required');
                    return false;
                }
                
                // Here you would normally send the data to the server
                // For now we'll just show a success message
                return { name };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Here you would handle the server response
                Swal.fire({
                    title: 'Profile Updated!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#0F172A',
                    color: '#F9FAFB'
                });
                
                // Update the name in the UI (in a real app, you'd fetch from the server)
                const newName = result.value.name;
                // This is just for demonstration - in a real app you'd update after server confirmation
                updateUserNameInUI(newName);
            }
        });
    };
    
    // Helper function to get user name from the UI
    function getUserName() {
        const userNameElements = document.querySelectorAll('[data-user-name-target]');
        if (userNameElements.length > 0) {
            return userNameElements[0].textContent.trim();
        }
        return '';
    }
    
    // Helper function to get user profile image
    function getUserProfileImage() {
        // In a real app, you'd get this from the user's profile
        // For now, we'll use a placeholder based on the user's name
        const userName = getUserName();
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
    }
    
    // Helper function to update user name in UI
    function updateUserNameInUI(name) {
        document.querySelectorAll('[data-user-name-target]').forEach(el => {
            el.textContent = name;
        });
    }
    
    // Attach click handler to all edit profile buttons
    editProfileBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', showProfileModal);
        }
    });
});

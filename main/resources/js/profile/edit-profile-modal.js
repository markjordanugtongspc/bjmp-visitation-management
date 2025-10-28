/*
 * Edit Profile Modal
 * - Uses SweetAlert2 to create a profile editing modal
 * - Handles profile image upload preview
 * - Updates user name in UI and saves to cookies
 * - Responsive design for all screen sizes
 */

// Global function for saving profile changes - accessible from inline onclick handlers
function saveProfileChanges() {
    const name = document.getElementById('profile-name')?.value.trim();
    const bio = document.getElementById('profile-bio')?.value.trim();
    const profileUpload = document.getElementById('profile-upload');
    
    if (!name) {
        Swal.showValidationMessage('Name is required');
        return;
    }
    
    // Save name and bio to cookies (keeping this functionality)
    setCookie('user_name', name, 30);
    setCookie('user_bio', bio || '', 30);
    
    // Update UI
    updateUserNameInUI(name);
    
    // Handle profile picture upload if a new file was selected
    if (profileUpload && profileUpload.files && profileUpload.files[0]) {
        uploadProfilePicture(profileUpload.files[0]);
    } else {
        // No file upload, just show success message
        showSuccessMessage();
    }
}

// Function to upload profile picture to server
function uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append('profile_picture', file);
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
    
    // Show loading state
    Swal.fire({
        title: 'Uploading...',
        text: 'Please wait while we upload your profile picture',
        allowOutsideClick: false,
        showConfirmButton: false,
        background: '#0F172A',
        color: '#F9FAFB'
    });
    
    fetch('/profile/upload-picture', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update profile image in UI
            updateProfileImageInUI(data.image_url);
            showSuccessMessage();
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    })
    .catch(error => {
        console.error('Upload error:', error);
        Swal.fire({
            title: 'Upload Failed',
            text: error.message || 'Failed to upload profile picture. Please try again.',
            icon: 'error',
            background: '#0F172A',
            color: '#F9FAFB'
        });
    });
}

// Function to show success message
function showSuccessMessage() {
    Swal.close(); // Close the edit modal first
    
    setTimeout(() => {
        Swal.fire({
            title: 'Profile Updated!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            background: '#0F172A',
            color: '#F9FAFB'
        });
    }, 100);
}

document.addEventListener('DOMContentLoaded', function() {
    // Find all edit profile buttons across different pages
    const editProfileBtns = [
        document.getElementById('edit-profile-btn'),
        document.getElementById('edit-profile-btn-admin'),
        document.getElementById('edit-profile-btn-template'),
        document.getElementById('mobile-edit-profile-btn')
    ].filter(Boolean);
    
    // Load user data from server on page load
    loadUserDataFromServer();
    
    const showProfileModal = () => {
        // Get cover photo from cookies or use default (keeping this functionality)
        const coverPhoto = getCookie('user_cover_photo') || 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ';
        
        Swal.fire({
            title: 'Edit Profile',
            html: 
                '<div class="max-w-2xl mx-auto px-4 sm:px-0 sm:max-w-md md:max-w-md lg:max-w-md xl:max-w-md bg-white dark:bg-gray-900 shadow-xl rounded-lg text-gray-900 dark:text-gray-100" id="profile-card">' +
                    '<div class="rounded-t-lg h-40 overflow-hidden">' +
                        '<img id="cover-preview" class="object-cover object-center w-full" src="' + coverPhoto + '" alt="Cover Photo">' +
                        '<input type="file" id="cover-upload" class="hidden" accept="image/*">' +
                    '</div>' +
                    '<div class="mx-auto w-32 h-32 relative -mt-16 border-4 border-white dark:border-gray-800 rounded-full overflow-hidden">' +
                        '<img id="profile-preview" src="' + getUserProfileImage() + '" class="object-cover object-center h-32 w-32" alt="Profile Photo">' +
                        '<div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-full">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">' +
                                '<path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>' +
                            '</svg>' +
                        '</div>' +
                        '<input type="file" id="profile-upload" class="hidden" accept="image/*">' +
                    '</div>' +
                    '<div class="text-center mt-4">' +
                        '<input id="profile-name" type="text" class="text-center text-xl font-semibold bg-transparent border-b-2 border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 px-2 py-1 w-full max-w-[250px]" value="' + getUserName() + '">' +
                    '</div>' +
                    '<div class="text-center mt-2">' +
                        '<div class="text-center text-sm text-gray-600 dark:text-gray-400 w-full max-w-[250px] mx-auto">' +
                            'Your Profile Dashboard' +
                        '</div>' +
                    '</div>' +
                    '<div class="text-center mt-2">' +
                        '<textarea id="profile-bio" class="text-center text-sm text-gray-700 dark:text-gray-300 bg-transparent border border-gray-300 dark:border-gray-700 rounded-md p-2 w-full max-w-[300px] h-20 resize-none focus:outline-none focus:border-blue-500 dark:focus:border-blue-400" placeholder="Write a short bio...">' + (getCookie('user_bio') || '') + '</textarea>' +
                    '</div>' +
                    '<div class="py-4 mt-2 text-gray-700 dark:text-gray-300 flex items-center justify-around">' +
                        '<div class="flex flex-col items-center">' +
                            '<span class="text-xl font-bold text-blue-600 dark:text-blue-400">218</span>' +
                            '<span class="text-xs text-gray-500 dark:text-gray-400">Inmates</span>' +
                        '</div>' +
                        '<div class="flex flex-col items-center">' +
                            '<span class="text-xl font-bold text-blue-600 dark:text-blue-400">64</span>' +
                            '<span class="text-xs text-gray-500 dark:text-gray-400">Visitations</span>' +
                        '</div>' +
                        '<div class="flex flex-col items-center">' +
                            '<span class="text-xl font-bold text-blue-600 dark:text-blue-400">23</span>' +
                            '<span class="text-xs text-gray-500 dark:text-gray-400">Pending</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="p-4 border-t border-gray-200 dark:border-gray-700 mx-0 sm:mx-4 mt-2 flex flex-col sm:flex-row gap-3">' +
                        '<button type="button" id="save-profile-btn" onclick="saveProfileChanges()" class="w-full sm:flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2.5 px-5 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg cursor-pointer">Save Changes</button>' +
                        '<button type="button" id="cancel-profile-btn" onclick="Swal.close()" class="w-full sm:flex-1 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2.5 px-5 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg cursor-pointer">Cancel</button>' +
                    '</div>' +
                '</div>',
            showCancelButton: false,
            showConfirmButton: false,
            background: 'transparent',
            width: '100%',
            customClass: {
                popup: 'bg-transparent',
                container: 'p-0 sm:p-4'
            },
            didOpen: () => {
                // Setup profile image upload functionality
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
                
                // Setup cover photo upload functionality
                const coverUpload = document.getElementById('cover-upload');
                const coverPreview = document.getElementById('cover-preview');
                
                // Since the change cover button is commented out, we'll make the cover photo itself clickable
                coverPreview.style.cursor = 'pointer';
                coverPreview.addEventListener('click', () => {
                    coverUpload.click();
                });
                
                coverUpload.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            coverPreview.src = event.target.result;
                        };
                        reader.readAsDataURL(e.target.files[0]);
                    }
                });
                
                // Setup save and cancel buttons
                const saveBtn = document.getElementById('save-profile-btn');
                const cancelBtn = document.getElementById('cancel-profile-btn');
                
                if (saveBtn) {
                    saveBtn.addEventListener('click', saveProfileChanges);
                }
                
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        Swal.close();
                    });
                }
            }
        });
    };
    
    // Attach click handler to all edit profile buttons
    editProfileBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', showProfileModal);
        }
    });
});

// Helper function to get user name from server data or UI
function getUserName() {
    // First try to get from data attribute (set by server)
    const userDataElement = document.querySelector('[data-user-name]');
    if (userDataElement && userDataElement.getAttribute('data-user-name')) {
        return userDataElement.getAttribute('data-user-name');
    }
    
    // Fallback to UI elements
    const userNameElements = document.querySelectorAll('[data-user-name-target]');
    if (userNameElements.length > 0) {
        return userNameElements[0].textContent.trim();
    }
    return '';
}

// Helper function to get user profile image from server data or generate one
function getUserProfileImage() {
    // Get profile image URL from data attribute
    const profileUrlElement = document.querySelector('[data-user-profile-url]');
    if (profileUrlElement && profileUrlElement.getAttribute('data-user-profile-url')) {
        return profileUrlElement.getAttribute('data-user-profile-url');
    }
    
    // Generate placeholder based on user name
    const userName = getUserName();
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName) + '&background=random';
}

// Helper function to update user name in UI
function updateUserNameInUI(name) {
    document.querySelectorAll('[data-user-name-target]').forEach(el => {
        el.textContent = name;
    });
}

// Helper function to update profile image in UI
function updateProfileImageInUI(imageUrl) {
    // Update the data attribute for future reference
    const profileUrlElement = document.querySelector('[data-user-profile-url]');
    if (profileUrlElement) {
        profileUrlElement.setAttribute('data-user-profile-url', imageUrl);
    }
    
    // Update all profile images in the header
    document.querySelectorAll('span[aria-label="Profile image"]').forEach(span => {
        // Check if we already have an img element
        let img = span.querySelector('img');
        const svg = span.querySelector('svg');
        
        if (img) {
            // Update existing image
            img.src = imageUrl;
        } else if (svg) {
            // Create a new image element
            img = document.createElement('img');
            img.src = imageUrl;
            img.className = 'h-full w-full object-cover rounded-full';
            img.alt = 'Profile';
            
            // Hide the SVG but don't remove it
            svg.style.display = 'none';
            span.appendChild(img);
        }
    });
}

// Cookie helper functions
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
}

// Load user data from server
function loadUserDataFromServer() {
    fetch('/profile/user-data', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update user name in UI
            updateUserNameInUI(data.user.full_name);
            
            // Update profile image in UI
            updateProfileImageInUI(data.user.profile_picture_url);
            
            // Store user data in data attributes for future reference
            const userMenuButton = document.querySelector('[data-user-menu]');
            if (userMenuButton) {
                userMenuButton.setAttribute('data-user-name', data.user.full_name);
                userMenuButton.setAttribute('data-user-profile-url', data.user.profile_picture_url);
            }
        }
    })
    .catch(error => {
        console.error('Failed to load user data:', error);
        // Fallback to existing UI data
        loadUserDataFromCookies();
    });
}

// Load user data from cookies and update UI (fallback)
function loadUserDataFromCookies() {
    const userName = getCookie('user_name');
    if (userName) {
        updateUserNameInUI(userName);
    }
    
    // Profile image is now loaded from server data via data attributes
    // No need to load from cookies
}

// Ensure the save handler is available to inline onclick in generated modal HTML
// This is important when the script is bundled as an ES module
if (typeof window !== 'undefined') {
    window.saveProfileChanges = saveProfileChanges;
}
<!DOCTYPE html>
<html lang="en" class="bg-white dark:bg-slate-900">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login</title>

  <!-- Favicon -->
  <link rel="icon" href="{{ asset('images/logo/bjmp_logo.png') }}" type="image/png">
    
    @vite(['resources/css/app.css', 'resources/js/app.js', 'resources/js/auth/slideshow.js', 'resources/js/auth/terms-consent.js']) <!--- Kani gamiton aron ma import ang tailwind css nga naka built in -->
  <!-- <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script> -->
</head>
<body class="bg-gray-100 dark:bg-gray-900">
 <a href="{{ url('/') }}" aria-label="Close overlay" class="fixed inset-0 z-10 block bg-transparent"></a> <!-- Clickable aron mo adtog home -->
  <div class="min-h-screen flex items-center justify-center py-10 px-4 bg-gray-100 dark:bg-gray-900">
    <div class="relative z-20 w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-5xl xl:max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden lg:min-h-[34rem]">
      
      <!-- Left Side Form -->
      <div class="p-8 lg:p-12 flex flex-col justify-center items-center h-full min-h-[500px] bg-white dark:bg-gray-800">
        <div class="w-full max-w-sm mx-auto text-center">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-4">Log In</h2>

          <!-- Session Status -->
          @if (session('status'))
          <div class="mt-4 text-sm text-green-600">{{ session('status') }}</div>
          @endif

          <!-- Error Message (for unauthorized access or login required) -->
          @if (session('error'))
          <div class="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {{ session('error') }}
          </div>
          @endif

          <form method="POST" action="{{ route('login') }}" class="mt-6">
            @csrf
            
            <!-- Email Address -->
            <div class="relative mt-2">
              <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <!-- Email Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                  <path d="M1.5 8.67v8.58A2.25 2.25 0 0 0 3.75 19.5h16.5a2.25 2.25 0 0 0 2.25-2.25V8.67l-8.548 4.59a3.75 3.75 0 0 1-3.404 0L1.5 8.67Z"/>
                  <path d="M22.5 6.908V6.75A2.25 2.25 0 0 0 20.25 4.5H3.75A2.25 2.25 0 0 0 1.5 6.75v.158l9.318 5.004a2.25 2.25 0 0 0 2.064 0L22.5 6.908Z"/>
                </svg>
              </span>
              <input id="email" name="email" type="email" required autofocus autocomplete="username" value="{{ old('email') }}"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pl-10 pr-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Enter your username or email...">
            </div>
            @error('email')
            <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
            @enderror

            <!-- Password -->
            <div class="relative mt-2">
              <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <!-- Password Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                  <path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25V9A2.25 2.25 0 0 0 4.5 11.25v7.5A2.25 2.25 0 0 0 6.75 21h10.5A2.25 2.25 0 0 0 19.5 18.75v-7.5A2.25 2.25 0 0 0 17.25 9V6.75A5.25 5.25 0 0 0 12 1.5Zm3.75 7.5V6.75a3.75 3.75 0 1 0-7.5 0V9h7.5Z" clip-rule="evenodd"/>
                </svg>
              </span>
              <input id="password" name="password" type="password" required autocomplete="current-password"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pl-10 pr-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Enter your password...">
            </div>
            @error('password')
            <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
            @enderror

            <!-- Terms + Remember -->
            <div class="mt-4 flex items-center justify-between">
              <label class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input type="checkbox" class="size-4 rounded border-gray-300 dark:border-gray-700 text-blue-500 focus:ring-blue-500 cursor-pointer">
                  <span>I agree to the <a href="#" class="text-blue-500 hover:text-blue-400">Terms and Conditions</a></span>
              </label>
              <label class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input id="remember" name="remember" type="checkbox" {{ old('remember') ? 'checked' : '' }} class="size-4 rounded border-gray-300 dark:border-gray-700 text-blue-500 focus:ring-blue-500">
                <span>Remember me</span>
              </label>
            </div>

            <!-- Submit -->
            <div class="mt-6 flex justify-center">
              <button type="submit" class="w-full max-w-sm justify-center rounded-lg px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer">
                LOGIN
              </button>
            </div>

            <!-- Links -->
            <div class="mt-6 flex items-center justify-end w-full">
              <!-- @if (Route::has('register'))
              <a href="{{ route('register') }}" class="inline-block border-b border-black pb-0.5 text-sm text-gray-900 dark:text-gray-50 hover:text-gray-900 dark:hover:text-gray-50 transition-colors">Sign Up</a>
              @endif -->
              @if (Route::has('password.request'))
              <a href="{{ route('password.request') }}" class="inline-block border-b border-black pb-0.5 text-sm text-gray-900 dark:text-gray-50 hover:text-gray-900 dark:hover:text-gray-50 transition-colors">Forgot Password?</a>
              @endif
            </div>
          </form>
        </div>
      </div>

      <!-- Right Side Info Section with Background Slideshow -->
      <div class="hidden lg:block relative overflow-hidden">
        <!-- Background Slideshow - Images managed by slideshow.js -->
        <div id="auth-slideshow" 
             data-bg="true"
             class="absolute inset-0 transition-opacity duration-1000 ease-in-out">
          <!-- Dark overlay with gradient -->
          <div class="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-800/40 to-gray-900/40 backdrop-blur-sm pointer-events-none hero-overlay"></div>
        </div>
        
        <!-- Content overlay -->
        <div class="relative z-10 h-full flex flex-col items-center justify-center p-10 text-white">
          <div class="max-w-md text-center">
            <h3 class="text-2xl font-bold mb-4">BJMP Iligan City</h3>
            <p class="text-sm opacity-90 mb-6">
              Empowered by cutting-edge facial recognition, the BJMP jail management system ensures seamless security, precise PDL monitoring, and a smarter, more efficient visitation experience.
            </p>
            
            <!-- Slideshow Controls (bottom overlay; ensure parent is relative) -->
            <div class="absolute bottom-5 left-3 right-0 w-full flex items-center justify-center gap-3">
              <!-- Previous -->
              <button type="button" data-prev class="flex items-center justify-center text-white border border-white rounded-full p-2 bg-transparent cursor-pointer" aria-label="Previous slide">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            
              <!-- Progress / indicators - dynamically generated by slideshow.js -->
              <div id="slideshow-indicators" class="flex items-center gap-2" aria-label="Slide progress" style="width: 180px;">
                <!-- Indicators will be generated by JavaScript -->
              </div>
            
              <!-- Next -->
              <button type="button" data-next class="flex items-center justify-center text-white border border-white rounded-full p-2 bg-transparent cursor-pointer" aria-label="Next slide">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // Wait for ThemeManager and SweetAlert2 to be available
      const checkDependencies = setInterval(() => {
        if (window.ThemeManager && window.Swal) {
          clearInterval(checkDependencies);
          checkForInactiveAccountError();
          checkForUnauthorizedAccessError();
        }
      }, 100);

      function checkForInactiveAccountError() {
        // Check for error message in email field (server-rendered validation errors)
        const emailError = document.querySelector('p.text-red-600, p[class*="error"]');
        if (emailError) {
          const errorText = emailError.textContent.trim();
          if (errorText.includes('deactivated') || errorText.includes('inactive')) {
            // Show SweetAlert2 with ThemeManager theming
            const config = window.ThemeManager.getSwalConfig({
              icon: 'error',
              title: 'Account Inactive',
              text: 'You cannot login because your account has been marked as inactive or you have resigned. Please contact your administrator.',
              confirmButtonText: 'OK',
              confirmButtonColor: window.ThemeManager.getPalette().danger
            });
            
            window.Swal.fire(config);
            
            // Hide the error message since we're showing it in SweetAlert2
            emailError.style.display = 'none';
          }
        }
      }

      function checkForUnauthorizedAccessError() {
        // Check for session error message (from unauthorized access redirect)
        const errorDiv = document.querySelector('.bg-red-50, .bg-red-900\\/20');
        if (errorDiv) {
          const errorText = errorDiv.textContent.trim();
          if (errorText && (errorText.includes('Please login') || errorText.includes('permission') || errorText.includes('access'))) {
            // Show SweetAlert2 with ThemeManager theming
            const isDarkMode = window.ThemeManager.isDarkMode();
            window.Swal.fire({
              icon: 'warning',
              title: `<span class="${isDarkMode ? 'text-white' : 'text-gray-900'}">Access Denied</span>`,
              text: errorText,
              confirmButtonText: 'OK',
              background: isDarkMode ? '#111827' : '#FFFFFF',
              color: isDarkMode ? '#F9FAFB' : '#111827',
              confirmButtonColor: window.ThemeManager.getPalette().primary
            });
          }
        }
      }
    });
  </script>
</body>
</html>

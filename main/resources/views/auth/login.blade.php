<!DOCTYPE html>
<html lang="en" class="bg-gray-50 dark:bg-gray-900">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div class="min-h-screen flex items-center justify-center py-10 px-4">
    <div class="relative w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-5xl xl:max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden lg:min-h-[34rem]">
      <!-- Close Button (no behavior yet) -->
      <button type="button" aria-label="Close"
        class="absolute left-3 top-3 rounded-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
          <path fill-rule="evenodd" d="M16.24 7.76a.75.75 0 0 1 0 1.06L13.06 12l3.18 3.18a.75.75 0 0 1-1.06 1.06L12 13.06l-3.18 3.18a.75.75 0 1 1-1.06-1.06L10.94 12 7.76 8.82a.75.75 0 1 1 1.06-1.06L12 10.94l3.18-3.18a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/>
        </svg>
      </button>
      
      <!-- Left Side Form -->
      <div class="p-8 lg:p-12">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Log In</h2>

        <!-- Session Status -->
        @if (session('status'))
        <div class="mt-4 text-sm text-green-600">{{ session('status') }}</div>
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
              class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pl-10 pr-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
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
              class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pl-10 pr-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="Enter your password...">
          </div>
          @error('password')
          <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
          @enderror

          <!-- Terms + Remember -->
          <div class="mt-4 flex items-center justify-between">
            <label class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input type="checkbox" class="size-4 rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500">
                <span>I agree to the <a href="#" class="text-indigo-600 hover:underline">Terms and Conditions</a></span>
            </label>
            <label class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input id="remember" name="remember" type="checkbox" {{ old('remember') ? 'checked' : '' }} class="size-4 rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500">
              <span>Remember me</span>
            </label>
          </div>

          <!-- Submit -->
          <div class="mt-6 flex justify-end">
            <button type="submit" class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
              LOGIN
            </button>
          </div>

          <!-- Links -->
          <div class="mt-6 flex items-center justify-between">
            @if (Route::has('register'))
            <a href="{{ route('register') }}" class="inline-block border-b border-black pb-0.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Sign Up</a>
            @endif
            @if (Route::has('password.request'))
            <a href="{{ route('password.request') }}" class="inline-block border-b border-black pb-0.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Forgot Password?</a>
            @endif
          </div>

          <!-- Social Buttons -->
          <div class="mt-6 flex flex-col items-center gap-3">
            <button type="button" class="w-full max-w-sm inline-flex items-center justify-center gap-2 rounded-lg bg-[#1877F2] px-4 py-2 text-white hover:brightness-110">
              <!-- Facebook Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="size-5" viewBox="0 0 24 24"><path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34v7.03C18.34 21.24 22 17.08 22 12.06Z"/></svg>
              LOGIN WITH FACEBOOK
            </button>
            <button type="button" class="w-full max-w-sm inline-flex items-center justify-center gap-2 rounded-lg bg-[#EA4335] px-4 py-2 text-white hover:brightness-110">
                            <!-- Google Icon -->
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="size-5" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 0 0-9.46 6.64h4.09A6.03 6.03 0 0 1 12 6.03c1.44 0 2.76.51 3.78 1.34l2.66-2.66A10 10 0 0 0 12 2Z"/>
                <path d="M21.8 12.2a10.1 10.1 0 0 0-.26-2.2H12v4.2h5.5a4.7 4.7 0 0 1-2 3.09v2.56h3.24c1.9-1.75 3.06-4.33 3.06-7.65Z"/>
                <path d="M6.63 14.64A6 6 0 0 1 6 12c0-.6.1-1.18.28-1.72H2.2a10 10 0 0 0 0 7.44l3.72-3.08Z"/>
                <path d="M12 22c2.7 0 4.97-.89 6.63-2.42l-3.24-2.56c-.9.6-2.03.97-3.39.97a6.03 6.03 0 0 1-5.47-3.35H2.54A10 10 0 0 0 12 22Z"/>
              </svg>
              LOGIN WITH EMAIL
            </button>
          </div>
        </form>
      </div>

      <!-- Right Side Info Section -->
      <div class="hidden lg:flex items-center justify-center bg-indigo-600 p-10 text-white">
        <div class="max-w-md text-center">
          <div class="h-40 w-40 mx-auto mb-6 rounded-xl">
             <img src="{{ asset('images/auth/login_page.gif') }}" alt="Banner" class="h-full w-full object-cover rounded-xl">
          </div>
          <p class="text-sm opacity-90">
            Empowered by cutting-edge facial recognition, the BJMP jail management system ensures seamless security, precise PDL monitoring, and a smarter, more efficient visitation experience.
          </p>
          <div class="mt-6 flex items-center justify-center gap-2">
            <span class="size-2 rounded-full bg-white/80"></span>
            <span class="size-2 rounded-full bg-white/60"></span>
            <span class="size-2 rounded-full bg-white/60"></span>
            <span class="size-2 rounded-full bg-white/60"></span>
          </div>
        </div>
      </div>

    </div>
  </div>
</body>
</html>

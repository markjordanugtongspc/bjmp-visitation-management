<!-- Bump Message Button Component - For Assistant Warden -->
@if(Auth::user()->role_id == 2) <!-- Only show for Assistant Warden -->
<div class="fixed bottom-6 right-6 z-50" x-data="{ open: false, sending: false }">
    <!-- Main Message Button -->
    <button 
        @click="open = !open"
        type="button"
        class="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer"
        aria-label="Send Message to Warden">
        <span class="sr-only">Send Message to Warden</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        
        <!-- Pulse Animation for New Messages -->
        <span class="absolute top-0 right-0 flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
    </button>

    <!-- Message Modal -->
    <div 
        x-show="open"
        x-transition:enter="transition ease-out duration-200"
        x-transition:enter-start="opacity-0 scale-95"
        x-transition:enter-end="opacity-100 scale-100"
        x-transition:leave="transition ease-in duration-75"
        x-transition:leave-start="opacity-100 scale-100"
        x-transition:leave-end="opacity-0 scale-95"
        class="absolute bottom-16 right-0 w-96 origin-bottom-right rounded-xl bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none"
        @click.away="open = false"
        style="display: none;">
        
        <!-- Header -->
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20 rounded-t-xl">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-50">Message Warden</h3>
                </div>
                <button 
                    @click="open = false"
                    type="button"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Form -->
        <form id="bump-message-form" class="p-4">
            <!-- Recipient Selection -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipient
                </label>
                <select 
                    id="recipient-id" 
                    name="recipient_id"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400">
                    <option value="">Select Warden...</option>
                    <!-- Will be populated by JavaScript -->
                </select>
            </div>

            <!-- Priority Selection -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                </label>
                <div class="flex gap-2">
                    <label class="flex-1">
                        <input type="radio" name="priority" value="normal" checked class="sr-only peer">
                        <div class="px-3 py-2 text-center text-sm border rounded-lg cursor-pointer peer-checked:bg-green-100 peer-checked:border-green-500 peer-checked:text-green-700 dark:peer-checked:bg-green-900/20 dark:peer-checked:border-green-400 dark:peer-checked:text-green-300 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                            Normal
                        </div>
                    </label>
                    <label class="flex-1">
                        <input type="radio" name="priority" value="high" class="sr-only peer">
                        <div class="px-3 py-2 text-center text-sm border rounded-lg cursor-pointer peer-checked:bg-yellow-100 peer-checked:border-yellow-500 peer-checked:text-yellow-700 dark:peer-checked:bg-yellow-900/20 dark:peer-checked:border-yellow-400 dark:peer-checked:text-yellow-300 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                            High
                        </div>
                    </label>
                    <label class="flex-1">
                        <input type="radio" name="priority" value="urgent" class="sr-only peer">
                        <div class="px-3 py-2 text-center text-sm border rounded-lg cursor-pointer peer-checked:bg-red-100 peer-checked:border-red-500 peer-checked:text-red-700 dark:peer-checked:bg-red-900/20 dark:peer-checked:border-red-400 dark:peer-checked:text-red-300 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                            Urgent
                        </div>
                    </label>
                </div>
            </div>

            <!-- Message Input -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                </label>
                <textarea 
                    id="message-content"
                    name="message"
                    rows="4"
                    maxlength="1000"
                    placeholder="Type your message to the warden..."
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 resize-none"></textarea>
                <div class="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                    <span id="char-count">0</span>/1000
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
                <button 
                    type="button"
                    @click="open = false"
                    class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 cursor-pointer">
                    Cancel
                </button>
                <button 
                    type="submit"
                    :disabled="sending"
                    class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
                    <svg x-show="!sending" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <svg x-show="sending" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span x-text="sending ? 'Sending...' : 'Send Message'"></span>
                </button>
            </div>
        </form>
    </div>
</div>
@endif

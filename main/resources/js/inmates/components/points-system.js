export function createPointsSystemManager() {
  const TIER_THRESHOLDS = [
    { points: 500, days: 30, label: 'Maximum', color: 'text-purple-600' },
    { points: 400, days: 21, label: 'Excellent', color: 'text-blue-600' },
    { points: 300, days: 14, label: 'Good', color: 'text-green-600' },
    { points: 200, days: 7, label: 'Fair', color: 'text-yellow-600' },
    { points: 100, days: 3, label: 'Basic', color: 'text-orange-600' },
  ];

  function calculateReduction(points) {
    for (const tier of TIER_THRESHOLDS) {
      if (points >= tier.points) return tier;
    }
    return { points: 0, days: 0, label: 'None', color: 'text-gray-600' };
  }

  function getNextTier(currentPoints) {
    for (const tier of TIER_THRESHOLDS) {
      if (currentPoints < tier.points) return tier;
    }
    return null;
  }

  function renderQuickButtons() {
    return `
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label class="block text-xs text-gray-400 mb-2">Add Points</label>
          <div class="flex gap-2">
            <button type="button" data-quick-add="1" class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md cursor-pointer transition-colors">+1</button>
            <button type="button" data-quick-add="5" class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md cursor-pointer transition-colors">+5</button>
            <button type="button" data-quick-add="10" class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md cursor-pointer transition-colors">+10</button>
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-2">Deduct Points</label>
          <div class="flex gap-2">
            <button type="button" data-quick-subtract="1" class="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md cursor-pointer transition-colors">-1</button>
            <button type="button" data-quick-subtract="5" class="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md cursor-pointer transition-colors">-5</button>
            <button type="button" data-quick-subtract="10" class="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md cursor-pointer transition-colors">-10</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderSentencePreview(currentPoints, originalSentenceDays) {
    const current = calculateReduction(currentPoints);
    const next = getNextTier(currentPoints);
    const progress = next ? ((currentPoints % 100) / 100) * 100 : 100;

    return `
      <div class="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-lg p-4 border border-blue-700/50">
        <h4 class="text-sm font-semibold text-gray-200 mb-3">Sentence Reduction Preview</h4>
        
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-400">Current Tier:</span>
            <span class="text-sm font-semibold ${current.color}">${current.label}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-400">Reduction Earned:</span>
            <span class="text-lg font-bold text-green-400">${current.days} days</span>
          </div>
          
          ${originalSentenceDays ? `
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-400">Original Sentence:</span>
              <span class="text-gray-300">${originalSentenceDays} days</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-400">Adjusted Sentence:</span>
              <span class="text-green-400 font-semibold">${originalSentenceDays - current.days} days</span>
            </div>
          ` : ''}
          
          ${next ? `
            <div class="mt-4 pt-3 border-t border-gray-700">
              <div class="flex justify-between text-xs text-gray-400 mb-2">
                <span>Next tier: ${next.label}</span>
                <span>${currentPoints}/${next.points} pts</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-2">
                <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
              </div>
              <div class="text-xs text-gray-400 mt-1 text-center">
                ${next.points - currentPoints} more points for ${next.days} days reduction
              </div>
            </div>
          ` : `
            <div class="mt-3 text-center text-xs text-purple-400">
              🏆 Maximum reduction achieved!
            </div>
          `}
        </div>
      </div>
    `;
  }

  return {
    calculateReduction,
    getNextTier,
    renderQuickButtons,
    renderSentencePreview,
    TIER_THRESHOLDS
  };
}

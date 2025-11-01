/**
 * Chart Component
 * Handles all chart visualizations (donut, bar, line, etc.)
 * Fetches visitor statistics and updates charts with live data
 */

export async function initCharts() {
  // Initialize donut chart if present
  await initDonutChart();
  
  // Future: Add other chart initializations here
  // await initBarChart();
  // await initLineChart();
}

/**
 * Initialize Donut Chart with live data
 */
async function initDonutChart() {
  const donutSvg = document.querySelector('svg.h-40.w-40.-rotate-90');
  
  if (!donutSvg) return;

  try {
    // Fetch visitation statistics
    const response = await fetch('/api/visitors/statistics');
    if (!response.ok) throw new Error('Failed to fetch statistics');
    
    const json = await response.json();
    const stats = json?.data || {};

    const approved = stats.approved || 0;
    const pending = stats.pending || 0;
    const rejected = stats.rejected || 0;
    const total = stats.total || 0;

    console.log('Donut Chart Data:', { approved, pending, rejected, total });

    // If no data, show empty state
    if (total === 0) {
      updateDonutChart(donutSvg, 0, 0, 0);
      updateLegend(0, 0, 0);
      return;
    }

    // Calculate percentages
    const approvedPercent = (approved / total) * 100;
    const pendingPercent = (pending / total) * 100;
    const rejectedPercent = (rejected / total) * 100;

    console.log('Percentages:', { approvedPercent, pendingPercent, rejectedPercent });

    // Update the donut chart
    updateDonutChart(donutSvg, approvedPercent, pendingPercent, rejectedPercent);

    // Update legend with counts
    updateLegend(approved, pending, rejected);

  } catch (error) {
    console.error('Error loading donut chart data:', error);
    // Show empty state on error
    const donutSvg = document.querySelector('svg.h-40.w-40.-rotate-90');
    if (donutSvg) {
      updateDonutChart(donutSvg, 0, 0, 0);
      updateLegend(0, 0, 0);
    }
  }
}

/**
 * Update the donut chart SVG with new percentages
 */
function updateDonutChart(svg, approvedPercent, pendingPercent, rejectedPercent) {
  const circles = svg.querySelectorAll('circle[stroke-dasharray]');
  
  if (circles.length < 3) {
    console.warn('Not enough circles found in SVG:', circles.length);
    return;
  }

  // Circle circumference: 2 * π * r = 2 * π * 48 ≈ 301.59
  const circumference = 301.59;

  // Calculate the arc length for each segment
  const approvedArc = (approvedPercent / 100) * circumference;
  const pendingArc = (pendingPercent / 100) * circumference;
  const rejectedArc = (rejectedPercent / 100) * circumference;

  // Green circle (Approved) - starts at 0
  circles[0].setAttribute('stroke-dasharray', `${approvedArc.toFixed(2)} ${circumference}`);
  circles[0].setAttribute('stroke-dashoffset', '0');
  
  // Amber circle (Pending) - starts after approved
  const pendingOffset = -approvedArc;
  circles[1].setAttribute('stroke-dasharray', `${pendingArc.toFixed(2)} ${circumference}`);
  circles[1].setAttribute('stroke-dashoffset', pendingOffset.toFixed(2));
  
  // Red circle (Rejected) - starts after approved + pending
  const rejectedOffset = -(approvedArc + pendingArc);
  circles[2].setAttribute('stroke-dasharray', `${rejectedArc.toFixed(2)} ${circumference}`);
  circles[2].setAttribute('stroke-dashoffset', rejectedOffset.toFixed(2));

  console.log('Circle Updates:', {
    approved: { arc: approvedArc, offset: 0 },
    pending: { arc: pendingArc, offset: pendingOffset },
    rejected: { arc: rejectedArc, offset: rejectedOffset }
  });

  // Add smooth transition
  circles.forEach(circle => {
    circle.style.transition = 'stroke-dashoffset 0.6s ease, stroke-dasharray 0.6s ease';
  });
}

/**
 * Update legend with actual counts
 */
function updateLegend(approved, pending, rejected) {
  const legendContainer = document.querySelector('.mt-2.grid.grid-cols-3.gap-2');
  
  if (!legendContainer) {
    console.warn('Legend container not found');
    return;
  }

  const legendItems = legendContainer.querySelectorAll('div.flex.items-center.gap-2');
  
  if (legendItems.length >= 3) {
    // Update Approved
    legendItems[0].innerHTML = `
      <span class="h-2 w-2 rounded-full bg-green-500"></span>
      <span>Approved (${approved})</span>
    `;
    
    // Update Pending
    legendItems[1].innerHTML = `
      <span class="h-2 w-2 rounded-full bg-amber-500"></span>
      <span>Pending (${pending})</span>
    `;
    
    // Update Rejected
    legendItems[2].innerHTML = `
      <span class="h-2 w-2 rounded-full bg-red-500"></span>
      <span>Rejected (${rejected})</span>
    `;
  }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCharts);
} else {
  initCharts();
}

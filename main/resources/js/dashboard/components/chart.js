/**
 * Chart Component
 * Handles all chart visualizations (donut, bar, line, etc.)
 * Fetches visitor statistics and updates charts with live data
 */

export async function initCharts() {
  // Initialize all charts
  await initDonutChart();
  await initLineChart();
  await initBarChart();
  await initUpcomingSchedules();
  await initCellsCapacity();
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

/**
 * Initialize Line Chart for Weekly Visitor Traffic
 */
async function initLineChart() {
  const lineChartContainer = document.querySelector('[data-chart="weekly-line"]');
  if (!lineChartContainer) return;

  try {
    const response = await fetch('/api/visitors/weekly-traffic');
    if (!response.ok) throw new Error('Failed to fetch weekly traffic');
    
    const json = await response.json();
    const data = json?.data || [];

    console.log('Line Chart Data:', data);

    if (data.length === 0) {
      renderEmptyLineChart(lineChartContainer);
      return;
    }

    renderLineChart(lineChartContainer, data);

  } catch (error) {
    console.error('Error loading line chart:', error);
    renderEmptyLineChart(lineChartContainer);
  }
}

/**
 * Render line chart with data
 */
function renderLineChart(container, data) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const width = 600;
  const height = 220;
  const padding = 40;
  const chartHeight = height - padding;
  const pointSpacing = (width - padding * 2) / (data.length - 1);

  // Generate path for line
  let linePath = '';
  let areaPath = '';
  const points = [];

  data.forEach((item, index) => {
    const x = padding + (index * pointSpacing);
    const y = chartHeight - ((item.count / maxCount) * (chartHeight - 40));
    points.push({ x, y, count: item.count });
    
    if (index === 0) {
      linePath += `M${x} ${y}`;
      areaPath += `M${x} ${y}`;
    } else {
      linePath += ` L${x} ${y}`;
      areaPath += ` L${x} ${y}`;
    }
  });

  // Close area path
  areaPath += ` L${points[points.length - 1].x} ${chartHeight} L${points[0].x} ${chartHeight} Z`;

  // Build SVG
  const svg = `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-48">
      <defs>
        <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#3B82F6" stop-opacity="0" />
        </linearGradient>
      </defs>
      <g fill="none" stroke-width="2">
        <path d="${linePath}" stroke="#3B82F6" />
        <path d="${areaPath}" fill="url(#lineFill)" stroke="none" />
      </g>
      <g stroke="#e5e7eb" class="dark:stroke-gray-800">
        <line x1="${padding}" y1="${chartHeight}" x2="${width - padding}" y2="${chartHeight}" />
      </g>
      <g fill="#6b7280" class="dark:fill-gray-400" font-size="10">
        ${data.map((item, index) => {
          const x = padding + (index * pointSpacing);
          return `<text x="${x}" y="${height - 10}" text-anchor="middle">${item.day}</text>`;
        }).join('')}
      </g>
      ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#3B82F6" />`).join('')}
    </svg>
  `;

  container.innerHTML = svg;
}

/**
 * Render empty line chart
 */
function renderEmptyLineChart(container) {
  const svg = `
    <svg viewBox="0 0 600 220" class="w-full h-48">
      <g stroke="#e5e7eb" class="dark:stroke-gray-800">
        <line x1="40" y1="180" x2="560" y2="180" />
      </g>
      <text x="300" y="100" text-anchor="middle" fill="#9ca3af" font-size="14">No data available</text>
      <g fill="#6b7280" class="dark:fill-gray-400" font-size="10">
        <text x="40" y="210">Mon</text>
        <text x="120" y="210">Tue</text>
        <text x="200" y="210">Wed</text>
        <text x="280" y="210">Thu</text>
        <text x="360" y="210">Fri</text>
        <text x="440" y="210">Sat</text>
        <text x="520" y="210">Sun</text>
      </g>
    </svg>
  `;
  container.innerHTML = svg;
}

/**
 * Initialize Bar Chart for Monthly Visits
 */
async function initBarChart() {
  const barChartContainer = document.querySelector('[data-chart="monthly-bar"]');
  const yearLabel = document.querySelector('[data-year-label]');
  
  if (!barChartContainer) return;

  try {
    const response = await fetch('/api/visitors/monthly-visits');
    if (!response.ok) throw new Error('Failed to fetch monthly visits');
    
    const json = await response.json();
    const data = json?.data || [];
    const year = json?.year || new Date().getFullYear();

    console.log('Bar Chart Data:', data);

    // Update year label
    if (yearLabel) {
      yearLabel.textContent = year;
    }

    if (data.length === 0) {
      renderEmptyBarChart(barChartContainer);
      return;
    }

    renderBarChart(barChartContainer, data);

  } catch (error) {
    console.error('Error loading bar chart:', error);
    renderEmptyBarChart(barChartContainer);
  }
}

/**
 * Render bar chart with data
 */
function renderBarChart(container, data) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const width = 600;
  const height = 220;
  const barWidth = 28;
  const barSpacing = 50;
  const chartHeight = 200;
  const startX = 40;

  // Only show first 10 months for better spacing
  const displayData = data.slice(0, 10);

  const bars = displayData.map((item, index) => {
    const x = startX + (index * barSpacing);
    const barHeight = (item.count / maxCount) * 130;
    const y = chartHeight - barHeight;
    
    return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="#3B82F6" />`;
  }).join('');

  const labels = displayData.map((item, index) => {
    const x = startX + (index * barSpacing);
    return `<text x="${x}" y="${height - 10}" fill="#6b7280" class="dark:fill-gray-400" font-size="10">${item.monthName}</text>`;
  }).join('');

  const svg = `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-48">
      <g fill="#3B82F6">
        ${bars}
      </g>
      <g fill="#6b7280" class="dark:fill-gray-400" font-size="10">
        ${labels}
      </g>
    </svg>
  `;

  container.innerHTML = svg;
}

/**
 * Render empty bar chart
 */
function renderEmptyBarChart(container) {
  const svg = `
    <svg viewBox="0 0 600 220" class="w-full h-48">
      <text x="300" y="100" text-anchor="middle" fill="#9ca3af" font-size="14">No data available</text>
      <g fill="#6b7280" class="dark:fill-gray-400" font-size="10">
        <text x="40" y="210">Jan</text>
        <text x="90" y="210">Feb</text>
        <text x="140" y="210">Mar</text>
        <text x="190" y="210">Apr</text>
        <text x="240" y="210">May</text>
        <text x="290" y="210">Jun</text>
        <text x="340" y="210">Jul</text>
        <text x="390" y="210">Aug</text>
        <text x="440" y="210">Sep</text>
        <text x="490" y="210">Oct</text>
      </g>
    </svg>
  `;
  container.innerHTML = svg;
}

/**
 * Initialize Upcoming Schedules
 */
async function initUpcomingSchedules() {
  const schedulesContainer = document.querySelector('[data-schedules-container]');
  if (!schedulesContainer) return;

  try {
    const response = await fetch('/api/visitors/upcoming-schedules');
    if (!response.ok) throw new Error('Failed to fetch upcoming schedules');
    
    const json = await response.json();
    const schedules = json?.data || [];

    console.log('Upcoming Schedules:', schedules);

    if (schedules.length === 0) {
      schedulesContainer.innerHTML = `
        <div class="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          No upcoming schedules
        </div>
      `;
      return;
    }

    const html = schedules.map(schedule => {
      // Badge styling based on status
      let badgeClass = 'bg-amber-500/10 text-amber-500'; // pending
      if (schedule.badge_status === 'today') {
        badgeClass = 'bg-green-500/10 text-green-500';
      } else if (schedule.badge_status === 'approved') {
        badgeClass = 'bg-blue-500/10 text-blue-500';
      }

      return `
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">${schedule.formatted_date}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">${schedule.reason_for_visit}</div>
          </div>
          <span class="inline-flex items-center rounded-full ${badgeClass} px-2 py-0.5 text-[11px]">
            ${schedule.badge_text}
          </span>
        </div>
      `;
    }).join('');

    schedulesContainer.innerHTML = html;

  } catch (error) {
    console.error('Error loading upcoming schedules:', error);
    schedulesContainer.innerHTML = `
      <div class="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Failed to load schedules
      </div>
    `;
  }
}

/**
 * Initialize Cells Capacity
 */
async function initCellsCapacity() {
  const capacityContainer = document.querySelector('[data-capacity-container]');
  if (!capacityContainer) return;

  try {
    const response = await fetch('/api/cells/capacity');
    if (!response.ok) throw new Error('Failed to fetch cells capacity');
    
    const json = await response.json();
    const cells = json?.data || [];

    console.log('Cells Capacity:', cells);

    if (cells.length === 0) {
      capacityContainer.innerHTML = `
        <div class="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          No cells data available
        </div>
      `;
      return;
    }

    const html = cells.map(cell => {
      const colorClass = cell.color === 'red' ? 'bg-red-500' : 
                         cell.color === 'amber' ? 'bg-amber-500' : 'bg-blue-500';

      return `
        <div>
          <div class="flex justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>${cell.name}</span>
            <span>${cell.occupancy_percentage}%</span>
          </div>
          <div class="h-2 rounded bg-gray-100 dark:bg-gray-800 mt-1">
            <div class="h-2 rounded ${colorClass}" style="width:${cell.occupancy_percentage}%"></div>
          </div>
        </div>
      `;
    }).join('');

    capacityContainer.innerHTML = html;

  } catch (error) {
    console.error('Error loading cells capacity:', error);
    capacityContainer.innerHTML = `
      <div class="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Failed to load capacity data
      </div>
    `;
  }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCharts);
} else {
  initCharts();
}

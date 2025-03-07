// Fetch Data from Backend
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${url}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// Populate Maintenance Alerts
async function renderMaintenanceAlerts() {
    const maintenanceAlertsList = document.getElementById('maintenance-alerts');
    if (!maintenanceAlertsList) return;

    const maintenanceAlerts = await fetchData('http://localhost:3500/api/maintenance/schedule');
    maintenanceAlertsList.innerHTML = maintenanceAlerts.map(alert => `
        <li class="text-sm text-gray-700 mb-2 flex items-center gap-2">
            <i class="fas fa-circle text-${alert.status === 'urgent' ? 'red' : 'yellow'}-500"></i>
            Equipment ID: ${alert.equipment_id} - Due on ${alert.next_maintenance}
        </li>
    `).join('');
}

// Populate Current Bookings
async function renderCurrentBookings() {
    const currentBookingsList = document.getElementById('current-bookings');
    if (!currentBookingsList) return;

    const currentBookings = await fetchData('http://localhost:3500/api/bookings/approved');
    currentBookingsList.innerHTML = currentBookings.map(booking => `
        <li class="text-sm text-gray-700 mb-2">
            ${booking.equipment} - ${booking.requestedBy} (${booking.time})
        </li>
    `).join('');
}

// Populate Pending Maintenance
async function renderPendingMaintenance() {
    const pendingMaintenanceList = document.getElementById('pending-maintenance');
    if (!pendingMaintenanceList) return;

    const pendingMaintenance = await fetchData('http://localhost:3500/api/maintenance/requests');
    pendingMaintenanceList.innerHTML = pendingMaintenance.map(task => `
        <li class="text-sm text-gray-700 mb-2 flex items-center justify-between">
            <span>Equipment ID: ${task.equipment_id} - ${task.issue} (Requested by User ID: ${task.requested_by})</span>
            <button class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600" onclick="markCompleted('${task.id}')">
                Mark as Completed
            </button>
        </li>
    `).join('');
}

// Populate Recent Activity
async function renderRecentActivity() {
    const recentActivityList = document.getElementById('recent-activity');
    if (!recentActivityList) return;

    const recentActivity = await fetchData('http://localhost:3500/api/maintenance/schedule');
    recentActivityList.innerHTML = recentActivity.map(activity => `
        <li class="text-sm text-gray-700 mb-2">
            ${activity.maintenance_type} by Technician ID: ${activity.technician_id} at ${activity.next_maintenance}
        </li>
    `).join('');
}

// Mark as Completed Function
async function markCompleted(id) {
    try {
        const response = await fetch(`http://localhost:3500/api/maintenance/approve/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to mark task as completed');
        }
        alert(`Task ${id} marked as completed.`);
        await renderPendingMaintenance();
    } catch (error) {
        console.error('Error marking task as completed:', error);
    }
}

// Refresh Data Function
async function refreshData() {
    await renderMaintenanceAlerts();
    await renderCurrentBookings();
    await renderPendingMaintenance();
    await renderRecentActivity();
    alert('Data refreshed!');
}

// Initialize Page
document.addEventListener('DOMContentLoaded', async () => {
    await renderMaintenanceAlerts();
    await renderCurrentBookings();
    await renderPendingMaintenance();
    await renderRecentActivity();
});
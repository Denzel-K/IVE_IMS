// API Endpoints
const API_BASE_URL = 'http://localhost:3500/api/bookings';

// Initialize Modals
function initializeModals() {
    const closeButtons = document.querySelectorAll('.close-modal');

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('reservation-modal').classList.add('hidden');
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-content')) {
            e.target.classList.add('hidden');
        }
    });
}

// Fetch Data
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${endpoint}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// Render Time Slots
async function renderTimeSlots() {
    const container = document.getElementById('time-slots-list');
    if (!container) return;

    const timeSlots = await fetchData('timeslots');
    container.innerHTML = timeSlots.map(slot => `
        <div class="time-slot p-4 border border-gray-300 rounded-lg ${
            slot.available ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
        }" data-time="${slot.slot_time}" ${slot.available ? '' : 'disabled'}>
            ${slot.slot_time}
            <span class="float-right text-sm ${
                slot.available ? 'text-green-500' : 'text-red-500'
            }">
                ${slot.available ? 'Available' : 'Booked'}
            </span>
        </div>
    `).join('');

    // Add event listeners to time slots
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            if (slot.getAttribute('disabled')) return;
            document.getElementById('reservation-time').value = slot.dataset.time;
            document.getElementById('reservation-modal').classList.remove('hidden');
        });
    });
}

// Render Equipment
async function renderEquipment() {
    const container = document.getElementById('equipment-list');
    if (!container) return;

    const equipmentList = await fetchData('equipment');
    container.innerHTML = equipmentList.slice(0, 4).map(eq => `
        <div class="equipment-card bg-white p-4 border border-gray-300 rounded-lg">
            <h4 class="font-semibold">${eq.name}</h4>
            <p class="text-sm text-gray-600">Available: ${eq.quantity}</p>
            <button class="reserve-btn w-full mt-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${
                eq.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }" ${eq.quantity === 0 ? 'disabled' : ''}>
                Reserve
            </button>
        </div>
    `).join('');

    // Add event listeners to reserve buttons
    document.querySelectorAll('.reserve-btn').forEach(button => {
        button.addEventListener('click', () => {
            const equipmentCard = button.closest('.equipment-card');
            const equipmentName = equipmentCard.querySelector('h4').textContent;
            document.getElementById('reservation-modal').classList.remove('hidden');
        });
    });
}

// Render Pending Approvals
async function renderPendingApprovals() {
    const container = document.getElementById('pending-approvals');
    if (!container) return;

    const pendingReservations = await fetchData('pending');
    container.innerHTML = pendingReservations.map(res => `
        <div class="reservation-card bg-white p-4 border border-gray-300 rounded-lg">
            <h4 class="font-semibold">${res.equipment}</h4>
            <p class="text-sm text-gray-600">Time: ${res.time}</p>
            <p class="text-sm text-gray-600">Requested by: ${res.requestedBy}</p>
            <div class="flex gap-2 mt-2">
                <button class="approve-btn p-2 bg-green-500 text-white rounded-lg hover:bg-green-600" data-id="${res.id}">Approve</button>
                <button class="reject-btn p-2 bg-red-500 text-white rounded-lg hover:bg-red-600" data-id="${res.id}">Reject</button>
            </div>
        </div>
    `).join('');

    // Add event listeners to approve/reject buttons
    document.querySelectorAll('.approve-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const reservationId = button.dataset.id;
            await updateReservationStatus(reservationId, 'approved');
            await renderPendingApprovals();
            await renderApprovedReservations();
        });
    });

    document.querySelectorAll('.reject-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const reservationId = button.dataset.id;
            await updateReservationStatus(reservationId, 'rejected');
            await renderPendingApprovals();
        });
    });
}

// Render Approved Reservations
async function renderApprovedReservations() {
    const container = document.getElementById('approved-reservations');
    if (!container) return;

    const approvedReservations = await fetchData('approved');
    container.innerHTML = approvedReservations.map(res => `
        <div class="reservation-card bg-white p-4 border border-gray-300 rounded-lg">
            <h4 class="font-semibold">${res.equipment}</h4>
            <p class="text-sm text-gray-600">Time: ${res.time}</p>
            <p class="text-sm text-gray-600">Requested by: ${res.requestedBy}</p>
        </div>
    `).join('');
}

// Render Logs
async function renderLogs() {
    const container = document.getElementById('logs');
    if (!container) return;

    const logs = await fetchData('logs');
    container.innerHTML = logs.map(log => `
        <div class="log-card bg-white p-4 border border-gray-300 rounded-lg">
            <h4 class="font-semibold">${log.equipment}</h4>
            <p class="text-sm text-gray-600">User: ${log.user}</p>
            <p class="text-sm text-gray-600">Time: ${log.start_time} - ${log.end_time}</p>
            <p class="text-sm text-gray-600">Purpose: ${log.purpose}</p>
        </div>
    `).join('');
}

// Update Reservation Status
async function updateReservationStatus(reservationId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/approve/${reservationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) {
            throw new Error('Failed to update reservation status');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating reservation status:', error);
        return null;
    }
}

// Populate Equipment Dropdown
async function populateEquipmentDropdown() {
    const equipmentDropdown = document.getElementById('reservation-equipment');
    if (!equipmentDropdown) return;

    const equipmentList = await fetchData('equipment');
    equipmentDropdown.innerHTML = `
        <option value="" disabled selected>Select Equipment</option>
        ${equipmentList.map(eq => `
            <option value="${eq.id}">${eq.name} (Available: ${eq.quantity})</option>
        `).join('')}
    `;
}

// Populate Equipment Items Dropdown
async function populateEquipmentItemsDropdown(equipmentId) {
    const itemsDropdown = document.getElementById('reservation-item');
    if (!itemsDropdown) return;

    const items = await fetchData(`equipment-items?equipment_id=${equipmentId}`);
    itemsDropdown.innerHTML = `
        <option value="" disabled selected>Select Item</option>
        ${items.map(item => `
            <option value="${item.id}">${item.unique_code} (${item.status === 'available' ? 'Available' : 'In Use'})</option>
        `).join('')}
    `;
}

// Populate Time Slots Based on Date and Equipment
async function populateTimeSlots(date, equipmentId) {
    const timeSlotsDropdown = document.getElementById('reservation-time');
    if (!timeSlotsDropdown) return;

    // Fetch available time slots for the selected date and equipment
    const timeSlots = await fetchData(`timeslots?date=${date}&equipment_id=${equipmentId}`);
    timeSlotsDropdown.innerHTML = `
        <option value="" disabled selected>Select Time Slot</option>
        ${timeSlots.map(slot => `
            <option value="${slot.id}">${slot.slot_time} (${slot.available ? 'Available' : 'Booked'})</option>
        `).join('')}
    `;
}

// Open Reservation Modal
async function openReservationModal() {
    await populateEquipmentDropdown();
    document.getElementById('reservation-modal').classList.remove('hidden');
}

// Handle Equipment Selection
document.getElementById('reservation-equipment').addEventListener('change', async (e) => {
    const equipmentId = e.target.value;
    await populateEquipmentItemsDropdown(equipmentId);
});
// Handle Reservation Form Submission
async function handleReservationFormSubmit(e) {
    e.preventDefault();

    const equipmentId = document.getElementById('reservation-equipment').value;
    const equipmentItemId = document.getElementById('reservation-item').value;
    const date = document.getElementById('reservation-date').value;
    const timeSlotId = document.getElementById('reservation-time').value;
    const lab = document.getElementById('reservation-lab').value;
    const purpose = document.getElementById('reservation-purpose').value;

    if (!equipmentId || !equipmentItemId || !date || !timeSlotId || !lab || !purpose) {
        alert('Please fill out all fields.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/reserve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                equipment_item_id: equipmentItemId,
                user_id: req.user.id, // Assuming user ID is available
                time_slot_id: timeSlotId,
                date: date,
                lab: lab,
                purpose: purpose,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create reservation.');
        }

        const result = await response.json();
        alert(`Reservation created successfully! ID: ${result.reservation_id}`);
        document.getElementById('reservation-modal').classList.add('hidden');
    } catch (error) {
        console.error('Error creating reservation:', error);
        alert('Failed to create reservation. Please try again.');
    }
}
// Initialize Page
document.addEventListener('DOMContentLoaded', async () => {
    initializeModals();
    await renderTimeSlots();
    await renderEquipment();
    await renderPendingApprovals();
    await renderApprovedReservations();
    await renderLogs();

    // Open Reservation Modal
    document.getElementById('reserve-equipment-btn').addEventListener('click', openReservationModal);

    // Handle Date and Equipment Change
    document.getElementById('reservation-date').addEventListener('change', async (e) => {
        const date = e.target.value;
        const equipmentId = document.getElementById('reservation-equipment').value;
        if (date && equipmentId) {
            await populateTimeSlots(date, equipmentId);
        }
    });

    document.getElementById('reservation-equipment').addEventListener('change', async (e) => {
        const equipmentId = e.target.value;
        const date = document.getElementById('reservation-date').value;
        if (date && equipmentId) {
            await populateTimeSlots(date, equipmentId);
        }
    });

    // Handle Form Submission
    document.getElementById('reservation-form').addEventListener('submit', handleReservationFormSubmit);
});
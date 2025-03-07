const API_BASE_URL = 'http://localhost:3500/api/equipment-sharing';

// Initialize Modals
function initializeModals() {
    const closeButtons = document.querySelectorAll('.close-modal');

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal-content');
            modal.parentElement.classList.add('hidden');
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-content')) {
            e.target.classList.add('hidden');
        }
    });
}

// Fetch Data from Backend
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

// Populate Labs Dropdown
async function populateLabs() {
    const labs = await fetchData('labs'); // Add a new endpoint to fetch labs
    const selectLab = document.getElementById('select-lab');
    selectLab.innerHTML = labs.map(lab => `<option value="${lab.id}">${lab.name}</option>`).join('');
}

// Populate Equipment Dropdown
async function populateEquipment(labId) {
    const equipment = await fetchData(`equipment?labId=${labId}`); // Add a new endpoint to fetch equipment by lab
    const selectEquipment = document.getElementById('select-equipment');
    selectEquipment.innerHTML = equipment.map(eq => `<option value="${eq.id}">${eq.name}</option>`).join('');
    document.getElementById('equipment-section').classList.remove('hidden');
}

// Populate Items Dropdown
async function populateItems(equipmentId) {
    const items = await fetchData(`items?equipmentId=${equipmentId}`); // Add a new endpoint to fetch items by equipment
    const selectItem = document.getElementById('select-item');
    selectItem.innerHTML = items.map(item => `<option value="${item.id}">${item.unique_code}</option>`).join('');
    document.getElementById('item-section').classList.remove('hidden');
}

async function renderAvailableEquipment() {
    const container = document.getElementById('available-equipment');
    if (!container) return;

    // Get the current lab from the user data
    const userDataElement = document.getElementById('user-data');
    if (!userDataElement) {
        console.error("User data element not found");
        return;
    }
    const currentLab = userDataElement.getAttribute('data-current-lab');
    console.log("Current Lab:", currentLab); // Debugging

    const availableEquipment = await fetchData(`available?currentLab=${currentLab}`);
    console.log("Available Equipment:", availableEquipment); // Debugging

    // Map the backend response to match the expected field names
    const mappedEquipment = availableEquipment.map(eq => ({
        equipment_id: eq.id,  // Rename `id` to `equipment_id`
        equipment_name: eq.name,  // Rename `name` to `equipment_name`
        lab: eq.lab,
        available_quantity: eq.available_quantity
    }));

    container.innerHTML = mappedEquipment.map(eq => `
        <div class="equipment-card bg-white p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer" data-id="${eq.equipment_id}">
            <h4 class="font-semibold text-indigo-800">${eq.equipment_name}</h4>
            <p class="text-sm text-gray-600">Lab: ${eq.lab}</p>
            <p class="text-sm text-gray-600">Available: ${eq.available_quantity}</p>
        </div>
    `).join('');

    // Add event listeners to equipment cards
    document.querySelectorAll('.equipment-card').forEach(card => {
        card.addEventListener('click', () => {
            const equipmentId = card.dataset.id;
            const equipment = mappedEquipment.find(eq => eq.equipment_id == equipmentId);
            showEquipmentDetails(equipment);
        });
    });
}


// Show Equipment Details
function showEquipmentDetails(equipment) {
    const container = document.getElementById('equipment-details-content');
    if (!container) return;

    container.innerHTML = `
        <h4 class="font-semibold text-indigo-800">${equipment.equipment_name}</h4>
        <p class="text-sm text-gray-600">Lab: ${equipment.from_lab}</p>
        <p class="text-sm text-gray-600">Available: ${equipment.available_quantity}</p>
    `;

    document.getElementById('equipment-details-modal').classList.remove('hidden');
}

// Render Requests from Other Labs
async function renderRequestsFromLabs() {
    const container = document.getElementById('requests-from-labs');
    if (!container) return;

    const requestsFromLabs = await fetchData('requests');
    container.innerHTML = requestsFromLabs.map(req => `
        <div class="request-card bg-white p-4 border border-gray-200 rounded-lg" data-id="${req.id}">
            <h4 class="font-semibold text-indigo-800">${req.equipment_name}</h4>
            <p class="text-sm text-gray-600">From: ${req.from_lab}</p>
            <p class="text-sm text-gray-600">To: ${req.to_lab}</p>
            <p class="text-sm text-gray-600">Quantity: ${req.quantity}</p>
            <p class="text-sm text-gray-600">Time Slot: ${req.time_slot}</p>
            <p class="text-sm text-gray-600">Purpose: ${req.purpose}</p>
            <p class="text-sm text-gray-600">Status: <span class="font-medium ${getStatusColor(req.status)}">${req.status}</span></p>
            <div class="flex gap-2 mt-2">
                ${req.status === 'pending' ? `
                <button class="approve-btn bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all transform hover:scale-105">Approve</button>
                <button class="reject-btn bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all transform hover:scale-105">Reject</button>
                ` : ''}
            </div>
        </div>
    `).join('');

    // Add event listeners to approve/reject buttons
    document.querySelectorAll('.approve-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const requestCard = button.closest('.request-card');
            const requestId = requestCard.dataset.id;
            await updateRequestStatus(requestId, 'approved');
            await renderRequestsFromLabs();
        });
    });

    document.querySelectorAll('.reject-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const requestCard = button.closest('.request-card');
            const requestId = requestCard.dataset.id;
            await updateRequestStatus(requestId, 'rejected');
            await renderRequestsFromLabs();
        });
    });
}

// Get Status Color
function getStatusColor(status) {
    switch (status) {
        case 'pending': return 'text-yellow-500';
        case 'approved': return 'text-green-500';
        case 'rejected': return 'text-red-500';
        default: return 'text-gray-500';
    }
}

// Update Request Status
async function updateRequestStatus(requestId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/${status === 'approved' ? 'approve' : 'reject'}/${requestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to ${status} request`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} request:`, error);
        return null;
    }
}

// Handle Post Request Form Submission
// Handle Form Submission
async function handlePostRequestFormSubmit(e) {
    e.preventDefault();
    const labId = document.getElementById('select-lab').value;
    const equipmentId = document.getElementById('select-equipment').value;
    const itemId = document.getElementById('select-item').value;
    const timeSlot = document.getElementById('select-time-slot').value;
    const purpose = document.getElementById('request-purpose').value;

    try {
        const response = await fetch(`${API_BASE_URL}/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lab_id: labId,
                equipment_id: equipmentId,
                item_id: itemId,
                time_slot: timeSlot,
                purpose,
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to post request');
        }
        alert('Request submitted successfully!');
        document.getElementById('post-request-modal').classList.add('hidden');
    } catch (error) {
        console.error('Error submitting request:', error);
        alert('Failed to submit request. Please try again.');
    }
}
// Initialize Page
document.addEventListener('DOMContentLoaded', async () => {
    initializeModals();
    await renderAvailableEquipment();
    await renderRequestsFromLabs();
    await populateLabs();

    // Handle Lab Selection
    document.getElementById('select-lab').addEventListener('change', async (e) => {
        const labId = e.target.value;
        await populateEquipment(labId);
    });

    // Handle Equipment Selection
    document.getElementById('select-equipment').addEventListener('change', async (e) => {
        const equipmentId = e.target.value;
        await populateItems(equipmentId);
    });

    // Handle Item Selection
    document.getElementById('select-item').addEventListener('change', () => {
        document.getElementById('time-slot-section').classList.remove('hidden');
    });

    // Handle Time Slot Selection
    document.getElementById('select-time-slot').addEventListener('change', () => {
        document.getElementById('purpose-section').classList.remove('hidden');
        document.getElementById('submit-btn').classList.remove('hidden');
    });

    // Handle Form Submission
    document.getElementById('post-request-form').addEventListener('submit', handlePostRequestFormSubmit);
});
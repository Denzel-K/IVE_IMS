// const API_BASE_URL = 'http://localhost:3500/api/equipment-sharing';

// // Initialize Modals
// function initializeModals() {
//     // Open Modal
//     const openButton = document.getElementById('post-request-btn');
//     if (openButton) {
//         openButton.addEventListener('click', () => {
//             const modal = document.getElementById('post-request-modal');
//             if (modal) {
//                 modal.classList.remove('hidden');
//                 console.log("Modal opened");
//             }
//         });
//     }

//     // Close Modal
//     const closeButtons = document.querySelectorAll('.close-modal');
//     closeButtons.forEach(button => {
//         button.addEventListener('click', () => {
//             const modal = button.closest('.modal-content');
//             if (modal) {
//                 modal.parentElement.classList.add('hidden');
//                 console.log("Modal closed");
//             }
//         });
//     });

//     // Close Modal When Clicking Outside
//     window.addEventListener('click', (e) => {
//         const modal = document.getElementById('post-request-modal');
//         if (e.target === modal) {
//             modal.classList.add('hidden');
//             console.log("Modal closed (outside click)");
//         }
//     });
// }

// // Fetch Data from Backend
// async function fetchData(endpoint) {
//     try {
//         const response = await fetch(`${API_BASE_URL}/${endpoint}`);
//         if (!response.ok) {
//             throw new Error(`Failed to fetch data from ${endpoint}`);
//         }
//         return await response.json();
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         return [];
//     }
// }

// // Populate Labs Dropdown
// async function populateLabs() {
//     const labs = await fetchData('labs');
//     const selectLab = document.getElementById('select-lab');
//     if (selectLab) {
//         selectLab.innerHTML = labs.map(lab => `<option value="${lab}">${lab}</option>`).join('');
//     }
// }

// // Populate Equipment Dropdown
// async function populateEquipment(lab) {
//     const equipment = await fetchData(`equipment?lab=${lab}`);
//     const selectEquipment = document.getElementById('select-equipment');
//     if (selectEquipment) {
//         selectEquipment.innerHTML = equipment.map(eq => `<option value="${eq.id}">${eq.name}</option>`).join('');
//         document.getElementById('equipment-section').classList.remove('hidden');
//     }
// }

// // Populate Items Dropdown
// async function populateItems(equipmentId) {
//     const items = await fetchData(`items?equipmentId=${equipmentId}`);
//     const selectItem = document.getElementById('select-item');
//     if (selectItem) {
//         selectItem.innerHTML = items.map(item => `<option value="${item.unique_code}">${item.unique_code}</option>`).join('');
//         document.getElementById('item-section').classList.remove('hidden');
//     }
// }

// // Render Available Equipment
// async function renderAvailableEquipment() {
//     const container = document.getElementById('available-equipment');
//     if (!container) return;

//     // Get the current lab from the user data
//     const userDataElement = document.getElementById('user-data');
//     if (!userDataElement) {
//         console.error("User data element not found");
//         return;
//     }
//     const currentLab = userDataElement.getAttribute('data-current-lab');
//     console.log("Current Lab:", currentLab);

//     const availableEquipment = await fetchData(`available?currentLab=${currentLab}`);
//     console.log("Available Equipment:", availableEquipment);

//     // Map the backend response to match the expected field names
//     const mappedEquipment = availableEquipment.map(eq => ({
//         equipment_id: eq.id,  // Rename `id` to `equipment_id`
//         equipment_name: eq.name,  // Rename `name` to `equipment_name`
//         lab: eq.lab,
//         available_quantity: eq.available_quantity
//     }));

//     container.innerHTML = mappedEquipment.map(eq => `
//         <div class="equipment-card bg-white p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer" data-id="${eq.equipment_id}">
//             <h4 class="font-semibold text-indigo-800">${eq.equipment_name}</h4>
//             <p class="text-sm text-gray-600">Lab: ${eq.lab}</p>
//             <p class="text-sm text-gray-600">Available: ${eq.available_quantity}</p>
//         </div>
//     `).join('');

//     // Add event listeners to equipment cards
//     document.querySelectorAll('.equipment-card').forEach(card => {
//         card.addEventListener('click', () => {
//             const equipmentId = card.dataset.id;
//             const equipment = mappedEquipment.find(eq => eq.equipment_id == equipmentId);
//             showEquipmentDetails(equipment);
//         });
//     });
// }

// // Show Equipment Details
// function showEquipmentDetails(equipment) {
//     const container = document.getElementById('equipment-details-content');
//     if (!container) return;

//     container.innerHTML = `
//         <h4 class="font-semibold text-indigo-800">${equipment.equipment_name}</h4>
//         <p class="text-sm text-gray-600">Lab: ${equipment.lab}</p>
//         <p class="text-sm text-gray-600">Available: ${equipment.available_quantity}</p>
//     `;

//     document.getElementById('equipment-details-modal').classList.remove('hidden');
// }

// // Render Requests from Other Labs
// async function renderRequestsFromLabs() {
//     const container = document.getElementById('requests-from-labs');
//     if (!container) return;

//     const requestsFromLabs = await fetchData('requests');
//     container.innerHTML = requestsFromLabs.map(req => `
//         <div class="request-card bg-white p-4 border border-gray-200 rounded-lg" data-id="${req.id}">
//             <h4 class="font-semibold text-indigo-800">${req.equipment_name}</h4>
//             <p class="text-sm text-gray-600">From: ${req.from_lab}</p>
//             <p class="text-sm text-gray-600">To: ${req.to_lab}</p>
//             <p class="text-sm text-gray-600">Quantity: ${req.quantity}</p>
//             <p class="text-sm text-gray-600">Time Slot: ${req.time_slot}</p>
//             <p class="text-sm text-gray-600">Purpose: ${req.purpose}</p>
//             <p class="text-sm text-gray-600">Status: <span class="font-medium ${getStatusColor(req.status)}">${req.status}</span></p>
//             <div class="flex gap-2 mt-2">
//                 ${req.status === 'pending' ? `
//                 <button class="approve-btn bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all transform hover:scale-105">Approve</button>
//                 <button class="reject-btn bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all transform hover:scale-105">Reject</button>
//                 ` : ''}
//             </div>
//         </div>
//     `).join('');

//     // Add event listeners to approve/reject buttons
//     document.querySelectorAll('.approve-btn').forEach(button => {
//         button.addEventListener('click', async () => {
//             const requestCard = button.closest('.request-card');
//             const requestId = requestCard.dataset.id;
//             await updateRequestStatus(requestId, 'approved');
//             await renderRequestsFromLabs();
//         });
//     });

//     document.querySelectorAll('.reject-btn').forEach(button => {
//         button.addEventListener('click', async () => {
//             const requestCard = button.closest('.request-card');
//             const requestId = requestCard.dataset.id;
//             await updateRequestStatus(requestId, 'rejected');
//             await renderRequestsFromLabs();
//         });
//     });
// }

// // Get Status Color
// function getStatusColor(status) {
//     switch (status) {
//         case 'pending': return 'text-yellow-500';
//         case 'approved': return 'text-green-500';
//         case 'rejected': return 'text-red-500';
//         default: return 'text-gray-500';
//     }
// }

// // Update Request Status
// async function updateRequestStatus(requestId, status) {
//     try {
//         const response = await fetch(`${API_BASE_URL}/${status === 'approved' ? 'approve' : 'reject'}/${requestId}`, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         });
//         if (!response.ok) {
//             throw new Error(`Failed to ${status} request`);
//         }
//         return await response.json();
//     } catch (error) {
//         console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} request:`, error);
//         return null;
//     }
// }

// // Handle Post Request Form Submission
// async function handlePostRequestFormSubmit(e) {
//     e.preventDefault();
//     const fromLab = document.getElementById('select-lab').value;
//     const equipmentId = document.getElementById('select-equipment').value;
//     const uniqueCode = document.getElementById('select-item').value;
//     const timeSlot = document.getElementById('select-time-slot').value;
//     const purpose = document.getElementById('request-purpose').value;

//     try {
//         const response = await fetch(`${API_BASE_URL}/request`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 equipment_name: document.getElementById('select-equipment').selectedOptions[0].text,
//                 from_lab: fromLab,
//                 to_lab: 'Your Lab', // Replace with the actual lab requesting the equipment
//                 quantity: 1, // Since we're selecting a single item
//                 purpose,
//                 time_slot: timeSlot,
//             }),
//         });
//         if (!response.ok) {
//             throw new Error('Failed to post request');
//         }
//         alert('Request submitted successfully!');
//         document.getElementById('post-request-modal').classList.add('hidden');
//     } catch (error) {
//         console.error('Error submitting request:', error);
//         alert('Failed to submit request. Please try again.');
//     }
// }

// // Initialize Page
// document.addEventListener('DOMContentLoaded', async () => {
//     initializeModals();
//     await renderAvailableEquipment();
//     await renderRequestsFromLabs();
//     await populateLabs();

//     // Handle Lab Selection
//     const selectLab = document.getElementById('select-lab');
//     if (selectLab) {
//         selectLab.addEventListener('change', async (e) => {
//             const lab = e.target.value;
//             await populateEquipment(lab);
//         });
//     }

//     // Handle Equipment Selection
//     const selectEquipment = document.getElementById('select-equipment');
//     if (selectEquipment) {
//         selectEquipment.addEventListener('change', async (e) => {
//             const equipmentId = e.target.value;
//             await populateItems(equipmentId);
//         });
//     }

//     // Handle Item Selection
//     const selectItem = document.getElementById('select-item');
//     if (selectItem) {
//         selectItem.addEventListener('change', () => {
//             document.getElementById('time-slot-section').classList.remove('hidden');
//         });
//     }

//     // Handle Time Slot Selection
//     const selectTimeSlot = document.getElementById('select-time-slot');
//     if (selectTimeSlot) {
//         selectTimeSlot.addEventListener('change', () => {
//             document.getElementById('purpose-section').classList.remove('hidden');
//             document.getElementById('submit-btn').classList.remove('hidden');
//         });
//     }

//     // Handle Form Submission
//     const postRequestForm = document.getElementById('post-request-form');
//     if (postRequestForm) {
//         postRequestForm.addEventListener('submit', handlePostRequestFormSubmit);
//     }
// });

// Include the JavaScript code you provided earlier here
const API_BASE_URL = 'http://localhost:3500/api/equipment-sharing';

// Initialize Modals
function initializeModals() {
    // Open Modal
    const openButton = document.getElementById('post-request-btn');
    if (openButton) {
        openButton.addEventListener('click', () => {
            const modal = document.getElementById('post-request-modal');
            if (modal) {
                modal.classList.remove('hidden');
                console.log("Modal opened");
            }
        });
    }

    // Close Modal
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal-content');
            if (modal) {
                modal.parentElement.classList.add('hidden');
                console.log("Modal closed");
            }
        });
    });

    // Close Modal When Clicking Outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('post-request-modal');
        if (e.target === modal) {
            modal.classList.add('hidden');
            console.log("Modal closed (outside click)");
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
    const labs = await fetchData('labs');
    const selectLab = document.getElementById('select-lab');
    if (selectLab) {
        selectLab.innerHTML = labs.map(lab => `<option value="${lab}">${lab}</option>`).join('');
    }
}

// Populate Equipment Dropdown
async function populateEquipment(lab) {
    const equipment = await fetchData(`equipment?lab=${lab}`);
    const selectEquipment = document.getElementById('select-equipment');
    if (selectEquipment) {
        selectEquipment.innerHTML = equipment.map(eq => `<option value="${eq.id}">${eq.name}</option>`).join('');
        document.getElementById('equipment-section').classList.remove('hidden');
    }
}

// Populate Items Dropdown
async function populateItems(equipmentId) {
    const items = await fetchData(`items?equipmentId=${equipmentId}`);
    const selectItem = document.getElementById('select-item');
    if (selectItem) {
        selectItem.innerHTML = items.map(item => `<option value="${item.unique_code}">${item.unique_code}</option>`).join('');
        document.getElementById('item-section').classList.remove('hidden');
    }
}

// Render Available Equipment
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
    console.log("Current Lab:", currentLab);

    const availableEquipment = await fetchData(`available?currentLab=${currentLab}`);
    console.log("Available Equipment:", availableEquipment);

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
        <p class="text-sm text-gray-600">Lab: ${equipment.lab}</p>
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
async function handlePostRequestFormSubmit(e) {
    e.preventDefault();
    const fromLab = document.getElementById('select-lab').value;
    const equipmentId = document.getElementById('select-equipment').value;
    const uniqueCode = document.getElementById('select-item').value;
    const timeSlot = document.getElementById('select-time-slot').value;
    const purpose = document.getElementById('request-purpose').value;

    try {
        const response = await fetch(`${API_BASE_URL}/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                equipment_name: document.getElementById('select-equipment').selectedOptions[0].text,
                from_lab: fromLab,
                to_lab: 'Your Lab', // Replace with the actual lab requesting the equipment
                quantity: 1, // Since we're selecting a single item
                purpose,
                time_slot: timeSlot,
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
    const selectLab = document.getElementById('select-lab');
    if (selectLab) {
        selectLab.addEventListener('change', async (e) => {
            const lab = e.target.value;
            await populateEquipment(lab);
        });
    }

    // Handle Equipment Selection
    const selectEquipment = document.getElementById('select-equipment');
    if (selectEquipment) {
        selectEquipment.addEventListener('change', async (e) => {
            const equipmentId = e.target.value;
            await populateItems(equipmentId);
        });
    }

    // Handle Item Selection
    const selectItem = document.getElementById('select-item');
    if (selectItem) {
        selectItem.addEventListener('change', () => {
            document.getElementById('time-slot-section').classList.remove('hidden');
        });
    }

    // Handle Time Slot Selection
    const selectTimeSlot = document.getElementById('select-time-slot');
    if (selectTimeSlot) {
        selectTimeSlot.addEventListener('change', () => {
            document.getElementById('purpose-section').classList.remove('hidden');
            document.getElementById('submit-btn').classList.remove('hidden');
        });
    }

    // Handle Form Submission
    const postRequestForm = document.getElementById('post-request-form');
    if (postRequestForm) {
        postRequestForm.addEventListener('submit', handlePostRequestFormSubmit);
    }
});
// Modal Handling
const addBtn = document.querySelector('.add-equipment-btn');
const modal = document.querySelector('.equipment-modal');
const closeBtn = document.querySelector('.close-modal');

if (addBtn && modal && closeBtn) {
    addBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => e.target === modal && modal.classList.add('hidden'));
}

// Dynamic Form Fields
const equipmentTypeField = document.getElementById('equipmentType');
if (equipmentTypeField) {
    equipmentTypeField.addEventListener('change', (e) => {
        const specFields = document.getElementById('spec-fields');
        if (specFields) {
            specFields.classList.toggle('hidden', 
                e.target.value !== 'electrical' && e.target.value !== 'mechanical'
            );
        }
    });
}

// Function to fetch inventory data from the backend
// Function to fetch inventory data from the backend
async function fetchInventory() {
    const lab = 'design_studio';
    try {
        const response = await fetch(`http://localhost:3500/api/inventory/my-lab/${lab}`);
        if (!response.ok) {
            throw new Error('Failed to fetch inventory data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return [];
    }
}

// Function to render inventory data on the page
// Function to render inventory data on the page
async function renderInventory() {
    const inventoryGrid = document.querySelector('.grid.grid-cols-3.gap-4.mt-6');
    if (!inventoryGrid) return;

    // Clear existing content
    inventoryGrid.innerHTML = '';

    // Fetch inventory data from the backend
    const inventoryData = await fetchInventory();

    // Group inventory items by category
    const categories = {
        electrical: { title: 'Electrical Tools', icon: 'fas fa-bolt', items: [] },
        mechanical: { title: 'Mechanical Tools', icon: 'fas fa-tools', items: [] },
        consumables: { title: 'Consumables', icon: 'fas fa-cubes', items: [] },
    };

    inventoryData.forEach(item => {
        if (categories[item.type]) {
            categories[item.type].items.push(item);
        }
    });

    // Render each category
    for (const [type, category] of Object.entries(categories)) {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'bg-white p-6 rounded-lg shadow-md';
        categoryCard.innerHTML = `
            <h3 class="text-lg font-semibold"><i class="${category.icon}"></i> ${category.title}</h3>
            <div class="space-y-2 mt-4">
                ${category.items.map(item => `
                    <div class="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span>${item.name}</span>
                        <div class="px-3 py-1 ${getStatusClass(item.status)}">${item.status}</div>
                    </div>
                `).join('')}
            </div>
        `;
        inventoryGrid.appendChild(categoryCard);
    }
}
// Helper function to get the status class based on the status
// Helper function to get the status class based on the status
function getStatusClass(status) {
    switch (status) {
        case 'available':
            return 'bg-green-100 text-green-800 rounded-full';
        case 'in-use':
            return 'bg-red-100 text-red-800 rounded-full';
        case 'maintenance':
            return 'bg-yellow-100 text-yellow-800 rounded-full';
        default:
            return 'bg-gray-100 text-gray-800 rounded-full';
    }
}
// Function to add a new equipment to the backend
async function addEquipment(formData) {
    try {
        const response = await fetch('http://localhost:3500/api/inventory/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        if (!response.ok) {
            throw new Error('Failed to add equipment');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error adding equipment:', error);
        return null;
    }
}

// Form Submission
// Form Submission
const addEquipmentForm = document.getElementById('addEquipmentForm');
if (addEquipmentForm) {
    addEquipmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('equipmentName').value,
            type: document.getElementById('equipmentType').value,
            status: document.getElementById('equipmentStatus').value,
            quantity: parseInt(document.getElementById('equipmentQuantity').value), // Add quantity
        };

        if (['electrical', 'mechanical'].includes(formData.type)) {
            formData.powerRating = document.getElementById('powerRating').value;
            formData.manufacturer = document.getElementById('manufacturer').value;
        }

        try {
            const response = await fetch('http://localhost:3500/api/inventory/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the JWT token
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to add equipment');
            }

            const result = await response.json();
            alert(`Equipment added successfully! Unique Code: ${result.uniqueCode}`);
            addEquipmentForm.reset();
            modal.classList.add('hidden');
            await renderInventory(); // Refresh the inventory list
        } catch (error) {
            console.error('Error adding equipment:', error);
            alert('Failed to add equipment. Please try again.');
        }
    });
}

// Initial render of inventory data
document.addEventListener('DOMContentLoaded', renderInventory);
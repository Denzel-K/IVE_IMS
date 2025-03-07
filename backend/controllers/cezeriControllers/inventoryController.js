const Equipment = require('../../models/cezeriModels/Equipment');
const db = require("../../config/db");

// ✅ Add Equipment
// ✅ Add Equipment
exports.addEquipment = (req, res) => {
    const { name, type, status, powerRating, manufacturer, quantity } = req.body;

    // Extract lab from the JWT token
    const lab = req.user.lab;

    if (!name || !type || !status || !lab || !quantity) {
        return res.status(400).json({ message: 'Name, Type, Status, Lab, and Quantity are required' });
    }

    // Generate a unique code for the equipment group
    const uniqueCode = `EQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Step 1: Insert into the `equipment` table
    const insertEquipmentQuery = `
        INSERT INTO equipment (name, type, unique_code, status, power_rating, manufacturer, lab, quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const equipmentValues = [name, type, uniqueCode, status, powerRating, manufacturer, lab, quantity];

    db.query(insertEquipmentQuery, equipmentValues, (err, equipmentResult) => {
        if (err) {
            console.error('Error adding equipment:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        const equipmentId = equipmentResult.insertId; // Get the ID of the newly inserted equipment

        // Step 2: Insert individual items into `equipmentitems`
        const insertEquipmentItemsQuery = `
            INSERT INTO equipmentitems (equipment_id, unique_code, status)
            VALUES (?, ?, ?)
        `;

        let itemsInserted = 0; // Counter to track how many items have been inserted

        // Generate unique codes for each item
        for (let i = 0; i < quantity; i++) {
            const itemUniqueCode = `${uniqueCode}-${i + 1}`; // Append a suffix to make each code unique

            db.query(insertEquipmentItemsQuery, [equipmentId, itemUniqueCode, status], (err) => {
                if (err) {
                    console.error('Error adding equipment item:', err);
                    return res.status(500).json({ message: 'Database error' });
                }

                itemsInserted++;

                // Check if all items have been inserted
                if (itemsInserted === quantity) {
                    res.status(201).json({ message: 'Equipment added successfully', uniqueCode });
                }
            });
        }
    });
};

// ✅ Get Equipment Details
exports.getEquipmentDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const equipmentWithItems = await Equipment.getEquipmentWithItems(id);
        if (!equipmentWithItems.length) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        const response = {
            id: equipmentWithItems[0].id,
            name: equipmentWithItems[0].name,
            type: equipmentWithItems[0].type,
            status: equipmentWithItems[0].status,
            quantity: equipmentWithItems[0].quantity,
            items: equipmentWithItems.map(item => ({
                unique_code: item.item_code,
                status: item.item_status,
            })),
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching equipment details:', error);
        res.status(500).json({ message: 'Database error' });
    }
};
// // ✅ Get all equipment
// exports.listEquipment = (req, res) => {
//     Equipment.getAllEquipment((err, results) => {
//         if (err) return res.status(500).json({ message: 'Database error' });
//         res.json(results);
//     });
// };


// ✅ Get equipment for a specific lab
exports.getMyLabEquipment = async (req, res) => {
    try {
        const { lab } = req.params;  // Extract lab name from request params
        const equipment = await Equipment.getEquipmentByLab(lab);
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching equipment from your lab', error });
    }
};

// ✅ Get equipment from other labs
exports.getOtherLabsEquipment = async (req, res) => {
    try {
        const { lab } = req.params;  // Extract lab name from request params
        const equipment = await Equipment.getEquipmentFromOtherLabs(lab);
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching equipment from other labs', error });
    }
};

// ✅ Get all equipment (both your lab & other labs)
exports.listEquipment = async (req, res) => {
    try {
        const { lab } = req.query; // Get lab name from query params
        const myLabEquipment = await Equipment.getEquipmentByLab(lab);
        const otherLabsEquipment = await Equipment.getEquipmentFromOtherLabs(lab);
        res.json({ myLabEquipment, otherLabsEquipment });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching equipment list', error });
    }
};

// Get single equipment by ID
exports.getEquipmentById = async (req, res) => {
    try {
        const equipment = await Equipment.getEquipmentById(req.params.id);
        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching equipment details', error });
    }
};

// Search Equipment by Category
exports.getEquipmentByType = async (req, res) => {
    try {
        const { type } = req.params;
        const equipment = await Equipment.getEquipmentByType(type);
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching equipment by category', error });
    }
};

// Get Equipment by QR Code
exports.getEquipmentByQRCode = async (req, res) => {
    try {
        const { code } = req.params;
        const equipment = await Equipment.getEquipmentByQRCode(code);
        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching equipment by QR code', error });
    }
};

// ✅ Delete Equipment (Admin & Lab Manager)
exports.deleteEquipment = (req, res) => {
    const { id } = req.params;
    Equipment.deleteEquipment(id, (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Equipment not found' });
        res.json({ message: 'Equipment deleted successfully' });
    });
};

// ✅ Update Equipment Status (Lab Manager & Technician)
exports.updateEquipmentStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["available", "in-use", "maintenance"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    Equipment.updateStatus(id, status, (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Equipment not found' });
        res.json({ message: 'Status updated successfully' });
    });
};

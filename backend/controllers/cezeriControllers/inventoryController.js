const Equipment = require('../../models/cezeriModels/Equipment');
const db = require("../../config/db");

// ✅ Add Equipment (Admin & Lab Manager)
exports.addEquipment = (req, res) => {
    const { name, type, status, powerRating, manufacturer, quantity } = req.body;

    // Extract lab from the JWT token
    const lab = req.user.lab;

    if (!name || !type || !status || !lab || !quantity) {
        return res.status(400).json({ message: 'Name, Type, Status, Lab, and Quantity are required' });
    }

    const uniqueCode = `EQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    Equipment.addEquipment(name, type, uniqueCode, status, powerRating, manufacturer, lab, quantity, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({ message: 'Equipment added successfully', uniqueCode });
    });
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

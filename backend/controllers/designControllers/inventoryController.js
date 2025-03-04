const Equipment = require('../designModels/Equipment');
const db = require('../config/db');

// ✅ Add Equipment (Admin & Lab Manager)
exports.addEquipment = (req, res) => {
    const { name, type, status, powerRating, manufacturer, lab, quantity } = req.body;

    if (!name || !type || !status) {
        return res.status(400).json({ message: 'Name, Type, and Status are required' });
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

// ✅ Get all equipment
exports.listEquipment = (req, res) => {
    Equipment.getAllEquipment((err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results);
    });
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

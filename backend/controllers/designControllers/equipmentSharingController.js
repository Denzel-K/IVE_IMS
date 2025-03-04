const db = require('../config/db'); // Database connection

// ✅ Fetch Available Equipment from Other Labs
exports.getAvailableEquipment = (req, res) => {
    const sql = `SELECT id, name, lab, quantity FROM equipment WHERE quantity > 0`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
};

// ✅ Fetch Equipment Requests from Other Labs
exports.getEquipmentRequests = (req, res) => {
    const sql = `SELECT id, equipment_name, lab, quantity, purpose, status FROM equipment_requests`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
};

// ✅ Post a New Equipment Request
exports.postEquipmentRequest = (req, res) => {
    const { equipment_name, lab, quantity, purpose } = req.body;

    if (!equipment_name || !lab || !quantity || !purpose) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = `INSERT INTO equipment_requests (equipment_name, lab, quantity, purpose, status) VALUES (?, ?, ?, ?, 'pending')`;
    db.query(sql, [equipment_name, lab, quantity, purpose], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json({ message: "Request posted successfully", requestId: result.insertId });
    });
};

// ✅ Approve Equipment Request
exports.approveRequest = (req, res) => {
    const { id } = req.params;

    const sqlUpdateRequest = `UPDATE equipment_requests SET status = 'approved' WHERE id = ?`;
    db.query(sqlUpdateRequest, [id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.json({ message: "Request approved successfully" });
    });
};

// ✅ Reject Equipment Request
exports.rejectRequest = (req, res) => {
    const { id } = req.params;

    const sqlUpdateRequest = `UPDATE equipment_requests SET status = 'rejected' WHERE id = ?`;
    db.query(sqlUpdateRequest, [id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.json({ message: "Request rejected successfully" });
    });
};

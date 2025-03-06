const db = require("../../config/db");

exports.getAvailableEquipment = (req, res) => {
    const sql = `SELECT id, equipment_name, from_lab, to_lab, quantity, status FROM equipment_requests WHERE status = 'approved'`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
};


// ✅ Fetch Pending Equipment Requests
exports.getPendingRequests = (req, res) => {
    const sql = `SELECT * FROM equipment_requests WHERE status = 'pending'`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
};

// ✅ Fetch Rejected Equipment Requests
exports.getRejectedRequests = (req, res) => {
    const sql = `SELECT * FROM equipment_requests WHERE status = 'rejected'`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
};

// ✅ Fetch Approved Equipment Requests
exports.getApprovedRequests = (req, res) => {
    const sql = `SELECT * FROM equipment_requests WHERE status = 'approved'`;
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
    const sql = `SELECT id, equipment_name, from_lab, to_lab, quantity, purpose, time_slot, status, requested_by, created_at FROM equipment_requests`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
};

// ✅ Post a New Equipment Request with Lab Selection & Time Slot
exports.postEquipmentRequest = (req, res) => {
    const { equipment_name, from_lab, to_lab, quantity, purpose, time_slot } = req.body;

    if (!equipment_name || !from_lab || !to_lab || !quantity || !purpose || !time_slot) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = `INSERT INTO equipment_requests (equipment_name, from_lab, to_lab, quantity, purpose, time_slot, status) 
                 VALUES (?, ?, ?, ?, ?, ?, 'pending')`;
    db.query(sql, [equipment_name, from_lab, to_lab, quantity, purpose, time_slot], (err, result) => {
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

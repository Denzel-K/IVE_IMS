const db = require("../../config/db");
const { validationResult } = require('express-validator');

// ✅ Fetch Available Equipment from Other Labs
exports.getAvailableEquipment = (req, res) => {
    const { currentLab } = req.query; // Get the current lab from query params
    console.log("Current Lab (Backend):", currentLab); // Debugging

    const sql = `
        SELECT 
            e.id AS id,
            e.name AS name,
            e.lab AS lab,
            COUNT(i.id) AS available_quantity
        FROM 
            equipment e
        LEFT JOIN 
            equipmentitems i ON e.id = i.equipment_id AND i.status = 'available'
        WHERE 
            e.lab != ?
        GROUP BY 
            e.id, e.name, e.lab
        HAVING 
            available_quantity > 0;
    `;

    // Ensure the currentLab matches the database value (e.g., 'design_studio')
    const filteredLab = currentLab === 'designstudio' ? 'design_studio' : currentLab;

    db.query(sql, [filteredLab], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        console.log("Query Results:", results); // Debugging
        res.json(results);
    });
};

// ✅ Fetch Equipment Requests from Other Labs
exports.getEquipmentRequests = (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const sql = `
        SELECT id, equipment_name, from_lab, to_lab, quantity, purpose, time_slot, status, requested_by, created_at 
        FROM equipment_requests
        LIMIT ? OFFSET ?
    `;
    db.query(sql, [parseInt(limit), parseInt(offset)], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, data: results });
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


// Fetch Labs
exports.getLabs = (req, res) => {
    const sql = `SELECT DISTINCT lab FROM equipment`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results.map(row => row.lab));
    });
};

// Fetch Equipment by Lab
exports.getEquipmentByLab = (req, res) => {
    const { lab } = req.query;
    const sql = `
        SELECT id, name 
        FROM equipment 
        WHERE lab = ?
    `;
    db.query(sql, [lab], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
};

// Fetch Items by Equipment
exports.getItemsByEquipment = (req, res) => {
    const { equipmentId } = req.query;
    const sql = `
        SELECT unique_code 
        FROM equipmentitems 
        WHERE equipment_id = ? AND status = 'available'
    `;
    db.query(sql, [equipmentId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
};

// ✅ Post a New Equipment Request
// Post Equipment Request
exports.postEquipmentRequest = (req, res) => {
    const { equipment_name, from_lab, to_lab, quantity, purpose, time_slot } = req.body;

    // Get the user ID from the authenticated user (e.g., from the session or token)
    const requested_by = req.user.id; // Assuming you have user authentication middleware

    if (!equipment_name || !from_lab || !to_lab || !quantity || !purpose || !time_slot || !requested_by) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = `
        INSERT INTO equipment_requests 
        (equipment_name, from_lab, to_lab, quantity, purpose, time_slot, status, requested_by) 
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `;
    db.query(sql, [equipment_name, from_lab, to_lab, quantity, purpose, time_slot, requested_by], (err, result) => {
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

    const sql = `
        UPDATE equipment_requests 
        SET status = 'approved' 
        WHERE id = ?
    `;
    db.query(sql, [id], (err, result) => {
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

    const sql = `
        UPDATE equipment_requests 
        SET status = 'rejected' 
        WHERE id = ?
    `;
    db.query(sql, [id], (err, result) => {
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
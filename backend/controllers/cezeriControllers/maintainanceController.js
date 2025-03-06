const db = require("../../config/db");

// Log a Maintenance Record
exports.logMaintenance = (req, res) => {
    const { equipment_id, technician_id, last_maintenance, next_maintenance, issue, status } = req.body;
    const sql = `INSERT INTO maintenance_logs (equipment_id, technician_id, last_maintenance, next_maintenance, issue, status) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sql, [equipment_id, technician_id, last_maintenance, next_maintenance, issue, status], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error logging maintenance', error: err });
        res.status(201).json({ message: 'Maintenance logged successfully' });
    });
};

// Get Maintenance Schedule
exports.getMaintenanceSchedule = (req, res) => {
    const sql = `SELECT * FROM maintenance_logs ORDER BY next_maintenance ASC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching maintenance schedule', error: err });
        res.json(results);
    });
};

// Get Upcoming Maintenance
exports.getUpcomingMaintenance = (req, res) => {
    const sql = `SELECT * FROM maintenance_logs WHERE next_maintenance >= CURDATE() ORDER BY next_maintenance ASC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching upcoming maintenance', error: err });
        res.json(results);
    });
};

// Request Maintenance
exports.requestMaintenance = (req, res) => {
    const { equipment_id, requested_by, issue } = req.body;
    const sql = `INSERT INTO maintenance_requests (equipment_id, requested_by, issue) VALUES (?, ?, ?)`;
    db.query(sql, [equipment_id, requested_by, issue], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error requesting maintenance', error: err });
        res.status(201).json({ message: 'Maintenance request submitted successfully' });
    });
};

// Approve Maintenance Request
exports.approveMaintenance = (req, res) => {
    const { id } = req.params;
    const sql = `UPDATE maintenance_requests SET status = 'completed' WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error approving maintenance', error: err });
        res.json({ message: 'Maintenance request approved' });
    });
};

// Get pending Maintenance Requests
exports.getMaintenanceRequests = (req, res) => {
    const sql = `SELECT * FROM maintenance_requests WHERE status = 'pending'`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching maintenance requests', error: err });
        res.json(results);
    });
};

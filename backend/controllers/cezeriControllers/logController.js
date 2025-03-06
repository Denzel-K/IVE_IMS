const db = require("../../config/db");

// ✅ Get Usage Logs
exports.getUsageLogs = (req, res) => {
    const sql = `
        SELECT ul.id, e.name AS equipment, u.name AS user, ul.start_time, ul.end_time
        FROM usage_logs ul
        JOIN Equipment e ON ul.equipment_id = e.id
        JOIN Users u ON ul.user_id = u.id
        ORDER BY ul.start_time DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching usage logs", error: err });
        }
        res.json(results);
    });
};

// ✅ Export Usage Logs (Placeholder for CSV or PDF logic)
exports.exportUsageLogs = (req, res) => {
    res.json({ message: "Export functionality will be implemented soon!" });
};

// ✅ Get Misuse Reports
exports.getMisuseReports = (req, res) => {
    const sql = `
        SELECT mr.id, e.name AS equipment, u.name AS reported_by, mr.issue, mr.reported_at
        FROM misuse_reports mr
        JOIN Equipment e ON mr.equipment_id = e.id
        JOIN Users u ON mr.reported_by = u.id
        ORDER BY mr.reported_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching misuse reports", error: err });
        }
        res.json(results);
    });
};

// ✅ Report Equipment Misuse
exports.reportMisuse = (req, res) => {
    const { equipment_id, reported_by, issue } = req.body;

    if (!equipment_id || !reported_by || !issue) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = "INSERT INTO misuse_reports (equipment_id, reported_by, issue) VALUES (?, ?, ?)";
    db.query(sql, [equipment_id, reported_by, issue], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error reporting misuse", error: err });
        }
        res.json({ message: "Misuse report submitted successfully", reportId: result.insertId });
    });
};

// Get Usage Logs
exports.getUsageLogs = (req, res) => {
    const sql = `SELECT ul.id, e.name AS equipment, u.name AS user, ul.start_time, ul.end_time, ul.date
                 FROM usage_logs ul
                 JOIN Equipment e ON ul.equipment_id = e.id
                 JOIN Users u ON ul.user_id = u.id
                 ORDER BY ul.date DESC`;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching usage logs", error: err });
        res.json(results);
    });
};

// Add a usage log
exports.addLog = (req, res) => {
    const { equipment_id, user_id, start_time, end_time, date } = req.body;

    if (!equipment_id || !user_id || !start_time || !end_time || !date) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const sql = `INSERT INTO usage_logs (equipment_id, user_id, start_time, end_time, date) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [equipment_id, user_id, start_time, end_time, date], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error adding usage log', error: err });

        res.status(201).json({ message: 'Usage log added successfully', logId: result.insertId });
    });
};
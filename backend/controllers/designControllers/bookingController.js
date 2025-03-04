const db = require("../config/db");

// ✅ Get available time slots
exports.getAvailableTimeSlots = (req, res) => {
    const sql = "SELECT * FROM TimeSlots WHERE available = TRUE";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
};

// ✅ Get available equipment
exports.getAvailableEquipment = (req, res) => {
    const sql = "SELECT * FROM Equipment WHERE status = 'available'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
};

// ✅ Create a new reservation
exports.createReservation = (req, res) => {
    const { equipment_id, time_slot_id, lab, purpose } = req.body;
    const user_id = req.user.id; // Extract from JWT

    if (!equipment_id || !time_slot_id || !lab || !purpose) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = "INSERT INTO Reservations (equipment_id, user_id, time_slot_id, lab, purpose) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [equipment_id, user_id, time_slot_id, lab, purpose], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", err });

        // Mark the time slot as unavailable
        db.query("UPDATE TimeSlots SET available = FALSE WHERE id = ?", [time_slot_id]);

        res.status(201).json({ message: "Reservation request submitted", reservation_id: result.insertId });
    });
};

// ✅ Get pending approvals
exports.getPendingApprovals = (req, res) => {
    const sql = `
        SELECT r.id, e.name AS equipment, t.slot_time AS time, u.email AS requestedBy, r.lab, r.purpose, r.status
        FROM Reservations r
        JOIN Equipment e ON r.equipment_id = e.id
        JOIN Users u ON r.user_id = u.id
        JOIN TimeSlots t ON r.time_slot_id = t.id
        WHERE r.status = 'pending'
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
};

// ✅ Approve or reject a reservation
exports.updateReservationStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    const sql = "UPDATE Reservations SET status = ? WHERE id = ?";
    db.query(sql, [status, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        res.json({ message: `Reservation ${status} successfully` });
    });
};

// ✅ Get approved reservations
exports.getApprovedReservations = (req, res) => {
    const sql = `
        SELECT r.id, e.name AS equipment, t.slot_time AS time, u.email AS requestedBy, r.lab, r.purpose
        FROM Reservations r
        JOIN Equipment e ON r.equipment_id = e.id
        JOIN Users u ON r.user_id = u.id
        JOIN TimeSlots t ON r.time_slot_id = t.id
        WHERE r.status = 'approved'
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
};

// ✅ Get booking logs
exports.getBookingLogs = (req, res) => {
    const sql = `
        SELECT b.id, e.name AS equipment, u.email AS user, b.start_time, b.end_time, b.lab, b.purpose
        FROM BookingLogs b
        JOIN Equipment e ON b.equipment_id = e.id
        JOIN Users u ON b.user_id = u.id
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
};

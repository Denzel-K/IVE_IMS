const db = require("../../config/db");

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
    
    // Ensure the user is authenticated
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized. User not authenticated" });
    }

    const user_id = req.user.id; // Extract user ID from JWT

    // Validate required fields
    if (!equipment_id || !time_slot_id || !lab || !purpose) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Insert reservation into the database with default status 'pending'
    const sql = "INSERT INTO Reservations (equipment_id, user_id, time_slot_id, lab, purpose, status) VALUES (?, ?, ?, ?, ?, 'pending')";
    
    db.query(sql, [equipment_id, user_id, time_slot_id, lab, purpose], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        const reservation_id = result.insertId;

        // Mark the time slot as unavailable after successful reservation insertion
        db.query("UPDATE TimeSlots SET available = FALSE WHERE id = ?", [time_slot_id], (updateErr) => {
            if (updateErr) {
                console.error("Error updating time slot:", updateErr);
                return res.status(500).json({ message: "Reservation created, but time slot update failed" });
            }

            res.status(201).json({ 
                message: "Reservation request submitted", 
                reservation_id 
            });
        });
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
        SELECT r.id, e.name AS equipment, t.slot_time AS time, u.name AS requestedBy, r.lab, r.purpose
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

// Get Equipment Availability
exports.getEquipmentAvailability = (req, res) => {
    const sql = `SELECT id, name AS equipment, status FROM Equipment`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching equipment availability", error: err });
        res.json(results);
    });
};

exports.getReservationById = (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM Reservations WHERE id = ?";
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error fetching reservation", err });
        if (result.length === 0) return res.status(404).json({ message: "Reservation not found" });
        res.status(200).json(result[0]);
    });
};

exports.deleteReservation = (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM Reservations WHERE id = ?";
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error deleting reservation", err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Reservation not found" });
        res.status(200).json({ message: "Reservation deleted successfully" });
    });
};
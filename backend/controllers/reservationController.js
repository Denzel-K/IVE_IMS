const Reservation = require('../models/reservation');

exports.createReservation = (req, res) => {
    console.log("🔍 Received User:", req.user); // ✅ Debugging

    const { equipment_id, project_id, start_time, end_time } = req.body;
    const reserved_by = req.user?.id; // Ensure user exists before accessing ID

    if (!reserved_by) {
        return res.status(401).json({ message: "Unauthorized: User ID is missing." });
    }

    Reservation.createReservation(equipment_id, project_id, reserved_by, start_time, end_time, (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        // 🚨 If reservation was rejected due to conflict, return conflict message
        if (!result.success) {
            console.log("⚠️ Conflict detected. Responding with error.");
            return res.status(400).json({ message: result.message });
        }

        // ✅ If reservation was successful, send success response
        return res.status(201).json({ message: result.message });
    });
};




exports.getReservations = (req, res) => {
    console.log("📌 getReservations function called!");
    
    Reservation.getReservations((err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        res.json(results);
    });
};

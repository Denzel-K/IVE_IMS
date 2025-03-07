const db = require("../../config/db");

exports.getAvailableTimeSlots = (req, res) => {
    const { date, equipment_id } = req.query;

    if (!date || !equipment_id) {
        return res.status(400).json({ message: "Date and equipment ID are required" });
    }

    const sql = `
        SELECT ts.* 
        FROM TimeSlots ts
        WHERE ts.available = TRUE
        AND ts.date = ?
        AND ts.id NOT IN (
            SELECT r.time_slot_id
            FROM Reservations r
            JOIN EquipmentItems ei ON r.equipment_item_id = ei.id
            WHERE ei.equipment_id = ? AND r.date = ?
        );`;

    db.query(sql, [date, equipment_id, date], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(results);
    });
};


// Backend: Create Reservation for Specific Item
exports.createReservation = (req, res) => {
    const { equipment_item_id, user_id, time_slot_id, date, lab, purpose } = req.body;

    // Start a transaction
    db.beginTransaction((err) => {
        if (err) {
            console.error("Transaction error:", err);
            return res.status(500).json({ message: "Transaction error" });
        }

        // Update equipment item status to 'in-use'
        const updateItemSql = "UPDATE EquipmentItems SET status = 'in-use' WHERE id = ?";
        db.query(updateItemSql, [equipment_item_id], (updateErr) => {
            if (updateErr) {
                return db.rollback(() => {
                    console.error("Error updating equipment item:", updateErr);
                    res.status(500).json({ message: "Error updating equipment item" });
                });
            }

            // Insert reservation
            const insertReservationSql = `
                INSERT INTO Reservations (equipment_item_id, user_id, time_slot_id, date, lab, purpose, status)
                VALUES (?, ?, ?, ?, ?, ?, 'pending')
            `;
            db.query(insertReservationSql, [equipment_item_id, user_id, time_slot_id, date, lab, purpose], (insertErr, result) => {
                if (insertErr) {
                    return db.rollback(() => {
                        console.error("Error creating reservation:", insertErr);
                        res.status(500).json({ message: "Error creating reservation" });
                    });
                }

                // Commit transaction
                db.commit((commitErr) => {
                    if (commitErr) {
                        return db.rollback(() => {
                            console.error("Commit error:", commitErr);
                            res.status(500).json({ message: "Commit error" });
                        });
                    }

                    res.status(201).json({ 
                        message: "Reservation created successfully", 
                        reservation_id: result.insertId 
                    });
                });
            });
        });
    });
};

// ✅ Get all available equipment
exports.getAvailableEquipment = (req, res) => {
    const sql = "SELECT * FROM Equipment WHERE status = 'available'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
};

// Backend: Fetch Available individual Equipment Items
exports.getAvailableEquipmentItems = (req, res) => {
    const { equipment_id } = req.query;

    const sql = `
        SELECT * 
        FROM EquipmentItems 
        WHERE equipment_id = ? AND status = 'available'
    `;

    db.query(sql, [equipment_id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(results);
    });
};

// ✅ Get pending approvals
exports.getPendingApprovals = (req, res) => {
    const sql = `
        SELECT r.id, e.name AS equipment, t.slot_time AS time, u.email AS requestedBy, r.lab, r.purpose, r.status
        FROM Reservations r
        JOIN EquipmentItems ei ON r.equipment_item_id = ei.id
        JOIN Equipment e ON ei.equipment_id = e.id
        JOIN Users u ON r.user_id = u.id
        JOIN TimeSlots t ON r.time_slot_id = t.id
        WHERE r.status = 'pending'
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
};

exports.updateReservationStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate the status
    if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Allowed values: 'approved', 'rejected'" });
    }

    // Start a database transaction
    db.beginTransaction((err) => {
        if (err) {
            console.error("Transaction error:", err);
            return res.status(500).json({ message: "Transaction error", error: err });
        }

        // Update the reservation status
        const updateReservationSql = "UPDATE Reservations SET status = ? WHERE id = ?";
        db.query(updateReservationSql, [status, id], (updateReservationErr, updateReservationResult) => {
            if (updateReservationErr) {
                return db.rollback(() => {
                    console.error("Error updating reservation:", updateReservationErr);
                    res.status(500).json({ message: "Error updating reservation", error: updateReservationErr });
                });
            }

            if (updateReservationResult.affectedRows === 0) {
                return db.rollback(() => {
                    res.status(404).json({ message: "Reservation not found" });
                });
            }

            // If the reservation is approved, update the equipment item status to 'in-use'
            if (status === "approved") {
                // Get the equipment_item_id from the reservation
                const getEquipmentItemIdSql = "SELECT equipment_item_id FROM Reservations WHERE id = ?";
                db.query(getEquipmentItemIdSql, [id], (getEquipmentItemIdErr, getEquipmentItemIdResult) => {
                    if (getEquipmentItemIdErr) {
                        return db.rollback(() => {
                            console.error("Error fetching equipment item ID:", getEquipmentItemIdErr);
                            res.status(500).json({ message: "Error fetching equipment item ID", error: getEquipmentItemIdErr });
                        });
                    }

                    const equipment_item_id = getEquipmentItemIdResult[0].equipment_item_id;

                    // Update the equipment item status to 'in-use'
                    const updateEquipmentItemSql = "UPDATE EquipmentItems SET status = 'in-use' WHERE id = ?";
                    db.query(updateEquipmentItemSql, [equipment_item_id], (updateEquipmentItemErr, updateEquipmentItemResult) => {
                        if (updateEquipmentItemErr) {
                            return db.rollback(() => {
                                console.error("Error updating equipment item:", updateEquipmentItemErr);
                                res.status(500).json({ message: "Error updating equipment item", error: updateEquipmentItemErr });
                            });
                        }

                        // Get the equipment_id from the EquipmentItems table
                        const getEquipmentIdSql = "SELECT equipment_id FROM EquipmentItems WHERE id = ?";
                        db.query(getEquipmentIdSql, [equipment_item_id], (getEquipmentIdErr, getEquipmentIdResult) => {
                            if (getEquipmentIdErr) {
                                return db.rollback(() => {
                                    console.error("Error fetching equipment ID:", getEquipmentIdErr);
                                    res.status(500).json({ message: "Error fetching equipment ID", error: getEquipmentIdErr });
                                });
                            }

                            const equipment_id = getEquipmentIdResult[0].equipment_id;

                            // Calculate the total number of available equipment items for this equipment type
                            const getAvailableItemsSql = `
                                SELECT COUNT(*) AS available_count
                                FROM EquipmentItems
                                WHERE equipment_id = ? AND status = 'available'
                            `;
                            db.query(getAvailableItemsSql, [equipment_id], (getAvailableItemsErr, getAvailableItemsResult) => {
                                if (getAvailableItemsErr) {
                                    return db.rollback(() => {
                                        console.error("Error fetching available equipment items:", getAvailableItemsErr);
                                        res.status(500).json({ message: "Error fetching available equipment items", error: getAvailableItemsErr });
                                    });
                                }

                                const available_count = getAvailableItemsResult[0].available_count;

                                // Commit the transaction
                                db.commit((commitErr) => {
                                    if (commitErr) {
                                        return db.rollback(() => {
                                            console.error("Commit error:", commitErr);
                                            res.status(500).json({ message: "Commit error", error: commitErr });
                                        });
                                    }

                                    res.status(200).json({ 
                                        message: `Reservation ${status} and equipment item status updated to 'in-use'`, 
                                        reservation_id: id,
                                        equipment_item_id,
                                        available_count // Return the total number of available equipment items
                                    });
                                });
                            });
                        });
                    });
                });
            } else {
                // If the reservation is rejected, just commit the transaction
                db.commit((commitErr) => {
                    if (commitErr) {
                        return db.rollback(() => {
                            console.error("Commit error:", commitErr);
                            res.status(500).json({ message: "Commit error", error: commitErr });
                        });
                    }

                    res.status(200).json({ 
                        message: `Reservation ${status} successfully`, 
                        reservation_id: id
                    });
                });
            }
        });
    });
};

// ✅ Get approved reservations
exports.getApprovedReservations = (req, res) => {
    const sql = `
        SELECT r.id, e.name AS equipment, t.slot_time AS time, u.email AS requestedBy, r.lab, r.purpose
        FROM Reservations r
        JOIN EquipmentItems ei ON r.equipment_item_id = ei.id
        JOIN Equipment e ON ei.equipment_id = e.id
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


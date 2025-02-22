const db = require("../config/db");

const createReservation = (workspace_id, project_id, reserved_by, start_time, end_time, callback) => {
    const conflictCheck = `
        SELECT wr.start_time, wr.end_time, u.name AS reserved_by_name 
        FROM workspace_reservations wr
        JOIN users u ON wr.reserved_by = u.id
        WHERE wr.workspace_id = ? 
        AND wr.status IN ('approved', 'pending') 
        AND (
            (? >= wr.start_time AND ? < wr.end_time)  
            OR (? > wr.start_time AND ? <= wr.end_time)  
            OR (wr.start_time >= ? AND wr.end_time <= ?)  
        )
    `;

    db.query(conflictCheck, [workspace_id, start_time, start_time, end_time, end_time, start_time, end_time], (err, conflicts) => {
        if (err) return callback(err);

        console.log("🔍 Conflict Check Results:", conflicts); // Debugging

        if (conflicts.length > 0) {
            return callback(null, { 
                status: 400, // Set HTTP status code for bad request
                message: `⚠️ Workspace is already reserved by ${conflicts[0].reserved_by_name} until ${new Date(conflicts[0].end_time).toLocaleString()}` 
            });
        }

        const sql = `
            INSERT INTO workspace_reservations (workspace_id, project_id, reserved_by, start_time, end_time, status) 
            VALUES (?, ?, ?, ?, ?, 'pending')
        `;
        db.query(sql, [workspace_id, project_id, reserved_by, start_time, end_time], (err, result) => {
            if (err) return callback(err);

            const usageLogSql = `
                INSERT INTO workspace_usage_history (workspace_id, user_id, start_time, end_time) 
                VALUES (?, ?, ?, ?)
            `;
            db.query(usageLogSql, [workspace_id, reserved_by, start_time, end_time], (logErr) => {
                if (logErr) return callback(logErr);
                return callback(null, { 
                    status: 201, // Set HTTP status code for successful creation
                    message: "✅ Workspace reservation created successfully and logged."
                });
            });
        });
    });
};

const approveReservation = (reservation_id, callback) => {
    const checkSql = `
        SELECT wr.workspace_id, wr.start_time, wr.end_time, u.name AS reserved_by_name
        FROM workspace_reservations wr
        JOIN users u ON wr.reserved_by = u.id
        WHERE wr.id = ? AND wr.status = 'pending'
    `;

    db.query(checkSql, [reservation_id], (err, reservations) => {
        if (err) return callback(err);

        if (reservations.length === 0) {
            return callback(null, { status: 400, message: "⚠️ Reservation not found or already approved." });
        }

        const updateSql = `
            UPDATE workspace_reservations 
            SET status = 'approved' 
            WHERE id = ?
        `;
        db.query(updateSql, [reservation_id], (err, result) => {
            if (err) return callback(err);

            return callback(null, {
                status: 200,
                message: `✅ Reservation approved for ${reservations[0].reserved_by_name}.`,
            });
        });
    });
};

// Get all reservations for a workspace
const getReservations = (workspace_id, callback) => {
    const sql = `
        SELECT r.id, r.start_time, r.end_time, u.name AS reserved_by_name, r.status
        FROM workspace_reservations r
        JOIN users u ON r.reserved_by = u.id
        WHERE r.workspace_id = ?
        ORDER BY r.start_time ASC;
    `;
    db.query(sql, [workspace_id], callback);
};

// Cancel a reservation
const cancelReservation = (reservation_id, callback) => {
    const sql = "DELETE FROM workspace_reservations WHERE id = ?";
    db.query(sql, [reservation_id], callback);
};

module.exports = { createReservation, getReservations, cancelReservation, approveReservation };
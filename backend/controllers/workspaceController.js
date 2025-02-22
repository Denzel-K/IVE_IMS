const WorkspaceReservation = require("../models/workspaceReservation");

// Get all reservations for a workspace
exports.getWorkspaceReservations = (req, res) => {
    const { workspace_id } = req.params;

    WorkspaceReservation.getReservations(workspace_id, (err, reservations) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.status(200).json({ reservations });
    });
};

// Cancel a reservation
exports.cancelReservation = (req, res) => {
    const { reservation_id } = req.params;

    WorkspaceReservation.cancelReservation(reservation_id, (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.status(200).json({ message: "Reservation canceled successfully" });
    });
};


exports.createWorkspaceReservation = (req, res) => {
    console.log("🔍 Received User:", req.user);

    const { workspace_id, project_id, start_time, end_time } = req.body;
    const reserved_by = req.user?.id;

    if (!reserved_by) {
        return res.status(401).json({ message: "Unauthorized: User ID is missing." });
    }

    WorkspaceReservation.createReservation(workspace_id, project_id, reserved_by, start_time, end_time, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        // Return the correct HTTP status code
        return res.status(result.status).json({ message: result.message });
    });
};

exports.approveWorkspaceReservation = (req, res) => {
    const { reservation_id } = req.body;

    if (!reservation_id) {
        return res.status(400).json({ message: "⚠️ Reservation ID is required." });
    }

    WorkspaceReservation.approveReservation(reservation_id, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        return res.status(result.status).json({ message: result.message });
    });
};


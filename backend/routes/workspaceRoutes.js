const express = require("express");
const router = express.Router();
const workspaceController = require("../controllers/workspaceController");
const { authMiddleware } = require('../middleware/authMiddleware');

// Create a workspace reservation (Protected Route)
router.post("/reserve", authMiddleware(), workspaceController.createWorkspaceReservation);

// View all reservations for a workspace
router.get("/:workspace_id/reservations", authMiddleware(), workspaceController.getWorkspaceReservations);

// Cancel a reservation
router.delete("/:reservation_id/cancel", authMiddleware(), workspaceController.cancelReservation);

router.post("/approve-reservation", authMiddleware(['admin']), workspaceController.approveWorkspaceReservation);
module.exports = router;

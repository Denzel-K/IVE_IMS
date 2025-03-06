const express = require("express");
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware.js');

// controllers //
const bookingController = require("../controllers/cezeriControllers/bookingController.js");
const equipmentSharingController = require('../controllers/cezeriControllers/equipmentSharingController');
const inventoryController = require('../controllers/cezeriControllers/inventoryController.js');
const logController = require("../controllers/cezeriControllers/logController");
const maintenanceController = require('../controllers/cezeriControllers/maintainanceController');

//booking routes //
    router.get("/api/bookings/timeslots", authMiddleware(),bookingController.getAvailableTimeSlots);
    router.get("/api/bookings/equipment", authMiddleware(),bookingController.getAvailableEquipment);
    router.get("/api/bookings/equipment-items", authMiddleware(), bookingController.getAvailableEquipmentItems);
    router.post("/api/bookings/reserve", authMiddleware(), bookingController.createReservation);
    router.get("/api/bookings/pending", authMiddleware(),bookingController.getPendingApprovals);
    router.put("/api/bookings/approve/:id", authMiddleware(),bookingController.updateReservationStatus);
    router.get("/api/bookings/approved", authMiddleware(),bookingController.getApprovedReservations);
    router.get("/api/bookings/logs", authMiddleware(),bookingController.getBookingLogs);
    router.get("/api/bookings/reservations/:id", authMiddleware(),bookingController.getReservationById); // Get a specific reservation
    router.delete("/api/bookings/reservations/:id", authMiddleware(),bookingController.deleteReservation); // Cancel/Delete a reservation
//...............................................................................................................................//

// equipment-sharing routes
    router.get('/api/equipment-sharing/available', equipmentSharingController.getAvailableEquipment); // ✅ Get available equipment
    router.get('/api/equipment-sharing/requests', equipmentSharingController.getEquipmentRequests); // ✅ Get requests from labs
    router.post('/api/equipment-sharing/request', equipmentSharingController.postEquipmentRequest); // ✅ Post a new request
    router.put('/api/equipment-sharing/approve/:id', equipmentSharingController.approveRequest); // ✅ Approve a request
    router.put('/api/equipment-sharing/reject/:id', equipmentSharingController.rejectRequest); // ✅ Reject a request
//................................................................................................................................................

//inventory routes //
    router.post('/api/inventory/add', authMiddleware(), inventoryController.addEquipment);
    router.put('/api/inventory/update/:id', authMiddleware(), inventoryController.updateEquipmentStatus);
    router.get('/api/inventory/list', authMiddleware(), inventoryController.listEquipment);
    router.get('/api/inventory/list/:id', authMiddleware(), inventoryController.getEquipmentById);
    router.get('/api/inventory/list/:type', authMiddleware(), inventoryController.getEquipmentByType);
    router.get('/api/inventory/list/:code', authMiddleware(), inventoryController.getEquipmentByQRCode);
    router.delete('/api/inventory/delete/:id', authMiddleware(), inventoryController.deleteEquipment);
    router.get('/api/inventory/my-lab/:lab', authMiddleware(), inventoryController.getMyLabEquipment);
    router.get('/api/inventory/other-labs/:lab', authMiddleware(), inventoryController.getOtherLabsEquipment);
//............................................................................................................................................................

//Log Routes //
    router.get("/api/usage/logs", logController.getUsageLogs);
    router.get("/api/usage/export", logController.exportUsageLogs);
    router.get("/api/usage/misuse-reports", logController.getMisuseReports);
    router.post("/api/usage/report-misuse", logController.reportMisuse);
    router.post("/api/usage/add-log", logController.addLog);
//...........................................................................................................................................................

// Mainteinance Routes
    router.post('/api/maintenance/log', maintenanceController.logMaintenance);
    router.get('/api/maintenance/schedule', maintenanceController.getMaintenanceSchedule);
    router.get('/api/maintenance/upcoming', maintenanceController.getUpcomingMaintenance);
    router.post('/api/maintenance/request', maintenanceController.requestMaintenance);
    router.put('/api/maintenance/approve/:id', maintenanceController.approveMaintenance);
    router.get('/api/maintenance/requests', maintenanceController.getMaintenanceRequests);
//......................................................................................................................................................



module.exports = router;


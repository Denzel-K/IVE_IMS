// const express = require("express");
// const router = express.Router();
// const { authMiddleware } = require('../middleware/authMiddleware');

// // controllers //
//     const bookingController = require("../controllers/designControllers/bookingController");
//     const equipmentSharingController = require('../controllers/designControllers/equipmentSharingController');
//     const inventoryController = require('../controllers/designControllers/inventoryController.js');
//     const logController = require("../controllers/designControllers/logController");
//     const maintenanceController = require('../controllers/designControllers/maintainanceController');
// //.................................................................................................................................

// //booking routes //
//     router.get("/api/bookings/timeslots", bookingController.getAvailableTimeSlots);
//     router.get("/api/bookings/equipment", bookingController.getAvailableEquipment);
//     router.post("/api/bookings/reserve", authMiddleware(), bookingController.createReservation);
//     router.get("/api/bookings/pending", bookingController.getPendingApprovals);
//     router.put("/api/bookings/approve/:id", bookingController.updateReservationStatus);
//     router.get("/api/bookings/approved", bookingController.getApprovedReservations);
//     router.get("/api/bookings/logs", bookingController.getBookingLogs);
//     router.get("/api/bookings/reservations/:id", bookingController.getReservationById); // Get a specific reservation
//     router.delete("/api/bookings/reservations/:id", bookingController.deleteReservation); // Cancel/Delete a reservation
// //...............................................................................................................................//

// // equipment-sharing routes
//     router.get('/api/equipment-sharing/available', equipmentSharingController.getAvailableEquipment); // ✅ Get available equipment
//     router.get('/api/equipment-sharing/requests', equipmentSharingController.getEquipmentRequests); // ✅ Get requests from labs
//     router.post('/api/equipment-sharing/request', equipmentSharingController.postEquipmentRequest); // ✅ Post a new request
//     router.put('/api/equipment-sharing/approve/:id', equipmentSharingController.approveRequest); // ✅ Approve a request
//     router.put('/api/equipment-sharing/reject/:id', equipmentSharingController.rejectRequest); // ✅ Reject a request
// //................................................................................................................................................

// //inventory routes //
//     router.post('/api/inventory/add', inventoryController.addEquipment);
//     router.put('/api/inventory/update/:id', inventoryController.updateEquipmentStatus);
//     router.get('/api/inventory/list', inventoryController.listEquipment);
//     router.get('/api/inventory/list/:id', inventoryController.getEquipmentById);
//     router.get('/api/inventory/list/:type', inventoryController.getEquipmentByType);
//     router.get('/api/inventory/list/:code', inventoryController.getEquipmentByQRCode);
//     router.delete('/api/inventory/delete/:id', inventoryController.deleteEquipment);
//     router.get('/api/inventory/my-lab/:lab', inventoryController.getMyLabEquipment);
//     router.get('/api/inventory/other-labs/:lab', inventoryController.getOtherLabsEquipment);
// //............................................................................................................................................................

// //Log Routes //
//     router.get("/api/usage/logs", logController.getUsageLogs);
//     router.get("/api/usage/export", logController.exportUsageLogs);
//     router.get("/api/usage/misuse-reports", logController.getMisuseReports);
//     router.post("/api/usage/report-misuse", logController.reportMisuse);
//     router.post("/api/usage/add-log", logController.addLog);
// //...........................................................................................................................................................

// // Mainteinance Routes
//     router.post('/api/maintenance/log', maintenanceController.logMaintenance);
//     router.get('/api/maintenance/schedule', maintenanceController.getMaintenanceSchedule);
//     router.get('/api/maintenance/upcoming', maintenanceController.getUpcomingMaintenance);
//     router.post('/api/maintenance/request', maintenanceController.requestMaintenance);
//     router.put('/api/maintenance/approve/:id', maintenanceController.approveMaintenance);
//     router.get('/api/maintenance/requests', maintenanceController.getMaintenanceRequests);
// //......................................................................................................................................................



// module.exports = router;


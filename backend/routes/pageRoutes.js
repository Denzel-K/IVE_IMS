const express = require('express');
const loadPages = require('../controllers/loadpages.js');
const { authMiddleware } = require('../middleware/authMiddleware.js');
const db = require('../config/db.js');

const router = express.Router();

router.get('/', loadPages.landingPage);
router.get('/dashboardGet', loadPages.dashboardGet);
router.get('/inventoryGet', loadPages.inventoryGet);
router.get('/projectsGet', loadPages.projectsGet);
router.get('/bookingsGet', loadPages.bookingsGet);
router.get('/settingsGet', loadPages.settingsGet);
router.get('/accountsGet', loadPages.accountsGet);

module.exports = router;
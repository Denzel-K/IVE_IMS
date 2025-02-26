const express = require('express');
const loadPages = require('../controllers/loadpages.js');
const { authMiddleware } = require('../middleware/authMiddleware.js');
const db = require('../config/db.js');

const router = express.Router();

router.get('/', loadPages.landingPage);
router.get('/dashboardGet', authMiddleware(), loadPages.dashboardGet);
router.get('/inventoryGet', authMiddleware(), loadPages.inventoryGet);
router.get('/assetsharingGet', authMiddleware(), loadPages.assetsharingGet);
router.get('/consumablesGet', authMiddleware(), loadPages.consumablesGet);
router.get('/inventorylogsGet', authMiddleware(), loadPages.inventorylogsGet);
router.get('/projectsGet', authMiddleware(), loadPages.projectsGet);
router.get('/bookingsGet', authMiddleware(), loadPages.bookingsGet);
router.get('/settingsGet', authMiddleware(), loadPages.settingsGet);
router.get('/accountsGet', authMiddleware(), loadPages.accountsGet);

module.exports = router;
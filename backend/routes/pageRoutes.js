const express = require('express');
const loadPages = require('../controllers/loadpages.js');
const { authMiddleware } = require('../middleware/authMiddleware.js');
const db = require('../config/db.js');

const router = express.Router();

router.get('/', loadPages.landingPage);
router.get('/dashboard', loadPages.dashboardGet);
router.get('/inventory', loadPages.inventoryGet);

module.exports = router;
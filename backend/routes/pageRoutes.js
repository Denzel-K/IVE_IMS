const express = require('express');
const loadPages = require('../controllers/loadpages.js');
const { authMiddleware } = require('../middleware/authMiddleware.js');
const db = require('../config/db.js');

const router = express.Router();

// Middleware to check lab and redirect
const checkLabAndRedirect = (req, res, next) => {
    const { lab } = req.user; // Get the user's lab from the request (set by authMiddleware)
  
    if (lab === 'design_studio') {
      return res.redirect('/ds_inventoryGet');
    } else if (lab === 'cezeri') {
      return res.redirect('/cz_inventoryGet');
    } else if (lab === 'medtech') {
      return res.redirect('/mt_inventoryGet');
    } else {
      // If the lab is not recognized, redirect to a default page or show an error
      return res.status(404).render('error', { message: 'Lab not found' });
    }
  };

  // Add a generic inventory route that redirects based on the user's lab
router.get('/inventory', authMiddleware(), checkLabAndRedirect);

// General
router.get('/', loadPages.landingPage);
router.get('/pendingApproval', loadPages.pendingApproval);
router.get('/dashboardGet', authMiddleware(), loadPages.dashboardGet);
router.get('/projectsGet', authMiddleware(), loadPages.projectsGet);
router.get('/settingsGet', authMiddleware(), loadPages.settingsGet);
router.get('/accountsGet', authMiddleware(), loadPages.accountsGet);

// Design Studio
router.get('/ds_inventoryGet', authMiddleware(), loadPages.ds_inventoryGet);
router.get('/ds_bookingsGet', authMiddleware(), loadPages.ds_bookingsGet);
router.get('/ds_eq_sharingGet', authMiddleware(), loadPages.ds_eq_sharingGet);
router.get('/ds_projectsGet', authMiddleware(), loadPages.ds_projectsGet);

// Cezeri
router.get('/cz_inventoryGet', authMiddleware(), loadPages.cz_inventoryGet);
router.get('/cz_bookingsGet', authMiddleware(), loadPages.cz_bookingsGet);
router.get('/cz_eq_sharingGet', authMiddleware(), loadPages.cz_eq_sharingGet);
router.get('/cz_projectsGet', authMiddleware(), loadPages.cz_projectsGet);

// MedTech
router.get('/mt_inventoryGet', authMiddleware(), loadPages.mt_inventoryGet);
router.get('/mt_bookingsGet', authMiddleware(), loadPages.mt_bookingsGet);
router.get('/mt_eq_sharingGet', authMiddleware(), loadPages.mt_eq_sharingGet);
router.get('/mt_projectsGet', authMiddleware(), loadPages.mt_projectsGet);

module.exports = router;
const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const projectController = require('../controllers/projectController');
const loadPages = require('../controllers/loadpages'); 
const Project = require("../models/project");

const router = express.Router();

router.get('/api/projects/', authMiddleware(), projectController.getProjects);
router.post('/api/projects/create', authMiddleware(), projectController.createProject);
router.patch('/api/projects/:id/status', authMiddleware(), projectController.updateProjectStatus);
router.get('/api/projects/teammates', authMiddleware(), projectController.getStudentsByLab);
router.put('/api/projects/:id/approval', authMiddleware(), projectController.updateApprovalStatus);
router.post('/api/projects/:id/assign-equipment', projectController.assignEquipment);
router.post('/api/projects/:id/unassign-equipment', projectController.unassignEquipment);

// Fetch project details by ID
router.get("/project-details/:id",  authMiddleware(), loadPages.projectDetailsGet);

router.get("/api/projects/filtered_projects", authMiddleware(), (req, res) => {
  const { filterType, filterValue } = req.query;
  const { role, id } = req.user;

  // Determine the filter type based on the user role
  const filter = role === "lab_manager" ? "approval_stat" : "status";
  const value = filterValue || "all"; // Default to "all" if no filter is provided

  Project.getAllProjects(role, id, filter, value, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

module.exports = router;
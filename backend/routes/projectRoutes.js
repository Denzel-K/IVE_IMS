const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const projectController = require('../controllers/projectController'); // Ensure this exists
const Project = require("../models/project");

const router = express.Router();

router.get('/', authMiddleware(), projectController.getProjects);
router.post('/create', authMiddleware(), projectController.createProject);
router.patch('/:id/status', authMiddleware(), projectController.updateProjectStatus);
router.get('/teammates', authMiddleware(), projectController.getStudentsByLab);
router.put('/:id/approval', authMiddleware(), projectController.updateApprovalStatus);

// Fetch project details by ID
router.get("/project-details/:id", async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.getProjectById(projectId); // Fetch project details
    const teamMembers = await Project.getTeamMembers(projectId); // Fetch team members

    res.render("project-details", { project, teamMembers });
  } catch (err) {
    console.error("❌ Error fetching project details:", err);
    res.status(500).json({ message: "Database error" });
  }
});

router.get("/filtered_projects", authMiddleware(), (req, res) => {
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
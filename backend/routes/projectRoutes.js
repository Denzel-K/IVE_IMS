const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const projectController = require('../controllers/projectController'); // Ensure this exists

const router = express.Router();

router.get('/api/projects/', authMiddleware(), projectController.getProjects);
router.post('/api/projects/create', authMiddleware(), projectController.createProject);
router.patch('/api/projects/:id/status', authMiddleware(), projectController.updateProjectStatus);
router.get('/api/projects/teammates', authMiddleware(), projectController.getStudentsByLab);

module.exports = router;

const Project = require('../models/project');

exports.getProjects = (req, res) => {
    Project.getAllProjects((err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
};

exports.getStudentsByLab = (req, res) => {
    const {lab} = req.user; 
    console.log("lab: ", lab);

    Project.getStudentsByLab(lab, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
};

exports.createProject = async (req, res) => {
    const { name, description, lab, items, start_date, end_date, teamMembers } = req.body;
    const owner_id = req.user.id; // Owner is the logged-in user
  
    if (!name || !description || !lab || !items || !start_date || !end_date) {
      return res.status(400).json({ message: "All fields are required." });
    }
  
    const pend_status = 'active';
    try {
      // Create the project
      const projectResult = await Project.createProject(name, description, lab, items, owner_id, start_date, end_date, pend_status);
  
      const projectId = projectResult.insertId;
  
      // Add team members if any
      if (teamMembers && teamMembers.length > 0) {
        await Project.addTeamMembers(projectId, teamMembers);
      }
  
      res.status(201).json({ message: "Project created successfully" });
    } 
    catch (err) {
      console.log("❌ Error creating project:", err);
      res.status(500).json({ message: "Database error" });
    }
  };

exports.updateProjectStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'completed', 'terminated'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    Project.updateProjectStatus(id, status, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json({ message: "Project status updated successfully" });
    });
};
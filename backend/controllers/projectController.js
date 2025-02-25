const Project = require('../models/project');

exports.getProjects = (req, res) => {
    Project.getAllProjects((err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
};

exports.createProject = (req, res) => {
    const { name, description, start_date, end_date } = req.body;
    const owner_id = req.user.id; // Owner is the logged-in user

    if (!name || !description || !start_date || !end_date ) {
        return res.status(400).json({ message: "All fields are required." });
    }

    console.log("📌 Creating Project with:", { name, description, owner_id, start_date, end_date, status: 'pending' });

    const pend_status = 'active';
    Project.createProject(name, description, owner_id, start_date, end_date, pend_status, (err) => {
        if (err) {
            console.log("❌ Error creating project:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json({ message: "Project created successfully" });
    });
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

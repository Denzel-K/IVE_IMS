const Project = require('../models/project');
const db = require('../config/db');

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
    } catch (err) {
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

exports.updateApprovalStatus = (req, res) => {
    const { id } = req.params;
    const { approval_stat } = req.body;

    if (!['pending', 'approved', 'declined'].includes(approval_stat)) {
        return res.status(400).json({ message: "Invalid approval status" });
    }

    Project.updateApprovalStatus(id, approval_stat, (err) => {
      if (err) {
          console.log(err);
          return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Project approval status updated successfully" });
    });
};


exports.assignEquipment = (req, res) => {
  const { id } = req.params;
  const { equipment_id } = req.body;

  // Check if the equipment is already assigned to another project
  db.query(
    "SELECT * FROM equipment WHERE id = ? AND status = 'in-use'",
    [equipment_id],
    (err, conflict) => {
      if (err) {
        console.error("Error checking equipment status:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (conflict.length > 0) {
        return res.status(400).json({ message: "Equipment is already in use." });
      }

      // Assign equipment to the project
      db.query(
        "UPDATE equipment SET status = 'in-use', lab = ? WHERE id = ?",
        [id, equipment_id],
        (err) => {
          if (err) {
            console.error("Error assigning equipment:", err);
            return res.status(500).json({ message: "Database error" });
          }

          res.json({ message: "Equipment assigned successfully." });
        }
      );
    }
  );
};

exports.unassignEquipment = (req, res) => {
  const { id } = req.params;
  const { equipment_id } = req.body;

  // Fetch original lab before unassigning
  db.query(
    "SELECT lab FROM equipment WHERE id = ?",
    [equipment_id],
    (err, results) => {
      if (err) {
        console.error("Error fetching lab info:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Equipment not found." });
      }

      const originalLab = results[0].lab;

      // Unassign equipment from the project
      db.query(
        "UPDATE equipment SET status = 'available', lab = ? WHERE id = ?",
        [originalLab, equipment_id],
        (err) => {
          if (err) {
            console.error("Error unassigning equipment:", err);
            return res.status(500).json({ message: "Database error" });
          }

          res.json({ message: "Equipment unassigned successfully." });
        }
      );
    }
  );
};

const db = require('../config/db');

function formatDate(date) {
    return date ? new Date(date).toISOString().slice(0, 19).replace("T", " ") : null;
}

const Project = {
    getAllProjects: (userRole, userId, filterType, filterValue, callback) => {
        let sql;
        let params = [];
      
        if (userRole === "lab_manager" || userRole === "admin") {
          // Lab manager filters by approval_stat
          sql = `
            SELECT projects.*, users.name AS owner_name 
            FROM projects
            JOIN users ON projects.owner_id = users.id
            ${filterValue !== "all" ? `WHERE projects.approval_stat = ?` : ""}
            ORDER BY projects.created_at DESC
          `;
          if (filterValue !== "all") params.push(filterValue);
        } 
        else {
          // Student filters by status
          sql = `
            SELECT projects.*, users.name AS owner_name 
            FROM projects
            JOIN users ON projects.owner_id = users.id
            WHERE projects.owner_id = ?
            ${filterValue !== "all" ? `AND projects.status = ?` : ""}
            ORDER BY projects.created_at DESC
          `;
          params.push(userId);
          if (filterValue !== "all") params.push(filterValue);
        }
      
        db.query(sql, params, callback);
    },

    createProject: (name, description, lab, items, owner_id, start_date, end_date, status) => {
        return new Promise((resolve, reject) => {
            console.log("📌 Creating Project with:", { name, description, items, owner_id, start_date, end_date, status });
    
            const sql = `
                INSERT INTO projects (name, description, lab, items, owner_id, start_date, end_date, status, approval_stat) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                name,
                description,
                lab,
                items,
                owner_id,
                formatDate(start_date),
                formatDate(end_date),
                status,
                'pending' // Default approval status
            ];
    
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.error("❌ Error in createProject query:", err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    updateProjectStatus: (id, status, callback) => {
        db.query("UPDATE projects SET status = ? WHERE id = ?", [status, id], callback);
    },

    updateApprovalStatus: (id, approval_stat, callback) => {
        const sql = "UPDATE projects SET approval_stat = ? WHERE id = ?";
        db.query(sql, [approval_stat, id], callback);
    },

    getStudentsByLab: (lab, callback) => {
        const sql = `
            SELECT id, name 
            FROM users 
            WHERE lab = ? AND role = 'student'
        `;
        db.query(sql, [lab], callback);
    },

    addTeamMembers: (projectId, teamMembers, callback) => {
        const sql = `
            INSERT INTO project_team (project_id, user_id) 
            VALUES ?
        `;
        const values = teamMembers.map(member => [projectId, member]);
        db.query(sql, [values], callback);
    },

    // Fetch project by ID
    getProjectById: (projectId, callback) => {
    const sql = `
        SELECT projects.*, users.name AS owner_name 
        FROM projects
        JOIN users ON projects.owner_id = users.id
        WHERE projects.id = ?
    `;
    db.query(sql, [projectId], (err, result) => {
        if (err) return callback(err);
        callback(null, result[0]); // Return the first (and only) row
    });
    },

    getTeamMembers: (projectId, callback) => {
        const sql = `
          SELECT users.id, users.name 
          FROM project_team
          JOIN users ON project_team.user_id = users.id
          WHERE project_team.project_id = ?
        `;
        db.query(sql, [projectId], (err, results) => {
          if (err) return callback(err);
          callback(null, results); // Return all team members
        });
    },

    getAvailableEquipment: (lab, callback) => {
        const sql = `
          SELECT * 
          FROM equipment
          WHERE lab = ? AND status = 'available'
        `;
        db.query(sql, [lab], (err, results) => {
          if (err) return callback(err);
          callback(null, results); // Return available equipment
        });
      },
    
    // Fetch assigned equipment for the project
    getAssignedEquipment: (projectId, callback) => {
      const sql = `
          SELECT * 
          FROM equipment
          WHERE lab = ?
      `;
      db.query(sql, [projectId], (err, results) => {
          if (err) return callback(err);
          callback(null, results); // Return assigned equipment
      });
    },

    // Fetch equipment usage details
    getEquipmentUsage: (projectId, callback) => {
        const sql = `
          SELECT equipment.name, equipment.unique_code, users.name AS user_name, usage_logs.end_time
          FROM usage_logs
          JOIN equipment ON usage_logs.equipment_id = equipment.id
          JOIN users ON usage_logs.user_id = users.id
          WHERE usage_logs.user_id IN (
            SELECT user_id FROM project_team WHERE project_id = ?
          )
        `;
        db.query(sql, [projectId], (err, results) => {
          if (err) return callback(err);
          callback(null, results); // Return equipment usage details
        });
    },
};

module.exports = Project;
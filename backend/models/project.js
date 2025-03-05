const db = require('../config/db');

function formatDate(date) {
    return date ? new Date(date).toISOString().slice(0, 19).replace("T", " ") : null;
}

const Project = {
    getAllProjects: (userRole, userId, callback) => {
        let sql;
        let params = [];

        if (userRole === "admin") {
            sql = `
                SELECT projects.*, users.name AS owner_name 
                FROM projects
                JOIN users ON projects.owner_id = users.id
                ORDER BY projects.created_at DESC
            `;
        } else {
            sql = `
                SELECT projects.*, users.name AS owner_name 
                FROM projects
                JOIN users ON projects.owner_id = users.id
                WHERE projects.owner_id = ?
                ORDER BY projects.created_at DESC
            `;
            params.push(userId);
        }

        db.query(sql, params, callback);
    },

    createProject: (name, description, lab, items, owner_id, start_date, end_date, status, callback) => {
        console.log("📌 Creating Project with:", { name, description, items, owner_id, start_date, end_date, status });

        const sql = "INSERT INTO projects (name, description, lab,items, owner_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const params = [
            name,
            description,
            lab,
            items,
            owner_id,
            formatDate(start_date),
            formatDate(end_date),  
            status
        ];

        db.query(sql, params, callback);
    },

    updateProjectStatus: (id, status, callback) => {
        db.query("UPDATE projects SET status = ? WHERE id = ?", [status, id], callback);
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
    }
};

module.exports = Project;

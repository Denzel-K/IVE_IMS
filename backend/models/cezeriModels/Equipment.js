const db = require('../../config/db');

const Equipment = {
// ✅ Add Equipment
addEquipment: async (name, type, uniqueCode, status, powerRating, manufacturer, lab, quantity) => {
    const sql = `
        INSERT INTO equipment (name, type, unique_code, status, power_rating, manufacturer, lab, quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [name, type, uniqueCode, status, powerRating, manufacturer, lab, quantity]);
    return result;
},

// ✅ Get all equipment
getAllEquipment: async () => {
    const sql = 'SELECT * FROM equipment ORDER BY created_at DESC';
    const [results] = await db.query(sql);
    return results;
},

// ✅ Get equipment with its individual items
getEquipmentWithItems: async (equipmentId) => {
    const query = `
        SELECT e.*, ei.unique_code AS item_code, ei.status AS item_status
        FROM equipment e
        LEFT JOIN equipmentitems ei ON e.id = ei.equipment_id
        WHERE e.id = ?
    `;
    const [results] = await db.query(query, [equipmentId]);
    return results;
},
// // Get single equipment by ID
//     getEquipmentById = async (id) => {
//     return new Promise((resolve, reject) => {
//         db.query('SELECT * FROM Equipment WHERE id = ?', [id], (err, results) => {
//             if (err) reject(err);
//             resolve(results[0]);
//         });
//     });
// },

// Get single equipment by ID
getEquipmentById: (id) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Equipment WHERE id = ?', [id], (err, results) => {
            if (err) reject(err);
            resolve(results[0]);
        });
    });
},

// Get Equipment by QR Code
   getEquipmentByQRCode : (code) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Equipment WHERE unique_Code = ?', [code], (err, results) => {
            if (err) reject(err);
            resolve(results[0]);
        });
    });
},

// Search Equipment by Category
    getEquipmentByType: (type) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Equipment WHERE type = ?', [type], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
},

// ✅ Get equipment for a specific lab
getEquipmentByLab: (lab) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Equipment WHERE lab = ?', [lab], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
},

// ✅ Get equipment from other labs
getEquipmentFromOtherLabs: (lab) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Equipment WHERE lab != ?', [lab], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
},

    // ✅ Delete Equipment
    deleteEquipment: (id, callback) => {
        const sql = 'DELETE FROM equipment WHERE id = ?';
        db.query(sql, [id], callback);
    },

    // ✅ Update Equipment Status
    updateStatus: (id, status, callback) => {
        const sql = 'UPDATE equipment SET status = ? WHERE id = ?';
        db.query(sql, [status, id], callback);
    }
};

module.exports = Equipment;

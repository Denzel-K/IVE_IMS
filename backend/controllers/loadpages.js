const Project = require('../models/project');
const db = require('../config/db');

exports.landingPage = (req, res) => {
  res.render('index', {pageTitle: "Welcome aboard"});
}

exports.pendingApproval = (req, res) => {
  res.render('pendingApproval', {pageTitle: "Pending Approval"});
}

exports.dashboardGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;

  // Fetch additional data based on the user's role
  let data = {};
  if (role === "admin") {
    // Fetch system-wide data for admin
    data = {
      totalUsers: 100, // Example data
      activeProjects: 25,
      equipmentInUse: 10,
    };
  } else if (role === "lab_manager") {
    // Fetch lab-specific data for lab manager
    data = {
      labName: lab,
      pendingApprovals: 5,
      equipmentDueForMaintenance: 3,
    };
  } else if (role === "technician") {
    // Fetch equipment and maintenance data for technician
    data = {
      labName: lab,
      equipmentInUse: 7,
      maintenanceTasks: 2,
    };
  } else if (role === "student") {
    // Fetch project and booking data for student
    data = {
      labName: lab,
      activeProjects: 2,
      upcomingBookings: 3,
    };
  }

  res.render('dashboard', {
    pageTitle: "Dashboard",
    credentials: { id, name, email, lab, role },
    data, 
  });
};

exports.projectsGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;
  const { filterType, filterValue } = req.query; // Get filter type and value from query string

  // Determine the filter type based on the user role
  const filter = role === "lab_manager" ? "approval_stat" : "status";
  const value = filterValue || "all"; // Default to "all" if no filter is provided

  // Fetch projects with the filter
  Project.getAllProjects(role, id, filter, value, (err, projects) => {
    if (err) return res.status(500).json({ message: "Database error", err });

    // Render the projects view with the filtered projects
    res.render('projects', {
      pageTitle: "Project Management",
      credentials: { id, name, email, lab, role },
      projects,
    });
  });
};

exports.projectDetailsGet = (req, res) => {
  const { id, name, email, lab, role } = req.user; // Logged-in user details
  const projectId = req.params.id; // Project ID from the URL

  console.log("📌 Fetching project details for project ID:", projectId);

  // Fetch project details
  Project.getProjectById(projectId, (err, project) => {
    if (err) {
      console.error("❌ Error fetching project details:", err);
      return res.status(500).json({ message: "Database error" });
    }
    console.log("✅ Fetched project details:", project);

    // Fetch team members for the project
    Project.getTeamMembers(projectId, (err, teamMembers) => {
      if (err) {
        console.error("❌ Error fetching team members:", err);
        return res.status(500).json({ message: "Database error" });
      }
      console.log("✅ Fetched team members:", teamMembers);

      // Fetch available equipment (not assigned to any project)
      Project.getAvailableEquipment(lab, (err, availableEquipment) => {
        if (err) {
          console.error("❌ Error fetching available equipment:", err);
          return res.status(500).json({ message: "Database error" });
        }
        console.log("✅ Fetched available equipment:", availableEquipment);

        // Fetch assigned equipment for the project
        Project.getAssignedEquipment(projectId, (err, assignedEquipment) => {
          if (err) {
            console.error("❌ Error fetching assigned equipment:", err);
            return res.status(500).json({ message: "Database error" });
          }
          console.log("✅ Fetched assigned equipment:", assignedEquipment);

          // Fetch equipment usage details
          Project.getEquipmentUsage(projectId, (err, equipmentUsage) => {
            if (err) {
              console.error("❌ Error fetching equipment usage:", err);
              return res.status(500).json({ message: "Database error" });
            }
            console.log("✅ Fetched equipment usage:", equipmentUsage);

            // Render the project details page with all data
            res.render("project_details", {
              pageTitle: "Project Details",
              credentials: { id, name, email, lab, role }, // Logged-in user details
              project, // Project details
              teamMembers, // Team members
              availableEquipment, // Available equipment
              assignedEquipment, // Assigned equipment
              equipmentUsage, // Equipment usage details
            });
          });
        });
      });
    });
  });
};

exports.settingsGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;

  res.render('settings', {
    pageTitle: "Settings", 
    credentials: {
      id, name, email, lab, role
    }
  });
}

exports.accountsGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;

  // Fetch all users from the database (without updated_at)
  const sql = 'SELECT id, name, email, role, approved, created_at FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Database Error (Fetch Users):", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.render('accounts', {
      pageTitle: "User Management",
      credentials: { id, name, email, lab, role },
      users: results // Pass the list of users to the view
    });
  });
};

// Design Studio
exports.ds_inventoryGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;

  res.render('design_studio/ds_inventory', {
    pageTitle: "Inventory", 
    credentials: {
      id, name, email, lab, role
    }
  });
}

exports.ds_bookingsGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;

  res.render('design_studio/ds_bookings', {
    pageTitle: "Bookings", 
    credentials: {
      id, name, email, lab, role
    }
  });
}

exports.ds_eq_sharingGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;

  res.render('design_studio/ds_eq_sharing', {
    pageTitle: "Equipment Sharing", 
    credentials: {
      id, name, email, lab, role
    }
  });
}

exports.ds_projectsGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;

  res.render('design_studio/ds_projects', {
    pageTitle: "Projects", 
    credentials: {
      id, name, email, lab, role
    }
  });
}

// Cezeri
exports.cz_inventoryGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;

  res.render('cezeri/cz_inventory', {
    pageTitle: "Inventory", 
    credentials: {
      id, name, email, lab, role
    }
  });
}

exports.cz_bookingsGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;

  res.render('cezeri/cz_bookings', {
    pageTitle: "Bookings", 
    credentials: {
      id, name, email, lab, role
    }
  });
}

exports.cz_eq_sharingGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;

  res.render('cezeri/cz_eq_sharing', {
    pageTitle: "Equipment Sharing", 
    credentials: {
      id, name, email, lab, role
    }
  });
}

exports.cz_projectsGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;

  res.render('cezeri/cz_projects', {
    pageTitle: "Projects", 
    credentials: {
      id, name, email, lab, role
    }
  });
}

// Medtech
exports.mt_inventoryGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;

  res.render('medtech/mt_inventory', {
    pageTitle: "Inventory", 
    credentials: {
      id, name, email, lab, role
    }
  });
}

exports.mt_bookingsGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;

  res.render('medtech/mt_bookings', {
    pageTitle: "Bookings", 
    credentials: {
      id, name, email, lab, role
    }
  });
}

exports.mt_eq_sharingGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;

  res.render('medtech/mt_eq_sharing', {
    pageTitle: "Equipment Sharing", 
    credentials: {
      id, name, email, lab, role
    }
  });
}

exports.mt_projectsGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;

  res.render('medtech/mt_projects', {
    pageTitle: "Projects", 
    credentials: {
      id, name, email, lab, role
    }
  });
}
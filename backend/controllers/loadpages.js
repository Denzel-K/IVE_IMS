const Project = require('../models/project');

exports.landingPage = (req, res) => {
  res.render('index', {pageTitle: "Welcome aboard"});
}

exports.dashboardGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;

  res.render('dashboard', {
    pageTitle: "Dashboard",
    credentials: {
      id, name, email, lab, role
    }
  });
}

exports.projectsGet = (req, res) => {
  const { id, name, email, lab, role } = req.user;
  const { filterType, filterValue } = req.query; // Get filter type and value from query string

  // Determine the filter type based on the user role
  const filter = role === "lab_manager" ? "approval_stat" : "status";
  const value = filterValue || "all"; // Default to "all" if no filter is provided

  // Fetch projects with the filter
  Project.getAllProjects(role, id, filter, value, (err, projects) => {
    if (err) return res.status(500).json({ message: "Database error" });

    // Render the projects view with the filtered projects
    res.render('projects', {
      pageTitle: "Project Management",
      credentials: { id, name, email, lab, role },
      projects,
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

  res.render('accounts', {
    pageTitle: "User Management", 
    credentials: {
      id, name, email, lab, role
    }
  });
}


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
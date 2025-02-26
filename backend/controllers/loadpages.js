const Project = require('../models/project');

exports.landingPage = (req, res) => {
  res.render('index', {pageTitle: "Welcome aboard"});
}

exports.dashboardGet = (req, res) => {
  const { id, name, email, role } = req.user;

  res.render('dashboard', {
    pageTitle: "Dashboard",
    credentials: {
      id, name, email, role
    }
  });
}

exports.inventoryGet = (req, res) => {
  const { id, name, email, role } = req.user;

  res.render('inventory', {
    pageTitle: "Inventory Management", 
    credentials: {
    id, name, email, role
  }});
}


exports.projectsGet = (req, res) => {
  const { id, name, email, role } = req.user;

  Project.getAllProjects(role, id, (err, projects) => {
    if (err) return res.status(500).json({ message: "Database error" });

    res.render('projects', {
      pageTitle: "Project Management",
      credentials: { id, name, email, role },
      projects,
    });
  });
};

exports.bookingsGet = (req, res) => {
  const { id, name, email, role } = req.user;

  res.render('bookings', {
    pageTitle: "Bookings", 
    credentials: {
      id, name, email, role
    }
  });
}

exports.settingsGet = (req, res) => {
  const { id, name, email, role } = req.user;

  res.render('settings', {
    pageTitle: "Settings", 
    credentials: {
      id, name, email, role
    }
  });
}

exports.accountsGet = (req, res) => {
  const { id, name, email, role } = req.user;

  res.render('accounts', {
    pageTitle: "Account Management", 
    credentials: {
      id, name, email, role
    }
  });
}


exports.assetsharingGet = (req, res) => {
  const { id, name, email, role } = req.user;

  res.render('asset_sharing', {
    pageTitle: "Asset sharing", 
    credentials: {
      id, name, email, role
    }
  });
}


exports.consumablesGet = (req, res) => {
  const { id, name, email, role } = req.user;

  res.render('consumables', {
    pageTitle: "Consumables", 
    credentials: {
      id, name, email, role
    }
  });
}


exports.inventorylogsGet = (req, res) => {
  const { id, name, email, role } = req.user;

  res.render('inventory_logs', {
    pageTitle: "Inventory Logs", 
    credentials: {
      id, name, email, role
    }
  });
}
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
    pageTitle: "Inventory", 
    credentials: {
    id, name, email, role
  }});
}

exports.projectsGet = (req, res) => {
  const { id, name, email, role } = req.user;

  res.render('projects', {
    pageTitle: "Projects", 
    credentials: {
      id, name, email, role
    }
  });
}

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
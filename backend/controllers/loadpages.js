exports.landingPage = (req, res) => {
  res.render('index', {pageTitle: "Welcome aboard"});
}

exports.dashboardGet = (req, res) => {
  res.render('dashboard', {pageTitle: "Dashboard"});
}

exports.inventoryGet = (req, res) => {
  res.render('inventory', {pageTitle: "Inventory"});
}

exports.projectsGet = (req, res) => {
  res.render('projects', {pageTitle: "Projects"});
}

exports.bookingsGet = (req, res) => {
  res.render('bookings', {pageTitle: "Bookings"});
}

exports.settingsGet = (req, res) => {
  res.render('settings', {pageTitle: "Settings"});
}

exports.accountsGet = (req, res) => {
  res.render('accounts', {pageTitle: "Account Management"});
}
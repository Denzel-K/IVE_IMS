const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const assetRoutes = require('./routes/assetRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const projectsRoutes = require('./routes/projectRoutes');
const cron = require('node-cron');
const { sendMaintenanceReminders } = require('./controllers/maintenanceController');
const path = require('path');
const hbs = require('express-handlebars');
const Handlebars = require('handlebars');
const morgan = require('morgan');
const workspaceRoutes = require("./routes/workspaceRoutes");


dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

//Set view engine
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

const handlebars = hbs.create({
  helpers: {
    // Equality check helper
    eq: (a, b) => a === b,

    // Date formatting helper
    formatDate: (date) => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    },

    // Uppercase string helper
    uppercase: (str) => str.toUpperCase(),

    // Conditional check: if a value is greater than another
    gt: (a, b) => a > b,

    // Greater than or equal check
    gte: (a, b) => a >= b,

    // JSON stringifying helper
    json: (context) => JSON.stringify(context),

    // Capitalize first letter
    capitalizeFirst: (str) => {
      if (typeof str !== 'string' || str.length === 0) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  },
  extname: '.hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars)
});

app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, '../renderer/views'));

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../renderer/public')));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(pageRoutes);
app.use('/api', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/projects', projectsRoutes);
app.use(reservationRoutes);
app.use("/api/workspaces", workspaceRoutes);


// Setup Cron schedule - Run every day at 9 AM
cron.schedule('0 9 * * *', () => {
  console.log('Checking for maintenance...');
  sendMaintenanceReminders();
});


const port = process.env.PORT || 3500;
app.listen(port, () => console.log(`Server running on port ${port}`)).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Trying another port...`);
  } else {
    throw err;
  }
});
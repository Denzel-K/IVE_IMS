const path = require('path');
const { app, BrowserWindow, Menu } = require('electron');
const waitOn = require('wait-on');
const { spawn } = require('child_process');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;
let backendProcess;

// Start Backend Server (Express)
function startBackend() {
  // Starts the backend server as a separate child process.
  backendProcess = spawn('node', ['backend/server.js'], 
    {
      cwd: __dirname,   // Run the backend from the current Electron project directory
      shell: true,      // Allows using shell commands inside the script
      detached: true,   // Runs the process separately from the main Electron process
    }
  );

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

// Create Main Window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: isDev ? 1200 : 800,
    height: 700,
    resizable: isDev,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Security best practice
      contextIsolation: true, // Prevents direct access to Node.js
    },
  });
  
  // Load Express Server
  mainWindow.loadURL('http://localhost:3000');

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => (mainWindow = null));
}

// When the app is ready, start backend & create the window
app.whenReady().then(() => {
  startBackend();

  // Wait for backend to be available on port 3000
  waitOn({ resources: ['http://localhost:3000'], timeout: 30000 }) // 30 sec max wait
    .then(createMainWindow)
    .catch(err => {
      console.error('Backend did not start in time:', err);
      app.quit();
    });

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
});

// Menu template
const menu = [
  ...(isMac
    ? [{ label: app.name, submenu: [{ label: 'About' }] }]
    : []),
  { role: 'fileMenu' },
  { role: 'editMenu' },
  {
    label: 'Help',
    submenu: [{ label: 'Documentation', click: () => console.log('Docs Opened') }],
  },
  {
    label: 'Quit',
    submenu: [
      {
        label: 'Exit',
        click: () => app.quit(),
        accelerator: 'CmdOrCtrl+W',
      },
    ],
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
];

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (!isMac) {
    if (backendProcess) backendProcess.kill();
    app.quit();
  }
});

// Open window if none are open (MacOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

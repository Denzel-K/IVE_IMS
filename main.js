const path = require('path');
const { app, BrowserWindow, Menu } = require('electron');
const waitOn = require('wait-on');
const { spawn, execSync } = require('child_process');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, './backend/.env') });

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;
let backendProcess;
const port = process.env.PORT || 3500; 

// Kill any process using the port before starting the backend
function killPortProcess(port) {
  try {
    if (process.platform === 'win32') {
      execSync(`netstat -ano | findstr :${port} | findstr LISTENING | for /f "tokens=5" %a in ('more') do taskkill /PID %a /F`, { stdio: 'ignore' });
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore' });
    }
    console.log(`Cleared port ${port} before starting the backend.`);
  } catch (err) {
    console.warn(`No process was using port ${port}, skipping kill.`);
  }
}

// Start Backend Server (Express)
function startBackend() {
  killPortProcess(port); // Ensure the port is free before starting the backend

  backendProcess = spawn('node', ['backend/server.js'], {
    cwd: __dirname, // Run the backend from the Electron project directory
    shell: true, // Enables shell execution
    detached: true, // Allows backend to run independently of Electron
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend log >> ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error =X= ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });

  backendProcess.on('error', (err) => {
    console.error(`Failed to start backend: ${err}`);
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

  // Wait for backend before loading Electron window
  waitOn({ resources: [`http://localhost:${port}`], timeout: 60000 }) // 60 sec max wait
    .then(() => {
      mainWindow.loadURL(`http://localhost:${port}`);
      console.log(`Electron --> Browser window loaded on port:${port}`);
      console.log('--------')
    })
    .catch(err => {
      console.error(`Backend did not start in time: ${err}`);
      app.quit();
    });

  // if (isDev) {
  //   mainWindow.webContents.openDevTools();
  // }

  // Suppress Autofill warnings in DevTools
  mainWindow.webContents.on('console-message', (event, level, message) => {
    if (message.includes('Autofill') || message.includes('Autofill.setAddresses')) {
      return; // Prevent it from logging
    }
  });

  mainWindow.on('closed', () => (mainWindow = null));
}

//  Disable Hardware Acceleration in Electron (n linux)
app.disableHardwareAcceleration();

// When the app is ready, start backend & create the window
app.whenReady().then(() => {
  startBackend();
  createMainWindow();

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

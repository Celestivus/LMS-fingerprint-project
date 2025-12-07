const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Global reference to the window object to prevent garbage collection
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Inha LMS Desktop - BioLink Enabled",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Allows 'require' in React for hardware access
      webSecurity: false
    }
  });

  // In development, load the local React dev server on port 3000 (standard CRA port)
  mainWindow.loadURL('http://localhost:3000');

  // Open DevTools to see hardware logs
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

ipcMain.on('biolink:start-scan', (event) => {
  console.log('[Hardware] Received request to start scanner...');

  // Step 1: Device Initialization (500ms)
  setTimeout(() => {
    if (mainWindow) {
      console.log('[Hardware] BioLink U-Match UM-MB3.5 Initialized via USB.');
      mainWindow.webContents.send('biolink:status', 'DEVICE_READY');
    }

    // Step 2: Wait for Finger (Simulating user putting finger on sensor)
    setTimeout(() => {
      if (mainWindow) {
        console.log('[Hardware] Finger detected on sensor...');
        mainWindow.webContents.send('biolink:status', 'FINGER_DETECTED');
      }

      // Step 3: Processing/Capturing (1.5s)
      setTimeout(() => {
        if (mainWindow) {
          console.log('[Hardware] Fingerprint captured and template extracted.');
          mainWindow.webContents.send('biolink:success', {
            templateId: 'TMP_7X99_BIO',
            quality: 98
          });
        }
      }, 1500);

    }, 2000); // Wait 2 seconds for "finger"

  }, 500);
});


// Electron lifecycle events
app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
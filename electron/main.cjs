const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
const logFile = path.join(__dirname, 'electron_debug.log');
function log(msg) {
  try { fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`); } catch {}
}

function createWindow() {
  log('createWindow called');
  const iconPath = path.join(__dirname, '../dist/icon.png');
  
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'KBV Visites — Coordination Lyon',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    show: true
  });

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    log(`[Renderer ${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    log(`[did-fail-load] ${errorCode}: ${errorDescription}`);
  });

  const htmlPath = path.join(__dirname, '../dist/index.html');
  log(`Loading HTML from: ${htmlPath}`);

  mainWindow.loadFile(htmlPath).catch((err) => {
    log(`[loadFile error] ${err.message}`);
  });

  mainWindow.on('closed', () => {
    log('mainWindow closed');
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  log('app.whenReady resolved');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

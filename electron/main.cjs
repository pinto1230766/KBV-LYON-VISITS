const { app, BrowserWindow, session, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function getLogFile() {
  try {
    return path.join(app.getPath('userData'), 'electron_debug.log');
  } catch {
    return null;
  }
}

function log(msg) {
  try {
    const f = getLogFile();
    if (f) fs.appendFileSync(f, `[${new Date().toISOString()}] ${msg}\n`);
  } catch {}
}

process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION: ${err ? err.stack || err.message : err}`);
});

process.on('unhandledRejection', (reason) => {
  log(`UNHANDLED REJECTION: ${reason}`);
});

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
      contextIsolation: true,
      webSecurity: true
    },
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    show: true
  });

  // Isolation de navigation : interdire l'ouverture de fenêtres internes pour les liens externes
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      event.preventDefault();
      if (url.startsWith('https:') || url.startsWith('http:') || url.startsWith('mailto:') || url.startsWith('tel:')) {
        shell.openExternal(url);
      }
    }
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
  if (session && session.defaultSession) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Access-Control-Allow-Origin': ['*'],
          'Access-Control-Allow-Headers': ['*'],
          'Access-Control-Allow-Methods': ['GET, POST, PUT, DELETE, OPTIONS, PATCH']
        }
      });
    });
  }
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

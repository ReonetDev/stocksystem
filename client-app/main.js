const { app, BrowserWindow, Menu, nativeTheme, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
const Database = require('better-sqlite3');

app.setName('Reonet Stock');

let win;
let db;
let apiProcess = null;

async function startApi() {

    // Check if API is already running
    if (await isApiRunning()) {
        console.log('API is already running');
        return;
    }

    const isDev = process.env.NODE_ENV === 'development';
    let apiPath;

    if (isDev) {
        // In development, the API is at the root of the client-app's parent directory
        apiPath = path.join(__dirname, '..', 'StockControlSystem.API');
    } else {
        // In production, the API is bundled with the app
        apiPath = path.join(process.resourcesPath, 'api');
    }

    let executablePath;

    if (process.platform === 'win32') {
        executablePath = isDev
            ? path.join(apiPath, 'bin', 'Debug', 'net8.0', 'StockControlSystem.API.exe')
            : path.join(apiPath, 'StockControlSystem.API.exe');
    } else if (process.platform === 'darwin') {
        if (process.arch === 'arm64') {
            executablePath = isDev
                ? path.join(apiPath, 'bin', 'Debug', 'net8.0', 'StockControlSystem.API')
                : path.join(apiPath, 'StockControlSystem.API');
        }
    } else {
        console.error('Unsupported platform for API');
        return;
    }

    console.log(`Attempting to start API from: ${executablePath}`);

    // Make sure the executable has proper permissions on macOS/Linux
    if (process.platform !== 'win32') {
        const fs = require('fs');
        try {
            fs.chmodSync(executablePath, '755');
        } catch (error) {
            console.error(`Failed to set permissions for API: ${error.message}`);
            return; // Stop if we can't set permissions
        }
    }

    apiProcess = spawn(executablePath, [], {
        detached: false,
        stdio: 'pipe',
        cwd: apiPath, // Set the working directory for the API
        env: { ...process.env, 'ASPNETCORE_ENVIRONMENT': isDev ? 'Development' : 'Production' } // Set environment
    });

    apiProcess.stdout.on('data', (data) => {
        console.log(`API stdout: ${data}`);
    });

    apiProcess.stderr.on('data', (data) => {
        console.error(`API stderr: ${data}`);
    });

    apiProcess.on('close', (code) => {
        console.log(`API process exited with code ${code}`);
    });

    apiProcess.on('error', (error) => {
    console.error('Failed to start API:', error);
    })

    // Wait for API to be ready
    await waitForApi();
}

async function isApiRunning() {
  try {
    await axios.get(`http://localhost:5260/health`); // Implement a health endpoint
    return true;
  } catch {
    return false;
  }
}

async function waitForApi(timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await isApiRunning()) {
      console.log('API is ready');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('API failed to start within timeout');
}

function stopApi() {
  if (apiProcess) {
    apiProcess.kill();
    apiProcess = null;
  }
}

function initializeDatabase() {
    const dbPath = path.join(app.getPath('userData'), 'RSDB.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    db.exec(`
        CREATE TABLE IF NOT EXISTS credentials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            password TEXT NOT NULL
        )
    `);
}

function createWindow() {
    win = new BrowserWindow({
        width: 1920,
        height: 1080,
        title: 'Reonet Stock',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true, // Enabled for security and contextBridge usage
            preload: path.join(__dirname, 'preload.js')
        },
    });

    // In development, load from the Vite dev server
    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:5173');
        // win.webContents.openDevTools(); // Disabled by user request
    } else {
        // In production, load the built React app
        win.loadFile(path.join(__dirname, 'dist/index.html'));
    }

    // Send theme to renderer
    win.webContents.on('did-finish-load', () => {
        const initialTheme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
        // console.log('Main Process: Sending initial theme:', initialTheme);
        win.webContents.send('theme-changed', initialTheme);
    });

    // Listen for theme changes
    nativeTheme.on('updated', () => {
        const newTheme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
        // console.log('Main Process: Sending updated theme:', newTheme);
        win.webContents.send('theme-changed', newTheme);
    });
}

const menuTemplate = [
    ...(process.platform === 'darwin' ? [{
        label: app.getName(),
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    }] : [])
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

app.whenReady().then(async () => {
    console.log('Electron app is ready. Initializing...');
    initializeDatabase();
    try {
        await startApi();
    } catch (error) {
        console.error(`Failed to start API: ${error.message}`);
        // The app will continue to run, but API-dependent features will not work.
    }
    createWindow();
});

app.on('before-quit', () => {
  stopApi();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('check-for-updates', () => {
    autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('update-available', () => {
    win.webContents.send('update-status', 'Update available.');
});

autoUpdater.on('update-not-available', () => {
    win.webContents.send('update-status', 'No update available.');
});

autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update-status', 'Update downloaded. It will be installed on restart. Restart now?');
    ipcMain.on('restart-app', () => {
        autoUpdater.quitAndInstall();
    });
});

autoUpdater.on('error', (err) => {
    win.webContents.send('update-status', `Error in auto-updater: ${err.toString()}`);
});

// Context menu for copy/paste
ipcMain.on('show-context-menu', (event) => {
    const template = [
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
});

app.setAboutPanelOptions({
    applicationName: 'Reonet Stock',
    applicationVersion: app.getVersion(),
    credits: 'Developer: Andrew Liebenberg & Gemini CLI\nCompany: Reonet (PTY) LTD',
    iconPath: path.join(__dirname, 'reoicon.png'), // Updated path
});

// IPC Handlers
ipcMain.handle('load-credentials', () => {
    try {
        const row = db.prepare('SELECT email, password FROM credentials LIMIT 1').get();
        return row;
    } catch (error) {
        console.error('Failed to load credentials:', error);
        return null;
    }
});

ipcMain.on('save-credentials', (event, { email, password }) => {
    try {
        db.prepare('DELETE FROM credentials').run(); // Clear existing
        db.prepare('INSERT INTO credentials (email, password) VALUES (?, ?)').run(email, password);
    } catch (error) {
        console.error('Failed to save credentials:', error);
    }
});

ipcMain.on('clear-credentials', () => {
    try {
        db.prepare('DELETE FROM credentials').run();
    } catch (error) {
        console.error('Failed to clear credentials:', error);
    }
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});
const { app, BrowserWindow, Menu, nativeTheme, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const url = require('url');
const Database = require('better-sqlite3');
const axios = require('axios'); // Added axios import

app.setName('Reonet Stock');

let win;
let db;
let apiProcess = null;

// --- File Logging Setup ---
const logPath = path.join(app.getPath('userData'), 'main-error.log');function logToFile(message) {    const timestamp = new Date().toISOString();    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);}// Clear log file on startuptry {    fs.writeFileSync(logPath, '');} catch (err) {    console.error("Failed to clear log file:", err);}// Only log errors to file// logToFile('--- Application Starting ---');
// --- End File Logging Setup ---

async function startApi() {
    const isDev = process.env.NODE_ENV === 'development';
    let apiPath;

    if (isDev) {
        apiPath = path.join(__dirname, '..', 'StockControlSystem.API');
    } else {
        apiPath = path.join(process.resourcesPath, 'api');
    }

    let executablePath;

    if (process.platform === 'win32') {
        executablePath = isDev
            ? path.join(apiPath, 'bin', 'Debug', 'net8.0', 'StockControlSystem.API.exe')
            : path.join(apiPath, 'win-x64', 'StockControlSystem.API.exe');
    } else if (process.platform === 'darwin') {
        if (process.arch === 'arm64') {
            executablePath = isDev
                ? path.join(apiPath, 'bin', 'Debug', 'net8.0', 'StockControlSystem.API')
                : path.join(apiPath, 'osx-arm64', 'StockControlSystem.API');
        }
    } else {
        logToFile(`Unsupported platform: ${process.platform}`);
        return;
    }

    try {
        if (!fs.existsSync(executablePath)) {
            logToFile(`Error: API executable not found at path: ${executablePath}`);
            return;
        }

        // Make sure the executable has proper permissions on macOS/Linux
        if (process.platform !== 'win32') {
            fs.chmodSync(executablePath, '755');
        }

        apiProcess = spawn(executablePath, [], {
            detached: false,
            stdio: 'pipe',
            cwd: path.dirname(executablePath),
            env: { ...process.env, 'ASPNETCORE_ENVIRONMENT': isDev ? 'Development' : 'Production' }
        });

        apiProcess.stdout.on('data', (data) => {
            // logToFile(`API stdout: ${data.toString()}`); // Keep this if you want API stdout in log
        });

        apiProcess.stderr.on('data', (data) => {
            logToFile(`API stderr: ${data.toString()}`);
        });

        apiProcess.on('close', (code) => {
            logToFile(`API process exited with code ${code}`);
        });
        
        await waitForApi();

    } catch (error) {
        logToFile(`Error during API startup: ${error.message}`);
        logToFile(`Stack trace: ${error.stack}`);
    }
}

async function isApiRunning() {
  try {
    await axios.get(`http://localhost:5260/health`); // Corrected health endpoint
    return true;
  } catch {
    return false;
  }
}

async function waitForApi(timeout = 60000) { // Increased timeout
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await isApiRunning()) {
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
        win.loadURL(url.format({
            pathname: path.join(app.getAppPath(), 'dist', 'index.html'),
            protocol: 'file:',
            slashes: true
        }));
        // win.webContents.openDevTools(); // Open DevTools for debugging
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
    try {
        initializeDatabase();
    } catch (error) {
        logToFile(`FATAL: Failed to initialize database: ${error.message}`);
        logToFile(`Stack trace: ${error.stack}`);
    }

    try {
        await startApi();
    } catch (error) {
        logToFile(`FATAL: Failed to start API: ${error.message}`);
        logToFile(`Stack trace: ${error.stack}`);
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

const { app, BrowserWindow, ipcMain, shell, dialog, Notification } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");
const { autoUpdater } = require("electron-updater");

let mainWindow = null;
let serverProcess = null;
let updateReadyToInstall = false; // tracks if update downloaded and ready

const SERVER_PORT = process.env.PORT || 5002;
const CLIENT_DEV_URL = "http://localhost:3000";

// Check if Express backend server is alive
function checkServerHealth(port = SERVER_PORT) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 304 || res.statusCode === 404);
    });
    req.on("error", () => resolve(false));
    req.end();
  });
}

// Start Node.js Express server child process
async function startExpressServer() {
  const isRunning = await checkServerHealth();
  if (isRunning) {
    console.log(`[Electron Main] Express backend is already running on port ${SERVER_PORT}`);
    return;
  }

  // In dev: server is at ../server relative to electron/main.js
  // When packaged with extraFiles: server is at <appRoot>/server (alongside resources/)
  let serverDir;
  if (app.isPackaged) {
    // process.resourcesPath = <appRoot>/resources — go up one level to reach <appRoot>/server
    serverDir = path.join(process.resourcesPath, "../server");
  } else {
    serverDir = path.join(__dirname, "../server");
  }
  const serverScript = path.join(serverDir, "Server.js");

  console.log(`[Electron Main] Spawning Express backend server: ${serverScript}`);

  const nodeModulesPath = path.join(serverDir, "node_modules");

  // When packaged as AppImage, process.execPath = Electron binary.
  // Setting ELECTRON_RUN_AS_NODE=1 makes it behave like Node.js.
  // In dev, just use the system "node" binary.
  const nodeExec = app.isPackaged ? process.execPath : "node";
  const spawnEnv = {
    ...process.env,
    PORT: String(SERVER_PORT),
    NODE_PATH: `${nodeModulesPath}${process.env.NODE_PATH ? `:${process.env.NODE_PATH}` : ""}`,
    ...(app.isPackaged ? { ELECTRON_RUN_AS_NODE: "1" } : {}),
  };

  serverProcess = spawn(nodeExec, [serverScript], {
    cwd: serverDir,
    env: spawnEnv,
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
  });

  serverProcess.stdout.on("data", (data) => {
    console.log(`[Express Backend]: ${data.toString().trim()}`);
  });

  serverProcess.stderr.on("data", (data) => {
    console.error(`[Express Backend Error]: ${data.toString().trim()}`);
  });

  serverProcess.on("close", (code) => {
    console.log(`[Electron Main] Express server process exited with code ${code}`);
    serverProcess = null;
  });
}

// Stop Express server process safely
function stopExpressServer() {
  if (serverProcess) {
    console.log("[Electron Main] Terminating Express backend server...");
    serverProcess.kill();
    serverProcess = null;
  }
}

// Poll until server is ready (up to 15 seconds)
function waitForServer(port = SERVER_PORT, retries = 30, intervalMs = 500) {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      checkServerHealth(port).then((isUp) => {
        if (isUp) {
          console.log(`[Electron Main] Server is ready on port ${port}`);
          resolve(true);
        } else if (++attempts < retries) {
          setTimeout(check, intervalMs);
        } else {
          console.error(`[Electron Main] Server did not start after ${retries} attempts`);
          resolve(false);
        }
      });
    };
    check();
  });
}

// Create Main Application Window
async function createWindow() {
  await startExpressServer();
  await waitForServer();

  const fs = require("fs");
  let iconPath = path.join(__dirname, "../client/public/app-logo.png");
  if (app.isPackaged) {
    const prodIconPath = path.join(__dirname, "../client/dist/app-logo.png");
    if (fs.existsSync(prodIconPath)) {
      iconPath = prodIconPath;
    }
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: "AGR Jewellery Management System",
    icon: iconPath,
    autoHideMenuBar: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Determine environment and load page
  const isDev = !app.isPackaged && (process.env.NODE_ENV === "development" || process.argv.includes("--dev"));

  if (isDev) {
    console.log(`[Electron Main] Loading development URL: ${CLIENT_DEV_URL}`);
    mainWindow.loadURL(CLIENT_DEV_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const distIndexPath = path.join(__dirname, "../client/dist/index.html");
    const fs = require("fs");
    if (fs.existsSync(distIndexPath)) {
      console.log(`[Electron Main] Loading production file: ${distIndexPath}`);
      mainWindow.loadFile(distIndexPath);
    } else {
      console.log(`[Electron Main] Compiled dist not found, loading fallback URL: ${CLIENT_DEV_URL}`);
      mainWindow.loadURL(CLIENT_DEV_URL);
    }
  }

  // Handle external links opening in user's browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Register IPC handlers
function registerIpcHandlers() {
  ipcMain.on("window-minimize", () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on("window-maximize", () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on("window-close", () => {
    if (mainWindow) mainWindow.close();
  });

  ipcMain.handle("get-app-version", () => {
    return app.getVersion();
  });

  ipcMain.handle("check-server-health", async () => {
    return await checkServerHealth();
  });

  // Triggered when user clicks "Install" on the UpdateBadge in the React UI
  ipcMain.on("install-update", () => {
    if (updateReadyToInstall) {
      autoUpdater.quitAndInstall(false, true);
    } else {
      // Deferred but not yet downloaded — start download now
      autoUpdater.downloadUpdate();
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTO UPDATER
// Only active in production (packaged) builds — never fires in dev mode.
// Strategy:
//   PATCH (1.0.0→1.0.1): silent download, OS notification when ready
//   MINOR/MAJOR (1.x or 2.x): dialog → Update Now or Later
//   Later: sends IPC to renderer so UpdateBadge appears in the UI
// ─────────────────────────────────────────────────────────────────────────────
function setupAutoUpdater() {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = false;       // we decide when to download
  autoUpdater.autoInstallOnAppQuit = true; // install silently on quit

  autoUpdater.checkForUpdates().catch((err) => {
    console.error("[AutoUpdater] Check failed:", err?.message);
  });

  autoUpdater.on("update-available", (info) => {
    const newVersion = info.version;
    const currentVersion = app.getVersion();
    const [newMajor, newMinor] = newVersion.split(".").map(Number);
    const [curMajor, curMinor] = currentVersion.split(".").map(Number);
    const isSilentPatch = newMajor === curMajor && newMinor === curMinor;

    if (isSilentPatch) {
      // PATCH → silent download, no dialog
      console.log(`[AutoUpdater] Patch v${newVersion} found — downloading silently`);
      autoUpdater.downloadUpdate();
    } else {
      // MINOR or MAJOR → ask the user
      const response = dialog.showMessageBoxSync(mainWindow, {
        type: "info",
        title: "Update Available — AGR Jewellery",
        message: `Version v${newVersion} is now available`,
        detail:
          "A new version has been released with improvements.\n" +
          "Your data will not be affected by the update.\n\n" +
          "Would you like to download and install it now?",
        buttons: ["Update Now", "Later"],
        defaultId: 0,
        cancelId: 1,
      });

      if (response === 0) {
        autoUpdater.downloadUpdate();
      } else {
        // User chose Later → show the persistent UpdateBadge in the UI
        console.log("[AutoUpdater] User deferred — sending update-deferred to renderer");
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("update-deferred", newVersion);
        }
      }
    }
  });

  autoUpdater.on("update-downloaded", (info) => {
    updateReadyToInstall = true;
    console.log(`[AutoUpdater] v${info.version} downloaded — ready to install on quit`);
    // Native OS notification (Windows toast / Linux notify)
    if (Notification.isSupported()) {
      new Notification({
        title: "AGR Jewellery — Update Ready",
        body: `v${info.version} downloaded. Restart the app to apply the update.`,
      }).show();
    }
  });

  autoUpdater.on("error", (err) => {
    console.error("[AutoUpdater] Error:", err?.message);
  });
}

// App Lifecycle Events
app.whenReady().then(() => {
  registerIpcHandlers();
  setupAutoUpdater();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  stopExpressServer();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  stopExpressServer();
});

process.on("exit", () => {
  stopExpressServer();
});

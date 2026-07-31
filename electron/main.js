const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

let mainWindow = null;
let serverProcess = null;

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

  let serverDir = path.join(__dirname, "../server");
  if (app.isPackaged) {
    serverDir = serverDir.replace("app.asar", "app.asar.unpacked");
  }
  const serverScript = path.join(serverDir, "Server.js");

  console.log(`[Electron Main] Spawning Express backend server: ${serverScript}`);

  const nodeModulesPath = path.join(serverDir, "node_modules");

  const nodeExec = app.isPackaged ? process.execPath : "node";
  const spawnEnv = app.isPackaged
    ? {
        ...process.env,
        PORT: SERVER_PORT,
        ELECTRON_RUN_AS_NODE: "1",
        NODE_PATH: `${nodeModulesPath}:${process.env.NODE_PATH || ""}`
      }
    : { ...process.env, PORT: SERVER_PORT };

  serverProcess = spawn(nodeExec, [serverScript], {
    cwd: serverDir,
    env: spawnEnv,
    stdio: ["ignore", "pipe", "pipe"]
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

// Create Main Application Window
async function createWindow() {
  await startExpressServer();

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
}

// App Lifecycle Events
app.whenReady().then(() => {
  registerIpcHandlers();
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

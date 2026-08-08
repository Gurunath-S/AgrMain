const { contextBridge, ipcRenderer } = require("electron");

// Expose safe, isolated Electron API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  platform: process.platform,
  minimizeWindow: () => ipcRenderer.send("window-minimize"),
  maximizeWindow: () => ipcRenderer.send("window-maximize"),
  closeWindow: () => ipcRenderer.send("window-close"),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  isMaximized: () => ipcRenderer.invoke("is-maximized"),
  checkServerHealth: () => ipcRenderer.invoke("check-server-health"),

  // Auto-update: main process fires this when user clicked "Later" on the dialog.
  // `callback` receives the new version string e.g. "1.1.0"
  onUpdateDeferred: (callback) => {
    const handler = (_event, version) => callback(version);
    ipcRenderer.on("update-deferred", handler);
    // Returns a cleanup function to remove the listener
    return () => ipcRenderer.removeListener("update-deferred", handler);
  },

  // Auto-update: trigger quit-and-install from the UpdateBadge component
  installUpdate: () => ipcRenderer.send("install-update"),

  // Server and database status APIs
  getServerStatus: () => ipcRenderer.invoke("get-server-status"),
  getMigrationStatus: () => ipcRenderer.invoke("get-migration-status"),
  onServerStatus: (callback) => {
    const handler = (_event, status) => callback(status);
    ipcRenderer.on("server-status", handler);
    return () => ipcRenderer.removeListener("server-status", handler);
  },
  onMigrationStatus: (callback) => {
    const handler = (_event, status) => callback(status);
    ipcRenderer.on("migration-status", handler);
    return () => ipcRenderer.removeListener("migration-status", handler);
  },
});

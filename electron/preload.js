const { contextBridge, ipcRenderer } = require("electron");

// Expose safe, isolated Electron API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  platform: process.platform,
  minimizeWindow: () => ipcRenderer.send("window-minimize"),
  maximizeWindow: () => ipcRenderer.send("window-maximize"),
  closeWindow: () => ipcRenderer.send("window-close"),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  checkServerHealth: () => ipcRenderer.invoke("check-server-health")
});

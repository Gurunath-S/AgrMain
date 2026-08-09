import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; 
import "./index.css";

// Globally intercept and modernize legacy window.alert and window.confirm using Electron's native dialogs
if (window.electronAPI) {
  window.alert = (message) => {
    window.electronAPI.showAlert(message);
  };
  window.confirm = (message) => {
    return window.electronAPI.showConfirm(message);
  };
  
  // Set platform class on document.documentElement for platform-specific CSS overrides
  if (window.electronAPI.platform) {
    document.documentElement.classList.add(`platform-${window.electronAPI.platform}`);
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

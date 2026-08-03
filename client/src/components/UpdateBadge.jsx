import React, { useState, useEffect } from "react";

/**
 * UpdateBadge — shown when a major/minor update is available and the user
 * previously clicked "Later" on the update dialog. Renders a fixed bottom-left
 * floating button that lets them trigger the install whenever ready.
 *
 * Only renders inside the Electron app (window.electronAPI?.isElectron).
 */
export default function UpdateBadge() {
  const [visible, setVisible] = useState(false);
  const [updateVersion, setUpdateVersion] = useState("");
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Only register if running inside Electron
    if (!window.electronAPI?.isElectron) return;

    // Main process sends this event when user clicked "Later"
    const removeListener = window.electronAPI.onUpdateDeferred((version) => {
      setUpdateVersion(version);
      setVisible(true);
    });

    return () => {
      if (typeof removeListener === "function") removeListener();
    };
  }, []);

  const handleInstall = () => {
    setInstalling(true);
    window.electronAPI?.installUpdate();
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={styles.container}>
      <div style={styles.badge}>
        {/* Bell icon */}
        <span style={styles.icon}>🔔</span>

        <div style={styles.textBlock}>
          <span style={styles.title}>Update Available</span>
          {updateVersion && (
            <span style={styles.version}>v{updateVersion}</span>
          )}
        </div>

        <button
          id="update-badge-install-btn"
          onClick={handleInstall}
          disabled={installing}
          style={styles.installBtn}
        >
          {installing ? "Downloading…" : "Install"}
        </button>

        <button
          id="update-badge-dismiss-btn"
          onClick={handleDismiss}
          style={styles.dismissBtn}
          title="Dismiss — reminder will appear next launch"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    bottom: "20px",
    left: "20px",
    zIndex: 9999,
    animation: "slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  badge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    border: "1px solid rgba(99, 179, 237, 0.35)",
    borderRadius: "14px",
    padding: "10px 16px",
    boxShadow:
      "0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(99,179,237,0.1)",
    backdropFilter: "blur(12px)",
    minWidth: "260px",
    maxWidth: "340px",
  },
  icon: {
    fontSize: "18px",
    flexShrink: 0,
    animation: "pulse 2s infinite",
  },
  textBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
  },
  title: {
    color: "#e2e8f0",
    fontSize: "13px",
    fontWeight: "600",
    letterSpacing: "0.01em",
  },
  version: {
    color: "#63b3ed",
    fontSize: "11px",
    fontWeight: "400",
  },
  installBtn: {
    background: "linear-gradient(135deg, #3182ce, #2b6cb0)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "5px 12px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    flexShrink: 0,
    transition: "opacity 0.2s",
  },
  dismissBtn: {
    background: "transparent",
    color: "#718096",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    padding: "2px 4px",
    flexShrink: 0,
    lineHeight: 1,
    transition: "color 0.2s",
  },
};

// Inject keyframes once
if (
  typeof document !== "undefined" &&
  !document.getElementById("update-badge-styles")
) {
  const style = document.createElement("style");
  style.id = "update-badge-styles";
  style.textContent = `
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.15); }
    }
    #update-badge-install-btn:hover:not(:disabled) { opacity: 0.85; }
    #update-badge-dismiss-btn:hover { color: #e53e3e !important; }
  `;
  document.head.appendChild(style);
}

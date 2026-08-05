import React, { useState } from "react";
import logo from "../../Assets/agrLogo.png";
import "./DatabaseSetup.css";

const DatabaseSetup = () => {
  const [step, setStep] = useState(1);
  const [dbType, setDbType] = useState("local"); // local or online
  const [formData, setFormData] = useState({
    host: "127.0.0.1",
    port: "3306",
    user: "root",
    password: "",
    database: "agr",
  });
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
  const [isSaving, setIsSaving] = useState(false);
  const [logs, setLogs] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addLog = (message) => {
    setLogs((prev) => [...prev, message]);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await fetch("http://localhost:5002/api/setup/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setTestResult({ success: true, message: "Connection test succeeded!" });
        setStep(3); // Auto forward to migration step
      } else {
        setTestResult({ success: false, message: data.error || "Failed to connect to MySQL." });
      }
    } catch (err) {
      setTestResult({ success: false, message: "Could not communicate with the backend server. Please verify the backend is running." });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndInitialize = async () => {
    setIsSaving(false);
    setLogs([]);
    setStep(3);

    addLog("Connecting to database server...");
    addLog(`Checking / creating database "${formData.database}"...`);

    try {
      const response = await fetch("http://localhost:5002/api/setup/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        addLog("Database created / verified successfully!");
        addLog("Applying Prisma database migrations (creating tables)...");
        addLog("Database initialized successfully!");
        addLog("Saving configuration to persistent user profile...");
        
        // Call Electron IPC to write the file
        if (window.electronAPI && window.electronAPI.saveDbConfig) {
          const result = await window.electronAPI.saveDbConfig(data.envContent);
          if (result.success) {
            addLog("Configuration saved successfully!");
            addLog("Relaunching app to apply database settings...");
            setTimeout(() => {
              window.electronAPI.restartApp();
            }, 2000);
          } else {
            addLog(`Error saving file: ${result.error}`);
          }
        } else {
          addLog("Warning: Not in Electron environment. Cannot save config file locally.");
        }
      } else {
        addLog(`Error: ${data.error || "Failed to initialize database."}`);
      }
    } catch (err) {
      addLog("Error: Network connection lost during database initialization.");
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-background-glow"></div>
      
      <div className="setup-card">
        {/* Header */}
        <div className="setup-header">
          <img src={logo} alt="AGR Logo" className="setup-logo" />
          <h1 className="setup-title">AGR JEWELLERY</h1>
          <p className="setup-subtitle">Database Setup Wizard</p>
        </div>

        {/* Step Indicator */}
        <div className="setup-steps">
          <div className={`step-dot ${step >= 1 ? "active" : ""}`}>1</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 2 ? "active" : ""}`}>2</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 3 ? "active" : ""}`}>3</div>
        </div>

        {/* Step 1: Choose Type */}
        {step === 1 && (
          <div className="step-content fade-in">
            <h2>Welcome to AGR Jewellery Management</h2>
            <p className="step-desc">
              We need to configure your database connection to get started. Please choose the type of database you want to use:
            </p>

            <div className="db-options">
              <div 
                className={`db-option-card ${dbType === "local" ? "selected" : ""}`}
                onClick={() => {
                  setDbType("local");
                  setFormData({ ...formData, host: "127.0.0.1", port: "3306" });
                }}
              >
                <div className="option-icon">💻</div>
                <h3>Local Database</h3>
                <p>Run MySQL or MariaDB locally on this machine. (Best for offline single-system installations)</p>
              </div>

              <div 
                className={`db-option-card ${dbType === "online" ? "selected" : ""}`}
                onClick={() => {
                  setDbType("online");
                  setFormData({ ...formData, host: "" });
                }}
              >
                <div className="option-icon">☁️</div>
                <h3>Online / Cloud Database</h3>
                <p>Connect to a remote MySQL/MariaDB server. (Best for multi-system networks or cloud hosting)</p>
              </div>
            </div>

            <button className="setup-btn primary" onClick={() => setStep(2)}>
              Next Step
            </button>
          </div>
        )}

        {/* Step 2: Connection Details */}
        {step === 2 && (
          <div className="step-content fade-in">
            <h2>Database Connection Details</h2>
            <p className="step-desc">
              Enter your database connection parameters below. Make sure MySQL or MariaDB is running on the host.
            </p>

            <div className="setup-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="host">Server Host / IP</label>
                  <input
                    type="text"
                    id="host"
                    name="host"
                    value={formData.host}
                    onChange={handleChange}
                    placeholder="e.g. 127.0.0.1 or db.example.com"
                  />
                </div>
                <div className="form-group small">
                  <label htmlFor="port">Port</label>
                  <input
                    type="text"
                    id="port"
                    name="port"
                    value={formData.port}
                    onChange={handleChange}
                    placeholder="3306"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="user">Username</label>
                  <input
                    type="text"
                    id="user"
                    name="user"
                    value={formData.user}
                    onChange={handleChange}
                    placeholder="root"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="database">Database Name</label>
                <input
                  type="text"
                  id="database"
                  name="database"
                  value={formData.database}
                  onChange={handleChange}
                  placeholder="agr"
                />
              </div>
            </div>

            {testResult && (
              <div className={`setup-alert ${testResult.success ? "success" : "error"}`}>
                {testResult.message}
                {!testResult.success && (
                  <div className="alert-help">
                    <strong>Need Help?</strong> Ensure MySQL/MariaDB service is started:
                    <ul>
                      <li>Windows: Open <em>Services</em>, find <strong>MySQL</strong>, and click <strong>Start</strong>.</li>
                      <li>Linux: Run <code>sudo systemctl start mariadb</code> or <code>sudo systemctl start mysql</code>.</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="setup-actions">
              <button className="setup-btn secondary" onClick={() => setStep(1)} disabled={isTesting}>
                Back
              </button>
              <button className="setup-btn primary" onClick={handleTestConnection} disabled={isTesting}>
                {isTesting ? "Testing..." : "Test & Continue"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Migration Logs */}
        {step === 3 && (
          <div className="step-content fade-in">
            <h2>Initializing Database</h2>
            <p className="step-desc">
              Creating tables and configuring persistent local files. Do not close the application.
            </p>

            <div className="setup-logs">
              {logs.map((log, index) => (
                <div key={index} className="log-line">
                  <span className="log-bullet">➜</span> {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="log-line loading">Initializing process...</div>
              )}
            </div>

            {logs.some(log => log.includes("Error")) ? (
              <button className="setup-btn primary" onClick={() => setStep(2)}>
                Go Back and Fix Details
              </button>
            ) : (
              logs.length === 0 && (
                <button className="setup-btn primary" onClick={handleSaveAndInitialize}>
                  Start Installation
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseSetup;

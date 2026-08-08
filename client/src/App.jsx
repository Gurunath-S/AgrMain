import React from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/Home/Home";
import Customer from "./components/Customer/Customer";
import Goldsmith from "./components/Goldsmith/Goldsmith";
import Billing from "./components/Billing/Billing";
import Report from "./components/Report/Report";
import Stock from "./components/Stock/Stock";
import RawGoldStock from "./components/RawGoldStock/RawGoldStock";
import Navbar from "./components/Navbar/Navbar";
import Master from "./components/Master/Master";
import MasterCustomer from "./components/Master/Mastercustomer";
import Customertrans from "./components/Customer/Customertrans";
import CustomerReport from "./components/Report/customer.report";
import Overallreport from "./components/Report/overallreport";
import Jobcardreport from "./components/Report/jobcardreport";
import ReceiptReport from "./components/Report/receiptreport";
import Receipt from "./components/ReceiptVoucher/receiptvoucher"
import Customerorders from "./components/Customer/Customerorders";
import Orderreport from "./components/Report/orderreport";
import Newjobcard from "./components/Goldsmith/Newjobcard";
// import Goldsmithcard from "./components/Goldsmith/goldsmithcard"
import ExpenseTracker from "./components/ExpenseTracker/ExpenseTracker";
import JobCardDetails from "./components/Goldsmith/JobCard"
import MasterBullion from "./components/Master/Masterbullion";
import Bullion from "./components/Bullion/Bullion";
import GoldsmithRepair from "./components/GoldsmithRepair/RepairStock";
import RepairStockList from "./components/GoldsmithRepair/RepairStockList";
import CustomerReturn from "./components/CustomerReturn&Repair/CustomerReturn&Repair";
import ReturnStockList from "./components/CustomerReturn&Repair/ReturnStockList";
import CustomerRepairStockList from "./components/CustomerReturn&Repair/CustomerRepairStockList";
import Jewelstockreport from "./components/Report/jewelstockreport";
import BillView from "./components/Billing/BillView";
import BalanceStatement from "./components/Reports/BalanceStatement";
import UpdateBadge from "./components/UpdateBadge";
import TitleBar from "./components/TitleBar/TitleBar";

const TITLEBAR_HEIGHT = 38; // keep in sync with TitleBar.jsx

function App() {
  const isElectron = !!window.electronAPI?.isElectron;
  const [serverStatus, setServerStatus] = React.useState(isElectron ? "loading" : "ready");
  const [migrationStatus, setMigrationStatus] = React.useState(isElectron ? "loading" : "ready");

  React.useEffect(() => {
    if (!isElectron) return;

    // Fetch initial statuses
    window.electronAPI.getServerStatus().then((status) => setServerStatus(status));
    window.electronAPI.getMigrationStatus().then((status) => setMigrationStatus(status));

    // Listen for real-time status updates from the main process
    const unsubServer = window.electronAPI.onServerStatus((status) => setServerStatus(status));
    const unsubMigration = window.electronAPI.onMigrationStatus((status) => setMigrationStatus(status));

    return () => {
      unsubServer();
      unsubMigration();
    };
  }, [isElectron]);

  const handleRetry = async () => {
    setServerStatus("loading");
    setMigrationStatus("loading");
    const isHealthy = await window.electronAPI.checkServerHealth();
    if (isHealthy) {
      setServerStatus("ready");
      setMigrationStatus("ready");
    } else {
      setServerStatus("failed");
    }
  };

  const isInitializing = isElectron && (serverStatus === "loading" || migrationStatus === "loading");
  const isFailed = isElectron && (serverStatus === "failed" || migrationStatus === "failed");

  return (
    <>
      {/* Modern custom titlebar — only shown in packaged Electron window */}
      <TitleBar />

      {/* Push all content below the titlebar when in Electron */}
      {isElectron && (
        <style>{`
          :root {
            --titlebar-height: ${TITLEBAR_HEIGHT}px;
          }
          body {
            padding-top: ${TITLEBAR_HEIGHT}px;
          }
        `}</style>
      )}

      {isInitializing || isFailed ? (
        <div className="init-overlay">
          <div className="init-content">
            <div className="init-logo-frame">
              <div className="init-logo-inner">
                <div className={`init-spinner ${isFailed ? "failed" : "spinning"}`}></div>
              </div>
            </div>
            <h2 className="init-title">AGR Jewellery</h2>
            <p className="init-subtitle">
              {isFailed 
                ? "Connection Error" 
                : migrationStatus === "loading" 
                  ? "Checking database migrations..." 
                  : "Starting local server..."}
            </p>
            <p className="init-details">
              {isFailed 
                ? "The application server or database failed to initialize. Please verify if another instance is open or check database.env."
                : "Please wait while we prepare your luxury management workspace."}
            </p>
            {isFailed && (
              <button className="init-retry-btn" onClick={handleRetry}>
                Retry Connection
              </button>
            )}
          </div>
          <style>{`
            .init-overlay {
              position: fixed;
              top: ${TITLEBAR_HEIGHT}px;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: #f8f5f2;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              z-index: 99999;
              font-family: 'Montserrat', sans-serif;
              padding: 20px;
            }
            .init-content {
              text-align: center;
              max-width: 450px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .init-logo-frame {
              width: 140px;
              height: 140px;
              border-radius: 50%;
              background: linear-gradient(45deg, #e6d5b8, #d4af37, #e6d5b8);
              display: flex;
              justify-content: center;
              align-items: center;
              box-shadow: 0 10px 30px rgba(212, 175, 55, 0.15);
              margin-bottom: 30px;
            }
            .init-logo-inner {
              width: 90%;
              height: 90%;
              background: #fff;
              border-radius: 50%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .init-spinner {
              width: 70px;
              height: 70px;
              border-radius: 50%;
              border: 3px solid rgba(212, 175, 55, 0.1);
              border-top: 3px solid #d4af37;
            }
            .init-spinner.spinning {
              animation: init-spin 1s linear infinite;
            }
            .init-spinner.failed {
              border-color: #ff6b6b;
              position: relative;
            }
            .init-spinner.failed::before, .init-spinner.failed::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              width: 30px;
              height: 3px;
              background-color: #ff6b6b;
              border-radius: 2px;
            }
            .init-spinner.failed::before {
              transform: translate(-50%, -50%) rotate(45deg);
            }
            .init-spinner.failed::after {
              transform: translate(-50%, -50%) rotate(-45deg);
            }
            .init-title {
              font-family: 'Cormorant Garamond', serif;
              font-size: 2.2rem;
              font-weight: 600;
              color: #333;
              margin: 0 0 10px 0;
              letter-spacing: 1px;
            }
            .init-subtitle {
              font-size: 1.05rem;
              font-weight: 400;
              color: #d4af37;
              margin: 0 0 15px 0;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            .init-details {
              font-size: 0.9rem;
              color: #666;
              line-height: 1.6;
              margin-bottom: 25px;
            }
            .init-retry-btn {
              background: transparent;
              color: #333;
              padding: 10px 25px;
              font-family: 'Montserrat', sans-serif;
              font-size: 0.85rem;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              border: 1px solid #d4af37;
              cursor: pointer;
              transition: all 0.3s ease;
            }
            .init-retry-btn:hover {
              color: #fff;
              background: #d4af37;
            }
            @keyframes init-spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : null}

    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/customer"
          element={
            <PageWithNavbar>
              <Customer />
            </PageWithNavbar>
          }
        />
        <Route
          path="/goldsmith"
          element={
            <PageWithNavbar>
              <Goldsmith />
            </PageWithNavbar>
          }
        />
        <Route
          path="/goldsmithcard/:id/:name"
          element={
            <PageWithNavbar>
              <JobCardDetails/>
            </PageWithNavbar>
          }
        />
        <Route
          path="/expenseVoucher"
          element={
            <PageWithNavbar>
             <ExpenseTracker/>
            </PageWithNavbar>
          }
        />
        <Route
          path="/bill"
          element={
            <PageWithNavbar>
              <Billing />
            </PageWithNavbar>
          }
        />
        <Route
          path="/bill-view/:billId"
          element={
            <PageWithNavbar>
              <BillView />
            </PageWithNavbar>
          }
        />
        <Route
          path="/report"
          element={
            <PageWithNavbar>
              <Report />
            </PageWithNavbar>
          }
        />
        {/* <Route
          path="/repair"
          element={
            <PageWithNavbar>
              <Repair />
            </PageWithNavbar>
          }
        ></Route> */}
        <Route
          path="/repairgoldsmith"
          element={
            <PageWithNavbar>
              <GoldsmithRepair />
            </PageWithNavbar>
          }
        ></Route>
        <Route
          path="/customerreturn"
          element={
            <PageWithNavbar>
              <CustomerReturn />
            </PageWithNavbar>
          }
        />
        <Route
          path="/returnstocklist"
          element={
            <PageWithNavbar>
              <ReturnStockList />
            </PageWithNavbar>
          }
        />
        <Route
          path="/customerrepairstocklist"
          element={
            <PageWithNavbar>
              <CustomerRepairStockList />
            </PageWithNavbar>
          }
        />
        <Route
          path="/repairstocklist"
          element={
            <PageWithNavbar>
              <RepairStockList />
            </PageWithNavbar>
          }
        ></Route>
        <Route
          path="/customerreport"
          element={
            <PageWithNavbar>
              <CustomerReport />
            </PageWithNavbar>
          }
        />
        <Route
          path="/jewelstockreport"
          element={
            <PageWithNavbar>
              <Jewelstockreport />
            </PageWithNavbar>
          }
        />
        <Route
          path="/overallreport"
          element={
            <PageWithNavbar>
              <Overallreport />
            </PageWithNavbar>
          }
        />
        <Route
          path="/orderreport"
          element={
            <PageWithNavbar>
              <Orderreport />
            </PageWithNavbar>
          }
        ></Route>
        <Route
          path="/jobcardreport"
          element={
            <PageWithNavbar>
              <Jobcardreport />
            </PageWithNavbar>
          }
        />
        <Route
          path="/receiptreport"
          element={
            <PageWithNavbar>
              <ReceiptReport />
            </PageWithNavbar>
          }
        />
        <Route
          path="/receiptvoucher"
          element={
            <PageWithNavbar>
              <Receipt />
            </PageWithNavbar>
          }
        />
        <Route
          path="/productstock"
          element={
            <PageWithNavbar>
              <Stock />
            </PageWithNavbar>
          }
        />
        <Route
          path="/rawGoldStock"
          element={
            <PageWithNavbar>
              <RawGoldStock/>
            </PageWithNavbar>
          }
        />
        <Route
          path="/customertrans"
          element={
            <PageWithNavbar>
              <Customertrans />
            </PageWithNavbar>
          }
        />
        <Route
          path="/customerorders"
          element={
            <PageWithNavbar>
              <Customerorders />
            </PageWithNavbar>
          }
        />

        <Route
          path="/newjobcard/:id/:name"
          element={
            <PageWithNavbar>
              <Newjobcard />
            </PageWithNavbar>
          }
        />


        <Route
          path="/bullion"
          element={
            <PageWithNavbar>
              <Bullion />
            </PageWithNavbar>
          }
        ></Route>

        <Route
          path="/statement/:type/:id"
          element={
            <PageWithNavbar>
              <BalanceStatement />
            </PageWithNavbar>
          }
        />

        <Route path="/master/*" element={<Master />} />
      </Routes>
    </HashRouter>
    {/* Floating update badge — only visible in Electron when user deferred a major/minor update */}
    <UpdateBadge />
    </>
  );
}

function PageWithNavbar({ children }) {
  const location = useLocation();
  const hideNavbarPaths = ["/"];
  if (hideNavbarPaths.includes(location.pathname)) {
    return children;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default App;



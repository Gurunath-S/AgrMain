import React, { useState, useEffect } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/Home/Home";
import DatabaseSetup from "./components/Setup/DatabaseSetup";
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
  const [dbConnected, setDbConnected] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let intervalId;
    let attempts = 0;
    const maxAttempts = 5;

    const checkConnection = async () => {
      attempts++;
      try {
        const response = await fetch("http://localhost:5002/api/setup/status");
        const data = await response.json();
        if (data.connected) {
          setDbConnected(true);
          setChecking(false);
          clearInterval(intervalId);
        } else {
          setDbConnected(false);
          setChecking(false);
          clearInterval(intervalId);
        }
      } catch (err) {
        console.log(`[App] Waiting for backend server to respond (attempt ${attempts}/${maxAttempts})...`);
        if (attempts >= maxAttempts) {
          console.warn("[App] Backend server did not respond after max attempts. Redirecting to setup wizard.");
          setDbConnected(false);
          setChecking(false);
          clearInterval(intervalId);
        }
      }
    };

    checkConnection();
    intervalId = setInterval(checkConnection, 1500);

    return () => clearInterval(intervalId);
  }, []);

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

      {checking ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - var(--titlebar-height, 0px))",
          backgroundColor: "#0d0e12",
          color: "#fff",
          fontFamily: "'Montserrat', sans-serif"
        }}>
          <h2 style={{ color: "#d4af37", letterSpacing: "2px", fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem" }}>AGR JEWELLERY</h2>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "10px" }}>Connecting to backend services, please wait...</p>
        </div>
      ) : !dbConnected ? (
        <DatabaseSetup />
      ) : (
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
    )}
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



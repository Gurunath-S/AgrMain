import React, { useState } from "react";
import {
  useNavigate,
  Routes,
  Route,
  Navigate,
  NavLink,
  useLocation
} from "react-router-dom";

import MasterCustomer from "./Mastercustomer";
import Mastergoldsmith from "./Mastergoldsmith";
import Masteradditems from "./Masteradditems";
import Masterjewelstock from "./Masterjewelstock";
import MasterWastageVal from "./MasterWastageVal";
import Cashgold from "./Cashgold";
import Touchentry from "./Touchentry";
import MasterBullion from "./Masterbullion";

import SupplierManagement from "./SupplierManagement";
import PurchaseEntry from "./PurchaseEntry";
import ItemPurchase from "./ItemSupplierList";
import ItemPurchaseEntry from "./ItemPurchaseEntry";
import SupplierPurchaseManagement from "./SupplierPurchaseManagement";

import ItemPurchaseReport from "./ItemPurchaseReport";
import PurchaseReport from "./PurchaseReport";
import BalanceStatement from "../Reports/BalanceStatement";

import {
  FiLogOut,
  FiChevronDown,
  FiHome,
  FiUser,
  FiBriefcase,
  FiTag,
  FiShoppingBag,
  FiDollarSign,
  FiLayers
} from "react-icons/fi";

const Master = () => {
  const [openPurchaseMenu, setOpenPurchaseMenu] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const isPurchaseActive =
    location.pathname.startsWith("/master/item-purchase") ||
    location.pathname.startsWith("/master/purchase-report") ||
    location.pathname.startsWith("/master/statement") ||
    location.pathname.startsWith("/master/item-purchase-report") ||
    location.pathname.startsWith("/master/supplier") ||
    location.pathname.startsWith("/master/purchase-entry");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleBack = () => {
    navigate("/customer");
  };

  // Nav link style generator
  const getNavStyle = ({ isActive }, path) => {
    const isHovered = hoveredNav === path;
    return {
      ...styles.navButton,
      color: isActive ? "#d4af37" : isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.75)",
      backgroundColor: isActive
        ? "rgba(212, 175, 55, 0.08)"
        : isHovered
        ? "rgba(255, 255, 255, 0.06)"
        : "transparent",
      fontWeight: isActive ? "600" : "500",
      borderBottom: isActive ? "2px solid #d4af37" : "2px solid transparent",
      transform: isHovered ? "translateY(-1px)" : "translateY(0)",
    };
  };

  // Dropdown item style generator
  const getDropdownItemStyle = ({ isActive }, path) => {
    const isHovered = hoveredNav === path;
    return {
      ...styles.dropdownItem,
      color: isActive ? "#d4af37" : isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.8)",
      backgroundColor: isActive
        ? "rgba(212, 175, 55, 0.06)"
        : isHovered
        ? "rgba(255, 255, 255, 0.04)"
        : "transparent",
      borderLeft: isActive ? "3px solid #d4af37" : "3px solid transparent",
      paddingLeft: isActive ? "17px" : "20px",
      fontWeight: isActive ? "600" : "500",
      transform: isHovered ? "translateX(3px)" : "translateX(0)",
    };
  };

  return (
    <div style={styles.containerStyle}>
      {/* NAVBAR */}
      <div style={styles.navContainer}>
        <div style={styles.navLeft}>
          <button
            onClick={handleBack}
            style={{
              ...styles.navButton,
              color: hoveredNav === "home" ? "#ffffff" : "rgba(255, 255, 255, 0.75)",
              backgroundColor: hoveredNav === "home" ? "rgba(255, 255, 255, 0.06)" : "transparent",
            }}
            onMouseEnter={() => setHoveredNav("home")}
            onMouseLeave={() => setHoveredNav(null)}
          >
            <FiHome style={styles.navIcon} />
            <span>Home</span>
          </button>

          <NavLink
            to="/master/customer"
            style={(props) => getNavStyle(props, "/master/customer")}
            onMouseEnter={() => setHoveredNav("/master/customer")}
            onMouseLeave={() => setHoveredNav(null)}
          >
            <FiUser style={styles.navIcon} />
            <span>Customer Info</span>
          </NavLink>

          <NavLink
            to="/master/goldsmith"
            style={(props) => getNavStyle(props, "/master/goldsmith")}
            onMouseEnter={() => setHoveredNav("/master/goldsmith")}
            onMouseLeave={() => setHoveredNav(null)}
          >
            <FiBriefcase style={styles.navIcon} />
            <span>Goldsmith Info</span>
          </NavLink>

          <NavLink
            to="/master/items"
            style={(props) => getNavStyle(props, "/master/items")}
            onMouseEnter={() => setHoveredNav("/master/items")}
            onMouseLeave={() => setHoveredNav(null)}
          >
            <FiTag style={styles.navIcon} />
            <span>Items Info</span>
          </NavLink>

          {/* PURCHASE MENU */}
          <div
            style={styles.dropdownContainer}
            onMouseEnter={() => {
              setHoveredNav("purchase");
              setOpenPurchaseMenu(true);
            }}
            onMouseLeave={() => {
              setHoveredNav(null);
              setOpenPurchaseMenu(false);
            }}
          >
            <button
              style={{
                ...styles.navButton,
                color: isPurchaseActive ? "#d4af37" : hoveredNav === "purchase" ? "#ffffff" : "rgba(255, 255, 255, 0.75)",
                backgroundColor: isPurchaseActive
                  ? "rgba(212, 175, 55, 0.08)"
                  : hoveredNav === "purchase"
                  ? "rgba(255, 255, 255, 0.06)"
                  : "transparent",
                borderBottom: isPurchaseActive ? "2px solid #d4af37" : "2px solid transparent",
              }}
            >
              <FiShoppingBag style={styles.navIcon} />
              <span>Purchase</span>
              <FiChevronDown
                size={14}
                style={{
                  marginLeft: "4px",
                  transition: "transform 0.25s ease",
                  transform: openPurchaseMenu ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {openPurchaseMenu && (
              <div
                className="nav-dropdown-menu nav-dropdown-animate"
                style={styles.dropdownMenuStyle}
              >
                <NavLink
                  to="/master/supplier"
                  style={(props) => getDropdownItemStyle(props, "/master/supplier")}
                  onClick={() => setOpenPurchaseMenu(false)}
                  onMouseEnter={() => setHoveredNav("/master/supplier")}
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  Supplier Master
                </NavLink>

                <NavLink
                  to="/master/purchase-entry"
                  style={(props) => getDropdownItemStyle(props, "/master/purchase-entry")}
                  onClick={() => setOpenPurchaseMenu(false)}
                  onMouseEnter={() => setHoveredNav("/master/purchase-entry")}
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  BC Purchase
                </NavLink>

                <NavLink
                  to="/master/item-purchase"
                  style={(props) => getDropdownItemStyle(props, "/master/item-purchase")}
                  onClick={() => setOpenPurchaseMenu(false)}
                  onMouseEnter={() => setHoveredNav("/master/item-purchase")}
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  Item Purchase
                </NavLink>

                <NavLink
                  to="/master/purchase-report"
                  style={(props) => getDropdownItemStyle(props, "/master/purchase-report")}
                  onClick={() => setOpenPurchaseMenu(false)}
                  onMouseEnter={() => setHoveredNav("/master/purchase-report")}
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  BC Purchase Report
                </NavLink>

                <NavLink
                  to="/master/item-purchase-report"
                  style={(props) => getDropdownItemStyle(props, "/master/item-purchase-report")}
                  onClick={() => setOpenPurchaseMenu(false)}
                  onMouseEnter={() => setHoveredNav("/master/item-purchase-report")}
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  Item Purchase Report
                </NavLink>
              </div>
            )}
          </div>

          <NavLink
            to="/master/cashgold"
            style={(props) => getNavStyle(props, "/master/cashgold")}
            onMouseEnter={() => setHoveredNav("/master/cashgold")}
            onMouseLeave={() => setHoveredNav(null)}
          >
            <FiDollarSign style={styles.navIcon} />
            <span>Cash / Gold</span>
          </NavLink>

          <NavLink
            to="/master/bullion"
            style={(props) => getNavStyle(props, "/master/bullion")}
            onMouseEnter={() => setHoveredNav("/master/bullion")}
            onMouseLeave={() => setHoveredNav(null)}
          >
            <FiLayers style={styles.navIcon} />
            <span>Bullion</span>
          </NavLink>
        </div>

        <button
          onClick={handleLogout}
          style={{
            ...styles.logoutButton,
            backgroundColor: hoveredNav === "logout" ? "rgba(212, 175, 55, 0.1)" : "transparent",
            color: hoveredNav === "logout" ? "#ffffff" : "#d4af37",
            borderColor: hoveredNav === "logout" ? "#ffffff" : "rgba(212, 175, 55, 0.4)",
            transform: hoveredNav === "logout" ? "translateY(-1px)" : "translateY(0)",
          }}
          onMouseEnter={() => setHoveredNav("logout")}
          onMouseLeave={() => setHoveredNav(null)}
        >
          <FiLogOut size={16} style={{ marginRight: "6px" }} />
          <span>Logout</span>
        </button>
      </div>

      {/* PAGE CONTENT */}
      <div style={styles.contentContainer}>
        <Routes>
          <Route path="/" element={<Navigate to="customer" />} />
          <Route path="customer" element={<MasterCustomer />} />
          <Route path="goldsmith" element={<Mastergoldsmith />} />
          <Route path="items" element={<Masteradditems />} />
          <Route path="stock" element={<Masterjewelstock />} />
          <Route path="cashgold" element={<Cashgold />} />
          <Route path="touchentries" element={<Touchentry />} />
          <Route path="bullion" element={<MasterBullion />} />
          <Route path="wastagevalue" element={<MasterWastageVal />} />

          {/* PURCHASE ROUTES */}
          <Route path="supplier" element={<SupplierManagement />} />
          <Route path="purchase-entry" element={<SupplierPurchaseManagement />} />
          <Route path="purchase-entry/:supplierId" element={<PurchaseEntry />} />
          <Route path="item-purchase" element={<ItemPurchase />} />
          <Route path="item-purchase/:supplierId" element={<ItemPurchaseEntry />} />
          <Route path="item-purchase-report" element={<ItemPurchaseReport />} />
          <Route path="purchase-report" element={<PurchaseReport />} />
          <Route path="statement/:id" element={<BalanceStatement typeOverride="supplier" />} />
        </Routes>
      </div>
    </div>
  );
};

/* STYLES */

const styles = {
  containerStyle: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    minWidth: "100%",
  },
  navContainer: {
    backgroundColor: "rgba(17, 24, 39, 0.95)",
    background: "linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 24px",
    color: "#fff",
    height: "64px",
    position: "sticky",
    top: "var(--titlebar-height, 0px)",
    zIndex: 999,
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
    borderBottom: "1px solid rgba(212, 175, 55, 0.12)",
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    height: "100%",
    position: "relative",
    flex: 1,
    minWidth: 0,
    whiteSpace: "nowrap",
  },
  navButton: {
    cursor: "pointer",
    fontSize: "0.88rem",
    fontWeight: "500",
    textDecoration: "none",
    padding: "0 12px",
    height: "100%",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "transparent",
    border: "none",
    boxSizing: "border-box",
    flexShrink: 0,
    whiteSpace: "nowrap",
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    borderRadius: "6px 6px 0 0",
  },
  logoutButton: {
    border: "1px solid rgba(212, 175, 55, 0.4)",
    borderRadius: "6px",
    padding: "6px 14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontWeight: "600",
    fontSize: "0.85rem",
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  dropdownContainer: {
    position: "relative",
    height: "100%",
  },
  dropdownMenuStyle: {
    position: "absolute",
    top: "100%",
    left: 0,
    backgroundColor: "rgba(17, 24, 39, 0.98)",
    backdropFilter: "blur(20px)",
    borderRadius: "0 0 8px 8px",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(212, 175, 55, 0.15)",
    overflow: "hidden",
    zIndex: 1000,
    minWidth: "210px",
    borderTop: "1px solid rgba(212, 175, 55, 0.2)",
    padding: "6px 0",
  },
  dropdownItem: {
    padding: "10px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textDecoration: "none",
    fontSize: "0.9rem",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    boxSizing: "border-box",
  },
  contentContainer: {
    flex: 1,
    padding: "24px",
    backgroundColor: "#f8f9fa",
  },
  navIcon: {
    fontSize: "16px",
    flexShrink: 0,
  },
};

export default Master;

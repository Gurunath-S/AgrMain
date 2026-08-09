import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiLogOut,
  FiChevronDown,
  FiDatabase,
  FiUsers,
  FiBriefcase,
  FiFileText,
  FiTrendingUp,
  FiCreditCard,
  FiArchive,
  FiTool,
  FiRotateCcw,
  FiBarChart2,
} from "react-icons/fi";
import NotificationBell from "../Notification/Notification";
import logo from "../../Assets/agrLogo.png";
import "./Navbar.css";

const Navbar = () => {
  const isElectron = !!window.electronAPI?.isElectron;
  const navigate = useNavigate();
  const location = useLocation();

  const [openDropdown, setOpenDropdown] = useState(null); // "voucher" | "stock" | "repair" | "return" | "reports" | null
  const [activeLink, setActiveLink] = useState("");
  const [activeReport, setActiveReport] = useState("");
  const [hoveredItem, setHoveredItem] = useState(null);
  const reportsRef = useRef(null);

  const [activeStock, setActiveStock] = useState("");
  const [activeVoucher, setActiveVoucher] = useState("");
  const [activeRepair, setActiveRepair] = useState("");
  const [activeReturn, setActiveReturn] = useState("");

  useEffect(() => {
    const path = location.pathname;
    setActiveLink(path);

    // report menus
    if (
      path === "/report" ||
      path === "/customerreport" ||
      path === "/jobcardReport" ||
      path === "/orderreport" ||
      path === "/receiptreport" ||
      path === "/overallreport"
    ) {
      setActiveReport(path);
    } else {
      setActiveReport("");
    }

    // stock menus
    if (
      path === "/productstock" ||
      path === "/itempurchasestock" ||
      path === "/rawgoldstock"
    ) {
      setActiveStock(path);
    } else {
      setActiveStock("");
    }

    // voucher menus
    if (path === "/receiptvoucher" || path === "/expensevoucher") {
      setActiveVoucher(path);
    } else {
      setActiveVoucher("");
    }

    // repair menus
    if (path === "/repairgoldsmith" || path === "/repairstocklist") {
      setActiveRepair(path);
    } else {
      setActiveRepair("");
    }

    // return menus
    if (
      path === "/customerreturn" ||
      path === "/returnstocklist" ||
      path === "/customerrepairstocklist"
    ) {
      setActiveReturn(path);
    } else {
      setActiveReturn("");
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleLinkClick = (path) => {
    setActiveLink(path);
  };

  const handleReportClick = (path) => {
    setActiveReport(path);
    handleLinkClick(path);
    navigate(path);
  };

  const handleStockClick = (path) => {
    setActiveStock(path);
    handleLinkClick(path);
    navigate(path);
  };

  const handleVoucherClick = (path) => {
    setActiveVoucher(path);
    handleLinkClick(path);
    navigate(path);
  };

  const handleRepairClick = (path) => {
    setActiveRepair(path);
    handleLinkClick(path);
    navigate(path);
  };

  const handleReturnClick = (path) => {
    setActiveReturn(path);
    handleLinkClick(path);
    navigate(path);
  };

  // Nav link style generator
  const getNavLinkStyle = (path) => {
    const isActive = activeLink === path || location.pathname === path;
    const isHovered = hoveredItem === path;

    return {
      ...styles.navLink,
      color: isActive ? "#d4af37" : isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.75)",
      backgroundColor: isActive
        ? "rgba(212, 175, 55, 0.08)"
        : isHovered
        ? "rgba(255, 255, 255, 0.06)"
        : "transparent",
      fontWeight: isActive ? "600" : "500",
      borderBottom: isActive ? "2px solid #d4af37" : "2px solid transparent",
      borderRadius: "6px 6px 0 0",
      transform: isHovered ? "translateY(-1px)" : "translateY(0)",
      boxShadow: isHovered && !isActive ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
    };
  };

  // Dropdown item style generator
  const getDropdownItemStyle = (path, activeState) => {
    const isActive = activeState === path || location.pathname === path;
    const isHovered = hoveredItem === path;

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

  // Chevron rotation style
  const getChevronStyle = (isOpen) => ({
    marginLeft: "5px",
    transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
    flexShrink: 0,
  });

  const linkConfig = [
    { label: "Master", path: "/master", icon: FiDatabase },
    { label: "Customer", path: "/customer", icon: FiUsers },
    { label: "Goldsmith", path: "/goldsmith", icon: FiBriefcase },
    { label: "Bill", path: "/bill", icon: FiFileText },
    { label: "Bullion", path: "/bullion", icon: FiTrendingUp },
  ];

  const dropdownsConfig = [
    {
      id: "voucher",
      label: "Voucher",
      icon: FiCreditCard,
      activeState: activeVoucher,
      isOpen: openDropdown === "voucher",
      handleClick: handleVoucherClick,
      items: [
        ["Receipt Voucher", "/receiptvoucher"],
        ["Expense Voucher", "/expensevoucher"],
      ],
    },
    {
      id: "stock",
      label: "Stock",
      icon: FiArchive,
      activeState: activeStock,
      isOpen: openDropdown === "stock",
      handleClick: handleStockClick,
      items: [
        ["Stock Dashboard", "/productstock"],
        ["Raw Gold Stock", "/rawgoldstock"],
      ],
    },
    {
      id: "repair",
      label: "Repair",
      icon: FiTool,
      activeState: activeRepair,
      isOpen: openDropdown === "repair",
      handleClick: handleRepairClick,
      items: [
        ["Goldsmith Repair", "/repairgoldsmith"],
        ["Repair Stock", "/repairstocklist"],
      ],
    },
    {
      id: "return",
      label: "Return & Repair",
      icon: FiRotateCcw,
      activeState: activeReturn,
      isOpen: openDropdown === "return",
      handleClick: handleReturnClick,
      items: [
        ["Customer Return & Repair", "/customerreturn"],
        ["Return Stock", "/returnstocklist"],
        ["Repair Stock", "/customerrepairstocklist"],
      ],
    },
    {
      id: "reports",
      label: "Reports",
      icon: FiBarChart2,
      activeState: activeReport,
      isOpen: openDropdown === "reports",
      handleClick: handleReportClick,
      ref: reportsRef,
      items: [
        ["Daily Sales Report", "/report"],
        ["Customer Report", "/customerreport"],
        ["Jobcard Report", "/jobcardReport"],
        ["Order Report", "/orderreport"],
        ["Receipt Report", "/receiptreport"],
        ["Over All Report", "/overallreport"],
      ],
    },
  ];

  return (
    <div style={styles.navContainer}>
      <div style={styles.navLeft}>
        {!isElectron && (
          <div style={styles.logoContainer}>
            <img style={styles.logoImg} src={logo} alt="Agrlogo" />
            <span style={styles.logoText}>AGR</span>
          </div>
        )}

        {/* Regular Nav Links */}
        {linkConfig.map(({ label, path, icon: Icon }) => (
          <a
            key={label}
            href={path}
            style={getNavLinkStyle(path)}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick(path);
              setOpenDropdown(null);
              navigate(path);
            }}
            onMouseEnter={() => setHoveredItem(path)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Icon style={styles.navIcon} />
            <span>{label}</span>
          </a>
        ))}

        {/* Dropdowns */}
        {dropdownsConfig.map(
          ({
            id,
            label,
            icon: Icon,
            activeState,
            isOpen,
            handleClick,
            items,
            ref,
          }) => {
            const isMenuHovered = hoveredItem === id;
            const isLinkActive =
              activeState !== "" ||
              items.some(([_, path]) => location.pathname === path);

            return (
              <div
                key={id}
                ref={ref}
                style={{
                  ...styles.dropdownTrigger,
                  color: isLinkActive
                    ? "#d4af37"
                    : isMenuHovered
                    ? "#ffffff"
                    : "rgba(255, 255, 255, 0.75)",
                  backgroundColor: isLinkActive
                    ? "rgba(212, 175, 55, 0.08)"
                    : isMenuHovered
                    ? "rgba(255, 255, 255, 0.06)"
                    : "transparent",
                  borderBottom: isLinkActive
                    ? "2px solid #d4af37"
                    : "2px solid transparent",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown((prev) => (prev === id ? null : id));
                }}
                onMouseEnter={() => {
                  setHoveredItem(id);
                  setOpenDropdown(id);
                }}
                onMouseLeave={() => {
                  setHoveredItem(null);
                  setOpenDropdown(null);
                }}
              >
                <Icon style={styles.navIcon} />
                <span>{label}</span>
                <FiChevronDown size={15} style={getChevronStyle(isOpen)} />

                {isOpen && (
                  <div
                    className="nav-dropdown-menu nav-dropdown-animate"
                    style={styles.dropdownMenu}
                  >
                    {items.map(([name, path]) => {
                      const isActive =
                        activeState === path || location.pathname === path;
                      return (
                        <a
                          key={path}
                          href={path}
                          style={getDropdownItemStyle(path, activeState)}
                          onClick={(e) => {
                            e.preventDefault();
                            setOpenDropdown(null);
                            handleClick(path);
                          }}
                          onMouseEnter={() => setHoveredItem(path)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <span>{name}</span>
                          {isActive && (
                            <span style={styles.selectedIndicator}>●</span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      <div style={styles.navRight}>
        <NotificationBell />
        <button
          onClick={handleLogout}
          style={{
            ...styles.logoutButton,
            backgroundColor:
              hoveredItem === "logout" ? "rgba(212, 175, 55, 0.1)" : "transparent",
            color: hoveredItem === "logout" ? "#ffffff" : "#d4af37",
            borderColor: hoveredItem === "logout" ? "#ffffff" : "rgba(212, 175, 55, 0.4)",
            transform: hoveredItem === "logout" ? "translateY(-1px)" : "translateY(0)",
          }}
          onMouseEnter={() => setHoveredItem("logout")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <FiLogOut size={16} style={{ marginRight: "6px" }} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
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
    position: "sticky",
    top: "var(--titlebar-height, 0px)",
    height: "64px",
    zIndex: 1000,
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
    borderBottom: "1px solid rgba(212, 175, 55, 0.12)",
  },
  logoContainer: {
    marginRight: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  logoImg: {
    height: "30px",
    borderRadius: "5px",
  },
  logoText: {
    fontSize: "1.25rem",
    fontWeight: "700",
    background: "linear-gradient(90deg, #fff, #d4af37)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    letterSpacing: "1.5px",
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
  navLink: {
    cursor: "pointer",
    fontSize: "0.88rem",
    fontWeight: "500",
    textDecoration: "none",
    padding: "0 12px",
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    height: "100%",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    boxSizing: "border-box",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  dropdownTrigger: {
    cursor: "pointer",
    fontSize: "0.88rem",
    fontWeight: "500",
    padding: "0 12px",
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    height: "100%",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    position: "relative",
    boxSizing: "border-box",
    flexShrink: 0,
    whiteSpace: "nowrap",
    borderRadius: "6px 6px 0 0",
  },
  navIcon: {
    fontSize: "16px",
    flexShrink: 0,
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexShrink: 0,
    marginLeft: "12px",
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
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: "0",
    backgroundColor: "rgba(17, 24, 39, 0.98)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "0 0 8px 8px",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(212, 175, 55, 0.15)",
    overflow: "hidden",
    zIndex: 999,
    minWidth: "230px",
    padding: "6px 0",
    borderTop: "1px solid rgba(212, 175, 55, 0.2)",
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
  selectedIndicator: {
    color: "#d4af37",
    fontSize: "10px",
    marginLeft: "8px",
    textShadow: "0 0 8px rgba(212, 175, 55, 0.6)",
  },
};

export default Navbar;

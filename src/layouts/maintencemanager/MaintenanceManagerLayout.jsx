import { useEffect, useState } from "react";

import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  ChevronDown,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Printer,
  UserCog,
  Users,
  Wrench,
  X,
} from "lucide-react";

import NotificationBell from "../../modules/notifications/components/NotificationBell";

// ==========================================
// AMIMAINTAIN NAVIGATION
// ==========================================

const MAIN_MENU = [
  {
    label: "Dashboard",
    path: "/maintenance/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Complaints",
    path: "/maintenance/complaints",
    icon: ClipboardList,
  },
  {
    label: "Emergency Job Cards",
    path: "/maintenance/job-cards",
    icon: Printer,
  },
  {
    label: "Reports",
    path: "/maintenance/reports",
    icon: FileText,
  },
];

const TECHNICIAN_PAGES = [
  {
    label: "Manage Technicians",
    path: "/maintenance/workers",
  },
  {
    label: "Technician Performance",
    path: "/maintenance/worker-performance",
  },
];

// Old operational routes remain valid.
// They are no longer separate sidebar items.
const COMPLAINT_RELATED_PATHS = new Set([
  "/maintenance/complaints",
  "/maintenance/assign-worker",
  "/maintenance/assigned-jobs",
  "/maintenance/material-requests",
  "/maintenance/reopen-complaints",
  "/maintenance/overdue-complaints",
]);

const PAGE_TITLES = {
  "/maintenance/dashboard": "Dashboard",
  "/maintenance/complaints": "Complaints",
  "/maintenance/assign-worker": "Assign Technician",
  "/maintenance/assigned-jobs": "Assigned Jobs",
  "/maintenance/material-requests": "Material Requests",
  "/maintenance/reopen-complaints": "Reopened Complaints",
  "/maintenance/overdue-complaints": "Overdue Complaints",
  "/maintenance/workers": "Manage Technicians",
  "/maintenance/worker-performance": "Technician Performance",
  "/maintenance/job-cards": "Emergency Job Cards",
  "/maintenance/reports": "Reports",
  "/maintenance/notifications": "Notifications",
};

// ==========================================
// USER DATA
// ==========================================

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");

    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// ==========================================
// MAIN LAYOUT
// ==========================================

export default function MaintenanceManagerLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [techniciansExpanded, setTechniciansExpanded] = useState(false);

  const [user] = useState(getStoredUser);

  const userName = user?.name || "Maintenance Manager";

  const userInitial = userName.trim().charAt(0).toUpperCase() || "M";

  const pathname = location.pathname;

  const complaintActive = COMPLAINT_RELATED_PATHS.has(pathname);

  const technicianActive =
    pathname === "/maintenance/workers" ||
    pathname === "/maintenance/worker-performance";

  const showTechnicianSubmenu = techniciansExpanded || technicianActive;

  const currentPage = PAGE_TITLES[pathname] || "Maintenance Manager";

  // ========================================
  // MOBILE ESCAPE HANDLER
  // ========================================

  useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen]);

  // ========================================
  // NAVIGATION
  // ========================================

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("activeRole");
    localStorage.removeItem("user");

    setMobileOpen(false);

    navigate("/", {
      replace: true,
    });
  };

  // ========================================
  // COMMON MENU CLASSES
  // ========================================

  const getMenuClasses = (active) => `
    flex min-h-[43px] items-center gap-3
    rounded-xl px-3 py-2.5
    text-[13px] font-semibold
    transition-colors duration-200
    ${collapsed ? "lg:justify-center lg:px-2" : ""}
    ${
      active
        ? "bg-[#E7B957] text-[#071C3C] shadow-sm"
        : "text-slate-200 hover:bg-white/10 hover:text-white"
    }
  `;

  const getMainActive = (item) => {
    if (item.label === "Complaints") {
      return complaintActive;
    }

    return pathname === item.path;
  };

  // ========================================
  // MAIN JSX
  // ========================================

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F7FB] text-[#102B52]">
      {/* MOBILE OVERLAY */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
        />
      )}

      {/* ====================================
          SIDEBAR
      ==================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col overflow-hidden
          w-[min(85vw,260px)]
          bg-gradient-to-b
          from-[#071C3C]
          via-[#102E58]
          to-[#091C36]
          text-white shadow-2xl
          transition-[transform,width] duration-300
          lg:translate-x-0
          ${collapsed ? "lg:w-[72px]" : "lg:w-[240px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* BRAND */}

        <div className="flex min-h-[75px] shrink-0 items-center gap-3 border-b border-white/10 px-3 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7B957] text-[#071C3C] shadow-md">
            <Wrench size={23} strokeWidth={2.4} />
          </div>

          <div
            className={`
              min-w-0 flex-1
              ${collapsed ? "lg:hidden" : ""}
            `}
          >
            <h1 className="truncate text-[20px] font-black tracking-tight">
              AmiMaintain
            </h1>

            <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-wider text-amber-300">
              Maintenance Operations
            </p>
          </div>

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close sidebar"
            className="ml-auto rounded-lg p-1.5 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* COMPACT ROLE CARD */}

        <div
          className={`
            px-3 pt-4
            ${collapsed ? "lg:hidden" : ""}
          `}
        >
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300">
              Operations Portal
            </p>

            <p className="mt-1 text-xs font-semibold text-white">
              Maintenance Manager
            </p>
          </div>
        </div>

        {/* ====================================
            NAVIGATION
        ==================================== */}

        <nav
          aria-label="Maintenance Manager navigation"
          className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2.5 py-5"
        >
          {/* DASHBOARD AND COMPLAINTS */}

          {MAIN_MENU.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = getMainActive(item);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                title={item.label}
                onClick={closeMobileMenu}
                className={getMenuClasses(active)}
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.4 : 2}
                  className="shrink-0"
                />

                <span
                  className={`
                    min-w-0 flex-1 truncate
                    ${collapsed ? "lg:hidden" : ""}
                  `}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}

          {/* ==================================
              TECHNICIANS - ONE MAIN ITEM
          ================================== */}

          <div className="space-y-1">
            <div
              className={`
                flex min-h-[43px] items-center
                rounded-xl transition-colors
                ${
                  technicianActive
                    ? "bg-[#E7B957] text-[#071C3C]"
                    : "text-slate-200 hover:bg-white/10"
                }
              `}
            >
              <NavLink
                to="/maintenance/workers"
                title="Manage Technicians"
                onClick={closeMobileMenu}
                className={`
                  flex min-w-0 flex-1 items-center
                  gap-3 px-3 py-2.5
                  text-[13px] font-semibold
                  ${collapsed ? "lg:justify-center lg:px-2" : ""}
                `}
              >
                <Users size={19} className="shrink-0" />

                <span
                  className={`
                    min-w-0 flex-1 truncate
                    ${collapsed ? "lg:hidden" : ""}
                  `}
                >
                  Technicians
                </span>
              </NavLink>

              {/* EXPAND PERFORMANCE SUBMENU */}

              <button
                type="button"
                onClick={() => setTechniciansExpanded((value) => !value)}
                aria-label="Toggle Technician pages"
                aria-expanded={showTechnicianSubmenu}
                title="Technician pages"
                className={`
                  mr-2 rounded-lg p-1.5
                  transition hover:bg-black/10
                  ${collapsed ? "lg:hidden" : ""}
                `}
              >
                <ChevronDown
                  size={17}
                  className={`
                    transition-transform duration-200
                    ${showTechnicianSubmenu ? "rotate-180" : ""}
                  `}
                />
              </button>
            </div>

            {/* TECHNICIAN SUBMENU */}

            {showTechnicianSubmenu && (
              <div
                className={`
                  ml-4 space-y-1 border-l border-white/15
                  pl-3 pb-1
                  ${collapsed ? "lg:hidden" : ""}
                `}
              >
                {TECHNICIAN_PAGES.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end
                    onClick={closeMobileMenu}
                    className={({ isActive }) => `
                      flex items-center gap-2
                      rounded-lg px-3 py-2
                      text-[12px] font-semibold
                      transition-colors
                      ${
                        isActive
                          ? "bg-white/15 text-amber-300"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <UserCog size={15} className="shrink-0" />

                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* EMERGENCY JOB CARDS AND REPORTS */}

          {MAIN_MENU.slice(2).map((item) => {
            const Icon = item.icon;
            const active = getMainActive(item);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                title={item.label}
                onClick={closeMobileMenu}
                className={getMenuClasses(active)}
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.4 : 2}
                  className="shrink-0"
                />

                <span
                  className={`
                    min-w-0 flex-1 truncate
                    ${collapsed ? "lg:hidden" : ""}
                  `}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* ====================================
            PROFILE
        ==================================== */}

        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E7B957] text-sm font-black text-[#071C3C]">
              {userInitial}
            </div>

            <div
              className={`
                min-w-0 flex-1
                ${collapsed ? "lg:hidden" : ""}
              `}
            >
              <p className="truncate text-sm font-bold">{userName}</p>

              <p className="truncate text-[10px] text-slate-300">
                Maintenance Department
              </p>
            </div>
          </div>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className={`
              mt-2 flex w-full items-center
              gap-3 rounded-xl
              border border-rose-400/20
              bg-rose-500/10 px-3 py-2.5
              text-sm font-bold text-rose-200
              transition hover:bg-rose-500/25
              ${collapsed ? "lg:justify-center" : ""}
            `}
          >
            <LogOut size={18} className="shrink-0" />

            <span className={collapsed ? "lg:hidden" : ""}>Logout</span>
          </button>
        </div>
      </aside>

      {/* ====================================
          MAIN CONTENT
      ==================================== */}

      <div
        className={`
          flex min-w-0 flex-1 flex-col
          transition-[margin] duration-300
          ${collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"}
        `}
      >
        {/* TOP NAVBAR */}

        <header className="z-30 flex min-h-[72px] shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 shadow-sm sm:px-5 lg:px-6">
          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-3">
            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 lg:hidden"
            >
              <Menu size={21} />
            </button>

            {/* DESKTOP COLLAPSE */}

            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-50 lg:flex"
            >
              {collapsed ? (
                <PanelLeftOpen size={19} />
              ) : (
                <PanelLeftClose size={19} />
              )}
            </button>

            {/* PAGE TITLE */}

            <div className="min-w-0">
              <p className="hidden text-[10px] font-bold uppercase tracking-[0.13em] text-[#B48632] sm:block">
                AMIMAINTAIN · MAINTENANCE PORTAL
              </p>

              <h2 className="truncate text-base font-black text-[#102B52] sm:text-lg">
                {currentPage}
              </h2>

              <p className="hidden text-[11px] text-slate-500 md:block">
                Maintenance Operations
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* NOTIFICATIONS */}

            <NotificationBell />

            <div className="hidden h-7 w-px bg-slate-200 sm:block" />

            {/* PROFILE */}

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#102B52] text-sm font-bold text-white">
                {userInitial}
              </div>

              <div className="hidden max-w-[145px] sm:block">
                <p className="truncate text-xs font-bold">{userName}</p>

                <p className="text-[10px] text-slate-500">
                  Maintenance Manager
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN PAGE */}

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#F5F7FB] p-3 sm:p-5 lg:p-6">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

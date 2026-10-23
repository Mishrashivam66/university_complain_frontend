import { useEffect, useMemo, useState } from "react";

import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  Bell,
  Building2,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ClockAlert,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  Megaphone,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  ShieldCheck,
  Tags,
  UserRoundPlus,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";

import NotificationBell from "../../modules/notifications/components/NotificationBell";

// ==========================================
// AMIMAINTAIN ADMIN MENU
// ==========================================

// Existing route paths have been preserved.
// Related pages are organized into 7 groups.

const ADMIN_MENU = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },

  {
    id: "users",
    label: "Users & Access",
    icon: UsersRound,
    items: [
      {
        label: "Create User",
        path: "/admin/create-user",
        icon: UserRoundPlus,
      },
      {
        label: "Manage Users",
        path: "/admin/manage-users",
        icon: UsersRound,
      },
      {
        label: "Manage Students",
        path: "/admin/manage-students",
        icon: GraduationCap,
      },
    ],
  },

  {
    id: "campus",
    label: "Campus Setup",
    icon: Building2,
    items: [
      {
        label: "Buildings",
        path: "/admin/manage-buildings",
        icon: Building2,
      },
      {
        label: "Hostels",
        path: "/admin/manage-hostels",
        icon: Building2,
      },
      {
        label: "Locations",
        path: "/admin/locations-management",
        icon: MapPinned,
      },
    ],
  },
  {
    id: "categories",
    label: "Categories & Priorities",
    icon: Tags,
    items: [
      {
        label: "Categories",
        path: "/admin/categories",
        icon: Tags,
      },
    ],
  },
  {
    id: "complaints",
    label: "Complaint Monitoring",
    icon: ClipboardList,
    items: [
      {
        label: "Complaint Monitor",
        path: "/admin/complaint-monitor",
        icon: ClipboardList,
      },
      {
        label: "Manage Complaints",
        path: "/admin/manage-complaints",
        icon: FileText,
      },
      {
        label: "Overdue Complaints",
        path: "/admin/overdue-complaints",
        icon: ClockAlert,
      },
    ],
  },
  {
    id: "reports",
    label: "Reports & Audit",
    icon: ChartNoAxesCombined,
    items: [
      {
        label: "Reports",
        path: "/admin/reports",
        icon: ChartNoAxesCombined,
      },
      {
        label: "Audit Logs",
        path: "/admin/audit-logs",
        icon: ShieldCheck,
      },
      {
        label: "Inventory Overview",
        path: "/admin/inventory-management",
        icon: Package,
      },
    ],
  },
  {
    id: "settings",
    label: "Settings & Announcements",
    icon: Settings2,
    items: [
      {
        label: "Announcements",
        path: "/admin/announcements",
        icon: Megaphone,
      },
      {
        label: "Notifications",
        path: "/admin/notifications",
        icon: Bell,
      },
    ],
  },
];

// ==========================================
// ACTIVE ROUTE HELPERS
// ==========================================

const routeMatches = (pathname, path) =>
  pathname === path || pathname.startsWith(`${path}/`);

const findActiveMenu = (pathname) => {
  for (const group of ADMIN_MENU) {
    if (group.path && routeMatches(pathname, group.path)) {
      return {
        group,
        page: group,
      };
    }

    const page = group.items?.find((item) => routeMatches(pathname, item.path));

    if (page) {
      return {
        group,
        page,
      };
    }
  }

  return {
    group: ADMIN_MENU[0],
    page: ADMIN_MENU[0],
  };
};

// ==========================================
// SAFE STORED USER
// ==========================================

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");

    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// ==========================================
// ADMIN LAYOUT
// ==========================================

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // ======================================
  // SIDEBAR STATES
  // ======================================

  const [mobileOpen, setMobileOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  const [openGroup, setOpenGroup] = useState(null);

  // ======================================
  // USER
  // ======================================

  const user = useMemo(() => getStoredUser(), []);

  const username = user?.name?.trim() || "Administrator";

  const initial = username.charAt(0).toUpperCase();

  // ======================================
  // CURRENT PAGE
  // ======================================

  const { group: activeGroup, page: activePage } = findActiveMenu(
    location.pathname,
  );

  const showLabels = !collapsed || mobileOpen;

  // ======================================
  // EXPAND CURRENT MENU AUTOMATICALLY
  // ======================================

  useEffect(() => {
    setMobileOpen(false);

    setOpenGroup(activeGroup.id === "dashboard" ? null : activeGroup.id);
  }, [location.pathname, activeGroup.id]);

  // ======================================
  // MOBILE ESCAPE KEY
  // ======================================

  useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  // ======================================
  // TOGGLE MENU GROUP
  // ======================================

  const handleGroupClick = (id) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenGroup(id);
      return;
    }

    setOpenGroup((current) => (current === id ? null : id));
  };

  // ======================================
  // LOGOUT
  // ======================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setMobileOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  // ======================================
  // UI
  // ======================================

  return (
    <div className="flex h-screen h-[100dvh] min-w-0 overflow-hidden bg-[#F4F7FC] text-[#132744]">
      {/* =====================================
          MOBILE BACKDROP
      ===================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-[#020C1E]/70 backdrop-blur-[2px] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside
        id="admin-navigation"
        aria-label="Admin navigation"
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-full
          w-[min(88vw,320px)]
          shrink-0 flex-col
          border-r border-white/10
          bg-[#061B38]
          text-white shadow-2xl
          transition-[width,transform]
          duration-300
          md:static md:z-auto
          md:translate-x-0
          md:shadow-none
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "md:w-[86px]" : "md:w-[290px]"}
        `}
      >
        {/* =================================
            BRAND
        ================================= */}

        <div
          className={`
            flex min-h-[91px] items-center
            border-b border-white/10
            ${showLabels ? "justify-between px-5" : "justify-center px-2"}
          `}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex h-11 w-11 shrink-0
                items-center justify-center
                rounded-2xl
                bg-gradient-to-br
                from-[#F7D385]
                to-[#D9A441]
                text-[#081D3E]
                shadow-lg
              "
            >
              <Wrench size={23} strokeWidth={2.5} />
            </div>

            {showLabels && (
              <div className="min-w-0">
                <div className="whitespace-nowrap text-[21px] font-extrabold tracking-tight">
                  Ami
                  <span className="text-[#F1C76E]">Maintain</span>
                </div>

                <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.17em] text-slate-400">
                  Admin Control Center
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
            className="rounded-xl p-2 text-slate-300 hover:bg-white/10 md:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* =================================
            WORKSPACE INDICATOR
        ================================= */}

        {showLabels && (
          <div className="mx-4 mb-2 mt-5 rounded-xl border border-[#DDAE56]/20 bg-[#DDAE56]/10 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-[#E9C67B]">
              Maintenance Operations
            </p>

            <p className="mt-1 text-xs text-slate-300">
              University Administration
            </p>
          </div>
        )}

        {/* =================================
            NAVIGATION
        ================================= */}

        <nav
          className="
            min-h-0 flex-1
            space-y-1.5
            overflow-y-auto
            overflow-x-hidden
            px-3 py-4
          "
          aria-label="Admin pages"
        >
          {ADMIN_MENU.map((group) => {
            const Icon = group.icon;

            const groupActive = group.id === activeGroup.id;

            // =================================
            // DIRECT LINK: DASHBOARD
            // =================================

            if (group.path) {
              return (
                <NavLink
                  key={group.id}
                  to={group.path}
                  title={!showLabels ? group.label : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `
                      flex min-h-12 items-center
                      rounded-xl px-3 py-3
                      transition-colors
                      ${showLabels ? "gap-3.5" : "justify-center"}
                      ${
                        isActive
                          ? "bg-[#F2C86C] font-bold text-[#071C3A] shadow-lg"
                          : "text-slate-200 hover:bg-white/10"
                      }
                    `
                  }
                >
                  <Icon size={20} className="shrink-0" />

                  {showLabels && (
                    <span className="truncate text-[13.5px]">
                      {group.label}
                    </span>
                  )}
                </NavLink>
              );
            }

            // =================================
            // EXPANDABLE GROUP
            // =================================

            const expanded = openGroup === group.id && showLabels;

            return (
              <div key={group.id}>
                {/* GROUP BUTTON */}

                <button
                  type="button"
                  title={!showLabels ? group.label : undefined}
                  aria-expanded={expanded}
                  onClick={() => handleGroupClick(group.id)}
                  className={`
                    flex min-h-12 w-full
                    items-center rounded-xl
                    px-3 py-3 text-left
                    transition-colors
                    ${showLabels ? "gap-3.5" : "justify-center"}
                    ${
                      groupActive
                        ? "bg-[#17365A] text-[#F2C86C]"
                        : "text-slate-200 hover:bg-white/10"
                    }
                  `}
                >
                  <Icon size={20} className="shrink-0" />

                  {showLabels && (
                    <>
                      <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">
                        {group.label}
                      </span>

                      <ChevronDown
                        size={16}
                        className={`
                          shrink-0
                          transition-transform
                          ${expanded ? "rotate-180" : ""}
                        `}
                      />
                    </>
                  )}
                </button>

                {/* SUBMENU */}

                {expanded && (
                  <div className="ml-[21px] mt-1 space-y-0.5 border-l border-[#6D819D]/30 pl-3">
                    {group.items.map((item) => {
                      const ChildIcon = item.icon;

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            `
                              flex min-h-10 items-center
                              gap-2.5 rounded-lg
                              px-3 py-2
                              text-[12.5px]
                              transition-colors
                              ${
                                isActive
                                  ? "bg-[#F2C86C] font-bold text-[#071C3A]"
                                  : "text-slate-300 hover:bg-white/10 hover:text-white"
                              }
                            `
                          }
                        >
                          <ChildIcon size={16} className="shrink-0" />

                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>

                          {routeMatches(location.pathname, item.path) && (
                            <ChevronRight size={13} />
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* =================================
            DESKTOP COLLAPSE BUTTON
        ================================= */}

        <div className="hidden border-t border-white/10 px-3 py-2 md:block">
          <button
            type="button"
            onClick={() => setCollapsed((old) => !old)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`
              flex w-full items-center
              rounded-xl px-3 py-2.5
              text-slate-300
              transition-colors
              hover:bg-white/10
              ${showLabels ? "gap-3" : "justify-center"}
            `}
          >
            {collapsed ? (
              <PanelLeftOpen size={19} />
            ) : (
              <PanelLeftClose size={19} />
            )}

            {showLabels && (
              <span className="text-xs font-semibold">Collapse Sidebar</span>
            )}
          </button>
        </div>

        {/* =================================
            USER PROFILE
        ================================= */}

        <div className="border-t border-white/10 p-3">
          <div
            className={`
              flex items-center
              rounded-xl
              border border-white/10
              bg-white/[0.06]
              p-2.5
              ${showLabels ? "gap-3" : "justify-center"}
            `}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1C76E] font-extrabold text-[#071C3A]">
              {initial}
            </div>

            {showLabels && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {username}
                </p>

                <p className="mt-0.5 truncate text-[11px] text-slate-400">
                  System Administrator
                </p>
              </div>
            )}
          </div>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            title={!showLabels ? "Logout" : undefined}
            className={`
              mt-2 flex w-full
              items-center rounded-xl
              px-3 py-2.5
              text-rose-200
              transition-colors
              hover:bg-rose-500/15
              ${showLabels ? "gap-3" : "justify-center"}
            `}
          >
            <LogOut size={19} className="shrink-0" />

            {showLabels && (
              <span className="text-sm font-semibold">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* =====================================
          MAIN PANEL
      ===================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* =================================
            TOP NAVBAR
        ================================= */}

        <header className="z-20 flex min-h-[76px] shrink-0 items-center justify-between gap-3 border-b border-[#E3E9F2] bg-white px-4 shadow-sm sm:px-6 lg:px-8">
          {/* LEFT SIDE */}

          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-controls="admin-navigation"
              aria-expanded={mobileOpen}
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-[#132744] md:hidden"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0">
              <p className="hidden truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:block">
                Administration
                {activeGroup.id !== "dashboard"
                  ? ` / ${activeGroup.label}`
                  : ""}
              </p>

              <h1 className="truncate text-lg font-extrabold tracking-tight text-[#0B2248] sm:text-[23px]">
                {activePage.label}
              </h1>
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <span className="hidden rounded-full border border-[#E6D8B9] bg-[#FCF8EF] px-3 py-1.5 text-[11px] font-bold text-[#8D6A31] lg:inline-flex">
              ADMIN PORTAL
            </span>

            <NotificationBell />

            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#102D56] text-sm font-bold text-white"
              title={username}
            >
              {initial}
            </div>
          </div>
        </header>

        {/* =================================
            ROUTED CONTENT
        ================================= */}

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#F4F7FC]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

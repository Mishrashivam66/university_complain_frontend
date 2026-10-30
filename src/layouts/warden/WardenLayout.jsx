import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  ShieldAlert,
  AlertTriangle,
  FileBarChart2,
  LogOut,
  Menu,
  X,
  User,
  Clock3,
  History,
  ChevronDown,
  ChevronRight,
  Wrench,
  ShieldCheck,
  Settings2,
} from "lucide-react";

import NotificationBell from "../../modules/notifications/components/NotificationBell";

// =====================================================
// SAFE USER FETCH
// =====================================================
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  } catch (error) {
    console.error("USER PARSE ERROR:", error);
    return {};
  }
};

// =====================================================
// WARDEN SIDEBAR GROUPS
// Existing working paths are preserved.
// =====================================================
const menuGroups = [
  {
    id: "overview",
    label: "OVERVIEW",
    icon: LayoutDashboard,
    items: [
      {
        name: "Dashboard",
        path: "/warden/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "student-security",
    label: "STUDENT MANAGEMENT & SECURITY",
    icon: ShieldCheck,
    items: [
      {
        name: "Manage Students",
        path: "/warden/manage-students",
        icon: Users,
      },
      {
        name: "Pending Students",
        path: "/warden/pending-students",
        icon: Clock3,
      },
    ],
  },
  {
    id: "maintenance",
    label: "MAINTENANCE OPERATIONS",
    icon: Settings2,
    items: [
      {
        name: "Hostel Complaints",
        path: "/warden/complaints",
        icon: ClipboardList,
      },
      {
        name: "Emergency Alerts",
        path: "/warden/emergency-alerts",
        icon: ShieldAlert,
      },
      {
        name: "Complaint Escalation",
        path: "/warden/escalation",
        icon: AlertTriangle,
      },
    ],
  },
  {
    id: "reports",
    label: "REPORTS & HISTORY",
    icon: FileBarChart2,
    items: [
      {
        name: "Student History",
        path: "/warden/student-history",
        icon: History,
      },
      {
        name: "Warden Reports",
        path: "/warden/reports",
        icon: FileBarChart2,
      },
    ],
  },
];

const getInitialExpanded = () => ({
  overview: true,
  "student-security": true,
  maintenance: true,
  reports: true,
});

// =====================================================
// WARDEN LAYOUT
// =====================================================
const WardenLayout = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [expandedGroups, setExpandedGroups] = useState(getInitialExpanded);

  const user = getStoredUser();

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "W";

  // ===================================================
  // GROUP TOGGLE
  // ===================================================
  const toggleGroup = (groupId) => {
    setExpandedGroups((previous) => ({
      ...previous,
      [groupId]: !previous[groupId],
    }));
  };

  // ===================================================
  // LOGOUT - ORIGINAL BEHAVIOR PRESERVED
  // ===================================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/", {
      replace: true,
    });
  };

  // ===================================================
  // SIDEBAR NAVIGATION
  // ===================================================
  const renderMenuGroup = (group) => {
    const isExpanded = expandedGroups[group.id];

    return (
      <section key={group.id} className="mb-5">
        <button
          type="button"
          onClick={() => toggleGroup(group.id)}
          aria-expanded={isExpanded}
          className="
            flex w-full items-center
            justify-between gap-2
            rounded-xl px-3 py-2.5
            text-left text-[11px]
            font-bold tracking-[0.12em]
            text-[#B9CCE5]
            transition-colors
            hover:bg-white/10
            hover:text-white
          "
        >
          <span className="flex min-w-0 items-center gap-2">
            <group.icon size={15} className="shrink-0 text-[#E8C877]" />

            <span className="leading-5">{group.label}</span>
          </span>

          {isExpanded ? (
            <ChevronDown size={15} className="shrink-0" />
          ) : (
            <ChevronRight size={15} className="shrink-0" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-1.5 space-y-1">
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  group flex w-full items-center
                  gap-3 rounded-xl px-4 py-3
                  text-[14px] font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? `
                        bg-[#E8C877]
                        text-[#092650]
                        shadow-md
                      `
                      : `
                        text-[#EDF3FC]
                        hover:bg-white/10
                        hover:text-white
                      `
                  }
                `}
              >
                <item.icon size={19} className="shrink-0" />

                <span className="min-w-0 flex-1">{item.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5FB]">
      {/* ==========================================
          MOBILE OVERLAY
      ========================================== */}
      {sidebarOpen && (
        <div
          className="
            fixed inset-0 z-40
            bg-[#06162C]/65
            backdrop-blur-[2px]
            md:hidden
          "
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ==========================================
          SIDEBAR
      ========================================== */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[290px]
          max-w-[85vw]
          flex-col
          bg-gradient-to-b
          from-[#061B3B]
          via-[#082A56]
          to-[#0B3766]
          text-white
          shadow-2xl
          transition-transform
          duration-300
          md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ========================================
            BRANDING
        ======================================== */}
        <div
          className="
            shrink-0
            border-b border-white/10
            px-5 pb-5 pt-6
          "
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  flex h-12 w-12 shrink-0
                  items-center justify-center
                  rounded-2xl
                  bg-[#E8C877]
                  text-[#082650]
                  shadow-lg
                "
              >
                <Wrench size={24} strokeWidth={2.3} />
              </div>

              <div className="min-w-0">
                <h1
                  className="
                    text-[16px] font-extrabold
                    leading-tight tracking-wide
                    text-white
                  "
                >
                  AMI MAINTENANCE
                </h1>

                <p
                  className="
                    mt-1 text-xs
                    font-medium
                    text-[#E8C877]
                  "
                >
                  Warden Portal
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="
                shrink-0 rounded-lg
                p-1.5 text-white/80
                hover:bg-white/10
                hover:text-white
                md:hidden
              "
              aria-label="Close sidebar"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* ========================================
            SCROLLABLE MENU
        ======================================== */}
        <nav
          className="
            min-h-0 flex-1
            overflow-y-auto
            px-3 py-5
            overscroll-contain
            [scrollbar-width:thin]
          "
          aria-label="Warden navigation"
        >
          {menuGroups.map(renderMenuGroup)}
        </nav>

        {/* ========================================
            WARDEN USER CARD
        ======================================== */}
        <div className="shrink-0 border-t border-white/10 px-4 pt-4">
          <div
            className="
              flex items-center gap-3
              rounded-2xl
              border border-white/10
              bg-white/10
              p-3.5
            "
          >
            <div
              className="
                flex h-11 w-11 shrink-0
                items-center justify-center
                rounded-full
                border border-[#E8C877]/50
                bg-[#E8C877]/20
                text-lg font-bold
                text-[#F5DF9D]
              "
            >
              {userInitial}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {user?.name || "Warden"}
              </p>

              <p className="mt-0.5 text-xs text-[#C7D6EB]">Hostel Warden</p>

              {user?.assignedHostel && (
                <p
                  className="
                    mt-1 truncate
                    text-xs font-medium
                    text-[#E8C877]
                  "
                >
                  {typeof user.assignedHostel === "object"
                    ? user.assignedHostel.name ||
                      user.assignedHostel.hostelName ||
                      "Assigned Hostel"
                    : user.assignedHostel}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ========================================
            LOGOUT
        ======================================== */}
        <div className="shrink-0 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="
              flex w-full items-center
              justify-center gap-3
              rounded-xl
              border border-red-400/20
              bg-red-500/15
              px-4 py-3
              font-semibold
              text-red-100
              transition-all
              duration-200
              hover:bg-red-500
              hover:text-white
            "
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* ==========================================
          MAIN AREA
      ========================================== */}
      <div
        className="
          flex min-h-screen min-w-0
          flex-1 flex-col
          md:ml-[290px]
        "
      >
        {/* ========================================
            TOPBAR
        ======================================== */}
        <header
          className="
            sticky top-0 z-30
            flex min-h-[76px]
            items-center justify-between
            gap-3
            border-b border-slate-200
            bg-white/95
            px-4 py-4
            shadow-sm
            backdrop-blur-md
            sm:px-6
          "
        >
          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="
                flex h-10 w-10
                shrink-0 items-center
                justify-center
                rounded-xl
                bg-[#F0F4FA]
                text-[#082650]
                hover:bg-[#E6EDF7]
                md:hidden
              "
              aria-label="Open sidebar"
            >
              <Menu size={23} />
            </button>

            <div className="min-w-0">
              <h2
                className="
                  truncate text-lg
                  font-extrabold
                  text-[#082650]
                  sm:text-2xl
                "
              >
                Warden Panel
              </h2>

              <p
                className="
                  hidden text-xs
                  text-slate-500
                  sm:block
                "
              >
                Hostel Security & Maintenance Management
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex shrink-0 items-center gap-3">
            {/* EXISTING NOTIFICATIONS */}
            <NotificationBell />

            <div
              className="
                hidden items-center gap-3
                border-l border-slate-200
                pl-4 md:flex
              "
            >
              <div
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-full
                  bg-[#082650]
                  text-white
                "
              >
                <User size={19} />
              </div>

              <div className="max-w-[190px] min-w-0">
                <p
                  className="
                    truncate text-sm
                    font-bold text-[#082650]
                  "
                >
                  {user?.name || "Warden"}
                </p>

                <p className="text-xs text-slate-500">Hostel Warden</p>
              </div>
            </div>
          </div>
        </header>

        {/* ========================================
            PAGE CONTENT - EXISTING ROUTES
        ======================================== */}
        <main
          className="
            min-w-0 flex-1
            overflow-x-hidden
            p-4 sm:p-5 md:p-6
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default WardenLayout;

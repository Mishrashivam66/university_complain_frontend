import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  ShieldCheck,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import NotificationBell from "../../modules/notifications/components/NotificationBell";

// =====================================================
// AMI MAINTENANCE - STUDENT LAYOUT
// Single sidebar menu; notifications remain in navbar.
// =====================================================

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}") || {};
  } catch {
    return {};
  }
}

// =====================================================
// FINAL SIDEBAR MENU
// =====================================================

const mainMenu = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Create Complaint",
    path: "/create-complaint",
    icon: PlusCircle,
  },
  {
    name: "My Complaints",
    path: "/complaints",
    icon: ClipboardList,
  },
  {
    name: "My Profile",
    path: "/profile",
    icon: UserRound,
    description: "Hostel, Wardens & Notices",
  },
];

// =====================================================
// REUSABLE SIDEBAR LINK
// =====================================================

function SidebarLink({ item, pathname, onNavigate }) {
  const Icon = item.icon;

  const isCreate = item.path === "/create-complaint";

  const isComplaintDetails =
    item.path === "/complaints" &&
    (pathname.startsWith("/complaints/") || pathname.startsWith("/complaint/"));

  const isProfileChild =
    item.path === "/profile" &&
    [
      "/edit-profile",
      "/change-password",
      "/hostel-details",
      "/student/notices",
    ].includes(pathname);

  return (
    <NavLink
      to={item.path}
      end
      onClick={onNavigate}
      className={({ isActive }) => {
        const selected = isActive || isComplaintDetails || isProfileChild;

        const base =
          "group flex min-h-[50px] items-center gap-3 " +
          "rounded-xl px-4 py-3 transition-all duration-200 ";

        if (selected) {
          return (
            base +
            "bg-[#E6B44B] text-[#102746] " +
            "shadow-[0_7px_20px_rgba(230,180,75,0.18)]"
          );
        }

        if (isCreate) {
          return (
            base +
            "border border-[#E6B44B]/30 " +
            "bg-[#E6B44B]/10 text-[#F2CA76] " +
            "hover:bg-[#E6B44B]/20"
          );
        }

        return (
          base + "text-slate-300 hover:bg-white/[0.08] " + "hover:text-white"
        );
      }}
    >
      {({ isActive }) => {
        const selected = isActive || isComplaintDetails || isProfileChild;

        return (
          <>
            <Icon
              size={19}
              strokeWidth={2}
              className={`shrink-0 ${
                selected
                  ? "text-[#102746]"
                  : isCreate
                    ? "text-[#E6B44B]"
                    : "text-slate-400 group-hover:text-white"
              }`}
            />

            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">
                {item.name}
              </span>

              {item.description && (
                <span
                  className={`mt-0.5 block truncate text-[10px] ${
                    selected ? "text-[#102746]/75" : "text-slate-400"
                  }`}
                >
                  {item.description}
                </span>
              )}
            </div>

            {selected && <ChevronRight size={17} className="shrink-0" />}
          </>
        );
      }}
    </NavLink>
  );
}

// =====================================================
// STUDENT LAYOUT
// =====================================================

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // ===================================================
  // STATES
  // ===================================================

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser);

  // ===================================================
  // SYNC STUDENT PROFILE
  // ===================================================

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());

    window.addEventListener("storage", syncUser);
    window.addEventListener("student-profile-updated", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("student-profile-updated", syncUser);
    };
  }, []);

  // ===================================================
  // CLOSE MOBILE SIDEBAR ON ROUTE CHANGE
  // ===================================================

  useEffect(() => {
    setSidebarOpen(false);
    setUser(getStoredUser());
  }, [location.pathname]);

  // ===================================================
  // STUDENT DETAILS
  // ===================================================

  const studentName =
    typeof user?.name === "string" && user.name.trim()
      ? user.name.trim()
      : "Student";

  const studentInitial = studentName.charAt(0).toUpperCase();

  const studentId =
    user?.amizoneId || user?.enrollmentNumber || user?.rollNumber || "";

  const isHosteller =
    user?.isHosteller === true ||
    user?.isHosteller === "true" ||
    (user?.isHosteller == null && Boolean(user?.hostel));

  const studentType = isHosteller ? "Hosteller" : "Day Scholar";

  // ===================================================
  // PAGE TITLE
  // ===================================================

  const pathname = location.pathname;

  let pageTitle =
    mainMenu.find((item) => item.path === pathname)?.name || "Student Portal";

  if (
    pathname.startsWith("/complaints/") ||
    pathname.startsWith("/complaint/")
  ) {
    pageTitle = "Complaint Details";
  } else if (pathname === "/edit-profile") {
    pageTitle = "Edit Profile";
  } else if (pathname === "/change-password") {
    pageTitle = "Change Password";
  } else if (
    pathname === "/hostel-details" ||
    pathname === "/student/notices"
  ) {
    pageTitle = "My Profile";
  } else if (pathname === "/notifications") {
    pageTitle = "Notifications";
  }

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setSidebarOpen(false);

    navigate("/", {
      replace: true,
    });
  };

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans text-[#142C4D]">
      {/* ===========================================
          MOBILE SIDEBAR OVERLAY
      =========================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#07182F]/70 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* ===========================================
          SIDEBAR
      =========================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-[280px] flex-col overflow-hidden
          border-r border-white/10
          bg-[#102746] text-white
          shadow-[12px_0_35px_rgba(15,35,65,0.08)]
          transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ========================================
            BRANDING
        ======================================== */}

        <div className="relative shrink-0 border-b border-white/10 px-5 pb-6 pt-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E6B44B] shadow-[0_8px_22px_rgba(230,180,75,0.2)]">
              <Wrench size={25} strokeWidth={2.3} className="text-[#102746]" />
            </div>

            <div className="min-w-0">
              <h1 className="text-[19px] font-extrabold leading-tight tracking-wide text-white">
                AMI <span className="text-[#E6B44B]">MAINTENANCE</span>
              </h1>

              <p className="mt-1 text-[11px] font-medium tracking-[0.08em] text-slate-300">
                SMART CAMPUS SERVICES
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="absolute right-3 top-3 rounded-lg p-2 text-slate-300 transition hover:bg-white/10 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* ========================================
            STUDENT PORTAL BADGE
        ======================================== */}

        <div className="shrink-0 px-4 pt-5">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6B44B]/15">
              <GraduationCap size={19} className="text-[#E6B44B]" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Logged in as
              </p>

              <p className="mt-0.5 text-sm font-bold text-white">
                Student
                <span className="ml-2 font-normal text-slate-300">
                  · {studentType}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* ========================================
            SINGLE MAIN MENU
            NO STUDENT SERVICES
            NO SIDEBAR NOTIFICATIONS
        ======================================== */}

        <nav
          aria-label="Student navigation"
          className="mt-5 flex-1 overflow-y-auto px-4 pb-5 [scrollbar-width:thin]"
        >
          <p className="px-4 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Main Menu
          </p>

          <div className="space-y-1.5">
            {mainMenu.map((item) => (
              <SidebarLink
                key={item.path}
                item={item}
                pathname={pathname}
                onNavigate={() => setSidebarOpen(false)}
              />
            ))}
          </div>
        </nav>

        {/* ========================================
            STUDENT PROFILE & LOGOUT
        ======================================== */}

        <div className="shrink-0 border-t border-white/10 bg-[#0D223D] p-4">
          {/* STUDENT PROFILE SHORTCUT */}

          <button
            type="button"
            onClick={() => {
              setSidebarOpen(false);
              navigate("/profile");
            }}
            className="mb-4 flex w-full items-center gap-3 rounded-xl bg-white/[0.05] p-3 text-left transition hover:bg-white/10"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6B44B] text-lg font-extrabold text-[#102746]">
              {studentInitial}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {studentName}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-400">
                {studentId || studentType}
              </p>
            </div>

            <ShieldCheck size={17} className="shrink-0 text-[#E6B44B]" />
          </button>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 transition-all duration-200 hover:border-red-400/40 hover:bg-red-500/20 hover:text-white"
          >
            <LogOut size={18} />
            Logout
          </button>

          <p className="mt-4 text-center text-[10px] tracking-wide text-slate-500">
            AMI MAINTENANCE · Student Portal
          </p>
        </div>
      </aside>

      {/* ===========================================
          MAIN CONTENT
      =========================================== */}

      <div className="min-h-screen min-w-0 md:ml-[280px]">
        {/* ========================================
            TOP NAVBAR
        ======================================== */}

        <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 shadow-[0_2px_12px_rgba(15,35,65,0.03)] backdrop-blur-xl">
          <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            {/* LEFT */}

            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[#102746] transition hover:bg-slate-100 md:hidden"
              >
                <Menu size={21} />
              </button>

              <div className="min-w-0">
                <p className="hidden text-[11px] font-bold uppercase tracking-[0.16em] text-[#B18431] sm:block">
                  AMI Maintenance / Student
                </p>

                <h2 className="truncate text-lg font-extrabold tracking-tight text-[#102746] sm:text-xl">
                  {pageTitle}
                </h2>
              </div>
            </div>

            {/* RIGHT */}

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              {/* COMMON NOTIFICATION BELL */}

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50">
                <NotificationBell />
              </div>

              <div className="hidden h-9 w-px bg-slate-200 sm:block" />

              {/* STUDENT PROFILE */}

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex items-center gap-3 rounded-xl text-left"
                title="Open My Profile"
              >
                <div className="hidden text-right sm:block">
                  <p className="max-w-[170px] truncate text-sm font-bold text-[#102746]">
                    {studentName}
                  </p>

                  <p className="text-xs text-slate-500">{studentType}</p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#102746] text-sm font-extrabold text-[#E6B44B] ring-2 ring-[#E6B44B]/20">
                  {studentInitial}
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* ========================================
            PAGE CONTENT
        ======================================== */}

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

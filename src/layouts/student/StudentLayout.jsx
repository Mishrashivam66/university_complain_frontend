import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  LogOut,
  Menu,
  X,
  UserRound,
  BellRing,
  Building2,
  Wrench,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

import NotificationBell from "../../modules/notifications/components/NotificationBell";

// =====================================================
// STORAGE USER
// =====================================================

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// =====================================================
// STUDENT LAYOUT
// =====================================================

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser);

  // ===================================================
  // USER SYNC
  // ===================================================

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("storage", syncUser);
    window.addEventListener("student-profile-updated", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("student-profile-updated", syncUser);
    };
  }, []);

  // ===================================================
  // USER INFO
  // ===================================================

  const studentName =
    typeof user?.name === "string" && user.name.trim()
      ? user.name.trim()
      : "Student";

  const studentInitial = studentName.charAt(0).toUpperCase();

  const studentId =
    user?.amizoneId || user?.enrollmentNumber || user?.rollNumber || "";

  const isHosteller = user?.isHosteller === true || Boolean(user?.hostel);

  const studentType = isHosteller ? "Hosteller" : "Day Scholar";

  // ===================================================
  // SIDEBAR MENU
  // ===================================================

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
  ];

  const studentMenu = [
    ...(isHosteller
      ? [
          {
            name: "Hostel Details",
            path: "/hostel-details",
            icon: Building2,
          },
          {
            name: "Hostel Notices",
            path: "/student/notices",
            icon: BellRing,
          },
        ]
      : []),
    {
      name: "Notifications",
      path: "/notifications",
      icon: BellRing,
    },
    {
      name: "My Profile",
      path: "/profile",
      icon: UserRound,
    },
  ];

  const allMenuItems = [...mainMenu, ...studentMenu];

  // ===================================================
  // PAGE TITLE
  // ===================================================

  const matchedPage = allMenuItems.find(
    (item) => item.path === location.pathname,
  );

  const pageTitle =
    matchedPage?.name ||
    (location.pathname.startsWith("/complaint/")
      ? "Complaint Details"
      : location.pathname === "/edit-profile"
        ? "Edit Profile"
        : "Student Portal");

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
  // MENU COMPONENT
  // ===================================================

  const renderMenu = (items) => {
    return items.map((item) => {
      const Icon = item.icon;
      const isCreate = item.path === "/create-complaint";

      return (
        <NavLink
          key={item.path}
          to={item.path}
          end
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) => {
            const base =
              "group flex min-h-[48px] items-center gap-3 " +
              "rounded-xl px-4 py-3 text-sm font-semibold " +
              "transition-all duration-200";

            if (isActive) {
              return (
                base +
                " bg-[#E6B44B] text-[#102746] " +
                "shadow-[0_6px_20px_rgba(230,180,75,0.18)]"
              );
            }

            if (isCreate) {
              return (
                base +
                " border border-[#E6B44B]/30 " +
                "bg-[#E6B44B]/10 text-[#F2CA76] " +
                "hover:bg-[#E6B44B]/20"
              );
            }

            return (
              base +
              " text-slate-300 " +
              "hover:bg-white/[0.08] hover:text-white"
            );
          }}
        >
          {({ isActive }) => (
            <>
              <Icon
                size={19}
                strokeWidth={2}
                className={
                  isActive
                    ? "shrink-0 text-[#102746]"
                    : isCreate
                      ? "shrink-0 text-[#E6B44B]"
                      : "shrink-0 text-slate-400 group-hover:text-white"
                }
              />

              <span className="flex-1 truncate">{item.name}</span>

              {isActive && <ChevronRight size={17} className="shrink-0" />}
            </>
          )}
        </NavLink>
      );
    });
  };

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans text-[#142C4D]">
      {/* ================================================
          MOBILE OVERLAY
      ================================================ */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="
            fixed inset-0 z-40
            bg-[#07182F]/70
            backdrop-blur-[2px]
            md:hidden
          "
        />
      )}

      {/* ================================================
          SIDEBAR
      ================================================ */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-[280px] flex-col
          overflow-hidden
          border-r border-white/10
          bg-[#102746] text-white
          shadow-[12px_0_35px_rgba(15,35,65,0.08)]
          transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ==============================================
            BRANDING
        ============================================== */}

        <div className="relative shrink-0 border-b border-white/10 px-5 pb-6 pt-7">
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-12 w-12 shrink-0 items-center
                justify-center rounded-2xl
                bg-[#E6B44B]
                shadow-[0_8px_22px_rgba(230,180,75,0.2)]
              "
            >
              <Wrench size={25} strokeWidth={2.3} className="text-[#102746]" />
            </div>

            <div className="min-w-0">
              <h1 className="text-[19px] font-extrabold leading-tight tracking-wide text-white">
                AMI
                <span className="text-[#E6B44B]"> MAINTENANCE</span>
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
            className="
              absolute right-3 top-3
              rounded-lg p-2
              text-slate-300
              transition hover:bg-white/10
              md:hidden
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* ==============================================
            PORTAL BADGE
        ============================================== */}

        <div className="shrink-0 px-4 pt-5">
          <div
            className="
              flex items-center gap-3 rounded-xl
              border border-white/10
              bg-white/[0.05]
              px-4 py-3
            "
          >
            <div
              className="
                flex h-9 w-9 items-center
                justify-center rounded-lg
                bg-[#E6B44B]/15
              "
            >
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

        {/* ==============================================
            NAVIGATION
        ============================================== */}

        <nav
          aria-label="Student navigation"
          className="
            mt-5 flex-1 space-y-6
            overflow-y-auto
            px-4 pb-5
            [scrollbar-width:thin]
          "
        >
          {/* MAIN MENU */}

          <div className="space-y-1.5">
            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Main Menu
            </p>

            {renderMenu(mainMenu)}
          </div>

          {/* STUDENT SERVICES */}

          <div className="space-y-1.5">
            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Student Services
            </p>

            {renderMenu(studentMenu)}
          </div>
        </nav>

        {/* ==============================================
            BOTTOM PROFILE
        ============================================== */}

        <div className="shrink-0 border-t border-white/10 bg-[#0D223D] p-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/[0.05] p-3">
            <div
              className="
                flex h-11 w-11 shrink-0
                items-center justify-center
                rounded-xl bg-[#E6B44B]
                text-lg font-extrabold
                text-[#102746]
              "
            >
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
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex w-full items-center
              justify-center gap-2.5
              rounded-xl
              border border-red-400/20
              bg-red-500/10
              px-4 py-3
              text-sm font-bold
              text-red-200
              transition-all duration-200
              hover:border-red-400/40
              hover:bg-red-500/20
              hover:text-white
            "
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

          <p className="mt-4 text-center text-[10px] tracking-wide text-slate-500">
            AMI MAINTENANCE · Student Portal
          </p>
        </div>
      </aside>

      {/* ================================================
          MAIN CONTENT
      ================================================ */}

      <div className="min-h-screen min-w-0 md:ml-[280px]">
        {/* ==============================================
            TOP NAVBAR
        ============================================== */}

        <header
          className="
            sticky top-0 z-30
            border-b border-[#E2E8F0]
            bg-white/95
            shadow-[0_2px_12px_rgba(15,35,65,0.03)]
            backdrop-blur-xl
          "
        >
          <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            {/* LEFT */}

            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen(true)}
                className="
                  flex h-10 w-10 shrink-0 items-center
                  justify-center rounded-xl
                  border border-slate-200
                  bg-slate-50 text-[#102746]
                  transition hover:bg-slate-100
                  md:hidden
                "
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
              {/* NOTIFICATION BELL */}

              <div
                className="
                  flex h-10 w-10 items-center
                  justify-center rounded-xl
                  border border-slate-200
                  bg-white
                  transition hover:bg-slate-50
                "
              >
                <NotificationBell />
              </div>

              {/* DIVIDER */}

              <div className="hidden h-9 w-px bg-slate-200 sm:block" />

              {/* USER INFO */}

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="max-w-[170px] truncate text-sm font-bold text-[#102746]">
                    {studentName}
                  </p>

                  <p className="text-xs text-slate-500">{studentType}</p>
                </div>

                <div
                  className="
                    flex h-10 w-10 shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-[#102746]
                    text-sm font-extrabold text-[#E6B44B]
                    ring-2 ring-[#E6B44B]/20
                  "
                >
                  {studentInitial}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ==============================================
            PAGE CONTENT
        ============================================== */}

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;

import { useState } from "react";

import {
  LayoutDashboard,
  Users,
  ClipboardList,
  AlertTriangle,
  BarChart3,
  Menu,
  X,
  Package,
  RotateCcw,
  FileText,
  UserCog,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { NavLink, Outlet, useNavigate } from "react-router-dom";

// ==========================================
// NOTIFICATION BELL
// ==========================================

import NotificationBell from "../../modules/notifications/components/NotificationBell";

// ==========================================
// SAFE USER FETCH
// ==========================================

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");

    return storedUser ? JSON.parse(storedUser) : {};
  } catch (error) {
    console.log("USER PARSE ERROR:", error);

    return {};
  }
};

// ==========================================
// MAINTENANCE MANAGER LAYOUT
// ==========================================

const MaintenanceManagerLayout = () => {
  // ======================================
  // STATE
  // ======================================

  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  // ======================================
  // USER
  // ======================================

  const user = getStoredUser();

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "M";

  // ======================================
  // MENU ITEMS
  // ======================================

  const navItems = [
    {
      name: "Dashboard",

      path: "/maintenance/dashboard",

      icon: LayoutDashboard,
    },

    {
      name: "Complaints",

      path: "/maintenance/complaints",

      icon: ClipboardList,
    },

    {
      name: "Assign Worker",

      path: "/maintenance/assign-worker",

      icon: Users,
    },

    {
      name: "Assigned Jobs",

      path: "/maintenance/assigned-jobs",

      icon: ClipboardList,
    },

    {
      name: "Workers",

      path: "/maintenance/workers",

      icon: UserCog,
    },

    {
      name: "Job Cards",

      path: "/maintenance/job-cards",

      icon: ClipboardList,
    },

    {
      name: "Material Requests",

      path: "/maintenance/material-requests",

      icon: Package,
    },

    {
      name: "Verification",

      path: "/maintenance/verification",

      icon: ShieldCheck,
    },

    {
      name: "Reopen Complaints",

      path: "/maintenance/reopen-complaints",

      icon: RotateCcw,
    },

    {
      name: "Overdue Complaints",

      path: "/maintenance/overdue-complaints",

      icon: AlertTriangle,
    },

    {
      name: "Performance",

      path: "/maintenance/worker-performance",

      icon: BarChart3,
    },

    {
      name: "Reports",

      path: "/maintenance/reports",

      icon: FileText,
    },
  ];

  // ======================================
  // LOGOUT
  // ======================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/", {
      replace: true,
    });
  };

  return (
    <div
      className="
        flex

        h-screen

        bg-[#EEF3FF]

        overflow-hidden
      "
    >
      {/* ======================================
          MOBILE OVERLAY
      ====================================== */}

      {open && (
        <div
          className="
            fixed
            inset-0

            bg-black/40

            z-40

            lg:hidden
          "
          onClick={() => setOpen(false)}
        />
      )}

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`
          fixed
          top-0
          left-0

          z-50

          h-screen

          w-[320px]

          flex
          flex-col

          bg-gradient-to-b
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          text-white

          shadow-2xl

          transition-transform
          duration-300

          lg:translate-x-0

          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ==================================
            LOGO
        ================================== */}

        <div
          className="
            px-6
            pt-7
            pb-5

            border-b
            border-white/10

            flex
            items-start
            justify-between

            shrink-0
          "
        >
          <div>
            <h1
              className="
                text-[34px]

                font-extrabold

                tracking-tight

                leading-none

                whitespace-nowrap
              "
            >
              CAMPUSPULSE
            </h1>

            <p
              className="
                text-yellow-300

                text-sm

                mt-2
              "
            >
              Maintenance ERP
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="
              lg:hidden

              mt-1
            "
            aria-label="Close sidebar"
          >
            <X size={28} />
          </button>
        </div>

        {/* ==================================
            NAVIGATION
        ================================== */}

        <div
          className="
            flex-1

            overflow-y-auto

            px-4
            py-5

            scrollbar-thin
            scrollbar-thumb-white/20
            scrollbar-track-transparent
          "
        >
          <nav
            className="
              space-y-2
            "
          >
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `
                    flex
                    items-center

                    gap-4

                    px-4
                    py-3.5

                    rounded-2xl

                    text-[15px]

                    font-medium

                    transition-all
                    duration-300

                    ${
                      isActive
                        ? `
                          bg-yellow-400
                          text-[#001B54]
                          shadow-xl
                        `
                        : `
                          text-white
                          hover:bg-white/10
                        `
                    }
                  `}
              >
                <item.icon
                  size={21}
                  className="
                      shrink-0
                    "
                />

                <span
                  className="
                      leading-5
                    "
                >
                  {item.name}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ==================================
            MANAGER CARD
        ================================== */}

        <div
          className="
            px-4
            pb-3
          "
        >
          <div
            className="
              rounded-2xl

              border
              border-white/10

              bg-white/10

              p-4

              flex
              items-center

              gap-3
            "
          >
            <div
              className="
                h-12
                w-12

                rounded-full

                bg-yellow-400

                text-[#001B54]

                flex
                items-center
                justify-center

                font-extrabold

                text-lg

                shrink-0
              "
            >
              {userInitial}
            </div>

            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  font-bold

                  text-white

                  truncate
                "
              >
                {user?.name || "Maintenance Manager"}
              </p>

              <p
                className="
                  text-xs

                  text-white/70
                "
              >
                Maintenance Department
              </p>
            </div>
          </div>
        </div>

        {/* ==================================
            LOGOUT
        ================================== */}

        <div
          className="
            p-4

            border-t
            border-white/10

            shrink-0
          "
        >
          <button
            type="button"
            onClick={handleLogout}
            className="
              w-full

              flex
              items-center
              justify-center

              gap-3

              py-3.5

              rounded-2xl

              bg-red-500/20

              hover:bg-red-500

              transition-all
              duration-300

              font-semibold
            "
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <div
        className="
          flex-1

          flex
          flex-col

          lg:ml-[320px]

          h-screen

          min-w-0

          overflow-hidden
        "
      >
        {/* ==================================
            TOPBAR
        ================================== */}

        <header
          className="
            bg-white/95

            backdrop-blur-md

            border-b
            border-gray-200

            shadow-sm

            px-4
            md:px-6

            py-4

            flex
            items-center
            justify-between

            shrink-0
          "
        >
          {/* LEFT */}

          <div
            className="
              flex
              items-center

              gap-4

              min-w-0
            "
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="
                lg:hidden

                shrink-0
              "
              aria-label="Open sidebar"
            >
              <Menu size={28} />
            </button>

            <div
              className="
                min-w-0
              "
            >
              <h2
                className="
                  text-xl
                  sm:text-2xl
                  md:text-3xl

                  font-bold

                  text-[#001B54]

                  truncate
                "
              >
                Maintenance Manager Panel
              </h2>

              <p
                className="
                  text-sm
                  text-gray-500

                  mt-1

                  hidden
                  sm:block
                "
              >
                Smart Campus ERP System
              </p>
            </div>
          </div>

          {/* ==================================
              RIGHT
          ================================== */}

          <div
            className="
              flex
              items-center

              gap-3
              md:gap-5
            "
          >
            {/* ================================
                NOTIFICATION BELL
            ================================ */}

            <NotificationBell />

            {/* ================================
                PROFILE
            ================================ */}

            <div
              className="
                hidden
                md:flex

                items-center

                gap-3
              "
            >
              <div
                className="
                  h-11
                  w-11

                  rounded-full

                  bg-[#001B54]

                  text-white

                  flex
                  items-center
                  justify-center

                  font-bold
                "
              >
                {userInitial}
              </div>

              <div
                className="
                  min-w-0
                "
              >
                <p
                  className="
                    font-semibold

                    text-[#001B54]

                    truncate

                    max-w-[180px]
                  "
                >
                  {user?.name || "Maintenance Manager"}
                </p>

                <p
                  className="
                    text-xs
                    text-gray-500
                  "
                >
                  ERP Department
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ==================================
            PAGE CONTENT
        ================================== */}

        <main
          className="
            flex-1

            overflow-y-auto

            p-4
            md:p-6
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MaintenanceManagerLayout;

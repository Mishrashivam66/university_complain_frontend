import { useState } from "react";

import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  UserCog,
  Building2,
  ClipboardList,
  AlertTriangle,
  FileBarChart2,
  Boxes,
  Megaphone,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";

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
// ADMIN LAYOUT
// ==========================================

const AdminLayout = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ======================================
  // USER
  // ======================================

  const user = getStoredUser();

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "A";

  // ======================================
  // ADMIN MENU
  // ======================================

  const adminMenu = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },

    {
      name: "Create User",
      path: "/admin/create-user",
      icon: UserCog,
    },

    {
      name: "Manage Buildings",
      path: "/admin/manage-buildings",
      icon: Building2,
    },

    {
      name: "Manage Hostels",
      path: "/admin/manage-hostels",
      icon: Building2,
    },

    {
      name: "Manage Students",
      path: "/admin/manage-students",
      icon: GraduationCap,
    },

    {
      name: "Manage Users",
      path: "/admin/manage-users",
      icon: Users,
    },

    {
      name: "Categories",
      path: "/admin/categories",
      icon: ClipboardList,
    },

    {
      name: "Complaint Monitor",
      path: "/admin/complaint-monitor",
      icon: ClipboardList,
    },

    {
      name: "Overdue Complaints",
      path: "/admin/overdue-complaints",
      icon: AlertTriangle,
    },

    {
      name: "Announcements",
      path: "/admin/announcements",
      icon: Megaphone,
    },

    {
      name: "Reports",
      path: "/admin/reports",
      icon: FileBarChart2,
    },

    {
      name: "Inventory",
      path: "/admin/inventory-management",
      icon: Boxes,
    },

    {
      name: "Audit Logs",
      path: "/admin/audit-logs",
      icon: ShieldCheck,
    },

    {
      name: "Roles & Permissions",
      path: "/admin/roles-permissions",
      icon: ShieldCheck,
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

      {sidebarOpen && (
        <div
          className="
            fixed
            inset-0

            bg-black/40

            z-40

            md:hidden
          "
          onClick={() => setSidebarOpen(false)}
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

          transform

          transition-transform
          duration-300

          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* ==================================
            LOGO
        ================================== */}

        <div
          className="
            px-6
            pt-6
            pb-5

            border-b
            border-white/10

            flex
            items-start
            justify-between

            shrink-0
          "
        >
          <div
            className="
              overflow-hidden
            "
          >
            <h1
              className="
                text-[31px]

                font-extrabold

                leading-none

                tracking-wide

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
              Smart Campus ERP
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="
              md:hidden
              mt-1
            "
            aria-label="Close sidebar"
          >
            <X size={26} />
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
            {adminMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                    flex
                    items-center

                    gap-4

                    rounded-2xl

                    px-4
                    py-3.5

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
            ADMIN CARD
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
                {user?.name || "Administrator"}
              </p>

              <p
                className="
                  text-xs
                  text-white/70
                "
              >
                System Administrator
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

              rounded-2xl

              px-4
              py-3.5

              bg-red-500/20

              hover:bg-red-500

              transition-all
              duration-300

              font-semibold
            "
          >
            <LogOut size={20} />

            <span>Logout</span>
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

          md:ml-[320px]

          h-screen

          min-w-0

          overflow-hidden
        "
      >
        {/* ==================================
            TOP NAVBAR
        ================================== */}

        <header
          className="
            bg-white/95

            backdrop-blur-md

            border-b
            border-gray-200

            px-4
            md:px-6

            py-4

            flex
            items-center
            justify-between

            shadow-sm

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
              onClick={() => setSidebarOpen(true)}
              className="
                md:hidden

                shrink-0
              "
              aria-label="Open sidebar"
            >
              <Menu size={24} />
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
                Admin ERP Panel
              </h2>

              <p
                className="
                  text-gray-500

                  text-xs
                  sm:text-sm

                  hidden
                  sm:block
                "
              >
                Amity University Gwalior
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
              md:gap-6
            "
          >
            {/* ================================
                NOTIFICATION BELL
            ================================ */}

            <NotificationBell />

            {/* ================================
                USER
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

                    text-[#001B54]

                    truncate

                    max-w-[180px]
                  "
                >
                  {user?.name || "Administrator"}
                </p>

                <p
                  className="
                    text-xs
                    text-gray-500
                  "
                >
                  ADMIN
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

export default AdminLayout;

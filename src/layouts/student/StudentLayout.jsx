import { useState, useEffect } from "react";

import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  ClipboardList,
  Bell,
  LogOut,
  Menu,
  X,
  User,
  ShieldCheck,
  BellRing,
  UtensilsCrossed,
} from "lucide-react";

// ==========================================
// REALTIME NOTIFICATION BELL
// ==========================================

import NotificationBell from "../../modules/notifications/components/NotificationBell";

// ==========================================
// GET USER
// ==========================================

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
};

const StudentLayout = () => {
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [user, setUser] = useState(getStoredUser());

  // ==========================================
  // REFRESH USER
  // ==========================================

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    setUser(storedUser);
  }, []);

  // ==========================================
  // STUDENT MENU
  // ==========================================

  const studentMenu = [
    {
      name: "Dashboard",

      path: "/dashboard",

      icon: LayoutDashboard,
    },

    {
      name: "Create Complaint",

      path: "/create-complaint",

      icon: ClipboardList,
    },

    {
      name: "My Complaints",

      path: "/complaints",

      icon: ClipboardList,
    },

    // ==========================================
    // HOSTELLER ONLY
    // ==========================================

    ...(user?.hostel
      ? [
          {
            name: "Hostel Details",

            path: "/hostel-details",

            icon: ClipboardList,
          },

          {
            name: "Profile",

            path: "/profile",

            icon: User,
          },

          {
            name: "Hostel Notices",

            path: "/student/notices",

            icon: BellRing,
          },
          {
            name: "Mess Complaints",
            path: "/student/mess-complaints",
            icon: UtensilsCrossed,
          },
        ]
      : []),

    {
      name: "Notifications",

      path: "/notifications",

      icon: Bell,
    },

    {
      name: "Change Password",

      path: "/change-password",

      icon: ShieldCheck,
    },
  ];

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/", {
      replace: true,
    });
  };

  return (
    <div className="flex min-h-screen bg-[#eef2ff]">
      {/* ========================================== */}
      {/* MOBILE OVERLAY */}
      {/* ========================================== */}

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

      {/* ========================================== */}
      {/* SIDEBAR */}
      {/* ========================================== */}

      <aside
        className={`

          fixed
          top-0
          left-0
          z-50

          h-screen
          w-72

          overflow-y-auto

          bg-gradient-to-b
          from-[#0f172a]
          via-[#14213d]
          to-[#1e293b]

          text-white

          border-r
          border-white/10

          shadow-2xl

          transform
          transition-transform
          duration-300

          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }

        `}
      >
        {/* ========================================== */}
        {/* LOGO */}
        {/* ========================================== */}

        <div
          className="
            px-6
            py-7

            border-b
            border-white/10
          "
        >
          <h1
            className="
              text-3xl
              font-extrabold
              tracking-wide
            "
          >
            CAMPUSPULSE
          </h1>

          <p
            className="
              text-sm
              text-gray-300
              mt-1
            "
          >
            Smart Student ERP
          </p>
        </div>

        {/* ========================================== */}
        {/* CLOSE BUTTON */}
        {/* ========================================== */}

        <button
          onClick={() => setSidebarOpen(false)}
          className="
            absolute
            top-6
            right-5
            md:hidden
          "
        >
          <X size={24} />
        </button>

        {/* ========================================== */}
        {/* NAVIGATION */}
        {/* ========================================== */}

        <nav
          className="
            px-4
            py-6
            space-y-2
          "
        >
          {studentMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `

                    flex
                    items-center
                    gap-3

                    px-5
                    py-3

                    rounded-2xl

                    transition-all
                    duration-300

                    font-medium

                    hover:bg-white/10
                    hover:translate-x-1

                    ${
                      isActive
                        ? `
                          bg-gradient-to-r
                          from-[#2563eb]
                          to-[#3b82f6]

                          text-white

                          shadow-lg
                        `
                        : `
                          text-gray-300
                        `
                    }

                  `}
            >
              <item.icon size={20} />

              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* ========================================== */}
        {/* LOGOUT */}
        {/* ========================================== */}

        <div
          className="
            absolute
            bottom-5
            left-4
            right-4
          "
        >
          <button
            onClick={handleLogout}
            className="

              w-full

              flex
              items-center
              justify-center
              gap-3

              py-3

              rounded-2xl

              bg-gradient-to-r
              from-red-500
              to-red-600

              hover:from-red-600
              hover:to-red-700

              transition-all
              duration-300

              shadow-lg

            "
          >
            <LogOut size={18} />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN */}
      {/* ========================================== */}

      <div className="flex-1 flex flex-col md:ml-72">
        {/* ========================================== */}
        {/* NAVBAR */}
        {/* ========================================== */}

        <header
          className="

            bg-white/90
            backdrop-blur-md

            border-b
            border-gray-200

            px-4
            md:px-6

            py-4

            flex
            items-center
            justify-between

            sticky
            top-0
            z-30

          "
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="
                md:hidden
              "
            >
              <Menu size={24} />
            </button>

            <h2
              className="
                font-bold
                text-xl
                text-[#0f172a]
              "
            >
              Student Portal
            </h2>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-5">
            {/* ========================================== */}
            {/* REALTIME NOTIFICATION */}
            {/* ========================================== */}

            <NotificationBell />

            {/* ========================================== */}
            {/* USER */}
            {/* ========================================== */}

            <div className="flex items-center gap-3">
              <div
                className="
                  bg-[#dbeafe]
                  rounded-full
                  p-2
                "
              >
                <User
                  size={18}
                  className="
                    text-[#2563eb]
                  "
                />
              </div>

              <div className="hidden md:block">
                <p className="font-semibold">{user?.name || "Student"}</p>

                <p className="text-xs text-gray-500">STUDENT</p>
              </div>
            </div>
          </div>
        </header>

        {/* ========================================== */}
        {/* PAGE */}
        {/* ========================================== */}

        <main
          className="
            flex-1
            p-4
            md:p-6
            overflow-auto
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;

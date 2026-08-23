import { useState } from "react";

import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  PlusSquare,
  AlertTriangle,
  ClipboardList,
  Wrench,
  LogOut,
  Menu,
  X,
  User,
  Boxes,
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
// STORE MANAGER LAYOUT
// ==========================================

const StoreManagerLayout = () => {
  const navigate = useNavigate();

  // ========================================
  // STATE
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ========================================
  // USER
  // ========================================

  const user = getStoredUser();

  // ========================================
  // MENU ITEMS
  // ========================================

  const menuItems = [
    {
      name: "Dashboard",

      path: "/store/dashboard",

      icon: LayoutDashboard,
    },

    {
      name: "Inventory",

      path: "/store/inventory",

      icon: Package,
    },

    {
      name: "Add Inventory",

      path: "/store/add-item",

      icon: PlusSquare,
    },

    {
      name: "Low Stock Alerts",

      path: "/store/low-stock",

      icon: AlertTriangle,
    },

    {
      name: "Requests",

      path: "/store/requests",

      icon: ClipboardList,
    },

    {
      name: "Issued Items",

      path: "/store/issued-items",

      icon: Boxes,
    },

    {
      name: "Damaged Items",

      path: "/store/damaged-items",

      icon: Wrench,
    },
  ];

  // ========================================
  // USER INITIAL
  // ========================================

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "S";

  // ========================================
  // LOGOUT
  // ========================================

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
        min-h-screen
        bg-[#EEF3FF]
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
          w-80

          bg-gradient-to-b
          from-[#001B54]
          via-[#002B7F]
          to-[#7A0019]

          text-white

          shadow-2xl

          transform

          transition-transform
          duration-300

          flex
          flex-col

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
            px-7
            pt-7
            pb-5

            border-b
            border-white/10
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
            "
          >
            <div>
              <h1
                className="
                  text-[30px]

                  font-extrabold

                  tracking-wide
                  leading-tight
                "
              >
                CAMPUSPULSE
              </h1>

              <p
                className="
                  text-yellow-300

                  text-sm

                  mt-1
                "
              >
                Store Manager Panel
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="
                md:hidden
              "
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* ==================================
            MENU
        ================================== */}

        <div
          className="
            flex-1

            overflow-y-auto

            px-5
            py-5

            space-y-2
          "
        >
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                  flex
                  items-center

                  gap-4

                  px-5
                  py-4

                  rounded-2xl

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
                size={22}
                className="
                    shrink-0
                  "
              />

              <span
                className="
                    text-[15px]
                  "
              >
                {item.name}
              </span>
            </NavLink>
          ))}
        </div>

        {/* ==================================
            USER CARD
        ================================== */}

        <div
          className="
            px-5
            pt-4
          "
        >
          <div
            className="
              bg-white/10

              border
              border-white/10

              rounded-3xl

              p-4

              flex
              items-center

              gap-4
            "
          >
            <div
              className="
                h-14
                w-14

                rounded-full

                bg-white/20

                flex
                items-center
                justify-center

                text-xl
                font-bold

                shrink-0
              "
            >
              {userInitial}
            </div>

            <div
              className="
                flex-1
                min-w-0
              "
            >
              <h3
                className="
                  font-bold
                  text-lg

                  truncate
                "
              >
                {user?.name || "Store Manager"}
              </h3>

              <p
                className="
                  text-sm
                  text-gray-300
                "
              >
                Inventory Management
              </p>
            </div>
          </div>
        </div>

        {/* ==================================
            LOGOUT
        ================================== */}

        <div
          className="
            p-5
          "
        >
          <button
            type="button"
            onClick={handleLogout}
            className="
              w-full

              bg-red-500

              hover:bg-red-600

              transition-all
              duration-300

              rounded-2xl

              px-5
              py-4

              flex
              items-center
              justify-center

              gap-3

              font-semibold

              shadow-lg
            "
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* ======================================
          MAIN
      ====================================== */}

      <div
        className="
          flex-1

          flex
          flex-col

          md:ml-80

          min-w-0
        "
      >
        {/* ==================================
            TOPBAR
        ================================== */}

        <header
          className="
            sticky
            top-0

            z-30

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
              <Menu size={26} />
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
                Store Manager
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
                Inventory & Store Management
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
                  bg-[#001B54]

                  text-white

                  h-11
                  w-11

                  rounded-full

                  flex
                  items-center
                  justify-center
                "
              >
                <User size={18} />
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
                  {user?.name || "Store Manager"}
                </p>

                <p
                  className="
                    text-xs
                    text-gray-500
                  "
                >
                  Inventory Department
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

export default StoreManagerLayout;

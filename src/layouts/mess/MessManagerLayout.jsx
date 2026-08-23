import { useState } from "react";

import {
  LayoutDashboard,
  UtensilsCrossed,
  BarChart3,
  ClipboardList,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

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
// MESS MANAGER LAYOUT
// ==========================================

const MessManagerLayout = () => {
  const location = useLocation();

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
  // MENU
  // ========================================

  const menuItems = [
    {
      title: "Dashboard",

      icon: LayoutDashboard,

      path: "/mess/dashboard",
    },

    {
      title: "Mess Complaints",

      icon: ClipboardList,

      path: "/mess/complaints",
    },

    {
      title: "Menu Management",

      icon: UtensilsCrossed,

      path: "/mess/menu",
    },

    {
      title: "Analytics",

      icon: BarChart3,

      path: "/mess/analytics",
    },
  ];

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  // ========================================
  // USER INITIAL
  // ========================================

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "M";

  return (
    <div
      className="
        min-h-screen

        bg-gradient-to-br
        from-[#eef2ff]
        via-[#fdfbff]
        to-[#ffeef5]

        flex
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

            lg:hidden
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
          w-[290px]

          bg-white/90

          backdrop-blur-2xl

          border-r
          border-gray-200

          shadow-[0_10px_50px_rgba(0,0,0,0.08)]

          transition-transform
          duration-300

          flex
          flex-col

          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}

          lg:translate-x-0
        `}
      >
        {/* ==================================
            LOGO
        ================================== */}

        <div
          className="
            p-7

            border-b
            border-gray-100
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div>
              <h1
                className="
                  text-3xl

                  font-black

                  bg-gradient-to-r
                  from-[#7A0019]
                  to-[#c2185b]

                  bg-clip-text
                  text-transparent
                "
              >
                CAMPUSPULSE
              </h1>

              <p
                className="
                  text-gray-500
                  mt-1
                "
              >
                Mess Manager ERP
              </p>
            </div>

            <button
              type="button"
              className="
                lg:hidden

                h-9
                w-9

                rounded-full

                flex
                items-center
                justify-center

                hover:bg-gray-100

                transition
              "
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* ==================================
            MENU
        ================================== */}

        <div
          className="
            flex-1

            px-4
            py-6

            space-y-3

            overflow-y-auto
          "
        >
          {menuItems.map((item) => {
            const Icon = item.icon;

            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                    flex
                    items-center

                    gap-4

                    px-5
                    py-4

                    rounded-2xl

                    transition-all
                    duration-300

                    ${
                      active
                        ? `
                          bg-gradient-to-r
                          from-[#7A0019]
                          to-[#b00035]

                          text-white

                          shadow-[0_10px_30px_rgba(122,0,25,0.25)]
                        `
                        : `
                          text-gray-700

                          hover:bg-white
                          hover:shadow-lg
                        `
                    }
                  `}
              >
                <Icon
                  size={22}
                  className="
                      shrink-0
                    "
                />

                <span
                  className="
                      font-semibold
                      text-[16px]
                    "
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>

        {/* ==================================
            USER CARD
        ================================== */}

        <div
          className="
            px-5
            pb-4
          "
        >
          <div
            className="
              p-4

              rounded-2xl

              bg-[#7A0019]/5

              border
              border-[#7A0019]/10

              flex
              items-center

              gap-3
            "
          >
            <div
              className="
                h-12
                w-12

                rounded-2xl

                bg-gradient-to-r
                from-[#7A0019]
                to-[#c2185b]

                text-white

                flex
                items-center
                justify-center

                font-bold
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

                  text-gray-800

                  truncate
                "
              >
                {user?.name || "Mess Manager"}
              </p>

              <p
                className="
                  text-xs
                  text-gray-500
                "
              >
                Food Operations
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

            border-t
            border-gray-100
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

              bg-red-500

              text-white

              py-4

              font-bold

              hover:bg-red-600

              transition-all

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

          min-w-0

          lg:ml-[290px]
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

            bg-white/90

            backdrop-blur-xl

            border-b
            border-gray-200

            px-4
            md:px-8

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
              className="
                lg:hidden

                h-10
                w-10

                flex
                items-center
                justify-center

                rounded-xl

                bg-white

                border
                border-gray-200

                shadow-sm
              "
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={22} />
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

                  font-black

                  text-gray-800

                  truncate
                "
              >
                Mess Manager
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
                Smart Campus ERP
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
                  h-11
                  w-11

                  rounded-2xl

                  bg-gradient-to-r
                  from-[#7A0019]
                  to-[#c2185b]

                  text-white

                  flex
                  items-center
                  justify-center

                  shadow-md
                "
              >
                <User size={19} />
              </div>

              <div
                className="
                  min-w-0
                "
              >
                <h3
                  className="
                    font-bold

                    text-gray-800

                    truncate

                    max-w-[170px]
                  "
                >
                  {user?.name || "Mess Manager"}
                </h3>

                <p
                  className="
                    text-xs
                    text-gray-500
                  "
                >
                  Food Operations
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
            p-4
            md:p-8
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MessManagerLayout;

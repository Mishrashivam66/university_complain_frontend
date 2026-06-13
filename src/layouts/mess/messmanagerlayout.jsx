import { useState } from "react";

import {
  LayoutDashboard,
  UtensilsCrossed,
  BarChart3,
  ClipboardList,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import { Link, Outlet, useLocation } from "react-router-dom";

// ==========================================
// REALTIME NOTIFICATION BELL
// ==========================================

import NotificationBell from "../../modules/notifications/components/NotificationBell";

const MessManagerLayout = () => {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ==========================================
  // MENU
  // ==========================================

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

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "/login";
  };

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

            lg:hidden
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
          w-[290px]

          bg-white/80

          backdrop-blur-2xl

          border-r
          border-white/30

          shadow-[0_10px_50px_rgba(0,0,0,0.08)]

          transition-all
          duration-300

          flex
          flex-col

          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}

          lg:translate-x-0
        `}
      >
        {/* ========================================== */}
        {/* LOGO */}
        {/* ========================================== */}

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
                Mess Panel
              </h1>

              <p
                className="
                  text-gray-500

                  mt-1
                "
              >
                Smart Campus ERP
              </p>
            </div>

            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X />
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* MENU */}
        {/* ========================================== */}

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

                    group

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
                <Icon size={22} />

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

        {/* ========================================== */}
        {/* FOOTER */}
        {/* ========================================== */}

        <div
          className="
            p-5

            border-t
            border-gray-100
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

              rounded-2xl

              bg-red-500

              text-white

              py-4

              font-bold

              hover:bg-red-600

              transition-all
            "
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN */}
      {/* ========================================== */}

      <div
        className="
          flex-1

          lg:ml-[290px]
        "
      >
        {/* ========================================== */}
        {/* TOPBAR */}
        {/* ========================================== */}

        <header
          className="
            sticky
            top-0

            z-30

            bg-white/70

            backdrop-blur-xl

            border-b
            border-white/20

            px-4
            md:px-8

            py-5

            flex
            items-center
            justify-between
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <button
              className="
                lg:hidden

                p-2

                rounded-xl

                bg-white

                shadow
              "
              onClick={() => setSidebarOpen(true)}
            >
              <Menu />
            </button>

            <div>
              <h2
                className="
                  text-2xl
                  font-black

                  text-gray-800
                "
              >
                Mess Manager
              </h2>

              <p
                className="
                  text-gray-500
                "
              >
                Smart Campus ERP
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div
            className="
              flex
              items-center
              gap-5
            "
          >
            {/* ========================================== */}
            {/* REALTIME NOTIFICATION */}
            {/* ========================================== */}

            <NotificationBell />

            {/* ========================================== */}
            {/* USER */}
            {/* ========================================== */}

            <div
              className="
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

                  shadow-lg
                "
              >
                M
              </div>

              <div className="hidden md:block">
                <h3
                  className="
                    font-bold
                    text-gray-800
                  "
                >
                  Mess Manager
                </h3>

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Food Operations
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ========================================== */}
        {/* PAGE CONTENT */}
        {/* ========================================== */}

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MessManagerLayout;

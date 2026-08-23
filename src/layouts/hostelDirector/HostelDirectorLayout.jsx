import { Outlet, useNavigate } from "react-router-dom";

import { LogOut } from "lucide-react";

import HostelDirectorSidebar from "./HostelDirectorSidebar";

// ==========================================
// COMMON NOTIFICATION BELL
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
// HOSTEL DIRECTOR LAYOUT
// ==========================================

const HostelDirectorLayout = () => {
  const navigate = useNavigate();

  // ======================================
  // USER
  // ======================================

  const user = getStoredUser();

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "H";

  // ======================================
  // LOGOUT
  // ======================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div
      className="
        min-h-screen
        bg-[#F1F5FF]
      "
    >
      {/* ======================================
          SIDEBAR
      ====================================== */}

      <HostelDirectorSidebar onLogout={handleLogout} />

      {/* ======================================
          MAIN AREA
      ====================================== */}

      <div
        className="
          min-h-screen

          md:ml-[280px]
        "
      >
        {/* ==================================
            TOPBAR
        ================================== */}

        <header
          className="
            sticky
            top-0

            z-40

            flex
            h-[76px]

            items-center
            justify-between

            border-b
            border-gray-200

            bg-white/95

            px-4

            shadow-sm

            backdrop-blur

            sm:px-6
            lg:px-8
          "
        >
          {/* ================================
              LEFT
          ================================ */}

          <div
            className="
              min-w-0
            "
          >
            <h1
              className="
                text-lg

                font-extrabold

                text-[#001B54]

                sm:text-xl
                md:text-2xl

                truncate
              "
            >
              Hostel Director Panel
            </h1>

            <p
              className="
                hidden

                text-xs

                text-gray-500

                sm:block
              "
            >
              Smart Campus ERP System
            </p>
          </div>

          {/* ================================
              RIGHT
          ================================ */}

          <div
            className="
              flex
              items-center

              gap-3
            "
          >
            {/* ==============================
                COMMON NOTIFICATION BELL
            ============================== */}

            <NotificationBell />

            {/* ==============================
                USER
            ============================== */}

            <div
              className="
                flex
                items-center

                gap-3
              "
            >
              <div
                className="
                  flex

                  h-11
                  w-11

                  items-center
                  justify-center

                  rounded-full

                  bg-[#001B54]

                  font-black

                  text-white

                  shrink-0
                "
              >
                {userInitial}
              </div>

              <div
                className="
                  hidden
                  md:block

                  min-w-0
                "
              >
                <p
                  className="
                    text-sm

                    font-extrabold

                    text-[#001B54]

                    truncate

                    max-w-[180px]
                  "
                >
                  {user?.name || "Hostel Director"}
                </p>

                <p
                  className="
                    text-xs
                    text-gray-500
                  "
                >
                  Hostel Administration
                </p>
              </div>

              {/* ============================
                  LOGOUT
              ============================ */}

              <button
                type="button"
                onClick={handleLogout}
                className="
                  hidden

                  items-center

                  gap-2

                  rounded-xl

                  bg-red-50

                  px-3
                  py-2

                  text-sm

                  font-bold

                  text-red-700

                  transition

                  hover:bg-red-100

                  lg:flex
                "
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* ==================================
            PAGE CONTENT
        ================================== */}

        <main
          className="
            p-4

            sm:p-6
            lg:p-8
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HostelDirectorLayout;

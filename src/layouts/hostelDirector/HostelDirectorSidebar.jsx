import {
  LayoutDashboard,
  Building2,
  Users,
  UserPlus,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { NavLink } from "react-router-dom";

// ==========================================
// MENU
// ==========================================

const menuItems = [
  {
    name: "Dashboard",
    path: "/hostel-director/dashboard",
    icon: LayoutDashboard,
  },

  {
    name: "Hostel Overview",
    path: "/hostel-director/overview",
    icon: Building2,
  },

  {
    name: "Wardens",
    path: "/hostel-director/wardens",
    icon: Users,
  },

  {
    name: "Create Warden",
    path: "/hostel-director/create-warden",
    icon: UserPlus,
  },
];
const HostelDirectorSidebar = ({ onLogout }) => {
  return (
    <aside
      className="
        fixed
        left-0
        top-0
        z-50

        hidden
        h-screen
        w-[280px]

        flex-col

        bg-gradient-to-b
        from-[#001B54]
        via-[#05256B]
        to-[#7A0019]

        text-white

        shadow-2xl

        md:flex
      "
    >
      {/* ======================================
          BRAND
      ====================================== */}

      <div
        className="
          border-b
          border-white/10

          px-6
          py-5
        "
      >
        <h1
          className="
            text-3xl
            font-black
            tracking-tight
          "
        >
          CAMPUSPULSE
        </h1>

        <p
          className="
            mt-1
            text-xs
            font-bold
            text-yellow-300
          "
        >
          HOSTEL DIRECTOR ERP
        </p>
      </div>

      {/* ======================================
          DIRECTOR LABEL
      ====================================== */}

      <div
        className="
          mx-4
          mt-5

          rounded-2xl

          border
          border-white/10

          bg-white/10

          p-4
        "
      >
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
              h-10
              w-10
              items-center
              justify-center

              rounded-xl

              bg-white/15
            "
          >
            <ShieldCheck size={21} />
          </div>

          <div>
            <p
              className="
                text-sm
                font-extrabold
              "
            >
              Hostel Director
            </p>

            <p
              className="
                text-xs
                text-blue-200
              "
            >
              All Hostel Access
            </p>
          </div>
        </div>
      </div>

      {/* ======================================
          MENU
      ====================================== */}

      <nav
        className="
          mt-5
          flex-1

          space-y-2

          overflow-y-auto

          px-4
          pb-5
        "
      >
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex
                items-center
                gap-4

                rounded-2xl

                px-4
                py-3.5

                text-sm
                font-bold

                transition-all

                ${
                  isActive
                    ? `
                      bg-yellow-400
                      text-[#001B54]
                      shadow-lg
                    `
                    : `
                      text-white
                      hover:bg-white/10
                    `
                }
              `}
            >
              <Icon size={20} />

              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* ======================================
          LOGOUT
      ====================================== */}

      <div
        className="
          border-t
          border-white/10

          p-4
        "
      >
        <button
          type="button"
          onClick={onLogout}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-3

            rounded-2xl

            bg-red-600/40

            px-4
            py-3.5

            font-extrabold

            transition

            hover:bg-red-600/60
          "
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default HostelDirectorSidebar;

import { useState } from "react";

import { Bell } from "lucide-react";

import NotificationDropdown from "./NotificationDropdown";

import { useNotifications } from "../context/NotificationContext";

const NotificationBell = () => {
  // ==========================================
  // STATE
  // ==========================================

  const [open, setOpen] = useState(false);

  // ==========================================
  // CONTEXT
  // ==========================================

  const { unreadCount } = useNotifications();

  // ==========================================
  // TOGGLE DROPDOWN
  // ==========================================

  const toggleDropdown = () => {
    setOpen(!open);
  };

  return (
    <div className="relative">
      {/* ========================================== */}
      {/* BELL BUTTON */}
      {/* ========================================== */}

      <button
        onClick={toggleDropdown}
        className="
          relative
          flex
          items-center
          justify-center
          w-11
          h-11
          rounded-full
          bg-white/10
          backdrop-blur-md
          border
          border-white/10
          hover:bg-white/20
          transition-all
          duration-300
          shadow-lg
        "
      >
        {/* ========================================== */}
        {/* BELL ICON */}
        {/* ========================================== */}

        <Bell
          size={22}
          className="
            text-gray-700
            dark:text-white
          "
        />

        {/* ========================================== */}
        {/* UNREAD BADGE */}
        {/* ========================================== */}

        {unreadCount > 0 && (
          <span
            className="
              absolute
              -top-1
              -right-1
              min-w-[20px]
              h-5
              px-1
              flex
              items-center
              justify-center
              rounded-full
              bg-red-500
              text-white
              text-[11px]
              font-bold
              shadow-md
              animate-pulse
            "
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ========================================== */}
      {/* DROPDOWN */}
      {/* ========================================== */}

      {open && <NotificationDropdown closeDropdown={() => setOpen(false)} />}
    </div>
  );
};

export default NotificationBell;

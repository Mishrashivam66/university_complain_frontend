import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { Bell } from "lucide-react";

import NotificationDropdown from "./NotificationDropdown";

import { useNotifications } from "../context/NotificationContext";

const NotificationBell = () => {
  // ==========================================
  // STATE
  // ==========================================

  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0 });

  const bellRef = useRef(null);
  const dropdownRef = useRef(null);

  // ==========================================
  // CONTEXT
  // ==========================================

  const { unreadCount } = useNotifications();

  // ==========================================
  // DROPDOWN POSITION
  // ==========================================

  useEffect(() => {
    if (!open || !bellRef.current) return;

    const updatePosition = () => {
      const rect = bellRef.current.getBoundingClientRect();

      setDropdownStyle({
        top: rect.bottom + 10 + window.scrollY,
        left: Math.max(rect.right - 380, 16) + window.scrollX,
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const handleClickOutside = (event) => {
      if (
        bellRef.current &&
        !bellRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  // ==========================================
  // TOGGLE DROPDOWN
  // ==========================================

  const toggleDropdown = () => {
    setOpen((value) => !value);
  };

  return (
    <div className="relative" ref={bellRef}>
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

      {open &&
        createPortal(
          <div ref={dropdownRef}>
            <NotificationDropdown
              closeDropdown={() => setOpen(false)}
              style={dropdownStyle}
            />
          </div>,
          document.body,
        )}
    </div>
  );
};

export default NotificationBell;

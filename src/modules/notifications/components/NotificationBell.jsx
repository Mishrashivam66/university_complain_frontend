import { useState, useEffect, useRef } from "react";

import { createPortal } from "react-dom";

import { Bell } from "lucide-react";

import NotificationDropdown from "./NotificationDropdown";

import { useNotifications } from "../context/NotificationContext";

// ==========================================
// NOTIFICATION BELL
// ==========================================

const NotificationBell = () => {
  // ==========================================
  // STATE
  // ==========================================

  const [open, setOpen] = useState(false);

  const [dropdownStyle, setDropdownStyle] = useState({
    top: 0,
    left: 0,
  });

  // ==========================================
  // REFS
  // ==========================================

  const bellRef = useRef(null);

  const dropdownRef = useRef(null);

  // ==========================================
  // CONTEXT
  // ==========================================

  const {
    unreadCount,

    fetchNotifications,

    fetchUnreadCount,
  } = useNotifications();

  // ==========================================
  // PERIODIC UNREAD COUNT REFRESH
  //
  // Socket.IO removed hai,
  // isliye lightweight REST polling
  // ==========================================

  useEffect(() => {
    // Initial refresh

    fetchUnreadCount();

    // Every 30 seconds

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ==========================================
  // DROPDOWN POSITION
  // ==========================================

  useEffect(() => {
    if (!open || !bellRef.current) {
      return;
    }

    const updatePosition = () => {
      const rect = bellRef.current.getBoundingClientRect();

      // ======================================
      // DESKTOP DROPDOWN WIDTH
      // ======================================

      const dropdownWidth = Math.min(380, window.innerWidth - 32);

      // ======================================
      // LEFT POSITION
      // ======================================

      let left = rect.right - dropdownWidth;

      // Minimum left margin

      left = Math.max(left, 16);

      // Prevent right overflow

      left = Math.min(left, window.innerWidth - dropdownWidth - 16);

      setDropdownStyle({
        top: rect.bottom + 10,

        left,

        width: dropdownWidth,
      });
    };

    // ======================================
    // INITIAL POSITION
    // ======================================

    updatePosition();

    // ======================================
    // EVENTS
    // ======================================

    window.addEventListener("resize", updatePosition);

    window.addEventListener("scroll", updatePosition, true);

    // ======================================
    // CLICK OUTSIDE
    // ======================================

    const handleClickOutside = (event) => {
      const clickedBell = bellRef.current?.contains(event.target);

      const clickedDropdown = dropdownRef.current?.contains(event.target);

      if (!clickedBell && !clickedDropdown) {
        setOpen(false);
      }
    };

    // ======================================
    // ESC KEY
    // ======================================

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    document.addEventListener("keydown", handleEsc);

    // ======================================
    // CLEANUP
    // ======================================

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

  const toggleDropdown = async () => {
    const nextOpen = !open;

    setOpen(nextOpen);

    // ======================================
    // FRESH DATA WHEN BELL OPENS
    // ======================================

    if (nextOpen) {
      await fetchNotifications();
    }
  };

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <div className="relative" ref={bellRef}>
      {/* ======================================
          BELL BUTTON
      ====================================== */}

      <button
        type="button"
        onClick={toggleDropdown}
        aria-label="Notifications"
        aria-expanded={open}
        className="
          relative

          flex
          items-center
          justify-center

          w-11
          h-11

          rounded-full

          bg-white

          border
          border-slate-200

          hover:bg-slate-50
          hover:border-slate-300

          transition-all
          duration-300

          shadow-md
        "
      >
        {/* ==================================
            BELL ICON
        ================================== */}

        <Bell
          size={22}
          className="
            text-[#082B66]
          "
        />

        {/* ==================================
            UNREAD BADGE
        ================================== */}

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

              ring-2
              ring-white
            "
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ======================================
          DROPDOWN
      ====================================== */}

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

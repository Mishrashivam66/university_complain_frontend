import { Trash2, CheckCheck, BellRing } from "lucide-react";

import NotificationCard from "./NotificationCard";

import { useNotifications } from "../context/NotificationContext";

const NotificationDropdown = ({ closeDropdown }) => {
  // ==========================================
  // CONTEXT
  // ==========================================

  const {
    notifications,

    unreadCount,

    handleMarkAllAsRead,

    handleClearAll,
  } = useNotifications();

  return (
    <div
      className="
        absolute
        right-0
        mt-3
        w-[380px]
        max-w-[95vw]
        bg-white
        dark:bg-[#111827]
        border
        border-gray-200
        dark:border-gray-800
        rounded-2xl
        shadow-2xl
        overflow-hidden
        z-[999]
        animate-in
        fade-in
        slide-in-from-top-2
        duration-300
      "
    >
      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          px-5
          py-4
          border-b
          border-gray-200
          dark:border-gray-800
          bg-gradient-to-r
          from-blue-600
          to-indigo-600
        "
      >
        <div>
          <h2
            className="
              text-white
              text-lg
              font-bold
            "
          >
            Notifications
          </h2>

          <p
            className="
              text-blue-100
              text-sm
            "
          >
            {unreadCount} unread notifications
          </p>
        </div>

        <button
          onClick={closeDropdown}
          className="
            text-white
            text-xl
            hover:scale-110
            transition
          "
        >
          ×
        </button>
      </div>

      {/* ========================================== */}
      {/* ACTION BUTTONS */}
      {/* ========================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-2
          px-4
          py-3
          border-b
          border-gray-200
          dark:border-gray-800
          bg-gray-50
          dark:bg-[#1F2937]
        "
      >
        <button
          onClick={handleMarkAllAsRead}
          className="
            flex
            items-center
            gap-2
            px-3
            py-2
            rounded-lg
            bg-blue-600
            hover:bg-blue-700
            text-white
            text-sm
            font-medium
            transition
          "
        >
          <CheckCheck size={16} />
          Mark All Read
        </button>

        <button
          onClick={handleClearAll}
          className="
            flex
            items-center
            gap-2
            px-3
            py-2
            rounded-lg
            bg-red-500
            hover:bg-red-600
            text-white
            text-sm
            font-medium
            transition
          "
        >
          <Trash2 size={16} />
          Clear All
        </button>
      </div>

      {/* ========================================== */}
      {/* NOTIFICATION LIST */}
      {/* ========================================== */}

      <div
        className="
          max-h-[500px]
          overflow-y-auto
          custom-scrollbar
        "
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
            />
          ))
        ) : (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              py-14
              text-center
            "
          >
            <div
              className="
                w-16
                h-16
                rounded-full
                bg-blue-100
                dark:bg-blue-900/30
                flex
                items-center
                justify-center
                mb-4
              "
            >
              <BellRing
                size={28}
                className="
                  text-blue-600
                "
              />
            </div>

            <h3
              className="
                text-lg
                font-semibold
                text-gray-700
                dark:text-white
              "
            >
              No Notifications
            </h3>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              You're all caught up 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;

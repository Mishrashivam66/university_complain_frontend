import { Trash2, CheckCheck, BellRing, X } from "lucide-react";

import NotificationCard from "./NotificationCard";

import { useNotifications } from "../context/NotificationContext";

// ==========================================
// NOTIFICATION DROPDOWN
// ==========================================

const NotificationDropdown = ({ closeDropdown, style }) => {
  // ==========================================
  // CONTEXT
  // ==========================================

  const {
    notifications,

    unreadCount,

    loading,

    handleMarkAllAsRead,

    handleClearAll,
  } = useNotifications();

  // ==========================================
  // MARK ALL READ
  // ==========================================

  const handleReadAll = async () => {
    if (unreadCount === 0) {
      return;
    }

    await handleMarkAllAsRead();
  };

  // ==========================================
  // CLEAR ALL
  // ==========================================

  const handleClear = async () => {
    if (notifications.length === 0) {
      return;
    }

    await handleClearAll();
  };

  return (
    <div
      style={{
        position: "fixed",

        top: style?.top ?? 80,

        left: style?.left ?? "auto",

        right: style?.left !== undefined ? "auto" : 16,

        width: style?.width || 380,

        zIndex: 9999,
      }}
      className="
        max-w-[calc(100vw-32px)]

        bg-white

        border
        border-slate-200

        rounded-2xl

        shadow-[0_20px_60px_rgba(15,23,42,0.18)]

        overflow-hidden
      "
    >
      {/* ======================================
          HEADER
      ====================================== */}

      <div
        className="
          flex
          items-center
          justify-between

          px-5
          py-4

          bg-gradient-to-r
          from-[#082B66]
          via-[#0B3D91]
          to-[#70193D]
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <BellRing size={19} className="text-white" />

            <h2
              className="
                text-white
                text-lg
                font-bold
              "
            >
              Notifications
            </h2>
          </div>

          <p
            className="
              mt-1

              text-white/80
              text-xs
              sm:text-sm
            "
          >
            {unreadCount === 0
              ? "You're all caught up"
              : `${unreadCount} unread notification${
                  unreadCount !== 1 ? "s" : ""
                }`}
          </p>
        </div>

        <button
          type="button"
          onClick={closeDropdown}
          aria-label="Close notifications"
          className="
            flex
            items-center
            justify-center

            w-9
            h-9

            rounded-full

            bg-white/10

            text-white

            hover:bg-white/20

            transition
          "
        >
          <X size={19} />
        </button>
      </div>

      {/* ======================================
          ACTION BUTTONS
      ====================================== */}

      <div
        className="
          flex
          items-center
          justify-between

          gap-2

          px-4
          py-3

          border-b
          border-slate-200

          bg-slate-50
        "
      >
        <button
          type="button"
          onClick={handleReadAll}
          disabled={unreadCount === 0 || loading}
          className="
            flex
            items-center
            justify-center

            gap-2

            px-3
            py-2

            rounded-xl

            bg-[#0B3D91]

            text-white

            text-xs
            sm:text-sm

            font-semibold

            hover:bg-[#082B66]

            disabled:opacity-40
            disabled:cursor-not-allowed

            transition
          "
        >
          <CheckCheck size={16} />

          <span className="hidden xs:inline">Mark All Read</span>

          <span className="xs:hidden">Read All</span>
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={notifications.length === 0 || loading}
          className="
            flex
            items-center
            justify-center

            gap-2

            px-3
            py-2

            rounded-xl

            bg-red-500

            text-white

            text-xs
            sm:text-sm

            font-semibold

            hover:bg-red-600

            disabled:opacity-40
            disabled:cursor-not-allowed

            transition
          "
        >
          <Trash2 size={16} />
          Clear All
        </button>
      </div>

      {/* ======================================
          LOADING
      ====================================== */}

      {loading && notifications.length === 0 ? (
        <div
          className="
            flex
            items-center
            justify-center

            py-14

            bg-white
          "
        >
          <div
            className="
              w-8
              h-8

              rounded-full

              border-4
              border-slate-200
              border-t-[#0B3D91]

              animate-spin
            "
          />
        </div>
      ) : (
        /* ====================================
           NOTIFICATION LIST
        ==================================== */

        <div
          className="
            max-h-[460px]

            overflow-y-auto

            overscroll-contain

            bg-white
          "
        >
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                closeDropdown={closeDropdown}
              />
            ))
          ) : (
            /* =================================
               EMPTY STATE
            ================================= */

            <div
              className="
                flex
                flex-col
                items-center
                justify-center

                px-5
                py-14

                text-center
              "
            >
              <div
                className="
                  w-16
                  h-16

                  rounded-full

                  bg-blue-50

                  flex
                  items-center
                  justify-center

                  mb-4
                "
              >
                <BellRing
                  size={28}
                  className="
                    text-[#0B3D91]
                  "
                />
              </div>

              <h3
                className="
                  text-lg

                  font-bold

                  text-slate-800
                "
              >
                No Notifications
              </h3>

              <p
                className="
                  text-sm

                  text-slate-500

                  mt-1
                "
              >
                You're all caught up 🎉
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================
          FOOTER
      ====================================== */}

      {notifications.length > 0 && (
        <div
          className="
            px-4
            py-2.5

            border-t
            border-slate-200

            bg-slate-50

            text-center
          "
        >
          <p
            className="
              text-[11px]
              sm:text-xs

              text-slate-500
            "
          >
            Notifications are automatically removed after 24 hours.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

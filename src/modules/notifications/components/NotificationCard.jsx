import { Trash2, CheckCircle2, Clock3, AlertTriangle } from "lucide-react";

import { useNotifications } from "../context/NotificationContext";

// ==========================================
// PRIORITY COLORS
// ==========================================

const priorityColors = {
  LOW: `
    border-blue-500
    bg-blue-50
    dark:bg-blue-900/10
  `,

  MEDIUM: `
    border-yellow-500
    bg-yellow-50
    dark:bg-yellow-900/10
  `,

  HIGH: `
    border-orange-500
    bg-orange-50
    dark:bg-orange-900/10
  `,

  CRITICAL: `
    border-red-500
    bg-red-50
    dark:bg-red-900/10
  `,
};

// ==========================================
// COMPONENT
// ==========================================

const NotificationCard = ({ notification }) => {
  // ==========================================
  // CONTEXT
  // ==========================================

  const {
    handleMarkAsRead,

    handleDeleteNotification,
  } = useNotifications();

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div
      className={`
        relative
        px-4
        py-4
        border-l-4
        border-b
        border-gray-100
        dark:border-gray-800
        transition-all
        duration-300
        hover:bg-gray-50
        dark:hover:bg-[#1F2937]
        ${priorityColors[notification.priority] || ""}
        ${!notification.isRead ? "bg-opacity-100" : "opacity-80"}
      `}
    >
      {/* ========================================== */}
      {/* UNREAD DOT */}
      {/* ========================================== */}

      {!notification.isRead && (
        <div
          className="
            absolute
            top-4
            right-4
            w-2.5
            h-2.5
            rounded-full
            bg-blue-500
            animate-pulse
          "
        />
      )}

      {/* ========================================== */}
      {/* TOP SECTION */}
      {/* ========================================== */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        {/* ========================================== */}
        {/* LEFT CONTENT */}
        {/* ========================================== */}

        <div className="flex-1">
          {/* TITLE */}

          <h3
            className="
              text-sm
              font-semibold
              text-gray-800
              dark:text-white
            "
          >
            {notification.title}
          </h3>

          {/* MESSAGE */}

          <p
            className="
              mt-1
              text-sm
              text-gray-600
              dark:text-gray-300
              leading-relaxed
            "
          >
            {notification.message}
          </p>

          {/* META */}

          <div
            className="
              flex
              items-center
              gap-3
              mt-3
              flex-wrap
            "
          >
            {/* TYPE */}

            <span
              className="
                px-2
                py-1
                rounded-full
                text-[11px]
                font-semibold
                bg-gray-200
                dark:bg-gray-700
                text-gray-700
                dark:text-gray-200
              "
            >
              {notification.type}
            </span>

            {/* PRIORITY */}

            <span
              className="
                px-2
                py-1
                rounded-full
                text-[11px]
                font-semibold
                bg-white/70
                dark:bg-black/20
                text-gray-700
                dark:text-gray-200
              "
            >
              {notification.priority}
            </span>

            {/* TIME */}

            <div
              className="
                flex
                items-center
                gap-1
                text-xs
                text-gray-500
              "
            >
              <Clock3 size={13} />

              {formatTime(notification.createdAt)}
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* ACTION BUTTONS */}
        {/* ========================================== */}

        <div
          className="
            flex
            flex-col
            gap-2
          "
        >
          {/* MARK READ */}

          {!notification.isRead && (
            <button
              onClick={() => handleMarkAsRead(notification._id)}
              className="
                w-8
                h-8
                rounded-full
                bg-green-100
                hover:bg-green-200
                dark:bg-green-900/20
                flex
                items-center
                justify-center
                transition
              "
            >
              <CheckCircle2
                size={16}
                className="
                  text-green-600
                "
              />
            </button>
          )}

          {/* DELETE */}

          <button
            onClick={() => handleDeleteNotification(notification._id)}
            className="
              w-8
              h-8
              rounded-full
              bg-red-100
              hover:bg-red-200
              dark:bg-red-900/20
              flex
              items-center
              justify-center
              transition
            "
          >
            <Trash2
              size={16}
              className="
                text-red-600
              "
            />
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* CRITICAL ALERT */}
      {/* ========================================== */}

      {notification.priority === "CRITICAL" && (
        <div
          className="
            flex
            items-center
            gap-2
            mt-3
            text-red-600
            text-xs
            font-semibold
          "
        >
          <AlertTriangle size={14} />
          Immediate Attention Required
        </div>
      )}
    </div>
  );
};

export default NotificationCard;

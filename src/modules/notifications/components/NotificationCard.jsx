import {
  Trash2,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useNotifications } from "../context/NotificationContext";

// ==========================================
// PRIORITY COLORS
// ==========================================

const priorityColors = {
  LOW: `
    border-blue-500
    bg-blue-50
  `,

  MEDIUM: `
    border-yellow-500
    bg-yellow-50
  `,

  HIGH: `
    border-orange-500
    bg-orange-50
  `,

  CRITICAL: `
    border-red-500
    bg-red-50
  `,
};

// ==========================================
// PRIORITY BADGE COLORS
// ==========================================

const priorityBadgeColors = {
  LOW: `
    bg-blue-100
    text-blue-700
  `,

  MEDIUM: `
    bg-yellow-100
    text-yellow-700
  `,

  HIGH: `
    bg-orange-100
    text-orange-700
  `,

  CRITICAL: `
    bg-red-100
    text-red-700
  `,
};

// ==========================================
// COMPONENT
// ==========================================

const NotificationCard = ({ notification, closeDropdown }) => {
  const navigate = useNavigate();

  // ==========================================
  // CONTEXT
  // ==========================================

  const { handleMarkAsRead, handleDeleteNotification } = useNotifications();

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // OPEN NOTIFICATION
  // ==========================================

  const handleOpenNotification = async () => {
    try {
      // ====================================
      // MARK READ
      // ====================================

      if (!notification.isRead) {
        await handleMarkAsRead(notification._id);
      }

      // ====================================
      // CLOSE DROPDOWN
      // ====================================

      if (closeDropdown) {
        closeDropdown();
      }

      // ====================================
      // REDIRECT
      // ====================================

      if (notification.actionUrl && notification.actionUrl !== "#") {
        navigate(notification.actionUrl);
      }
    } catch (error) {
      console.log("OPEN NOTIFICATION ERROR:", error);
    }
  };

  // ==========================================
  // MARK READ BUTTON
  // ==========================================

  const handleReadClick = async (event) => {
    event.stopPropagation();

    await handleMarkAsRead(notification._id);
  };

  // ==========================================
  // DELETE BUTTON
  // ==========================================

  const handleDeleteClick = async (event) => {
    event.stopPropagation();

    await handleDeleteNotification(notification._id);
  };

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpenNotification}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();

          handleOpenNotification();
        }
      }}
      className={`
        relative

        px-4
        py-4

        border-l-4
        border-b
        border-slate-100

        transition-all
        duration-200

        cursor-pointer

        hover:shadow-sm

        ${priorityColors[notification.priority] || priorityColors.LOW}

        ${notification.isRead ? "opacity-75" : "opacity-100"}
      `}
    >
      {/* ======================================
          UNREAD DOT
      ====================================== */}

      {!notification.isRead && (
        <div
          className="
            absolute

            top-4
            right-4

            w-2.5
            h-2.5

            rounded-full

            bg-blue-600

            ring-2
            ring-white
          "
        />
      )}

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <div
        className="
          flex
          items-start
          justify-between

          gap-3
        "
      >
        {/* ==================================
            LEFT CONTENT
        ================================== */}

        <div className="flex-1 min-w-0">
          {/* TITLE */}

          <div
            className="
              flex
              items-center
              gap-2

              pr-5
            "
          >
            <h3
              className={`
                text-sm

                text-slate-900

                ${notification.isRead ? "font-semibold" : "font-bold"}
              `}
            >
              {notification.title}
            </h3>

            {notification.actionUrl && notification.actionUrl !== "#" && (
              <ExternalLink
                size={13}
                className="
                    text-slate-400
                    shrink-0
                  "
              />
            )}
          </div>

          {/* MESSAGE */}

          <p
            className="
              mt-1.5

              text-sm
              text-slate-600

              leading-relaxed

              break-words
            "
          >
            {notification.message}
          </p>

          {/* ==================================
              META
          ================================== */}

          <div
            className="
              flex
              items-center

              gap-2

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

                text-[10px]
                sm:text-[11px]

                font-semibold

                bg-slate-200
                text-slate-700
              "
            >
              {notification.type || "SYSTEM"}
            </span>

            {/* PRIORITY */}

            <span
              className={`
                px-2
                py-1

                rounded-full

                text-[10px]
                sm:text-[11px]

                font-bold

                ${
                  priorityBadgeColors[notification.priority] ||
                  priorityBadgeColors.LOW
                }
              `}
            >
              {notification.priority || "LOW"}
            </span>

            {/* TIME */}

            <div
              className="
                flex
                items-center

                gap-1

                text-[10px]
                sm:text-xs

                text-slate-500
              "
            >
              <Clock3 size={13} />

              <span>{formatTime(notification.createdAt)}</span>
            </div>
          </div>

          {/* ==================================
              SENDER
          ================================== */}

          {notification.sender?.name && (
            <div
              className="
                mt-2

                text-[11px]

                text-slate-500
              "
            >
              From:{" "}
              <span className="font-semibold text-slate-700">
                {notification.sender.name}
              </span>
              {notification.sender?.role && (
                <span> ({notification.sender.role})</span>
              )}
            </div>
          )}
        </div>

        {/* ==================================
            ACTION BUTTONS
        ================================== */}

        <div
          className="
            flex
            flex-col

            gap-2

            shrink-0

            mt-4
          "
        >
          {/* MARK READ */}

          {!notification.isRead && (
            <button
              type="button"
              onClick={handleReadClick}
              title="Mark as read"
              aria-label="Mark notification as read"
              className="
                w-8
                h-8

                rounded-full

                bg-green-100

                hover:bg-green-200

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
            type="button"
            onClick={handleDeleteClick}
            title="Delete notification"
            aria-label="Delete notification"
            className="
              w-8
              h-8

              rounded-full

              bg-red-100

              hover:bg-red-200

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

      {/* ======================================
          CRITICAL ALERT
      ====================================== */}

      {notification.priority === "CRITICAL" && (
        <div
          className="
            flex
            items-center

            gap-2

            mt-3

            px-3
            py-2

            rounded-lg

            bg-red-100

            text-red-700

            text-xs
            font-bold
          "
        >
          <AlertTriangle size={14} />
          Immediate Attention Required
        </div>
      )}

      {/* ======================================
          CLICK HINT
      ====================================== */}

      {notification.actionUrl && notification.actionUrl !== "#" && (
        <div
          className="
              mt-3

              text-[11px]

              font-semibold

              text-[#0B3D91]
            "
        >
          Click to view details →
        </div>
      )}
    </div>
  );
};

export default NotificationCard;

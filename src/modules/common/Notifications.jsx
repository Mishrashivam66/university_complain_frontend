import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import socket from "../../socket";

import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  ShieldAlert,
  Trash2,
  Loader2,
} from "lucide-react";

const Notifications = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "/api/notifications",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setNotifications(response?.data?.notifications || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL FETCH
  // ==========================================

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ==========================================
  // SOCKET REALTIME
  // ==========================================

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    // ======================================
    // JOIN ROOM
    // ======================================

    if (user?._id) {
      socket.emit(
        "joinRoom",

        user._id,
      );

      console.log("Joined Room:", user._id);
    }

    // ======================================
    // RECEIVE NOTIFICATION
    // ======================================

    socket.on(
      "newNotification",

      (data) => {
        console.log("Realtime Notification:", data);

        setNotifications((prev) => [data, ...prev]);

        toast.success(data.title || "New Notification");
      },
    );

    // ======================================
    // CLEANUP
    // ======================================

    return () => {
      socket.off("newNotification");
    };
  }, []);

  // ==========================================
  // MARK AS READ
  // ==========================================

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `/api/notifications/read/${id}`,

        {},

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                isRead: true,
              }
            : item,
        ),
      );

      toast.success("Notification marked as read");
    } catch (error) {
      console.log(error);

      toast.error("Failed to update notification");
    }
  };

  // ==========================================
  // DELETE NOTIFICATION
  // ==========================================

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `/api/notifications/delete/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setNotifications((prev) => prev.filter((item) => item._id !== id));

      toast.success("Notification deleted");
    } catch (error) {
      console.log(error);

      toast.error("Failed to delete notification");
    }
  };

  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        "/api/notifications/read-all",

        {},

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        })),
      );

      toast.success("All notifications marked as read");
    } catch (error) {
      console.log(error);

      toast.error("Failed to update notifications");
    }
  };

  // ==========================================
  // CLEAR ALL
  // ==========================================

  const clearAllNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        "/api/notifications/clear-all",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setNotifications([]);

      toast.success("All notifications cleared");
    } catch (error) {
      console.log(error);

      toast.error("Failed to clear notifications");
    }
  };

  // ==========================================
  // ICONS
  // ==========================================

  const getIcon = (type) => {
    switch (type) {
      case "COMPLAINT":
        return <ClipboardList size={24} className="text-blue-700" />;

      case "WORKER_ASSIGN":
        return <CheckCircle2 size={24} className="text-green-700" />;

      case "REOPEN":
        return <AlertTriangle size={24} className="text-red-700" />;

      case "ESCALATION":
        return <ShieldAlert size={24} className="text-yellow-700" />;

      default:
        return <Bell size={24} className="text-gray-700" />;
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="
          flex
          items-center
          justify-center
          min-h-screen
        "
      >
        <Loader2
          size={55}
          className="
            animate-spin
            text-[#001B54]
          "
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div
        className="
          bg-gradient-to-r
          from-[#001B54]
          to-[#7A0019]

          text-white
          rounded-3xl

          p-6
          md:p-8

          shadow-2xl
        "
      >
        <div
          className="
            flex
            flex-col
            lg:flex-row

            lg:items-center
            lg:justify-between

            gap-5
          "
        >
          <div className="flex items-center gap-4">
            <Bell size={45} />

            <div>
              <h1
                className="
                  text-3xl
                  md:text-5xl
                  font-extrabold
                "
              >
                Notifications
              </h1>

              <p className="mt-2 text-blue-100">
                Real-time ERP notification system.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={markAllAsRead}
              className="
                bg-white
                text-[#001B54]

                px-5
                py-3

                rounded-2xl

                font-semibold
              "
            >
              Mark All Read
            </button>

            <button
              onClick={clearAllNotifications}
              className="
                bg-red-600

                text-white

                px-5
                py-3

                rounded-2xl

                font-semibold
              "
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3

          gap-5
        "
      >
        <div className="bg-blue-100 rounded-3xl p-6 shadow-xl">
          <Bell size={30} className="text-blue-700" />

          <h2 className="text-4xl font-bold text-blue-700 mt-4">
            {notifications.length}
          </h2>

          <p className="mt-2 text-blue-700 font-medium">Total Notifications</p>
        </div>

        <div className="bg-red-100 rounded-3xl p-6 shadow-xl">
          <AlertTriangle size={30} className="text-red-700" />

          <h2 className="text-4xl font-bold text-red-700 mt-4">
            {notifications.filter((item) => !item.isRead).length}
          </h2>

          <p className="mt-2 text-red-700 font-medium">Unread Notifications</p>
        </div>

        <div className="bg-green-100 rounded-3xl p-6 shadow-xl">
          <CheckCircle2 size={30} className="text-green-700" />

          <h2 className="text-4xl font-bold text-green-700 mt-4">
            {notifications.filter((item) => item.isRead).length}
          </h2>

          <p className="mt-2 text-green-700 font-medium">Read Notifications</p>
        </div>
      </div>

      {/* LIST */}

      <div className="space-y-6">
        {notifications.length === 0 ? (
          <div
            className="
              bg-white
              rounded-3xl
              shadow-xl

              p-10
              text-center
            "
          >
            <Bell
              size={60}
              className="
                mx-auto
                text-gray-300
              "
            />

            <h2
              className="
                text-2xl
                font-bold
                text-gray-500
                mt-5
              "
            >
              No Notifications
            </h2>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`
                  rounded-3xl
                  shadow-xl
                  border
                  p-6

                  ${
                    notification.isRead
                      ? `
                        bg-white
                        border-gray-200
                      `
                      : `
                        bg-blue-50
                        border-blue-300
                      `
                  }
                `}
            >
              <div
                className="
                    flex
                    flex-col
                    lg:flex-row

                    lg:items-center
                    lg:justify-between

                    gap-5
                  "
              >
                {/* LEFT */}

                <div className="flex gap-5">
                  <div
                    className="
                        w-14
                        h-14

                        rounded-2xl

                        flex
                        items-center
                        justify-center

                        bg-white

                        shadow-md
                      "
                  >
                    {getIcon(notification.type)}
                  </div>

                  <div>
                    <h2
                      className="
                          text-xl
                          font-bold
                          text-[#001B54]
                        "
                    >
                      {notification.title}
                    </h2>

                    <p className="text-gray-600 mt-2">{notification.message}</p>

                    <p className="text-sm text-gray-400 mt-3">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* RIGHT */}

                <div className="flex gap-3">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="
                          bg-gradient-to-r
                          from-[#001B54]
                          to-[#7A0019]

                          text-white

                          px-5
                          py-3

                          rounded-2xl

                          font-semibold
                        "
                    >
                      Mark Read
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="
                        bg-red-500
                        text-white

                        p-3

                        rounded-2xl
                      "
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;

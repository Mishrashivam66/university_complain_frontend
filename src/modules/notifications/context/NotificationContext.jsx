import { createContext, useContext, useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../services/notificationService";

// ==========================================
// CONTEXT
// ==========================================

const NotificationContext = createContext();

// ==========================================
// PROVIDER
// ==========================================

export const NotificationProvider = ({ children }) => {
  // ==========================================
  // STATES
  // ==========================================

  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(false);

  // ==========================================
  // USER
  // ==========================================

  const user = JSON.parse(localStorage.getItem("user"));

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const { data } = await getNotifications();

      setNotifications(data.notifications || []);

      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.log(error);

      if (user?._id) {
        toast.error("Failed to load notifications");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH UNREAD COUNT
  // ==========================================

  const fetchUnreadCount = async () => {
    try {
      const { data } = await getUnreadCount();

      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // MARK AS READ
  // ==========================================

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
        ),
      );

      await fetchUnreadCount();
    } catch (error) {
      console.log(error);

      toast.error("Failed to mark as read");
    }
  };

  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      setUnreadCount(0);

      toast.success("All notifications marked as read");
    } catch (error) {
      console.log(error);

      toast.error("Failed to update notifications");
    }
  };

  // ==========================================
  // DELETE NOTIFICATION
  // ==========================================

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);

      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== id),
      );

      await fetchUnreadCount();

      toast.success("Notification deleted");
    } catch (error) {
      console.log(error);

      toast.error("Failed to delete notification");
    }
  };

  // ==========================================
  // CLEAR ALL NOTIFICATIONS
  // ==========================================

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();

      setNotifications([]);

      setUnreadCount(0);

      toast.success("All notifications cleared");
    } catch (error) {
      console.log(error);

      toast.error("Failed to clear notifications");
    }
  };

  // ==========================================
  // INITIAL FETCH
  // ==========================================

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, []);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value = {
    notifications,

    unreadCount,

    loading,

    fetchNotifications,

    fetchUnreadCount,

    handleMarkAsRead,

    handleMarkAllAsRead,

    handleDeleteNotification,

    handleClearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  return useContext(NotificationContext);
};

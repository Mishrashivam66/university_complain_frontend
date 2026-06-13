import api from "./api";

// ==========================================
// GET NOTIFICATIONS
// ==========================================

export const getNotifications = () => api.get("/notifications");

// ==========================================
// GET UNREAD COUNT
// ==========================================

export const getUnreadCount = () => api.get("/notifications/unread-count");

// ==========================================
// MARK AS READ
// ==========================================

export const markAsRead = (id) => api.put(`/notifications/read/${id}`);

// ==========================================
// MARK ALL AS READ
// ==========================================

export const markAllAsRead = () => api.put("/notifications/read-all");

// ==========================================
// DELETE NOTIFICATION
// ==========================================

export const deleteNotification = (id) =>
  api.delete(`/notifications/delete/${id}`);

// ==========================================
// CLEAR ALL NOTIFICATIONS
// ==========================================

export const clearAllNotifications = () =>
  api.delete("/notifications/clear-all");

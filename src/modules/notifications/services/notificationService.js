import api from "../../../services/api";

// ==========================================
// GET MY NOTIFICATIONS
// ==========================================

export const getNotifications = (page = 1, limit = 20) => {
  return api.get(`/notifications?page=${page}&limit=${limit}`);
};

// ==========================================
// GET UNREAD COUNT
// ==========================================

export const getUnreadCount = () => {
  return api.get("/notifications/unread-count");
};

// ==========================================
// MARK SINGLE NOTIFICATION AS READ
// ==========================================

export const markAsRead = (id) => {
  return api.put(`/notifications/read/${id}`);
};

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

export const markAllAsRead = () => {
  return api.put("/notifications/read-all");
};

// ==========================================
// DELETE SINGLE NOTIFICATION
// ==========================================

export const deleteNotification = (id) => {
  return api.delete(`/notifications/delete/${id}`);
};

// ==========================================
// CLEAR ALL NOTIFICATIONS
// ==========================================

export const clearAllNotifications = () => {
  return api.delete("/notifications/clear-all");
};

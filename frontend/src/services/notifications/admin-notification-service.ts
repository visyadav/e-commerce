import { apiClient } from "../api-client";

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: number;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
}

export const adminNotificationService = {
  getNotifications: (unreadOnly = false, pageNumber = 1, pageSize = 20) => {
    return apiClient.getPaginated<NotificationDto>(`/admin/notifications?unreadOnly=${unreadOnly}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },

  getUnreadCount: () => {
    return apiClient.get<number>("/admin/notifications/unread-count");
  },

  markAsRead: (id: string) => {
    return apiClient.post<void>(`/admin/notifications/${id}/read`);
  },

  markAllAsRead: () => {
    return apiClient.post<void>("/admin/notifications/read-all");
  },
};

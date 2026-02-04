import { api } from "./axiosInstance";

import type {
  ApiResponse,
  PageResponse,
  NotificationItem,
} from "../types/notification"

/**
 * 내 알림 목록 조회
 * GET /api/notifications?page=1&size=10
 */
export const getMyNotifications = async (
  page: number = 1,
  size: number = 10
): Promise<PageResponse<NotificationItem>> => {
  const res = await api.get<ApiResponse<PageResponse<NotificationItem>>>(
    "/notifications",
    {
      params: { page, size },
    }
  );

  return res.data.data;
};

/** 알림 읽음 처리(PATCH) */
export const markNotificationAsRead = async (
  notificationId: number | string
): Promise<void> => {
  await api.patch<ApiResponse<void>>(`/notifications/${notificationId}`);
};
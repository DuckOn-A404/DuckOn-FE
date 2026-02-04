/** 알림 유형 (UI 기준) */
export type NotificationType =
  | "ARTIST_CHANGE_REQUEST"
  | "REPORT_RESULT"
  | "PENALTY"
  | "SYSTEM_ALERT";

/** 알림 소스 유형 (백엔드 내부 추적용) */
export type NotificationSourceType =
  | "ARTIST_PROFILE_CHANGE_REQUEST"
  | "REPORT"
  | "PENALTY";

/** 공통 API 응답 래퍼 */
export type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};

/**
 * 페이지 응답 (백엔드 PageResponse.from1Base 기준)
 * - page: 1-base
 */
export type PageResponse<T> = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  items: T[];
};

/** 알림 리스트 아이템 */
export type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  linkUrl: string | null;
  sourceId: number;
  sourceType: NotificationSourceType;
};
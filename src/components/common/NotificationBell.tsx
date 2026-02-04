import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

import {
  getMyNotifications,
  markNotificationAsRead,
} from "../../api/notificationService";
import type { NotificationItem, NotificationSourceType } from "../../types/notification";

const buildRouteBySource = (sourceType: NotificationSourceType, sourceId: number) => {
  switch (sourceType) {
    case "ARTIST_PROFILE_CHANGE_REQUEST":
      return `/me/artist-change-requests/${sourceId}`;

    case "REPORT":
      return `/me/reports/${sourceId}`;

    case "PENALTY":
      return `/me/penalties/${sourceId}`;

    default:
      return "/";
  }
};

// 상대적 시간 포맷팅 헬퍼 함수
const formatRelativeTime = (dateString: string) => {
  try {
    let date: Date;
    
    // LocalDateTime 형식이고 timezone 정보가 없으면 UTC로 처리 (Z 추가)
    if (dateString && dateString.includes('T') && !dateString.endsWith('Z') && !dateString.includes('+')) {
      // "2026-02-04T10:00:00" 형식 → UTC로 처리
      date = new Date(dateString + 'Z');
    } else {
      // 이미 timezone 정보가 있거나 다른 형식
      date = new Date(dateString);
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // 시간이 미래거나 너무 이상하면 그냥 날짜 표시
    if (diffInSeconds < -60 || diffInSeconds > 31536000) { // 1분 이상 미래이거나 1년 이상
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('시간 파싱 에러:', error, dateString);
    return '시간 정보 없음';
  }
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const hasUnread = items.some((n) => n.readAt === null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMyNotifications(1, 10);
      setItems(data.items);
    } catch (e) {
      console.error("알림 조회 실패", e);
    } finally {
      setLoading(false);
    }
  };

  // 최초 1회 로드(빨간점 정확히)
  useEffect(() => {
    load();
  }, []);

  // 바깥 클릭 닫기
  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const handleClick = async (n: NotificationItem) => {
    try {
      // 1) 읽음 처리 (PATCH)
      if (n.readAt === null) {
        await markNotificationAsRead(n.id);
      }

      // 2) 프론트 상태 즉시 업데이트
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x))
      );

      setOpen(false);

      // 3) 이동 (우선순위: linkUrl 있으면 사용, 없으면 sourceType 기반)
      const target = n.linkUrl ?? buildRouteBySource(n.sourceType, n.sourceId);
      if (target) navigate(target);
    } catch (e) {
      console.error("알림 읽음 처리 실패", e);
    }
  };

  return (
    <>
      <style>{`
        .hover-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s ease;
        }
        
        .hover-scrollbar:hover {
          scrollbar-color: rgb(209 213 219) transparent;
        }
        
        .hover-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .hover-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .hover-scrollbar::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 3px;
          transition: background-color 0.3s ease;
        }
        
        .hover-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgb(209 213 219);
        }
        
        .hover-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgb(156 163 175);
        }
      `}</style>
      <div ref={wrapperRef} className="relative">
      {/* Bell Button - 개선된 스타일 */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:bg-purple-50 hover:scale-110"
        aria-label="notifications"
      >
        <Bell className={`h-5 w-5 transition-colors ${hasUnread ? 'text-purple-600' : 'text-gray-600'}`} />
        {hasUnread && (
          <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
          </span>
        )}
      </button>

      {/* Dropdown - 현대적이고 컴팩트한 디자인 */}
      {open && (
        <div 
          className="absolute right-0 mt-2 w-[300px] rounded-xl border border-gray-200 bg-white shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          {/* Header - 그라데이션 배경 */}
          <div className="relative overflow-hidden border-b border-gray-100 px-4 py-3">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 opacity-50" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  <Bell className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  알림
                </h3>
              </div>
              {hasUnread && (
                <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
                  {items.filter(n => n.readAt === null).length}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[420px] overflow-y-auto hover-scrollbar">
            {loading && (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-3 h-10 w-10 animate-spin rounded-full border-3 border-gray-200 border-t-purple-500" />
                <p className="text-sm font-medium text-gray-600">불러오는 중...</p>
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
                  <Bell className="h-7 w-7 text-purple-400" />
                </div>
                <p className="mb-1 text-sm font-semibold text-gray-700">알림이 없습니다</p>
                <p className="text-xs text-gray-500">새 알림이 도착하면 여기에 표시됩니다</p>
              </div>
            )}

            {!loading &&
              items.map((n, idx) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={[
                    "group relative w-full px-4 py-3 text-left transition-all duration-200",
                    "flex flex-col gap-1.5",
                    "hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50",
                    n.readAt === null 
                      ? "bg-gradient-to-r from-purple-50/50 to-pink-50/50" 
                      : "hover:bg-gray-50",
                    idx !== items.length - 1 ? "border-b border-gray-100" : "",
                  ].join(" ")}
                >
                  {/* 읽지 않은 알림 좌측 액센트 바 */}
                  {n.readAt === null && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full" />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Title with gradient for unread */}
                      <h4 className={[
                        "text-sm font-semibold leading-snug mb-0.5",
                        n.readAt === null 
                          ? "bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent" 
                          : "text-gray-800 group-hover:text-purple-700"
                      ].join(" ")}>
                        {n.title}
                      </h4>
                      
                      {/* Body preview */}
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-1.5">
                        {n.body}
                      </p>
                      
                      {/* Timestamp with icon */}
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatRelativeTime(n.createdAt)}</span>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {n.readAt === null && (
                      <div className="flex-shrink-0 mt-0.5">
                        <span className="flex h-2 w-2">
                          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-purple-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm" />
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default NotificationBell;
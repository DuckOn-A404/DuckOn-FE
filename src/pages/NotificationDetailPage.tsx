import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Bell,
  AlertTriangle,
  FileText,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Paperclip,
  ArrowRight,
  CalendarDays,
  RefreshCw,
  Megaphone,
} from "lucide-react";
import { getNotificationDetail } from "../api/notificationService";
import type {
  NotificationDetail,
  ArtistChangeRequestPayload,
  PenaltyPayload,
} from "../types/notification";

const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  const d =
    dateString.includes("T") && !dateString.endsWith("Z")
      ? new Date(dateString + "Z")
      : new Date(dateString);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isImageUrl = (url: string) =>
  /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);

const REQUEST_STATUS_MAP: Record<
  string,
  { label: string; icon: React.ReactNode; banner: string }
> = {
  PENDING:  { label: "검토 중",   icon: <Clock className="h-3.5 w-3.5" />,        banner: "bg-amber-50 text-amber-700" },
  APPROVED: { label: "승인됨",    icon: <CheckCircle2 className="h-3.5 w-3.5" />, banner: "bg-blue-50 text-blue-700" },
  REJECTED: { label: "반려됨",    icon: <XCircle className="h-3.5 w-3.5" />,      banner: "bg-red-50 text-red-600" },
  CANCELED: { label: "취소됨",    icon: <Ban className="h-3.5 w-3.5" />,          banner: "bg-gray-50 text-gray-500" },
  APPLIED:  { label: "적용 완료", icon: <CheckCircle2 className="h-3.5 w-3.5" />, banner: "bg-emerald-50 text-emerald-700" },
};

const PENALTY_TYPE_MAP: Record<string, string> = {
  CHAT_BAN:           "채팅 금지",
  ROOM_CREATION_BAN:  "방 생성 금지",
  ACCOUNT_SUSPENSION: "계정 정지",
};

const PENALTY_STATUS_MAP: Record<
  string,
  { label: string; icon: React.ReactNode; chip: string }
> = {
  ACTIVE:   { label: "적용 중", icon: <Shield className="h-3.5 w-3.5" />,        chip: "bg-red-100 text-red-600" },
  RELEASED: { label: "해제됨",  icon: <CheckCircle2 className="h-3.5 w-3.5" />, chip: "bg-emerald-100 text-emerald-700" },
  EXPIRED:  { label: "만료됨",  icon: <Clock className="h-3.5 w-3.5" />,         chip: "bg-gray-100 text-gray-500" },
};

// 타입별 테마
const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; gradient: string; softBg: string; iconColor: string; label: string }
> = {
  ARTIST_CHANGE_REQUEST: {
    icon: <FileText className="h-6 w-6" />,
    gradient: "from-violet-500 to-fuchsia-500",
    softBg: "bg-violet-50",
    iconColor: "text-violet-500",
    label: "아티스트 정보 변경 요청",
  },
  PENALTY: {
    icon: <Shield className="h-6 w-6" />,
    gradient: "from-rose-500 to-orange-400",
    softBg: "bg-rose-50",
    iconColor: "text-rose-500",
    label: "제재 알림",
  },
  REPORT_RESULT: {
    icon: <AlertTriangle className="h-6 w-6" />,
    gradient: "from-amber-400 to-orange-500",
    softBg: "bg-amber-50",
    iconColor: "text-amber-500",
    label: "신고 처리 결과",
  },
  SYSTEM_ALERT: {
    icon: <Megaphone className="h-6 w-6" />,
    gradient: "from-sky-500 to-indigo-500",
    softBg: "bg-sky-50",
    iconColor: "text-sky-500",
    label: "시스템 알림",
  },
};

// ── 공통 컴포넌트 ─────────────────────────────────

const Divider = () => <div className="border-t border-gray-100" />;

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4 py-3.5">
    <span className="flex-shrink-0 w-24 text-sm text-gray-400">{label}</span>
    <div className="flex-1 text-right text-sm font-medium text-gray-800">{children}</div>
  </div>
);

// ── ARTIST_CHANGE_REQUEST ─────────────────────────

const ArtistChangeRequestDetail = ({
  payload,
  navigate,
}: {
  payload: ArtistChangeRequestPayload;
  navigate: (path: string) => void;
}) => {
  const status = REQUEST_STATUS_MAP[payload.requestStatus];

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">

        {/* 상태 배너 */}
        <div className={`flex items-center gap-2 px-6 py-4 text-sm font-bold ${status.banner}`}>
          {status.icon}
          {status.label}
        </div>

        <Divider />

        {/* 아티스트 */}
        <div className="px-6 py-5">
          <p className="text-base font-bold text-gray-900">{payload.artist.nameKr}</p>
          <p className="text-sm text-gray-400 mt-0.5">{payload.artist.nameEn}</p>
        </div>

        <Divider />

        {/* 요청 내용 */}
        <div className="px-6 py-5">
          <p className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">요청 내용</p>
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{payload.content}</p>
        </div>

        {/* 첨부파일 */}
        {payload.attachmentUrl && (
          <>
            <Divider />
            <div className="px-6 py-5">
              <p className="mb-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">첨부파일</p>
              {isImageUrl(payload.attachmentUrl) ? (
                <a href={payload.attachmentUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={payload.attachmentUrl}
                    alt="첨부 이미지"
                    className="max-h-60 w-auto rounded-xl border border-gray-100 object-cover shadow-sm transition hover:opacity-90"
                  />
                </a>
              ) : (
                <a
                  href={payload.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-600 transition hover:bg-violet-100"
                >
                  <Paperclip className="h-4 w-4" />
                  파일 열기
                  <ArrowRight className="h-3.5 w-3.5 opacity-50" />
                </a>
              )}
            </div>
          </>
        )}

        {/* 검토 의견 */}
        {payload.reviewComment && (
          <>
            <Divider />
            <div className="px-6 py-5">
              <p className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">검토 의견</p>
              <p className="text-sm leading-relaxed text-gray-700">{payload.reviewComment}</p>
              {payload.reviewedAt && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(payload.reviewedAt)} 검토
                </p>
              )}
            </div>
          </>
        )}

        <Divider />

        {/* 일시 */}
        <div className="px-6">
          <Row label="요청일">
            <span className="flex items-center justify-end gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
              {formatDate(payload.requestCreatedAt)}
            </span>
          </Row>
          {payload.requestUpdatedAt !== payload.requestCreatedAt && (
            <>
              <Divider />
              <Row label="최종 수정">
                <span className="flex items-center justify-end gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 text-gray-400" />
                  {formatDate(payload.requestUpdatedAt)}
                </span>
              </Row>
            </>
          )}
        </div>
      </div>

      {/* 카드 밖 CTA */}
      <button
        onClick={() => navigate("/my-change-requests")}
        className="group flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-gray-500 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
      >
        내 변경 요청 전체 보기
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
};

// ── PENALTY ───────────────────────────────────────

const PenaltyDetail = ({ payload }: { payload: PenaltyPayload }) => {
  const status = PENALTY_STATUS_MAP[payload.penaltyStatus];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 bg-red-50">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-red-300 mb-0.5">제재 유형</p>
          <p className="text-base font-bold text-red-800">
            {PENALTY_TYPE_MAP[payload.penaltyType] ?? payload.penaltyType}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.chip}`}>
          {status.icon}
          {status.label}
        </span>
      </div>

      <Divider />

      <div className="px-6 py-5">
        <p className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">제재 사유</p>
        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{payload.reason}</p>
      </div>

      <Divider />

      <div className="px-6">
        <Row label="시작일">
          <span className="flex items-center justify-end gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
            {formatDate(payload.startAt)}
          </span>
        </Row>
        <Divider />
        <Row label="종료일">
          <span className="flex items-center justify-end gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
            {formatDate(payload.endAt)}
          </span>
        </Row>
      </div>
    </div>
  );
};

// ── REPORT / SYSTEM ───────────────────────────────

const EmptyPayloadDetail = ({ body }: { body: string }) => (
  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm px-6 py-5">
    <p className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">알림 내용</p>
    <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{body}</p>
  </div>
);

// ── 메인 ─────────────────────────────────────────

const NotificationDetailPage = () => {
  const { notificationId } = useParams<{ notificationId: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<NotificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    if (!notificationId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getNotificationDetail(notificationId);
        setDetail(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [notificationId]);

  const typeConfig = detail
    ? (TYPE_CONFIG[detail.type] ?? TYPE_CONFIG.SYSTEM_ALERT)
    : null;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim   { animation: fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-1 { animation-delay: 0.04s; }
        .anim-2 { animation-delay: 0.1s; }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl py-8">

          {/* 페이지 헤더 */}
          <div className="anim mb-6 flex items-center gap-3">
            <button
              onClick={handleBack}
              className="flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 bg-white shadow-sm text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          {/* 로딩 */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-40 gap-5">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-violet-500" />
                <div className="absolute inset-2 animate-spin rounded-full border-[3px] border-transparent border-t-fuchsia-400 [animation-direction:reverse] [animation-duration:0.5s]" />
              </div>
              <p className="text-sm text-gray-400">불러오는 중...</p>
            </div>
          )}

          {/* 에러 */}
          {!loading && error && (
            <div className="anim rounded-2xl border border-red-100 bg-red-50 p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-7 w-7 text-red-400" />
              </div>
              <p className="font-bold text-red-700">알림을 불러올 수 없습니다</p>
              <p className="mt-1 text-sm text-red-400">잠시 후 다시 시도해주세요.</p>
            </div>
          )}

          {/* 본문 */}
          {!loading && !error && detail && typeConfig && (
            <div className="space-y-4">

              {/* 히어로 카드 */}
              <div className="anim anim-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className={`h-1.5 w-full bg-gradient-to-r ${typeConfig.gradient}`} />
                <div className="flex items-start gap-5 px-6 py-5">
                  <div className={`flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl ${typeConfig.softBg} ${typeConfig.iconColor}`}>
                    {typeConfig.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`mb-1 text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${typeConfig.gradient} bg-clip-text text-transparent`}>
                      {typeConfig.label}
                    </p>
                    <h1 className="text-lg font-bold leading-snug text-gray-900">
                      {detail.title}
                    </h1>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{detail.body}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(detail.createdAt)}
                      </span>
                      {detail.readAt ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" /> 읽음
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-600">
                          <Bell className="h-3 w-3" /> 새 알림
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 타입별 상세 */}
              <div className="anim anim-2">
                {detail.type === "ARTIST_CHANGE_REQUEST" && (
                  <ArtistChangeRequestDetail
                    payload={detail.payload as ArtistChangeRequestPayload}
                    navigate={navigate}
                  />
                )}
                {detail.type === "PENALTY" && (
                  <PenaltyDetail payload={detail.payload as PenaltyPayload} />
                )}
                {(detail.type === "REPORT_RESULT" || detail.type === "SYSTEM_ALERT") && (
                  <EmptyPayloadDetail body={detail.body} />
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default NotificationDetailPage;
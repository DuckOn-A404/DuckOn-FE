import React, { useEffect, useMemo, useState } from "react";
import { ShieldBan, ShieldCheck, ShieldAlert, Clock, X, Search } from "lucide-react";
import { api } from "../../api/axiosInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiResponseDTO<T> {
  status: number;
  message: string;
  data: T;
}

interface PageResponse<T> {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  items: T[];
}

interface PenaltyListItem {
  penaltyId: number;
  userId: number;
  nickname: string;
  reason: string;
  penaltyType: PenaltyType;
  status: PenaltyStatus;
  startAt: string;
  endAt: string;
}

interface PenaltyDetail extends PenaltyListItem {
  userLoginId: string;
  email: string;
  previousPenaltyCount: number;
  totalReportedCount: number;
}

type PenaltyType = "CHAT_BAN" | "ROOM_CREATION_BAN" | "ACCOUNT_SUSPENSION";
type PenaltyStatus = "ACTIVE" | "RELEASED" | "EXPIRED";
type UiPenaltyType = "전체" | PenaltyType;
type UiPenaltyStatus = "전체" | PenaltyStatus;

// ─── Constants ────────────────────────────────────────────────────────────────

const PENALTY_TYPE_KO: Record<PenaltyType, string> = {
  CHAT_BAN: "채팅 금지",
  ROOM_CREATION_BAN: "방 생성 금지",
  ACCOUNT_SUSPENSION: "계정 정지",
};

const STATUS_KO: Record<PenaltyStatus, string> = {
  ACTIVE: "활성",
  RELEASED: "해제됨",
  EXPIRED: "만료됨",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso?: string | null) {
  if (!iso) return "-";
  const normalized = iso.endsWith("Z") ? iso : iso + "Z";
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return "-";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PenaltyTypeBadge({ type }: { type: PenaltyType }) {
  const styles: Record<PenaltyType, string> = {
    CHAT_BAN: "bg-orange-100 text-orange-700",
    ROOM_CREATION_BAN: "bg-blue-100 text-blue-700",
    ACCOUNT_SUSPENSION: "bg-red-100 text-red-700",
  };
  const icons: Record<PenaltyType, React.ElementType> = {
    CHAT_BAN: ShieldAlert,
    ROOM_CREATION_BAN: ShieldBan,
    ACCOUNT_SUSPENSION: ShieldBan,
  };
  const Icon = icons[type];
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
      <Icon size={13} />
      {PENALTY_TYPE_KO[type]}
    </span>
  );
}

function PenaltyStatusBadge({ status }: { status: PenaltyStatus }) {
  const styles: Record<PenaltyStatus, string> = {
    ACTIVE: "bg-red-100 text-red-700",
    RELEASED: "bg-green-100 text-green-700",
    EXPIRED: "bg-gray-100 text-gray-500",
  };
  const icons: Record<PenaltyStatus, React.ElementType> = {
    ACTIVE: ShieldBan,
    RELEASED: ShieldCheck,
    EXPIRED: Clock,
  };
  const Icon = icons[status];
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      <Icon size={13} />
      {STATUS_KO[status]}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PenaltyManagePage: React.FC = () => {
  const [penalties, setPenalties] = useState<PenaltyListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const [filterType, setFilterType] = useState<UiPenaltyType>("전체");
  const [filterStatus, setFilterStatus] = useState<UiPenaltyStatus>("전체");
  const [searchInput, setSearchInput] = useState("");

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<PenaltyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Fetch List ────────────────────────────────────────────────────────────

  const fetchPenalties = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponseDTO<PageResponse<PenaltyListItem>>>(
        "/admin/penalties",
        { params: { page, size } }
      );
      const data = res.data.data;
      setPenalties(data.items ?? []);
      setTotalPages(Math.max(1, data.totalPages ?? 0));
      setTotalElements(data.totalElements ?? 0);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "제재 목록 조회 중 오류가 발생했습니다.";
      setError(msg);
      setPenalties([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenalties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  useEffect(() => {
    const safe = Math.max(1, totalPages);
    if (page < 1) setPage(1);
    else if (page > safe) setPage(safe);
  }, [totalPages, page]);

  // ── Fetch Detail ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!selectedId) return;
    setDetailLoading(true);
    setDetail(null);
    api.get<ApiResponseDTO<PenaltyDetail>>(`/admin/penalties/${selectedId}`)
      .then((res) => setDetail(res.data.data))
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  // ── Client-side Filter ────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return penalties.filter((p) => {
      if (filterType !== "전체" && p.penaltyType !== filterType) return false;
      if (filterStatus !== "전체" && p.status !== filterStatus) return false;
      const q = searchInput.trim().toLowerCase();
      if (q && !p.nickname.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [penalties, filterType, filterStatus, searchInput]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const handleReset = () => {
    setSearchInput("");
    setFilterType("전체");
    setFilterStatus("전체");
    setPage(1);
  };

  const closeModal = () => {
    setSelectedId(null);
    setDetail(null);
  };

  const safeTotalPages = Math.max(1, totalPages);

  const pageButtons = useMemo(() => {
    const max = 5;
    const start = Math.max(1, page - Math.floor(max / 2));
    const end = Math.min(safeTotalPages, start + max - 1);
    const realStart = Math.max(1, end - max + 1);
    const arr: number[] = [];
    for (let p = realStart; p <= end; p++) arr.push(p);
    return arr;
  }, [page, safeTotalPages]);

  const isFilterActive = !!searchInput.trim() || filterType !== "전체" || filterStatus !== "전체";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">제재 관리</h1>
          <p className="text-gray-600">
            유저 제재 내역을 확인할 수 있습니다. (총 {totalElements.toLocaleString()}건)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={size}
            onChange={(e) => { setPage(1); setSize(Number(e.target.value)); }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {[10, 20, 30, 50].map((n) => (
              <option key={n} value={n}>{n}개씩</option>
            ))}
          </select>
          <button
            onClick={fetchPenalties}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            새로고침
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="닉네임으로 검색..."
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          {isFilterActive && (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              전체 초기화
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700 w-16 shrink-0">유형:</span>
          <div className="flex gap-2 flex-wrap">
            {(["전체", "CHAT_BAN", "ROOM_CREATION_BAN", "ACCOUNT_SUSPENSION"] as UiPenaltyType[]).map((t) => (
              <button
                key={t}
                onClick={() => { setFilterType(t); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterType === t
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t === "전체" ? "전체" : PENALTY_TYPE_KO[t]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700 w-16 shrink-0">상태:</span>
          <div className="flex gap-2 flex-wrap">
            {(["전체", "ACTIVE", "RELEASED", "EXPIRED"] as UiPenaltyStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === s
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {s === "전체" ? "전체" : STATUS_KO[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-16" />   {/* ID */}
              <col className="w-36" />   {/* 닉네임 */}
              <col className="w-36" />   {/* 제재 유형 */}
              <col className="w-40" />   {/* 사유 */}
              <col className="w-36" />   {/* 시작일 */}
              <col className="w-36" />   {/* 종료일 */}
              <col className="w-28" />   {/* 상태 */}
              <col className="w-20" />   {/* 작업 */}
            </colgroup>
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">닉네임</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">제재 유형</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">사유</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">시작일</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">종료일</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">상태</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td className="px-4 py-10 text-center text-gray-500" colSpan={8}>불러오는 중…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-gray-500" colSpan={8}>제재 내역이 없습니다.</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.penaltyId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">#{p.penaltyId}</td>
                    <td className="px-4 py-4 text-sm text-gray-900 overflow-hidden">
                      <span className="block truncate">{p.nickname}</span>
                    </td>
                    <td className="px-4 py-4 overflow-hidden">
                      <PenaltyTypeBadge type={p.penaltyType} />
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 overflow-hidden">
                      <span className="block truncate">{p.reason}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDateTime(p.startAt)}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDateTime(p.endAt)}</td>
                    <td className="px-4 py-4 overflow-hidden">
                      <PenaltyStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setSelectedId(p.penaltyId)}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium whitespace-nowrap"
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">페이지 {page} / {safeTotalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(1)} disabled={page <= 1} className="px-3 py-2 rounded-lg text-sm border disabled:opacity-40 hover:bg-gray-50">처음</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-2 rounded-lg text-sm border disabled:opacity-40 hover:bg-gray-50">이전</button>
            {pageButtons.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-lg text-sm border transition ${p === page ? "bg-purple-600 text-white border-purple-600" : "hover:bg-gray-50"}`}
              >
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(safeTotalPages, p + 1))} disabled={page >= safeTotalPages} className="px-3 py-2 rounded-lg text-sm border disabled:opacity-40 hover:bg-gray-50">다음</button>
            <button onClick={() => setPage(safeTotalPages)} disabled={page >= safeTotalPages} className="px-3 py-2 rounded-lg text-sm border disabled:opacity-40 hover:bg-gray-50">마지막</button>
          </div>
        </div>
      </div>

      {/* ── Detail Modal ──────────────────────────────────────────────────────── */}
      {selectedId && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-gray-900">제재 상세 정보</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {detailLoading ? (
                <div className="flex items-center justify-center h-40 text-gray-400">불러오는 중…</div>
              ) : detail ? (
                <>
                  {/* 기본 정보 */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">기본 정보</h3>
                    <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                      <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-sm text-gray-500">제재 ID</span>
                        <span className="text-sm font-semibold text-gray-900">#{detail.penaltyId}</span>
                      </div>
                      <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-sm text-gray-500">제재 유형</span>
                        <PenaltyTypeBadge type={detail.penaltyType} />
                      </div>
                      <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-sm text-gray-500">상태</span>
                        <PenaltyStatusBadge status={detail.status} />
                      </div>
                    </div>
                  </section>

                  {/* 유저 정보 */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">유저 정보</h3>
                    <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                      {[
                        { label: "유저 ID", value: String(detail.userId) },
                        { label: "닉네임", value: detail.nickname },
                        { label: "로그인 ID", value: detail.userLoginId },
                        { label: "이메일", value: detail.email },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center px-4 py-3 gap-4">
                          <span className="text-sm text-gray-500 shrink-0">{label}</span>
                          {/* 모달에서는 break-all로 전체 텍스트 표시 */}
                          <span className="text-sm font-medium text-gray-900 text-right break-all">{value}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 제재 사유 */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">제재 사유</h3>
                    <div className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">{detail.reason}</p>
                    </div>
                  </section>

                  {/* 이력 요약 */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">이력 요약</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-orange-50 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-orange-500">{detail.previousPenaltyCount}</p>
                        <p className="text-xs text-orange-400 mt-1">이전 제재 횟수</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-red-500">{detail.totalReportedCount}</p>
                        <p className="text-xs text-red-400 mt-1">누적 신고 횟수</p>
                      </div>
                    </div>
                  </section>

                  {/* 제재 기간 */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">제재 기간</h3>
                    <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                      <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-sm text-gray-500">시작일시</span>
                        <span className="text-sm font-medium text-gray-900">{formatDateTime(detail.startAt)}</span>
                      </div>
                      <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-sm text-gray-500">종료일시</span>
                        <span className="text-sm font-medium text-gray-900">{formatDateTime(detail.endAt)}</span>
                      </div>
                    </div>
                  </section>                  
                </>
              ) : (
                <div className="flex items-center justify-center h-40 text-red-400 text-sm">
                  데이터를 불러올 수 없습니다.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0">
              <p className="text-xs text-gray-400 mb-3">* 제재 해제/수정 기능은 API 연동 후 활성화됩니다.</p>
              <button
                disabled
                className="w-full px-6 py-3 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center gap-2 text-sm font-medium cursor-not-allowed"
              >
                <ShieldCheck size={18} />
                제재 해제 (API 준비 중)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenaltyManagePage;
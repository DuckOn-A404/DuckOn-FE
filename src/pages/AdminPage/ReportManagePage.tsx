import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Clock, CheckCircle, X, Trash2, Search } from "lucide-react";
import { api } from "../../api/axiosInstance";

interface ApiResponseDTO<T> {
  status: number;
  message: string;
  data: T;
}

interface PageResponse<T> {
  reportList?: T[];
  items?: T[];
  page: number;
  size: number;
  totalPages: number;
  totalCount: number;
}

interface ReportDTO {
  reportId: number;
  reporterId: string;
  reportedId: string;
  reportedContent: string;
  reportedAt: string;
  reportStatus: string;
  reportType: string;
  reportReason: string;
}

type UiStatus = "전체" | "대기중" | "조사중" | "해결됨" | "반려됨";
type UiContentType = "전체" | "MESSAGE" | "ROOM" | "MEME";
type SearchType = "reporter" | "reported";

const STATUS_KO: Record<string, Exclude<UiStatus, "전체">> = {
  WAITING: "대기중",
  PENDING: "대기중",
  IN_PROGRESS: "조사중",
  INVESTIGATING: "조사중",
  RESOLVED: "해결됨",
  DONE: "해결됨",
  REJECTED: "반려됨",
  DENIED: "반려됨",
};

const STATUS_TO_ENUM: Record<Exclude<UiStatus, "전체">, string> = {
  대기중: "PENDING",
  조사중: "INVESTIGATING",
  해결됨: "RESOLVED",
  반려됨: "REJECTED",
};

function toUiStatus(statusRaw: string): Exclude<UiStatus, "전체"> {
  if (statusRaw === "대기중" || statusRaw === "조사중" || statusRaw === "해결됨" || statusRaw === "반려됨") {
    return statusRaw;
  }
  return STATUS_KO[statusRaw] ?? "대기중";
}

function formatDateTime(iso?: string | null) {
  if (!iso) return "-";
  const normalized = iso.endsWith("Z") ? iso : iso + "Z";
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return "-";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const ReportManagePage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<UiStatus>("전체");
  const [filterContentType, setFilterContentType] = useState<UiContentType>("전체");

  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [detailReport, setDetailReport] = useState<ReportDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 검색 상태
  const [searchType, setSearchType] = useState<SearchType>("reporter");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState({ type: "reporter" as SearchType, value: "" });

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const [reports, setReports] = useState<ReportDTO[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = "/admin/reports";
      const params: Record<string, any> = { page, size };

      if (searchQuery.value) {
        // 유저 검색이 최우선
        url = `/admin/reports/${searchQuery.type === "reporter" ? "reporter" : "reported"}/${searchQuery.value}`;
      } else if (filterContentType !== "전체") {
        // 유형 필터
        url = `/admin/reports/content/${filterContentType}`;
      } else if (filterStatus !== "전체") {
        // 상태 필터
        url = `/admin/reports/status/${STATUS_TO_ENUM[filterStatus]}`;
      }

      const res = await api.get<ApiResponseDTO<PageResponse<ReportDTO>>>(url, { params });
      const data = res.data.data;
      const list = data.reportList ?? data.items ?? [];
      const safeTotalPages = Math.max(1, data.totalPages ?? 0);

      setReports(list);
      setTotalPages(safeTotalPages);
      setTotalCount(data.totalCount ?? 0);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "신고 목록 조회 중 오류가 발생했습니다.";
      setError(msg);
      setReports([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, filterStatus, filterContentType, searchQuery]);

  useEffect(() => {
    if (!selectedReportId) return;
    setDetailLoading(true);
    api.get<ApiResponseDTO<ReportDTO>>(`/admin/reports/${selectedReportId}`)
      .then((res) => setDetailReport(res.data.data))
      .catch(() => setDetailReport(null))
      .finally(() => setDetailLoading(false));
  }, [selectedReportId]);

  useEffect(() => {
    const safeTotalPages = Math.max(1, totalPages);
    if (page < 1) setPage(1);
    else if (page > safeTotalPages) setPage(safeTotalPages);
  }, [totalPages, page]);

  const handleSearch = () => {
    setPage(1);
    setFilterStatus("전체");
    setFilterContentType("전체");
    setSearchQuery({ type: searchType, value: searchInput.trim() });
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchType("reporter");
    setSearchQuery({ type: "reporter", value: "" });
    setFilterStatus("전체");
    setFilterContentType("전체");
    setPage(1);
  };

  const handleIdClick = (type: SearchType, value: string) => {
    setSearchType(type);
    setSearchInput(value);
    setSearchQuery({ type, value });
    setFilterStatus("전체");
    setFilterContentType("전체");
    setPage(1);
  };

  const isSearchActive = !!searchQuery.value;

  const getStatusBadge = (statusRaw: string) => {
    const status = toUiStatus(statusRaw);
    const styles: Record<Exclude<UiStatus, "전체">, string> = {
      대기중: "bg-yellow-100 text-yellow-700",
      해결됨: "bg-green-100 text-green-700",
      조사중: "bg-blue-100 text-blue-700",
      반려됨: "bg-gray-100 text-gray-700",
    };
    const icons: Record<Exclude<UiStatus, "전체">, any> = {
      대기중: Clock,
      해결됨: CheckCircle,
      조사중: AlertCircle,
      반려됨: X,
    };
    const Icon = icons[status];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        <Icon size={14} />
        {status}
      </span>
    );
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">신고 관리</h1>
          <p className="text-gray-600">
            접수된 신고를 확인할 수 있습니다. (총 {totalCount.toLocaleString()}건)
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
            onClick={fetchReports}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            새로고침
          </button>
        </div>
      </div>

      {/* Search Bar - 두 번째 사진 스타일 */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <div className="flex gap-3 items-center">
          {/* 검색 입력창 - 아이콘 내장 */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={searchType === "reporter" ? "신고자 ID로 검색..." : "피신고자 ID로 검색..."}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          {/* 드롭다운 - 오른쪽 */}
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="reporter">신고자</option>
            <option value="reported">피신고자</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition"
          >
            검색
          </button>
          {isSearchActive && (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              초기화
            </button>
          )}
        </div>
        {/* 검색 중 안내 */}
        {isSearchActive && (
          <p className="mt-2 text-sm text-purple-600 font-medium">
            {searchQuery.type === "reporter" ? "신고자" : "피신고자"}: {searchQuery.value} 검색 결과
          </p>
        )}
      </div>

      {/* Filter Bar - 상태 + 유형 */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-4">
        {/* 상태 필터 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700 w-10">상태:</span>
          <div className="flex gap-2 flex-wrap">
            {(["전체", "대기중", "조사중", "해결됨", "반려됨"] as UiStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setFilterContentType("전체");
                  setSearchInput("");
                  setSearchQuery({ type: "reporter", value: "" });
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === status && filterContentType === "전체" && !isSearchActive
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* 유형 필터 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700 w-10">유형:</span>
          <div className="flex gap-2 flex-wrap">
            {(["전체", "MESSAGE", "ROOM", "MEME"] as UiContentType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilterContentType(type);
                  setFilterStatus("전체");
                  setSearchInput("");
                  setSearchQuery({ type: "reporter", value: "" });
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterContentType === type && filterStatus === "전체" && !isSearchActive
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type}
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

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">유형</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">사유</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">신고자</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">피신고자</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">신고 일시</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">상태</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td className="px-6 py-10 text-center text-gray-500" colSpan={8}>불러오는 중…</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-center text-gray-500" colSpan={8}>신고 내역이 없습니다</td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.reportId} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{r.reportId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{r.reportType}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.reportReason}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleIdClick("reporter", r.reporterId)}
                        className="text-gray-600 hover:text-purple-600 hover:underline transition"
                      >
                        {r.reporterId}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleIdClick("reported", r.reportedId)}
                        className="text-gray-600 hover:text-purple-600 hover:underline transition"
                      >
                        {r.reportedId}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(r.reportedAt)}</td>
                    <td className="px-6 py-4">{getStatusBadge(r.reportStatus)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedReportId(r.reportId)}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
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

      {/* Detail Modal */}
      {selectedReportId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">신고 상세 정보</h2>
              <button
                onClick={() => { setSelectedReportId(null); setDetailReport(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {detailLoading ? (
                <div className="text-center py-10 text-gray-400">불러오는 중…</div>
              ) : detailReport ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">신고 ID</p>
                      <p className="text-lg font-bold text-gray-900">#{detailReport.reportId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">상태</p>
                      {getStatusBadge(detailReport.reportStatus)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">유형</p>
                      <p className="text-base text-gray-900">{detailReport.reportType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">사유</p>
                      <p className="text-base text-gray-900">{detailReport.reportReason}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">신고자</p>
                      <p className="text-base text-gray-900">{detailReport.reporterId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">피신고자</p>
                      <p className="text-base text-gray-900">{detailReport.reportedId}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">신고 일시</p>
                    <p className="text-base text-gray-900">{formatDateTime(detailReport.reportedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">신고 내용</p>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap">{detailReport.reportedContent}</p>
                    </div>
                  </div>
                  <div className="border-t pt-6 space-y-3">
                    <p className="text-sm font-medium text-gray-700">관리 액션(추후 API 연동)</p>
                    <button disabled className="w-full px-6 py-3 bg-gray-200 text-gray-500 rounded-lg flex items-center justify-center gap-2 font-medium cursor-not-allowed">
                      <AlertCircle size={20} />상태 변경 (API 필요)
                    </button>
                    <button disabled className="w-full px-6 py-3 bg-gray-200 text-gray-500 rounded-lg flex items-center justify-center gap-2 font-medium cursor-not-allowed">
                      <Trash2 size={20} />신고 내역 삭제 (API 필요)
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-red-400">데이터를 불러올 수 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagePage;
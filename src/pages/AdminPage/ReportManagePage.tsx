import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Clock, CheckCircle, X, Trash2 } from "lucide-react";
import { api } from "../../api/axiosInstance";

/** =========================
 *  백엔드 응답 타입 (너 코드 기준)
 *  ApiResponseDTO.success(code, data)
 * ========================= */
interface ApiResponseDTO<T> {
  status: number;
  message: string;
  data: T;
}

/** PageResponse.from1Base(dtoPage) */
interface PageResponse<T> {
  reportList?: T[]; // Swagger 예시
  items?: T[]; // 혹시 items로 내려오는 케이스 대비
  page: number; // 1-base
  size: number;
  totalPages: number; // ⚠️ 데이터 0건이면 0일 수 있음
  totalCount: number;
}

/** ReportDTO (백엔드 그대로) */
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

/** UI 상태 필터 */
type UiStatus = "전체" | "대기중" | "조사중" | "해결됨" | "반려됨";

/** enum -> 한글 라벨 매핑 (프로젝트 enum에 맞게 필요시 수정) */
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

function toUiStatus(statusRaw: string): Exclude<UiStatus, "전체"> {
  if (
    statusRaw === "대기중" ||
    statusRaw === "조사중" ||
    statusRaw === "해결됨" ||
    statusRaw === "반려됨"
  ) {
    return statusRaw;
  }
  return STATUS_KO[statusRaw] ?? "대기중";
}

function formatDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

const ReportManagePage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<UiStatus>("전체");
  const [selectedReport, setSelectedReport] = useState<ReportDTO | null>(null);

  // pagination (1-base)
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  // data
  const [reports, setReports] = useState<ReportDTO[]>([]);
  const [totalPages, setTotalPages] = useState(1); // UI용으로 최소 1 유지
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      // ⚠️ baseURL에 /api가 붙는지에 따라 아래 경로는 조정 필요
      // 백엔드: /api/admin/reports
      const res = await api.get<ApiResponseDTO<PageResponse<ReportDTO>>>(
        "/admin/reports",
        {
          params: { page, size }, // 백엔드가 page 1-base 받음
        }
      );

      const data = res.data.data;

      const list = data.reportList ?? data.items ?? [];

      // ✅ totalPages가 0으로 내려와도 UI는 최소 1로 보정
      const rawTotalPages = data.totalPages ?? 0;
      const safeTotalPages = Math.max(1, rawTotalPages);

      setReports(list);
      setTotalPages(safeTotalPages);
      setTotalCount(data.totalCount ?? 0);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        "신고 목록 조회 중 오류가 발생했습니다.";
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
  }, [page, size]);

  // ✅ totalPages 변화로 page가 범위를 벗어나면 자동 보정 (0 방지 포함)
  useEffect(() => {
    const safeTotalPages = Math.max(1, totalPages);
    if (page < 1) setPage(1);
    else if (page > safeTotalPages) setPage(safeTotalPages);
  }, [totalPages, page]);

  const filteredReports = useMemo(() => {
    if (filterStatus === "전체") return reports;
    return reports.filter((r) => toUiStatus(r.reportStatus) === filterStatus);
  }, [reports, filterStatus]);

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
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        <Icon size={14} />
        {status}
      </span>
    );
  };

  // ✅ UI에서 쓸 totalPages는 최소 1로 보정
  const safeTotalPages = Math.max(1, totalPages);

  /** 페이지 버튼(최대 5개 표시) */
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
            접수된 신고를 확인할 수 있습니다. (총{" "}
            {totalCount.toLocaleString()}건)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={size}
            onChange={(e) => {
              setPage(1);
              setSize(Number(e.target.value));
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {[10, 20, 30, 50].map((n) => (
              <option key={n} value={n}>
                {n}개씩
              </option>
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

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">상태:</span>
          <div className="flex gap-2 flex-wrap">
            {(["전체", "대기중", "조사중", "해결됨", "반려됨"] as UiStatus[]).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filterStatus === status
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              )
            )}
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  유형
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  사유
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  신고자
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  피신고자
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  신고 일시
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  작업
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-gray-500"
                    colSpan={8}
                  >
                    불러오는 중…
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-gray-500"
                    colSpan={8}
                  >
                    신고 내역이 없습니다
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.reportId} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{r.reportId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {r.reportType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {r.reportReason}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {r.reporterId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {r.reportedId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDateTime(r.reportedAt)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(r.reportStatus)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedReport(r)}
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
          <p className="text-sm text-gray-600">
            페이지 {page} / {safeTotalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="px-3 py-2 rounded-lg text-sm border disabled:opacity-40 hover:bg-gray-50"
            >
              처음
            </button>

            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-2 rounded-lg text-sm border disabled:opacity-40 hover:bg-gray-50"
            >
              이전
            </button>

            {pageButtons.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-lg text-sm border transition ${
                  p === page
                    ? "bg-purple-600 text-white border-purple-600"
                    : "hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(safeTotalPages, p + 1))}
              disabled={page >= safeTotalPages}
              className="px-3 py-2 rounded-lg text-sm border disabled:opacity-40 hover:bg-gray-50"
            >
              다음
            </button>

            <button
              onClick={() => setPage(safeTotalPages)}
              disabled={page >= safeTotalPages}
              className="px-3 py-2 rounded-lg text-sm border disabled:opacity-40 hover:bg-gray-50"
            >
              마지막
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                신고 상세 정보
              </h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">신고 ID</p>
                  <p className="text-lg font-bold text-gray-900">
                    #{selectedReport.reportId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">상태</p>
                  {getStatusBadge(selectedReport.reportStatus)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">유형</p>
                  <p className="text-base text-gray-900">
                    {selectedReport.reportType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">사유</p>
                  <p className="text-base text-gray-900">
                    {selectedReport.reportReason}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">신고자</p>
                  <p className="text-base text-gray-900">
                    {selectedReport.reporterId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">피신고자</p>
                  <p className="text-base text-gray-900">
                    {selectedReport.reportedId}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">신고 일시</p>
                <p className="text-base text-gray-900">
                  {formatDateTime(selectedReport.reportedAt)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">신고 내용</p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedReport.reportedContent}
                  </p>
                </div>
              </div>

              {/* 액션 (API 아직 없으니 비활성) */}
              <div className="border-t pt-6 space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  관리 액션(추후 API 연동)
                </p>

                <button
                  disabled
                  className="w-full px-6 py-3 bg-gray-200 text-gray-500 rounded-lg flex items-center justify-center gap-2 font-medium cursor-not-allowed"
                >
                  <AlertCircle size={20} />
                  상태 변경 (API 필요)
                </button>

                <button
                  disabled
                  className="w-full px-6 py-3 bg-gray-200 text-gray-500 rounded-lg flex items-center justify-center gap-2 font-medium cursor-not-allowed"
                >
                  <Trash2 size={20} />
                  신고 내역 삭제 (API 필요)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagePage;

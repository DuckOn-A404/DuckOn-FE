import React, { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/common/Toast";
import {
  getAdminArtistChangeRequests,
  getAdminArtistChangeRequestDetail,
  updateArtistChangeRequestStatus,
  type AdminArtistChangeRequestItem,
} from "../../api/artistChangeRequestService";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" | "APPLIED";

// Confirm Modal 타입 (기존 유지)
type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  isDanger = false,
  loading = false,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onMouseDown={handleBackdrop}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div
              className={[
                "mt-0.5 flex h-10 w-10 items-center justify-center rounded-full",
                isDanger ? "bg-red-50" : "bg-purple-50",
              ].join(" ")}
            >
              <AlertTriangle
                size={20}
                className={isDanger ? "text-red-600" : "text-purple-600"}
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              {description && (
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
            aria-label="close"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={[
                "flex-1 px-4 py-2.5 rounded-xl transition disabled:opacity-60",
                isDanger
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-purple-600 text-white hover:bg-purple-700",
              ].join(" ")}
            >
              {loading ? "처리 중..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArtistChangeRequestManagePage: React.FC = () => {
  const [requests, setRequests] = useState<AdminArtistChangeRequestItem[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AdminArtistChangeRequestItem[]>([]);
  const [currentFilter, setCurrentFilter] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(false);
  
  // 모달 상태
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [processing, setProcessing] = useState(false);

  // Toast (공통 훅 사용)
  const { toast, showToast, hideToast } = useToast();

  // Confirm Modal
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: "APPROVE" | "REJECT" | null;
  }>({
    open: false,
    title: "",
    description: "",
    action: null,
  });

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  // 데이터 로드
  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await getAdminArtistChangeRequests({
        page: currentPage,
        size: pageSize,
      });
      setRequests(response.data.items);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error("요청 목록 로드 실패:", error);
      showToast("데이터를 불러오는데 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [currentPage]);

  // 필터링
  useEffect(() => {
    if (currentFilter === "ALL") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((req) => req.status === currentFilter));
    }
  }, [currentFilter, requests]);

  // 상세보기
  const handleViewDetail = async (requestId: number) => {
    try {
      const response = await getAdminArtistChangeRequestDetail(requestId);
      setDetailData(response.data);
      setSelectedRequest(requestId);
      setShowDetailModal(true);
      setReviewComment("");
    } catch (error) {
      console.error("상세 정보 로드 실패:", error);
      showToast("상세 정보를 불러오는데 실패했습니다.", "error");
    }
  };

  // 승인/거부 처리
  const handleReview = async (action: "APPROVE" | "REJECT") => {
    if (!reviewComment.trim()) {
      showToast("검토 의견을 입력해주세요.", "error");
      return;
    }

    if (!selectedRequest) return;

    const actionText = action === "APPROVE" ? "승인" : "거부";
    
    setConfirmModal({
      open: true,
      title: `${actionText} 확인`,
      description: `이 요청을 ${actionText}하시겠습니까?`,
      action,
    });
  };

  const confirmReview = async () => {
    if (!selectedRequest || !confirmModal.action) return;

    const action = confirmModal.action;
    const actionText = action === "APPROVE" ? "승인" : "거부";

    setProcessing(true);
    try {
      await updateArtistChangeRequestStatus(selectedRequest, {
        action,
        reviewComment: reviewComment.trim(),
      });
      
      setConfirmModal({ open: false, title: "", description: "", action: null });
      showToast(`${actionText}되었습니다.`, "success");
      setShowDetailModal(false);
      loadRequests();
    } catch (error) {
      console.error("처리 실패:", error);
      showToast("처리 중 오류가 발생했습니다.", "error");
    } finally {
      setProcessing(false);
    }
  };

  // 상태 변환
  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "대기중",
      APPROVED: "승인됨",
      REJECTED: "거부됨",
      CANCELED: "취소됨",
      APPLIED: "적용됨",
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-blue-100 text-blue-800",
      REJECTED: "bg-red-100 text-red-800",
      CANCELED: "bg-gray-100 text-gray-800",
      APPLIED: "bg-green-100 text-green-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          아티스트 정보 변경 요청 관리
        </h1>
        <p className="text-gray-600">
          접수된 아티스트 정보 변경 요청을 확인하고 검토할 수 있습니다. (총 {totalElements}건)
        </p>
      </div>

      {/* 필터 */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {[
          { value: "ALL", label: "전체" },
          { value: "PENDING", label: "대기중" },
          { value: "APPROVED", label: "승인됨" },
          { value: "REJECTED", label: "거부됨" },
          { value: "CANCELED", label: "취소됨" },
          { value: "APPLIED", label: "적용됨" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setCurrentFilter(filter.value as StatusFilter)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentFilter === filter.value
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">아티스트명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">내용</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">신청일시</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">로딩 중...</td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">데이터가 없습니다.</td>
              </tr>
            ) : (
              filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">#{request.id}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      request.targetType === "ARTIST" 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-pink-100 text-pink-800"
                    }`}>
                      {request.targetType === "ARTIST" ? "아티스트" : "라이징 아티스트"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">{request.artistNameKr || "-"}</div>
                    <div className="text-gray-500 text-xs">{request.artistNameEn || "-"}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {request.content}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(request.requestedAt).toLocaleString("ko-KR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetail(request.id)}
                      className="text-purple-600 hover:text-purple-900 font-medium"
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

      {/* 페이지네이션 */}
      <div className="mt-6 flex justify-center items-center gap-2">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200"
        >
          처음
        </button>
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200"
        >
          이전
        </button>
        <span className="px-4 py-2 text-gray-700 font-medium">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200"
        >
          다음
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200"
        >
          마지막
        </button>
      </div>

      {/* 상세 모달 */}
      {showDetailModal && detailData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">변경 요청 상세</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* 요청 정보 */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">요청 정보</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">요청 ID</span>
                      <p className="font-medium mt-1">#{detailData.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">유형</span>
                      <p className="font-medium mt-1">
                        {detailData.targetType === "ARTIST" ? "아티스트" : "라이징 아티스트"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">상태</span>
                      <p className="mt-1">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(detailData.status)}`}>
                          {getStatusText(detailData.status)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">신청 일시</span>
                      <p className="font-medium mt-1">
                        {new Date(detailData.createdAt).toLocaleString("ko-KR")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 아티스트 정보 */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">아티스트 정보</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">한글명</span>
                      <p className="font-medium mt-1">{detailData.artistNameKr || "-"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">영문명</span>
                      <p className="font-medium mt-1">{detailData.artistNameEn || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* 요청 내용 */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">요청 내용</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                    {detailData.content}
                  </p>
                </div>

                {/* 첨부파일 */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">첨부파일</h3>
                  {detailData.attachment ? (
                    <a
                      href={detailData.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 text-sm underline"
                    >
                      첨부파일 보기 →
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500">첨부된 파일이 없습니다.</p>
                  )}
                </div>

                {/* 신청자 */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">신청자</h3>
                  <div className="flex items-center gap-3">
                    {detailData.requester.imgUrl && (
                      <img
                        src={detailData.requester.imgUrl}
                        alt={detailData.requester.nickname}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{detailData.requester.nickname}</p>
                      <p className="text-sm text-gray-500">{detailData.requester.userId}</p>
                    </div>
                  </div>
                </div>

                {/* 검토자 */}
                {detailData.reviewedBy && (
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-gray-900 mb-3">검토자</h3>
                    <div className="flex items-center gap-3">
                      {detailData.reviewedBy.imgUrl && (
                        <img
                          src={detailData.reviewedBy.imgUrl}
                          alt={detailData.reviewedBy.nickname}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{detailData.reviewedBy.nickname}</p>
                        <p className="text-sm text-gray-500">{detailData.reviewedBy.userId}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 상태별 안내 메시지 */}
                {detailData.status === "APPROVED" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      ✓ 이 요청은 승인되었습니다. 적용 대기 중입니다.
                    </p>
                  </div>
                )}

                {detailData.status === "REJECTED" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">
                      ✗ 이 요청은 거부되었습니다.
                    </p>
                  </div>
                )}

                {detailData.status === "CANCELED" && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-800">
                      ⓘ 사용자가 이 요청을 취소했습니다.
                    </p>
                  </div>
                )}

                {detailData.status === "APPLIED" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      ✓ 이 요청은 승인되어 적용이 완료되었습니다.
                    </p>
                  </div>
                )}

                {/* 검토 입력 (PENDING 상태일 때만) */}
                {detailData.status === "PENDING" && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">검토 의견 *</h3>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="검토 의견을 입력하세요 (필수)"
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={4}
                    />
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  닫기
                </button>
                {detailData.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleReview("REJECT")}
                      disabled={processing}
                      className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                    >
                      {processing ? "처리중..." : "거부"}
                    </button>
                    <button
                      onClick={() => handleReview("APPROVE")}
                      disabled={processing}
                      className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                    >
                      {processing ? "처리중..." : "승인"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.action === "APPROVE" ? "승인" : "거부"}
        cancelText="취소"
        isDanger={confirmModal.action === "REJECT"}
        loading={processing}
        onClose={() => setConfirmModal({ open: false, title: "", description: "", action: null })}
        onConfirm={confirmReview}
      />

      {/* Toast */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}
    </div>
  );
};

export default ArtistChangeRequestManagePage;
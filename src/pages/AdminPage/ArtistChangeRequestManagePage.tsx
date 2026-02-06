import React, { useState, useEffect } from "react";
import {
  getAdminArtistChangeRequests,
  getAdminArtistChangeRequestDetail,
  updateArtistChangeRequestStatus,
  type AdminArtistChangeRequestItem,
} from "../../api/artistChangeRequestService";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" | "APPLIED";

// 알림 모달 타입
interface AlertModal {
  show: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  onConfirm?: () => void;
}

// 확인 모달 타입
interface ConfirmModal {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

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

  // 알림 모달
  const [alertModal, setAlertModal] = useState<AlertModal>({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  // 확인 모달
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  // 알림 모달 표시
  const showAlert = (title: string, message: string, type: AlertModal["type"] = "info", onConfirm?: () => void) => {
    setAlertModal({ show: true, title, message, type, onConfirm });
  };

  // 확인 모달 표시
  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal({ ...confirmModal, show: false });
      },
      onCancel: () => {
        setConfirmModal({ ...confirmModal, show: false });
      },
    });
  };

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
      alert("데이터를 불러오는데 실패했습니다.");
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
      alert("상세 정보를 불러오는데 실패했습니다.");
    }
  };

  // 승인/거부 처리
  const handleReview = async (action: "APPROVE" | "REJECT") => {
    if (!reviewComment.trim()) {
      showAlert("입력 필요", "검토 의견을 입력해주세요.", "warning");
      return;
    }

    if (!selectedRequest) return;

    const actionText = action === "APPROVE" ? "승인" : "거부";
    
    showConfirm(
      `${actionText} 확인`,
      `이 요청을 ${actionText}하시겠습니까?`,
      async () => {
        setProcessing(true);
        try {
          await updateArtistChangeRequestStatus(selectedRequest, {
            action,
            reviewComment: reviewComment.trim(),
          });
          showAlert("완료", `${actionText}되었습니다.`, "success", () => {
            setShowDetailModal(false);
            loadRequests();
          });
        } catch (error) {
          console.error("처리 실패:", error);
          showAlert("오류", "처리 중 오류가 발생했습니다.", "error");
        } finally {
          setProcessing(false);
        }
      }
    );
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
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                {/* PENDING 상태일 때만 승인/거부 버튼 표시 */}
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
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
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

      {/* 알림 모달 */}
      {alertModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="flex flex-col items-center text-center">
              {/* 아이콘 */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                alertModal.type === "success" ? "bg-green-100" :
                alertModal.type === "error" ? "bg-red-100" :
                alertModal.type === "warning" ? "bg-yellow-100" :
                "bg-blue-100"
              }`}>
                <span className="text-3xl">
                  {alertModal.type === "success" ? "✓" :
                   alertModal.type === "error" ? "✕" :
                   alertModal.type === "warning" ? "⚠" :
                   "ⓘ"}
                </span>
              </div>
              
              {/* 제목 */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {alertModal.title}
              </h3>
              
              {/* 메시지 */}
              <p className="text-gray-600 mb-6">
                {alertModal.message}
              </p>
              
              {/* 확인 버튼 */}
              <button
                onClick={() => {
                  setAlertModal({ ...alertModal, show: false });
                  if (alertModal.onConfirm) alertModal.onConfirm();
                }}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 확인 모달 */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="flex flex-col">
              {/* 제목 */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {confirmModal.title}
              </h3>
              
              {/* 메시지 */}
              <p className="text-gray-600 mb-6">
                {confirmModal.message}
              </p>
              
              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={confirmModal.onCancel}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistChangeRequestManagePage;
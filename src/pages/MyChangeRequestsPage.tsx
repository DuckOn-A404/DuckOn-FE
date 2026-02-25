import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { getMyArtistChangeRequests, type ArtistChangeRequestItem } from "../api/artistChangeRequestService";

const MyChangeRequestsPage = () => {
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState<ArtistChangeRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;

  useEffect(() => {
    fetchRequests();
  }, [page]);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getMyArtistChangeRequests({ page, size });
      setRequests(response.data.items);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (err: any) {
      setError(err.response?.data?.message || "요청 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-semibold">
            <Clock size={14} />
            <span>대기중</span>
          </div>
        );
      case "APPROVED":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle size={14} />
            <span>승인됨</span>
          </div>
        );
      case "REJECTED":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold">
            <XCircle size={14} />
            <span>거절됨</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getTargetTypeBadge = (targetType: string) => {
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
        targetType === "EMERGING_ARTIST" 
          ? "bg-purple-100 text-purple-700" 
          : "bg-blue-100 text-blue-700"
      }`}>
        {targetType === "EMERGING_ARTIST" ? "라이징 아티스트" : "아티스트"}
      </span>
    );
  };

  if (isLoading && requests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-3 mt-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">내 수정 요청</h1>
          <p className="text-gray-600">
            아티스트 정보 수정 요청 내역을 확인하세요
            {totalElements > 0 && (
              <span className="ml-2 text-purple-600 font-semibold">
                (총 {totalElements}개)
              </span>
            )}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {!isLoading && requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              수정 요청 내역이 없습니다
            </h3>
            <p className="text-gray-500">
              아티스트 디테일 페이지에서 정보 수정을 요청할 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={20} className="text-purple-600 flex-shrink-0" />
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-bold text-gray-900">
                          {request.artistNameKr}
                          <span className="text-gray-500 font-normal ml-2 text-sm">
                            {request.artistNameEn}
                          </span>
                        </h3>
                        {getTargetTypeBadge(request.targetType)}
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                      {request.content}
                    </p>
                  </div>

                  {request.attachment && (
                    <div className="mt-3">
                      <img
                        src={request.attachment}
                        alt="첨부 이미지"
                        className="w-full max-w-xs rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        if (request.targetType === "EMERGING_ARTIST") {
                          navigate(`/rising-artist/${request.targetId}`, {
                            state: { emergingArtistId: request.targetId },
                          });
                        } else {
                          navigate(`/artist/${request.targetId}`, {
                            state: { artistId: request.targetId },
                          });
                        }
                      }}
                      className="text-sm text-purple-600 hover:text-purple-700 font-semibold hover:underline"
                    >
                      아티스트 페이지로 이동 →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="p-2 rounded-lg bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    disabled={isLoading}
                    className={`min-w-[40px] h-10 rounded-lg font-semibold transition-colors ${
                      page === pageNum
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-100 shadow"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
              className="p-2 rounded-lg bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyChangeRequestsPage;

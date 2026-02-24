import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { api } from "../../api/axiosInstance";
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/common/Toast";
import { uploadImage } from "../../utils/uploadImage";

interface Artist {
  artistId: number;
  nameKr: string;
  nameEn: string;
  debutDate: string; // "YYYY-MM-DD"
  imgUrl: string;
}

interface ApiPageData<T> {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  items: T[];
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// interface UploadResult {
//   key: string;
//   cdnUrl: string;
// }
// interface UploadResponse {
//   status: number;
//   message: string;
//   data: UploadResult;
// }

const PAGE_SIZE = 21;
const PAGE_WINDOW = 5;

//삭제 확인 모달 (alert/confirm 대체)
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
  confirmText = "삭제",
  cancelText = "취소",
  isDanger = true,
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
                isDanger ? "bg-red-50" : "bg-gray-100",
              ].join(" ")}
            >
              <AlertTriangle
                size={20}
                className={isDanger ? "text-red-600" : "text-gray-700"}
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
                  : "bg-gray-900 text-white hover:bg-gray-800",
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

const ArtistManagePage: React.FC = () => {
  /** ===== List State ===== */
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  /** 삭제 confirm 모달 상태 */
  const [deleteTarget, setDeleteTarget] = useState<Artist | null>(null);
  const [deleting, setDeleting] = useState(false);

  /** ===== Toast ===== */
  const { toast, showToast, hideToast } = useToast();

  /** ===== Create Modal State ===== */
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);

  const [nameKr, setNameKr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [debutDate, setDebutDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFileName, setImageFileName] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [editNameKr, setEditNameKr] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [editDebutDate, setEditDebutDate] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageFileName, setEditImageFileName] = useState("");

  const [editUploading, setEditUploading] = useState(false);
  const [editUploadStatusText, setEditUploadStatusText] = useState<string | null>(null);

  // const [imageFile, setImageFile] = useState<File | null>(null);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  /** ===== Fetch ===== */
  const fetchArtists = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<ApiPageData<Artist>>>(
        "/admin/artists",
        { params: { page, size: PAGE_SIZE } }
      );

      const pageData = res.data.data;
      setArtists(pageData.items ?? []);
      setTotalPages(pageData.totalPages ?? 0);
    } catch (e) {
      console.error("아티스트 조회 실패:", e);
      showToast("아티스트 목록 조회에 실패했습니다.", "error");
      setArtists([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  /** ===== Search ===== */
  const filteredArtists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return artists;
    return artists.filter((a) => {
      const kr = (a.nameKr ?? "").toLowerCase();
      const en = (a.nameEn ?? "").toLowerCase();
      return kr.includes(q) || en.includes(q);
    });
  }, [artists, searchQuery]);

  /** ===== new upload to S3 ===== */
  // const uploadArtistImage = async (file: File) => {
  //   const form = new FormData();
  //   form.append("file", file);

  //   const res = await api.post<UploadResponse>("/memes/upload-s3-only", form, {
  //     headers: { "Content-Type": "multipart/form-data" },
  //   });

  //   const cdnUrl = res.data?.data?.cdnUrl;
  //   if (!cdnUrl) throw new Error("cdnUrl not found in upload response");
  //   return cdnUrl;
  // };

  const handlePickImageFile = async (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("이미지 파일만 업로드할 수 있습니다.", "error");
      return;
    }

    setUploading(true);
    setUploadStatusText("이미지 업로드 중...");
    try {
      // const cdnUrl = await uploadArtistImage(file);
      // setImageUrl(cdnUrl);
      const { fileUrl } = await uploadImage({
        file,
        purpose: "ARTIST_IMAGE_TEMP",
        // refId: 0,
      });
      setImageUrl(fileUrl);
      setImageFileName(file.name);
      showToast("이미지가 업로드되었습니다.", "success");
    } catch (e) {
      console.error("이미지 업로드 실패:", e);
      showToast("이미지 업로드에 실패했습니다.", "error");
      setImageUrl("");
      setImageFileName("");
    } finally {
      setUploading(false);
      setUploadStatusText(null);
    }
  };

  // const handlePickImageFile = async (file: File | null) => {
  //   if (!file) return;
  
  //   if (!file.type.startsWith("image/")) {
  //     showToast("이미지 파일만 업로드할 수 있습니다.", "error");
  //     return;
  //   }
  
  //   setImageFile(file); // 파일 저장
  //   setImageUrl(URL.createObjectURL(file)); // 미리보기용 URL
  //   setImageFileName(file.name);
  // };

  const handleRemoveImage = () => {
    setImageUrl("");
    setImageFileName("");
    // setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePickEditImageFile = async (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("이미지 파일만 업로드할 수 있습니다.", "error");
      return;
    }

    setEditUploading(true);
    setEditUploadStatusText("이미지 업로드 중...");
    try {
      // const cdnUrl = await uploadArtistImage(file);
      // setEditImageUrl(cdnUrl);
      const { fileUrl } = await uploadImage({
        file,
        purpose: "ARTIST_IMAGE_TEMP",
        refId: editingArtist!.artistId, // ← 수정 시엔 id 있으니 바로 사용
      });
      setEditImageUrl(fileUrl);
      setEditImageFileName(file.name);
      showToast("이미지가 업로드되었습니다.", "success");
    } catch (e) {
      console.error("이미지 업로드 실패(수정):", e);
      showToast("이미지 업로드에 실패했습니다.", "error");
    } finally {
      setEditUploading(false);
      setEditUploadStatusText(null);
    }
  };

  const handleRemoveEditImage = () => {
    setEditImageUrl("");
    setEditImageFileName("");
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  /** ===== Create ===== */
  const handleCreateArtist = async () => {
    if (!nameKr.trim() || !nameEn.trim() || !debutDate.trim()) {
      showToast("이름(한/영), 데뷔일은 필수입니다.", "error");
      return;
    }

    if (!imageUrl.trim()) {
      showToast("이미지는 필수입니다. 이미지를 업로드해주세요.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nameKr: nameKr.trim(),
        nameEn: nameEn.trim(),
        debutDate: debutDate.trim(),
        imgUrl: imageUrl.trim(),
      };

      await api.post("/admin/artists", payload);

      showToast("아티스트가 등록되었습니다.", "success");

      setShowAddModal(false);
      setNameKr("");
      setNameEn("");
      setDebutDate("");
      setImageUrl("");
      setImageFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchArtists();
    } catch (e) {
      showToast("아티스트 등록에 실패했습니다.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // const handleCreateArtist = async () => {
  //   if (!nameKr.trim() || !nameEn.trim() || !debutDate.trim()) {
  //     showToast("이름(한/영), 데뷔일은 필수입니다.", "error");
  //     return;
  //   }
  
  //   setSubmitting(true);
  //   try {
  //     // 1) 아티스트 먼저 생성 → artistId 발급
  //     const createRes = await api.post("/admin/artists", {
  //       nameKr: nameKr.trim(),
  //       nameEn: nameEn.trim(),
  //       debutDate: debutDate.trim(),
  //     });
  
  //     const newArtistId = createRes.data.data.artistId;
  
  //     // 2) 이미지 있으면 presign → S3 업로드
  //     if (imageFile) {
  //       const { fileUrl } = await uploadImage({
  //         file: imageFile,
  //         purpose: "ARTIST_IMAGE_TEMP",
  //         refId: newArtistId, // 이제 ID 있음!
  //       });
  
  //       // 3) 이미지 URL 업데이트
  //       await api.patch(`/admin/artists/${newArtistId}`, null, {
  //         params: { imgUrl: fileUrl },
  //       });
  //     }
  
  //     showToast("아티스트가 등록되었습니다.", "success");
  //     setShowAddModal(false);
  //     setNameKr("");
  //     setNameEn("");
  //     setDebutDate("");
  //     setImageUrl("");
  //     setImageFileName("");
  //     setImageFile(null);
  //     if (fileInputRef.current) fileInputRef.current.value = "";
  //     fetchArtists();
  //   } catch (e) {
  //     showToast("아티스트 등록에 실패했습니다.", "error");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  // Delete: 모달 열기
  const openDeleteModal = (artist: Artist) => {
    setDeleteTarget(artist);
  };

  // Delete: 실제 API 호출
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await api.delete(`/admin/artists/${deleteTarget.artistId}`);

      showToast("아티스트가 삭제되었습니다.", "success");

      setArtists((prev) =>
        prev.filter((a) => a.artistId !== deleteTarget.artistId)
      );

      const remainingAfterDelete = filteredArtists.length - 1;
      setDeleteTarget(null);

      if (remainingAfterDelete <= 0 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchArtists();
      }
    } catch (e) {
      console.error("아티스트 삭제 실패:", e);
      showToast("아티스트 삭제에 실패했습니다.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (artist: Artist) => {
    setEditingArtist(artist);

    setEditNameKr(artist.nameKr ?? "");
    setEditNameEn(artist.nameEn ?? "");
    setEditDebutDate(artist.debutDate ?? "");
    setEditImageUrl(artist.imgUrl ?? "");
    setEditImageFileName("");

    setShowEditModal(true);
  };

  const handleUpdateArtist = async () => {
    if (!editingArtist) return;

    if (!editNameKr.trim() || !editNameEn.trim() || !editDebutDate.trim()) {
      showToast("이름(한/영), 데뷔일은 필수입니다.", "error");
      return;
    }

    setEditSubmitting(true);
    try {
      const params: Record<string, string> = {
        nameKr: editNameKr.trim(),
        nameEn: editNameEn.trim(),
        debutDate: editDebutDate.trim(),
      };

      if (editImageUrl.trim()) {
        params.imgUrl = editImageUrl.trim();
      }

      await api.patch(`/admin/artists/${editingArtist.artistId}`, null, {
        params,
      });

      showToast("아티스트 정보가 수정되었습니다.", "success");
      await fetchArtists();
      setShowEditModal(false);
      setEditingArtist(null);
      if (editFileInputRef.current) {
        editFileInputRef.current.value = "";
      }
    } catch (e) {
      showToast("아티스트 수정에 실패했습니다.", "error");
    } finally {
      setEditSubmitting(false);
    }
  };

  /** ===== Pagination ===== */
  const goToPage = (p: number) => {
    if (p < 1) p = 1;
    if (totalPages && p > totalPages) p = totalPages;
    setPage(p);
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () =>
    setPage((p) => {
      if (!totalPages) return p + 1;
      return Math.min(totalPages, p + 1);
    });

  const handleFirst = () => goToPage(1);
  const handleLast = () => goToPage(totalPages);

  const pagination = useMemo(() => {
    if (!totalPages || totalPages <= 0) {
      return { pages: [] as number[], showLeftDots: false, showRightDots: false };
    }

    const half = Math.floor(PAGE_WINDOW / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + PAGE_WINDOW - 1);
    start = Math.max(1, end - PAGE_WINDOW + 1);

    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);

    return {
      pages,
      showLeftDots: start > 1,
      showRightDots: end < totalPages,
    };
  }, [page, totalPages]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            아티스트 관리
          </h1>
          <p className="text-gray-600">
            아티스트 정보를 조회하고 등록/삭제할 수 있습니다
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2 font-medium shadow-lg"
        >
          <Plus size={20} />
          새 아티스트 등록
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="아티스트 이름(한/영)으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">아티스트 목록을 불러오는 중입니다...</p>
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map((artist) => (
              <div
                key={artist.artistId}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden"
              >
                {/* Artist Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                  {artist.imgUrl ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${artist.imgUrl})` }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                      🎵
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {artist.nameKr}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{artist.nameEn}</p>
                  <p className="text-xs text-gray-400 mb-4">
                    데뷔일 · {artist.debutDate}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(artist)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} />
                      수정
                    </button>

                    <button
                      onClick={() => openDeleteModal(artist)}
                      className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty */}
          {filteredArtists.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">검색 결과가 없습니다</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={handleFirst}
                disabled={page <= 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                title="처음"
              >
                <ChevronsLeft size={18} />
              </button>

              <button
                onClick={handlePrev}
                disabled={page <= 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                title="이전"
              >
                <ChevronLeft size={18} />
              </button>

              {pagination.showLeftDots && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                  >
                    1
                  </button>
                  <span className="px-2 text-gray-400">…</span>
                </>
              )}

              {pagination.pages.map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={[
                    "px-4 py-2 border rounded-lg transition text-sm",
                    p === page
                      ? "bg-purple-600 text-white border-purple-600"
                      : "border-gray-300 hover:bg-gray-50 text-gray-700",
                  ].join(" ")}
                >
                  {p}
                </button>
              ))}

              {pagination.showRightDots && (
                <>
                  <span className="px-2 text-gray-400">…</span>
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={handleNext}
                disabled={page >= totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                title="다음"
              >
                <ChevronRight size={18} />
              </button>

              <button
                onClick={handleLast}
                disabled={page >= totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                title="마지막"
              >
                <ChevronsRight size={18} />
              </button>

              <div className="ml-3 text-sm text-gray-700">
                <span className="font-semibold">{page}</span>
                <span className="text-gray-400"> / </span>
                <span>{totalPages}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Artist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              새 아티스트 등록
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름(한글) *
                </label>
                <input
                  type="text"
                  value={nameKr}
                  onChange={(e) => setNameKr(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="예) 아이들"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름(영문) *
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="예) IDLE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  데뷔일 *
                </label>
                <input
                  type="date"
                  value={debutDate}
                  onChange={(e) => setDebutDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* 개선된 이미지 업로드 UI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 *
                </label>

                {!imageUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={[
                      "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition",
                      uploading
                        ? "border-purple-300 bg-purple-50"
                        : "border-gray-300 hover:border-purple-400 hover:bg-purple-50",
                    ].join(" ")}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      disabled={uploading || submitting}
                      onChange={(e) =>
                        handlePickImageFile(e.target.files?.[0] ?? null)
                      }
                      className="hidden"
                    />

                    {uploading ? (
                      <>
                        <div className="flex justify-center mb-3">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        </div>
                        <p className="text-sm text-purple-600 font-medium">
                          {uploadStatusText}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-center mb-3">
                          <div className="p-3 bg-purple-100 rounded-full">
                            <Upload size={24} className="text-purple-600" />
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          클릭하여 이미지 업로드
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF 파일 지원
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={imageUrl}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    </div>
                    <div className="p-3 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <ImageIcon size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 truncate">
                          {imageFileName || "업로드된 이미지"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={uploading || submitting}
                        className="ml-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50 flex-shrink-0"
                      >
                        제거
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setNameKr("");
                  setNameEn("");
                  setDebutDate("");
                  setImageUrl("");
                  setImageFileName("");
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                disabled={submitting || uploading}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleCreateArtist}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
                disabled={submitting || uploading}
              >
                {submitting ? "등록 중..." : uploading ? "업로드 중..." : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Artist Modal */}
      {showEditModal && editingArtist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">아티스트 수정</h2>

              <button
                type="button"
                onClick={() => {
                  if (editSubmitting || editUploading) return;
                  setShowEditModal(false);
                  setEditingArtist(null);
                  if (editFileInputRef.current) {
                    editFileInputRef.current.value = "";
                  }
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                disabled={editSubmitting || editUploading}
                aria-label="close"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름(한글) *
                </label>
                <input
                  type="text"
                  value={editNameKr}
                  onChange={(e) => setEditNameKr(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름(영문) *
                </label>
                <input
                  type="text"
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  데뷔일 *
                </label>
                <input
                  type="date"
                  value={editDebutDate}
                  onChange={(e) => setEditDebutDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* 개선된 이미지 업로드 UI (수정) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 (선택)
                </label>

                {!editImageUrl ? (
                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    className={[
                      "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition",
                      editUploading
                        ? "border-purple-300 bg-purple-50"
                        : "border-gray-300 hover:border-purple-400 hover:bg-purple-50",
                    ].join(" ")}
                  >
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      disabled={editUploading || editSubmitting}
                      onChange={(e) =>
                        handlePickEditImageFile(e.target.files?.[0] ?? null)
                      }
                      className="hidden"
                    />

                    {editUploading ? (
                      <>
                        <div className="flex justify-center mb-3">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        </div>
                        <p className="text-sm text-purple-600 font-medium">
                          {editUploadStatusText}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-center mb-3">
                          <div className="p-3 bg-purple-100 rounded-full">
                            <Upload size={24} className="text-purple-600" />
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          클릭하여 이미지 업로드
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF 파일 지원
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={editImageUrl}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    </div>
                    <div className="p-3 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <ImageIcon size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 truncate">
                          {editImageFileName || "업로드된 이미지"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveEditImage}
                        disabled={editUploading || editSubmitting}
                        className="ml-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50 flex-shrink-0"
                      >
                        제거
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => {
                  if (editSubmitting || editUploading) return;
                  setShowEditModal(false);
                  setEditingArtist(null);
                  if (editFileInputRef.current) {
                    editFileInputRef.current.value = "";
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                disabled={editSubmitting || editUploading}
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleUpdateArtist}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
                disabled={editSubmitting || editUploading}
              >
                {editSubmitting
                  ? "저장 중..."
                  : editUploading
                  ? "업로드 중..."
                  : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="아티스트를 삭제할까요?"
        description={
          deleteTarget
            ? `"${deleteTarget.nameKr} (${deleteTarget.nameEn})" 을(를) 삭제하시겠습니까?`
            : undefined
        }
        confirmText="삭제"
        cancelText="취소"
        isDanger
        loading={deleting}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
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

export default ArtistManagePage;
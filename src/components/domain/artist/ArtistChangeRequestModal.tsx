import { useState } from "react";
import { X, Upload, AlertCircle } from "lucide-react";
import { createArtistChangeRequest, type ArtistChangeRequestCreateRequest } from "../../../api/artistChangeRequestService";
import { uploadImageToS3 } from "../../../api/risingArtistService";

interface ArtistChangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetType: "ARTIST" | "EMERGING_ARTIST";
  targetId: number;
}

const ArtistChangeRequestModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  targetType,
  targetId
}: ArtistChangeRequestModalProps) => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("이미지 크기는 5MB 이하여야 합니다.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("수정 요청 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      let attachmentUrl = "";

      if (imageFile) {
        setIsUploadingImage(true);
        attachmentUrl = await uploadImageToS3(imageFile);
        setIsUploadingImage(false);
      }

      const requestData: ArtistChangeRequestCreateRequest = {
        targetType,
        targetId,
        content: content.trim(),
        attachment: attachmentUrl || undefined,
      };

      await createArtistChangeRequest(requestData);
      
      setContent("");
      setImageFile(null);
      setImagePreview("");
      onSuccess();
      onClose();
    } catch (err: any) {
      if (isUploadingImage) {
        setError(err.response?.data?.message || "이미지 업로드에 실패했습니다.");
      } else {
        setError(err.response?.data?.message || "수정 요청에 실패했습니다.");
      }
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setContent("");
      setImageFile(null);
      setImagePreview("");
      setError("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">아티스트 정보 수정 요청</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
              수정 요청 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="수정이 필요한 내용을 상세히 작성해주세요.&#10;예: 아티스트 이름 오타 수정, 데뷔일 변경, 프로필 이미지 변경 등"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
              rows={6}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-semibold text-gray-700 mb-2">
              첨부 이미지 (선택사항)
            </label>
            <div className="flex flex-col gap-3">
              {imagePreview && (
                <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden border-2 border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <label
                htmlFor="image"
                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition ${
                  isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
              >
                <Upload className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {imageFile ? imageFile.name : "이미지 선택 (최대 5MB)"}
                </span>
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploadingImage
                ? "이미지 업로드 중..."
                : isSubmitting
                ? "요청 중..."
                : "수정 요청"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArtistChangeRequestModal;

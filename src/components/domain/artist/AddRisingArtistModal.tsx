import { useState } from "react";
import { X, Upload, AlertCircle } from "lucide-react";
import { addRisingArtist, type AddRisingArtistRequest } from "../../../api/risingArtistService";

interface AddRisingArtistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddRisingArtistModal = ({ isOpen, onClose, onSuccess }: AddRisingArtistModalProps) => {
  const [nameKr, setNameKr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [debutDate, setDebutDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    if (!nameKr.trim() || !nameEn.trim() || !debutDate) {
      setError("모든 필수 항목을 입력해주세요.");
      return;
    }

    if (!imagePreview) {
      setError("프로필 이미지를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: AddRisingArtistRequest = {
        nameKr: nameKr.trim(),
        nameEn: nameEn.trim(),
        debutDate: debutDate,
        imgUrl: imagePreview, // base64 데이터 URL 또는 이미지 URL
      };

      const response = await addRisingArtist(requestData);
      
      console.log("라이징 아티스트 등록 성공:", response);
      console.log("등록된 아티스트 ID:", response.data.emergingArtistId);
      
      setNameKr("");
      setNameEn("");
      setDebutDate("");
      setImageFile(null);
      setImagePreview("");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("라이징 아티스트 등록 실패:", err);
      setError(err.response?.data?.message || "아티스트 추가에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNameKr("");
      setNameEn("");
      setDebutDate("");
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
          <h2 className="text-2xl font-bold text-gray-900">아티스트 추가</h2>
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
            <label htmlFor="nameKr" className="block text-sm font-semibold text-gray-700 mb-2">
              한글 이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="nameKr"
              type="text"
              value={nameKr}
              onChange={(e) => setNameKr(e.target.value)}
              placeholder="예: 뉴진스"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="nameEn" className="block text-sm font-semibold text-gray-700 mb-2">
              영문 이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="nameEn"
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="예: NewJeans"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="debutDate" className="block text-sm font-semibold text-gray-700 mb-2">
              데뷔일 <span className="text-red-500">*</span>
            </label>
            <input
              id="debutDate"
              type="date"
              value={debutDate}
              onChange={(e) => setDebutDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-semibold text-gray-700 mb-2">
              프로필 이미지
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
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition cursor-pointer"
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
              {isSubmitting ? "추가 중..." : "추가하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRisingArtistModal;

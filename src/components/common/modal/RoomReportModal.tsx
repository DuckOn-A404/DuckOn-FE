// src/components/common/modal/RoomReportModal.tsx
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

type RoomReportModalProps = {
  isOpen: boolean;
  roomTitle: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

const RoomReportModal = ({
  isOpen,
  roomTitle,
  onConfirm,
  onCancel,
}: RoomReportModalProps) => {
  const [reportReason, setReportReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!reportReason.trim()) return;
    onConfirm(reportReason.trim());
    setReportReason("");
  };

  const handleCancel = () => {
    setReportReason("");
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60">
      <div className="w-11/12 max-w-md rounded-2xl bg-gray-900 shadow-2xl border border-gray-700 p-5">
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {roomTitle} 신고하기
            </h2>
            <p className="text-[11px] text-gray-400">
              부적절한 콘텐츠나 문제점이 있었다면 신고 사유를 남겨주세요.
            </p>
          </div>
        </div>

        {/* 텍스트 입력 */}
        <textarea
          className="w-full h-28 resize-none rounded-xl bg-gray-950/70 border border-gray-700 px-3 py-2 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400"
          placeholder="예) 부적절한 영상, 저작권 침해, 스팸/광고 등"
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          maxLength={500}
        />

        {/* 버튼 */}
        <div className="mt-4 flex justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-800"
          >
            닫기
          </button>
          <button
            type="button"
            disabled={!reportReason.trim()}
            onClick={handleConfirm}
            className={`px-3 py-1.5 rounded-lg font-semibold ${
              !reportReason.trim()
                ? "bg-red-500/40 text-red-100 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            신고하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomReportModal;
import { useEffect } from "react";
import { UserX } from "lucide-react";


/**
* KickedInfoModal - 강퇴된 사용자에게 알림을 표시하는 모달
*/


export type KickedInfoModalProps = {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  onConfirm?: () => void;
  onClose?: () => void;
  force?: boolean; // true면 배경/ESC로 닫기 불가
};


const KickedInfoModal = ({
  isOpen,
  title = "입장 불가",
  description = "해당 방에서 강퇴되어 입장이 불가합니다.",
  confirmText = "확인",
  onConfirm,
  onClose,
  force = false,
}: KickedInfoModalProps) => {
  useEffect(() => {
    if (!isOpen || force) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, force, onClose]);


  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60" aria-modal="true" role="dialog">
      <div
        className="absolute inset-0"
        onClick={() => !force && onClose?.()}
      />

      <div className="relative w-11/12 max-w-sm rounded-2xl bg-gray-900 shadow-2xl border border-gray-700 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
            <UserX className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2 text-xs">
          <button
            onClick={() => onConfirm?.()}
            className="px-3 py-1.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KickedInfoModal;
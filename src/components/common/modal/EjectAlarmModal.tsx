type EjectAlarmModalProps = {
  onClose?: () => void;
};

const EjectAlarmModal = ({ onClose }: EjectAlarmModalProps) => {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50"
      aria-modal
      role="dialog"
    >
      <div className="w-[360px] rounded-2xl bg-[#0f172a] shadow-xl border border-white/5 overflow-hidden">
        {/* 헤더 */}
        <div className="px-5 pt-5 pb-2 flex items-center gap-3">
          {/* 경고 아이콘 */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z" />
            </svg>
          </div>

          <h2 className="text-base font-semibold text-white">시청이 종료되었습니다.</h2>
        </div>

        {/* 본문 */}
        <div className="px-5 py-3">
          <p className="text-sm text-slate-300 leading-relaxed">
            방장에 의해 강제퇴장 처리되었습니다.
          </p>
        </div>

        {/* 버튼 */}
        <div className="px-5 py-3 flex justify-end gap-2 bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="min-w-[72px] rounded-lg bg-[#a855f7] px-4 py-2 text-sm font-medium text-white hover:bg-[#9333ea] transition"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default EjectAlarmModal;

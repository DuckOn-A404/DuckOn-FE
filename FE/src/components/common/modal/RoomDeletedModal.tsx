type RoomDeletedModalProps = {
  isOpen: boolean;
  onConfirm: () => void; // 확인 눌렀을 때 동작
};

const RoomDeletedModal = ({ isOpen, onConfirm }: RoomDeletedModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 text-white w-[360px] rounded-xl p-5 shadow-lg border border-gray-700">
        <h3 className="text-lg font-semibold">방이 삭제되었습니다.</h3>
        <p className="text-sm text-gray-300 mt-2">확인을 누르면 이전 페이지로 이동합니다.</p>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomDeletedModal;

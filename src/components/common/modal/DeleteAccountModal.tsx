type DeleteAccountModalProps = {
    isOpen: boolean;
    loading?: boolean;
    onCancel: () => void;
    onConfirm: () => void; // 실제 탈퇴 실행
};

const DeleteAccountModal = ({
    isOpen,
    loading = false,
    onCancel,
    onConfirm,
}: DeleteAccountModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 text-white w-[360px] rounded-xl p-5 shadow-lg border border-gray-700">
                <h3 className="text-lg font-semibold">정말 탈퇴하시겠어요?</h3>
                <p className="text-sm text-gray-300 mt-2">
                    계정과 관련 데이터가 삭제되며 복구할 수 없습니다.
                </p>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-60"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60"
                    >
                        {loading ? "처리 중..." : "정말 탈퇴"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountModal;

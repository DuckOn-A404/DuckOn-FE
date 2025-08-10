import { WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ConnectionErrorModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ConnectionErrorModal = ({
  isOpen,
  onClose,
}: ConnectionErrorModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoBack = () => {
    // onClose 콜백을 먼저 실행하고 이전 페이지로 이동
    onClose();
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-8 w-full max-w-md text-white text-center">
        <WifiOff className="mx-auto w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">연결 오류</h2>
        <p className="text-gray-400 mb-6">
          실시간 서버에 연결할 수 없습니다. <br />
          네트워크 상태를 확인하고 다시 시도해주세요.
        </p>

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={handleGoBack}
            className="w-full bg-purple-600 py-3 rounded-lg font-semibold transition-colors hover:bg-purple-700"
          >
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionErrorModal;

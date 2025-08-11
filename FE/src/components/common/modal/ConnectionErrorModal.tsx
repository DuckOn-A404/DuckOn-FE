import { LogIn } from "lucide-react";
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
    onClose();
    navigate("/login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-8 w-full max-w-md text-white text-center">
        <LogIn className="mx-auto w-12 h-12 text-purple-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">로그인이 필요합니다</h2>
        <p className="text-gray-400 mb-6">
          이 서비스를 이용하려면 로그인이 필요합니다. <br />
          로그인 후 다시 시도해주세요.
        </p>

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={handleGoBack}
            className="w-full bg-purple-600 py-3 rounded-lg font-semibold transition-colors hover:bg-purple-700"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionErrorModal;

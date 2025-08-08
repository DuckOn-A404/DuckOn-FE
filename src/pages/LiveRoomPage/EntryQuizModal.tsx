import { useState } from "react";
import { LockKeyhole, ArrowRight } from "lucide-react";

type EntryQuizModalProps = {
  question: string;
  onSubmit: (answer: string) => void;
  onExit: () => void;
};

const EntryQuizModal = ({
  question,
  onSubmit,
  onExit,
}: EntryQuizModalProps) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer.trim());
    }
  };

  return (
    // 전체 화면을 덮는 반투명 배경
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-8 w-full max-w-md text-white">
        <div className="text-center">
          <LockKeyhole className="mx-auto w-12 h-12 text-purple-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">입장 퀴즈</h2>
          <p className="text-gray-400 mb-6">
            방에 입장하려면 퀴즈의 정답을 맞춰야 합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-lg font-semibold text-center mb-4">
              {question}
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="정답을 입력하세요"
              className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-3 mt-6">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-purple-600 py-3 rounded-lg font-semibold transition-colors hover:bg-purple-700 disabled:bg-gray-500"
              disabled={!answer.trim()}
            >
              <span>정답 제출</span>
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              onClick={onExit}
              className="w-full py-3 rounded-lg font-semibold transition-colors text-gray-400 hover:bg-gray-700"
            >
              나가기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntryQuizModal;

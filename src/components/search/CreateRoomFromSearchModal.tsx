import {useState} from "react";
import {X, Lock, Unlock} from "lucide-react";
import {motion} from "framer-motion";
import {useNavigate} from "react-router-dom";
import {CreateRoom, enterRoom} from "../../api/roomService";

interface CreateRoomFromSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  artistId: number;
  artistName: string;
  hostId: string;
  hostNickname: string;
  videoUrls: string[]; // 여러 영상 URL
  videoTitles: string[]; // 영상 제목들
  thumbnailUrls: string[]; // 썸네일 URL들
}

const CreateRoomFromSearchModal = ({
  isOpen,
  onClose,
  artistId,
  artistName,
  hostId,
  hostNickname,
  videoUrls,
  videoTitles,
  thumbnailUrls,
}: CreateRoomFromSearchModalProps) => {
  const [roomTitle, setRoomTitle] = useState("");
  const [requirePassword, setRequirePassword] = useState(false);
  const [entryQuestion, setEntryQuestion] = useState("");
  const [entryAnswer, setEntryAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // 유효성 검사
    if (!roomTitle.trim()) {
      setError("방 제목을 입력해주세요.");
      return;
    }

    if (requirePassword && (!entryQuestion.trim() || !entryAnswer.trim())) {
      setError("비밀번호 질문과 답변을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // 첫 번째 영상으로 방 생성 (기존 API 사용)
      const firstVideoId = extractVideoId(videoUrls[0]);
      if (!firstVideoId) {
        setError("유효하지 않은 YouTube URL입니다.");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("artistId", artistId.toString());
      formData.append("title", roomTitle.trim());
      formData.append("hostId", hostId);
      formData.append("locked", requirePassword.toString());
      formData.append("videoId", firstVideoId);
      formData.append("hostNickname", hostNickname);

      // 썸네일 추가
      if (thumbnailUrls[0]) {
        const blob = await fetch(thumbnailUrls[0]).then((res) => res.blob());
        const file = new File([blob], "thumbnail.jpg", {type: blob.type});
        formData.append("thumbnailImg", file);
      }

      if (requirePassword) {
        formData.append("entryQuestion", entryQuestion.trim());
        formData.append("entryAnswer", entryAnswer.trim());
      }

      const createdRoom = await CreateRoom(formData);

      // 방 입장 시도
      try {
        await enterRoom(
          String(createdRoom.roomId),
          requirePassword ? entryAnswer : ""
        );
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 409) {
          // 이미 참여 중인 방이 있는 경우는 무시
        } else if (status === 401) {
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        }
      }

      onClose();
      navigate(`/live/${createdRoom.roomId}`, {
        state: {
          artistId,
          isHost: true,
          entryAnswer: requirePassword ? entryAnswer : undefined,
          playlist: videoUrls, // 모든 영상을 플레이리스트로 전달 (첫 영상 포함)
        },
      });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        setError("이미 생성한 방이 있습니다. 한 사용자는 동시에 하나의 방만 만들 수 있습니다.");
      } else {
        setError("방 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // YouTube URL에서 videoId 추출
  const extractVideoId = (url: string): string | null => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/
    );
    return match ? match[1] : null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{opacity: 0, scale: 0.95}}
        animate={{opacity: 1, scale: 1}}
        exit={{opacity: 0, scale: 0.95}}
        transition={{duration: 0.2}}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">방 만들기</h2>
              <p className="text-sm text-white/90 mt-1">{artistName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-5">
          {/* 선택된 영상 미리보기 */}
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-purple-900 mb-2">
              선택한 영상 {videoUrls.length}개
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {videoTitles.map((title, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <span className="line-clamp-1">{title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 방 제목 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              방 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
              placeholder="방 제목을 입력하세요"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* 비밀번호 설정 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              입장 비밀번호
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRequirePassword(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  !requirePassword
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Unlock size={18} />
                <span>공개</span>
              </button>
              <button
                type="button"
                onClick={() => setRequirePassword(true)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  requirePassword
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Lock size={18} />
                <span>비밀번호</span>
              </button>
            </div>
          </div>

          {/* 비밀번호 입력 */}
          {requirePassword && (
            <motion.div
              initial={{opacity: 0, height: 0}}
              animate={{opacity: 1, height: "auto"}}
              exit={{opacity: 0, height: 0}}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  질문 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={entryQuestion}
                  onChange={(e) => setEntryQuestion(e.target.value)}
                  placeholder="예: 좋아하는 멤버는?"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  답변 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={entryAnswer}
                  onChange={(e) => setEntryAnswer(e.target.value)}
                  placeholder="정답을 입력하세요"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </motion.div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
          >
            {isSubmitting ? "방 만드는 중..." : "방 만들기"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateRoomFromSearchModal;

import { useState, useEffect } from "react";
import { CreateRoom } from "../../../api/roomService";
import { useNavigate } from "react-router-dom";

// 다양한 YouTube URL에서 videoId를 추출하는 함수
const extractVideoId = (url: string): string | null => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
};

type CreateRoomModalProps = {
  isOpen: boolean;
  onClose: () => void;
  artistId: number;
  hostId: string;
};

const CreateRoomModal = ({ isOpen, onClose, artistId, hostId }: CreateRoomModalProps) => {
  const [title, setTitle] = useState("");
  const [locked, setLocked] = useState(false);
  const [entryQuestion, setEntryQuestion] = useState("");
  const [entryAnswer, setEntryAnswer] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const id = extractVideoId(videoUrl);
    setVideoId(id);
    if (id) {
      setThumbnailPreview(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
    } else {
      setThumbnailPreview(null);
    }
  }, [videoUrl]);

  const handleSubmit = async () => {
    if (!title || !videoUrl || !videoId || (locked && (!entryQuestion || !entryAnswer))) {
      setErrors("모든 필수 항목을 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("artistId", artistId.toString());
    formData.append("title", title);
    formData.append("hostId", hostId);
    formData.append("locked", locked.toString());
    formData.append("videoId", videoId);
    formData.append("thumbnailImg", thumbnailPreview || "");

    if (locked) {
      formData.append("entryQuestion", entryQuestion);
      formData.append("entryAnswer", entryAnswer);
    }

    try {
      const createdRoom = await CreateRoom(formData);
      alert("방이 생성되었습니다!");
      onClose();
      navigate(`/live/${createdRoom.roomId}`);
    } catch (error) {
      console.error("방 생성 실패:", error);
      alert("방 생성에 실패했습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white rounded-xl p-6 w-[500px] max-h-[90vh] overflow-y-auto shadow-lg space-y-5 relative">
        <button
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-black"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-semibold text-center">새 방 만들기</h2>

        {errors && (
          <div className="text-red-500 text-sm text-center">{errors}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">방 제목<span className="text-red-500">*</span></label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="예: BLACKPINK 신곡 함께보기"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">YouTube URL<span className="text-red-500">*</span></label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>

        {thumbnailPreview && (
          <div>
            <label className="block text-sm font-medium mb-1">썸네일 미리보기</label>
            <img
              src={thumbnailPreview}
              alt="썸네일 미리보기"
              className="w-full rounded border"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">비밀번호 설정 여부</label>
          <div className="flex gap-6 mt-1">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="locked"
                checked={locked}
                onChange={() => setLocked(true)}
              />
              예
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="locked"
                checked={!locked}
                onChange={() => setLocked(false)}
              />
              아니요
            </label>
          </div>
        </div>

        {locked && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">입장 질문<span className="text-red-500">*</span></label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="예: 1+1=?"
                value={entryQuestion}
                onChange={(e) => setEntryQuestion(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">정답<span className="text-red-500">*</span></label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="예: 2"
                value={entryAnswer}
                onChange={(e) => setEntryAnswer(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <button
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            onClick={handleSubmit}
          >
            방 만들기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
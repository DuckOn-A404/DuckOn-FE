import { useState } from "react";
import { CreateRoom } from "../../../api/roomService";
import { useNavigate } from "react-router-dom";

type CreateRoomModalProps = {
  isOpen: boolean;
  onClose: () => void;
  artistId: number;
  hostId: string;
};

const CreateRoomModal = ({
  isOpen,
  onClose,
  artistId,
  hostId,
}: CreateRoomModalProps) => {
  const [title, setTitle] = useState("");
  const [locked, setLocked] = useState(false);
  const [entryQuestion, setEntryQuestion] = useState("");
  const [entryAnswer, setEntryAnswer] = useState("");
  const [thumbnailImg, setThumbnailImg] = useState<File | null>(null);

  const navigate = useNavigate()

  const handleSubmit = async () => {
    console.log(document.cookie);  // 쿠키 인증이면
    console.log(localStorage.getItem("accessToken"));  // JWT 인증이면

    const formData = new FormData();
    formData.append("artistId", artistId.toString());
    formData.append("title", title);
    formData.append("hostId", hostId);
    if (thumbnailImg) formData.append("thumbnailImg", thumbnailImg);
    formData.append("locked", locked.toString());

    if (locked) {
      formData.append("entryQuestion", entryQuestion);
      formData.append("entryAnswer", entryAnswer);
    }

    try {
      const createdRoom = await CreateRoom(formData); // 생성된 방 응답 저장
      console.log("방 생성 응답:", createdRoom);     // 콘솔 확인용 출력

      alert("방이 생성되었습니다!");
      onClose();
      // 생성한 방으로 이동
      navigate(`/live/${createdRoom.roomId}`)
    } catch (error) {
      console.error("방 생성 실패:", error);
      alert("방 생성에 실패했습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[500px] shadow-lg space-y-5 relative">
        <button
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-black"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-semibold text-center">새 방 만들기</h2>

        {/* 방 제목 */}
        <div>
          <label className="block text-sm font-medium mb-1">방 제목</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="예: BLACKPINK 신곡 함께보기"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 잠금 여부 */}
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

        {/* 입장 질문/정답 */}
        {locked && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">입장 질문</label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="예: 1+1=?"
                value={entryQuestion}
                onChange={(e) => setEntryQuestion(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">정답</label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="예: 2"
                value={entryAnswer}
                onChange={(e) => setEntryAnswer(e.target.value)}
              />
            </div>
          </>
        )}

        {/* 썸네일 이미지 */}
        <div>
          <label className="block text-sm font-medium mb-1">썸네일 이미지</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setThumbnailImg(e.target.files ? e.target.files[0] : null)
            }
          />
        </div>

        {/* 버튼 */}
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

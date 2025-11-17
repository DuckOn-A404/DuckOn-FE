// import {useState, useEffect} from "react";
// import {CreateRoom, enterRoom} from "../../../api/roomService";
// import {useNavigate} from "react-router-dom";
// import {X} from "lucide-react";
// import {fetchYouTubeMeta} from "../../../utils/youtubeMeta";
// import axios from "axios";

// // 다양한 YouTube URL에서 videoId를 추출하는 함수
// const extractVideoId = (url: string): string | null => {
//   const match = url.match(
//     /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/
//   );
//   return match ? match[1] : null;
// };

// type CreateRoomModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   artistId: number;
//   hostId: string;
//   hostNickname: string;
// };

// const CreateRoomModal = ({
//   isOpen,
//   onClose,
//   artistId,
//   hostId,
//   hostNickname
// }: CreateRoomModalProps) => {
//   const [title, setTitle] = useState("");
//   const [locked, setLocked] = useState(false);
//   const [entryQuestion, setEntryQuestion] = useState("");
//   const [entryAnswer, setEntryAnswer] = useState("");
//   const [videoUrl, setVideoUrl] = useState("");
//   const [videoId, setVideoId] = useState<string | null>(null);
//   const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
//   const [errors, setErrors] = useState<string>("");
//   const [videoMeta, setVideoMeta] = useState<{title?: string; author?: string} | null>(null);

//   // 유튜브 검색용 상태
//   const [ytQuery, setYtQuery] = useState("");
//   const [ytResults, setYtResults] = useState<any[]>([]);
//   const [ytLoading, setYtLoading] = useState(false);
//   const [ytError, setYtError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const YT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
//   const navigate = useNavigate();

//   // 폼 전체 리셋 함수
//   const resetForm = () => {
//     setTitle("");
//     setLocked(false);
//     setEntryQuestion("");
//     setEntryAnswer("");
//     setVideoUrl("");
//     setVideoId(null);
//     setThumbnailPreview(null);
//     setErrors("");
//     setVideoMeta(null);

//     // 검색 부분도 같이 초기화
//     setYtQuery("");
//     setYtResults([]);
//     setYtLoading(false);
//     setYtError("");
//   };

//   // 모달이 열릴 때마다 깔끔하게 초기화
//   useEffect(() => {
//     if (isOpen) {
//       resetForm();
//     }
//   }, [isOpen]);

//   // URL에서 videoId 추출 + 썸네일/메타 로딩
//   useEffect(() => {
//     const id = extractVideoId(videoUrl);
//     setVideoId(id);
//     if (id) {
//       setThumbnailPreview(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
//       fetchYouTubeMeta(id).then((m) => m && setVideoMeta({title: m.title, author: m.author}));
//     } else {
//       setThumbnailPreview(null);
//       setVideoMeta(null);
//     }
//   }, [videoUrl]);

//   // 유튜브 검색 호출
//   const handleYouTubeSearch = async () => {
//     if (!ytQuery.trim()) return;
//     if (!YT_API_KEY) {
//       setYtError("YouTube API 키가 설정되지 않았습니다.");
//       return;
//     }
//     setYtLoading(true);
//     setYtError("");
//     try {
//       const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
//         params: {
//           key: YT_API_KEY,
//           part: "snippet",
//           q: ytQuery,
//           type: "video",
//           maxResults: 12
//         }
//       });
//       setYtResults(res.data.items || []);
//     } catch (err) {
//       console.error(err);
//       setYtError("유튜브 검색 중 오류가 발생했어요.");
//     } finally {
//       setYtLoading(false);
//     }
//   };

//   // 검색 결과 클릭 시 비디오 URL 자동 주입
//   const handleSelectYouTube = (item: any) => {
//     const id = item.id?.videoId;
//     if (!id) return;
//     setVideoUrl(`https://www.youtube.com/watch?v=${id}`);
//     // 선택 후 목록 접기
//     setYtResults([]);
//   };

//   const handleSubmit = async () => {
//     if (isSubmitting) return;

//     if (
//       !title ||
//       !videoUrl ||
//       !videoId ||
//       (locked && (!entryQuestion || !entryAnswer))
//     ) {
//       setErrors("모든 필수 항목을 입력해주세요.");
//       return;
//     }

//     setIsSubmitting(true);

//     const formData = new FormData();
//     formData.append("artistId", artistId.toString());
//     formData.append("title", title);
//     formData.append("hostId", hostId);
//     formData.append("locked", locked.toString());
//     formData.append("videoId", videoId);
//     formData.append("hostNickname", hostNickname);

//     if (thumbnailPreview) {
//       const blob = await fetch(thumbnailPreview).then((res) => res.blob());
//       const file = new File([blob], "thumbnail.jpg", {type: blob.type});
//       formData.append("thumbnailImg", file);
//     }

//     if (locked) {
//       formData.append("entryQuestion", entryQuestion);
//       formData.append("entryAnswer", entryAnswer);
//     }

//     try {
//       const createdRoom = await CreateRoom(formData);
//       try {
//         await enterRoom(String(createdRoom.roomId), locked ? entryAnswer : "");
//       } catch (err: any) {
//         const status = err?.response?.status;
//         if (status === 409) {
//           // 무시
//         } else if (status === 401) {
//           alert("로그인이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.");
//         }
//       }

//       // 성공했으면 닫기 전에 폼 한번 청소
//       resetForm();
//       onClose();
//       navigate(`/live/${createdRoom.roomId}`, {
//         state: {
//           artistId,
//           isHost: true,
//           entryAnswer: locked ? entryAnswer : undefined
//         }
//       });
//     } catch (err: any) {
//       const status = err?.response?.status;
//       if (status === 429) {
//         setErrors("이미 생성한 방이 있어요. 한 사용자는 동시에 하나의 방만 만들 수 있습니다.");
//       } else {
//         setErrors("방 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // 취소 버튼 눌렀을 때도 리셋 + 닫기
//   const handleCancel = () => {
//     resetForm();
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto">
//       <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
//         {/* 헤더 */}
//         <div className="flex justify-between items-center p-5 border-b border-gray-200">
//           <h2 className="text-xl font-semibold">새 방 만들기</h2>
//           <button
//             className="text-gray-400 hover:text-gray-800"
//             onClick={handleCancel}
//           >
//             <X size={24} />
//           </button>
//         </div>

//         {/* 본문 */}
//         <div className="flex-1 overflow-y-auto p-6 space-y-5">
//           <div>
//             <label className="block text-sm font-medium mb-1">
//               방 제목<span className="text-red-500">*</span>
//             </label>
//             <input
//               className="w-full border rounded px-3 py-2"
//               placeholder="방 제목을 입력해주세요"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//             />
//           </div>

//           {/* YouTube 검색 */}
//           <div>
//             <label className="block text-sm font-medium mb-1">
//               YouTube에서 검색
//             </label>
//             <div className="flex gap-2 mb-2">
//               <input
//                 className="flex-1 border rounded px-3 py-2 text-sm"
//                 placeholder="예: 블랙핑크"
//                 value={ytQuery}
//                 onChange={(e) => setYtQuery(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && handleYouTubeSearch()}
//               />
//               <button
//                 type="button"
//                 onClick={handleYouTubeSearch}
//                 className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-sm"
//               >
//                 검색
//               </button>
//             </div>
//             {ytError && <p className="text-xs text-red-500 mb-1">{ytError}</p>}
//             {ytLoading && <p className="text-xs text-gray-400 mb-1">검색 중...</p>}

//             {ytResults.length > 0 && (
//               <div className="grid grid-cols-2 gap-3 max-h-[340px] overflow-y-auto mb-2">
//                 {ytResults.map((item) => {
//                   const snippet = item.snippet;
//                   const thumb = snippet.thumbnails?.medium?.url;
//                   return (
//                     <button
//                       key={item.id.videoId}
//                       type="button"
//                       onClick={() => handleSelectYouTube(item)}
//                       className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-sky-400 flex flex-col"
//                     >
//                       <div className="relative w-full aspect-video bg-gray-200 overflow-hidden">
//                         {thumb && (
//                           <img
//                             src={thumb}
//                             alt={snippet.title}
//                             className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
//                           />
//                         )}
//                         <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-[10px] text-white rounded">
//                           {snippet.channelTitle}
//                         </span>
//                       </div>
//                       <div className="p-2 flex-1 flex flex-col gap-1">
//                         <p className="text-[11px] font-semibold leading-snug line-clamp-2">
//                           {snippet.title}
//                         </p>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* YouTube URL 직접 입력 */}
//           <div>
//             <label className="block text-sm font-medium mb-1">
//               YouTube URL<span className="text-red-500">*</span>
//             </label>
//             <input
//               className="w-full border rounded px-3 py-2"
//               placeholder="유튜브 링크를 입력해주세요"
//               value={videoUrl}
//               onChange={(e) => setVideoUrl(e.target.value)}
//             />
//             <p className="text-[10px] text-gray-400 mt-1">
//               유튜브 링크를 직접 입력하거나 위의 검색창에서 검색 후 동영상을 선택하면 이 칸에 자동으로 채워집니다.
//             </p>
//           </div>

//           {thumbnailPreview && (
//             <div className="aspect-[16/9] bg-black rounded-lg overflow-hidden shadow-lg">
//               <img
//                 src={thumbnailPreview}
//                 alt="썸네일 미리보기"
//                 className="w-full h-full object-cover"
//               />
//             </div>
//           )}

//           {videoMeta && (videoMeta.title || videoMeta.author) && (
//             <div className="mt-2 text-sm text-gray-800">
//               <div className="font-semibold truncate">{videoMeta.title || "제목 로딩 중..."}</div>
//               <div className="text-gray-600 truncate">{videoMeta.author || "채널 로딩 중..."}</div>
//             </div>
//           )}

//           {/* 잠금 설정 */}
//           <div>
//             <label className="block text-sm font-medium mb-1">
//               비밀번호 설정 여부
//             </label>
//             <div className="flex gap-6 mt-1">
//               <label className="flex items-center gap-1">
//                 <input
//                   type="radio"
//                   name="locked"
//                   checked={locked}
//                   onChange={() => setLocked(true)}
//                 />
//                 예
//               </label>
//               <label className="flex items-center gap-1">
//                 <input
//                   type="radio"
//                   name="locked"
//                   checked={!locked}
//                   onChange={() => setLocked(false)}
//                 />
//                 아니요
//               </label>
//             </div>
//           </div>

//           {locked && (
//             <>
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   입장 질문<span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   className="w-full border rounded px-3 py-2"
//                   placeholder="1+1=?"
//                   value={entryQuestion}
//                   onChange={(e) => setEntryQuestion(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   정답<span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   className="w-full border rounded px-3 py-2"
//                   placeholder="2"
//                   value={entryAnswer}
//                   onChange={(e) => setEntryAnswer(e.target.value)}
//                 />
//               </div>
//             </>
//           )}
//         </div>

//         {/* 푸터 */}
//         <div className="p-5 border-t border-gray-200 flex flex-col gap-3">
//           {errors && (
//             <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium text-center">
//               {errors}
//             </div>
//           )}
//           <div className="flex justify-end gap-3">
//             <button
//               className="px-5 py-2.5 border rounded-lg text-gray-700 hover:bg-gray-100 font-semibold transition"
//               onClick={handleCancel}
//             >
//               취소
//             </button>
//             <button
//               className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
//               onClick={handleSubmit}
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? "방 만드는 중..." : "방 만들기"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateRoomModal;


import { useState, useEffect } from "react";
import { CreateRoom, enterRoom } from "../../../api/roomService";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { fetchYouTubeMeta } from "../../../utils/youtubeMeta";
import { api } from "../../../api/axiosInstance";

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
  hostNickname: string;
};

// 백엔드 YoutubeSearchResponseDTO.items 에 맞춘 타입
type YtSearchItem = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
};

const CreateRoomModal = ({
  isOpen,
  onClose,
  artistId,
  hostId,
  hostNickname,
}: CreateRoomModalProps) => {
  const [title, setTitle] = useState("");
  const [locked, setLocked] = useState(false);
  const [entryQuestion, setEntryQuestion] = useState("");
  const [entryAnswer, setEntryAnswer] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<string>("");
  const [videoMeta, setVideoMeta] = useState<{ title?: string; author?: string } | null>(null);

  // 유튜브 검색용 상태
  const [ytQuery, setYtQuery] = useState("");
  const [ytResults, setYtResults] = useState<YtSearchItem[]>([]);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // 폼 전체 리셋 함수
  const resetForm = () => {
    setTitle("");
    setLocked(false);
    setEntryQuestion("");
    setEntryAnswer("");
    setVideoUrl("");
    setVideoId(null);
    setThumbnailPreview(null);
    setErrors("");
    setVideoMeta(null);

    // 검색 부분도 같이 초기화
    setYtQuery("");
    setYtResults([]);
    setYtLoading(false);
    setYtError("");
  };

  // 모달이 열릴 때마다 깔끔하게 초기화
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // URL에서 videoId 추출 + 썸네일/메타 로딩
  useEffect(() => {
    const id = extractVideoId(videoUrl);
    setVideoId(id);
    if (id) {
      setThumbnailPreview(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
      fetchYouTubeMeta(id).then(
        (m) => m && setVideoMeta({ title: m.title, author: m.author })
      );
    } else {
      setThumbnailPreview(null);
      setVideoMeta(null);
    }
  }, [videoUrl]);

  // 유튜브 검색 호출 (백엔드 프록시 사용)
  const handleYouTubeSearch = async () => {
    if (!ytQuery.trim()) return;

    setYtLoading(true);
    setYtError("");
    try {
      const res = await api.get("/public/youtube/search", {
        params: {
          query: ytQuery,
          maxResults: 12,
        },
      });

      // 응답 형태: { items: YtSearchItem[] }
      setYtResults(res.data.items || []);
    } catch (err) {
      console.error(err);
      setYtError("유튜브 검색 중 오류가 발생했어요.");
    } finally {
      setYtLoading(false);
    }
  };

  // 검색 결과 클릭 시 비디오 URL 자동 주입
  const handleSelectYouTube = (item: YtSearchItem) => {
    if (!item.videoId) return;
    setVideoUrl(`https://www.youtube.com/watch?v=${item.videoId}`);
    // 선택 후 목록 접기
    setYtResults([]);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (
      !title ||
      !videoUrl ||
      !videoId ||
      (locked && (!entryQuestion || !entryAnswer))
    ) {
      setErrors("모든 필수 항목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("artistId", artistId.toString());
    formData.append("title", title);
    formData.append("hostId", hostId);
    formData.append("locked", locked.toString());
    formData.append("videoId", videoId);
    formData.append("hostNickname", hostNickname);

    if (thumbnailPreview) {
      const blob = await fetch(thumbnailPreview).then((res) => res.blob());
      const file = new File([blob], "thumbnail.jpg", { type: blob.type });
      formData.append("thumbnailImg", file);
    }

    if (locked) {
      formData.append("entryQuestion", entryQuestion);
      formData.append("entryAnswer", entryAnswer);
    }

    try {
      const createdRoom = await CreateRoom(formData);
      try {
        await enterRoom(String(createdRoom.roomId), locked ? entryAnswer : "");
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 409) {
          // 이미 참여 중인 방이 있는 경우는 무시
        } else if (status === 401) {
          alert("로그인이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.");
        }
      }

      // 성공했으면 닫기 전에 폼 한번 청소
      resetForm();
      onClose();
      navigate(`/live/${createdRoom.roomId}`, {
        state: {
          artistId,
          isHost: true,
          entryAnswer: locked ? entryAnswer : undefined,
        },
      });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        setErrors(
          "이미 생성한 방이 있어요. 한 사용자는 동시에 하나의 방만 만들 수 있습니다."
        );
      } else {
        setErrors("방 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소 버튼 눌렀을 때도 리셋 + 닫기
  const handleCancel = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold">새 방 만들기</h2>
          <button
            className="text-gray-400 hover:text-gray-800"
            onClick={handleCancel}
          >
            <X size={24} />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              방 제목<span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="방 제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* YouTube 검색 */}
          <div>
            <label className="block text-sm font-medium mb-1">
              YouTube에서 검색
            </label>
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 border rounded px-3 py-2 text-sm"
                placeholder="예: 블랙핑크"
                value={ytQuery}
                onChange={(e) => setYtQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleYouTubeSearch()}
              />
              <button
                type="button"
                onClick={handleYouTubeSearch}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-sm"
              >
                검색
              </button>
            </div>
            {ytError && (
              <p className="text-xs text-red-500 mb-1">{ytError}</p>
            )}
            {ytLoading && (
              <p className="text-xs text-gray-400 mb-1">검색 중...</p>
            )}

            {ytResults.length > 0 && (
              <div className="grid grid-cols-2 gap-3 max-h-[340px] overflow-y-auto mb-2">
                {ytResults.map((item) => (
                  <button
                    key={item.videoId}
                    type="button"
                    onClick={() => handleSelectYouTube(item)}
                    className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-sky-400 flex flex-col"
                  >
                    <div className="relative w-full aspect-video bg-gray-200 overflow-hidden">
                      {item.thumbnailUrl && (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                        />
                      )}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-[10px] text-white rounded">
                        {item.channelTitle}
                      </span>
                    </div>
                    <div className="p-2 flex-1 flex flex-col gap-1">
                      <p className="text-[11px] font-semibold leading-snug line-clamp-2">
                        {item.title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* YouTube URL 직접 입력 */}
          <div>
            <label className="block text-sm font-medium mb-1">
              YouTube URL<span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="유튜브 링크를 입력해주세요"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <p className="text-[10px] text-gray-400 mt-1">
              유튜브 링크를 직접 입력하거나 위의 검색창에서 검색 후 동영상을 선택하면 이 칸에 자동으로 채워집니다.
            </p>
          </div>

          {thumbnailPreview && (
            <div className="aspect-[16/9] bg-black rounded-lg overflow-hidden shadow-lg">
              <img
                src={thumbnailPreview}
                alt="썸네일 미리보기"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {videoMeta && (videoMeta.title || videoMeta.author) && (
            <div className="mt-2 text-sm text-gray-800">
              <div className="font-semibold truncate">
                {videoMeta.title || "제목 로딩 중..."}
              </div>
              <div className="text-gray-600 truncate">
                {videoMeta.author || "채널 로딩 중..."}
              </div>
            </div>
          )}

          {/* 잠금 설정 */}
          <div>
            <label className="block text-sm font-medium mb-1">
              비밀번호 설정 여부
            </label>
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
                <label className="block text-sm font-medium mb-1">
                  입장 질문<span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="1+1=?"
                  value={entryQuestion}
                  onChange={(e) => setEntryQuestion(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  정답<span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="2"
                  value={entryAnswer}
                  onChange={(e) => setEntryAnswer(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-5 border-t border-gray-200 flex flex-col gap-3">
          {errors && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium text-center">
              {errors}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              className="px-5 py-2.5 border rounded-lg text-gray-700 hover:bg-gray-100 font-semibold transition"
              onClick={handleCancel}
            >
              취소
            </button>
            <button
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "방 만드는 중..." : "방 만들기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;

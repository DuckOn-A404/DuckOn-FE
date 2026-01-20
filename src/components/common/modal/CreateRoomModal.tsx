// import { useState, useEffect } from "react";
// import { CreateRoom, enterRoom } from "../../../api/roomService";
// import { useNavigate } from "react-router-dom";
// import { X } from "lucide-react";
// import { fetchYouTubeMeta } from "../../../utils/youtubeMeta";
// import { api } from "../../../api/axiosInstance";

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

// // 백엔드 YoutubeSearchResponseDTO.items 에 맞춘 타입
// type YtSearchItem = {
//   videoId: string;
//   title: string;
//   channelTitle: string;
//   thumbnailUrl: string;
// };

// const CreateRoomModal = ({
//   isOpen,
//   onClose,
//   artistId,
//   hostId,
//   hostNickname,
// }: CreateRoomModalProps) => {
//   const [title, setTitle] = useState("");
//   const [locked, setLocked] = useState(false);
//   const [entryQuestion, setEntryQuestion] = useState("");
//   const [entryAnswer, setEntryAnswer] = useState("");
//   const [videoUrl, setVideoUrl] = useState("");
//   const [videoId, setVideoId] = useState<string | null>(null);
//   const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
//   const [errors, setErrors] = useState<string>("");
//   const [videoMeta, setVideoMeta] = useState<{ title?: string; author?: string } | null>(null);

//   // 유튜브 검색용 상태
//   const [ytQuery, setYtQuery] = useState("");
//   const [ytResults, setYtResults] = useState<YtSearchItem[]>([]);
//   const [ytLoading, setYtLoading] = useState(false);
//   const [ytError, setYtError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

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
//       fetchYouTubeMeta(id).then(
//         (m) => m && setVideoMeta({ title: m.title, author: m.author })
//       );
//     } else {
//       setThumbnailPreview(null);
//       setVideoMeta(null);
//     }
//   }, [videoUrl]);

//   // 유튜브 검색 호출 (백엔드 프록시 사용)
//   const handleYouTubeSearch = async () => {
//     if (!ytQuery.trim()) return;

//     setYtLoading(true);
//     setYtError("");
//     try {
//       const res = await api.get("/public/youtube/search", {
//         params: {
//           query: ytQuery,
//           maxResults: 12,
//         },
//       });

//       // 응답 형태: { items: YtSearchItem[] }
//       setYtResults(res.data.items || []);
//     } catch (err) {
//       console.error(err);
//       setYtError("유튜브 검색 중 오류가 발생했어요.");
//     } finally {
//       setYtLoading(false);
//     }
//   };

//   // 검색 결과 클릭 시 비디오 URL 자동 주입
//   const handleSelectYouTube = (item: YtSearchItem) => {
//     if (!item.videoId) return;
//     setVideoUrl(`https://www.youtube.com/watch?v=${item.videoId}`);
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
//       const file = new File([blob], "thumbnail.jpg", { type: blob.type });
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
//           // 이미 참여 중인 방이 있는 경우는 무시
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
//           entryAnswer: locked ? entryAnswer : undefined,
//         },
//       });
//     } catch (err: any) {
//       const status = err?.response?.status;
//       if (status === 429) {
//         setErrors(
//           "이미 생성한 방이 있어요. 한 사용자는 동시에 하나의 방만 만들 수 있습니다."
//         );
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
//             {ytError && (
//               <p className="text-xs text-red-500 mb-1">{ytError}</p>
//             )}
//             {ytLoading && (
//               <p className="text-xs text-gray-400 mb-1">검색 중...</p>
//             )}

//             {ytResults.length > 0 && (
//               <div className="grid grid-cols-2 gap-3 max-h-[340px] overflow-y-auto mb-2">
//                 {ytResults.map((item) => (
//                   <button
//                     key={item.videoId}
//                     type="button"
//                     onClick={() => handleSelectYouTube(item)}
//                     className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-sky-400 flex flex-col"
//                   >
//                     <div className="relative w-full aspect-video bg-gray-200 overflow-hidden">
//                       {item.thumbnailUrl && (
//                         <img
//                           src={item.thumbnailUrl}
//                           alt={item.title}
//                           className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
//                         />
//                       )}
//                       <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-[10px] text-white rounded">
//                         {item.channelTitle}
//                       </span>
//                     </div>
//                     <div className="p-2 flex-1 flex flex-col gap-1">
//                       <p className="text-[11px] font-semibold leading-snug line-clamp-2">
//                         {item.title}
//                       </p>
//                     </div>
//                   </button>
//                 ))}
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
//               <div className="font-semibold truncate">
//                 {videoMeta.title || "제목 로딩 중..."}
//               </div>
//               <div className="text-gray-600 truncate">
//                 {videoMeta.author || "채널 로딩 중..."}
//               </div>
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

import {useState, useMemo, useEffect} from "react";
import {CreateRoom, enterRoom} from "../../../api/roomService";
import {useNavigate} from "react-router-dom";
import {X, Lock, Unlock} from "lucide-react";
import {motion} from "framer-motion";
import {fetchYouTubeMeta} from "../../../utils/youtubeMeta";
import {api} from "../../../api/axiosInstance";
import {useUiTranslate} from "../../../hooks/useUiTranslate";
import {decodeHtmlEntities} from "../../../utils/decodeHtml";

// 다양한 YouTube URL에서 videoId를 추출하는 함수
const extractVideoId = (input: string): string | null => {
  const raw = (input || "").trim();
  if (!raw) return null;

  // videoId(11자리)만 입력한 경우도 허용
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;

  let url: URL;
  try {
    // "youtube.com/..." 처럼 프로토콜 없는 입력도 대비
    url = raw.startsWith("http") ? new URL(raw) : new URL(`https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  // 1) https://youtu.be/VIDEOID?si=...
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  }

  // 2) youtube.com / m.youtube.com
  if (host === "youtube.com" || host === "m.youtube.com") {
    // watch?v=VIDEOID&...
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

    // /live/VIDEOID?si=...
    // /shorts/VIDEOID?...
    // /embed/VIDEOID?...
    // /v/VIDEOID
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) =>
      ["live", "shorts", "embed", "v"].includes(p),
    );
    if (idx !== -1) {
      const id = parts[idx + 1];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }
  }

  return null;
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
  const [, setVideoId] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<string>("");

  const [videoUrlError, setVideoUrlError] = useState<string>("");

  const [videoMeta, setVideoMeta] =
    useState<{title?: string; author?: string} | null>(null);

  // 유튜브 검색용 상태
  const [ytQuery, setYtQuery] = useState("");
  const [ytResults, setYtResults] = useState<YtSearchItem[]>([]);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const {t} = useUiTranslate();

  // 무한 렌더링 방지:
  // t 함수 자체를 useEffect deps에 넣으면 (t가 매 렌더마다 새로 생성되는 경우)
  // effect가 무한 재실행될 수 있으므로, 메시지 문자열을 memo로 분리
  const invalidLinkMsg = useMemo(
    () => t("createRoom.error.invalidLink", "유효하지 않은 링크입니다."),
    [t],
  );

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

    setVideoUrlError("");
  };

  // 모달이 열릴 때마다 깔끔하게 초기화
  useEffect(() => {
    if (isOpen) {
      resetForm();

      // localStorage에서 tempVideoUrl 확인하고 자동으로 채우기
      const tempUrl = localStorage.getItem("tempVideoUrl");
      if (tempUrl) {
        setVideoUrl(tempUrl);
        localStorage.removeItem("tempVideoUrl");
      }
    }
  }, [isOpen]);

  // URL에서 videoId 추출 + 썸네일/메타 로딩
  useEffect(() => {
    const raw = videoUrl.trim();
    const id = extractVideoId(raw);
    setVideoId(id);

    if (raw && !id) {
      setVideoUrlError(invalidLinkMsg);
    } else {
      setVideoUrlError("");
    }

    if (id) {
      setThumbnailPreview(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);

      let cancelled = false;
      fetchYouTubeMeta(id)
        .then((m) => {
          if (cancelled) return;
          if (m) setVideoMeta({title: m.title, author: m.author});
          else setVideoMeta(null);
        })
        .catch(() => {
          if (!cancelled) setVideoMeta(null);
        });

      return () => {
        cancelled = true;
      };
    } else {
      setThumbnailPreview(null);
      setVideoMeta(null);
    }
  }, [videoUrl, invalidLinkMsg]); // t 제거, memo된 문자열만 deps로

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

      // HTML entities를 디코딩하여 저장
      const decodedResults = (res.data.items || []).map((item: YtSearchItem) => ({
        ...item,
        title: decodeHtmlEntities(item.title),
        channelTitle: decodeHtmlEntities(item.channelTitle),
      }));

      setYtResults(decodedResults);
    } catch (err) {
      console.error(err);
      setYtError(
        t(
          "createRoom.youtube.search.error",
          "유튜브 검색 중 오류가 발생했어요.",
        ),
      );
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

    // 필수 입력값 체크 (링크 유효성은 별도로)
    if (!title.trim()) {
      setErrors(t("createRoom.error.required", "모든 필수 항목을 입력해주세요."));
      return;
    }
    if (locked && (!entryQuestion.trim() || !entryAnswer.trim())) {
      setErrors(t("createRoom.error.required", "모든 필수 항목을 입력해주세요."));
      return;
    }
    if (!videoUrl.trim()) {
      setErrors(t("createRoom.error.required", "모든 필수 항목을 입력해주세요."));
      return;
    }

    // submit 시점에도 한 번 더 추출 (state 반영 지연 대비)
    const id = extractVideoId(videoUrl);
    if (!id) {
      setErrors(t("createRoom.error.invalidLink", "유효하지 않은 링크입니다."));
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("artistId", artistId.toString());
    formData.append("title", title);
    formData.append("hostId", hostId);
    formData.append("locked", locked.toString());
    formData.append("videoId", id);
    formData.append("hostNickname", hostNickname);

    if (thumbnailPreview) {
      const blob = await fetch(thumbnailPreview).then((res) => res.blob());
      const file = new File([blob], "thumbnail.jpg", {type: blob.type});
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
          alert(
            "로그인이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.",
          );
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
          t(
            "createRoom.error.roomLimit",
            "이미 생성한 방이 있어요. 한 사용자는 동시에 하나의 방만 만들 수 있습니다.",
          ),
        );
      } else {
        setErrors(
          t(
            "createRoom.error.generic",
            "방 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
          ),
        );
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{opacity: 0, scale: 0.95}}
        animate={{opacity: 1, scale: 1}}
        exit={{opacity: 0, scale: 0.95}}
        transition={{duration: 0.2}}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {t("createRoom.title", "방 만들기")}
            </h2>
            <button
              onClick={handleCancel}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 방 제목 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("createRoom.field.title.label", "방 제목")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t(
                "createRoom.field.title.placeholder",
                "방 제목을 입력하세요",
              )}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* YouTube 검색 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("createRoom.youtube.search.label", "YouTube에서 검색")}
            </label>
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-sm"
                placeholder={t(
                  "createRoom.youtube.search.placeholder",
                  "예: 블랙핑크",
                )}
                value={ytQuery}
                onChange={(e) => setYtQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleYouTubeSearch()}
              />
              <button
                type="button"
                onClick={handleYouTubeSearch}
                className="px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold text-sm transition-colors shadow-sm"
              >
                {t("createRoom.youtube.search.button", "검색")}
              </button>
            </div>
            {ytError && (
              <p className="text-xs text-red-500 mb-1">{ytError}</p>
            )}
            {ytLoading && (
              <p className="text-xs text-gray-400 mb-1">
                {t("createRoom.youtube.search.loading", "검색 중...")}
              </p>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("createRoom.youtube.url.label", "YouTube URL")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              placeholder={t(
                "createRoom.youtube.url.placeholder",
                "유튜브 링크를 입력해주세요",
              )}
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {t(
                "createRoom.youtube.url.helper",
                "유튜브 링크를 직접 입력하거나 위의 검색창에서 검색 후 동영상을 선택하면 이 칸에 자동으로 채워집니다.",
              )}
            </p>

            {/* 입력 즉시 유효성 안내 */}
            {videoUrlError && (
              <p className="mt-1 text-xs text-red-500">{videoUrlError}</p>
            )}
          </div>

          {thumbnailPreview && (
            <div className="aspect-[16/9] bg-black rounded-lg overflow-hidden shadow-lg">
              <img
                src={thumbnailPreview}
                alt={t("createRoom.thumbnail.alt", "썸네일 미리보기")}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {videoMeta && (videoMeta.title || videoMeta.author) && (
            <div className="mt-2 text-sm text-gray-800">
              <div className="font-semibold truncate">
                {videoMeta.title ||
                  t("createRoom.meta.title.loading", "제목 로딩 중...")}
              </div>
              <div className="text-gray-600 truncate">
                {videoMeta.author ||
                  t("createRoom.meta.author.loading", "채널 로딩 중...")}
              </div>
            </div>
          )}

          {/* 비밀번호 설정 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t("createRoom.lock.label", "입장 비밀번호")}
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLocked(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${!locked
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                <Unlock size={18} />
                <span>{t("createRoom.lock.public", "공개")}</span>
              </button>
              <button
                type="button"
                onClick={() => setLocked(true)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${locked
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                <Lock size={18} />
                <span>{t("createRoom.lock.password", "비밀번호")}</span>
              </button>
            </div>
          </div>

          {/* 비밀번호 입력 */}
          {locked && (
            <motion.div
              initial={{opacity: 0, height: 0}}
              animate={{opacity: 1, height: "auto"}}
              exit={{opacity: 0, height: 0}}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("createRoom.entryQuestion.label", "질문")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={entryQuestion}
                  onChange={(e) => setEntryQuestion(e.target.value)}
                  placeholder={t(
                    "createRoom.entryQuestion.placeholder",
                    "예: 좋아하는 멤버는?",
                  )}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("createRoom.entryAnswer.label", "답변")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={entryAnswer}
                  onChange={(e) => setEntryAnswer(e.target.value)}
                  placeholder={t(
                    "createRoom.entryAnswer.placeholder",
                    "정답을 입력하세요",
                  )}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* 에러 메시지 */}
        {errors && (
          <div className="px-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errors}
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="flex-1 px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            {t("createRoom.cancel", "취소")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
          >
            {isSubmitting
              ? t("createRoom.submit.creating", "방 만드는 중...")
              : t("createRoom.submit.default", "방 만들기")}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateRoomModal;

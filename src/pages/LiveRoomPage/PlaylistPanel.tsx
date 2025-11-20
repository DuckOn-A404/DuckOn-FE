// import { useEffect, useRef, useState } from "react";
// import { Youtube, MoreVertical, Trash2 } from "lucide-react";
// import { fetchYouTubeMeta } from "../../utils/youtubeMeta";
// import YouTubeSearchModal from "../../components/common/modal/YouTubeSearchModal";

// type Meta = { title?: string; author?: string; thumbnail?: string };

// type PlaylistPanelProps = {
//   isHost: boolean;
//   playlist: string[];
//   currentVideoIndex: number;
//   onAddToPlaylist: (videoId: string) => void;
//   onSelect?: (index: number) => void;
//   onReorder?: (from: number, to: number) => void;
//   onDeleteItem?: (index: number) => void;
// };

// const PlaylistPanel = ({
//   isHost,
//   playlist,
//   currentVideoIndex,
//   onAddToPlaylist,
//   onSelect,
//   onReorder,
//   onDeleteItem,
// }: PlaylistPanelProps) => {
//   const [inputId, setInputId] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [metaMap, setMetaMap] = useState<Record<string, Meta>>({});
//   const [openMenu, setOpenMenu] = useState<number | null>(null);

//   const [ytModalOpen, setYtModalOpen] = useState(false);

//   const dragFrom = useRef<number | null>(null);

//   const toVideoId = (value: string): string | null => {
//     const trimmed = value.trim();
//     const regex =
//       /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/;
//     const match = trimmed.match(regex);
//     if (match?.[1]) return match[1];
//     if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
//     return null;
//   };

//   const toThumbUrl = (videoId: string): string =>
//     metaMap[videoId]?.thumbnail ||
//     `https://img.youtube.com/vi/${videoId}/default.jpg`;

//   const handleAdd = () => {
//     setError(null);
//     const id = toVideoId(inputId);
//     if (!id) {
//       setError("유효한 YouTube URL 또는 영상 ID가 아닙니다.");
//       return;
//     }
//     onAddToPlaylist(id);
//     setInputId("");
//   };

//   // 메타 로드
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       const tasks = playlist
//         .filter((id) => !metaMap[id])
//         .map(async (id) => {
//           const m = await fetchYouTubeMeta(id);
//           if (!mounted || !m) return;
//           setMetaMap((prev) => ({ ...prev, [id]: m }));
//         });
//       await Promise.allSettled(tasks);
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, [playlist, metaMap]);

//   // DnD 핸들러
//   const handleDragStart = (idx: number) => () => {
//     if (!isHost) return;
//     dragFrom.current = idx;
//   };
//   const handleDragOver = (e: React.DragEvent) => {
//     if (!isHost) return;
//     e.preventDefault();
//   };
//   const handleDrop = (to: number) => (e: React.DragEvent) => {
//     if (!isHost) return;
//     e.preventDefault();
//     const from = dragFrom.current;
//     dragFrom.current = null;
//     if (from == null || from === to) return;
//     onReorder?.(from, to);
//   };

//   return (
//     <div className="flex flex-col h-full min-h-0 bg-gray-800 text-white">
//       {/* 리스트 */}
//       <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
//         {playlist.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-full text-gray-500">
//             <Youtube size={48} />
//             <p className="mt-2 text-sm">재생목록이 비었습니다.</p>
//             {isHost && <p className="text-xs">아래에서 영상을 추가해 주세요.</p>}
//           </div>
//         ) : (
//           playlist.map((videoId, index) => {
//             const isPlaying = index === currentVideoIndex;
//             const meta = metaMap[videoId] || {};

//             const handleSelect = () => {
//               if (!isHost || isPlaying) return;
//               onSelect?.(index);
//             };

//             return (
//               <div
//                 key={`${videoId}-${index}`}
//                 role={isHost ? "button" : undefined}
//                 tabIndex={isHost ? 0 : -1}
//                 onClick={handleSelect}
//                 onKeyDown={(e) => {
//                   if (!isHost) return;
//                   if (e.key === "Enter" || e.key === " ") {
//                     e.preventDefault();
//                     handleSelect();
//                   }
//                 }}
//                 draggable={isHost}
//                 onDragStart={handleDragStart(index)}
//                 onDragOver={handleDragOver}
//                 onDrop={handleDrop(index)}
//                 className={`p-2 rounded-lg flex items-center justify-between transition-all duration-300 ease-in-out relative
//                   ${
//                     isPlaying
//                       ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 shadow-lg"
//                       : `bg-gray-800 ${
//                           isHost
//                             ? "hover:bg-gray-700 cursor-move"
//                             : "cursor-default"
//                         }`
//                   }`}
//               >
//                 <div className="flex items-center gap-3 min-w-0 w-full">
//                   <div className="w-2/5 flex-shrink-0">
//                     <img
//                       src={toThumbUrl(videoId)}
//                       alt="thumbnail"
//                       className="w-full aspect-video object-cover rounded-md"
//                     />
//                   </div>
//                   <div className="flex-1 flex flex-col overflow-hidden">
//                     <span className="font-semibold truncate text-sm">
//                       {meta.title || `Video ID: ${videoId}`}
//                     </span>
//                     <span
//                       className={`text-xs truncate ${
//                         isPlaying ? "text-white" : "text-gray-300"
//                       }`}
//                     >
//                       {meta.author
//                         ? meta.author
//                         : isPlaying
//                         ? "지금 재생 중"
//                         : `재생목록 #${index + 1}`}
//                     </span>
//                   </div>
//                 </div>

//                 {/* ⋮ 메뉴 (MoreVertical) */}
//                 {isHost && (
//                   <div className="ml-2 relative">
//                     <button
//                       className="p-2 rounded hover:bg-gray-700"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setOpenMenu((v) => (v === index ? null : index));
//                       }}
//                       aria-label="more"
//                     >
//                       <MoreVertical size={18} />
//                     </button>

//                     {openMenu === index && (
//                       <div
//                         className="absolute right-0 top-9 z-10 w-36 rounded-md border border-gray-700 bg-gray-900 shadow-lg"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         <button
//                           className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 flex items-center gap-2"
//                           onClick={() => {
//                             setOpenMenu(null);
//                             onDeleteItem?.(index);
//                           }}
//                         >
//                           <Trash2 size={16} />
//                           삭제
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })
//         )}
//       </div>

//       {/* 방장 전용 추가 UI */}
//       {isHost && (
//         <div className="mt-4 border-t border-gray-700 flex-shrink-0">
//           <div className="flex gap-3 p-3 items-stretch">
//             <div className="flex-1 flex">
//               <input
//                 value={inputId}
//                 onChange={(e) => setInputId(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && handleAdd()}
//                 placeholder="YouTube URL 입력"
//                 className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 text-m outline-none focus:border-purple-500 transition-colors h-full"
//               />
//             </div>

//             {/* 오른쪽 버튼 묶음 */}
//             <div className="flex flex-col justify-between gap-1">
//               <button
//                 onClick={handleAdd}
//                 className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-2 py-2 rounded-lg text-sm"
//               >
//                 추가
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setYtModalOpen(true)}
//                 className="bg-gray-600 hover:bg-gray-500 text-white text-sm px-2 py-2 rounded-lg"
//               >
//                 영상 검색
//               </button>
//             </div>
//           </div>

//           {error && <p className="mt-2 text-xs text-red-400 px-3">{error}</p>}
//         </div>
//       )}
//       <YouTubeSearchModal
//         open={ytModalOpen}
//         onClose={() => setYtModalOpen(false)}
//         onSelect={(info) => {
//           setInputId(info.url);
//           setYtModalOpen(false);
//         }}
//       />
//     </div>
//   );
// };

// export default PlaylistPanel;

import { useEffect, useRef, useState } from "react";
import { Youtube, MoreVertical, Trash2 } from "lucide-react";
import { fetchYouTubeMeta } from "../../utils/youtubeMeta";
import YouTubeSearchModal from "../../components/common/modal/YouTubeSearchModal";
import { useUiTranslate } from "../../hooks/useUiTranslate";

type Meta = { title?: string; author?: string; thumbnail?: string };

type PlaylistPanelProps = {
  isHost: boolean;
  playlist: string[];
  currentVideoIndex: number;
  onAddToPlaylist: (videoId: string) => void;
  onSelect?: (index: number) => void;
  onReorder?: (from: number, to: number) => void;
  onDeleteItem?: (index: number) => void;
};

const PlaylistPanel = ({
  isHost,
  playlist,
  currentVideoIndex,
  onAddToPlaylist,
  onSelect,
  onReorder,
  onDeleteItem,
}: PlaylistPanelProps) => {
  const { t } = useUiTranslate();

  const [inputId, setInputId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [metaMap, setMetaMap] = useState<Record<string, Meta>>({});
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const [ytModalOpen, setYtModalOpen] = useState(false);

  const dragFrom = useRef<number | null>(null);

  const toVideoId = (value: string): string | null => {
    const trimmed = value.trim();
    const regex =
      /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = trimmed.match(regex);
    if (match?.[1]) return match[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
    return null;
  };

  const toThumbUrl = (videoId: string): string =>
    metaMap[videoId]?.thumbnail ||
    `https://img.youtube.com/vi/${videoId}/default.jpg`;

  const handleAdd = () => {
    setError(null);
    const id = toVideoId(inputId);
    if (!id) {
      setError(t("playlist.error.invalid", "유효한 YouTube URL 또는 영상 ID가 아닙니다."));
      return;
    }
    onAddToPlaylist(id);
    setInputId("");
  };

  // 메타 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      const tasks = playlist
        .filter((id) => !metaMap[id])
        .map(async (id) => {
          const m = await fetchYouTubeMeta(id);
          if (!mounted || !m) return;
          setMetaMap((prev) => ({ ...prev, [id]: m }));
        });
      await Promise.allSettled(tasks);
    })();
    return () => {
      mounted = false;
    };
  }, [playlist, metaMap]);

  // DnD 핸들러
  const handleDragStart = (idx: number) => () => {
    if (!isHost) return;
    dragFrom.current = idx;
  };
  const handleDragOver = (e: React.DragEvent) => {
    if (!isHost) return;
    e.preventDefault();
  };
  const handleDrop = (to: number) => (e: React.DragEvent) => {
    if (!isHost) return;
    e.preventDefault();
    const from = dragFrom.current;
    dragFrom.current = null;
    if (from == null || from === to) return;
    onReorder?.(from, to);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-800 text-white">
      {/* 리스트 */}
      <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
        {playlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Youtube size={48} />
            <p className="mt-2 text-sm">
              {t("playlist.empty", "재생목록이 비었습니다.")}
            </p>
            {isHost && (
              <p className="text-xs">
                {t("playlist.empty.addHint", "아래에서 영상을 추가해 주세요.")}
              </p>
            )}
          </div>
        ) : (
          playlist.map((videoId, index) => {
            const isPlaying = index === currentVideoIndex;
            const meta = metaMap[videoId] || {};

            const handleSelect = () => {
              if (!isHost || isPlaying) return;
              onSelect?.(index);
            };

            return (
              <div
                key={`${videoId}-${index}`}
                role={isHost ? "button" : undefined}
                tabIndex={isHost ? 0 : -1}
                onClick={handleSelect}
                onKeyDown={(e) => {
                  if (!isHost) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect();
                  }
                }}
                draggable={isHost}
                onDragStart={handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={handleDrop(index)}
                className={`p-2 rounded-lg flex items-center justify-between transition-all duration-300 ease-in-out relative
                  ${
                    isPlaying
                      ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 shadow-lg"
                      : `bg-gray-800 ${
                          isHost
                            ? "hover:bg-gray-700 cursor-move"
                            : "cursor-default"
                        }`
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0 w-full">
                  <div className="w-2/5 flex-shrink-0">
                    <img
                      src={toThumbUrl(videoId)}
                      alt="thumbnail"
                      className="w-full aspect-video object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <span className="font-semibold truncate text-sm">
                      {meta.title || `Video ID: ${videoId}`}
                    </span>
                    <span
                      className={`text-xs truncate ${
                        isPlaying ? "text-white" : "text-gray-300"
                      }`}
                    >
                      {meta.author
                        ? meta.author
                        : isPlaying
                        ? t("playlist.nowPlaying", "지금 재생 중")
                        : `${t("playlist.orderPrefix", "재생목록 #")}${index + 1}`}
                    </span>
                  </div>
                </div>

                {/* ⋮ 메뉴 */}
                {isHost && (
                  <div className="ml-2 relative">
                    <button
                      className="p-2 rounded hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu((v) => (v === index ? null : index));
                      }}
                      aria-label="more"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenu === index && (
                      <div
                        className="absolute right-0 top-9 z-10 w-36 rounded-md border border-gray-700 bg-gray-900 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 flex items-center gap-2"
                          onClick={() => {
                            setOpenMenu(null);
                            onDeleteItem?.(index);
                          }}
                        >
                          <Trash2 size={16} />
                          {t("playlist.delete", "삭제")}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 방장 전용 추가 UI */}
      {isHost && (
        <div className="mt-4 border-t border-gray-700 flex-shrink-0">
          <div className="flex gap-3 p-3 items-stretch">
            <div className="flex-1 flex">
              <input
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder={t(
                  "playlist.input.placeholder",
                  "YouTube URL 입력"
                )}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 text-m outline-none focus:border-purple-500 transition-colors h-full"
              />
            </div>

            {/* 오른쪽 버튼 묶음 */}
            <div className="flex flex-col justify-between gap-1">
              <button
                onClick={handleAdd}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-2 py-2 rounded-lg text-sm"
              >
                {t("playlist.add", "추가")}
              </button>
              <button
                type="button"
                onClick={() => setYtModalOpen(true)}
                className="bg-gray-600 hover:bg-gray-500 text-white text-sm px-2 py-2 rounded-lg"
              >
                {t("playlist.search", "영상 검색")}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-2 text-xs text-red-400 px-3">{error}</p>
          )}
        </div>
      )}

      <YouTubeSearchModal
        open={ytModalOpen}
        onClose={() => setYtModalOpen(false)}
        onSelect={(info) => {
          setInputId(info.url);
          setYtModalOpen(false);
        }}
      />
    </div>
  );
};

export default PlaylistPanel;

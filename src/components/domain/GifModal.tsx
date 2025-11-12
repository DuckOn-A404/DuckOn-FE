import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, Sparkles, TrendingUp, Star } from "lucide-react";
import {
  fetchTopMemes,
  fetchFavoriteMemes,
  searchMemes,
  logMemeUsage,
  logSearchKeyword,
  addFavoriteMeme,
  removeFavoriteMeme,
  type Meme,
} from "../../api/memeService";

type GifModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gifUrl: string) => void;
};

const GifModal = ({ isOpen, onClose, onSelectGif }: GifModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"trending" | "favorites">("trending");
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [favoriteMemeIds, setFavoriteMemeIds] = useState<Set<number>>(new Set());

  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 모달 열릴 때 기본 데이터(랜덤 추천) 가져오기
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setActiveTab("trending");
      setMemes([]);
      setCurrentPage(1);
      setHasMore(true);
      return;
    }

    // 검색창 포커스
    setTimeout(() => searchInputRef.current?.focus(), 100);

    (async () => {
      setLoading(true);
      try {
        const response = await fetchTopMemes(1, 30);
        setMemes(response.items);
        setCurrentPage(1);
        setHasMore(response.items.length >= 30);
      } catch (e) {
        console.error("failed to load memes:", e);
        setMemes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen]);

  // 탭 바뀔 때
  useEffect(() => {
    if (!isOpen) return;
    if (searchQuery.trim()) return;

    (async () => {
      setLoading(true);
      try {
        if (activeTab === "trending") {
          const response = await fetchTopMemes(1, 30);
          setMemes(response.items);
          setCurrentPage(1);
          setHasMore(response.items.length >= 30);
        } else {
          const data = await fetchFavoriteMemes();
          setMemes(data);
          // 즐겨찾기 탭의 밈 ID들을 Set에 저장
          setFavoriteMemeIds(new Set(data.map(m => m.id)));
          setCurrentPage(1);
          setHasMore(false); // 즐겨찾기는 무한 스크롤 없음
        }
      } catch (e) {
        console.error("[GifModal] favorite fetch error:", e);
        setMemes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeTab, isOpen, searchQuery]);

  // 검색
  useEffect(() => {
    if (!isOpen) return;
    const q = searchQuery.trim();

    // 검색어 없으면 탭 데이터 다시
    if (!q) {
      return;
    }

    // 검색어가 너무 짧으면 로그 기록 안 함 (최소 2글자)
    const shouldLog = q.length >= 2;

    // 검색어 있으면 검색 API (디바운스)
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // 1. 의미 있는 검색어만 로그 기록 (비동기, 실패해도 검색은 진행)
        if (shouldLog) {
          logSearchKeyword(q).catch((err) => {
            console.warn('검색 로그 기록 실패:', err);
          });
        }

        // 2. 검색 API 호출
        const response = await searchMemes(q, 1, 30);
        setMemes(response.items);
        setCurrentPage(1);
        setHasMore(response.items.length >= 30);
      } catch (e) {
        console.error(e);
        setMemes([]);
      } finally {
        setLoading(false);
      }
    }, 250); // 디바운스

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  // 무한 스크롤 - 더 많은 데이터 로드
  const loadMoreMemes = useCallback(async () => {
    if (isLoadingMore || !hasMore || searchQuery.trim() || activeTab === "favorites") return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await fetchTopMemes(nextPage, 30);
      
      setMemes(prev => [...prev, ...response.items]);
      setCurrentPage(nextPage);
      setHasMore(response.items.length >= 30);
    } catch (e) {
      console.error("추가 밈 로드 실패:", e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, searchQuery, activeTab]);

  // 스크롤 이벤트 감지
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // 스크롤이 하단에서 200px 이내일 때 로드
      if (scrollHeight - scrollTop - clientHeight < 200) {
        loadMoreMemes();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loadMoreMemes]);

  // ESC로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 밈 클릭 → 채팅으로 전송 + 사용 로그
  const handleGifClick = (m: Meme) => {
    onSelectGif(m.imageUrl);

    // 집계 로그
    logMemeUsage(m.id, "USE").catch((err) => {
      console.warn("meme usage log failed", err);
    });

    onClose();
  };

  // 즐겨찾기 토글
  const handleToggleFavorite = async (e: React.MouseEvent, memeId: number) => {
    e.stopPropagation();
    
    const isFavorited = favoriteMemeIds.has(memeId);
    
    try {
      if (isFavorited) {
        await removeFavoriteMeme(memeId);
        setFavoriteMemeIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(memeId);
          return newSet;
        });
        
        // 즐겨찾기 탭에서 제거한 경우 목록에서도 제거
        if (activeTab === "favorites") {
          setMemes(prev => prev.filter(m => m.id !== memeId));
        }
      } else {
        await addFavoriteMeme(memeId);
        setFavoriteMemeIds(prev => new Set(prev).add(memeId));
      }
    } catch (error) {
      console.error("즐겨찾기 토글 실패:", error);
    }
  };

  // 메이슨리용 컬럼 나누기
  const getColumns = () => {
    const columns: Meme[][] = [[], []];
    const heights = [0, 0];

    memes.forEach((meme) => {
      const shortestColumnIndex = heights[0] <= heights[1] ? 0 : 1;
      columns[shortestColumnIndex].push(meme);
      heights[shortestColumnIndex] += Math.random() * 50 + 85;
    });

    return columns;
  };

  const columns = getColumns();

  return (
    <>
      <div
        ref={modalRef}
        className="fixed z-[500]
                   bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
                   shadow-2xl border border-gray-700/50
                   flex flex-col overflow-hidden
                   animate-in slide-in-from-bottom-4 fade-in duration-300
                   left-0 right-0 bottom-[88px]
                   w-full h-[calc(100vh-250px)] max-h-[500px]
                   rounded-t-2xl rounded-b-none
                   md:left-auto md:right-[5px] md:bottom-[90px]
                   md:w-[338px] md:h-[540px] md:max-h-[540px]
                   md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="relative px-4 pt-4 pb-3 bg-gradient-to-b from-gray-800/80 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-purple-400" />
              MEMES
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-600/50
                       transition-all duration-200 group"
              aria-label="닫기"
            >
              <X size={18} className="text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* 검색창 */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="GIF 검색..."
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl
                       pl-10 pr-4 py-2.5 text-sm text-white
                       placeholder:text-gray-500
                       outline-none focus:border-purple-500/50 focus:bg-gray-700
                       transition-all duration-200"
            />
          </div>
        </div>

        {/* 탭 (검색 중이 아닐 때만) */}
        {!searchQuery && (
          <div className="px-4 pb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("trending")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                          text-sm font-medium transition-all duration-200
                          ${
                            activeTab === "trending"
                              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                              : "bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                          }`}
              >
                <TrendingUp size={16} />
                인기
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                          text-sm font-medium transition-all duration-200
                          ${
                            activeTab === "favorites"
                              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                              : "bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                          }`}
              >
                <Sparkles size={16} />
                즐겨찾기
              </button>
            </div>
          </div>
        )}

        {/* 내용 */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 pb-4 gif-scroll">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              불러오는 중...
            </div>
          ) : memes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
              표시할 밈이 없어요.
            </div>
          ) : (
            <>
              <div className="flex gap-2.5">
                {columns.map((column, columnIndex) => (
                  <div key={columnIndex} className="flex-1 flex flex-col gap-2.5">
                    {column.map((meme) => (
                      <div
                        key={meme.id}
                        onClick={() => handleGifClick(meme)}
                        className="relative rounded-xl overflow-hidden cursor-pointer
                                   bg-gray-700/30 group
                                   transform transition-all duration-200
                                   hover:scale-[1.03] hover:shadow-xl hover:shadow-purple-500/20
                                   active:scale-[0.97]"
                      >

                        {/* 호버 오버레이 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/40 to-transparent
                                        opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />

                        {/* 즐겨찾기 버튼 */}
                        <button
                          onClick={(e) => handleToggleFavorite(e, meme.id)}
                          className="absolute top-2 right-2 z-20
                                     p-1.5 rounded-lg bg-black/35 backdrop-blur-sm
                                     opacity-0 group-hover:opacity-100
                                     transition-all duration-200
                                     hover:bg-black/60 hover:scale-110"
                          aria-label="즐겨찾기"
                        >
                          <Star
                            size={16}
                            strokeWidth={2.5}
                            className={favoriteMemeIds.has(meme.id) 
                              ? "text-yellow-400 fill-yellow-400" 
                              : "text-white"}
                          />
                        </button>

                        <img
                          src={meme.imageUrl}
                          alt={meme.tags?.[0] ?? "meme"}
                          className="w-full h-auto object-cover"
                          loading="lazy"
                          style={{
                            minHeight: "85px",
                            maxHeight: "200px",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              
              {/* 무한 스크롤 로딩 표시 */}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-4 text-gray-400 text-xs">
                  더 불러오는 중...
                </div>
              )}
            </>
          )}
        </div>

        {/* 하단 그라데이션 */}
        <div className="absolute bottom-0 left-0 right-0 h-8 
                      bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
      </div>

      {/* 스크롤바 스타일 & 애니메이션 */}
      <style>{`
        .gif-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
        }
        .gif-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .gif-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .gif-scroll::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 10px;
        }
        .gif-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
        @keyframes slide-in-from-bottom-4 {
          from { transform: translateY(1rem); }
          to { transform: translateY(0); }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .slide-in-from-bottom-4 {
          animation-name: slide-in-from-bottom-4;
        }
        .fade-in {
          animation-name: fade-in;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default GifModal;

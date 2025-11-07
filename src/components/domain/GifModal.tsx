import { useState, useEffect, useRef } from "react";
import { X, Search, Sparkles, TrendingUp } from "lucide-react";

type GifModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gifUrl: string) => void;
};

// 더미 GIF 데이터
const DUMMY_GIFS = [
  "https://media1.tenor.com/m/elCp2_fukbwAAAAC/%EC%9D%B4%EC%9E%AC%EB%AA%85-%EB%8D%94%EB%B6%88%EC%96%B4%EB%AF%BC%EC%A3%BC%EB%8B%B9.gif",
  "https://media1.tenor.com/m/hOjxKIQML6YAAAAC/%EC%A2%8B%EB%B9%A0%EA%B0%80-%EC%9C%A4%EC%84%9D%EC%97%B4.gif",
  "https://media1.tenor.com/m/tOKJBiXdgmUAAAAC/%ED%95%9C%EA%B5%AD%EC%98%81%ED%99%94.gif",
  "https://media1.tenor.com/m/hFbzrQZ1oNEAAAAC/%EC%9D%B4%EC%9E%AC%EB%AA%85-%EB%8D%94%EB%B6%88%EC%96%B4%EB%AF%BC%EC%A3%BC%EB%8B%B9.gif",
  "https://media1.tenor.com/m/9NVSJSAuVhUAAAAd/%EC%9D%B4%EC%9E%AC%EB%AA%85-%EB%8D%94%EB%B6%88%EC%96%B4%EB%AF%BC%EC%A3%BC%EB%8B%B9.gif",
  "https://media1.tenor.com/m/elCp2_fukbwAAAAC/%EC%9D%B4%EC%9E%AC%EB%AA%85-%EB%8D%94%EB%B6%88%EC%96%B4%EB%AF%BC%EC%A3%BC%EB%8B%B9.gif",
  "https://media1.tenor.com/m/hOjxKIQML6YAAAAC/%EC%A2%8B%EB%B9%A0%EA%B0%80-%EC%9C%A4%EC%84%9D%EC%97%B4.gif",
  "https://media1.tenor.com/m/tOKJBiXdgmUAAAAC/%ED%95%9C%EA%B5%AD%EC%98%81%ED%99%94.gif",
  "https://media1.tenor.com/m/hFbzrQZ1oNEAAAAC/%EC%9D%B4%EC%9E%AC%EB%AA%85-%EB%8D%94%EB%B6%88%EC%96%B4%EB%AF%BC%EC%A3%BC%EB%8B%B9.gif",
  "https://media1.tenor.com/m/9NVSJSAuVhUAAAAd/%EC%9D%B4%EC%9E%AC%EB%AA%85-%EB%8D%94%EB%B6%88%EC%96%B4%EB%AF%BC%EC%A3%BC%EB%8B%B9.gif",
];

const GifModal = ({ isOpen, onClose, onSelectGif }: GifModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedGifs, setDisplayedGifs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"trending" | "favorites">("trending");
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 모달이 열릴 때 GIF 로드 및 검색창 포커스
  useEffect(() => {
    if (isOpen) {
      setDisplayedGifs(DUMMY_GIFS);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
      setActiveTab("trending");
    }
  }, [isOpen]);

  // 검색 처리
  useEffect(() => {
    if (searchQuery.trim()) {
      setDisplayedGifs(DUMMY_GIFS);
    } else {
      setDisplayedGifs(DUMMY_GIFS);
    }
  }, [searchQuery]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGifClick = (gifUrl: string) => {
    onSelectGif(gifUrl);
    onClose();
  };

  // 메이슨리 레이아웃을 위한 컬럼 분배
  const getColumns = () => {
    const columns: string[][] = [[], []];
    const heights = [0, 0];

    displayedGifs.forEach((gif) => {
      const shortestColumnIndex = heights[0] <= heights[1] ? 0 : 1;
      columns[shortestColumnIndex].push(gif);
      heights[shortestColumnIndex] += Math.random() * 50 + 85;
    });

    return columns;
  };

  const columns = getColumns();

  return (
    <>
      
      {/* 모달 - 반응형: 모바일은 채팅창 전체, 데스크탑은 채팅창 내부 좌측 */}
      <div
        ref={modalRef}
        className="fixed z-[500]
                   bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
                   shadow-2xl border border-gray-700/50
                   flex flex-col overflow-hidden
                   animate-in slide-in-from-bottom-4 fade-in duration-300
                   
                   /* 모바일: 채팅창 너비에 맞춤, 입력창 바로 위 */
                   left-0 right-0 bottom-[88px]
                   w-full h-[calc(100vh-250px)] max-h-[500px]
                   rounded-t-2xl rounded-b-none
                   
                   /* 데스크탑: 채팅창 내부 우측, Figma 위치 */
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
              GIF 선택
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

        {/* 탭 버튼 (검색 중이 아닐 때만) */}
        {!searchQuery && (
          <div className="px-4 pb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("trending")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                          text-sm font-medium transition-all duration-200
                          ${activeTab === "trending"
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
                          ${activeTab === "favorites"
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

        {/* GIF 그리드 - 메이슨리 레이아웃 */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 gif-scroll">
          <div className="flex gap-2.5">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex-1 flex flex-col gap-2.5">
                {column.map((gif, index) => (
                  <div
                    key={`${columnIndex}-${index}`}
                    onClick={() => handleGifClick(gif)}
                    className="relative rounded-xl overflow-hidden cursor-pointer
                             bg-gray-700/30 group
                             transform transition-all duration-200
                             hover:scale-[1.03] hover:shadow-xl hover:shadow-purple-500/20
                             active:scale-[0.97]"
                  >
                    {/* 호버 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-600/40 to-transparent
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />
                    
                    <img
                      src={gif}
                      alt={`gif-${index}`}
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
        </div>

        {/* 하단 그라데이션 페이드 */}
        <div className="absolute bottom-0 left-0 right-0 h-8 
                      bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
      </div>

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
          from {
            transform: translateY(1rem);
          }
          to {
            transform: translateY(0);
          }
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
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default GifModal;

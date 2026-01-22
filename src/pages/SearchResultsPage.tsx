import {useState, useEffect} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {Search, ArrowLeft, Play, Check} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import {api} from "../api/axiosInstance";
import SelectArtistModal from "../components/search/SelectArtistModal";
import CreateRoomFromSearchModal from "../components/search/CreateRoomFromSearchModal";
import {useUserStore} from "../store/useUserStore";
import {decodeHtmlEntities} from "../utils/decodeHtml";

// YouTube 검색 결과 타입
type YtSearchItem = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
};

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [displayQuery, setDisplayQuery] = useState(initialQuery);
  const [ytResults, setYtResults] = useState<YtSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 모달 상태
  const [selectedVideos, setSelectedVideos] = useState<YtSearchItem[]>([]);
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);
  const [selectedArtistName, setSelectedArtistName] = useState<string>("");

  // 사용자 정보 (Zustand store에서 가져오기)
  const user = useUserStore((state) => state.myUser);

  const navigate = useNavigate();

  // 페이지 로드 시 localStorage에서 선택된 영상 복원
  useEffect(() => {
    const savedState = localStorage.getItem("pendingRoomCreation");
    if (savedState) {
      try {
        const {selectedVideos: saved, searchQuery: savedQuery} = JSON.parse(savedState);
        if (saved && Array.isArray(saved)) {
          setSelectedVideos(saved);
          if (savedQuery) {
            setSearchQuery(savedQuery);
            setDisplayQuery(savedQuery);
          }
        }
        // 복원 후 삭제
        localStorage.removeItem("pendingRoomCreation");
      } catch (error) {
        console.error("Failed to restore pending room creation:", error);
      }
    }
  }, []);

  // 검색 실행
  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError("");
    setDisplayQuery(query);

    try {
      const res = await api.get("/public/youtube/search", {
        params: {
          query: query.trim(),
          maxResults: 50,
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
      setError("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 검색 실행
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  // 검색 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  // 비디오 선택/해제 토글
  const handleSelectVideo = (item: YtSearchItem) => {
    setSelectedVideos((prev) => {
      const index = prev.findIndex((v) => v.videoId === item.videoId);
      if (index >= 0) {
        // 이미 선택된 경우 제거
        return prev.filter((v) => v.videoId !== item.videoId);
      } else {
        // 선택되지 않은 경우 추가
        return [...prev, item];
      }
    });
  };

  // 방 생성 버튼 클릭
  const handleCreateRoom = () => {
    if (selectedVideos.length === 0) {
      alert("영상을 최소 1개 이상 선택해주세요.");
      return;
    }

    if (!user) {
      // 로그인이 필요한 경우, 현재 상태를 localStorage에 저장
      localStorage.setItem(
        "pendingRoomCreation",
        JSON.stringify({
          selectedVideos,
          searchQuery: displayQuery,
          returnPath: `/search?q=${encodeURIComponent(displayQuery)}`,
        })
      );

      // 로그인 페이지로 이동 (returnUrl 전달)
      navigate(`/login?returnUrl=${encodeURIComponent(`/search?q=${encodeURIComponent(displayQuery)}`)}`);
      return;
    }

    setShowArtistModal(true);
  };

  // 아티스트 선택 시 방 생성 모달 열기
  const handleSelectArtist = (artistId: number, artistName: string) => {
    setSelectedArtistId(artistId);
    setSelectedArtistName(artistName);
    setShowArtistModal(false);
    setShowCreateRoomModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* 상단 검색바 영역 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4">
            {/* 로고 영역 (Header.tsx와 동일한 스타일) */}
            <div className="flex items-center gap-2 mr-2">
              <button
                className="group flex items-center gap-2 outline-none"
                onClick={() => navigate("/")}
                aria-label="DuckOn 홈으로 이동"
              >
                <img className="h-7 w-7" src="/duck.svg" alt="DuckOn 로고" />
                <span className="font-extrabold tracking-tight text-lg hidden sm:inline">
                  DuckOn
                </span>
                <span className="ml-1 h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 opacity-70 group-hover:opacity-100 transition hidden sm:inline" />
              </button>
            </div>

            <div className="flex-1 flex items-center gap-3">
              {/* 뒤로가기 버튼 */}
              <button
                onClick={() => navigate(-1)}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>

              {/* 검색바 */}
              <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 rounded-full bg-gray-100 border-2 border-transparent focus:border-purple-500 focus:outline-none focus:bg-white transition-all text-sm sm:text-base"
                    placeholder="검색어를 입력하세요"
                  />
                </div>
                <button
                  type="submit"
                  className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center"
                >
                  <Search className="h-5 w-5 text-white" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 결과 영역 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 검색어 표시 */}
        {displayQuery && !isLoading && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              '<span className="text-purple-600">{displayQuery}</span>' 검색 결과
            </h1>
            <p className="text-gray-600 mt-1">
              {ytResults.length}개의 영상을 찾았습니다
            </p>
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({length: 12}).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-xl mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* 에러 상태 */}
        {error && !isLoading && (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        )}

        {/* 검색 결과 그리드 */}
        {!isLoading && !error && ytResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-32">
            {ytResults.map((item, index) => {
              const selectedIndex = selectedVideos.findIndex(
                (v) => v.videoId === item.videoId
              );
              const isSelected = selectedIndex >= 0;

              return (
                <motion.button
                  key={item.videoId}
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.3, delay: index * 0.03}}
                  onClick={() => handleSelectVideo(item)}
                  className={`group text-left bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 ${
                    isSelected ? "ring-4 ring-purple-500" : ""
                  }`}
                >
                  {/* 썸네일 */}
                  <div className="relative aspect-video bg-gray-200 overflow-hidden">
                    {item.thumbnailUrl && (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {/* 선택 번호 표시 */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-lg">
                        {selectedIndex + 1}
                      </div>
                    )}

                    {/* 호버 시 아이콘 */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {isSelected ? (
                          <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="h-7 w-7 text-white" strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center">
                            <Play className="h-6 w-6 text-white ml-1" fill="white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 비디오 정보 */}
                  <div className="p-4">
                    <h3
                      className={`font-semibold line-clamp-2 mb-2 transition-colors ${
                        isSelected
                          ? "text-purple-600"
                          : "text-gray-900 group-hover:text-purple-600"
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {item.channelTitle}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* 검색 결과 없음 */}
        {!isLoading && !error && ytResults.length === 0 && displayQuery && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              검색 결과가 없습니다
            </h2>
            <p className="text-gray-600">
              다른 검색어로 다시 시도해보세요
            </p>
          </div>
        )}
      </div>

      {/* 하단 고정 바 */}
      <AnimatePresence>
        {selectedVideos.length > 0 && (
          <motion.div
            initial={{y: 100, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            exit={{y: 100, opacity: 0}}
            transition={{duration: 0.3}}
            className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t-2 border-purple-200 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center">
                      {selectedVideos.length}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedVideos.length}개 선택됨
                      </p>
                      <p className="text-sm text-gray-600">
                        영상을 클릭하여 선택/해제
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedVideos([])}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    전체 해제
                  </button>
                  <button
                    onClick={handleCreateRoom}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:brightness-110 transition-all shadow-lg flex items-center gap-2"
                  >
                    <Play className="h-5 w-5" fill="white" />
                    <span>방 생성하기</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 아티스트 선택 모달 */}
      <SelectArtistModal
        isOpen={showArtistModal}
        onClose={() => setShowArtistModal(false)}
        onSelectArtist={handleSelectArtist}
        videoTitle={
          selectedVideos.length > 0
            ? `${selectedVideos[0].title} 외 ${selectedVideos.length - 1}개`
            : ""
        }
      />

      {/* 방 생성 모달 */}
      {selectedArtistId && user && (
        <CreateRoomFromSearchModal
          isOpen={showCreateRoomModal}
          onClose={() => {
            setShowCreateRoomModal(false);
            setSelectedVideos([]);
            setSelectedArtistId(null);
            setSelectedArtistName("");
          }}
          artistId={selectedArtistId}
          artistName={selectedArtistName}
          hostId={user.userId}
          hostNickname={user.nickname}
          videoUrls={selectedVideos.map(
            (v) => `https://www.youtube.com/watch?v=${v.videoId}`
          )}
          videoTitles={selectedVideos.map((v) => v.title)}
          thumbnailUrls={selectedVideos.map((v) => v.thumbnailUrl)}
        />
      )}
    </div>
  );
};

export default SearchResultsPage;

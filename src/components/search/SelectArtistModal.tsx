import {useState, useEffect} from "react";
import {X, Search, Heart} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import {api} from "../../api/axiosInstance";
import {type Artist} from "../../types/artist";
// import {createSlug} from "../../utils/slugUtils";
import {followArtist} from "../../api/artistService";

interface SelectArtistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArtist: (artistId: number, artistName: string) => void;
  videoTitle?: string;
}

const SelectArtistModal = ({
  isOpen,
  onClose,
  onSelectArtist,
  videoTitle,
}: SelectArtistModalProps) => {
  const [followedArtists, setFollowedArtists] = useState<Artist[]>([]);
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"followed" | "all">("followed");

  // 팔로우 확인 모달 상태
  const [showFollowConfirm, setShowFollowConfirm] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadArtists();
    }
  }, [isOpen]);

  const loadArtists = async () => {
    setIsLoading(true);
    try {
      // 팔로우 중인 아티스트 가져오기
      const followedRes = await api.get("/me/artists");
      setFollowedArtists(followedRes.data?.artistList || []);

      // 전체 아티스트 가져오기 (size를 크게 설정하여 모든 아티스트 받기)
      const allRes = await api.get("/artists", {
        params: {
          size: 1000, // 충분히 큰 수로 설정
        },
      });
      setAllArtists(allRes.data?.artistList || []);
    } catch (error) {
      console.error("Failed to load artists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 아티스트 선택 핸들러
  const handleSelectArtist = (artist: Artist) => {
    const isFollowed = followedArtists.some((a) => a.artistId === artist.artistId);

    if (isFollowed) {
      // 이미 팔로우한 아티스트면 바로 진행
      onSelectArtist(artist.artistId, artist.nameKr || artist.nameEn);
    } else {
      // 팔로우하지 않은 아티스트면 확인 모달 표시
      setSelectedArtist(artist);
      setShowFollowConfirm(true);
    }
  };

  // 팔로우 후 방 생성 진행
  const handleFollowAndProceed = async () => {
    if (!selectedArtist) return;

    setIsFollowing(true);
    try {
      await followArtist(selectedArtist.artistId);

      // 팔로우 목록에 추가
      setFollowedArtists((prev) => [...prev, selectedArtist]);

      // 모달 닫고 방 생성 진행
      setShowFollowConfirm(false);
      onSelectArtist(
        selectedArtist.artistId,
        selectedArtist.nameKr || selectedArtist.nameEn
      );
    } catch (error) {
      console.error("Failed to follow artist:", error);
      alert("팔로우에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsFollowing(false);
    }
  };

  const filteredArtists =
    activeTab === "followed"
      ? followedArtists.filter(
        (artist) =>
          artist.nameKr?.includes(searchQuery) ||
          artist.nameEn?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : allArtists.filter(
        (artist) =>
          artist.nameKr?.includes(searchQuery) ||
          artist.nameEn?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{opacity: 0, scale: 0.95}}
        animate={{opacity: 1, scale: 1}}
        exit={{opacity: 0, scale: 0.95}}
        transition={{duration: 0.2}}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              아티스트 선택
            </h2>
            {videoTitle && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                {videoTitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab("followed")}
            className={`px-4 py-3 font-semibold transition-colors border-b-2 ${activeTab === "followed"
              ? "text-purple-600 border-purple-600"
              : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
          >
            팔로우 중 ({followedArtists.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-3 font-semibold transition-colors border-b-2 ${activeTab === "all"
              ? "text-purple-600 border-purple-600"
              : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
          >
            전체 아티스트
          </button>
        </div>

        {/* 검색바 */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="아티스트 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 아티스트 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({length: 6}).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-xl mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          ) : filteredArtists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {activeTab === "followed"
                  ? "팔로우 중인 아티스트가 없습니다."
                  : "검색 결과가 없습니다."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredArtists.map((artist) => (
                <button
                  key={artist.artistId}
                  onClick={() => handleSelectArtist(artist)}
                  className="group text-center hover:-translate-y-1 transition-all"
                >
                  <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-gradient-to-br from-purple-100 to-pink-100 shadow-md group-hover:shadow-xl transition-shadow">
                    <img
                      src={artist.imgUrl || "/default_image.png"}
                      alt={artist.nameKr || artist.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                    {artist.nameKr || artist.nameEn}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* 팔로우 확인 모달 */}
      <AnimatePresence>
        {showFollowConfirm && selectedArtist && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4"
            onClick={() => setShowFollowConfirm(false)}
          >
            <motion.div
              initial={{scale: 0.9, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              exit={{scale: 0.9, opacity: 0}}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* 헤더 */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-white">
                <div className="flex items-center gap-3">
                  <Heart className="h-6 w-6" fill="white" />
                  <h3 className="text-xl font-bold">팔로우 하시겠습니까?</h3>
                </div>
              </div>

              {/* 본문 */}
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                    <img
                      src={selectedArtist.imgUrl || "/default_image.png"}
                      alt={selectedArtist.nameKr || selectedArtist.nameEn}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">
                      {selectedArtist.nameKr || selectedArtist.nameEn}
                    </p>
                    <p className="text-sm text-gray-600">
                      방을 만들기 위해서는 팔로우가 필요합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => setShowFollowConfirm(false)}
                  disabled={isFollowing}
                  className="flex-1 px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  취소
                </button>
                <button
                  onClick={handleFollowAndProceed}
                  disabled={isFollowing}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                >
                  {isFollowing ? (
                    "팔로우 중..."
                  ) : (
                    <>
                      <Heart className="h-4 w-4" fill="white" />
                      <span>팔로우</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SelectArtistModal;

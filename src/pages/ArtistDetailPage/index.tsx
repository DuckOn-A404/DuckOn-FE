import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";
import { useArtistFollowStore } from "../../store/useArtistFollowStore";
import { useArtistRooms } from "../../hooks/useArtistRooms";
import {
  followArtist,
  unfollowArtist,
  getArtistDetail,
  getArtistRooms,
} from "../../api/artistService";
import VideoCard from "../../components/domain/video/VideoCard";
import RightSidebar from "./RightSidebar";
import LeftSidebar from "./LeftSidebar";
import { type Artist } from "../../types/artist";
import { Video, CalendarDays } from "lucide-react";
import CreateRoomModal from "../../components/common/modal/CreateRoomModal";

const ArtistDetailPage = () => {
  const location = useLocation();
  const artistId = location.state?.artistId as number | undefined;

  // 아티스트 상세 정보와 로딩 상태를 위한 State
  const [artist, setArtist] = useState<Artist | null>(null);
  const [rooms, setRooms] = useState({ live: [], upcoming: [] });
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useUserStore();
  const {
    isFollowing: followingSet,
    addFollow,
    removeFollow,
  } = useArtistFollowStore();

  const isLoggedIn = !!user;

  // useArtistRooms 훅을 사용하여 방 목록 관련 로직 모두 위임
  const {
    liveRooms,
    upcomingRooms,
    hasMoreLive,
    hasMoreUpcoming,
    isLoading: isLoadingRooms,
    handleLoadMore,
  } = useArtistRooms(artist?.artistId);

  // 최적화된 팔로우 상태 확인
  const isFollowing = artist ? followingSet.has(artist.artistId) : false;

  // 페이지 진입 시 아티스트 상세 정보 및 방목록 정보 병렬로 불러오기
  useEffect(() => {
    const fetchPageData = async () => {
      if (!artistId) {
        console.error("Artist ID가 state로 전달되지 않았습니다.");
        setIsLoadingPage(false);
        return;
      }
      setIsLoadingPage(true);
      try {
        const artistData = await getArtistDetail(artistId);

        setArtist(artistData);

        // roomsData 관련 로직은 나중에
        // setRooms({
        //   live: roomsData.roomList.filter((r) => r.isLive),
        //   upcoming: roomsData.roomList.filter((r) => !r.isLive),
        // });
      } catch (error) {
        console.error("페이지 데이터를 불러오는 데 실패했습니다.", error);
        setArtist(null);
      } finally {
        setIsLoadingPage(false);
      }
    };
    fetchPageData();
  }, [artistId]);

  if (isLoadingPage) {
    return (
      <div className="p-10 text-center">아티스트 정보를 불러오는 중...</div>
    );
  }

  const getDday = (dateString: string) => {
    const today = new Date();
    const target = new Date(dateString);
    const diff = Math.floor(
      (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff >= 0 ? `D+${diff}` : `D${diff}`;
  };

  if (!artist) {
    return (
      <div className="p-10 text-center text-gray-500">
        아티스트를 찾을 수 없습니다.
      </div>
    );
  }

  // 팔로우 버튼 클릭 핸들러
  const handleFollowToggle = async () => {
    if (!user) return alert("로그인이 필요합니다.");
    if (!artist) return;

    try {
      if (isFollowing) {
        await unfollowArtist(artist.artistId);
        removeFollow(artist.artistId);
      } else {
        await followArtist(artist.artistId);
        addFollow(artist);
      }
    } catch (error) {
      console.error("팔로우 처리 실패:", error);
      alert("요청 처리에 실패했습니다.");
    }
  };

  return (
    <div className="flex w-full bg-gray-50">
      {/* 왼쪽: 팔로우 리스트 */}
      <LeftSidebar />

      {/* 가운데: 아티스트 카드 + 라이브/예정 */}
      <main className="flex-1 p-6 space-y-10">
        <div className="bg-white p-6 rounded-2xl shadow flex justify-between items-center">
          <div className="flex items-center gap-6">
            <img
              src={artist.imgUrl}
              alt={artist.nameEn}
              className="w-24 h-24 rounded-2xl object-cover shadow"
            />
            <div>
              <h1 className="text-3xl font-bold">{artist.nameKr}</h1>
              <p className="text-gray-600">{artist.nameEn}</p>
              <p className="text-sm text-gray-500">
                데뷔일: {new Date(artist.debutDate).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>
          {isLoggedIn && (
            <div className="text-right space-y-2">
              {isFollowing ? (
                <>
                  <p className="text-sm font-semibold">
                    {getDday(artist.debutDate)}
                  </p>
                  <button
                    className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full cursor-pointer"
                    onClick={handleFollowToggle}
                  >
                    팔로우 중
                  </button>
                </>
              ) : (
                // 팔로우 중이 아닐 때
                <button
                  className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full cursor-pointer"
                  onClick={handleFollowToggle}
                >
                  + 팔로우
                </button>
              )}
            </div>
          )}
        </div>

        {/* 라이브 방 */}
        <section>
          <div className="flex justify-between items-center mb-6 rounded-2xl bg-gradient-to-r from-purple-50 via-white to-pink-50 p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2 text-white shadow">
                <Video size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">라이브 방</h2>
                <p className="text-sm text-gray-500">
                  {liveRooms.length}개의 방이 진행 중
                </p>
              </div>
            </div>
            {isFollowing && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow hover:scale-105 transition-transform"
              >
                + 새 방 만들기
              </button>
            )}
          </div>
          <div className="flex justify-center">
            {liveRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                {liveRooms.map((room) => (
                  <VideoCard key={room.roomId} {...room} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                현재 진행 중인 라이브 방송이 없습니다.
              </p>
            )}
          </div>
        </section>

        {/* 예정된 방 */}
        <section>
          <div className="flex items-center mb-6 rounded-2xl bg-blue-50 p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 rounded-lg bg-blue-500 p-2 text-white shadow">
                <CalendarDays size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">예정된 방</h2>
                <p className="text-sm text-gray-500">
                  {upcomingRooms.length}개의 방이 예정되어 있음
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            {upcomingRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                {upcomingRooms.map((room, i) => (
                  <VideoCard key={i} {...room} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">예정된 방송이 없습니다.</p>
            )}
          </div>
        </section>
      </main>

      {/* 오른쪽: 실시간 탭 */}
      <RightSidebar />

      {/* 방 생성 모달 */}
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        artistId={artist.artistId}
        hostId={user?.userId ?? ""}
      />
    </div>
  );
};

export default ArtistDetailPage;

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";
import { useArtistFollowStore } from "../../store/useArtistFollowStore";
import { useArtistRooms } from "../../hooks/useArtistRooms";
import {
  followArtist,
  unfollowArtist,
  getArtistDetail,
} from "../../api/artistService";
import VideoCard from "../../components/domain/video/VideoCard";
import RightSidebar from "./RightSidebar";
import LeftSidebar from "./LeftSidebar";
import { type Artist } from "../../types/artist";
import { Video, Plus } from "lucide-react";
import CreateRoomModal from "../../components/common/modal/CreateRoomModal";

const PLACEHOLDER_URL =
  "https://placehold.co/240x240/eeeeee/aaaaaa?text=No+Image&font=roboto";

type ArtistDetailInfo = Artist & {
  followedAt: string | null;
};

const ArtistDetailPage = () => {
  const location = useLocation();
  const artistId = location.state?.artistId as number | undefined;

  // 아티스트 상세 정보와 로딩 상태를 위한 State
  const [artist, setArtist] = useState<ArtistDetailInfo | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { myUser } = useUserStore();
  const {
    isFollowing: followingSet,
    addFollow,
    removeFollow,
    fetchFollowedArtists,
  } = useArtistFollowStore();

  const isLoggedIn = !!myUser;

  // useArtistRooms 훅을 사용하여 방 목록 관련 로직 모두 위임
  const {
    liveRooms,
    hasMoreLive,
    isLoading: isLoadingRooms,
    error: roomsError,
    handleLoadMore,
  } = useArtistRooms(artist?.artistId);

  // 최적화된 팔로우 상태 확인
  const isFollowing = artist
    ? !!artist.followedAt || followingSet.has(artist.artistId)
    : false;

  // 페이지 진입 시 아티스트 상세 정보 불러오기
  useEffect(() => {
    const fetchPageData = async () => {
      if (!artistId) {
        setIsLoadingPage(false);
        return;
      }
      setIsLoadingPage(true);
      try {
        const artistData = await getArtistDetail(artistId);
        setArtist(artistData);
      } catch {
        setArtist(null);
      } finally {
        setIsLoadingPage(false);
      }
    };
    fetchPageData();
  }, [artistId]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchFollowedArtists();
    }
  }, [isLoggedIn, fetchFollowedArtists]);

  if (isLoadingPage) {
    return (
      <div className="flex w-full bg-gray-50">
        {/* 왼쪽: 팔로우 리스트 자리 */}
        <LeftSidebar />

        {/* 가운데: 스켈레톤 */}
        <main className="flex-1 p-6 space-y-10 animate-pulse">
          {/* 아티스트 카드 Skeleton */}
          <div className="bg-white p-6 rounded-2xl shadow flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded-2xl" />
              <div className="space-y-3">
                <div className="h-8 w-48 bg-gray-200 rounded" /> {/* nameKr */}
                <div className="h-4 w-32 bg-gray-200 rounded" /> {/* nameEn */}
                <div className="h-4 w-40 bg-gray-200 rounded" />{" "}
                {/* debutDate */}
              </div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded-full" />
          </div>
        </main>

        {/* 오른쪽 실시간 탭 */}
        {artist && <RightSidebar artistId={artist.artistId} />}
      </div>
    );
  }

  // // 팔로우 d-day 계산
  // const getFollowDday = (dateString: string) => {
  //   const today = new Date();
  //   const target = new Date(dateString);

  //   const KST_OFFSET = 9 * 60 * 60 * 1000;

  //   const todayKST = new Date(today.getTime() + KST_OFFSET);
  //   const targetKST = new Date(target.getTime() + KST_OFFSET);

  //   const diff = Math.floor(
  //     (todayKST.getTime() - targetKST.getTime()) / (1000 * 60 * 60 * 24)
  //   );

  //   return `D+${Math.max(diff + 1, 1)}`;
  // };

  if (!artist) {
    return (
      <div className="p-10 text-center text-gray-500">
        아티스트를 찾을 수 없습니다.
      </div>
    );
  }

  // 팔로우 버튼 클릭 핸들러
  const handleFollowToggle = async () => {
    if (!myUser) return alert("로그인이 필요합니다.");
    if (!artist) return;

    try {
      if (isFollowing) {
        await unfollowArtist(artist.artistId);
        removeFollow(artist.artistId);
        setArtist((prev) => (prev ? { ...prev, followedAt: null } : prev));
      } else {
        await followArtist(artist.artistId);
        addFollow(artist);
        setArtist((prev) =>
          prev ? { ...prev, followedAt: new Date().toISOString() } : prev
        );
      }
    } catch {
      alert("요청 처리에 실패했습니다.");
    }
  };

  return (
    <div className="flex w-full">
      {/* 왼쪽: 팔로우 리스트 */}
      <div className="hidden lg:block">
        <LeftSidebar />
      </div>
      {/* 가운데: 아티스트 카드 + 라이브/예정 */}
      <main className="w-full lg:flex-1 p-4 sm:p-6 space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img
              src={artist.imgUrl || PLACEHOLDER_URL}
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
            <div className="w-full sm:w-auto flex-shrink-0">
              {isFollowing ? (
                <>
                  {/* {artist.followedAt && (
                    <p className="text-sm font-semibold">
                      {getFollowDday(artist.followedAt)}
                    </p>
                  )} */}
                  <button
                    className="w-full sm:w-auto bg-purple-100 text-purple-700 font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors hover:bg-purple-200"
                    onClick={handleFollowToggle}
                  >
                    팔로우 중
                  </button>
                </>
              ) : (
                // 팔로우 중이 아닐 때
                <button
                  className="w-full sm:w-auto bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors hover:bg-purple-700"
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
          {/* 섹션 헤더: 타이틀과 '새 방 만들기' 버튼 */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 rounded-2xl bg-white p-5 shadow-md border border-gray-100">
            {/* 왼쪽: 아이콘 및 텍스트 */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 text-white shadow-lg shadow-purple-200/50">
                <Video size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">라이브 방</h2>
                <p className="text-sm text-gray-500">
                  {liveRooms.length}개의 방이 진행 중
                </p>
              </div>
            </div>

            {/* 오른쪽: '새 방 만들기' 버튼 */}
            {isFollowing && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex w-full sm:w-auto items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-purple-300/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <Plus size={16} />
                <span>새 방 만들기</span>
              </button>
            )}
          </div>

          {/* 방 목록 표시 영역 */}
          <div className="mt-6 flex flex-col items-center gap-8">
            {/* 1. 로딩 중일 때 표시 */}
            {isLoadingRooms && <p>방송 목록을 불러오는 중...</p>}

            {/* 2. 에러 발생 시 표시 */}
            {roomsError && <p className="text-red-500">{roomsError}</p>}

            {/* 3. 로딩도 아니고 에러도 아닐 때 목록 또는 빈 메시지 표시 */}
            {!isLoadingRooms && !roomsError && (
              <>
                {liveRooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 w-full">
                    {liveRooms.map((room) => (
                      <VideoCard key={room.roomId} {...room} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">
                    현재 진행 중인 라이브 방송이 없습니다.
                  </p>
                )}
              </>
            )}

            {/* 4. 더 보여줄 방이 있을 때만 '더보기' 버튼 표시 */}
            {hasMoreLive && (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingRooms}
                className="mt-4 px-6 py-2 bg-white border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                더보기
              </button>
            )}
          </div>
        </section>
      </main>

      {/* 오른쪽: 실시간 탭 */}
      <div className="hidden lg:block">
        <RightSidebar artistId={artist!.artistId} />
      </div>

      {/* 방 생성 모달 */}
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        artistId={artist.artistId}
        hostId={myUser?.userId ?? ""}
      />
    </div>
  );
};

export default ArtistDetailPage;

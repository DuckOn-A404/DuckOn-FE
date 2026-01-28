import { useState, useEffect, useRef, type TouchEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";
import { useArtistFollowStore } from "../../store/useArtistFollowStore";
import { useArtistRooms } from "../../hooks/useArtistRooms";
import {
  followArtist,
  unfollowArtist,
} from "../../api/artistService";
import { getEmergingArtistDetail } from "../../api/emergingArtistService";
import VideoCard from "../../components/domain/video/VideoCard";
import RightSidebar from "./RightSidebar";
import LeftSidebar from "./LeftSidebar";
import type { Artist } from "../../types/artist";
import { Video, Plus } from "lucide-react";
import CreateRoomModal from "../../components/common/modal/CreateRoomModal";
import { isNativeApp } from "../../utils/platform";
import { Capacitor } from "@capacitor/core";
import { useUiTranslate } from "../../hooks/useUiTranslate";

const PLACEHOLDER_URL =
  "https://placehold.co/240x240/eeeeee/aaaaaa?text=No+Image&font=roboto";

const isRealNativeApp = Capacitor.isNativePlatform();

interface RisingArtistDetailInfo {
  emergingArtistId: number;
  nameEn: string;
  nameKr: string;
  debutDate: string;
  imgUrl: string | null;
  followedAt?: string | null;
  isFollowed?: boolean;
  followerCount?: number;
  createdByUserNickName?: string;
  status?: string;
  createdAt?: string;
}

const RisingArtistDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useUiTranslate();

  const emergingArtistId = location.state?.emergingArtistId as number | undefined;

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isTrackingRef = useRef(false);

  const EDGE_WIDTH = 24;
  const MIN_DISTANCE = 80;
  const MAX_VERTICAL_DRIFT = 50;

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!isRealNativeApp) return;

    const t0 = e.touches[0];
    startXRef.current = t0.clientX;
    startYRef.current = t0.clientY;

    isTrackingRef.current = t0.clientX <= EDGE_WIDTH;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isRealNativeApp || !isTrackingRef.current) return;

    const t0 = e.touches[0];
    const vertical = Math.abs(t0.clientY - startYRef.current);

    if (vertical > MAX_VERTICAL_DRIFT) {
      isTrackingRef.current = false;
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!isRealNativeApp || !isTrackingRef.current) return;

    const t0 = e.changedTouches[0];
    const diffX = t0.clientX - startXRef.current;

    if (diffX > MIN_DISTANCE) {
      navigate(-1);
    }

    isTrackingRef.current = false;
  };

  const [artist, setArtist] = useState<RisingArtistDetailInfo | null>(null);
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

  const {
    liveRooms,
    hasMoreLive,
    isLoading: isLoadingRooms,
    error: roomsError,
    handleLoadMore,
  } = useArtistRooms(artist?.emergingArtistId);

  const isFollowing = artist
    ? !!artist.followedAt || followingSet.has(artist.emergingArtistId)
    : false;

  useEffect(() => {
    const fetchPageData = async () => {
      if (!emergingArtistId) {
        setIsLoadingPage(false);
        return;
      }
      setIsLoadingPage(true);
      try {
        const artistData = await getEmergingArtistDetail(emergingArtistId);
        setArtist(artistData as RisingArtistDetailInfo);
      } catch {
        setArtist(null);
      } finally {
        setIsLoadingPage(false);
      }
    };
    fetchPageData();
  }, [emergingArtistId]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchFollowedArtists();
    }
  }, [isLoggedIn, fetchFollowedArtists]);

  if (isLoadingPage) {
    return (
      <div className="flex w-full bg-gray-50">
        <LeftSidebar />

        <main className="flex-1 p-6 space-y-10 animate-pulse">
          <div className="bg-white p-6 rounded-2xl shadow flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded-2xl" />
              <div className="space-y-3">
                <div className="h-8 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-40 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded-full" />
          </div>
        </main>

        {artist && <RightSidebar artistId={artist.emergingArtistId} />}
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="p-10 text-center text-gray-500">
        {t("artistDetail.notFound", "아티스트를 찾을 수 없습니다.")}
      </div>
    );
  }

  const handleFollowToggle = async () => {
    if (!myUser) {
      alert(
        t("artistDetail.loginRequiredAlert", "로그인이 필요합니다."),
      );
      return;
    }
    if (!artist) return;

    try {
      if (isFollowing) {
        await unfollowArtist(artist.emergingArtistId);
        removeFollow(artist.emergingArtistId);
        setArtist((prev) => (prev ? { ...prev, followedAt: null } : prev));
      } else {
        await followArtist(artist.emergingArtistId);
        addFollow({
          artistId: artist.emergingArtistId,
          nameEn: artist.nameEn,
          nameKr: artist.nameKr,
          imgUrl: artist.imgUrl ?? "",
          debutDate: artist.debutDate,
          followerCount: artist.followerCount ?? 0,
        } as Artist);
        setArtist((prev) =>
          prev ? { ...prev, followedAt: new Date().toISOString() } : prev,
        );
      }
    } catch {
      alert(
        t(
          "artistDetail.requestFailed",
          "요청 처리에 실패했습니다.",
        ),
      );
    }
  };

  if (isNativeApp) {
    return (
      <div
        className="w-full min-h-screen bg-[#F8F7FF]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <main className="px-4 pt-4 pb-6 space-y-6">
          <section className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-4">
            <img
              src={artist.imgUrl || PLACEHOLDER_URL}
              alt={artist.nameEn}
              className="w-20 h-20 rounded-2xl object-cover shadow"
            />

            <div className="flex-1 flex flex-col gap-1">
              <div>
                <h1 className="text-xl font-bold">{artist.nameKr}</h1>
                <p className="text-xs text-gray-600">{artist.nameEn}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {t(
                    "artistDetail.debutLabelShort",
                    "데뷔일 ",
                  )}
                  {new Date(artist.debutDate).toLocaleDateString("ko-KR")}
                </p>
                {artist.createdByUserNickName && (
                  <p className="text-[11px] text-purple-600 font-semibold mt-0.5">
                    {t("risingArtist.createdBy", "등록한 사용자: ")}
                    {artist.createdByUserNickName}
                  </p>
                )}
              </div>

              {isLoggedIn && (
                <button
                  onClick={handleFollowToggle}
                  className={
                    isFollowing
                      ? "mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold"
                      : "mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold shadow-sm"
                  }
                >
                  {isFollowing
                    ? t(
                        "artistDetail.following",
                        "팔로우 중",
                      )
                    : t("artistDetail.follow", "+ 팔로우")}
                </button>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 text-white shadow-lg shadow-purple-200/60">
                  <Video size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {t("artistDetail.live.title", "라이브 방")}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {t(
                      "artistDetail.live.count",
                      "{count}개의 방이 진행 중",
                    ).replace("{count}", String(liveRooms.length))}
                  </p>
                </div>
              </div>

              <div className="flex-1 flex justify-end">
                {isLoggedIn ? (
                  isFollowing ? (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold shadow-md shadow-purple-300/60"
                    >
                      <Plus size={14} />
                      <span>
                        {t(
                          "artistDetail.live.createRoom",
                          "새 방 만들기",
                        )}
                      </span>
                    </button>
                  ) : (
                    <div className="max-w-[180px] text-[10px] text-center text-gray-600 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg leading-snug">
                      {t(
                        "artistDetail.live.followRequiredPrefix",
                        "이 아티스트를 ",
                      )}
                      <span className="font-semibold text-purple-700">
                        {t("artistDetail.followVerb", "팔로우")}
                      </span>
                      {t(
                        "artistDetail.live.followRequiredSuffix",
                        "해야 방을 생성할 수 있습니다.",
                      )}
                    </div>
                  )
                ) : (
                  <div className="max-w-[200px] text-[10px] text-center text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg leading-snug">
                    <span className="font-semibold">
                      {t("common.login", "로그인")}
                    </span>
                    {t(
                      "artistDetail.live.loginRequiredSuffix",
                      " 후 방을 생성할 수 있습니다.",
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {isLoadingRooms && (
                <p className="text-xs text-gray-500 px-1">
                  {t(
                    "artistDetail.live.loadingShort",
                    "방 목록을 불러오는 중입니다...",
                  )}
                </p>
              )}

              {roomsError && (
                <p className="text-xs text-red-500 px-1">{roomsError}</p>
              )}

              {!isLoadingRooms && !roomsError && liveRooms.length === 0 && (
                <p className="text-xs text-gray-400 px-1">
                  {t(
                    "artistDetail.live.empty",
                    "현재 진행 중인 라이브 방송이 없습니다.",
                  )}
                </p>
              )}

              {!isLoadingRooms && !roomsError && liveRooms.length > 0 && (
                <div className="space-y-4">
                  {liveRooms.map((room: any) => (
                    <VideoCard key={room.roomId} {...room} />
                  ))}
                </div>
              )}

              {hasMoreLive && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingRooms}
                  className="mt-1 w-full rounded-full border border-gray-200 bg-gray-50 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  {t("common.loadMore", "더보기")}
                </button>
              )}
            </div>
          </section>
        </main>

        <CreateRoomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          artistId={artist.emergingArtistId}
          hostId={myUser?.userId ?? ""}
          hostNickname={myUser?.nickname ?? ""}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full">
      <div className="hidden lg:block">
        <LeftSidebar />
      </div>

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
                {t(
                  "artistDetail.debutLabelFull",
                  "데뷔일:",
                )}{" "}
                {new Date(artist.debutDate).toLocaleDateString("ko-KR")}
              </p>
              {artist.createdByUserNickName && (
                <p className="text-sm text-purple-600 font-semibold mt-1">
                  {t("risingArtist.createdBy", "등록한 사용자: ")}
                  {artist.createdByUserNickName}
                </p>
              )}
            </div>
          </div>
          {isLoggedIn && (
            <div className="w-full sm:w-auto flex-shrink-0">
              {isFollowing ? (
                <button
                  className="w-full sm:w-auto bg-purple-100 text-purple-700 font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors hover:bg-purple-200"
                  onClick={handleFollowToggle}
                >
                  {t("artistDetail.following", "팔로우 중")}
                </button>
              ) : (
                <button
                  className="w-full sm:w-auto bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors hover:bg-purple-700"
                  onClick={handleFollowToggle}
                >
                  {t("artistDetail.follow", "+ 팔로우")}
                </button>
              )}
            </div>
          )}
        </div>

        <section>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 rounded-2xl bg-white p-5 shadow-md border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 text-white shadow-lg shadow-purple-200/50">
                <Video size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {t("artistDetail.live.title", "라이브 방")}
                </h2>
                <p className="text-sm text-gray-500">
                  {t(
                    "artistDetail.live.count",
                    "{count}개의 방이 진행 중",
                  ).replace("{count}", String(liveRooms.length))}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto flex-shrink-0">
              {isLoggedIn ? (
                isFollowing ? (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-purple-300/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <Plus size={16} />
                    <span>{t("artistDetail.live.createRoom", "새 방 만들기")}</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-center text-sm text-gray-600 bg-purple-50 border border-purple-200 px-4 py-2 rounded-lg break-words max-w-xs sm:max-w-sm text-center">
                    {t(
                      "artistDetail.live.followRequiredPrefix",
                      "이 아티스트를 ",
                    )}
                    <span className="font-semibold text-purple-700">
                      {t("artistDetail.followVerb", "팔로우")}
                    </span>
                    {t(
                      "artistDetail.live.followRequiredSuffix",
                      "해야 방을 생성할 수 있습니다.",
                    )}
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center text-sm text-gray-600 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg break-words max-w-xs sm:max-w-sm text-center">
                  <span className="font-semibold">
                    {t("common.login", "로그인")}
                  </span>
                  {t(
                    "artistDetail.live.loginRequiredSuffix",
                    " 후 방을 생성할 수 있습니다.",
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-8">
            {isLoadingRooms && (
              <p>
                {t(
                  "artistDetail.live.loadingLong",
                  "방송 목록을 불러오는 중...",
                )}
              </p>
            )}
            {roomsError && (
              <p className="text-red-500">{roomsError}</p>
            )}

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
                    {t(
                      "artistDetail.live.empty",
                      "현재 진행 중인 라이브 방송이 없습니다.",
                    )}
                  </p>
                )}
              </>
            )}

            {hasMoreLive && (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingRooms}
                className="mt-4 px-6 py-2 bg-white border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                {t("common.loadMore", "더보기")}
              </button>
            )}
          </div>
        </section>
      </main>

      <div className="hidden lg:block">
        <RightSidebar artistId={artist!.emergingArtistId} />
      </div>

      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        artistId={artist.emergingArtistId}
        hostId={myUser?.userId ?? ""}
        hostNickname={myUser?.nickname ?? ""}
      />
    </div>
  );
};

export default RisingArtistDetailPage;

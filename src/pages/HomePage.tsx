import {useEffect, useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {Tv} from "lucide-react";
import {motion} from "framer-motion";
import {Capacitor} from "@capacitor/core"; // 앱 여부 확인용

import ArtistCard from "../components/domain/artist/ArtistCard";
import ArtistCardSkeleton from "../components/domain/artist/ArtistCartdSekeleton";
import GuideModal, {type GuideStep} from "../components/common/modal/GuideModal";
import AuroraStreakBG from "../components/common/bg/AuroraStreakBG";
// import HeroBanner from "../components/home/HeroBanner";
import UIText from "../components/common/UIText"; // 
import AnimatedSearchBar from "../components/home/AnimatedSearchBar";

import {getRandomArtists} from "../api/artistService";
import {getRandomRisingArtists} from "../api/risingArtistService";
import {type Artist} from "../types/artist";
import {useTrendingRooms} from "../hooks/useTrendingRooms";
import {createSlug} from "../utils/slugUtils";

// const BANNER_AUTOPLAY_MS = 4800;
const isNativeApp = Capacitor.isNativePlatform() || window.innerWidth <= 768; // 

const HomePage = () => {
  // const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [recommendedArtists, setRecommendedArtists] = useState<Artist[]>([]);
  const [risingArtists, setRisingArtists] = useState<Artist[]>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(true);
  const [isLoadingRisingArtists, setIsLoadingRisingArtists] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideIndex, setGuideIndex] = useState(0);
  const [expandedRoomIndex, setExpandedRoomIndex] = useState(0);
  const navigate = useNavigate();

  const {
    data: trendingRooms,
    isLoading: isLoadingTrending,
    error: trendingError,
  } = useTrendingRooms(1, 4);

  // 2560x1440 비율의 배너 이미지 + 마지막 가상 CTA
  // const banners = useMemo(
  //   () => [
  //     {id: 1, img: "https://duckon-bucket.s3.ap-northeast-2.amazonaws.com/banner/blackpink_HYLT_banner.jpeg"},
  //     {id: 11, img: "https://duckon-bucket.s3.ap-northeast-2.amazonaws.com/banner/newjeans_closeup_banner.jpeg"},
  //     {id: 2, img: "https://duckon-bucket.s3.ap-northeast-2.amazonaws.com/banner/blacnkpink_KTL_banner.jpeg"},
  //     {id: 3, img: "https://duckon-bucket.s3.ap-northeast-2.amazonaws.com/banner/aespa_armageddon_banner.jpeg"},
  //     {
  //       id: 8,
  //       img: "https://dn9z1o6i8w44p.cloudfront.net/memes%2F2025%2F11%2Ff47c930a-44b8-488b-b30a-58cd45dc99b7.gif",
  //     },
  //     {id: 10, img: "https://duckon-bucket.s3.ap-northeast-2.amazonaws.com/banner/newjeans_blue_banner.jpeg"},
  //     {id: 13, img: "https://duckon-bucket.s3.ap-northeast-2.amazonaws.com/banner/newjeans_mirror_banner.jpeg"},
  //     {
  //       id: 15,
  //       title: "지금 바로 시작하세요",
  //       subtitle: "방을 만들고 팬들과 함께 즐겨보세요",
  //       gradient: "from-fuchsia-500 via-rose-500 to-amber-500",
  //     },
  //   ],
  //   []
  // );

  const guideSteps: GuideStep[] = [
    {
      title: "아티스트 검색 & 팔로우",
      desc: "아티스트 목록에서 좋아하는 아티스트를 찾아 [팔로우]를 눌러주세요. 팔로우하면 전용 채팅과 라이브 알림을 받을 수 있어요.",
      img: "/guide/follow.png",
      alt: "아티스트 상세에서 팔로우 버튼 위치",
    },
    {
      title: "새 방 만들기",
      desc: "아티스트 페이지의 [새 방 만들기] 버튼을 눌러 방을 생성할 수 있어요. 팔로우 중인 아티스트에서만 방 생성이 가능해요.",
      img: "/guide/create-room.png",
      alt: "아티스트 페이지의 새 방 만들기 버튼 위치",
    },
    {
      title: "유튜브 URL & 입장 설정",
      desc: "방 제목과 유튜브 URL을 입력하고, 필요하다면 비밀번호/입장 질문을 설정하세요. 완료하면 팬들과 함께 실시간으로 즐길 준비 끝!",
      img: "/guide/room-form.png",
      alt: "방 만들기 폼 작성 화면",
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        const data = await getRandomArtists(5);
        setRecommendedArtists(data);
      } catch {
        setRecommendedArtists([]);
      } finally {
        setIsLoadingArtists(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await getRandomRisingArtists(5);
        setRisingArtists(data);
      } catch {
        setRisingArtists([]);
      } finally {
        setIsLoadingRisingArtists(false);
      }
    })();
  }, []);

  return (
    <div className="w-full relative">
      <AuroraStreakBG />

      {/* HERO (유튜브 권장 비율 + 세이프존) - 임시로 숨김 */}
      {/* <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
        <HeroBanner
          items={banners as any}
          current={currentBannerIndex}
          setCurrent={setCurrentBannerIndex}
          autoplayMs={BANNER_AUTOPLAY_MS}
          onOpenGuide={(i = 0) => {
            setGuideIndex(i);
            setGuideOpen(true);
          }}
        />
      </div> */}

      {/* 애니메이션 검색바 */}
      <AnimatedSearchBar
        onSearch={(query) => {
          // 검색 기능 구현 (필요시 navigate 등 추가)
          console.log("Search query:", query);
        }}
      />

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-24">
        {/* 트렌딩 방 */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              🔥{" "}
              <UIText id="home.trending.title">
                지금 핫한 방!
              </UIText>{" "}
              {trendingRooms && trendingRooms.roomInfoList.length > 0
                ? `Top ${trendingRooms.roomInfoList.length}`
                : null}
            </h2>
            {trendingRooms && trendingRooms.roomInfoList.length > 0 && (
              <Link
                to="/room-list"
                className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
              >
                <UIText id="common.viewAll">전체 보기 →</UIText>
              </Link>
            )}
          </div>

          {isLoadingTrending ? (
            <div className="flex flex-col md:flex-row gap-2 md:h-[432px]">
              {Array.from({length: 4}).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-[250px] md:h-auto bg-gray-200 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : trendingError ? (
            <p className="w-full text-center text-red-500 py-20">{trendingError}</p>
          ) : trendingRooms?.roomInfoList && trendingRooms?.roomInfoList.length > 0 ? (
            <>
              {/* PC */}
              <div className="hidden md:flex gap-0 h-[432px] overflow-hidden rounded-2xl">
                {trendingRooms.roomInfoList.slice(0, 4).map((room, index) => {
                  const isExpanded = expandedRoomIndex === index;
                  const isFirst = index === 0;
                  const isLast =
                    index === trendingRooms.roomInfoList.slice(0, 4).length - 1;
                  const PLACEHOLDER_URL =
                    "https://placehold.co/1280x720?text=No+Image&font=roboto";
                  return (
                    <div
                      key={room.roomId}
                      className={`relative overflow-hidden cursor-pointer transition-all duration-500 ease-out ${isExpanded ? "flex-[9]" : "flex-[2]"
                        } ${isFirst ? "rounded-l-2xl" : ""} ${isLast ? "rounded-r-2xl" : ""
                        }`}
                      onMouseEnter={() => setExpandedRoomIndex(index)}
                      onClick={() => navigate(`/live/${room.roomId}`)}
                    >
                      <div className="absolute inset-0 overflow-hidden">
                        <img
                          src={room.imgUrl || PLACEHOLDER_URL}
                          alt={room.title}
                          className="h-full min-w-full object-cover object-center"
                          style={{width: "auto"}}
                        />
                      </div>
                      <div
                        className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-500 ${isExpanded
                          ? "from-black/80 via-black/40 to-transparent opacity-100"
                          : "from-black/60 to-transparent opacity-80"
                          }`}
                      />
                      <div className="absolute top-4 left-4 z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
                          <Tv className="h-4 w-4" />
                          <span className="font-semibold">
                            {room.participantCount.toLocaleString()}{" "}
                            <UIText id="home.trending.viewerSuffix">
                              명 시청 중
                            </UIText>
                          </span>
                        </div>
                      </div>
                      <div className="relative h-full flex flex-col justify-end p-6">
                        <h3
                          className={`text-white font-bold mb-2 transition-all duration-500 ${isExpanded
                            ? "text-2xl line-clamp-2"
                            : "text-lg line-clamp-3"
                            }`}
                        >
                          {room.title}
                        </h3>
                        <div className="flex items-center gap-3">
                          <img
                            src={room.hostProfileImgUrl || "/default_image.png"}
                            alt={room.hostNickname}
                            className={`rounded-full object-cover border-2 border-white/50 transition-all duration-500 ${isExpanded ? "w-10 h-10" : "w-8 h-8"
                              }`}
                          />
                          <span
                            className={`text-white/90 font-medium transition-all duration-500 ${isExpanded ? "text-base" : "text-sm"
                              }`}
                          >
                            {room.hostNickname}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`absolute inset-0 border-4 border-purple-500 transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0"
                          } ${isFirst ? "rounded-l-2xl" : ""} ${isLast ? "rounded-r-2xl" : ""
                          }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* 모바일 - 웹: 기존 세로 카드 레이아웃 유지 */}
              {!isNativeApp && (
                <div className="md:hidden flex flex-col gap-4">
                  {trendingRooms.roomInfoList.slice(0, 4).map((room) => {
                    const PLACEHOLDER_URL =
                      "https://placehold.co/1280x720?text=No+Image&font=roboto";
                    return (
                      <div
                        key={room.roomId}
                        className="relative h-[250px] overflow-hidden cursor-pointer rounded-2xl"
                        onClick={() => navigate(`/live/${room.roomId}`)}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url('${room.imgUrl || PLACEHOLDER_URL}')`,
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute top-3 left-3 z-10">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
                            <Tv className="h-3 w-3" />
                            <span className="font-semibold">
                              {room.participantCount.toLocaleString()}{" "}
                              <UIText id="home.trending.viewerSuffix">
                                명 시청 중
                              </UIText>
                            </span>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white text-lg font-bold mb-2 line-clamp-2">
                            {room.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <img
                              src={room.hostProfileImgUrl || "/default_image.png"}
                              alt={room.hostNickname}
                              className="w-8 h-8 rounded-full object-cover border-2 border-white/50"
                            />
                            <span className="text-white/90 text-sm font-medium">
                              {room.hostNickname}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 모바일 - 앱: 한 장씩 가로 캐러셀 (웹과 동일한 하단 구조) */}
              {isNativeApp && (
                <div className="md:hidden mt-2">
                  <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-1 pb-2">
                    {trendingRooms.roomInfoList.slice(0, 4).map((room) => {
                      const PLACEHOLDER_URL =
                        "https://placehold.co/1280x720?text=No+Image&font=roboto";
                      return (
                        <button
                          key={room.roomId}
                          type="button"
                          className="snap-center shrink-0 w-[86%] last:mr-3 relative rounded-2xl overflow-hidden bg-black/70 aspect-[16/9] active:scale-95 transition"
                          onClick={() => navigate(`/live/${room.roomId}`)}
                        >
                          {/* 썸네일 */}
                          <img
                            src={room.imgUrl || PLACEHOLDER_URL}
                            alt={room.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />

                          {/* 오버레이 */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                          {/* 상단 시청자 배지 */}
                          <div className="absolute top-3 left-3 z-10">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/55 backdrop-blur-sm rounded-full text-white text-xs">
                              <Tv className="h-3 w-3" />
                              <span className="font-semibold">
                                {room.participantCount.toLocaleString()}{" "}
                                <UIText id="home.trending.viewerSuffix">
                                  명 시청 중
                                </UIText>
                              </span>
                            </div>
                          </div>

                          {/* 하단: 제목 + 호스트 (웹 카드와 거의 동일) */}
                          <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end">
                            <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 text-left">
                              {room.title}
                            </h3>
                            <div className="flex items-center gap-3">
                              <img
                                src={room.hostProfileImgUrl || "/default_image.png"}
                                alt={room.hostNickname}
                                className="w-9 h-9 rounded-full object-cover border-2 border-white/50"
                              />
                              <span className="text-white/90 text-sm font-medium">
                                {room.hostNickname}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-gray-400 text-right pr-2">
                    <UIText id="home.trending.swipeHint">
                      좌우로 스와이프해서 다른 방도 확인해보세요
                    </UIText>
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="w-full flex flex-col items-center justify-center text-center text-gray-500 py-20 bg-gray-100 rounded-2xl">
              <Tv size={48} className="text-gray-300 mb-4" />
              <p className="font-semibold text-gray-600">
                <UIText id="home.trending.emptyTitle">
                  아직 생성된 방이 없습니다.
                </UIText>
              </p>
              <p className="text-sm mt-1">
                <UIText id="home.trending.emptyDesc">
                  가장 먼저 라이브를 시작해보세요!
                </UIText>
              </p>
            </div>
          )}
        </section>

        {/* 주목해야 할 아티스트 */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              <UIText id="home.featuredArtists.title">
                주목해야 할 아티스트!
              </UIText>
            </h2>

            {/* 웹에서만 '더보기 →' 보이도록 */}
            {!isNativeApp && (
              <Link
                to="/artist-list"
                className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
              >
                <UIText id="common.more">더보기 →</UIText>
              </Link>
            )}
          </div>

          {/* 웹: 기존 UI 100% 동일 유지 */}
          {!isNativeApp && (
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {isLoadingArtists
                ? Array.from({length: 5}).map((_, i) => (
                  <ArtistCardSkeleton key={i} />
                ))
                : recommendedArtists.map((artist) => (
                  <motion.div
                    key={artist.artistId}
                    initial={{opacity: 0, y: 10}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.2}}
                    transition={{duration: 0.35, ease: "easeOut"}}
                  >
                    <ArtistCard
                      {...artist}
                      onClick={() => {
                        const slug = createSlug(artist.nameEn);
                        navigate(`/artist/${slug}`, {
                          state: {artistId: artist.artistId},
                        });
                      }}
                    />
                  </motion.div>
                ))}
            </div>
          )}

          {/* 앱: 덕온 톤의 라이트 카드 + 동그라미 아티스트 */}
          {isNativeApp && (
            <div className="md:hidden rounded-3xl bg-white/90 backdrop-blur-sm border border-white/70 px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,.12)]">
              <div className="grid grid-cols-3 gap-4">
                {isLoadingArtists
                  ? // 로딩 스켈레톤
                  Array.from({length: 5}).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-2 animate-pulse"
                    >
                      <div className="w-20 h-20 rounded-full bg-slate-200/80" />
                      <div className="w-16 h-3 rounded-full bg-slate-200/80" />
                    </div>
                  ))
                  : // 실제 아티스트 (최대 5명)
                  recommendedArtists.slice(0, 5).map((artist) => (
                    <button
                      key={artist.artistId}
                      type="button"
                      className="flex flex-col items-center gap-2 active:scale-95 transition"
                      onClick={() => {
                        const slug = createSlug(artist.nameEn);
                        navigate(`/artist/${slug}`, {
                          state: {artistId: artist.artistId},
                        });
                      }}
                    >
                      {/* 그라데이션 링 + 둥근 썸네일 */}
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-sky-400 p-[2px]">
                        <div className="w-full h-full rounded-full overflow-hidden bg-slate-200">
                          <img
                            src={artist.imgUrl || "/default_image.png"}
                            alt={artist.nameKr || artist.nameEn}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-900 font-semibold text-center leading-tight line-clamp-2">
                        {artist.nameKr || artist.nameEn}
                      </p>
                    </button>
                  ))}

                {/* 전체 아티스트로 가는 '전체 보기' 동그라미 */}
                <button
                  type="button"
                  onClick={() => navigate("/artist-list")}
                  className="flex flex-col items-center gap-2 active:scale-95 transition"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-500 to-amber-400 flex items-center justify-center text-xs font-bold text-white shadow-[0_10px_25px_rgba(15,23,42,.35)]">
                    <UIText id="home.featuredArtists.allArtistsCircle">
                      전체 아티스트
                    </UIText>
                  </div>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 라이징 아티스트 */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              <UIText id="home.risingArtists.title">
                라이징 아티스트
              </UIText>
            </h2>

            {/* 웹에서만 '더보기 →' 보이도록 */}
            {!isNativeApp && (
              <Link
                to="/artist-list?tab=rising"
                className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
              >
                <UIText id="common.more">더보기 →</UIText>
              </Link>
            )}
          </div>

          {/* 웹: 기존 UI 100% 동일 유지 */}
          {!isNativeApp && (
            <>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {isLoadingRisingArtists
                  ? Array.from({length: 5}).map((_, i) => (
                    <ArtistCardSkeleton key={i} />
                  ))
                  : risingArtists.map((artist) => (
                    <motion.div
                      key={artist.artistId}
                      initial={{opacity: 0, y: 10}}
                      whileInView={{opacity: 1, y: 0}}
                      viewport={{once: true, amount: 0.2}}
                      transition={{duration: 0.35, ease: "easeOut"}}
                    >
                      <ArtistCard
                        {...artist}
                        onClick={() => {
                          const slug = createSlug(artist.nameEn);
                          navigate(`/rising-artist/${slug}`, {
                            state: {emergingArtistId: artist.artistId},
                          });
                        }}
                      />
                    </motion.div>
                  ))}
              </div>

              {/* CTA: 아티스트 추가하기 - 웹 */}
              <motion.div
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{duration: 0.4, delay: 0.2}}
                className="mt-8 mx-auto max-w-2xl"
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 border border-purple-100/50 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-fuchsia-200/30 to-purple-200/30 rounded-full blur-2xl" />
                  
                  <div className="relative px-6 py-5 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-purple-900 mb-1">
                        <UIText id="home.risingArtists.cta.title">
                          원하는 아티스트가 없나요?
                        </UIText>
                      </p>
                      <p className="text-xs text-purple-700/80">
                        <UIText id="home.risingArtists.cta.subtitle">
                          직접 추가하고 팬들과 함께 즐겨보세요
                        </UIText>
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/artist-list?tab=rising")}
                      className="
                        shrink-0 px-5 py-2.5 rounded-xl
                        bg-gradient-to-r from-purple-600 to-fuchsia-600
                        hover:from-purple-700 hover:to-fuchsia-700
                        text-white text-sm font-bold
                        shadow-md hover:shadow-xl
                        transition-all duration-200
                        active:scale-95
                        flex items-center gap-2
                      "
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <UIText id="home.risingArtists.cta.button">
                        아티스트 추가하기
                      </UIText>
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* 앱: 덕온 톤의 라이트 카드 + 동그라미 아티스트 */}
          {isNativeApp && (
            <>
              <div className="md:hidden rounded-3xl bg-white/90 backdrop-blur-sm border border-white/70 px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,.12)]">
                <div className="grid grid-cols-3 gap-4">
                  {isLoadingRisingArtists
                    ? Array.from({length: 5}).map((_, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-2 animate-pulse"
                      >
                        <div className="w-20 h-20 rounded-full bg-slate-200/80" />
                        <div className="w-16 h-3 rounded-full bg-slate-200/80" />
                      </div>
                    ))
                    : risingArtists.slice(0, 5).map((artist) => (
                      <button
                        key={artist.artistId}
                        type="button"
                        className="flex flex-col items-center gap-2 active:scale-95 transition"
                        onClick={() => {
                          const slug = createSlug(artist.nameEn);
                          navigate(`/rising-artist/${slug}`, {
                            state: {emergingArtistId: artist.artistId},
                          });
                        }}
                      >
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-sky-400 p-[2px]">
                          <div className="w-full h-full rounded-full overflow-hidden bg-slate-200">
                            <img
                              src={artist.imgUrl || "/default_image.png"}
                              alt={artist.nameKr || artist.nameEn}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-900 font-semibold text-center leading-tight line-clamp-2">
                          {artist.nameKr || artist.nameEn}
                        </p>
                      </button>
                    ))}

                  {/* 전체 라이징 아티스트로 가는 '전체 보기' 동그라미 */}
                  <button
                    type="button"
                    onClick={() => navigate("/artist-list?tab=rising")}
                    className="flex flex-col items-center gap-2 active:scale-95 transition"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-500 to-amber-400 flex items-center justify-center text-xs font-bold text-white shadow-[0_10px_25px_rgba(15,23,42,.35)]">
                      <UIText id="home.risingArtists.allArtistsCircle">
                        전체 보기
                      </UIText>
                    </div>
                  </button>
                </div>
              </div>

              {/* CTA: 아티스트 추가하기 - 앱 */}
              <motion.div
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{duration: 0.4, delay: 0.2}}
                className="mt-4"
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 border border-purple-100/50 shadow-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-fuchsia-200/30 to-purple-200/30 rounded-full blur-2xl" />
                  
                  <div className="relative px-6 py-5 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-purple-900 mb-1">
                        <UIText id="home.risingArtists.cta.title">
                          원하는 아티스트가 없나요?
                        </UIText>
                      </p>
                      <p className="text-xs text-purple-700/80">
                        <UIText id="home.risingArtists.cta.subtitle">
                          직접 추가하고 팬들과 함께 즐겨보세요
                        </UIText>
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/artist-list?tab=rising")}
                      className="
                        shrink-0 px-5 py-2.5 rounded-xl
                        bg-gradient-to-r from-purple-600 to-fuchsia-600
                        hover:from-purple-700 hover:to-fuchsia-700
                        text-white text-sm font-bold
                        shadow-md hover:shadow-xl
                        transition-all duration-200
                        active:scale-95
                        flex items-center gap-2
                      "
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <UIText id="home.risingArtists.cta.button">
                        아티스트 추가하기
                      </UIText>
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </section>

        {/* 빠르게 시작하기 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              <UIText id="home.quickStart.title">
                빠르게 시작하기
              </UIText>
            </h2>
          </div>

          {/* 웹 / 웹 모바일: 기존 그리드 유지 */}
          {!isNativeApp && (
            <div className="grid md:grid-cols-3 gap-6">
              {guideSteps.map((s, i) => (
                <motion.button
                  key={i}
                  onClick={() => {
                    setGuideIndex(i);
                    setGuideOpen(true);
                  }}
                  className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-xl transition-all text-left hover:-translate-y-1 hover:[box-shadow:0_24px_60px_rgba(99,102,241,.18)]"
                  whileHover={{y: -2}}
                >
                  <div className="relative">
                    <img
                      src={s.img}
                      alt={s.alt}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold tracking-wider text-purple-600">
                      STEP {i + 1}
                    </p>
                    <h3 className="text-lg font-bold mt-1">{s.title}</h3>
                    <p className="text-gray-600 mt-1 line-clamp-2">{s.desc}</p>
                    <span className="inline-block mt-3 text-purple-600 group-hover:translate-x-0.5 transition">
                      <UIText id="common.viewDetail">
                        자세히 보기 →
                      </UIText>
                    </span>
                  </div>
                  <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5 group-hover:ring-purple-300/50 transition" />
                </motion.button>
              ))}
            </div>
          )}

          {/* 앱: 한 장씩 옆으로 스와이프하는 캐러셀 */}
          {isNativeApp && (
            <div className="md:hidden mt-1">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-1 pb-2">
                {guideSteps.map((s, i) => (
                  <motion.button
                    key={i}
                    onClick={() => {
                      setGuideIndex(i);
                      setGuideOpen(true);
                    }}
                    className="snap-center shrink-0 w-[86%] last:mr-3 group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border border-white/60 shadow-sm text-left"
                    whileTap={{scale: 0.97}}
                  >
                    <div className="relative">
                      <img
                        src={s.img}
                        alt={s.alt}
                        className="w-full h-44 object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-active:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] font-semibold tracking-wider text-purple-600">
                        STEP {i + 1}
                      </p>
                      <h3 className="text-base font-bold mt-1">{s.title}</h3>
                      <p className="text-[13px] text-gray-600 mt-1 line-clamp-2">
                        {s.desc}
                      </p>
                      <span className="inline-block mt-3 text-purple-600 text-xs">
                        <UIText id="common.viewDetail">
                          자세히 보기 →
                        </UIText>
                      </span>
                    </div>
                    <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5 group-active:ring-purple-300/50 transition" />
                  </motion.button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-gray-400 text-right pr-2">
                <UIText id="home.quickStart.swipeHint">
                  좌우로 스와이프해서 가이드를 확인해보세요
                </UIText>
              </p>
            </div>
          )}
        </section>
      </main>

      {/* 가이드 모달 */}
      <GuideModal
        open={guideOpen}
        steps={guideSteps}
        index={guideIndex}
        onClose={() => setGuideOpen(false)}
        onPrev={() =>
          setGuideIndex((i) => (i - 1 + guideSteps.length) % guideSteps.length)
        }
        onNext={() => setGuideIndex((i) => (i + 1) % guideSteps.length)}
      />
    </div>
  );
};

export default HomePage;

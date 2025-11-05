import {useEffect, useMemo, useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {Tv} from "lucide-react";
import {motion} from "framer-motion";

import ArtistCard from "../components/domain/artist/ArtistCard";
import ArtistCardSkeleton from "../components/domain/artist/ArtistCartdSekeleton";
import GuideModal, {type GuideStep} from "../components/common/modal/GuideModal";
import AuroraStreakBG from "../components/common/bg/AuroraStreakBG";
import HeroBanner from "../components/home/HeroBanner";

import {getRandomArtists} from "../api/artistService";
import {type Artist} from "../types/artist";
import {useTrendingRooms} from "../hooks/useTrendingRooms";
import {createSlug} from "../utils/slugUtils";

const BANNER_AUTOPLAY_MS = 4800;

const HomePage = () => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [recommendedArtists, setRecommendedArtists] = useState<Artist[]>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(true);
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
  const banners = useMemo(
    () => [
      {id: 1, img: "https://duckon-bucket.s3.ap-northeast-2.amazonaws.com/banner/blackpink_HYLT_banner.jpeg"},
      {id: 11, img: "https://duckon-bucket.s3.ap-northeast-2.amazonaws.com/banner/newjeans_closeup_banner.jpeg"},
      {id: 2, img: "https://duckon-bucket.s3.ap-northeast-2.amazonaws.com/banner/blacnkpink_KTL_banner.jpeg"},
      {id: 3, img: "https://duckon-bucket.s3.ap-northeast-2.amazonaws.com/banner/aespa_armageddon_banner.jpeg"},
      {id: 8, img: "https://duckon-bucket.s3.ap-northeast-2.amazonaws.com/banner/blacnpink_black_banner.jpeg"},
      {id: 10, img: "https://duckon-bucket.s3.ap-northeast-2.amazonaws.com/banner/newjeans_blue_banner.jpeg"},
      {id: 13, img: "https://duckon-bucket.s3.ap-northeast-2.amazonaws.com/banner/newjeans_mirror_banner.jpeg"},
      {id: 15, title: "지금 바로 시작하세요", subtitle: "방을 만들고 팬들과 함께 즐겨보세요", gradient: "from-fuchsia-500 via-rose-500 to-amber-500"},
    ],
    []
  );

  const guideSteps: GuideStep[] = [
    {title: "아티스트 검색 & 팔로우", desc: "아티스트 목록에서 좋아하는 아티스트를 찾아 [팔로우]를 눌러주세요. 팔로우하면 전용 채팅과 라이브 알림을 받을 수 있어요.", img: "/guide/follow.png", alt: "아티스트 상세에서 팔로우 버튼 위치"},
    {title: "새 방 만들기", desc: "아티스트 페이지의 [새 방 만들기] 버튼을 눌러 방을 생성할 수 있어요. 팔로우 중인 아티스트에서만 방 생성이 가능해요.", img: "/guide/create-room.png", alt: "아티스트 페이지의 새 방 만들기 버튼 위치"},
    {title: "유튜브 URL & 입장 설정", desc: "방 제목과 유튜브 URL을 입력하고, 필요하다면 비밀번호/입장 질문을 설정하세요. 완료하면 팬들과 함께 실시간으로 즐길 준비 끝!", img: "/guide/room-form.png", alt: "방 만들기 폼 작성 화면"},
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

  const openGuide = (i = 0) => {setGuideIndex(i); setGuideOpen(true);};

  return (
    <div className="w-full relative">
      <AuroraStreakBG />

      {/* HERO (유튜브 권장 비율 + 세이프존) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
        <HeroBanner
          items={banners as any}
          current={currentBannerIndex}
          setCurrent={setCurrentBannerIndex}
          autoplayMs={BANNER_AUTOPLAY_MS}
        />
      </div>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-24">
        {/* 🔥 트렌딩 방 */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              🔥 지금 핫한 방{" "}
              {trendingRooms && trendingRooms.roomInfoList.length > 0
                ? `Top ${trendingRooms.roomInfoList.length}`
                : null}
            </h2>
            {trendingRooms && trendingRooms.roomInfoList.length > 0 && (
              <Link to="/room-list" className="text-purple-600 hover:text-purple-800 font-semibold transition-colors">
                전체 보기 →
              </Link>
            )}
          </div>

          {isLoadingTrending ? (
            <div className="flex flex-col md:flex-row gap-2 md:h-[432px]">
              {Array.from({length: 4}).map((_, i) => (
                <div key={i} className="flex-1 h-[250px] md:h-auto bg-gray-200 rounded-2xl animate-pulse" />
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
                  const isLast = index === trendingRooms.roomInfoList.slice(0, 4).length - 1;
                  const PLACEHOLDER_URL = "https://placehold.co/1280x720?text=No+Image&font=roboto";
                  return (
                    <div
                      key={room.roomId}
                      className={`relative overflow-hidden cursor-pointer transition-all duration-500 ease-out ${isExpanded ? "flex-[9]" : "flex-[2]"} ${isFirst ? "rounded-l-2xl" : ""} ${isLast ? "rounded-r-2xl" : ""}`}
                      onMouseEnter={() => setExpandedRoomIndex(index)}
                      onClick={() => navigate(`/live/${room.roomId}`)}
                    >
                      <div className="absolute inset-0 overflow-hidden">
                        <img
                          src={room.imgUrl || PLACEHOLDER_URL}
                          alt={room.title}
                          className="h-full min-w-full object-cover object-center"
                          style={{width: 'auto'}}
                        />
                      </div>
                      <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-500 ${isExpanded ? "from-black/80 via-black/40 to-transparent opacity-100" : "from-black/60 to-transparent opacity-80"}`} />
                      <div className="absolute top-4 left-4 z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
                          <Tv className="h-4 w-4" />
                          <span className="font-semibold">{room.participantCount.toLocaleString()}명 시청 중</span>
                        </div>
                      </div>
                      <div className="relative h-full flex flex-col justify-end p-6">
                        <h3 className={`text-white font-bold mb-2 transition-all duration-500 ${isExpanded ? "text-2xl line-clamp-2" : "text-lg line-clamp-3"}`}>{room.title}</h3>
                        <div className="flex items-center gap-3">
                          <img
                            src={room.hostProfileImgUrl || "/default_image.png"}
                            alt={room.hostNickname}
                            className={`rounded-full object-cover border-2 border-white/50 transition-all duration-500 ${isExpanded ? "w-10 h-10" : "w-8 h-8"}`}
                          />
                          <span className={`text-white/90 font-medium transition-all duration-500 ${isExpanded ? "text-base" : "text-sm"}`}>{room.hostNickname}</span>
                        </div>
                      </div>
                      <div className={`absolute inset-0 border-4 border-purple-500 transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0"} ${isFirst ? "rounded-l-2xl" : ""} ${isLast ? "rounded-r-2xl" : ""}`} />
                    </div>
                  );
                })}
              </div>

              {/* 모바일 */}
              <div className="md:hidden flex flex-col gap-4">
                {trendingRooms.roomInfoList.slice(0, 4).map((room) => {
                  const PLACEHOLDER_URL = "https://placehold.co/1280x720?text=No+Image&font=roboto";
                  return (
                    <div
                      key={room.roomId}
                      className="relative h-[250px] overflow-hidden cursor-pointer rounded-2xl"
                      onClick={() => navigate(`/live/${room.roomId}`)}
                    >
                      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url('${room.imgUrl || PLACEHOLDER_URL}')`}} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute top-3 left-3 z-10">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
                          <Tv className="h-3 w-3" />
                          <span className="font-semibold">{room.participantCount.toLocaleString()}명 시청 중</span>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white text-lg font-bold mb-2 line-clamp-2">{room.title}</h3>
                        <div className="flex items-center gap-2">
                          <img
                            src={room.hostProfileImgUrl || "/default_image.png"}
                            alt={room.hostNickname}
                            className="w-8 h-8 rounded-full object-cover border-2 border-white/50"
                          />
                          <span className="text-white/90 text-sm font-medium">{room.hostNickname}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col items-center justify-center text-center text-gray-500 py-20 bg-gray-100 rounded-2xl">
              <Tv size={48} className="text-gray-300 mb-4" />
              <p className="font-semibold text-gray-600">아직 생성된 방이 없습니다.</p>
              <p className="text-sm mt-1">가장 먼저 라이브를 시작해보세요!</p>
            </div>
          )}
        </section>

        {/* 주목해야 할 아티스트 */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">주목해야 할 아티스트!</h2>
            <Link to="/artist-list" className="text-purple-600 hover:text-purple-800 font-semibold transition-colors">
              더보기 →
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {isLoadingArtists
              ? Array.from({length: 5}).map((_, i) => <ArtistCardSkeleton key={i} />)
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
                      navigate(`/artist/${slug}`, {state: {artistId: artist.artistId}});
                    }}
                  />
                </motion.div>
              ))}
          </div>
        </section>

        {/* 빠르게 시작하기 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">빠르게 시작하기</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {guideSteps.map((s, i) => (
              <motion.button
                key={i}
                onClick={() => {setGuideIndex(i); setGuideOpen(true);}}
                className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-xl transition-all text-left hover:-translate-y-1 hover:[box-shadow:0_24px_60px_rgba(99,102,241,.18)]"
                whileHover={{y: -2}}
              >
                <div className="relative">
                  <img src={s.img} alt={s.alt} className="w-full h-48 object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold tracking-wider text-purple-600">STEP {i + 1}</p>
                  <h3 className="text-lg font-bold mt-1">{s.title}</h3>
                  <p className="text-gray-600 mt-1 line-clamp-2">{s.desc}</p>
                  <span className="inline-block mt-3 text-purple-600 group-hover:translate-x-0.5 transition">자세히 보기 →</span>
                </div>
                <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5 group-hover:ring-purple-300/50 transition" />
              </motion.button>
            ))}
          </div>
        </section>
      </main>

      {/* 가이드 모달 */}
      <GuideModal
        open={guideOpen}
        steps={guideSteps}
        index={guideIndex}
        onClose={() => setGuideOpen(false)}
        onPrev={() => setGuideIndex((i) => (i - 1 + guideSteps.length) % guideSteps.length)}
        onNext={() => setGuideIndex((i) => (i + 1) % guideSteps.length)}
      />
    </div>
  );
};

export default HomePage;

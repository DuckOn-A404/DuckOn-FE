import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Tv, HelpCircle } from "lucide-react";
import ArtistCard from "../components/domain/artist/ArtistCard";
import { getRandomArtists } from "../api/artistService";
import { type Artist } from "../types/artist";
import { useTrendingRooms } from "../hooks/useTrendingRooms";
import ArtistCardSkeleton from "../components/domain/artist/ArtistCartdSekeleton";
import GuideModal, { type GuideStep } from "../components/common/modal/GuideModal";
import { createSlug } from "../utils/slugUtils";

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

  // 배너 데이터 (임시)
  const banners = [
    { 
      id: 1, 
      title: "좋아하는 아티스트와 함께하는 시간", 
      subtitle: "실시간으로 영상을 시청하고 팬들과 소통해보세요",
      bgColor: "from-blue-600 to-purple-600"
    },
    { 
      id: 2, 
      title: "새로운 라이브 경험", 
      subtitle: "아티스트와 팬이 함께 만드는 특별한 순간",
      bgColor: "from-pink-500 to-rose-600"
    },
    { 
      id: 3, 
      title: "지금 바로 시작하세요", 
      subtitle: "방을 만들고 팬들과 함께 즐겨보세요",
      bgColor: "from-green-500 to-teal-600"
    },
    { 
      id: 4, 
      title: "실시간 소통의 즐거움", 
      subtitle: "채팅과 이모티콘으로 함께 즐기세요",
      bgColor: "from-orange-500 to-red-600"
    },
    { 
      id: 5, 
      title: "특별한 순간을 공유하세요", 
      subtitle: "팬들과 함께 만드는 최고의 라이브",
      bgColor: "from-indigo-500 to-blue-600"
    },
  ];

  const guideSteps: GuideStep[] = [
    {
      title: "아티스트 검색 & 팔로우",
      desc:
        "아티스트 목록에서 좋아하는 아티스트를 찾아 [팔로우]를 눌러주세요. " +
        "팔로우하면 전용 채팅과 라이브 알림을 받을 수 있어요.",
      img: "/guide/follow.png",
      alt: "아티스트 상세에서 팔로우 버튼 위치",
    },
    {
      title: "새 방 만들기",
      desc:
        "아티스트 페이지의 [새 방 만들기] 버튼을 눌러 방을 생성할 수 있어요. " +
        "팔로우 중인 아티스트에서만 방 생성이 가능해요.",
      img: "/guide/create-room.png",
      alt: "아티스트 페이지의 새 방 만들기 버튼 위치",
    },
    {
      title: "유튜브 URL & 입장 설정",
      desc:
        "방 제목과 유튜브 URL을 입력하고, 필요하다면 비밀번호/입장 질문을 설정하세요. " +
        "완료하면 팬들과 함께 실시간으로 즐길 준비 끝!",
      img: "/guide/room-form.png",
      alt: "방 만들기 폼 작성 화면",
    },
  ];

  const handleCardClick = (artistId: number, nameEn: string) => {
    const slug = createSlug(nameEn);
    navigate(`/artist/${slug}`, {
      state: { artistId: artistId },
    });
  };

  const handlePrevBanner = () => {
    setCurrentBannerIndex((prev) =>
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  const handleNextBanner = () => {
    setCurrentBannerIndex((prev) =>
      prev === banners.length - 1 ? 0 : prev + 1
    );
  };

  const openGuide = (i = 0) => {
    setGuideIndex(i);
    setGuideOpen(true);
  };

  const nextGuide = () => setGuideIndex((i) => (i + 1) % guideSteps.length);
  const prevGuide = () =>
    setGuideIndex((i) => (i - 1 + guideSteps.length) % guideSteps.length);

  // 배너 자동 스크롤
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    const fetchRandomArtists = async () => {
      try {
        const data = await getRandomArtists(5);
        setRecommendedArtists(data);
      } catch (error) {
        console.error("추천 아티스트를 불러오는 데 실패했습니다.", error);
        setRecommendedArtists([]);
      } finally {
        setIsLoadingArtists(false);
      }
    };
    fetchRandomArtists();
  }, []);

  return (
    <div className="w-full bg-white">
      {/* 배너 광고 섹션 */}
      <section className="relative w-full h-[230px] md:h-[269px] overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${banners[currentBannerIndex].bgColor}`} />
        
        {/* 좌측 화살표 */}
        <button
          onClick={handlePrevBanner}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
          aria-label="이전 배너"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>

        {/* 배너 콘텐츠 */}
        <div className="relative h-full flex flex-col justify-center items-center text-center text-white p-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 leading-tight drop-shadow-md">
            {banners[currentBannerIndex].title}
          </h1>
          <p className="text-sm md:text-base max-w-2xl drop-shadow-md">
            {banners[currentBannerIndex].subtitle}
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              to="/artist-list"
              className="px-5 py-2 text-sm bg-white text-purple-700 font-semibold rounded-full shadow-lg transition-transform duration-300 hover:scale-105"
            >
              아티스트 둘러보기
            </Link>
            <button
              onClick={() => openGuide(0)}
              className="px-4 py-2 text-sm rounded-full bg-purple-600 text-white font-semibold shadow-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              사용 가이드
            </button>
          </div>
        </div>

        {/* 우측 화살표 */}
        <button
          onClick={handleNextBanner}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
          aria-label="다음 배너"
        >
          <ChevronRight size={20} className="text-white" />
        </button>

        {/* 배너 인디케이터 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentBannerIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`배너 ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {/* 핫한 방송 영역 */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              🔥 지금 핫한 방{" "}
              {trendingRooms && trendingRooms.roomInfoList.length > 0
                ? `Top ${trendingRooms.roomInfoList.length}`
                : null}
            </h2>
            {trendingRooms && trendingRooms.roomInfoList.length > 0 && (
              <Link
                to="/room-list"
                className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
              >
                전체 보기 →
              </Link>
            )}
          </div>

          {isLoadingTrending ? (
            <div className="flex flex-col md:flex-row gap-2 md:h-[432px]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-[250px] md:h-auto bg-gray-200 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : trendingError ? (
            <p className="w-full text-center text-red-500 py-20">
              {trendingError}
            </p>
          ) : trendingRooms?.roomInfoList &&
            trendingRooms?.roomInfoList.length > 0 ? (
            <>
              {/* PC 버전 - 가로 확장형 */}
              <div className="hidden md:flex gap-0 h-[432px] overflow-hidden rounded-2xl">
                {trendingRooms.roomInfoList.slice(0, 4).map((room, index) => {
                  const isExpanded = expandedRoomIndex === index;
                  const isFirst = index === 0;
                  const isLast = index === trendingRooms.roomInfoList.slice(0, 4).length - 1;
                  const PLACEHOLDER_URL =
                    "https://placehold.co/1280x720?text=No+Image&font=roboto";

                  return (
                    <div
                      key={room.roomId}
                      className={`relative overflow-hidden cursor-pointer transition-all duration-500 ease-out ${
                        isExpanded ? "flex-[9]" : "flex-[2]"
                      } ${isFirst ? "rounded-l-2xl" : ""} ${isLast ? "rounded-r-2xl" : ""}`}
                      onMouseEnter={() => setExpandedRoomIndex(index)}
                      onClick={() => navigate(`/live/${room.roomId}`)}
                    >
                    {/* 배경 이미지 */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={room.imgUrl || PLACEHOLDER_URL}
                        alt={room.title}
                        className="h-full min-w-full object-cover object-center"
                        style={{ width: 'auto' }}
                      />
                    </div>

                    {/* 그라데이션 오버레이 */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-500 ${
                        isExpanded
                          ? "from-black/80 via-black/40 to-transparent opacity-100"
                          : "from-black/60 to-transparent opacity-80"
                      }`}
                    />

                    {/* 시청자 수 - 좌측 상단 고정 */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
                        <Tv className="h-4 w-4" />
                        <span className="font-semibold">
                          {room.participantCount.toLocaleString()}명 시청 중
                        </span>
                      </div>
                    </div>

                    {/* 콘텐츠 - 하단 정보 */}
                    <div className="relative h-full flex flex-col justify-end p-6">
                      {/* 방 제목 */}
                      <h3
                        className={`text-white font-bold mb-2 transition-all duration-500 ${
                          isExpanded
                            ? "text-2xl line-clamp-2"
                            : "text-lg line-clamp-3"
                        }`}
                      >
                        {room.title}
                      </h3>

                      {/* 방장 정보 */}
                      <div className="flex items-center gap-3">
                        <img
                          src={room.hostProfileImgUrl || "/default_image.png"}
                          alt={room.hostNickname}
                          className={`rounded-full object-cover border-2 border-white/50 transition-all duration-500 ${
                            isExpanded ? "w-10 h-10" : "w-8 h-8"
                          }`}
                        />
                        <span
                          className={`text-white/90 font-medium transition-all duration-500 ${
                            isExpanded ? "text-base" : "text-sm"
                          }`}
                        >
                          {room.hostNickname}
                        </span>
                      </div>
                    </div>

                      {/* 호버 효과 */}
                      <div
                        className={`absolute inset-0 border-4 border-purple-500 transition-opacity duration-300 ${
                          isExpanded ? "opacity-100" : "opacity-0"
                        } ${isFirst ? "rounded-l-2xl" : ""} ${isLast ? "rounded-r-2xl" : ""}`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* 모바일 버전 - 세로 스크롤 */}
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
                      {/* 배경 이미지 */}
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url('${room.imgUrl || PLACEHOLDER_URL}')`,
                        }}
                      />

                      {/* 그라데이션 오버레이 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      {/* 시청자 수 - 좌측 상단 */}
                      <div className="absolute top-3 left-3 z-10">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
                          <Tv className="h-3 w-3" />
                          <span className="font-semibold">
                            {room.participantCount.toLocaleString()}명 시청 중
                          </span>
                        </div>
                      </div>

                      {/* 콘텐츠 - 하단 정보 */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {/* 방 제목 */}
                        <h3 className="text-white text-lg font-bold mb-2 line-clamp-2">
                          {room.title}
                        </h3>

                        {/* 방장 정보 */}
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
            </>
          ) : (
            <div className="w-full flex flex-col items-center justify-center text-center text-gray-500 py-20 bg-gray-100 rounded-2xl">
              <Tv size={48} className="text-gray-300 mb-4" />
              <p className="font-semibold text-gray-600">
                아직 생성된 방이 없습니다.
              </p>
              <p className="text-sm mt-1">가장 먼저 라이브를 시작해보세요!</p>
            </div>
          )}
        </section>

        {/* 주목해야 할 아티스트 섹션 */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              주목해야 할 아티스트!
            </h2>
            <Link
              to="/artist-list"
              className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
            >
              더보기 →
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {isLoadingArtists
              ? Array.from({ length: 5 }).map((_, i) => (
                  <ArtistCardSkeleton key={i} />
                ))
              : recommendedArtists.map((artist) => (
                  <ArtistCard
                    key={artist.artistId}
                    {...artist}
                    onClick={() =>
                      handleCardClick(artist.artistId, artist.nameEn)
                    }
                  />
                ))}
          </div>
        </section>

        {/* 빠르게 시작하기 섹션 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">빠르게 시작하기</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {guideSteps.map((s, i) => (
              <button
                key={i}
                onClick={() => openGuide(i)}
                className="group relative rounded-2xl overflow-hidden bg-white shadow hover:shadow-lg transition-all text-left"
              >
                <img
                  src={s.img}
                  alt={s.alt}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <p className="text-sm font-semibold text-purple-600">
                    STEP {i + 1}
                  </p>
                  <h3 className="text-lg font-bold mt-1">{s.title}</h3>
                  <p className="text-gray-600 mt-1 line-clamp-2">{s.desc}</p>
                  <span className="inline-block mt-3 text-purple-600 group-hover:translate-x-0.5 transition">
                    자세히 보기 →
                  </span>
                </div>
              </button>
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
        onPrev={prevGuide}
        onNext={nextGuide}
      />
    </div>
  );
};

export default HomePage;

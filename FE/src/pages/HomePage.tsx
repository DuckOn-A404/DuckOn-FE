import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoCard from "../components/domain/video/VideoCard";
import ArtistCard from "../components/domain/artist/ArtistCard";
import { Link } from "react-router-dom";
import { getRandomArtists } from "../api/artistService";
import { type Artist } from "../types/artist";
import { useTrendingRooms } from "../hooks/useTrendingRooms";
import VideoCardSkeleton from "../components/domain/video/VideoCardSkeleton";
import ArtistCardSkeleton from "../components/domain/artist/ArtistCartdSekeleton";
import { Tv } from "lucide-react";

const HomePage = () => {
  const [recommendedArtists, setRecommendedArtists] = useState<Artist[]>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(true);
  const navigate = useNavigate();

  const {
    trendingRooms,
    isLoading: isLoadingTrending,
    error: trendingError,
  } = useTrendingRooms(3);

  const handleCardClick = (artistId: number, nameEn: string) => {
    navigate(`/artist/${nameEn}`, {
      state: { artistId: artistId },
    });
  };

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
    <div>
      {/* 랜딩(Hero) 섹션 */}
      <div
        className="relative w-full h-96 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-background.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-purple-800/70" />
        <div className="relative h-full flex flex-col justify-center items-center text-center text-white p-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-md">
            좋아하는 아티스트와
            <br />
            함께 즐기는 시간
          </h1>
          <p className="text-lg md:text-xl max-w-2xl drop-shadow-md">
            실시간으로 음악을 시청하고 팬들과 채팅으로 소통해보세요
          </p>
          <Link
            to="/artist-list"
            className="mt-8 px-8 py-3 bg-white text-purple-700 font-semibold rounded-full shadow-lg transition-transform duration-300 hover:scale-105"
          >
            아티스트 둘러보기
          </Link>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {/* 핫한 방송 영역 */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center sm:text-left">
            🔥 지금 핫한 방
          </h2>
          <div className="flex flex-wrap justify-center gap-8 flex-grow">
            {isLoadingTrending ? (
              Array.from({ length: 3 }).map((_, i) => (
                <VideoCardSkeleton key={i} />
              ))
            ) : trendingError ? (
              <p className="w-full text-center text-red-500 py-20">
                {trendingError}
              </p>
            ) : trendingRooms.length > 0 ? (
              trendingRooms.map((room) => (
                <VideoCard key={room.roomId} {...room} />
              ))
            ) : (
              <div className="w-full flex flex-col items-center justify-center text-center text-gray-500 py-20 bg-gray-100 rounded-2xl">
                <Tv size={48} className="text-gray-300 mb-4" />
                <p className="font-semibold text-gray-600">
                  아직 생성된 방이 없습니다.
                </p>
                <p className="text-sm mt-1">가장 먼저 라이브를 시작해보세요!</p>
              </div>
            )}
          </div>
        </section>

        {/* 아티스트 목록 영역 */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">주목해야 할 아티스트!</h2>
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
      </main>
    </div>
  );
};

export default HomePage;

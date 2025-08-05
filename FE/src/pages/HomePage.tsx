import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoCard from "../components/domain/video/VideoCard";
import ArtistCard from "../components/domain/artist/ArtistCard";
import { Link } from "react-router-dom";
import { getRandomArtists } from "../api/artistService";
import { type Artist } from "../types/artist";
import { dummyRooms } from "../mocks/rooms";

const HomePage = () => {
  const [recommendedArtists, setRecommendedArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 더미 데이터
  const hotRooms = dummyRooms
    .filter((room) => room.isLive)
    .sort((a, b) => b.participantCount - a.participantCount)
    .slice(0, 3);

  const handleCardClick = (artistId: number, nameEn: string) => {
    navigate(`/artist/${nameEn}`, {
      state: { artistId: artistId },
    });
  };

  useEffect(() => {
    const fetchRandomArtists = async () => {
      try {
        const data = await getRandomArtists(4);
        setRecommendedArtists(data);
      } catch (error) {
        console.error("추천 아티스트를 불러오는 데 실패했습니다.", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRandomArtists();
  }, []);

  return (
    <div>
      {/* 랜딩 사진 */}
      <div
        className="relative w-full h-80 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-background.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/70 to-transparent" />

        <div className="relative h-full flex flex-col justify-center items-start text-white p-8 sm:p-12 lg:p-24">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            좋아하는 아티스트와
            <br />
            함께 즐기는 시간
          </h1>
          <p className="text-lg md:text-xl">
            실시간으로 음악을 시청하고 팬들과 채팅으로 소통해보세요
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* 핫한 방송 영역 */}
        <section>
          <h2 className="text-2xl font-bold mb-4">🔥 지금 핫한 방 🔥</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotRooms.map((room) => (
              <VideoCard key={room.roomId} {...room} />
            ))}
          </div>
        </section>

        {/* 아티스트 목록 영역 */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">추천 아티스트</h2>
            <Link
              to="/artist-list"
              className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
            >
              더보기 →
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-6">
            {isLoading ? (
              <p>아티스트를 불러오는 중...</p>
            ) : (
              recommendedArtists.map((artist) => (
                <ArtistCard
                  key={artist.artistId}
                  {...artist}
                  onClick={() =>
                    handleCardClick(artist.artistId, artist.nameEn)
                  }
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;

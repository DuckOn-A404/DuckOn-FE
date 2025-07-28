import VideoCard from "../components/domain/video/VideoCard";
import ArtistCard from "../components/domain/artist/ArtistCard";
import { dummyArtists } from "../mocks/artists";
import { dummyBroadcasts } from "../mocks/broadcasts";

const HomePage = () => {
  return (
    <div>
      <div>이미지 넣을 거임</div>

      {/* 핫한 방송 영역 */}
      <h1 className="text-2xl font-bold px-4 mb-4">🔥 지금 핫한 방 🔥</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
        {dummyBroadcasts
          .filter((b) => b.isLive)
          .sort((a, b) => b.viewerCount - a.viewerCount)
          .slice(0, 3)
          .map((broadcast, index) => (
            <VideoCard key={index} {...broadcast} />
          ))}
      </div>

      {/* 아티스트 목록 영역 */}
      <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
        추천 아티스트 !!!!
      </h1>
      <div className="px-4 md:px-10">
        <div className="flex flex-wrap justify-center gap-x-[14px] gap-y-[23px] px-4 md:px-10">
          {dummyArtists.slice(0, 4).map((artist) => (
            <ArtistCard key={artist.artistId} {...artist} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

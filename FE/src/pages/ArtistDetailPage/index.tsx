// ✅ index.tsx (ArtistDetailPage)
import { useParams } from "react-router-dom";
import VideoCard from "../../components/domain/video/VideoCard";
import RightSidebar from "./RightSidebar";

const ArtistDetailPage = () => {
  const { engName } = useParams<{ engName: string }>();

  const artist = {
    engName: "BTS",
    korName: "방탄소년단",
    imageUrl: "/artist/BTS.png",
    debutDate: "2013-06-13",
    followers: 523000,
  };

  const getDday = (dateString: string) => {
    const today = new Date();
    const target = new Date(dateString);
    const diff = Math.floor(
      (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff >= 0 ? `D+${diff}` : `D${diff}`;
  };

  const liveRooms = [
    {
      isLive: true,
      viewerCount: 2847,
      artistName: "블링크판클러블공식",
      title: "How You Like That 무직비디오 단체관람 파티",
    },
    {
      isLive: true,
      viewerCount: 1655,
      artistName: "제니사랑해",
      title: "DDU-DU DDU-DU 무대 모음집 감상",
    },
  ];

  const upcomingRooms = [
    {
      isLive: false,
      viewerCount: 0,
      artistName: "블링크판클러블공식",
      title: "신곡 뮤직비디오 첫 공개 이벤트",
    },
  ];

  return (
    <div className="flex w-full bg-gray-50">
      {/* 왼쪽: 팔로우 리스트 */}
      <aside className="w-64 p-4 border-r border-gray-200">
        <h2 className="text-lg font-bold mb-4">팔로우한 아티스트</h2>
        <ul className="space-y-2 text-sm">
          {["BTS", "세븐틴", "트와이스", "뉴진스"].map((name) => (
            <li
              key={name}
              className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm"
            >
              <span className="font-medium">{name}</span>
              <span className="text-purple-500 text-xs">15개 방</span>
            </li>
          ))}
        </ul>
        <button className="mt-4 w-full bg-purple-600 text-white text-sm py-2 rounded-xl">
          + 아티스트 팔로우
        </button>
      </aside>

      {/* 가운데: 아티스트 카드 + 라이브/예정 */}
      <main className="flex-1 p-6 space-y-10">
        <div className="bg-white p-6 rounded-2xl shadow flex justify-between items-center">
          <div className="flex items-center gap-6">
            <img
              src={artist.imageUrl}
              alt={artist.engName}
              className="w-24 h-24 rounded-2xl object-cover shadow"
            />
            <div>
              <h1 className="text-3xl font-bold">{artist.korName}</h1>
              <p className="text-gray-600">{artist.engName}</p>
              <p className="text-sm text-gray-500">
                데뷔일: {new Date(artist.debutDate).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>
          <div className="text-right space-y-2">
            <p className="text-sm font-semibold">{getDday(artist.debutDate)}</p>
            <button className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
              팔로우 중
            </button>
          </div>
        </div>

        {/* 라이브 방 */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-purple-600">라이브 방</h2>
            <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
              + 새 방 만들기
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {liveRooms.map((room, i) => (
              <VideoCard key={i} {...room} />
            ))}
          </div>
        </section>

        {/* 예정된 방 */}
        <section>
          <h2 className="text-xl font-bold text-blue-600 mb-4">예정된 방</h2>
          <div className="grid grid-cols-2 gap-6">
            {upcomingRooms.map((room, i) => (
              <VideoCard key={i} {...room} />
            ))}
          </div>
        </section>
      </main>

      {/* 오른쪽: 실시간 탭 */}
      <RightSidebar />
    </div>
  );
};

export default ArtistDetailPage;

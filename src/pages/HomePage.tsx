import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import VideoCard from "../components/domain/video/VideoCard";
import ArtistCard from "../components/domain/artist/ArtistCard";
import { useState } from "react";
import { type User } from "../types";

const HomePage = () => {
  // video-card용 dummy data
  const dummyData1 = {
    isLive: true,
    viewerCount: 300,
    artistName: "BTS",
    title: "BTS - Dynamite 뮤직비디오 단체관람, Dynamite 뮤직비디오 단체관람",
  };
  const dummyData2 = {
    isLive: false,
    viewerCount: 13400,
    artistName: "블랙핑크",
    title: "블랙핑크 - 붐바야 뮤직비디오 단체관람",
  };

  // header용 data
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = () => {
    console.log("로그인 시도");
    setUser({
      id: "123",
      name: "홍길동",
      email: "hong@example.com",
    });
  };

  const handleLogout = () => {
    console.log("로그아웃");
    setUser(null);
  };

  const handleSignup = () => {
    console.log("회원가입 페이지로 이동");
  };

  return (
    <div>
      {/* 헤더 영역 */}
      <div>
        <Header
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onSignup={handleSignup}
        />
      </div>
      <div>이미지 넣을 거임</div>

      {/* 핫한 방송 영역 */}
      <h1>지금 핫 한 방 !!!!!</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <VideoCard {...dummyData1} />
        <VideoCard {...dummyData2} />
        <VideoCard {...dummyData1} />
      </div>

      {/* 아티스트 목록 영역 */}
      <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
        추천 아티스트 !!!!
      </h1>
      <div className="px-4 md:px-10">
        <div className="flex flex-wrap gap-x-[14px] gap-y-[23px] px-4 md:px-10">
          <ArtistCard
            engName="IU"
            korName="아이유"
            imageUrl="/artist/IU.png"
            followers={123}
            tag="솔로"
          />
          <ArtistCard
            engName="BTS"
            korName="방탄소년단"
            imageUrl="/artist/BTS.png"
            followers={234}
            tag="보이그룹"
          />
          <ArtistCard
            engName="aespa"
            korName="에스파"
            imageUrl="/artist/aespa.png"
            followers={345}
            tag="걸그룹"
          />
          <ArtistCard
            engName="BLACKPINK"
            korName="블랙핑크"
            imageUrl="/artist/BLACKPINK.png"
            followers={456}
            tag="걸그룹"
          />
        </div>
      </div>

      {/* 푸터 영역 */}
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;

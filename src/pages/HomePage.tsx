import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import VideoCard from "../components/domain/video/VideoCard";
import ArtistCard from "../components/domain/artist/ArtistCard";

const HomePage = ({}: HomePageProps) => {
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

  return (
    <div>
      <div>
        <Header />
      </div>
      <div>이미지 넣을 거임</div>
      <h1>지금 핫 한 방 !!!!!</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <VideoCard {...dummyData1} />
        <VideoCard {...dummyData2} />
        <VideoCard {...dummyData1} />
      </div>
      <div>
        <h1>추천 아티스트 !!!!</h1>
        <ArtistCard />
        <ArtistCard />
        <ArtistCard />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;

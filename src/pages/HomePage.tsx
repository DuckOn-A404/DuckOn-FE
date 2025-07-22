import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import VideoCard from "../components/domain/video/VideoCard";
import ArtistCard from "../components/domain/artist/ArtistCard";

const HomePage = ({}: HomePageProps) => {
  return (
    <div>
      <div>
        <Header />
      </div>
      <div>이미지 넣을 거임</div>
      <div>
        <h1>지금 핫 한 방 !!!!!</h1>
        <VideoCard />
        <VideoCard />
        <VideoCard />
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

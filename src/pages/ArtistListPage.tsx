import InputField from "../components/common/InputField";
import ArtistCard from "../components/domain/artist/ArtistCard";
import { useState } from "react";
import { Search } from "lucide-react";

const ArtistListPage = () => {
  const [searchText, setSearchText] = useState("");
  return (
    <div>
      <h1>아티스트 목록</h1>
      <div className="flex flex-row">
        <div className="w-full max-w-md mx-auto mt-10">
          <InputField
            id="search"
            label=""
            type="text"
            placeholder="아티스트를 검색하세요"
            icon={<Search />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <p>총 n 명의 아티스트</p>
        </div>
      </div>
      <div>
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
      </div>
    </div>
  );
};

export default ArtistListPage;

import InputField from "../components/common/InputField";
import ArtistCard from "../components/domain/artist/ArtistCard";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useArtistList } from "../hooks/useArtistList";
import { useDebounce } from "../hooks/useDebounse";

const ArtistListPage = () => {
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 300);
  const { artists, totalCount, fetchMore, hasMore, loading } =
    useArtistList(debouncedSearchText);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // 무한 스크롤 처리
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    // IntersectionObserver 생성
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchMore();
      },
      { threshold: 1 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [fetchMore, hasMore]);

  const handleCardClick = (artistId: number, nameEn: string) => {
    navigate(`/artist/${nameEn}`, { state: { artistId } });
  };

  return (
    <div className="px-4 md:px-10 py-8">
      {/* 제목 영역 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">아티스트</h1>
        <p className="text-gray-500 text-sm">
          다양한 K-pop 아티스트를 만나보세요.
        </p>
      </div>

      {/* 검색 + 아티스트 수 */}
      <div className="w-full max-w-md mx-auto mb-8">
        <InputField
          id="search"
          label=""
          type="text"
          placeholder="아티스트를 검색하세요"
          icon={<Search />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <p className="text-sm text-center mt-2 text-gray-600">
          총 {totalCount}명의 아티스트
        </p>
      </div>

      {/* 아티스트 카드 리스트 */}
      <div className="flex flex-wrap justify-center gap-x-[14px] gap-y-[23px]">
        {artists.map((artist) => (
          <ArtistCard
            key={artist.artistId}
            {...artist}
            onClick={() => handleCardClick(artist.artistId, artist.nameEn)}
          />
        ))}
      </div>

      {/* 감지용 ref */}
      <div ref={observerRef} className="h-10 mt-10" />

      {loading && <p className="text-center text-gray-500">불러오는 중...</p>}
    </div>
  );
};

export default ArtistListPage;

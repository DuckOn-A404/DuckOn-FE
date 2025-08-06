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
    // 로딩 중이거나, 더 이상 불러올 데이터가 없으면 관찰하지 않음
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 감지용 div가 화면에 보이고, 로딩 중이 아닐 때만 다음 데이터를 불러옴
        if (entry.isIntersecting && !loading) {
          fetchMore();
        }
      },
      { threshold: 1.0 }
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [loading, hasMore, fetchMore]);

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

      {/* 1. 로딩 스피너: 로딩 중일 때만 표시됩니다. */}
      {loading && (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* 2. 감지용 ref: 로딩 중이 아니고, 더 불러올 데이터가 있을 때만 렌더링됩니다. */}
      {!loading && hasMore && <div ref={observerRef} className="h-10" />}
    </div>
  );
};

export default ArtistListPage;

import InputField from "../components/common/InputField";
import ArtistCard from "../components/domain/artist/ArtistCard";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useArtistList } from "../hooks/useArtistList";
import { useDebounce } from "../hooks/useDebounse";

// 스켈레톤 카드 컴포넌트를 페이지 파일 내에 간단하게 정의합니다.
const SkeletonCard = () => (
  <div className="w-full max-w-[240px] bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200" />
    <div className="p-4">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

const ArtistListPage = () => {
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 300);
  const { artists, totalCount, fetchMore, hasMore, loading } =
    useArtistList(debouncedSearchText);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // 무한 스크롤 처리 로직
  useEffect(() => {
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
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

  // 초기 로딩 상태인지 판별하는 변수
  const isInitialLoading = loading && artists.length === 0;
  // 로딩이 끝났는데, 결과가 없는 상태인지 판별하는 변수
  const isEmpty = !loading && artists.length === 0;

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

      {/* 아티스트 카드 리스트 & 결과 없음 메시지 */}
      <div className="flex flex-wrap justify-center gap-x-[14px] gap-y-[23px]">
        {isInitialLoading
          ? // 초기 로딩 시: 스켈레톤 UI 표시
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : // 로딩 끝난 후: 실제 데이터 표시
            artists.map((artist) => (
              <ArtistCard
                key={artist.artistId}
                {...artist}
                onClick={() => handleCardClick(artist.artistId, artist.nameEn)}
              />
            ))}
      </div>

      {/* 검색 결과가 없을 때 메시지 표시 */}
      {isEmpty && debouncedSearchText && (
        <div className="text-center text-gray-500 py-20">
          <p>'{debouncedSearchText}'에 대한 검색 결과가 없습니다.</p>
        </div>
      )}

      {/* 페이지 하단 로직 */}
      <div className="mt-10">
        {/* 추가 로딩 시: 스피너 표시 */}
        {loading && !isInitialLoading && (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
          </div>
        )}

        {/* 무한 스크롤 감지용 div */}
        {!loading && hasMore && <div ref={observerRef} className="h-10" />}

        {/* 모든 데이터를 불러왔을 때 */}
        {!hasMore && !isEmpty && (
          <div className="text-center text-gray-500 py-10">
            <p>모든 아티스트를 불러왔습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistListPage;

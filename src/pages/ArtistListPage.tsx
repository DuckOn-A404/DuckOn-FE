import InputField from "../components/common/InputField";
import ArtistCard from "../components/domain/artist/ArtistCard";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useArtistList } from "../hooks/useArtistList";
import { useDebounce } from "../hooks/useDebounce";
import type { SortKey, SortOrder } from "../api/artistService";

const sortOptions: { label: string; key: SortKey; order: SortOrder }[] = [
  { label: "팔로워 많은순", key: "followers", order: "desc" },
  { label: "이름 오름차순", key: "name", order: "asc" },
  { label: "이름 내림차순", key: "name", order: "desc" },
  { label: "데뷔 빠른순", key: "debut", order: "asc" },
  { label: "데뷔 최신순", key: "debut", order: "desc" },
];

const ArtistListPage = () => {
  const navigate = useNavigate();

  // 🔎 검색어 입력값 → 300ms 디바운스 후 서버에 전달
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 300);

  // 🔽 기본 정렬: 팔로워 많은순
  const [sort, setSort] = useState<SortKey>("followers");
  const [order, setOrder] = useState<SortOrder>("desc");

  // 📦 화면 크기에 따라 1회 로드 개수 동적 계산(한 화면 + 여유 2행)
  const [pageSize, setPageSize] = useState(30);
  useEffect(() => {
    const compute = () => {
      const cardW = 220 + 14; // 카드 폭 + 가로 gap(대략치)
      const cardH = 280;      // 카드 높이(대략치)
      const cols = Math.max(2, Math.floor(window.innerWidth / cardW));
      const rows = Math.max(2, Math.ceil(window.innerHeight / cardH) + 2);
      setPageSize(cols * rows);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // 📡 목록 데이터: 검색/정렬/사이즈를 한 API(getArtistList)로 처리
  const { artists, totalCount, fetchMore, hasMore, loading } = useArtistList({
    q: debouncedSearchText || undefined,
    sort,
    order,
    size: pageSize,
  });

  // ♾️ 무한 스크롤: 바닥 600px 전에 프리패치
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore) {
          fetchMore();
        }
      },
      // ✅ bottom 방향 여백 확장: 아래에서 600px 남았을 때 미리 로드
      { rootMargin: "0px 0px 600px 0px", threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [fetchMore, hasMore, loading]);

  const handleCardClick = (artistId: number, nameEn: string) => {
    // NOTE: nameEn에 공백/특수문자가 있다면 slug/encode 고려
    navigate(`/artist/${nameEn}`, { state: { artistId } });
  };

  return (
    <div className="px-4 md:px-10 py-8">
      {/* 제목 영역 */}
      <div className="text-center py-8 mb-5">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">아티스트</h1>
        <p className="text-lg text-gray-500">다양한 K-pop 아티스트를 만나보세요.</p>
      </div>

      {/* 검색 + 정렬 + 총 개수 */}
      <div className="w-full max-w-3xl mx-auto mb-4 flex gap-3 items-center">
        <div className="flex-1">
          <InputField
            id="search"
            label=""
            type="text"
            placeholder="아티스트를 검색하세요"
            icon={<Search />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* 정렬 */}
        <select
          aria-label="정렬"
          className="h-12 rounded-xl border px-3"
          value={`${sort}:${order}`}
          onChange={(e) => {
            const [k, o] = e.target.value.split(":");
            setSort(k as SortKey);
            setOrder(o as SortOrder);
          }}
        >
          {sortOptions.map((o) => (
            <option key={`${o.key}:${o.order}`} value={`${o.key}:${o.order}`}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-center mt-2 text-gray-600">총 {totalCount}명의 아티스트</p>

      {/* 카드 리스트 */}
      <div className="flex flex-wrap justify-center gap-x-[14px] gap-y-[23px] mt-4">
        {artists.map((artist) => (
          <ArtistCard
            key={artist.artistId}
            {...artist}
            onClick={() => handleCardClick(artist.artistId, artist.nameEn)}
          />
        ))}
      </div>

      {/* sentinel: 단 하나만 */}
      <div ref={sentinelRef} className="h-10 mt-10" />

      {/* 로딩 스피너 */}
      {loading && (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}
    </div>
  );
};

export default ArtistListPage;

import SortSelect, {
  type SortKey,
  type SortOrder,
} from "../components/common/SortSelect";
import ArtistCard from "../components/domain/artist/ArtistCard";
import {useNavigate} from "react-router-dom";
import {useState, useEffect, useRef} from "react";
import {Search} from "lucide-react";
import {useArtistList} from "../hooks/useArtistList";
import {useDebounce} from "../hooks/useDebounce";
import {createSlug} from "../utils/slugUtils";
import {Capacitor} from "@capacitor/core"; // 앱 여부 확인용

const sortOptions: {label: string; key: SortKey; order: SortOrder}[] = [
  {label: "팔로워 많은순", key: "followers", order: "desc"},
  {label: "이름 오름차순", key: "name", order: "asc"},
  {label: "이름 내림차순", key: "name", order: "desc"},
  {label: "데뷔 빠른순", key: "debut", order: "asc"},
  {label: "데뷔 최신순", key: "debut", order: "desc"},
];

const isNativeApp = Capacitor.isNativePlatform() || window.innerWidth <= 768; // 웹/앱 분기 값

const ArtistListPage = () => {
  const navigate = useNavigate();

  // 검색어 입력값 → 300ms 디바운스 후 서버에 전달
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 300);

  // 기본 정렬: 팔로워 많은순
  const [sort, setSort] = useState<SortKey>("followers");
  const [order, setOrder] = useState<SortOrder>("desc");

  // 화면 크기에 따라 1회 로드 개수 동적 계산(한 화면 + 여유 2행)
  const [pageSize, setPageSize] = useState(30);
  useEffect(() => {
    const compute = () => {
      const cardW = 220 + 14; // 카드 폭 + 가로 gap(대략치)
      const cardH = 280; // 카드 높이(대략치)
      const cols = Math.max(2, Math.floor(window.innerWidth / cardW));
      const rows = Math.max(2, Math.ceil(window.innerHeight / cardH) + 2);
      setPageSize(cols * rows);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // 목록 데이터: 검색/정렬/사이즈를 한 API로 처리
  const {artists, totalCount, fetchMore, hasMore, loading} = useArtistList({
    q: debouncedSearchText || undefined,
    sort,
    order,
    size: pageSize,
  });

  // 무한 스크롤
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
      {rootMargin: "0px 0px 600px 0px", threshold: 0}
    );

    io.observe(el);
    return () => io.disconnect();
  }, [fetchMore, hasMore, loading]);

  const handleCardClick = (artistId: number, nameEn: string) => {
    const slug = createSlug(nameEn);
    navigate(`/artist/${slug}`, {state: {artistId}});
  };

  return (
    <div className="px-4 md:px-10 py-8">
      {/* 제목 영역 */}
      <div className="text-center py-8 mb-5">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">아티스트</h1>
        <p className="text-lg text-gray-500">
          다양한 K-pop 아티스트를 만나보세요.
        </p>
      </div>

      {/* 검색 + 정렬 + 총 개수 */}
      {/* 웹/앱 모두 한 줄 레이아웃, 폭만 분기 */}
      <div className="w-full max-w-3xl mx-auto mb-10 flex gap-3 items-center">
        {/* 검색 인풋 */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            aria-label="아티스트 검색"
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="아티스트를 검색하세요"
            className="
              w-full h-12 pl-12 pr-4 py-3
              bg-white
              rounded-xl border border-gray-300
              text-gray-800 text-base leading-normal
              shadow-sm
              hover:border-gray-300
              focus:outline-none focus:ring-2 focus:ring-purple-500
              transition
            "
          />
        </div>

        {/* 정렬 셀렉트 */}
        <SortSelect
          className={
            isNativeApp
              ? "w-40 shrink-0 text-[11px] leading-none whitespace-nowrap"
              : "w-48 md:w-56"
          }
          value={{key: sort, order}}
          options={sortOptions}
          onChange={(v) => {
            setSort(v.key as SortKey);
            setOrder(v.order as SortOrder);
          }}
        />
      </div>

      <p className="text-sm text-center mt-2 text-gray-600">
        총 {totalCount}명의 아티스트
      </p>

      {/* 카드 / 아바타 리스트 */}
      {/* 웹: 기존 ArtistCard 레이아웃 유지 */}
      {!isNativeApp && (
        <div className="flex flex-wrap justify-center gap-x-[14px] gap-y-[23px] mt-4">
          {artists.map((artist) => (
            <ArtistCard
              key={artist.artistId}
              {...artist}
              onClick={() => handleCardClick(artist.artistId, artist.nameEn)}
            />
          ))}
        </div>
      )}

      {/* 앱: 동그란 아티스트 그리드 (drop-shadow 제거) */}
      {isNativeApp && (
        <div className="mt-6 grid grid-cols-3 gap-x-4 gap-y-6">
          {artists.map((artist) => (
            <button
              key={artist.artistId}
              type="button"
              className="flex flex-col items-center gap-2 active:scale-95 transition"
              onClick={() => handleCardClick(artist.artistId, artist.nameEn)}
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-sky-400 p-[2px]">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-200">
                  <img
                    src={artist.imgUrl || "/default_image.png"}
                    alt={artist.nameKr || artist.nameEn}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-900 font-semibold text-center leading-tight line-clamp-2">
                {artist.nameKr || artist.nameEn}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* sentinel */}
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

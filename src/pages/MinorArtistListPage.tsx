import SortSelect, {
  type SortKey,
  type SortOrder,
} from "../components/common/SortSelect";
import ArtistCard from "../components/domain/artist/ArtistCard";
import { useNavigate } from "react-router-dom";
import {
  useState,
  useEffect,
  useRef,
  type TouchEvent,
  useMemo,
} from "react";
import { Search, Plus } from "lucide-react";
import { useArtistList } from "../hooks/useArtistList";
import { useDebounce } from "../hooks/useDebounce";
import { createSlug } from "../utils/slugUtils";
import { Capacitor } from "@capacitor/core";
import { useUiTranslate } from "../hooks/useUiTranslate";
import UIText from "../components/common/UIText";
import AddMinorArtistModal from "../components/domain/artist/AddMinorArtistModal";

const isNativeApp = Capacitor.isNativePlatform() || window.innerWidth <= 768;
const isRealNativeApp = Capacitor.isNativePlatform();

const MinorArtistListPage = () => {
  const navigate = useNavigate();
  const { t } = useUiTranslate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isTrackingRef = useRef(false);

  const EDGE_WIDTH = 24;
  const MIN_DISTANCE = 80;
  const MAX_VERTICAL_DRIFT = 50;

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!isRealNativeApp) return;

    const t = e.touches[0];
    startXRef.current = t.clientX;
    startYRef.current = t.clientY;

    isTrackingRef.current = t.clientX <= EDGE_WIDTH;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isRealNativeApp || !isTrackingRef.current) return;

    const t = e.touches[0];
    const vertical = Math.abs(t.clientY - startYRef.current);

    if (vertical > MAX_VERTICAL_DRIFT) {
      isTrackingRef.current = false;
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!isRealNativeApp || !isTrackingRef.current) return;

    const t = e.changedTouches[0];
    const diffX = t.clientX - startXRef.current;

    if (diffX > MIN_DISTANCE) {
      navigate(-1);
    }

    isTrackingRef.current = false;
  };

  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 300);

  const [sort, setSort] = useState<SortKey>("followers");
  const [order, setOrder] = useState<SortOrder>("desc");

  const sortOptions: { label: string; key: SortKey; order: SortOrder }[] =
    useMemo(
      () => [
        {
          label: t(
            "artistList.sort.followersDesc",
            "팔로워 많은순",
          ),
          key: "followers",
          order: "desc",
        },
        {
          label: t(
            "artistList.sort.nameAsc",
            "이름 오름차순",
          ),
          key: "name",
          order: "asc",
        },
        {
          label: t(
            "artistList.sort.nameDesc",
            "이름 내림차순",
          ),
          key: "name",
          order: "desc",
        },
        {
          label: t(
            "artistList.sort.debutAsc",
            "데뷔 빠른순",
          ),
          key: "debut",
          order: "asc",
        },
        {
          label: t(
            "artistList.sort.debutDesc",
            "데뷔 최신순",
          ),
          key: "debut",
          order: "desc",
        },
      ],
      [t],
    );

  const [pageSize, setPageSize] = useState(30);
  useEffect(() => {
    const compute = () => {
      const cardW = 220 + 14;
      const cardH = 280;
      const cols = Math.max(2, Math.floor(window.innerWidth / cardW));
      const rows = Math.max(2, Math.ceil(window.innerHeight / cardH) + 2);
      setPageSize(cols * rows);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const { artists, totalCount, fetchMore, hasMore, loading } = useArtistList({
    q: debouncedSearchText || undefined,
    sort,
    order,
    size: pageSize,
    isMinor: true,
  });

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
      { rootMargin: "0px 0px 600px 0px", threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [fetchMore, hasMore, loading]);

  const handleCardClick = (artistId: number, nameEn: string) => {
    const slug = createSlug(nameEn);
    navigate(`/artist/${slug}`, { state: { artistId } });
  };

  const handleArtistAdded = () => {
    window.location.reload();
  };

  return (
    <div
      className="px-4 md:px-10 py-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="text-center py-8 mb-5">
        <UIText
          id="minorArtistList.title"
          as="h1"
          className="text-4xl font-extrabold text-gray-800 mb-2"
        >
          마이너 아티스트
        </UIText>
        <UIText
          id="minorArtistList.subtitle"
          as="p"
          className="text-lg text-gray-500"
        >
          마이너 아티스트들 입니다, 아직은요.
        </UIText>
      </div>

      <div className="w-full max-w-3xl mx-auto mb-10 flex gap-3 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            aria-label={t("artistList.searchLabel", "아티스트 검색")}
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t(
              "artistList.searchPlaceholder",
              "아티스트를 검색하세요",
            )}
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

        <SortSelect
          className={
            isNativeApp
              ? "w-40 shrink-0 text-[11px] leading-none whitespace-nowrap"
              : "w-48 md:w-56"
          }
          value={{ key: sort, order }}
          options={sortOptions}
          onChange={(v) => {
            setSort(v.key as SortKey);
            setOrder(v.order as SortOrder);
          }}
        />

        <button
          onClick={() => setIsModalOpen(true)}
          className="
            flex items-center gap-2 px-4 h-12
            bg-purple-600 hover:bg-purple-700
            text-white font-semibold rounded-xl
            shadow-sm hover:shadow-md
            transition-all duration-200
            active:scale-95
          "
        >
          <Plus className="h-5 w-5" />
          <span className="hidden md:inline">아티스트 추가</span>
        </button>
      </div>

      <p className="text-sm text-center mt-2 text-gray-600">
        {t("artistList.totalCount", `총 ${totalCount}명의 아티스트`).replace(
          "{count}",
          String(totalCount),
        )}
      </p>

      {!isNativeApp && (
        <div className="flex flex-wrap justify-center gap-x-[14px] gap-y-[23px] mt-4">
          {artists.map((artist) => (
            <ArtistCard
              key={artist.artistId}
              {...artist}
              onClick={() =>
                handleCardClick(artist.artistId, artist.nameEn)
              }
            />
          ))}
        </div>
      )}

      {isNativeApp && (
        <div className="mt-6 grid grid-cols-3 gap-x-4 gap-y-6">
          {artists.map((artist) => (
            <button
              key={artist.artistId}
              type="button"
              className="flex flex-col items-center gap-2 active:scale-95 transition"
              onClick={() =>
                handleCardClick(artist.artistId, artist.nameEn)
              }
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

      <div ref={sentinelRef} className="h-10 mt-10" />

      {loading && (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      <AddMinorArtistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleArtistAdded}
      />
    </div>
  );
};

export default MinorArtistListPage;

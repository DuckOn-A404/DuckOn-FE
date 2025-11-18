import { useEffect, useRef, type TouchEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useArtistFollowStore } from "../../store/useArtistFollowStore";
import { createSlug } from "../../utils/slugUtils";
import { isNativeApp } from "../../utils/platform"; // 그대로 사용

const FollowedArtistsPage = () => {
  const navigate = useNavigate();

  // 스와이프 뒤로가기 ref (훅 규칙 준수 위해 최상단)
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isTrackingRef = useRef(false);

  // 스와이프 설정
  const EDGE_WIDTH = 24;
  const MIN_DISTANCE = 80;
  const MAX_VERTICAL_DRIFT = 50;

  // 앱에서만 동작하는 스와이프 이벤트 핸들러
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!isNativeApp) return;

    const t = e.touches[0];
    startXRef.current = t.clientX;
    startYRef.current = t.clientY;

    // 왼쪽 엣지에서 시작했을 때만 후보
    isTrackingRef.current = t.clientX <= EDGE_WIDTH;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isNativeApp || !isTrackingRef.current) return;

    const t = e.touches[0];
    const vertical = Math.abs(t.clientY - startYRef.current);

    if (vertical > MAX_VERTICAL_DRIFT) {
      isTrackingRef.current = false;
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!isNativeApp || !isTrackingRef.current) return;

    const t = e.changedTouches[0];
    const diffX = t.clientX - startXRef.current;

    if (diffX > MIN_DISTANCE) {
      navigate(-1);
    }

    isTrackingRef.current = false;
  };

  // 기존 코드: 훅은 조건부 리턴 위에 위치해야 함
  const {
    followedArtists,
    fetchFollowedArtists,
    isLoading,
    hasLoaded,
  } = useArtistFollowStore();

  // 페이지 처음 열릴 때 한번만 로드
  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      void fetchFollowedArtists();
    }
  }, [hasLoaded, isLoading, fetchFollowedArtists]);

  // 이 줄은 훅 호출 아래에 있어야 함
  if (!isNativeApp) {
    navigate("/");
    return null;
  }

  const handleArtistClick = (artistId: number, nameEn: string) => {
    const slug = createSlug(nameEn);
    navigate(`/artist/${slug}`, { state: { artistId } });
  };

  const count = followedArtists.length;
  const isInitialLoading = isLoading && !hasLoaded;

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-b from-[#fdfbff] via-[#f7f4ff] to-[#f5f7ff]"
      style={{ paddingTop: "env(safe-area-inset-top)" }}

      // 여기에서 앱 스와이프 감지
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 상단 헤더 */}
      <section className="px-5 pt-3 pb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">
                팔로우한 아티스트
              </h1>
              <p className="text-[11px] text-gray-500 mt-0.5">
                내가 좋아하는 아티스트들을 한눈에 모아봤어요
              </p>
            </div>

            <div className="px-3 py-1 rounded-full bg-white shadow-[0_6px_16px_rgba(148,163,184,0.35)] border border-white flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400" />
              <span className="text-[11px] font-semibold text-gray-800">
                {count}명
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 본문 */}
      <section className="px-4 pb-6">
        {isInitialLoading ? (
          <div className="mt-20 flex flex-col items-center text-center gap-3 text-gray-500 text-sm">
            <div className="w-10 h-10 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
            <p>팔로우한 아티스트를 불러오는 중이에요...</p>
          </div>
        ) : count === 0 ? (
          <div className="mt-20 flex flex-col items-center text-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 via-pink-100 to-amber-100 flex items-center justify-center shadow-[0_20px_40px_rgba(148,163,184,0.35)]">
              <span className="text-3xl">🎧</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-800">
                아직 팔로우한 아티스트가 없어요
              </p>
              <p className="text-[11px] text-gray-500">
                좋아하는 아티스트를 팔로우하면 여기에서 바로 만날 수 있어요
              </p>
            </div>
            <button
              onClick={() => navigate("/artist-list")}
              className="mt-1 px-5 py-2.5 rounded-full bg-gray-900 text-white text-xs font-semibold shadow-[0_12px_30px_rgba(15,23,42,0.5)] active:scale-[0.97] transition"
            >
              아티스트 찾으러 가기
            </button>
          </div>
        ) : (
          <div className="mt-1 space-y-3">
            {followedArtists.map((artist) => (
              <button
                key={artist.artistId}
                onClick={() => handleArtistClick(artist.artistId, artist.nameEn)}
                className="w-full text-left active:scale-[0.985] transition-transform group"
              >
                <div
                  className="
                    relative overflow-hidden
                    rounded-2xl bg-white/95
                    shadow-[0_14px_40px_rgba(15,23,42,0.10)]
                    border border-white
                    flex items-center gap-3 px-3.5 py-3
                  "
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-[0_8px_18px_rgba(148,163,184,0.55)]">
                    <img
                      src={artist.imgUrl || 'https://placehold.co/64x64'}
                      alt={artist.nameKr}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900 truncate">
                      {artist.nameKr}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {artist.nameEn}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between h-full">
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10 border border-fuchsia-200 px-2 py-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500 mr-1" />
                      <span className="text-[10px] font-semibold text-fuchsia-700">
                        팔로우 중
                      </span>
                    </span>
                    <span className="mt-1 text-[10px] text-gray-400 group-hover:text-gray-500 transition">
                      상세 보기 &gt;
                    </span>
                  </div>

                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-fuchsia-400 via-rose-400 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FollowedArtistsPage;

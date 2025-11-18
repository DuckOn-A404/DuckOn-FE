import { useState, useEffect, useRef, type TouchEvent } from "react";
import VideoCard from "../components/domain/video/VideoCard";
import VideoCardSkeleton from "../components/domain/video/VideoCardSkeleton";
import { useTrendingRooms } from "../hooks/useTrendingRooms";
import type { trendingRoom } from "../types/room";
import { Tv } from "lucide-react";
import { Capacitor } from "@capacitor/core";

const PAGE_SIZE = 24;

const isRealNativeApp = Capacitor.isNativePlatform();

const RoomListPage = () => {
  const [page, setPage] = useState(1);
  const [rooms, setRooms] = useState<trendingRoom[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 스와이프 뒤로가기용 ref들
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isTrackingRef = useRef(false);

  // 스와이프 파라미터
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
      // 이 페이지는 리스트라 뒤로가기보단 history(-1) 를 쓰려면 useNavigate가 필요하지만,
      // 여기서는 단순 "브라우저 뒤로가기" 대신 OS 제스처에 맡기고 싶다면 제거 가능.
      // 만약 네이티브 WebView에서 history.back()을 쓰고 싶다면:
      window.history.back();
    }

    isTrackingRef.current = false;
  };

  const { data, isLoading, error } = useTrendingRooms(page, PAGE_SIZE);

  useEffect(() => {
    if (!data) return;
    // 새 페이지 결과 누적
    setRooms((prev) => [...prev, ...data.roomInfoList]);
    setHasMore(data.hasNext);
    setTotalCount(data.totalElements);
  }, [data]);

  // 무한 스크롤
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    const el = sentinelRef.current;
    if (el) io.observe(el);

    return () => {
      if (el) io.unobserve(el);
      io.disconnect();
    };
  }, [hasMore, isLoading]);

  return (
    <div
      className="px-4 md:px-10 py-8"
      // 앱에서만 동작하는 왼쪽 엣지 스와이프 뒤로가기
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 제목 */}
      <div className="text-center py-8 mb-5">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          라이브 방송
        </h1>
        <p className="text-lg text-gray-500">
          다채로운 라이브 방송들을 만나보세요.
        </p>
      </div>

      {/* 총 개수 */}
      <div className="w-full max-w-md mx-auto mb-8">
        <p className="text-sm text-center mt-2 text-gray-600">
          총 {totalCount}개 방
        </p>
      </div>

      {/* 목록 */}
      <section>
        <div className="flex flex-wrap justify-center gap-8 flex-grow">
          {isLoading && rooms.length === 0 ? (
            Array.from({ length: 8 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))
          ) : error ? (
            <p className="w-full text-center text-red-500 py-20">{error}</p>
          ) : rooms.length > 0 ? (
            rooms.map((r) => (
              <VideoCard
                key={r.roomId}
                roomId={r.roomId}
                title={r.title}
                hostId={r.hostId}
                hostNickname={r.hostNickname}
                imgUrl={r.imgUrl}
                participantCount={r.participantCount}
                hostProfileImgUrl={r.hostProfileImgUrl ?? ""}
              />
            ))
          ) : (
            <div className="w-full flex flex-col items-center justify-center text-center text-gray-500 py-20 bg-gray-50 rounded-2xl">
              <Tv size={48} className="text-gray-300 mb-4" />
              <p className="font-semibold text-gray-600">
                진행 중인 라이브 방송이 없습니다.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 무한스크롤 센티넬 */}
      <div ref={sentinelRef} className="h-10 mt-10" />

      {/* 추가 로딩 스피너 (이미 목록이 있을 때) */}
      {isLoading && rooms.length > 0 && (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      )}
    </div>
  );
};

export default RoomListPage;

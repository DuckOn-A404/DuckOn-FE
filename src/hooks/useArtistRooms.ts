import { useState, useEffect, useCallback } from "react";
import { getArtistRooms } from "../api/artistService";
import { type Room } from "../types/Room";

/* useArtistRooms : 특정 아티스트의 방송 목록을 관리하는 커스텀 훅
  1. 라이브/예정 방송 목록 상태 관리
  2. '더보기' 버튼을 통한 페이지네이션 로직 처리
  3. API 호출 시 로딩 상태 관리
  4. artistId 변경에 따른 데이터 재요청 처리
*/
export const useArtistRooms = (artistId: number | undefined) => {
  const [liveRooms, setLiveRooms] = useState<Room[]>([]);
  const [upcomingRooms, setUpcomingRooms] = useState<Room[]>([]);

  const [livePage, setLivePage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);

  const [hasMoreLive, setHasMoreLive] = useState(true);
  const [hasMoreUpcoming, setHasMoreUpcoming] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  // 데이터 로딩 함수
  const fetchRooms = useCallback(
    async (page: number, status: "live" | "upcoming") => {
      if (!artistId || isLoading) return;

      setIsLoading(true);
      try {
        const res = await getArtistRooms(artistId, page, 4, status);
        const newRooms = res.roomList || [];

        if (status === "live") {
          setLiveRooms((prev) =>
            page === 1 ? newRooms : [...prev, ...newRooms]
          );
          setHasMoreLive(res.page < res.totalPages);
          setLivePage(page + 1);
        } else {
          setUpcomingRooms((prev) =>
            page === 1 ? newRooms : [...prev, ...newRooms]
          );
          setHasMoreUpcoming(res.page < res.totalPages);
          setUpcomingPage(page + 1);
        }
      } catch (error) {
        console.error(`${status} rooms fetch error:`, error);
      } finally {
        setIsLoading(false);
      }
    },
    [artistId, isLoading]
  );

  // '더보기' 버튼 핸들러
  const handleLoadMore = (status: "live" | "upcoming") => {
    const pageToFetch = status === "live" ? livePage : upcomingPage;
    fetchRooms(pageToFetch, status);
  };

  // artistId가 변경될 때마다 첫 페이지 데이터를 로드
  useEffect(() => {
    setLivePage(1);
    setUpcomingPage(1);
    fetchRooms(1, "live");
    fetchRooms(1, "upcoming");
  }, [artistId]);

  // 컴포넌트에서 사용할 값들을 반환
  return {
    liveRooms,
    upcomingRooms,
    hasMoreLive,
    hasMoreUpcoming,
    isLoading,
    handleLoadMore,
  };
};

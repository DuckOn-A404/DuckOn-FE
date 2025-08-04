import { useState, useEffect, useCallback } from "react";
import { getRoomsByArtist } from "../api/roomService";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // artistId가 없으면 상태를 초기화
    if (!artistId) {
      setLiveRooms([]);
      setUpcomingRooms([]);
      return;
    }

    const fetchAllRooms = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allRooms = await getRoomsByArtist(artistId);

        // 받아온 전체 데이터를 프론트엔드에서 직접 필터링합니다.
        // (Room 타입에 isLive와 같은 상태값이 있다고 가정)
        // 실제 백엔드 데이터에 맞게 이 부분을 수정해야 할 수 있습니다.
        setLiveRooms(allRooms.filter((room) => room.isLive));
        setUpcomingRooms(allRooms.filter((room) => !room.isLive));
      } catch (err) {
        console.error("방 목록을 불러오는 데 실패했습니다.", err);
        setError("방 목록을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllRooms();
  }, [artistId]);

  // '더보기' 버튼 핸들러
  const handleLoadMore = (status: "live" | "upcoming") => {
    const pageToFetch = status === "live" ? livePage : upcomingPage;
    fetchRooms(pageToFetch, status);
  };

  // 컴포넌트에서 사용할 값들을 반환
  return {
    liveRooms,
    upcomingRooms,
    isLoading,
    error,
  };
};

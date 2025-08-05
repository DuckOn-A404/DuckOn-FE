import { useState, useEffect, useMemo } from "react";
import { getRoomsByArtist } from "../api/roomService";
import { type Room } from "../types/Room";

// 처음에 보여줄 방의 수
const INITIAL_VISIBLE_COUNT = 8;

/**
 * 아티스트의 방 목록을 관리하는 커스텀 훅.
 * API로부터 모든 방을 한 번에 받아와, 프론트엔드에서 라이브 방만 필터링하고 '더보기' 기능을 처리합니다.
 * @param artistId - 조회할 아티스트의 ID
 */
export const useArtistRooms = (artistId: number | undefined) => {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    if (!artistId) {
      setAllRooms([]);
      return;
    }

    const fetchAllRooms = async () => {
      setIsLoading(true);
      setError(null);
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      try {
        const roomsData = await getRoomsByArtist(artistId);
        setAllRooms(roomsData);
      } catch (err) {
        setError("방 목록을 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllRooms();
  }, [artistId]);

  const liveRooms = useMemo(() => {
    const now = new Date();
    // room.startTime이 있다고 가정하고, 현재 시간보다 과거인 방만 '라이브'로 간주합니다.
    // 백엔드 데이터 형식에 맞게 'startTime' 필드 이름은 변경해야 할 수 있습니다.
    return allRooms.filter((room) => new Date(room.startTime) <= now);
  }, [allRooms]);

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

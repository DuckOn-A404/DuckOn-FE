import { useState, useEffect, useMemo } from "react";
import { getRoomsByArtist } from "../api/roomService";
import { type room } from "../types/room";

// 처음에 보여줄 방의 수
const INITIAL_VISIBLE_COUNT = 8;

/**
 * 아티스트의 방 목록을 관리하는 커스텀 훅.
 * API로부터 모든 방을 한 번에 받아와, 라이브/예정 방을 나누고 '더보기' 기능을 처리합니다.
 * @param artistId - 조회할 아티스트의 ID
 */
export const useArtistRooms = (artistId: number | undefined) => {
  const [rooms, setRooms] = useState<room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    if (!artistId) {
      setRooms([]);
      return;
    }

    const fetchAllRooms = async () => {
      setIsLoading(true);
      setError(null);
      setVisibleCount(INITIAL_VISIBLE_COUNT);

      try {
        const roomsData = await getRoomsByArtist(artistId);
        setRooms(roomsData || []);
      } catch {
        setError("방 목록을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllRooms();
  }, [artistId]);

  const visibleRooms = useMemo(
    () => rooms.slice(0, visibleCount),
    [rooms, visibleCount]
  );

  const hasMore = rooms.length > visibleCount;

  const handleLoadMore = () => {
    const increment = 8;
    setVisibleCount((prevCount) => prevCount + increment);
  };

  return {
    liveRooms: visibleRooms,
    isLoading,
    error,
    handleLoadMore,
    hasMoreLive: hasMore,
  };
};

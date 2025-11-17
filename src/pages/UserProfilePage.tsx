import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { OtherUser } from "../types/otherUser";
import type { RoomHistory } from "../types/room";
import {
  fetchOtherUserProfile,
  fetchUserRooms,
} from "../api/userService";
import OtherProfileCard from "../components/domain/user/OtherProfileCard";
import MyCreatedRoomsPanel from "../components/domain/room/MyCreatedRoomsPanel";
import { useUserStore } from "../store/useUserStore";
import { followUser, unfollowUser } from "../api/follow/followService";

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const myUser = useUserStore((state) => state.myUser);
  
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [rooms, setRooms] = useState<RoomHistory[]>([]);
  const [roomsPage, setRoomsPage] = useState(1);
  const [roomsTotal, setRoomsTotal] = useState(0);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 사용자 정보 및 방 목록 로드
  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    const loadUserProfile = async () => {
      setLoading(true);
      try {
        // 타 유저 정보 조회
        const myUserId = myUser?.userId || null;
        const userData = await fetchOtherUserProfile(userId, myUserId);
        setOtherUser(userData);

        // 방 목록 조회
        const roomsData = await fetchUserRooms(userId, 1, 12);
        setRooms(roomsData.roomList);
        setRoomsPage(1);
        setRoomsTotal(roomsData.total);
      } catch (error) {
        console.error("프로필 로드 실패:", error);
        // 에러 처리 - 404 페이지로 이동하거나 에러 메시지 표시
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId, myUser?.userId, navigate]);

  // 팔로우 토글
  const handleToggleFollow = async () => {
    // 비로그인 사용자면 로그인 모달 표시
    if (!myUser) {
      setShowLoginModal(true);
      return;
    }

    if (!otherUser || followLoading) return;

    setFollowLoading(true);
    try {
      if (otherUser.following) {
        await unfollowUser(otherUser.userId);
        setOtherUser((prev) => prev ? { ...prev, following: false, followerCount: prev.followerCount - 1 } : null);
      } else {
        await followUser(otherUser.userId);
        setOtherUser((prev) => prev ? { ...prev, following: true, followerCount: prev.followerCount + 1 } : null);
      }
    } catch (error) {
      console.error("팔로우 처리 실패:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  // 무한스크롤 - 방 목록 추가 로드
  const handleLoadMoreRooms = async () => {
    if (roomsLoading || !userId) return;
    if (rooms.length >= roomsTotal) return;

    setRoomsLoading(true);
    try {
      const nextPage = roomsPage + 1;
      const roomsData = await fetchUserRooms(userId, nextPage, 12);
      setRooms((prev) => [...prev, ...roomsData.roomList]);
      setRoomsPage(nextPage);
    } catch (error) {
      console.error("방 목록 로드 실패:", error);
    } finally {
      setRoomsLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">불러오는 중...</div>;
  }

  if (!otherUser) {
    return <div className="p-6 text-red-500">사용자를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="px-8 py-6">
      <OtherProfileCard
        user={otherUser}
        onToggleFollow={handleToggleFollow}
        isFollowLoading={followLoading}
      />

      <div className="mt-8">
        <MyCreatedRoomsPanel
          rooms={rooms}
          pageSize={12}
          total={roomsTotal}
          loading={roomsLoading}
          onLoadMore={handleLoadMoreRooms}
        />
      </div>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold mb-4">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-6">
              팔로우 기능을 사용하려면 로그인이 필요합니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => navigate("/login")}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;

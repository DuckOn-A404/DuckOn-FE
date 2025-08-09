import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { OtherUser } from "../types/otherUser";
import { fetchOtherUserProfile } from "../api/userService";
import { followUser } from "../api/follow/followService";
import OtherProfileCard from "../components/domain/user/OtherProfileCard";

const OtherUserPage = () => {
  const { userId } = useParams();
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }
    setOtherUser(null);

    const getUserData = async () => {
      try {
        const data = await fetchOtherUserProfile(userId);
        setOtherUser(data);
      } catch {}
    };
    getUserData();
  }, [userId]);

  // 팔로우만 가능하도록 처리
  const handleFollow = async () => {
    if (!otherUser || otherUser.following === true) return; // 이미 팔로우한 경우는 무시
    try {
      await followUser(otherUser.userId); // POST /api/follow/{userId}
      setOtherUser((prev) =>
        prev
          ? {
              ...prev,
              following: true,
              followerCount: prev.followerCount + 1,
            }
          : prev
      );
    } catch {}
  };

  if (!otherUser)
    return (
      <div className="text-center mt-20">유저 정보를 불러오는 중입니다...</div>
    );

  return (
    <div key={userId} className="py-10">
      <OtherProfileCard user={otherUser} onToggleFollow={handleFollow} />
    </div>
  );
};

export default OtherUserPage;

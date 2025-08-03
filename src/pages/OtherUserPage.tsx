import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { OtherUser } from "../types/otherUser";
import { fetchOtherUserProfile } from "../api/userService";
import { followUser } from "../api/followService";
import OtherProfileCard from "../components/domain/user/OtherProfileCard";
import { useUserStore } from "../store/useUserStore";

const OtherUserPage = () => {
    const { userId } = useParams()
    console.log("OtherUserPage userId:", userId)
    const [otherUser, setOtherUser] = useState<OtherUser | null>(null)

    useEffect(() => {
        if (!userId) {
            console.warn("userId가 존재하지 않습니다.")
            return
        }
        // 백엔드 연동 코드
        setOtherUser(null)

        const getUserData = async () => {
        try {
            const data = await fetchOtherUserProfile(userId);
            console.log("타 유저 정보:", data)
            setOtherUser(data);
        } catch (err) {
            console.error("타 유저 정보 조회 실패", err);
        }
        };
        getUserData();
    }, [userId]);

    // 팔로우만 가능하도록 처리
    const handleFollow = async () => {
        if (!otherUser || otherUser.following === true) return // 이미 팔로우한 경우는 무시
        try {
            await followUser(otherUser.userId)   // POST /api/follow/{userId}
            setOtherUser((prev) =>
                prev
                ? {
                    ...prev,
                    following: true,
                    followerCount: prev.followerCount + 1,
                    }
                : prev
            )
        } catch (err) {
        console.error("팔로우 실패", err);
        }
    }

    if (!otherUser) 
        return (<div className="text-center mt-20">유저 정보를 불러오는 중입니다...</div>
        )

    return (
    <div key={userId} className="py-10">
      <OtherProfileCard
        user={otherUser}
        onToggleFollow={handleFollow}
      />
    </div>
  );
};

export default OtherUserPage;
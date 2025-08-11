import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { OtherUser } from "../types/otherUser";
import { fetchOtherUserProfile } from "../api/userService";
import { followUser, unfollowUser } from "../api/follow/followService";
import OtherProfileCard from "../components/domain/user/OtherProfileCard";
import { LoaderCircle, AlertTriangle } from "lucide-react";

const OtherUserPage = () => {
  const { userId } = useParams<{ userId: string }>();

  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const getUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchOtherUserProfile(userId);
        setOtherUser(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    getUserData();
  }, [userId]);

  // // 팔로우만 가능하도록 처리
  // const handleFollow = async () => {
  //   if (!otherUser || otherUser.following === true) return; // 이미 팔로우한 경우는 무시
  //   try {
  //     await followUser(otherUser.userId); // POST /api/follow/{userId}
  //     setOtherUser((prev) =>
  //       prev
  //         ? {
  //             ...prev,
  //             following: true,
  //             followerCount: prev.followerCount + 1,
  //           }
  //         : prev
  //     );
  //   } catch {}
  // };

  const handleToggleFollow = async () => {
    if (!otherUser) return;

    try {
      if (otherUser.following) {
        // --- 언팔로우 로직 ---
        await unfollowUser(otherUser.userId);
        setOtherUser((prev) =>
          prev
            ? {
                ...prev,
                following: false,
                followerCount: prev.followerCount - 1,
              }
            : null
        );
      } else {
        // --- 팔로우 로직 ---
        await followUser(otherUser.userId);
        setOtherUser((prev) =>
          prev
            ? {
                ...prev,
                following: true,
                followerCount: prev.followerCount + 1,
              }
            : null
        );
      }
    } catch (err) {
      console.error("Follow/Unfollow failed", err);
      // 실패 시 사용자에게 알림을 줄 수 있습니다.
    }
  };

  if (isLoading && !otherUser) {
    // 첫 로딩 시
    return (
      <div className="text-center mt-20 flex flex-col items-center justify-center">
        <LoaderCircle className="w-10 h-10 animate-spin text-gray-300" />
        <p className="mt-2">유저 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    // 에러 발생 시
    return (
      <div className="text-center mt-20 flex flex-col items-center justify-center">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className="mt-2 text-red-500">
          유저 정보를 불러오는 데 실패했습니다.
        </p>
      </div>
    );
  }

  // 로딩이 끝났는데 유저 데이터가 없는 경우
  if (!otherUser) {
    return <div className="text-center mt-20">존재하지 않는 유저입니다.</div>;
  }

  return (
    <div key={userId} className="py-10">
      <OtherProfileCard user={otherUser} onToggleFollow={handleToggleFollow} />
    </div>
  );
};

export default OtherUserPage;

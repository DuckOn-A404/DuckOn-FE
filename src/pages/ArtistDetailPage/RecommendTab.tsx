import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wrench, LoaderCircle, AlertTriangle } from "lucide-react";
import { getRecommendedUsers } from "../../api/userService";
import { followUser } from "../../api/follow/followService";
import { type RecommendedUser } from "../../types";

const RecommendTab = ({ artistId }: { artistId: number }) => {
  const [users, setUsers] = useState<RecommendedUser[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!artistId) {
      setIsLoading(false);
      return;
    }

    const fetchInitialUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const initialUsers = await getRecommendedUsers(artistId);
        setUsers(initialUsers);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialUsers();
  }, [artistId]);

  // 팔로우 버튼
  const handleFollow = async (e: React.MouseEvent, userIdToFollow: string) => {
    e.preventDefault();
    e.stopPropagation();

    const targetUser = users?.find((u) => u.userId === userIdToFollow);
    if (!users || !targetUser || targetUser.following) {
      return;
    }

    try {
      await followUser(userIdToFollow);

      setUsers((currentUsers) => {
        if (!currentUsers) return null;
        return currentUsers.map((user) =>
          user.userId === userIdToFollow ? { ...user, following: true } : user
        );
      });
    } catch (err) {
      console.error("팔로우 요청에 실패했습니다.", err);
    }
  };

  // 로딩 중일 때 보여줄 UI
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 text-gray-500">
        <LoaderCircle className="w-12 h-12 text-gray-300 animate-spin mb-4" />
        <p className="text-sm text-gray-400">추천 사용자를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 발생 시 보여줄 UI
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 text-red-500">
        <AlertTriangle className="w-12 h-12 text-red-300 mb-4" />
        <h3 className="font-semibold text-red-600">오류 발생</h3>
        <p className="text-sm text-red-400 mt-1">
          데이터를 불러오는 데 실패했습니다.
        </p>
      </div>
    );
  }

  // 데이터가 없거나 빈 배열일 때 보여줄 UI
  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 text-gray-500">
        <Wrench className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="font-semibold text-gray-600">추천할 사용자가 없어요</h3>
        <p className="text-sm text-gray-400 mt-1">
          나와 비슷한 취향을 가진
          <br />
          다른 팬을 아직 찾지 못했어요!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-700">
          나와 비슷한 취향의 팬 🎸
        </h3>
        <p className="text-sm text-gray-500 mt-1">이런 팬들은 어떠세요?</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {users.map((user: RecommendedUser) => (
          <Link key={user.userId} to={`/user/${user.userId}`} className="block">
            <div className="flex items-center justify-between p-3 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <img
                  src={user.imgUrl || "/default_image.png"}
                  alt={`${user.nickname}의 프로필`}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span
                    className="font-medium text-gray-800"
                    title={user.nickname}
                  >
                    {user.nickname}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => handleFollow(e, user.userId)}
                disabled={user.following}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  user.following
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-purple-500 text-white hover:bg-purple-600"
                }`}
              >
                {user.following ? "팔로잉" : "팔로우"}
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendTab;

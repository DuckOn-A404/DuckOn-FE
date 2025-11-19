// import { useState, useEffect } from "react";
// import { Wrench, LoaderCircle, AlertTriangle } from "lucide-react";
// import { getRecommendedUsers } from "../../api/userService";
// import { followUser, unfollowUser } from "../../api/follow/followService";
// import { type RecommendedUser } from "../../types";
// import { useUserStore } from "../../store/useUserStore";
// import { useNavigate } from "react-router-dom";
// import ConnectionErrorModal from "../../components/common/modal/ConnectionErrorModal";
// import NicknameWithRank from "../../components/common/NicknameWithRank";

// const RecommendTab = ({ artistId }: { artistId: number }) => {
//   const [users, setUsers] = useState<RecommendedUser[] | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<Error | null>(null);
//   const { myUser } = useUserStore();
//   const isLoggedIn = !!myUser;
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!artistId) {
//       setIsLoading(false);
//       return;
//     }

//     const fetchInitialUsers = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const initialUsers = await getRecommendedUsers(artistId);
//         setUsers(initialUsers);
//       } catch (err) {
//         setError(err as Error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchInitialUsers();
//   }, [artistId]);

//   // 팔로우 버튼
//   const handleToggleFollow = async (
//     e: React.MouseEvent,
//     userIdToFollow: string
//   ) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!isLoggedIn) {
//       setIsModalOpen(true);
//       return;
//     }

//     const targetUser = users?.find((u) => u.userId === userIdToFollow);
//     if (!users || !targetUser) {
//       return;
//     }

//     try {
//       if (targetUser.following) {
//         // [언팔로우 로직]
//         await unfollowUser(userIdToFollow);
//         setUsers((currentUsers) =>
//           currentUsers
//             ? currentUsers.map((user) =>
//                 user.userId === userIdToFollow
//                   ? { ...user, following: false }
//                   : user
//               )
//             : null
//         );
//       } else {
//         // [팔로우 로직]
//         await followUser(userIdToFollow);
//         setUsers((currentUsers) =>
//           currentUsers
//             ? currentUsers.map((user) =>
//                 user.userId === userIdToFollow
//                   ? { ...user, following: true }
//                   : user
//               )
//             : null
//         );
//       }
//     } catch (err) {
//       console.error("팔로우/언팔로우 요청에 실패했습니다.", err);
//     }
//   };

//   const handleUserClick = (userId: string, nickname: string) => {
//     if (!isLoggedIn) {
//       setIsModalOpen(true);
//       return;
//     }
//     navigate(`/user/${userId}`, {
//       state: { nickname },
//     });
//   };

//   // 로딩 중일 때 보여줄 UI
//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full text-center p-4 text-gray-500">
//         <LoaderCircle className="w-12 h-12 text-gray-300 animate-spin mb-4" />
//         <p className="text-sm text-gray-400">추천 사용자를 불러오는 중...</p>
//       </div>
//     );
//   }

//   // 에러 발생 시 보여줄 UI
//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full text-center p-4 text-red-500">
//         <AlertTriangle className="w-12 h-12 text-red-300 mb-4" />
//         <h3 className="font-semibold text-red-600">오류 발생</h3>
//         <p className="text-sm text-red-400 mt-1">
//           데이터를 불러오는 데 실패했습니다.
//         </p>
//       </div>
//     );
//   }

//   // 데이터가 없거나 빈 배열일 때 보여줄 UI
//   if (!users || users.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full text-center p-4 text-gray-500">
//         <Wrench className="w-12 h-12 text-gray-300 mb-4" />
//         <h3 className="font-semibold text-gray-600">추천할 사용자가 없어요</h3>
//         <p className="text-sm text-gray-400 mt-1">
//           나와 비슷한 취향을 가진
//           <br />
//           다른 팬을 아직 찾지 못했어요!
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full bg-white">
//       <div className="flex-1 overflow-y-auto">
//         {users &&
//           users.map((user: RecommendedUser) => (
//             <div
//               key={user.userId}
//               onClick={() => handleUserClick(user.userId, user.nickname)}
//               className="block cursor-pointer"
//             >
//               <div className="flex items-center justify-between p-2 hover:bg-gray-50">
//                 <div className="flex items-center gap-3 flex-1 min-w-0">
//   <img
//     src={user.imgUrl || "/default_image.png"}
//     alt={`${user.nickname}의 프로필`}
//     className="w-12 h-12 rounded-full object-cover flex-shrink-0"
//   />
//   <div className="flex-1 min-w-0 flex items-center gap-1">
//     {/* 닉네임 앞 6글자만 표시 */}
//     <NicknameWithRank
//       nickname={
//         user.nickname.length > 6
//           ? `${user.nickname.slice(0, 6)}...`
//           : user.nickname
//       }
//       rankLevel={user.userRank?.rankLevel ?? "GREEN"}
//       badgeSize={18}
//     />
//   </div>
// </div>

//                 <button
//                   onClick={(e) => handleToggleFollow(e, user.userId)}
//                   className={`w-20 flex-shrink-0 px-2 py-1.5 rounded-full text-sm font-semibold transition-colors ${
//                     user.following
//                       ? "bg-gray-200 text-gray-500 hover:bg-gray-300"
//                       : "bg-purple-500 text-white hover:bg-purple-600"
//                   }`}
//                 >
//                   {user.following ? "팔로잉" : "팔로우"}
//                 </button>
//               </div>
//             </div>
//           ))}
//       </div>
//       <ConnectionErrorModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//       />
//     </div>
//   );
// };

// export default RecommendTab;

import { useState, useEffect } from "react";
import { Wrench, LoaderCircle, AlertTriangle } from "lucide-react";
import { getRecommendedUsers } from "../../api/userService";
import { followUser, unfollowUser } from "../../api/follow/followService";
import { type RecommendedUser } from "../../types";
import { useUserStore } from "../../store/useUserStore";
import { useNavigate } from "react-router-dom";
import ConnectionErrorModal from "../../components/common/modal/ConnectionErrorModal";
import NicknameWithRank from "../../components/common/NicknameWithRank";
import { useUiTranslate } from "../../hooks/useUiTranslate";

const RecommendTab = ({ artistId }: { artistId: number }) => {
  const [users, setUsers] = useState<RecommendedUser[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { myUser } = useUserStore();
  const isLoggedIn = !!myUser;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useUiTranslate();

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
  const handleToggleFollow = async (
    e: React.MouseEvent,
    userIdToFollow: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setIsModalOpen(true);
      return;
    }

    const targetUser = users?.find((u) => u.userId === userIdToFollow);
    if (!users || !targetUser) {
      return;
    }

    try {
      if (targetUser.following) {
        // 언팔로우
        await unfollowUser(userIdToFollow);
        setUsers((currentUsers) =>
          currentUsers
            ? currentUsers.map((user) =>
                user.userId === userIdToFollow
                  ? { ...user, following: false }
                  : user,
              )
            : null,
        );
      } else {
        // 팔로우
        await followUser(userIdToFollow);
        setUsers((currentUsers) =>
          currentUsers
            ? currentUsers.map((user) =>
                user.userId === userIdToFollow
                  ? { ...user, following: true }
                  : user,
              )
            : null,
        );
      }
    } catch (err) {
      console.error("팔로우/언팔로우 요청에 실패했습니다.", err);
    }
  };

  const handleUserClick = (userId: string, nickname: string) => {
    if (!isLoggedIn) {
      setIsModalOpen(true);
      return;
    }
    navigate(`/user/${userId}`, {
      state: { nickname },
    });
  };

  // 로딩 중 UI
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 text-gray-500">
        <LoaderCircle className="w-12 h-12 text-gray-300 animate-spin mb-4" />
        <p className="text-sm text-gray-400">
          {t(
            "recommendTab.loading",
            "추천 사용자를 불러오는 중...",
          )}
        </p>
      </div>
    );
  }

  // 에러 UI
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 text-red-500">
        <AlertTriangle className="w-12 h-12 text-red-300 mb-4" />
        <h3 className="font-semibold text-red-600">
          {t("recommendTab.errorTitle", "오류 발생")}
        </h3>
        <p className="text-sm text-red-400 mt-1">
          {t(
            "recommendTab.errorDesc",
            "데이터를 불러오는 데 실패했습니다.",
          )}
        </p>
      </div>
    );
  }

  // 데이터 없음 UI
  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 text-gray-500">
        <Wrench className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="font-semibold text-gray-600">
          {t(
            "recommendTab.emptyTitle",
            "추천할 사용자가 없어요",
          )}
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          {t(
            "recommendTab.emptyDesc.line1",
            "나와 비슷한 취향을 가진",
          )}
          <br />
          {t(
            "recommendTab.emptyDesc.line2",
            "다른 팬을 아직 찾지 못했어요!",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto">
        {users.map((user: RecommendedUser) => (
          <div
            key={user.userId}
            onClick={() => handleUserClick(user.userId, user.nickname)}
            className="block cursor-pointer"
          >
            <div className="flex items-center justify-between p-2 hover:bg-gray-50">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src={user.imgUrl || "/default_image.png"}
                  alt={t(
                    "recommendTab.profileAlt",
                    `${user.nickname}의 프로필`,
                  ).replace("{nickname}", user.nickname)}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0 flex items-center gap-1">
                  {/* 닉네임 앞 6글자만 표시 */}
                  <NicknameWithRank
                    nickname={
                      user.nickname.length > 6
                        ? `${user.nickname.slice(0, 6)}...`
                        : user.nickname
                    }
                    rankLevel={user.userRank?.rankLevel ?? "GREEN"}
                    badgeSize={18}
                  />
                </div>
              </div>

              <button
                onClick={(e) => handleToggleFollow(e, user.userId)}
                className={`w-20 flex-shrink-0 px-2 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  user.following
                    ? "bg-gray-200 text-gray-500 hover:bg-gray-300"
                    : "bg-purple-500 text-white hover:bg-purple-600"
                }`}
              >
                {user.following
                  ? t("recommendTab.following", "팔로잉")
                  : t("recommendTab.follow", "팔로우")}
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConnectionErrorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default RecommendTab;

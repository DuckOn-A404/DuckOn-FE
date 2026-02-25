// import { useParams, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import type { OtherUser } from "../types/otherUser";
// import type { RoomHistory } from "../types/room";
// import { fetchOtherUserProfile, fetchUserRooms } from "../api/userService";
// import { followUser, unfollowUser } from "../api/follow/followService";
// import OtherProfileCard from "../components/domain/user/OtherProfileCard";
// import MyCreatedRoomsPanel from "../components/domain/room/MyCreatedRoomsPanel";
// import { LoaderCircle, AlertTriangle } from "lucide-react";
// import { useUserStore } from "../store/useUserStore";

// const OtherUserPage = () => {
//   const { userId } = useParams<{ userId: string }>();
//   const navigate = useNavigate();
//   const myUser = useUserStore((state) => state.myUser);

//   const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
//   const [rooms, setRooms] = useState<RoomHistory[]>([]);
//   const [roomsPage, setRoomsPage] = useState(1);
//   const [roomsTotal, setRoomsTotal] = useState(0);
//   const [roomsLoading, setRoomsLoading] = useState(false);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<Error | null>(null);
//   const [isFollowLoading, setIsFollowLoading] = useState<boolean>(false);
//   const [showLoginModal, setShowLoginModal] = useState(false);

//   useEffect(() => {
//     if (!userId) {
//       setIsLoading(false);
//       return;
//     }

//     const getUserData = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         // 타 유저 정보 조회 (비로그인 사용자도 가능)
//         const myUserId = myUser?.userId || null;
//         const data = await fetchOtherUserProfile(userId, myUserId);
//         setOtherUser(data);

//         // 방 목록 조회
//         const roomsData = await fetchUserRooms(userId, 1, 12);
//         setRooms(roomsData.roomList);
//         setRoomsPage(1);
//         setRoomsTotal(roomsData.total);
//       } catch (err) {
//         setError(err as Error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     getUserData();
//   }, [userId, myUser?.userId]);

//   // // 팔로우만 가능하도록 처리
//   // const handleFollow = async () => {
//   //   if (!otherUser || otherUser.following === true) return; // 이미 팔로우한 경우는 무시
//   //   try {
//   //     await followUser(otherUser.userId); // POST /api/follow/{userId}
//   //     setOtherUser((prev) =>
//   //       prev
//   //         ? {
//   //             ...prev,
//   //             following: true,
//   //             followerCount: prev.followerCount + 1,
//   //           }
//   //         : prev
//   //     );
//   //   } catch {}
//   // };

//   const handleToggleFollow = async () => {
//     // 비로그인 사용자면 로그인 모달 표시
//     if (!myUser) {
//       setShowLoginModal(true);
//       return;
//     }

//     if (!otherUser || isFollowLoading) return;

//     setIsFollowLoading(true);

//     try {
//       if (otherUser.following) {
//         // --- 언팔로우 로직 ---
//         await unfollowUser(otherUser.userId);
//         setOtherUser((prev) =>
//           prev
//             ? {
//                 ...prev,
//                 following: false,
//                 followerCount: prev.followerCount - 1,
//               }
//             : null
//         );
//       } else {
//         // --- 팔로우 로직 ---
//         await followUser(otherUser.userId);
//         setOtherUser((prev) =>
//           prev
//             ? {
//                 ...prev,
//                 following: true,
//                 followerCount: prev.followerCount + 1,
//               }
//             : null
//         );
//       }
//     } catch (err) {
//       console.error("Follow/Unfollow failed", err);
//     } finally {
//       setIsFollowLoading(false);
//     }
//   };

//   // 무한스크롤 - 방 목록 추가 로드
//   const handleLoadMoreRooms = async () => {
//     if (roomsLoading || !userId) return;
//     if (rooms.length >= roomsTotal) return;

//     setRoomsLoading(true);
//     try {
//       const nextPage = roomsPage + 1;
//       const roomsData = await fetchUserRooms(userId, nextPage, 12);
//       setRooms((prev) => [...prev, ...roomsData.roomList]);
//       setRoomsPage(nextPage);
//     } catch (error) {
//       console.error("방 목록 로드 실패:", error);
//     } finally {
//       setRoomsLoading(false);
//     }
//   };

//   if (isLoading && !otherUser) {
//     // 첫 로딩 시
//     return (
//       <div className="text-center mt-20 flex flex-col items-center justify-center">
//         <LoaderCircle className="w-10 h-10 animate-spin text-gray-300" />
//         <p className="mt-2">유저 정보를 불러오는 중입니다...</p>
//       </div>
//     );
//   }

//   if (error) {
//     // 에러 발생 시
//     return (
//       <div className="text-center mt-20 flex flex-col items-center justify-center">
//         <AlertTriangle className="w-10 h-10 text-red-400" />
//         <p className="mt-2 text-red-500">
//           유저 정보를 불러오는 데 실패했습니다.
//         </p>
//       </div>
//     );
//   }

//   // 로딩이 끝났는데 유저 데이터가 없는 경우
//   if (!otherUser) {
//     return <div className="text-center mt-20">존재하지 않는 유저입니다.</div>;
//   }

//   return (
//     <div key={userId} className="py-10">
//       <OtherProfileCard
//         user={otherUser}
//         onToggleFollow={handleToggleFollow}
//         isFollowLoading={isFollowLoading}
//       />

//       {/* 방 생성 히스토리 */}
//       <div className="mt-8">
//         <MyCreatedRoomsPanel
//           rooms={rooms}
//           pageSize={12}
//           total={roomsTotal}
//           loading={roomsLoading}
//           onLoadMore={handleLoadMoreRooms}
//         />
//       </div>

//       {/* 로그인 모달 */}
//       {showLoginModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
//             <h2 className="text-lg font-bold mb-4">로그인이 필요합니다</h2>
//             <p className="text-gray-600 mb-6">
//               팔로우 기능을 사용하려면 로그인이 필요합니다.
//             </p>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowLoginModal(false)}
//                 className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
//               >
//                 취소
//               </button>
//               <button
//                 onClick={() => navigate("/login")}
//                 className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
//               >
//                 로그인
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OtherUserPage;

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import type { OtherUser } from "../types/otherUser";
import type { RoomHistory } from "../types/room";
import { fetchOtherUserProfile, fetchUserRooms } from "../api/userService";
import { followUser, unfollowUser } from "../api/follow/followService";
import OtherProfileCard from "../components/domain/user/OtherProfileCard";
import MyCreatedRoomsPanel from "../components/domain/room/MyCreatedRoomsPanel";
import { LoaderCircle, AlertTriangle } from "lucide-react";
import { useUserStore } from "../store/useUserStore";

const OtherUserPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const myUser = useUserStore((state) => state.myUser);

  const returnUrl = encodeURIComponent(location.pathname + location.search);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [rooms, setRooms] = useState<RoomHistory[]>([]);
  const [roomsPage, setRoomsPage] = useState(1);
  const [roomsTotal, setRoomsTotal] = useState(0);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFollowLoading, setIsFollowLoading] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const getUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 타 유저 정보 조회 (비로그인 사용자도 가능)
        const myUserId = myUser?.userId || null;
        const data = await fetchOtherUserProfile(userId, myUserId);
        setOtherUser(data);

        // 방 목록 조회
        const roomsData = await fetchUserRooms(userId, 1, 12);
        setRooms(roomsData.roomList);
        setRoomsPage(1);
        setRoomsTotal(roomsData.total);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    getUserData();
  }, [userId, myUser?.userId]);

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
    // 비로그인 사용자면 로그인 모달 표시
    if (!myUser) {
      setShowLoginModal(true);
      return;
    }

    if (!otherUser || isFollowLoading) return;

    setIsFollowLoading(true);

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
    } finally {
      setIsFollowLoading(false);
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
    <div key={userId} className="py-10 relative">
      {/* 익명 사용자용 블러 처리 + 오버레이 */}
      {!myUser && (
        <>
          {/* 블러 처리된 콘텐츠 */}
          <div className="filter blur-md pointer-events-none select-none">
            <OtherProfileCard
              user={otherUser}
              onToggleFollow={handleToggleFollow}
              isFollowLoading={isFollowLoading}
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
          </div>

          {/* 로그인 유도 오버레이 */}
          <div className="fixed inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
              <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                로그인이 필요합니다!
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                다른 사용자의 프로필을 확인하려면
                <br />
                회원가입이나 로그인이 필요합니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/signup?returnUrl=${returnUrl}`)}
                  className="flex-1 px-6 py-3 bg-rose-400 text-white rounded-lg hover:bg-rose-500 transition-colors font-bold shadow-md"
                >
                  회원가입하기
                </button>
                <button
                  onClick={() => navigate(`/login?returnUrl=${returnUrl}`)}
                  className="flex-1 px-6 py-3 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium shadow-md"
                >
                  로그인하기
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 로그인 사용자용 일반 콘텐츠 */}
      {myUser && (
        <>
          <OtherProfileCard
            user={otherUser}
            onToggleFollow={handleToggleFollow}
            isFollowLoading={isFollowLoading}
          />

          {/* 방 생성 히스토리 */}
          <div className="mt-8">
            <MyCreatedRoomsPanel
              rooms={rooms}
              pageSize={12}
              total={roomsTotal}
              loading={roomsLoading}
              onLoadMore={handleLoadMoreRooms}
            />
          </div>
        </>
      )}

      {/* 팔로우 시도 시 로그인 모달 (이제는 사용 안 함 - 위 오버레이로 대체) */}
      {showLoginModal && myUser && (
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
                onClick={() => navigate(`/login?returnUrl=${returnUrl}`)}
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

export default OtherUserPage;
// import { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { useUserStore } from "../../store/useUserStore";
// import { useArtistFollowStore } from "../../store/useArtistFollowStore";
// import { useArtistRooms } from "../../hooks/useArtistRooms";
// import {
//   followArtist,
//   unfollowArtist,
//   getArtistDetail,
// } from "../../api/artistService";
// import VideoCard from "../../components/domain/video/VideoCard";
// import RightSidebar from "./RightSidebar";
// import LeftSidebar from "./LeftSidebar";
// import type { ArtistDetailInfo } from "../../api/artistService";
// import type { Artist } from "../../types/artist";
// import { Video, Plus } from "lucide-react";
// import CreateRoomModal from "../../components/common/modal/CreateRoomModal";

// const PLACEHOLDER_URL =
//   "https://placehold.co/240x240/eeeeee/aaaaaa?text=No+Image&font=roboto";

// const ArtistDetailPage = () => {
//   const location = useLocation();
//   const artistId = location.state?.artistId as number | undefined;

//   // 아티스트 상세 정보와 로딩 상태를 위한 State
//   const [artist, setArtist] = useState<ArtistDetailInfo | null>(null);
//   const [isLoadingPage, setIsLoadingPage] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const { myUser } = useUserStore();
//   const {
//     isFollowing: followingSet,
//     addFollow,
//     removeFollow,
//     fetchFollowedArtists,
//   } = useArtistFollowStore();

//   const isLoggedIn = !!myUser;

//   // useArtistRooms 훅을 사용하여 방 목록 관련 로직 모두 위임
//   const {
//     liveRooms,
//     hasMoreLive,
//     isLoading: isLoadingRooms,
//     error: roomsError,
//     handleLoadMore,
//   } = useArtistRooms(artist?.artistId);

//   // 최적화된 팔로우 상태 확인
//   const isFollowing = artist
//     ? !!artist.followedAt || followingSet.has(artist.artistId)
//     : false;

//   // 페이지 진입 시 아티스트 상세 정보 불러오기
//   useEffect(() => {
//     const fetchPageData = async () => {
//       if (!artistId) {
//         setIsLoadingPage(false);
//         return;
//       }
//       setIsLoadingPage(true);
//       try {
//         const artistData = await getArtistDetail(artistId);
//         setArtist(artistData);
//       } catch {
//         setArtist(null);
//       } finally {
//         setIsLoadingPage(false);
//       }
//     };
//     fetchPageData();
//   }, [artistId]);

//   useEffect(() => {
//     if (isLoggedIn) {
//       fetchFollowedArtists();
//     }
//   }, [isLoggedIn, fetchFollowedArtists]);

//   if (isLoadingPage) {
//     return (
//       <div className="flex w-full bg-gray-50">
//         {/* 왼쪽: 팔로우 리스트 자리 */}
//         <LeftSidebar />

//         {/* 가운데: 스켈레톤 */}
//         <main className="flex-1 p-6 space-y-10 animate-pulse">
//           {/* 아티스트 카드 Skeleton */}
//           <div className="bg-white p-6 rounded-2xl shadow flex justify-between items-center">
//             <div className="flex items-center gap-6">
//               <div className="w-24 h-24 bg-gray-200 rounded-2xl" />
//               <div className="space-y-3">
//                 <div className="h-8 w-48 bg-gray-200 rounded" /> {/* nameKr */}
//                 <div className="h-4 w-32 bg-gray-200 rounded" /> {/* nameEn */}
//                 <div className="h-4 w-40 bg-gray-200 rounded" />{" "}
//                 {/* debutDate */}
//               </div>
//             </div>
//             <div className="w-20 h-8 bg-gray-200 rounded-full" />
//           </div>
//         </main>

//         {/* 오른쪽 실시간 탭 */}
//         {artist && <RightSidebar artistId={artist.artistId} />}
//       </div>
//     );
//   }

//   // // 팔로우 d-day 계산
//   // const getFollowDday = (dateString: string) => {
//   //   const today = new Date();
//   //   const target = new Date(dateString);

//   //   const KST_OFFSET = 9 * 60 * 60 * 1000;

//   //   const todayKST = new Date(today.getTime() + KST_OFFSET);
//   //   const targetKST = new Date(target.getTime() + KST_OFFSET);

//   //   const diff = Math.floor(
//   //     (todayKST.getTime() - targetKST.getTime()) / (1000 * 60 * 60 * 24)
//   //   );

//   //   return `D+${Math.max(diff + 1, 1)}`;
//   // };

//   if (!artist) {
//     return (
//       <div className="p-10 text-center text-gray-500">
//         아티스트를 찾을 수 없습니다.
//       </div>
//     );
//   }

//   // 팔로우 버튼 클릭 핸들러
//   const handleFollowToggle = async () => {
//     if (!myUser) return alert("로그인이 필요합니다.");
//     if (!artist) return;

//     try {
//       if (isFollowing) {
//         await unfollowArtist(artist.artistId);
//         removeFollow(artist.artistId);
//         setArtist((prev) => (prev ? { ...prev, followedAt: null } : prev));
//       } else {
//         await followArtist(artist.artistId);
//         // addFollow(artist);
//         addFollow({
//           artistId: artist.artistId,
//           nameEn: artist.nameEn,
//           nameKr: artist.nameKr,
//           imgUrl: artist.imgUrl ?? "", // null → 빈 문자열로 보정 (Artist는 string)
//           debutDate: artist.debutDate, // Artist 타입이 string|Date라면 string 유지 OK
//           followerCount: artist.followerCount ?? 0,
//         } as Artist);
//         setArtist((prev) =>
//           prev ? { ...prev, followedAt: new Date().toISOString() } : prev
//         );
//       }
//     } catch {
//       alert("요청 처리에 실패했습니다.");
//     }
//   };

//   return (
//     <div className="flex w-full">
//       {/* 왼쪽: 팔로우 리스트 */}
//       <div className="hidden lg:block">
//         <LeftSidebar />
//       </div>
//       {/* 가운데: 아티스트 카드 + 라이브/예정 */}
//       <main className="w-full lg:flex-1 p-4 sm:p-6 space-y-8">
//         <div className="bg-white p-6 rounded-2xl shadow flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
//           <div className="flex flex-col sm:flex-row items-center gap-6">
//             <img
//               src={artist.imgUrl || PLACEHOLDER_URL}
//               alt={artist.nameEn}
//               className="w-24 h-24 rounded-2xl object-cover shadow"
//             />
//             <div>
//               <h1 className="text-3xl font-bold">{artist.nameKr}</h1>
//               <p className="text-gray-600">{artist.nameEn}</p>
//               <p className="text-sm text-gray-500">
//                 데뷔일: {new Date(artist.debutDate).toLocaleDateString("ko-KR")}
//               </p>
//             </div>
//           </div>
//           {isLoggedIn && (
//             <div className="w-full sm:w-auto flex-shrink-0">
//               {isFollowing ? (
//                 <>
//                   {/* {artist.followedAt && (
//                     <p className="text-sm font-semibold">
//                       {getFollowDday(artist.followedAt)}
//                     </p>
//                   )} */}
//                   <button
//                     className="w-full sm:w-auto bg-purple-100 text-purple-700 font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors hover:bg-purple-200"
//                     onClick={handleFollowToggle}
//                   >
//                     팔로우 중
//                   </button>
//                 </>
//               ) : (
//                 // 팔로우 중이 아닐 때
//                 <button
//                   className="w-full sm:w-auto bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors hover:bg-purple-700"
//                   onClick={handleFollowToggle}
//                 >
//                   + 팔로우
//                 </button>
//               )}
//             </div>
//           )}
//         </div>

//         {/* 라이브 방 */}
//         <section>
//           {/* 섹션 헤더: 타이틀과 '새 방 만들기' 버튼 */}
//           <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 rounded-2xl bg-white p-5 shadow-md border border-gray-100">
//             {/* 왼쪽: 아이콘 및 텍스트 */}
//             <div className="flex items-center gap-4">
//               <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 text-white shadow-lg shadow-purple-200/50">
//                 <Video size={28} />
//               </div>
//               <div>
//                 <h2 className="text-xl font-bold text-gray-800">라이브 방</h2>
//                 <p className="text-sm text-gray-500">
//                   {liveRooms.length}개의 방이 진행 중
//                 </p>
//               </div>
//             </div>

//             {/* 오른쪽: '새 방 만들기' 버튼 또는 안내 메시지 */}
//             <div className="w-full sm:w-auto flex-shrink-0">
//               {isLoggedIn ? (
//                 isFollowing ? (
//                   <button
//                     onClick={() => setIsModalOpen(true)}
//                     className="flex w-full sm:w-auto items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-purple-300/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
//                   >
//                     <Plus size={16} />
//                     <span>새 방 만들기</span>
//                   </button>
//                 ) : (
//                   <div
//                     className="flex items-center justify-center 
//                    text-sm text-gray-600 
//                    bg-purple-50 border border-purple-200 
//                    px-4 py-2 rounded-lg 
//                    break-words max-w-xs sm:max-w-sm text-center"
//                   >
//                     이 아티스트를{" "}
//                     <span className="font-semibold text-purple-700">
//                       팔로우
//                     </span>
//                     해야 방을 생성할 수 있습니다.
//                   </div>
//                 )
//               ) : (
//                 <div
//                   className="flex items-center justify-center 
//                  text-sm text-gray-600 
//                  bg-gray-50 border border-gray-200 
//                  px-4 py-2 rounded-lg 
//                  break-words max-w-xs sm:max-w-sm text-center"
//                 >
//                   <span className="font-semibold">로그인</span> 후 방을 생성할
//                   수 있습니다.
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* 방 목록 표시 영역 */}
//           <div className="mt-6 flex flex-col items-center gap-8">
//             {/* 1. 로딩 중일 때 표시 */}
//             {isLoadingRooms && <p>방송 목록을 불러오는 중...</p>}

//             {/* 2. 에러 발생 시 표시 */}
//             {roomsError && <p className="text-red-500">{roomsError}</p>}

//             {/* 3. 로딩도 아니고 에러도 아닐 때 목록 또는 빈 메시지 표시 */}
//             {!isLoadingRooms && !roomsError && (
//               <>
//                 {liveRooms.length > 0 ? (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 w-full">
//                     {liveRooms.map((room) => (
//                       <VideoCard key={room.roomId} {...room} />
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-400 text-sm">
//                     현재 진행 중인 라이브 방송이 없습니다.
//                   </p>
//                 )}
//               </>
//             )}

//             {/* 4. 더 보여줄 방이 있을 때만 '더보기' 버튼 표시 */}
//             {hasMoreLive && (
//               <button
//                 onClick={handleLoadMore}
//                 disabled={isLoadingRooms}
//                 className="mt-4 px-6 py-2 bg-white border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
//               >
//                 더보기
//               </button>
//             )}
//           </div>
//         </section>
//       </main>

//       {/* 오른쪽: 실시간 탭 */}
//       <div className="hidden lg:block">
//         <RightSidebar artistId={artist!.artistId} />
//       </div>

//       {/* 방 생성 모달 */}
//       <CreateRoomModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         artistId={artist.artistId}
//         hostId={myUser?.userId ?? ""}
//         hostNickname={myUser?.nickname ?? ""}
//       />
//     </div>
//   );
// };

// export default ArtistDetailPage;


// import { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { useUserStore } from "../../store/useUserStore";
// import { useArtistFollowStore } from "../../store/useArtistFollowStore";
// import { useArtistRooms } from "../../hooks/useArtistRooms";
// import {
//   followArtist,
//   unfollowArtist,
//   getArtistDetail,
// } from "../../api/artistService";
// import VideoCard from "../../components/domain/video/VideoCard";
// import RightSidebar from "./RightSidebar";
// import LeftSidebar from "./LeftSidebar";
// import type { ArtistDetailInfo } from "../../api/artistService";
// import type { Artist } from "../../types/artist";
// import { Video, Plus } from "lucide-react";
// import CreateRoomModal from "../../components/common/modal/CreateRoomModal";
// import { isNativeApp } from "../../utils/platform";

// const PLACEHOLDER_URL =
//   "https://placehold.co/240x240/eeeeee/aaaaaa?text=No+Image&font=roboto";

// const ArtistDetailPage = () => {
//   const location = useLocation();
//   const artistId = location.state?.artistId as number | undefined;

//   const [artist, setArtist] = useState<ArtistDetailInfo | null>(null);
//   const [isLoadingPage, setIsLoadingPage] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const { myUser } = useUserStore();
//   const {
//     isFollowing: followingSet,
//     addFollow,
//     removeFollow,
//     fetchFollowedArtists,
//     followedArtists,
//   } = useArtistFollowStore();

//   const isLoggedIn = !!myUser;

//   const {
//     liveRooms,
//     hasMoreLive,
//     isLoading: isLoadingRooms,
//     error: roomsError,
//     handleLoadMore,
//   } = useArtistRooms(artist?.artistId);

//   const isFollowing = artist
//     ? !!artist.followedAt || followingSet.has(artist.artistId)
//     : false;

//   // 아티스트 상세 정보 로드
//   useEffect(() => {
//     const fetchPageData = async () => {
//       if (!artistId) {
//         setIsLoadingPage(false);
//         return;
//       }
//       setIsLoadingPage(true);
//       try {
//         const artistData = await getArtistDetail(artistId);
//         setArtist(artistData);
//       } catch {
//         setArtist(null);
//       } finally {
//         setIsLoadingPage(false);
//       }
//     };
//     fetchPageData();
//   }, [artistId]);

//   // 팔로우 목록 동기화
//   useEffect(() => {
//     if (isLoggedIn) {
//       fetchFollowedArtists();
//     }
//   }, [isLoggedIn, fetchFollowedArtists]);

//   if (isLoadingPage) {
//     // 로딩 화면은 웹/앱 공통으로 간단히만
//     return (
//       <div className="flex w-full bg-gray-50 justify-center items-center py-20">
//         <p className="text-sm text-gray-500">아티스트 정보를 불러오는 중...</p>
//       </div>
//     );
//   }

//   if (!artist) {
//     return (
//       <div className="p-10 text-center text-gray-500">
//         아티스트를 찾을 수 없습니다.
//       </div>
//     );
//   }

//   const handleFollowToggle = async () => {
//     if (!myUser) return alert("로그인이 필요합니다.");

//     try {
//       if (isFollowing) {
//         await unfollowArtist(artist.artistId);
//         removeFollow(artist.artistId);
//         setArtist((prev) => (prev ? { ...prev, followedAt: null } : prev));
//       } else {
//         await followArtist(artist.artistId);
//         addFollow({
//           artistId: artist.artistId,
//           nameEn: artist.nameEn,
//           nameKr: artist.nameKr,
//           imgUrl: artist.imgUrl ?? "",
//           debutDate: artist.debutDate,
//           followerCount: artist.followerCount ?? 0,
//         } as Artist);
//         setArtist((prev) =>
//           prev ? { ...prev, followedAt: new Date().toISOString() } : prev
//         );
//       }
//     } catch {
//       alert("요청 처리에 실패했습니다.");
//     }
//   };

//   /* ------------------------------------------------------------------
//    * 1) 웹(브라우저) 레이아웃 – 기존 코드 그대로 유지
//    * ------------------------------------------------------------------ */
//   if (!isNativeApp) {
//     return (
//       <div className="flex w-full">
//         {/* 왼쪽: 팔로우 리스트 */}
//         <div className="hidden lg:block">
//           <LeftSidebar />
//         </div>

//         {/* 가운데: 아티스트 카드 + 라이브/예정 */}
//         <main className="w-full lg:flex-1 p-4 sm:p-6 space-y-8">
//           <div className="bg-white p-6 rounded-2xl shadow flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
//             <div className="flex flex-col sm:flex-row items-center gap-6">
//               <img
//                 src={artist.imgUrl || PLACEHOLDER_URL}
//                 alt={artist.nameEn}
//                 className="w-24 h-24 rounded-2xl object-cover shadow"
//               />
//               <div>
//                 <h1 className="text-3xl font-bold">{artist.nameKr}</h1>
//                 <p className="text-gray-600">{artist.nameEn}</p>
//                 <p className="text-sm text-gray-500">
//                   데뷔일:{" "}
//                   {new Date(artist.debutDate).toLocaleDateString("ko-KR")}
//                 </p>
//               </div>
//             </div>
//             {isLoggedIn && (
//               <div className="w-full sm:w-auto flex-shrink-0">
//                 {isFollowing ? (
//                   <button
//                     className="w-full sm:w-auto bg-purple-100 text-purple-700 font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors hover:bg-purple-200"
//                     onClick={handleFollowToggle}
//                   >
//                     팔로우 중
//                   </button>
//                 ) : (
//                   <button
//                     className="w-full sm:w-auto bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors hover:bg-purple-700"
//                     onClick={handleFollowToggle}
//                   >
//                     + 팔로우
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* 라이브 방 섹션 (기존 그대로) */}
//           <section>
//             <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 rounded-2xl bg-white p-5 shadow-md border border-gray-100">
//               <div className="flex items-center gap-4">
//                 <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 text-white shadow-lg shadow-purple-200/50">
//                   <Video size={28} />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-800">라이브 방</h2>
//                   <p className="text-sm text-gray-500">
//                     {liveRooms.length}개의 방이 진행 중
//                   </p>
//                 </div>
//               </div>

//               <div className="w-full sm:w-auto flex-shrink-0">
//                 {isLoggedIn ? (
//                   isFollowing ? (
//                     <button
//                       onClick={() => setIsModalOpen(true)}
//                       className="flex w-full sm:w-auto items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-purple-300/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
//                     >
//                       <Plus size={16} />
//                       <span>새 방 만들기</span>
//                     </button>
//                   ) : (
//                     <div className="flex items-center justify-center text-sm text-gray-600 bg-purple-50 border border-purple-200 px-4 py-2 rounded-lg break-words max-w-xs sm:max-w-sm text-center">
//                       이 아티스트를{" "}
//                       <span className="font-semibold text-purple-700">
//                         팔로우
//                       </span>
//                       해야 방을 생성할 수 있습니다.
//                     </div>
//                   )
//                 ) : (
//                   <div className="flex items-center justify-center text-sm text-gray-600 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg break-words max-w-xs sm:max-w-sm text-center">
//                     <span className="font-semibold">로그인</span> 후 방을 생성할
//                     수 있습니다.
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="mt-6 flex flex-col items-center gap-8">
//               {isLoadingRooms && <p>방송 목록을 불러오는 중...</p>}
//               {roomsError && (
//                 <p className="text-red-500">{roomsError}</p>
//               )}

//               {!isLoadingRooms && !roomsError && (
//                 <>
//                   {liveRooms.length > 0 ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 w-full">
//                       {liveRooms.map((room) => (
//                         <VideoCard key={room.roomId} {...room} />
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="text-gray-400 text-sm">
//                       현재 진행 중인 라이브 방송이 없습니다.
//                     </p>
//                   )}
//                 </>
//               )}

//               {hasMoreLive && (
//                 <button
//                   onClick={handleLoadMore}
//                   disabled={isLoadingRooms}
//                   className="mt-4 px-6 py-2 bg-white border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
//                 >
//                   더보기
//                 </button>
//               )}
//             </div>
//           </section>
//         </main>

//         {/* 오른쪽: 실시간 탭 (웹만) */}
//         <div className="hidden lg:block">
//           <RightSidebar artistId={artist.artistId} />
//         </div>

//         <CreateRoomModal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           artistId={artist.artistId}
//           hostId={myUser?.userId ?? ""}
//           hostNickname={myUser?.nickname ?? ""}
//         />
//       </div>
//     );
//   }

//   /* ------------------------------------------------------------------
//    * 2) 앱(Capacitor) 레이아웃 – 멜론 느낌 수직 스크롤 구조
//    * ------------------------------------------------------------------ */

//   return (
//     <div className="w-full min-h-screen bg-[#F8F7FF]">
//       <main className="px-4 pt-4 pb-6 space-y-6">
//         {/* ① 아티스트 헤더 – 중앙 정렬, 큰 이미지/버튼 */}
//         <section className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center gap-4">
//           <img
//             src={artist.imgUrl || PLACEHOLDER_URL}
//             alt={artist.nameEn}
//             className="w-28 h-28 rounded-2xl object-cover shadow"
//           />
//           <div>
//             <h1 className="text-2xl font-bold">{artist.nameKr}</h1>
//             <p className="text-sm text-gray-600 mt-1">{artist.nameEn}</p>
//             <p className="text-xs text-gray-500 mt-1">
//               데뷔일:{" "}
//               {new Date(artist.debutDate).toLocaleDateString("ko-KR")}
//             </p>
//           </div>
//           {isLoggedIn && (
//             <button
//               onClick={handleFollowToggle}
//               className={
//                 isFollowing
//                   ? "w-full max-w-xs bg-purple-100 text-purple-700 font-semibold px-4 py-2 rounded-full cursor-pointer transition-colors hover:bg-purple-200"
//                   : "w-full max-w-xs bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-4 py-2 rounded-full cursor-pointer transition-colors hover:brightness-105"
//               }
//             >
//               {isFollowing ? "팔로우 중" : "+ 팔로우"}
//             </button>
//           )}
//         </section>

//         {/* ② 팔로우한 아티스트 – 멜론 ‘연관 아티스트’ 느낌의 가로 캐러셀 */}
//         {followedArtists.length > 0 && (
//           <section className="bg-white rounded-2xl shadow-md p-4">
//             <div className="flex items-center justify-between mb-3">
//               <h2 className="text-sm font-semibold text-gray-800">
//                 팔로우한 아티스트
//               </h2>
//               <span className="text-[11px] text-gray-400">
//                 {followedArtists.length}명
//               </span>
//             </div>
//             <div className="flex gap-3 overflow-x-auto no-scrollbar">
//               {followedArtists.map((a) => (
//                 <button
//                   key={a.artistId}
//                   className="flex-shrink-0 flex flex-col items-center gap-1"
//                   onClick={() =>
//                     location.state &&
//                     // 같은 페이지에서 다른 아티스트로 이동
//                     window.history.pushState(
//                       { artistId: a.artistId },
//                       "",
//                       `/artist/${a.nameEn}`
//                     )
//                   }
//                 >
//                   <img
//                     src={a.imgUrl || "https://placehold.co/64x64"}
//                     alt={a.nameKr}
//                     className="w-12 h-12 rounded-full object-cover border border-gray-200"
//                   />
//                   <span className="text-[11px] text-gray-700">
//                     {a.nameKr}
//                   </span>
//                 </button>
//               ))}
//             </div>
//           </section>
//         )}

//         {/* ③ 채팅/추천 – 멜론의 ‘팬 영역’처럼 중간에 배치 */}
//         <section className="bg-white rounded-2xl shadow-md p-4">
//           <RightSidebar artistId={artist.artistId} />
//         </section>

//         {/* ④ 라이브 방 – 음악방송/라이브 섹션 느낌 */}
//         <section className="bg-white rounded-2xl shadow-md p-4 space-y-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md shadow-purple-200/60">
//                 <Video size={20} />
//               </div>
//               <div>
//                 <h2 className="text-sm font-semibold text-gray-800">
//                   라이브 방
//                 </h2>
//                 <p className="text-xs text-gray-500">
//                   {liveRooms.length}개의 방이 진행 중
//                 </p>
//               </div>
//             </div>

//             <div className="flex-shrink-0">
//               {isLoggedIn ? (
//                 isFollowing ? (
//                   <button
//                     onClick={() => setIsModalOpen(true)}
//                     className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold shadow-sm"
//                   >
//                     <Plus size={14} />
//                     <span>새 방 만들기</span>
//                   </button>
//                 ) : (
//                   <span className="text-[11px] text-purple-500 font-semibold">
//                     팔로우 후 생성 가능
//                   </span>
//                 )
//               ) : (
//                 <span className="text-[11px] text-gray-400">
//                   로그인 필요
//                 </span>
//               )}
//             </div>
//           </div>

//           <div className="mt-2 flex flex-col items-center gap-4">
//             {isLoadingRooms && (
//               <p className="text-xs text-gray-500">
//                 방송 목록을 불러오는 중...
//               </p>
//             )}
//             {roomsError && (
//               <p className="text-xs text-red-500">{roomsError}</p>
//             )}

//             {!isLoadingRooms && !roomsError && (
//               <>
//                 {liveRooms.length > 0 ? (
//                   <div className="grid grid-cols-1 gap-3 w-full">
//                     {liveRooms.map((room) => (
//                       <VideoCard key={room.roomId} {...room} />
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-xs text-gray-400">
//                     현재 진행 중인 라이브 방송이 없습니다.
//                   </p>
//                 )}
//               </>
//             )}

//             {hasMoreLive && (
//               <button
//                 onClick={handleLoadMore}
//                 disabled={isLoadingRooms}
//                 className="mt-1 px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-[11px] font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
//               >
//                 더보기
//               </button>
//             )}
//           </div>
//         </section>
//       </main>

//       <CreateRoomModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         artistId={artist.artistId}
//         hostId={myUser?.userId ?? ""}
//         hostNickname={myUser?.nickname ?? ""}
//       />
//     </div>
//   );
// };

// export default ArtistDetailPage;

// import { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useUserStore } from "../../store/useUserStore";
// import { useArtistFollowStore } from "../../store/useArtistFollowStore";
// import { useArtistRooms } from "../../hooks/useArtistRooms";
// import {
//   followArtist,
//   unfollowArtist,
//   getArtistDetail,
// } from "../../api/artistService";
// import VideoCard from "../../components/domain/video/VideoCard";
// import RightSidebar from "./RightSidebar";
// import LeftSidebar from "./LeftSidebar";
// import type { ArtistDetailInfo } from "../../api/artistService";
// import type { Artist } from "../../types/artist";
// import { Video, Plus, MessageCircle, Play } from "lucide-react";
// import CreateRoomModal from "../../components/common/modal/CreateRoomModal";
// import { isNativeApp } from "../../utils/platform";

// const PLACEHOLDER_URL =
//   "https://placehold.co/240x240/eeeeee/aaaaaa?text=No+Image&font=roboto";

// const ArtistDetailPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const artistId = location.state?.artistId as number | undefined;

//   // 아티스트 상세 정보와 로딩 상태를 위한 State
//   const [artist, setArtist] = useState<ArtistDetailInfo | null>(null);
//   const [isLoadingPage, setIsLoadingPage] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const { myUser } = useUserStore();
//   const {
//     isFollowing: followingSet,
//     addFollow,
//     removeFollow,
//     fetchFollowedArtists,
//   } = useArtistFollowStore();

//   const isLoggedIn = !!myUser;

//   // 방 목록
//   const {
//     liveRooms,
//     hasMoreLive,
//     isLoading: isLoadingRooms,
//     error: roomsError,
//     handleLoadMore,
//   } = useArtistRooms(artist?.artistId);

//   // 최적화된 팔로우 상태 확인
//   const isFollowing = artist
//     ? !!artist.followedAt || followingSet.has(artist.artistId)
//     : false;

//   // 페이지 진입 시 아티스트 상세 정보 불러오기
//   useEffect(() => {
//     const fetchPageData = async () => {
//       if (!artistId) {
//         setIsLoadingPage(false);
//         return;
//       }
//       setIsLoadingPage(true);
//       try {
//         const artistData = await getArtistDetail(artistId);
//         setArtist(artistData);
//       } catch {
//         setArtist(null);
//       } finally {
//         setIsLoadingPage(false);
//       }
//     };
//     fetchPageData();
//   }, [artistId]);

//   useEffect(() => {
//     if (isLoggedIn) {
//       fetchFollowedArtists();
//     }
//   }, [isLoggedIn, fetchFollowedArtists]);

//   // 로딩 중일 때 (웹/앱 공통)
//   if (isLoadingPage) {
//     return (
//       <div className="flex w-full bg-gray-50">
//         {/* 왼쪽: 팔로우 리스트 자리 */}
//         <LeftSidebar />

//         {/* 가운데: 스켈레톤 */}
//         <main className="flex-1 p-6 space-y-10 animate-pulse">
//           <div className="bg-white p-6 rounded-2xl shadow flex justify-between items-center">
//             <div className="flex items-center gap-6">
//               <div className="w-24 h-24 bg-gray-200 rounded-2xl" />
//               <div className="space-y-3">
//                 <div className="h-8 w-48 bg-gray-200 rounded" />
//                 <div className="h-4 w-32 bg-gray-200 rounded" />
//                 <div className="h-4 w-40 bg-gray-200 rounded" />
//               </div>
//             </div>
//             <div className="w-20 h-8 bg-gray-200 rounded-full" />
//           </div>
//         </main>

//         {/* 오른쪽 실시간 탭 */}
//         {artist && <RightSidebar artistId={artist.artistId} />}
//       </div>
//     );
//   }

//   if (!artist) {
//     return (
//       <div className="p-10 text-center text-gray-500">
//         아티스트를 찾을 수 없습니다.
//       </div>
//     );
//   }

//   // 팔로우 버튼 클릭 핸들러
//   const handleFollowToggle = async () => {
//     if (!myUser) return alert("로그인이 필요합니다.");
//     if (!artist) return;

//     try {
//       if (isFollowing) {
//         await unfollowArtist(artist.artistId);
//         removeFollow(artist.artistId);
//         setArtist((prev) => (prev ? { ...prev, followedAt: null } : prev));
//       } else {
//         await followArtist(artist.artistId);
//         addFollow({
//           artistId: artist.artistId,
//           nameEn: artist.nameEn,
//           nameKr: artist.nameKr,
//           imgUrl: artist.imgUrl ?? "",
//           debutDate: artist.debutDate,
//           followerCount: artist.followerCount ?? 0,
//         } as Artist);
//         setArtist((prev) =>
//           prev ? { ...prev, followedAt: new Date().toISOString() } : prev
//         );
//       }
//     } catch {
//       alert("요청 처리에 실패했습니다.");
//     }
//   };

//   /* --------------------------------------------------
//    * A. 앱(Capacitor) 레이아웃
//    *    - 상단 아티스트 카드 / 팬톡 카드 그대로 유지
//    *    - '영상 / 라이브 방' 섹션의 리스트 카드만
//    *      라이브 방송 페이지(첫 번째 스샷) 느낌으로 변경
//    * -------------------------------------------------- */
//   if (isNativeApp) {
//     return (
//       <div className="w-full min-h-screen bg-[#F8F7FF]">
//         <main className="px-4 pt-4 pb-6 space-y-6">
//           {/* ① 아티스트 헤더: 왼쪽 이미지 + 오른쪽 정보 */}
//           <section className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-4">
//             <img
//               src={artist.imgUrl || PLACEHOLDER_URL}
//               alt={artist.nameEn}
//               className="w-20 h-20 rounded-2xl object-cover shadow"
//             />

//             <div className="flex-1 flex flex-col gap-1">
//               <div>
//                 <h1 className="text-xl font-bold">{artist.nameKr}</h1>
//                 <p className="text-xs text-gray-600">{artist.nameEn}</p>
//                 <p className="text-[11px] text-gray-500 mt-0.5">
//                   데뷔일{" "}
//                   {new Date(artist.debutDate).toLocaleDateString("ko-KR")}
//                 </p>
//               </div>

//               {isLoggedIn && (
//                 <button
//                   onClick={handleFollowToggle}
//                   className={
//                     isFollowing
//                       ? "mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold"
//                       : "mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold shadow-sm"
//                   }
//                 >
//                   {isFollowing ? "팔로우 중" : "+ 팔로우"}
//                 </button>
//               )}
//             </div>
//           </section>

//           {/* ② 팬톡(실시간 채팅 / 추천 팬) 진입 카드 */}
//           <section
//             className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between active:scale-[0.99] transition-transform"
//             onClick={() =>
//               navigate(`/artist/${artist.artistId}/fan`, {
//                 state: { artistId: artist.artistId },
//               })
//             }
//           >
//             <div className="flex items-center gap-3">
//               <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600">
//                 <MessageCircle size={18} />
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-sm font-semibold text-gray-900">
//                   팬톡
//                 </span>
//                 <span className="text-[11px] text-gray-500">
//                   실시간 채팅과 추천 팬을 한 곳에서
//                 </span>
//               </div>
//             </div>
//             <span className="text-xs text-gray-400">바로가기 &gt;</span>
//           </section>

//           {/* ③ 영상 / 라이브 방 – 라이브 방송 페이지 스타일로 */}
//           <section className="bg-white rounded-2xl shadow-md p-4 space-y-4">
//             {/* 섹션 헤더 */}
//             <div className="flex items-center justify-between">
//               <h2 className="text-sm font-semibold text-gray-900">
//                 라이브 방송
//               </h2>
//               {liveRooms.length > 0 && (
//                 <span className="text-[11px] text-gray-500">
//                   총 {liveRooms.length}개 방
//                 </span>
//               )}
//             </div>

//             {isLoadingRooms && (
//               <p className="text-xs text-gray-500">
//                 방 목록을 불러오는 중입니다...
//               </p>
//             )}
//             {roomsError && (
//               <p className="text-xs text-red-500">{roomsError}</p>
//             )}

//             {!isLoadingRooms && !roomsError && liveRooms.length === 0 && (
//               <p className="text-xs text-gray-400">
//                 현재 진행 중인 라이브 방송이 없습니다.
//               </p>
//             )}

//             {/* ✅ 라이브 방이 있을 때: 첫 번째 스샷처럼 큰 카드 리스트 */}
//             {!isLoadingRooms &&
//               !roomsError &&
//               liveRooms.length > 0 && (
//                 <div className="space-y-4">
//                   {liveRooms.map((room: any) => (
//                     <button
//                       key={room.roomId}
//                       type="button"
//                       onClick={() => navigate(`/live/${room.roomId}`)}
//                       className="w-full text-left rounded-2xl bg-white shadow-[0_10px_30px_rgba(15,23,42,.12)] border border-gray-100 overflow-hidden active:scale-[0.99] transition-transform"
//                     >
//                       {/* 썸네일 영역 */}
//                       <div className="relative">
//                         <img
//                           src={
//                             room.thumbnailImg || room.imgUrl || PLACEHOLDER_URL
//                           }
//                           alt={room.title}
//                           className="w-full h-40 object-cover"
//                         />
//                         {/* 오른쪽 하단 시청자 뱃지 + 플레이 */}
//                         <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[10px] text-white">
//                           <Play size={12} className="opacity-90" />
//                           <span>
//                             {room.participantCount ?? 0}명 시청 중
//                           </span>
//                         </div>
//                       </div>

//                       {/* 하단 정보 영역 */}
//                       <div className="flex items-center gap-3 px-4 py-3">
//                         <img
//                           src={
//                             room.hostProfileImgUrl || "/default_image.png"
//                           }
//                           alt={room.hostNickname}
//                           className="w-8 h-8 rounded-full object-cover flex-shrink-0"
//                         />
//                         <div className="flex-1 min-w-0">
//                           <p className="text-sm font-semibold text-gray-900 truncate">
//                             {room.title}
//                           </p>
//                           <p className="text-[11px] text-gray-500 truncate">
//                             {room.hostNickname}
//                           </p>
//                         </div>
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               )}

//             {hasMoreLive && (
//               <button
//                 onClick={handleLoadMore}
//                 disabled={isLoadingRooms}
//                 className="mt-1 w-full rounded-full border border-gray-200 bg-gray-50 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
//               >
//                 더보기
//               </button>
//             )}
//           </section>
//         </main>

//         <CreateRoomModal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           artistId={artist.artistId}
//           hostId={myUser?.userId ?? ""}
//           hostNickname={myUser?.nickname ?? ""}
//         />
//       </div>
//     );
//   }

//   /* --------------------------------------------------
//    * B. 웹(브라우저) 레이아웃 – 기존 코드 유지
//    *    + 로그인 전 / 팔로우 전 메시지:
//    *      - 로그인 전  → "로그인 후 방을 생성할 수 있습니다."
//    *      - 팔로우 전  → "이 아티스트를 팔로우해야 방을 생성할 수 있습니다."
//    * -------------------------------------------------- */

//   return (
//     <div className="flex w-full">
//       {/* 왼쪽: 팔로우 리스트 */}
//       <div className="hidden lg:block">
//         <LeftSidebar />
//       </div>

//       {/* 가운데: 아티스트 카드 + 라이브/예정 */}
//       <main className="w-full lg:flex-1 p-4 sm:p-6 space-y-8">
//         <div className="bg-white p-6 rounded-2xl shadow flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
//           <div className="flex flex-col sm:flex-row items-center gap-6">
//             <img
//               src={artist.imgUrl || PLACEHOLDER_URL}
//               alt={artist.nameEn}
//               className="w-24 h-24 rounded-2xl object-cover shadow"
//             />
//             <div>
//               <h1 className="text-3xl font-bold">{artist.nameKr}</h1>
//               <p className="text-gray-600">{artist.nameEn}</p>
//               <p className="text-sm text-gray-500">
//                 데뷔일:{" "}
//                 {new Date(artist.debutDate).toLocaleDateString("ko-KR")}
//               </p>
//             </div>
//           </div>
//           {isLoggedIn && (
//             <div className="w-full sm:w-auto flex-shrink-0">
//               {isFollowing ? (
//                 <button
//                   className="w-full sm:w-auto bg-purple-100 text-purple-700 font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors hover:bg-purple-200"
//                   onClick={handleFollowToggle}
//                 >
//                   팔로우 중
//                 </button>
//               ) : (
//                 <button
//                   className="w-full sm:w-auto bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors hover:bg-purple-700"
//                   onClick={handleFollowToggle}
//                 >
//                   + 팔로우
//                 </button>
//               )}
//             </div>
//           )}
//         </div>

//         {/* 라이브 방 */}
//         <section>
//           <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 rounded-2xl bg-white p-5 shadow-md border border-gray-100">
//             <div className="flex items-center gap-4">
//               <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 text-white shadow-lg shadow-purple-200/50">
//                 <Video size={28} />
//               </div>
//               <div>
//                 <h2 className="text-xl font-bold text-gray-800">라이브 방</h2>
//                 <p className="text-sm text-gray-500">
//                   {liveRooms.length}개의 방이 진행 중
//                 </p>
//               </div>
//             </div>

//             <div className="w-full sm:w-auto flex-shrink-0">
//               {isLoggedIn ? (
//                 isFollowing ? (
//                   <button
//                     onClick={() => setIsModalOpen(true)}
//                     className="flex w-full sm:w-auto items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-purple-300/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
//                   >
//                     <Plus size={16} />
//                     <span>새 방 만들기</span>
//                   </button>
//                 ) : (
//                   <div className="flex items-center justify-center text-sm text-gray-600 bg-purple-50 border border-purple-200 px-4 py-2 rounded-lg break-words max-w-xs sm:max-w-sm text-center">
//                     이 아티스트를{" "}
//                     <span className="font-semibold text-purple-700">
//                       팔로우
//                     </span>
//                     해야 방을 생성할 수 있습니다.
//                   </div>
//                 )
//               ) : (
//                 <div className="flex items-center justify-center text-sm text-gray-600 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg break-words max-w-xs sm:max-w-sm text-center">
//                   <span className="font-semibold">로그인</span> 후 방을 생성할
//                   수 있습니다.
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="mt-6 flex flex-col items-center gap-8">
//             {isLoadingRooms && <p>방송 목록을 불러오는 중...</p>}
//             {roomsError && <p className="text-red-500">{roomsError}</p>}

//             {!isLoadingRooms && !roomsError && (
//               <>
//                 {liveRooms.length > 0 ? (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 w-full">
//                     {liveRooms.map((room) => (
//                       <VideoCard key={room.roomId} {...room} />
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-400 text-sm">
//                     현재 진행 중인 라이브 방송이 없습니다.
//                   </p>
//                 )}
//               </>
//             )}

//             {hasMoreLive && (
//               <button
//                 onClick={handleLoadMore}
//                 disabled={isLoadingRooms}
//                 className="mt-4 px-6 py-2 bg-white border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
//               >
//                 더보기
//               </button>
//             )}
//           </div>
//         </section>
//       </main>

//       {/* 오른쪽: 실시간 탭 */}
//       <div className="hidden lg:block">
//         <RightSidebar artistId={artist!.artistId} />
//       </div>

//       {/* 방 생성 모달 */}
//       <CreateRoomModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         artistId={artist.artistId}
//         hostId={myUser?.userId ?? ""}
//         hostNickname={myUser?.nickname ?? ""}
//       />
//     </div>
//   );
// };

// export default ArtistDetailPage;

import { useState, useEffect, useRef, type TouchEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";
import { useArtistFollowStore } from "../../store/useArtistFollowStore";
import { useArtistRooms } from "../../hooks/useArtistRooms";
import {
  followArtist,
  unfollowArtist,
  getArtistDetail,
} from "../../api/artistService";
import VideoCard from "../../components/domain/video/VideoCard";
import RightSidebar from "./RightSidebar";
import LeftSidebar from "./LeftSidebar";
import type { ArtistDetailInfo } from "../../api/artistService";
import type { Artist } from "../../types/artist";
import { Video, Plus, MessageCircle } from "lucide-react";
import CreateRoomModal from "../../components/common/modal/CreateRoomModal";
import { isNativeApp } from "../../utils/platform";
import { Capacitor } from "@capacitor/core";

const PLACEHOLDER_URL =
  "https://placehold.co/240x240/eeeeee/aaaaaa?text=No+Image&font=roboto";

const isRealNativeApp = Capacitor.isNativePlatform();

const ArtistDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const artistId = location.state?.artistId as number | undefined;

  // 스와이프 뒤로가기용 ref (훅은 최상단에)
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isTrackingRef = useRef(false);

  // 스와이프 파라미터 (왼쪽 24px 엣지, 80px 이상, 수직 50px 이하)
  const EDGE_WIDTH = 24;
  const MIN_DISTANCE = 80;
  const MAX_VERTICAL_DRIFT = 50;

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!isRealNativeApp) return; // 웹/모바일웹에서는 동작 X

    const t = e.touches[0];
    startXRef.current = t.clientX;
    startYRef.current = t.clientY;

    // 왼쪽 엣지에서 시작했을 때만 후보
    isTrackingRef.current = t.clientX <= EDGE_WIDTH;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isRealNativeApp || !isTrackingRef.current) return;

    const t = e.touches[0];
    const vertical = Math.abs(t.clientY - startYRef.current);

    // 수직 이동이 너무 크면 스와이프 취소 (스크롤과 구분)
    if (vertical > MAX_VERTICAL_DRIFT) {
      isTrackingRef.current = false;
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!isRealNativeApp || !isTrackingRef.current) return;

    const t = e.changedTouches[0];
    const diffX = t.clientX - startXRef.current;

    if (diffX > MIN_DISTANCE) {
      navigate(-1);
    }

    isTrackingRef.current = false;
  };

  // 아티스트 상세 정보와 로딩 상태를 위한 State
  const [artist, setArtist] = useState<ArtistDetailInfo | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { myUser } = useUserStore();
  const {
    isFollowing: followingSet,
    addFollow,
    removeFollow,
    fetchFollowedArtists,
    // followedArtists,
  } = useArtistFollowStore();

  const isLoggedIn = !!myUser;

  // 방 목록
  const {
    liveRooms,
    hasMoreLive,
    isLoading: isLoadingRooms,
    error: roomsError,
    handleLoadMore,
  } = useArtistRooms(artist?.artistId);

  // 최적화된 팔로우 상태 확인
  const isFollowing = artist
    ? !!artist.followedAt || followingSet.has(artist.artistId)
    : false;

  // 페이지 진입 시 아티스트 상세 정보 불러오기
  useEffect(() => {
    const fetchPageData = async () => {
      if (!artistId) {
        setIsLoadingPage(false);
        return;
      }
      setIsLoadingPage(true);
      try {
        const artistData = await getArtistDetail(artistId);
        setArtist(artistData);
      } catch {
        setArtist(null);
      } finally {
        setIsLoadingPage(false);
      }
    };
    fetchPageData();
  }, [artistId]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchFollowedArtists();
    }
  }, [isLoggedIn, fetchFollowedArtists]);

  // 로딩 중일 때 (웹/앱 공통)
  if (isLoadingPage) {
    return (
      <div className="flex w-full bg-gray-50">
        {/* 왼쪽: 팔로우 리스트 자리 */}
        <LeftSidebar />

        {/* 가운데: 스켈레톤 */}
        <main className="flex-1 p-6 space-y-10 animate-pulse">
          <div className="bg-white p-6 rounded-2xl shadow flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded-2xl" />
              <div className="space-y-3">
                <div className="h-8 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-40 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded-full" />
          </div>
        </main>

        {/* 오른쪽 실시간 탭 */}
        {artist && <RightSidebar artistId={artist.artistId} />}
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="p-10 text-center text-gray-500">
        아티스트를 찾을 수 없습니다.
      </div>
    );
  }

  // 팔로우 버튼 클릭 핸들러
  const handleFollowToggle = async () => {
    if (!myUser) return alert("로그인이 필요합니다.");
    if (!artist) return;

    try {
      if (isFollowing) {
        await unfollowArtist(artist.artistId);
        removeFollow(artist.artistId);
        setArtist((prev) => (prev ? { ...prev, followedAt: null } : prev));
      } else {
        await followArtist(artist.artistId);
        addFollow({
          artistId: artist.artistId,
          nameEn: artist.nameEn,
          nameKr: artist.nameKr,
          imgUrl: artist.imgUrl ?? "",
          debutDate: artist.debutDate,
          followerCount: artist.followerCount ?? 0,
        } as Artist);
        setArtist((prev) =>
          prev ? { ...prev, followedAt: new Date().toISOString() } : prev
        );
      }
    } catch {
      alert("요청 처리에 실패했습니다.");
    }
  };

  /* --------------------------------------------------
   * A. 앱(Capacitor) 레이아웃
   * -------------------------------------------------- */
  if (isNativeApp) {
    return (
      <div
        className="w-full min-h-screen bg-[#F8F7FF]"
        // 앱 레이아웃 전체에 스와이프 뒤로가기 제스처 연결
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <main className="px-4 pt-4 pb-6 space-y-6">
          {/* ① 아티스트 헤더 */}
          <section className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-4">
            <img
              src={artist.imgUrl || PLACEHOLDER_URL}
              alt={artist.nameEn}
              className="w-20 h-20 rounded-2xl object-cover shadow"
            />

            <div className="flex-1 flex flex-col gap-1">
              <div>
                <h1 className="text-xl font-bold">{artist.nameKr}</h1>
                <p className="text-xs text-gray-600">{artist.nameEn}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  데뷔일{" "}
                  {new Date(artist.debutDate).toLocaleDateString("ko-KR")}
                </p>
              </div>

              {isLoggedIn && (
                <button
                  onClick={handleFollowToggle}
                  className={
                    isFollowing
                      ? "mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold"
                      : "mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold shadow-sm"
                  }
                >
                  {isFollowing ? "팔로우 중" : "+ 팔로우"}
                </button>
              )}
            </div>
          </section>

          {/* ② 팬톡 카드 */}
          <section
            className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between active:scale-[0.99] transition-transform"
            onClick={() =>
              navigate(`/artist/${artist.artistId}/fan`, {
                state: { artistId: artist.artistId },
              })
            }
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <MessageCircle size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  팬톡
                </span>
                <span className="text-[11px] text-gray-500">
                  실시간 채팅과 추천 팬을 한 곳에서
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-400">바로가기 &gt;</span>
          </section>

          {/* ③ 라이브 방 */}
          <section className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 text-white shadow-lg shadow-purple-200/60">
                  <Video size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">라이브 방</p>
                  <p className="text-[11px] text-gray-500">
                    {liveRooms.length}개의 방이 진행 중
                  </p>
                </div>
              </div>

              <div className="flex-1 flex justify-end">
                {isLoggedIn ? (
                  isFollowing ? (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold shadow-md shadow-purple-300/60"
                    >
                      <Plus size={14} />
                      <span>새 방 만들기</span>
                    </button>
                  ) : (
                    <div className="max-w-[180px] text-[10px] text-center text-gray-600 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg leading-snug">
                      이 아티스트를{" "}
                      <span className="font-semibold text-purple-700">
                        팔로우
                      </span>
                      해야 방을 생성할 수 있습니다.
                    </div>
                  )
                ) : (
                  <div className="max-w-[200px] text-[10px] text-center text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg leading-snug">
                    <span className="font-semibold">로그인</span> 후 방을
                    생성할 수 있습니다.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {isLoadingRooms && (
                <p className="text-xs text-gray-500 px-1">
                  방 목록을 불러오는 중입니다...
                </p>
              )}

              {roomsError && (
                <p className="text-xs text-red-500 px-1">{roomsError}</p>
              )}

              {!isLoadingRooms && !roomsError && liveRooms.length === 0 && (
                <p className="text-xs text-gray-400 px-1">
                  현재 진행 중인 라이브 방송이 없습니다.
                </p>
              )}

              {!isLoadingRooms &&
                !roomsError &&
                liveRooms.length > 0 && (
                  <div className="space-y-4">
                    {liveRooms.map((room: any) => (
                      <VideoCard key={room.roomId} {...room} />
                    ))}
                  </div>
                )}

              {hasMoreLive && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingRooms}
                  className="mt-1 w-full rounded-full border border-gray-200 bg-gray-50 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  더보기
                </button>
              )}
            </div>
          </section>
        </main>

        {/* 앱에서도 웹과 동일한 방 생성 모달 사용 */}
        <CreateRoomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          artistId={artist.artistId}
          hostId={myUser?.userId ?? ""}
          hostNickname={myUser?.nickname ?? ""}
        />
      </div>
    );
  }

  /* --------------------------------------------------
   * B. 웹(브라우저) 레이아웃 – 기존 코드 그대로 유지
   * -------------------------------------------------- */

  return (
    <div className="flex w-full">
      {/* 왼쪽: 팔로우 리스트 */}
      <div className="hidden lg:block">
        <LeftSidebar />
      </div>

      {/* 가운데: 아티스트 카드 + 라이브/예정 */}
      <main className="w-full lg:flex-1 p-4 sm:p-6 space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img
              src={artist.imgUrl || PLACEHOLDER_URL}
              alt={artist.nameEn}
              className="w-24 h-24 rounded-2xl object-cover shadow"
            />
            <div>
              <h1 className="text-3xl font-bold">{artist.nameKr}</h1>
              <p className="text-gray-600">{artist.nameEn}</p>
              <p className="text-sm text-gray-500">
                데뷔일:{" "}
                {new Date(artist.debutDate).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>
          {isLoggedIn && (
            <div className="w-full sm:w-auto flex-shrink-0">
              {isFollowing ? (
                <button
                  className="w-full sm:w-auto bg-purple-100 text-purple-700 font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors hover:bg-purple-200"
                  onClick={handleFollowToggle}
                >
                  팔로우 중
                </button>
              ) : (
                <button
                  className="w-full sm:w-auto bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors hover:bg-purple-700"
                  onClick={handleFollowToggle}
                >
                  + 팔로우
                </button>
              )}
            </div>
          )}
        </div>

        {/* 라이브 방 */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 rounded-2xl bg-white p-5 shadow-md border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 text-white shadow-lg shadow-purple-200/50">
                <Video size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">라이브 방</h2>
                <p className="text-sm text-gray-500">
                  {liveRooms.length}개의 방이 진행 중
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto flex-shrink-0">
              {isLoggedIn ? (
                isFollowing ? (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-purple-300/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <Plus size={16} />
                    <span>새 방 만들기</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-center text-sm text-gray-600 bg-purple-50 border border-purple-200 px-4 py-2 rounded-lg break-words max-w-xs sm:max-w-sm text-center">
                    이 아티스트를{" "}
                    <span className="font-semibold text-purple-700">
                      팔로우
                    </span>
                    해야 방을 생성할 수 있습니다.
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center text-sm text-gray-600 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg break-words max-w-xs sm:max-w-sm text-center">
                  <span className="font-semibold">로그인</span> 후 방을 생성할
                  수 있습니다.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-8">
            {isLoadingRooms && <p>방송 목록을 불러오는 중...</p>}
            {roomsError && <p className="text-red-500">{roomsError}</p>}

            {!isLoadingRooms && !roomsError && (
              <>
                {liveRooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 w-full">
                    {liveRooms.map((room) => (
                      <VideoCard key={room.roomId} {...room} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">
                    현재 진행 중인 라이브 방송이 없습니다.
                  </p>
                )}
              </>
            )}

            {hasMoreLive && (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingRooms}
                className="mt-4 px-6 py-2 bg-white border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                더보기
              </button>
            )}
          </div>
        </section>
      </main>

      {/* 오른쪽: 실시간 탭 */}
      <div className="hidden lg:block">
        <RightSidebar artistId={artist!.artistId} />
      </div>

      {/* 방 생성 모달 */}
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        artistId={artist.artistId}
        hostId={myUser?.userId ?? ""}
        hostNickname={myUser?.nickname ?? ""}
      />
    </div>
  );
};

export default ArtistDetailPage;

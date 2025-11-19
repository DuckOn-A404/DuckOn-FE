// import {useEffect, useState, useRef, type TouchEvent} from "react";
// import {
//   Trophy,
//   Crown,
//   Medal,
//   TrendingUp,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import {Capacitor} from "@capacitor/core";
// import {useNavigate} from "react-router-dom";
// import {getUserLeaderboard, type LeaderboardUser} from "../api/userService";
// import RankBadge from "../components/common/RankBadge";

// // 기존 로직 그대로 유지 (스타일/레이아웃 용)
// const isNativeApp = Capacitor.isNativePlatform() || window.innerWidth <= 768;
// const isRealNativeApp = Capacitor.isNativePlatform();

// const LeaderboardPage = () => {
//   const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
//   const [loading, setLoading] = useState(true);

//   // 앱에서 TOP3 가로 스와이프용
//   const [activeTopIndex, setActiveTopIndex] = useState(0);
//   const sliderRef = useRef<HTMLDivElement | null>(null);

//   // 뒤로가기 스와이프용 ref & 파라미터
//   const navigate = useNavigate();
//   const startXRef = useRef(0);
//   const startYRef = useRef(0);
//   const isTrackingRef = useRef(false);

//   const EDGE_WIDTH = 24;          // 왼쪽 엣지 범위 (px)
//   const MIN_DISTANCE = 80;        // 최소 스와이프 거리
//   const MAX_VERTICAL_DRIFT = 50;  // 수직 흔들림 허용

//   const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
//     if (!isRealNativeApp) return;

//     const touch = e.touches[0];
//     startXRef.current = touch.clientX;
//     startYRef.current = touch.clientY;

//     // 왼쪽 엣지에서 시작했을 때만 후보
//     isTrackingRef.current = touch.clientX <= EDGE_WIDTH;
//   };

//   const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
//     if (!isRealNativeApp || !isTrackingRef.current) return;

//     const touch = e.touches[0];
//     const vertical = Math.abs(touch.clientY - startYRef.current);

//     // 위아래로 너무 많이 움직이면 취소
//     if (vertical > MAX_VERTICAL_DRIFT) {
//       isTrackingRef.current = false;
//     }
//   };

//   const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
//     if (!isRealNativeApp || !isTrackingRef.current) return;

//     const touch = e.changedTouches[0];
//     const diffX = touch.clientX - startXRef.current;

//     if (diffX > MIN_DISTANCE) {
//       navigate(-1);
//     }

//     isTrackingRef.current = false;
//   };

//   useEffect(() => {
//     const loadLeaderboard = async () => {
//       try {
//         const response = await getUserLeaderboard(0, 50);
//         setLeaderboard(response.data || []);
//       } catch (error) {
//         console.error("리더보드 로드 실패:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadLeaderboard();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <div className="container mx-auto px-4 py-8">
//           <p className="text-center">로딩 중...</p>
//         </div>
//       </div>
//     );
//   }

//   const top3 = leaderboard.slice(0, 3);
//   const rest = leaderboard.slice(3);

//   // 순위별 색상 및 아이콘
//   const getRankStyle = (rank: number) => {
//     switch (rank) {
//       case 1:
//         return {
//           gradient: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
//           icon: <Crown size={32} color="#FFD700" />,
//           shadow: "0 8px 32px rgba(255, 215, 0, 0.4)",
//           scale: 1.1,
//         };
//       case 2:
//         return {
//           gradient: "linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)",
//           icon: <Medal size={28} color="#C0C0C0" />,
//           shadow: "0 6px 24px rgba(192, 192, 192, 0.4)",
//           scale: 1.05,
//         };
//       case 3:
//         return {
//           gradient: "linear-gradient(135deg, #CD7F32 0%, #B87333 100%)",
//           icon: <Trophy size={28} color="#CD7F32" />,
//           shadow: "0 6px 24px rgba(205, 127, 50, 0.4)",
//           scale: 1.05,
//         };
//       default:
//         return {
//           gradient: "linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)",
//           icon: <TrendingUp size={20} color="#9333EA" />,
//           shadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
//           scale: 1,
//         };
//     }
//   };

//   // 앱에서 TOP3 한 명씩 카드로 보여주는 렌더러
//   const renderMobileTopCard = (user: LeaderboardUser, rank: number) => {
//     const style = getRankStyle(rank);

//     return (
//       <div className="w-full flex-shrink-0 px-6 flex items-center justify-center">
//         <div
//           className="w-full max-w-xs rounded-3xl py-8 px-4 flex flex-col items-center"
//           style={{
//             background: style.gradient,
//             boxShadow: style.shadow,
//           }}
//         >
//           <div className="relative mb-4">
//             <img
//               src={user.profileImgUrl || "/default_image.png"}
//               alt={user.nickname}
//               className="w-24 h-24 rounded-full border-4 border-white object-cover"
//             />
//             <div className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-md">
//               {style.icon}
//             </div>
//           </div>
//           <h3 className="text-xl font-extrabold text-white mb-1 text-center truncate w-full">
//             {user.nickname}
//           </h3>
//           <span className="inline-block bg-white/95 text-gray-800 font-bold text-sm px-4 py-1 rounded-full mb-3">
//             {rank === 1 ? "👑 1위" : `${rank}위`}
//           </span>
//           <div className="flex items-center gap-2">
//             <RankBadge rankLevel={user.userRank.rankLevel} size={24} />
//             <span className="text-sm text-white font-semibold">
//               {user.userRank.roomCreateCount} DP
//             </span>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // 앱에서 스와이프 시 현재 인덱스 업데이트
//   const handleSliderScroll = () => {
//     if (!sliderRef.current) return;
//     const el = sliderRef.current;
//     const index = Math.round(el.scrollLeft / el.clientWidth);
//     setActiveTopIndex(index);
//   };

//   const scrollToIndex = (index: number) => {
//     if (!sliderRef.current) return;
//     const clamped = Math.min(Math.max(index, 0), top3.length - 1);
//     const el = sliderRef.current;
//     el.scrollTo({
//       left: clamped * el.clientWidth,
//       behavior: "smooth",
//     });
//     setActiveTopIndex(clamped);
//   };

//   return (
//     <div
//       className="min-h-screen bg-gray-50"
//       // 여기서 스와이프 이벤트 처리 (앱에서만 로직 동작)
//       onTouchStart={handleTouchStart}
//       onTouchMove={handleTouchMove}
//       onTouchEnd={handleTouchEnd}
//       // 앱에서만 위/아래 safe-area + 여유 padding
//       style={
//         isNativeApp
//           ? {
//               paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
//               paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
//             }
//           : undefined
//       }
//     >
//       <div className="container mx-auto px-4 py-12 max-w-6xl">
//         {/* 헤더 */}
//         <div className="text-center mb-12">
//           <div className="flex items-center justify-center gap-4 mb-4">
//             <Trophy size={40} color="#9333EA" />
//             <h1 className="text-5xl font-extrabold text-gray-900">Ranking</h1>
//           </div>
//           <p className="text-lg text-gray-600">자신의 덕력을 증명하라 👑</p>
//         </div>

//         {/* TOP 3 */}
//         {top3.length > 0 && (
//           <div className="mb-12">
//             <h2 className="text-3xl font-bold text-center mb-6">🏆 TOP 3</h2>

//             {/* 앱: 가로 스와이프 슬라이더 */}
//             {isNativeApp ? (
//               <div className="relative">
//                 <div
//                   ref={sliderRef}
//                   className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-4"
//                   style={{scrollbarWidth: "none"}}
//                   onScroll={handleSliderScroll}
//                 >
//                   {top3.map((user, idx) => (
//                     <div
//                       key={user.userId}
//                       className="snap-center w-full flex-shrink-0"
//                     >
//                       {renderMobileTopCard(user, idx + 1)}
//                     </div>
//                   ))}
//                 </div>

//                 {/* 좌우 버튼 */}
//                 <div className="flex items-center justify-center gap-10 mt-4">
//                   <button
//                     type="button"
//                     onClick={() => scrollToIndex(activeTopIndex - 1)}
//                     disabled={activeTopIndex === 0}
//                     className={`w-9 h-9 rounded-full flex items-center justify-center border border-gray-300 bg-white shadow-sm ${
//                       activeTopIndex === 0
//                         ? "opacity-40 cursor-default"
//                         : "active:scale-95"
//                     }`}
//                   >
//                     <ChevronLeft className="w-5 h-5 text-gray-700" />
//                   </button>

//                   <div className="text-sm font-semibold text-gray-700">
//                     {activeTopIndex + 1} / {top3.length}
//                   </div>

//                   <button
//                     type="button"
//                     onClick={() => scrollToIndex(activeTopIndex + 1)}
//                     disabled={activeTopIndex === top3.length - 1}
//                     className={`w-9 h-9 rounded-full flex items-center justify-center border border-gray-300 bg-white shadow-sm ${
//                       activeTopIndex === top3.length - 1
//                         ? "opacity-40 cursor-default"
//                         : "active:scale-95"
//                     }`}
//                   >
//                     <ChevronRight className="w-5 h-5 text-gray-700" />
//                   </button>
//                 </div>

//                 <div className="flex justify-center gap-2 mt-2">
//                   {top3.map((_, idx) => (
//                     <span
//                       key={idx}
//                       className={`w-2 h-2 rounded-full ${
//                         idx === activeTopIndex ? "bg-purple-600" : "bg-gray-300"
//                       }`}
//                     />
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               /* 웹: 시상대 스타일 그대로 */
//               <div className="flex justify-center items-end gap-6 flex-wrap">
//                 {/* 2위 */}
//                 {top3[1] && (
//                   <div
//                     className="w-60 rounded-2xl transition-all duration-300 hover:scale-110"
//                     style={{
//                       background: getRankStyle(2).gradient,
//                       boxShadow: getRankStyle(2).shadow,
//                       transform: `scale(${getRankStyle(2).scale})`,
//                     }}
//                   >
//                     <div className="text-center py-6">
//                       <div className="relative inline-block mb-4">
//                         <img
//                           src={top3[1].profileImgUrl || "/default_image.png"}
//                           alt={top3[1].nickname}
//                           className="w-20 h-20 rounded-full border-4 border-white mx-auto object-cover"
//                         />
//                         <div className="absolute -top-2 -right-2 bg-white rounded-full p-1">
//                           {getRankStyle(2).icon}
//                         </div>
//                       </div>
//                       <h3 className="text-xl font-bold text-white mb-1">
//                         {top3[1].nickname}
//                       </h3>
//                       <span className="inline-block bg-white/90 text-gray-600 font-bold text-sm px-3 py-1 rounded-full mb-2">
//                         2위
//                       </span>
//                       <div className="flex justify-center items-center gap-2">
//                         <RankBadge
//                           rankLevel={top3[1].userRank.rankLevel}
//                           size={24}
//                         />
//                         <span className="text-sm text-white font-semibold">
//                           {top3[1].userRank.roomCreateCount} DP
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* 1위 */}
//                 {top3[0] && (
//                   <div
//                     className="w-64 rounded-2xl transition-all duration-300 hover:scale-115"
//                     style={{
//                       background: getRankStyle(1).gradient,
//                       boxShadow: getRankStyle(1).shadow,
//                       transform: `scale(${getRankStyle(1).scale})`,
//                     }}
//                   >
//                     <div className="text-center py-8">
//                       <div className="relative inline-block mb-4">
//                         <img
//                           src={top3[0].profileImgUrl || "/default_image.png"}
//                           alt={top3[0].nickname}
//                           className="w-24 h-24 rounded-full border-4 border-white mx-auto object-cover"
//                         />
//                         <div className="absolute -top-3 -right-3 bg-white rounded-full p-2">
//                           {getRankStyle(1).icon}
//                         </div>
//                       </div>
//                       <h3 className="text-2xl font-extrabold text-white mb-1">
//                         {top3[0].nickname}
//                       </h3>
//                       <span className="inline-block bg-white/95 text-yellow-500 font-extrabold text-base px-4 py-1 rounded-full mb-3">
//                         👑 1위
//                       </span>
//                       <div className="flex justify-center items-center gap-2">
//                         <RankBadge
//                           rankLevel={top3[0].userRank.rankLevel}
//                           size={28}
//                         />
//                         <span className="text-base text-white font-bold">
//                           {top3[0].userRank.roomCreateCount} DP
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* 3위 */}
//                 {top3[2] && (
//                   <div
//                     className="w-60 rounded-2xl transition-all duration-300 hover:scale-110"
//                     style={{
//                       background: getRankStyle(3).gradient,
//                       boxShadow: getRankStyle(3).shadow,
//                       transform: `scale(${getRankStyle(3).scale})`,
//                     }}
//                   >
//                     <div className="text-center py-6">
//                       <div className="relative inline-block mb-4">
//                         <img
//                           src={top3[2].profileImgUrl || "/default_image.png"}
//                           alt={top3[2].nickname}
//                           className="w-20 h-20 rounded-full border-4 border-white mx-auto object-cover"
//                         />
//                         <div className="absolute -top-2 -right-2 bg-white rounded-full p-1">
//                           {getRankStyle(3).icon}
//                         </div>
//                       </div>
//                       <h3 className="text-xl font-bold text-white mb-1">
//                         {top3[2].nickname}
//                       </h3>
//                       <span className="inline-block bg-white/90 text-gray-600 font-bold text-sm px-3 py-1 rounded-full mb-2">
//                         3위
//                       </span>
//                       <div className="flex justify-center items-center gap-2">
//                         <RankBadge
//                           rankLevel={top3[2].userRank.rankLevel}
//                           size={24}
//                         />
//                         <span className="text-sm text-white font-semibold">
//                           {top3[2].userRank.roomCreateCount} DP
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {/* 4-50위 리스트 */}
//         {rest.length > 0 && (
//           <div>
//             <h2 className="text-3xl font-bold mb-6">📊 4위 ~ 50위</h2>
//             <div className="flex flex-col gap-4">
//               {rest.map((user, index) => {
//                 const rank = index + 4;

//                 // 앱/웹에 따라 사이즈/폰트/간격 다르게
//                 const itemWrapperClass = `bg-white rounded-xl shadow-sm transition-all duration-300 ${
//                   isNativeApp ? "" : "hover:shadow-lg hover:-translate-y-1"
//                 }`;
//                 const itemInnerClass = isNativeApp
//                   ? "p-3 flex items-center gap-3"
//                   : "p-4 flex items-center gap-6";
//                 const rankCircleClass = isNativeApp
//                   ? "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
//                   : "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0";
//                 const profileImgClass = isNativeApp
//                   ? "w-12 h-12 rounded-full border-2 border-gray-100 object-cover flex-shrink-0"
//                   : "w-14 h-14 rounded-full border-3 border-gray-100 object-cover flex-shrink-0";
//                 const nicknameClass = isNativeApp
//                   ? "text-sm font-semibold mb-0.5 truncate"
//                   : "text-xl font-bold mb-1";
//                 const dpTextClass = isNativeApp
//                   ? "text-xs text-gray-600"
//                   : "text-sm text-gray-600";
//                 const rankLevelBadgeClass = isNativeApp
//                   ? "bg-purple-100 text-purple-600 font-bold text-xs px-2 py-0.5 rounded-full flex-shrink-0"
//                   : "bg-purple-100 text-purple-600 font-bold text-sm px-3 py-1 rounded-full flex-shrink-0";
//                 const badgeSize = isNativeApp ? 18 : 20;

//                 return (
//                   <div key={user.userId} className={itemWrapperClass}>
//                     <div className={itemInnerClass}>
//                       {/* 순위 */}
//                       <div
//                         className={rankCircleClass}
//                         style={{
//                           background:
//                             "linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)",
//                         }}
//                       >
//                         <span
//                           className={
//                             isNativeApp
//                               ? "text-base font-extrabold text-white"
//                               : "text-xl font-extrabold text-white"
//                           }
//                         >
//                           {rank}
//                         </span>
//                       </div>

//                       {/* 프로필 */}
//                       <img
//                         src={user.profileImgUrl || "/default_image.png"}
//                         alt={user.nickname}
//                         className={profileImgClass}
//                       />

//                       {/* 정보 */}
//                       <div className="flex-1 min-w-0">
//                         <h3 className={nicknameClass}>{user.nickname}</h3>
//                         <div className="flex items-center gap-1">
//                           <RankBadge
//                             rankLevel={user.userRank.rankLevel}
//                             size={badgeSize}
//                           />
//                           <span className={dpTextClass}>
//                             {user.userRank.roomCreateCount} DP
//                           </span>
//                         </div>
//                       </div>

//                       {/* 랭크 레벨 배지 */}
//                       <span className={rankLevelBadgeClass}>
//                         {user.userRank.rankLevel}
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* 빈 상태 */}
//         {leaderboard.length === 0 && (
//           <div className="text-center py-16">
//             <Trophy size={64} color="#D1D5DB" className="mx-auto mb-4" />
//             <p className="text-xl text-gray-500">
//               아직 리더보드 데이터가 없습니다
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LeaderboardPage;

import {useEffect, useState, useRef, type TouchEvent} from "react";
import {
  Trophy,
  Crown,
  Medal,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {Capacitor} from "@capacitor/core";
import {useNavigate} from "react-router-dom";
import {getUserLeaderboard, type LeaderboardUser} from "../api/userService";
import RankBadge from "../components/common/RankBadge";
import {useUiTranslate} from "../hooks/useUiTranslate";

// 기존 로직 그대로 유지 (스타일/레이아웃 용)
const isNativeApp = Capacitor.isNativePlatform() || window.innerWidth <= 768;
const isRealNativeApp = Capacitor.isNativePlatform();

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  // 앱에서 TOP3 가로 스와이프용
  const [activeTopIndex, setActiveTopIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  // 뒤로가기 스와이프용 ref & 파라미터
  const navigate = useNavigate();
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isTrackingRef = useRef(false);

  const EDGE_WIDTH = 24;          // 왼쪽 엣지 범위 (px)
  const MIN_DISTANCE = 80;        // 최소 스와이프 거리
  const MAX_VERTICAL_DRIFT = 50;  // 수직 흔들림 허용

  const {t} = useUiTranslate();

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!isRealNativeApp) return;

    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;

    // 왼쪽 엣지에서 시작했을 때만 후보
    isTrackingRef.current = touch.clientX <= EDGE_WIDTH;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isRealNativeApp || !isTrackingRef.current) return;

    const touch = e.touches[0];
    const vertical = Math.abs(touch.clientY - startYRef.current);

    // 위아래로 너무 많이 움직이면 취소
    if (vertical > MAX_VERTICAL_DRIFT) {
      isTrackingRef.current = false;
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!isRealNativeApp || !isTrackingRef.current) return;

    const touch = e.changedTouches[0];
    const diffX = touch.clientX - startXRef.current;

    if (diffX > MIN_DISTANCE) {
      navigate(-1);
    }

    isTrackingRef.current = false;
  };

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const response = await getUserLeaderboard(0, 50);
        setLeaderboard(response.data || []);
      } catch (error) {
        console.error("리더보드 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">
            {t("leaderboard.loading", "로딩 중...")}
          </p>
        </div>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // 순위별 색상 및 아이콘
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          gradient: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
          icon: <Crown size={32} color="#FFD700" />,
          shadow: "0 8px 32px rgba(255, 215, 0, 0.4)",
          scale: 1.1,
        };
      case 2:
        return {
          gradient: "linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)",
          icon: <Medal size={28} color="#C0C0C0" />,
          shadow: "0 6px 24px rgba(192, 192, 192, 0.4)",
          scale: 1.05,
        };
      case 3:
        return {
          gradient: "linear-gradient(135deg, #CD7F32 0%, #B87333 100%)",
          icon: <Trophy size={28} color="#CD7F32" />,
          shadow: "0 6px 24px rgba(205, 127, 50, 0.4)",
          scale: 1.05,
        };
      default:
        return {
          gradient: "linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)",
          icon: <TrendingUp size={20} color="#9333EA" />,
          shadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          scale: 1,
        };
    }
  };

  // 앱에서 TOP3 한 명씩 카드로 보여주는 렌더러
  const renderMobileTopCard = (user: LeaderboardUser, rank: number) => {
    const style = getRankStyle(rank);

    return (
      <div className="w-full flex-shrink-0 px-6 flex items-center justify-center">
        <div
          className="w-full max-w-xs rounded-3xl py-8 px-4 flex flex-col items-center"
          style={{
            background: style.gradient,
            boxShadow: style.shadow,
          }}
        >
          <div className="relative mb-4">
            <img
              src={user.profileImgUrl || "/default_image.png"}
              alt={user.nickname}
              className="w-24 h-24 rounded-full border-4 border-white object-cover"
            />
            <div className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-md">
              {style.icon}
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-white mb-1 text-center truncate w-full">
            {user.nickname}
          </h3>
          <span className="inline-block bg-white/95 text-gray-800 font-bold text-sm px-4 py-1 rounded-full mb-3">
            {rank === 1 ? "👑 1위" : `${rank}위`}
          </span>
          <div className="flex items-center gap-2">
            <RankBadge rankLevel={user.userRank.rankLevel} size={24} />
            <span className="text-sm text-white font-semibold">
              {user.userRank.roomCreateCount} DP
            </span>
          </div>
        </div>
      </div>
    );
  };

  // 앱에서 스와이프 시 현재 인덱스 업데이트
  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveTopIndex(index);
  };

  const scrollToIndex = (index: number) => {
    if (!sliderRef.current) return;
    const clamped = Math.min(Math.max(index, 0), top3.length - 1);
    const el = sliderRef.current;
    el.scrollTo({
      left: clamped * el.clientWidth,
      behavior: "smooth",
    });
    setActiveTopIndex(clamped);
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      // 여기서 스와이프 이벤트 처리 (앱에서만 로직 동작)
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      // 앱에서만 위/아래 safe-area + 여유 padding
      style={
        isNativeApp
          ? {
              paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
            }
          : undefined
      }
    >
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Trophy size={40} color="#9333EA" />
            <h1 className="text-5xl font-extrabold text-gray-900">
              {t("leaderboard.title", "Ranking")}
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            {t("leaderboard.subtitle", "자신의 덕력을 증명하라 👑")}
          </p>
        </div>

        {/* TOP 3 */}
        {top3.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-6">
              🏆 {t("leaderboard.section.top3", "TOP 3")}
            </h2>

            {/* 앱: 가로 스와이프 슬라이더 */}
            {isNativeApp ? (
              <div className="relative">
                <div
                  ref={sliderRef}
                  className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-4"
                  style={{scrollbarWidth: "none"}}
                  onScroll={handleSliderScroll}
                >
                  {top3.map((user, idx) => (
                    <div
                      key={user.userId}
                      className="snap-center w-full flex-shrink-0"
                    >
                      {renderMobileTopCard(user, idx + 1)}
                    </div>
                  ))}
                </div>

                {/* 좌우 버튼 */}
                <div className="flex items-center justify-center gap-10 mt-4">
                  <button
                    type="button"
                    onClick={() => scrollToIndex(activeTopIndex - 1)}
                    disabled={activeTopIndex === 0}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border border-gray-300 bg-white shadow-sm ${
                      activeTopIndex === 0
                        ? "opacity-40 cursor-default"
                        : "active:scale-95"
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>

                  <div className="text-sm font-semibold text-gray-700">
                    {activeTopIndex + 1} / {top3.length}
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollToIndex(activeTopIndex + 1)}
                    disabled={activeTopIndex === top3.length - 1}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border border-gray-300 bg-white shadow-sm ${
                      activeTopIndex === top3.length - 1
                        ? "opacity-40 cursor-default"
                        : "active:scale-95"
                    }`}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </div>

                <div className="flex justify-center gap-2 mt-2">
                  {top3.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        idx === activeTopIndex ? "bg-purple-600" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* 웹: 시상대 스타일 그대로 */
              <div className="flex justify-center items-end gap-6 flex-wrap">
                {/* 2위 */}
                {top3[1] && (
                  <div
                    className="w-60 rounded-2xl transition-all duration-300 hover:scale-110"
                    style={{
                      background: getRankStyle(2).gradient,
                      boxShadow: getRankStyle(2).shadow,
                      transform: `scale(${getRankStyle(2).scale})`,
                    }}
                  >
                    <div className="text-center py-6">
                      <div className="relative inline-block mb-4">
                        <img
                          src={top3[1].profileImgUrl || "/default_image.png"}
                          alt={top3[1].nickname}
                          className="w-20 h-20 rounded-full border-4 border-white mx-auto object-cover"
                        />
                        <div className="absolute -top-2 -right-2 bg-white rounded-full p-1">
                          {getRankStyle(2).icon}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {top3[1].nickname}
                      </h3>
                      <span className="inline-block bg-white/90 text-gray-600 font-bold text-sm px-3 py-1 rounded-full mb-2">
                        2위
                      </span>
                      <div className="flex justify-center items-center gap-2">
                        <RankBadge
                          rankLevel={top3[1].userRank.rankLevel}
                          size={24}
                        />
                        <span className="text-sm text-white font-semibold">
                          {top3[1].userRank.roomCreateCount} DP
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1위 */}
                {top3[0] && (
                  <div
                    className="w-64 rounded-2xl transition-all duration-300 hover:scale-115"
                    style={{
                      background: getRankStyle(1).gradient,
                      boxShadow: getRankStyle(1).shadow,
                      transform: `scale(${getRankStyle(1).scale})`,
                    }}
                  >
                    <div className="text-center py-8">
                      <div className="relative inline-block mb-4">
                        <img
                          src={top3[0].profileImgUrl || "/default_image.png"}
                          alt={top3[0].nickname}
                          className="w-24 h-24 rounded-full border-4 border-white mx-auto object-cover"
                        />
                        <div className="absolute -top-3 -right-3 bg-white rounded-full p-2">
                          {getRankStyle(1).icon}
                        </div>
                      </div>
                      <h3 className="text-2xl font-extrabold text-white mb-1">
                        {top3[0].nickname}
                      </h3>
                      <span className="inline-block bg-white/95 text-yellow-500 font-extrabold text-base px-4 py-1 rounded-full mb-3">
                        👑 1위
                      </span>
                      <div className="flex justify-center items-center gap-2">
                        <RankBadge
                          rankLevel={top3[0].userRank.rankLevel}
                          size={28}
                        />
                        <span className="text-base text-white font-bold">
                          {top3[0].userRank.roomCreateCount} DP
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3위 */}
                {top3[2] && (
                  <div
                    className="w-60 rounded-2xl transition-all duration-300 hover:scale-110"
                    style={{
                      background: getRankStyle(3).gradient,
                      boxShadow: getRankStyle(3).shadow,
                      transform: `scale(${getRankStyle(3).scale})`,
                    }}
                  >
                    <div className="text-center py-6">
                      <div className="relative inline-block mb-4">
                        <img
                          src={top3[2].profileImgUrl || "/default_image.png"}
                          alt={top3[2].nickname}
                          className="w-20 h-20 rounded-full border-4 border-white mx-auto object-cover"
                        />
                        <div className="absolute -top-2 -right-2 bg-white rounded-full p-1">
                          {getRankStyle(3).icon}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {top3[2].nickname}
                      </h3>
                      <span className="inline-block bg-white/90 text-gray-600 font-bold text-sm px-3 py-1 rounded-full mb-2">
                        3위
                      </span>
                      <div className="flex justify-center items-center gap-2">
                        <RankBadge
                          rankLevel={top3[2].userRank.rankLevel}
                          size={24}
                        />
                        <span className="text-sm text-white font-semibold">
                          {top3[2].userRank.roomCreateCount} DP
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4-50위 리스트 */}
        {rest.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6">
              📊 {t("leaderboard.section.rest", "4위 ~ 50위")}
            </h2>
            <div className="flex flex-col gap-4">
              {rest.map((user, index) => {
                const rank = index + 4;

                // 앱/웹에 따라 사이즈/폰트/간격 다르게
                const itemWrapperClass = `bg-white rounded-xl shadow-sm transition-all duration-300 ${
                  isNativeApp ? "" : "hover:shadow-lg hover:-translate-y-1"
                }`;
                const itemInnerClass = isNativeApp
                  ? "p-3 flex items-center gap-3"
                  : "p-4 flex items-center gap-6";
                const rankCircleClass = isNativeApp
                  ? "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  : "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0";
                const profileImgClass = isNativeApp
                  ? "w-12 h-12 rounded-full border-2 border-gray-100 object-cover flex-shrink-0"
                  : "w-14 h-14 rounded-full border-3 border-gray-100 object-cover flex-shrink-0";
                const nicknameClass = isNativeApp
                  ? "text-sm font-semibold mb-0.5 truncate"
                  : "text-xl font-bold mb-1";
                const dpTextClass = isNativeApp
                  ? "text-xs text-gray-600"
                  : "text-sm text-gray-600";
                const rankLevelBadgeClass = isNativeApp
                  ? "bg-purple-100 text-purple-600 font-bold text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  : "bg-purple-100 text-purple-600 font-bold text-sm px-3 py-1 rounded-full flex-shrink-0";
                const badgeSize = isNativeApp ? 18 : 20;

                return (
                  <div key={user.userId} className={itemWrapperClass}>
                    <div className={itemInnerClass}>
                      {/* 순위 */}
                      <div
                        className={rankCircleClass}
                        style={{
                          background:
                            "linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)",
                        }}
                      >
                        <span
                          className={
                            isNativeApp
                              ? "text-base font-extrabold text-white"
                              : "text-xl font-extrabold text-white"
                          }
                        >
                          {rank}
                        </span>
                      </div>

                      {/* 프로필 */}
                      <img
                        src={user.profileImgUrl || "/default_image.png"}
                        alt={user.nickname}
                        className={profileImgClass}
                      />

                      {/* 정보 */}
                      <div className="flex-1 min-w-0">
                        <h3 className={nicknameClass}>{user.nickname}</h3>
                        <div className="flex items-center gap-1">
                          <RankBadge
                            rankLevel={user.userRank.rankLevel}
                            size={badgeSize}
                          />
                          <span className={dpTextClass}>
                            {user.userRank.roomCreateCount} DP
                          </span>
                        </div>
                      </div>

                      {/* 랭크 레벨 배지 */}
                      <span className={rankLevelBadgeClass}>
                        {user.userRank.rankLevel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 빈 상태 */}
        {leaderboard.length === 0 && (
          <div className="text-center py-16">
            <Trophy size={64} color="#D1D5DB" className="mx-auto mb-4" />
            <p className="text-xl text-gray-500">
              {t(
                "leaderboard.empty",
                "아직 리더보드 데이터가 없습니다",
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;

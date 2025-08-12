// import VideoCard from "../components/domain/video/VideoCard";
// import VideoCardSkeleton from "../components/domain/video/VideoCardSkeleton";
// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { useTrendingRooms } from "../hooks/useTrendingRooms";
// import { Tv } from "lucide-react";
// import type { room } from "../types/Room";

// const PAGE_SIZE = 24;

// const RoomListPage = () => {
//   const [page, setPage] = useState(1);
//   const [rooms, setRooms] = useState<room[]>([]);
//   const [hasMore, setHasMore] = useState(true);
//   const [totalCount, setTotalCount] = useState(0);

//   const observerRef = useRef<HTMLDivElement | null>(null);
//   const navigate = useNavigate();

//   const {
//     data: pageData,
//     isLoading,
//     error,
//   } = useTrendingRooms(page, PAGE_SIZE);

//   useEffect(() => {
//     // 로딩이 끝나고 새로운 데이터가 있을 때만 실행
//     if (pageData?.list) {
//       setRooms((prevRooms) => [...prevRooms, ...pageData.list]);
//       setHasMore(pageData.list.length === PAGE_SIZE);
//       if (pageData.totalCount) {
//         setTotalCount(pageData.totalCount);
//       }
//     }
//   }, [pageData]);

//   // 무한 스크롤 처리
//   useEffect(() => {
//     if (isLoading || !hasMore) return;

//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setPage((prevPage) => prevPage + 1);
//         }
//       },
//       { threshold: 0.5 }
//     );

//     const currentObserverRef = observerRef.current;
//     if (currentObserverRef) {
//       observer.observe(currentObserverRef);
//     }

//     return () => {
//       if (currentObserverRef) {
//         observer.unobserve(currentObserverRef);
//       }
//     };
//   }, [isLoading, hasMore]);

//   const handleCardClick = (artistId: number, nameEn: string) => {
//     navigate(`/artist/${nameEn}`, { state: { artistId } });
//   };

//   return (
//     <div className="px-4 md:px-10 py-8">
//       {/* 제목 영역 */}
//       <div className="text-center py-8 mb-5">
//         <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
//           라이브 방송
//         </h1>
//         <p className="text-lg text-gray-500">
//           다양한 라이브 방송들을 만나보세요.
//         </p>
//       </div>

//       {/* 라이브 방 수 */}
//       <div className="w-full max-w-md mx-auto mb-8">
//         <p className="text-sm text-center mt-2 text-gray-600">
//           총 {totalCount}명의 아티스트
//         </p>
//       </div>

//       {/* 방 목록 */}
//       <section>
//         <div className="flex flex-wrap justify-center gap-8 flex-grow">
//           {isLoading && rooms.length === 0 ? (
//             Array.from({ length: 8 }).map((_, i) => (
//               <VideoCardSkeleton key={i} />
//             ))
//           ) : error ? (
//             <p className="w-full text-center text-red-500 py-20">{error}</p>
//           ) : rooms.length > 0 ? (
//             rooms.map((room) => (
//               // 4. VideoCard에 onClick 이벤트를 연결합니다.
//               <VideoCard
//                 key={room.roomId}
//                 {...room}
//                 onClick={() =>
//                   handleCardClick(room.artistId, room.artistNameEn)
//                 }
//               />
//             ))
//           ) : (
//             <div className="w-full flex flex-col items-center justify-center text-center text-gray-500 py-20 bg-gray-50 rounded-2xl">
//               <Tv size={48} className="text-gray-300 mb-4" />
//               <p className="font-semibold text-gray-600">
//                 진행 중인 라이브 방송이 없습니다.
//               </p>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* 감지용 ref */}
//       <div ref={observerRef} className="h-10 mt-10" />

//       {/* 1. 로딩 스피너: 로딩 중일 때만 표시됩니다. */}
//       {loading && (
//         <div className="flex justify-center items-center h-24">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
//         </div>
//       )}

//       {/* 2. 감지용 ref: 로딩 중이 아니고, 더 불러올 데이터가 있을 때만 렌더링됩니다. */}
//       {!loading && hasMore && <div ref={observerRef} className="h-10" />}
//     </div>
//   );
// };

// export default RoomListPage;

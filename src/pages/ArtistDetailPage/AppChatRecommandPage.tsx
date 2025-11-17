// import { useLocation, useNavigate } from "react-router-dom";
// import { ChevronLeft } from "lucide-react";
// import RightSidebar from "./RightSidebar";

// const AppChatRecommandPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const artistId =
//     (location.state as { artistId?: number } | null)?.artistId ?? null;

//   if (!artistId) {
//     return (
//       <div className="w-full min-h-screen flex items-center justify-center text-sm text-gray-500">
//         아티스트 정보를 찾을 수 없습니다.
//       </div>
//     );
//   }

//   return (
//     <div className="w-full min-h-screen bg-[#F8F7FF] flex flex-col">
//       {/* 상단 헤더 */}
//       <header className="flex items-center gap-2 px-4 py-3 bg-white shadow-sm">
//         <button
//           onClick={() => navigate(-1)}
//           className="p-1 -ml-1 rounded-full hover:bg-gray-100 active:scale-95"
//         >
//           <ChevronLeft size={20} />
//         </button>
//         <h1 className="text-base font-semibold">팬톡</h1>
//       </header>

//       {/* 내용: RightSidebar 전체 화면 버전 */}
//       <main className="flex-1 px-4 py-4">
//         <div className="h-full">
//           <RightSidebar artistId={artistId} />
//         </div>
//       </main>
//     </div>
//   );
// };

// export default AppChatRecommandPage;

// src/pages/ArtistDetailPage/AppChatRecommandPage.tsx

import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import RightSidebar from "./RightSidebar";

const AppChatRecommandPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const artistId =
    (location.state as { artistId?: number } | null)?.artistId ?? null;

  if (!artistId) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-sm text-gray-500">
        아티스트 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8F7FF] flex flex-col">
      {/* 상단 헤더 */}
      <header className="flex items-center gap-2 px-4 py-3 bg-white shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 rounded-full hover:bg-gray-100 active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-base font-semibold">팬톡</h1>
      </header>

      {/* 내용 – 가운데 카드 하나, 웹 RightSidebar 그대로 사용 */}
      <main className="flex-1 flex justify-center items-start">
        <div className="w-full max-w-md px-4 pt-4 pb-6">
          {/* RightSidebar 내부 UI는 웹이랑 동일하게 유지 */}
          <div className="h-[calc(100vh-4rem-3.5rem)]">
            {/* 4rem: 상단 헤더, 3.5rem: 상/하 padding 여유 */}
            <RightSidebar artistId={artistId} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppChatRecommandPage;

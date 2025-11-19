// import {type User} from "../../types";
// import {useNavigate} from "react-router-dom";
// import {Menu} from "@headlessui/react";
// import {ChevronDown, Trophy} from "lucide-react";
// import NicknameWithRank from "./NicknameWithRank";

// type HeaderProps = {
//   user: User | null;
//   onLogin: () => void;
//   onSignup: () => void;
//   onLogout: () => void;
// };

// /* name : Header
// summary : User 객체의 존재 여부에 따라 버튼이 구성요소가 달라짐 (디자인만 강화) */
// const Header = ({user, onLogin, onSignup, onLogout}: HeaderProps) => {
//   const navigate = useNavigate();

//   return (
//     <header className="sticky top-0 z-50 w-full">
//       {/* 글래스 배경 바 */}
//       <div className="bg-white/60 backdrop-blur-md border-b border-white/60 shadow-[0_10px_30px_rgba(0,0,0,.04)]">
//         <nav className="max-w-7xl h-16 mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
//           {/* 로고 */}
//           <div className="flex items-center gap-3">
//             <button
//               className="group flex items-center gap-2 outline-none"
//               onClick={() => navigate("/")}
//               aria-label="DuckOn 홈으로 이동"
//             >
//               <img className="h-7 w-7" src="/duck.svg" alt="" />
//               <span className="font-extrabold tracking-tight text-lg">
//                 DuckOn
//               </span>
//               {/* 로고 옆 보조 포인트 */}
//               <span className="ml-1 h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 opacity-70 group-hover:opacity-100 transition" />
//             </button>
            
//             {/* MemeDuck 링크 버튼 */}
//             <a
//               href="https://memeduck.site"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="
//                 px-3 py-1.5 rounded-lg text-sm font-semibold
//                 text-purple-600 bg-purple-50
//                 hover:bg-purple-100 hover:text-purple-700
//                 transition-all duration-200
//                 border border-purple-200
//               "
//             >
//               MemeDuck
//             </a>
//           </div>

//           {/* 우측 영역 */}
//           <div className="ml-auto flex items-center gap-3 sm:gap-4">
//             {/* 랭킹 버튼 */}
//             <button
//               onClick={() => navigate("/leaderboard")}
//               className="
//                 inline-flex items-center justify-center gap-1.5
//                 px-3 py-2 rounded-lg
//                 text-sm font-semibold text-gray-700
//                 bg-gradient-to-r from-purple-100 to-pink-100
//                 hover:from-purple-200 hover:to-pink-200
//                 transition-all duration-300
//                 hover:shadow-[0_8px_20px_rgba(168,85,247,.15)]
//                 hover:-translate-y-0.5
//               "
//             >
//               <Trophy size={16} className="text-purple-600" />
//               <span className="hidden sm:inline text-purple-600">랭킹</span>
//             </button>

//             {user ? (
//               <Menu as="div" className="relative">
//                 <Menu.Button className="group flex items-center gap-2 rounded-full pl-1 pr-2 py-1 transition-all hover:bg-black/5 focus-visible:outline-none">
//                   <img
//                     src={user.imgUrl || "/default_image.png"}
//                     alt="프로필 이미지"
//                     className="w-8 h-8 rounded-full object-cover ring-1 ring-black/5"
//                   />
//                   <div className="flex items-center gap-1.5 max-w-[130px]">
//                     <NicknameWithRank
//                       nickname={
//                         user.nickname.length > 10
//                           ? `${user.nickname.slice(0, 10)}...`
//                           : user.nickname
//                       }
//                       rankLevel={user.userRank?.rankLevel ?? "GREEN"}
//                       badgeSize={18}
//                     />
//                   </div>
//                   <ChevronDown className="w-4 h-4 text-gray-500 transition-transform group-data-[headlessui-state=open]:rotate-180" />
//                 </Menu.Button>

//                 <Menu.Items
//                   className="
//                     absolute right-0 mt-2 w-48 origin-top-right
//                     rounded-xl bg-white/85 backdrop-blur-md
//                     shadow-[0_20px_60px_rgba(0,0,0,.12)]
//                     border border-white/60
//                     focus:outline-none overflow-hidden
//                   "
//                 >
//                   <div className="py-1">
//                     <Menu.Item>
//                       {({active}) => (
//                         <button
//                           onClick={() => navigate("/mypage")}
//                           className={`${active ? "bg-black/5" : ""
//                             } w-full px-4 py-2 text-sm text-gray-800 text-left`}
//                         >
//                           마이페이지
//                         </button>
//                       )}
//                     </Menu.Item>
//                     <Menu.Item>
//                       {({active}) => (
//                         <button
//                           onClick={onLogout}
//                           className={`${active ? "bg-black/5" : ""
//                             } w-full px-4 py-2 text-sm text-gray-800 text-left`}
//                         >
//                           로그아웃
//                         </button>
//                       )}
//                     </Menu.Item>
//                   </div>
//                 </Menu.Items>
//               </Menu>
//             ) : (
//               <>
//                 {/* 로그인: 그라데이션 언더라인 */}
//                 <button
//                   onClick={onLogin}
//                   className="relative text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
//                 >
//                   로그인
//                   <span
//                     className="
//                       absolute -bottom-1 left-0 h-[2px] w-0
//                       bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400
//                       transition-all duration-300
//                       hover:w-full
//                     "
//                   />
//                 </button>

//                 {/* 회원가입: 그라데이션 + 살짝 뜨는 효과 */}
//                 <button
//                   onClick={onSignup}
//                   className="
//                     inline-flex items-center justify-center
//                     px-4 py-2 rounded-full text-sm font-bold text-white
//                     bg-gradient-to-r from-fuchsia-500 to-rose-500
//                     shadow-[0_10px_30px_rgba(236,72,153,.25)]
//                     hover:shadow-[0_16px_40px_rgba(236,72,153,.35)]
//                     hover:-translate-y-0.5 active:translate-y-0
//                     transition-all
//                   "
//                 >
//                   회원가입
//                 </button>
//               </>
//             )}
//           </div>
//         </nav>
//       </div>
//     </header>
//   );
// };

// export default Header;

// import { useState } from "react";
// import { type User } from "../../types";
// import { useNavigate } from "react-router-dom";
// import { Menu as HeadlessMenu } from "@headlessui/react";
// import {
//   ChevronDown,
//   Trophy,
//   Menu as MenuIcon,
//   Heart,
//   ExternalLink,
//   LogIn,
//   UserPlus,
//   LogOut,
// } from "lucide-react";
// import NicknameWithRank from "./NicknameWithRank";
// import { isNativeApp } from "../../utils/platform";

// type HeaderProps = {
//   user: User | null;
//   onLogin: () => void;
//   onSignup: () => void;
//   onLogout: () => void;
// };

// /* name : Header
// summary : 앱일 때는 심플 흰색 헤더 + 햄버거, 웹일 때는 기존 덕온 헤더 유지 */
// const Header = ({ user, onLogin, onSignup, onLogout }: HeaderProps) => {
//   const navigate = useNavigate();
//   const [open, setOpen] = useState(false);

//   // 캡시터 앱 여부
//   const isApp = isNativeApp;

//   /* ─────────────────────────────────────
//    *  📱 앱(모바일) 전용 헤더
//    * ──────────────────────────────────── */
//   if (isApp) {
//     const handleGoHome = () => {
//       navigate("/");
//       setOpen(false);
//     };

//     const handleGoRanking = () => {
//       navigate("/leaderboard");
//       setOpen(false);
//     };

//     const handleGoFollowedArtists = () => {
//       // 팔로우/아티스트 목록 보는 페이지로 이동 (현재 쓰는 경로에 맞춰 사용)
//       navigate("/followed-artists");
//       setOpen(false);
//     };

//     const handleLogin = () => {
//       setOpen(false);
//       onLogin();
//     };

//     const handleSignup = () => {
//       setOpen(false);
//       onSignup();
//     };

//     const handleLogout = () => {
//       setOpen(false);
//       onLogout();
//     };

//     return (
//       <>
//         {/* 상단 흰색 바 헤더 (덕온 스타일) */}
//         <header
//           className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,.04)]"
//           style={{ paddingTop: "env(safe-area-inset-top)" }}
//         >
//           <nav className="max-w-7xl h-14 mx-auto px-4 flex items-center justify-between">
//             {/* 로고 */}
//             <button
//               className="group flex items-center gap-2 outline-none active:scale-95 transition"
//               onClick={handleGoHome}
//               aria-label="DuckOn 홈으로 이동"
//             >
//               <img className="h-7 w-7" src="/duck.svg" alt="DuckOn 로고" />
//               <span className="font-extrabold tracking-tight text-lg">
//                 DuckOn
//               </span>
//               <span className="ml-1 h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 opacity-70 group-hover:opacity-100 transition" />
//             </button>

//             {/* 햄버거 버튼 */}
//             <button
//               type="button"
//               onClick={() => setOpen(true)}
//               className="inline-flex items-center justify-center rounded-full border border-purple-100 bg-white px-3 py-2 shadow-[0_4px_12px_rgba(168,85,247,.18)] hover:bg-purple-50 active:scale-95 transition"
//               aria-label="메뉴 열기"
//             >
//               <MenuIcon className="w-5 h-5 text-purple-600" />
//             </button>
//           </nav>
//         </header>

//         {/* 오버레이 */}
//         {open && (
//           <div
//             className="fixed inset-0 z-40 bg-black/30"
//             onClick={() => setOpen(false)}
//           />
//         )}

//         {/* 오른쪽에서 나오는 흰색 드로어 메뉴 */}
//         <aside
//           className={`fixed top-0 right-0 z-50 h-full w-72 max-w-full bg-white text-gray-900 shadow-[0_0_30px_rgba(0,0,0,0.18)] transform transition-transform duration-200 ease-out ${
//             open ? "translate-x-0" : "translate-x-full"
//           }`}
//           style={{ paddingTop: "env(safe-area-inset-top)" }}
//         >
//           {/* 상단 유저/타이틀 영역 */}
//           <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
//             <div className="flex flex-col">
//               <span className="text-xs text-gray-400">DuckOn</span>
//               {user ? (
//                 <div className="flex items-center gap-2 mt-0.5">
//                   <img
//                     src={user.imgUrl || "/default_image.png"}
//                     alt="프로필 이미지"
//                     className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200"
//                   />
//                   <NicknameWithRank
//                     nickname={
//                       user.nickname.length > 10
//                         ? `${user.nickname.slice(0, 10)}...`
//                         : user.nickname
//                     }
//                     rankLevel={user.userRank?.rankLevel ?? "GREEN"}
//                     badgeSize={18}
//                   />
//                 </div>
//               ) : (
//                 <span className="text-sm font-semibold">
//                   덕온에 오신 것을 환영해요 🐤
//                 </span>
//               )}
//             </div>

//             <button
//               onClick={() => setOpen(false)}
//               className="text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
//             >
//               닫기
//             </button>
//           </div>

//           {/* 로그인/회원가입 또는 로그아웃 버튼 */}
//           <div className="px-4 py-3 border-b border-gray-100">
//             {user ? (
//               <button
//                 onClick={handleLogout}
//                 className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white px-3 py-2 text-sm font-semibold hover:bg-black transition"
//               >
//                 <LogOut className="w-4 h-4" />
//                 로그아웃
//               </button>
//             ) : (
//               <div className="flex gap-2">
//                 <button
//                   onClick={handleLogin}
//                   className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-gray-200 text-gray-900 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
//                 >
//                   <LogIn className="w-4 h-4" />
//                   로그인
//                 </button>
//                 <button
//                   onClick={handleSignup}
//                   className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white px-3 py-2 text-sm font-semibold shadow-[0_8px_20px_rgba(236,72,153,.35)] hover:brightness-105"
//                 >
//                   <UserPlus className="w-4 h-4" />
//                   회원가입
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* 메뉴 리스트 */}
//           <nav className="px-2 py-3 space-y-1 text-sm">
//             {/* MemeDuck 버튼 (웹과 같은 네이밍/느낌) */}
//             <a
//               href="https://memeduck.site"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-purple-50 active:bg-purple-100/70 border border-purple-100"
//             >
//               <div className="flex items-center gap-2">
//                 <span
//                   className="
//                     px-3 py-1.5 rounded-lg text-xs font-semibold
//                     text-purple-600 bg-purple-50
//                   "
//                 >
//                   MemeDuck
//                 </span>
//                 <span className="text-[11px] text-gray-500">
//                   밈/짤 보러가기
//                 </span>
//               </div>
//               <ExternalLink className="w-4 h-4 text-gray-400" />
//             </a>

//             {/* 랭킹 */}
//             <button
//               onClick={handleGoRanking}
//               className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 active:bg-gray-100"
//             >
//               <Trophy className="w-5 h-5 text-purple-500" />
//               <div className="flex flex-col items-start">
//                 <span className="font-medium">랭킹</span>
//                 <span className="text-[11px] text-gray-500">
//                   팬 랭킹 / 활동 순위 보기
//                 </span>
//               </div>
//             </button>

//             {/* 팔로우한 아티스트 → 아티스트 리스트/팔로우 페이지 */}
//             <button
//               onClick={handleGoFollowedArtists}
//               className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 active:bg-gray-100"
//             >
//               <Heart className="w-5 h-5 text-pink-500" />
//               <div className="flex flex-col items-start">
//                 <span className="font-medium">팔로우한 아티스트</span>
//                 <span className="text-[11px] text-gray-500">
//                   팔로우 관리 및 아티스트 찾기
//                 </span>
//               </div>
//             </button>

//             {/* (선택) 마이페이지 */}
//             {user && (
//               <button
//                 onClick={() => {
//                   navigate("/mypage");
//                   setOpen(false);
//                 }}
//                 className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 active:bg-gray-100"
//               >
//                 <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs">
//                   MY
//                 </div>
//                 <div className="flex flex-col items-start">
//                   <span className="font-medium">마이페이지</span>
//                   <span className="text-[11px] text-gray-500">
//                     내 정보와 활동 보기
//                   </span>
//                 </div>
//               </button>
//             )}
//           </nav>

//           {/* 하단 작은 안내 */}
//           <div className="mt-auto px-4 pb-5 pt-2 text-[10px] text-gray-400 border-t border-gray-100">
//             DuckOn · MemeDuck beta
//             <br />
//             오늘도 즐거운 덕질 되세요 🐥
//           </div>
//         </aside>
//       </>
//     );
//   }

//   /* ─────────────────────────────────────
//    *  💻 웹용 기존 덕온 헤더 (디자인 그대로)
//    * ──────────────────────────────────── */
//   return (
//     <header className="sticky top-0 z-50 w-full">
//       {/* 글래스 배경 바 */}
//       <div className="bg-white/60 backdrop-blur-md border-b border-white/60 shadow-[0_10px_30px_rgba(0,0,0,.04)]">
//         <nav className="max-w-7xl h-16 mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
//           {/* 로고 */}
//           <div className="flex items-center gap-3">
//             <button
//               className="group flex items-center gap-2 outline-none"
//               onClick={() => navigate("/")}
//               aria-label="DuckOn 홈으로 이동"
//             >
//               <img className="h-7 w-7" src="/duck.svg" alt="" />
//               <span className="font-extrabold tracking-tight text-lg">
//                 DuckOn
//               </span>
//               {/* 로고 옆 보조 포인트 */}
//               <span className="ml-1 h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 opacity-70 group-hover:opacity-100 transition" />
//             </button>

//             {/* MemeDuck 링크 버튼 (웹용 기존 그대로) */}
//             <a
//               href="https://memeduck.site"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="
//                 px-3 py-1.5 rounded-lg text-sm font-semibold
//                 text-purple-600 bg-purple-50
//                 hover:bg-purple-100 hover:text-purple-700
//                 transition-all duration-200
//                 border border-purple-200
//               "
//             >
//               MemeDuck
//             </a>
//           </div>

//           {/* 우측 영역 */}
//           <div className="ml-auto flex items-center gap-3 sm:gap-4">
//             {/* 랭킹 버튼 (웹용 그대로) */}
//             <button
//               onClick={() => navigate("/leaderboard")}
//               className="
//                 inline-flex items-center justify-center gap-1.5
//                 px-3 py-2 rounded-lg
//                 text-sm font-semibold text-gray-700
//                 bg-gradient-to-r from-purple-100 to-pink-100
//                 hover:from-purple-200 hover:to-pink-200
//                 transition-all duration-300
//                 hover:shadow-[0_8px_20px_rgba(168,85,247,.15)]
//                 hover:-translate-y-0.5
//               "
//             >
//               <Trophy size={16} className="text-purple-600" />
//               <span className="hidden sm:inline text-purple-600">랭킹</span>
//             </button>

//             {user ? (
//               <HeadlessMenu as="div" className="relative">
//                 <HeadlessMenu.Button className="group flex items-center gap-2 rounded-full pl-1 pr-2 py-1 transition-all hover:bg-black/5 focus-visible:outline-none">
//                   <img
//                     src={user.imgUrl || "/default_image.png"}
//                     alt="프로필 이미지"
//                     className="w-8 h-8 rounded-full object-cover ring-1 ring-black/5"
//                   />
//                   <div className="flex items-center gap-1.5 max-w-[130px]">
//                     <NicknameWithRank
//                       nickname={
//                         user.nickname.length > 10
//                           ? `${user.nickname.slice(0, 10)}...`
//                           : user.nickname
//                       }
//                       rankLevel={user.userRank?.rankLevel ?? "GREEN"}
//                       badgeSize={18}
//                     />
//                   </div>
//                   <ChevronDown className="w-4 h-4 text-gray-500 transition-transform group-data-[headlessui-state=open]:rotate-180" />
//                 </HeadlessMenu.Button>

//                 <HeadlessMenu.Items
//                   className="
//                     absolute right-0 mt-2 w-48 origin-top-right
//                     rounded-xl bg-white/85 backdrop-blur-md
//                     shadow-[0_20px_60px_rgba(0,0,0,.12)]
//                     border border-white/60
//                     focus:outline-none overflow-hidden
//                   "
//                 >
//                   <div className="py-1">
//                     <HeadlessMenu.Item>
//                       {({ active }) => (
//                         <button
//                           onClick={() => navigate("/mypage")}
//                           className={`${
//                             active ? "bg-black/5" : ""
//                           } w-full px-4 py-2 text-sm text-gray-800 text-left`}
//                         >
//                           마이페이지
//                         </button>
//                       )}
//                     </HeadlessMenu.Item>
//                     <HeadlessMenu.Item>
//                       {({ active }) => (
//                         <button
//                           onClick={onLogout}
//                           className={`${
//                             active ? "bg-black/5" : ""
//                           } w-full px-4 py-2 text-sm text-gray-800 text-left`}
//                         >
//                           로그아웃
//                         </button>
//                       )}
//                     </HeadlessMenu.Item>
//                   </div>
//                 </HeadlessMenu.Items>
//               </HeadlessMenu>
//             ) : (
//               <>
//                 {/* 로그인: 그라데이션 언더라인 */}
//                 <button
//                   onClick={onLogin}
//                   className="relative text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
//                 >
//                   로그인
//                   <span
//                     className="
//                       absolute -bottom-1 left-0 h-[2px] w-0
//                       bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400
//                       transition-all duration-300
//                       hover:w-full
//                     "
//                   />
//                 </button>

//                 {/* 회원가입: 그라데이션 + 살짝 뜨는 효과 */}
//                 <button
//                   onClick={onSignup}
//                   className="
//                     inline-flex items-center justify-center
//                     px-4 py-2 rounded-full text-sm font-bold text-white
//                     bg-gradient-to-r from-fuchsia-500 to-rose-500
//                     shadow-[0_10px_30px_rgba(236,72,153,.25)]
//                     hover:shadow-[0_16px_40px_rgba(236,72,153,.35)]
//                     hover:-translate-y-0.5 active:translate-y-0
//                     transition-all
//                   "
//                 >
//                   회원가입
//                 </button>
//               </>
//             )}
//           </div>
//         </nav>
//       </div>
//     </header>
//   );
// };

// export default Header;

import { useState } from "react";
import { type User } from "../../types";
import { useNavigate } from "react-router-dom";
import { Menu as HeadlessMenu } from "@headlessui/react";
import {
  ChevronDown,
  Trophy,
  Menu as MenuIcon,
  Heart,
  ExternalLink,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";
import NicknameWithRank from "./NicknameWithRank";
import { isNativeApp } from "../../utils/platform";
import { useUiTranslate } from "../../hooks/useUiTranslate";

type HeaderProps = {
  user: User | null;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
};

/* name : Header
summary : 앱일 때는 심플 흰색 헤더 + 햄버거, 웹일 때는 기존 덕온 헤더 유지 */
const Header = ({ user, onLogin, onSignup, onLogout }: HeaderProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // 캡시터 앱 여부
  const isApp = isNativeApp;
  const { t } = useUiTranslate();

  /* ─────────────────────────────────────
   *  📱 앱(모바일) 전용 헤더
   * ──────────────────────────────────── */
  if (isApp) {
    const handleGoHome = () => {
      navigate("/");
      setOpen(false);
    };

    const handleGoRanking = () => {
      navigate("/leaderboard");
      setOpen(false);
    };

    const handleGoFollowedArtists = () => {
      // 팔로우/아티스트 목록 보는 페이지로 이동 (현재 쓰는 경로에 맞춰 사용)
      navigate("/followed-artists");
      setOpen(false);
    };

    const handleLogin = () => {
      setOpen(false);
      onLogin();
    };

    const handleSignup = () => {
      setOpen(false);
      onSignup();
    };

    const handleLogout = () => {
      setOpen(false);
      onLogout();
    };

    return (
      <>
        {/* 상단 흰색 바 헤더 (덕온 스타일) */}
        <header
          className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,.04)]"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <nav className="max-w-7xl h-14 mx-auto px-4 flex items-center justify-between">
            {/* 로고 */}
            <button
              className="group flex items-center gap-2 outline-none active:scale-95 transition"
              onClick={handleGoHome}
              aria-label="DuckOn 홈으로 이동"
            >
              <img className="h-7 w-7" src="/duck.svg" alt="DuckOn 로고" />
              <span className="font-extrabold tracking-tight text-lg">
                DuckOn
              </span>
              <span className="ml-1 h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 opacity-70 group-hover:opacity-100 transition" />
            </button>

            {/* 햄버거 버튼 */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center justify-center rounded-full border border-purple-100 bg-white px-3 py-2 shadow-[0_4px_12px_rgba(168,85,247,.18)] hover:bg-purple-50 active:scale-95 transition"
              aria-label="메뉴 열기"
            >
              <MenuIcon className="w-5 h-5 text-purple-600" />
            </button>
          </nav>
        </header>

        {/* 오버레이 */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setOpen(false)}
          />
        )}

        {/* 오른쪽에서 나오는 흰색 드로어 메뉴 */}
        <aside
          className={`fixed top-0 right-0 z-50 h-full w-72 max-w-full bg-white text-gray-900 shadow-[0_0_30px_rgba(0,0,0,0.18)] transform transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          {/* 상단 유저/타이틀 영역 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">DuckOn</span>
              {user ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <img
                    src={user.imgUrl || "/default_image.png"}
                    alt="프로필 이미지"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200"
                  />
                  <NicknameWithRank
                    nickname={
                      user.nickname.length > 10
                        ? `${user.nickname.slice(0, 10)}...`
                        : user.nickname
                    }
                    rankLevel={user.userRank?.rankLevel ?? "GREEN"}
                    badgeSize={18}
                  />
                </div>
              ) : (
                <span className="text-sm font-semibold">
                  덕온에 오신 것을 환영해요 🐤
                </span>
              )}
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              닫기
            </button>
          </div>

          {/* 로그인/회원가입 또는 로그아웃 버튼 */}
          <div className="px-4 py-3 border-b border-gray-100">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white px-3 py-2 text-sm font-semibold hover:bg-black transition"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleLogin}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-gray-200 text-gray-900 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                >
                  <LogIn className="w-4 h-4" />
                  로그인
                </button>
                <button
                  onClick={handleSignup}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white px-3 py-2 text-sm font-semibold shadow-[0_8px_20px_rgba(236,72,153,.35)] hover:brightness-105"
                >
                  <UserPlus className="w-4 h-4" />
                  회원가입
                </button>
              </div>
            )}
          </div>

          {/* 메뉴 리스트 */}
          <nav className="px-2 py-3 space-y-1 text-sm">
            {/* MemeDuck 버튼 (웹과 같은 네이밍/느낌) */}
            <a
              href="https://memeduck.site"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-purple-50 active:bg-purple-100/70 border border-purple-100"
            >
              <div className="flex items-center gap-2">
                <span
                  className="
                    px-3 py-1.5 rounded-lg text-xs font-semibold
                    text-purple-600 bg-purple-50
                  "
                >
                  MemeDuck
                </span>
                <span className="text-[11px] text-gray-500">
                  밈/짤 보러가기
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>

            {/* 랭킹 */}
            <button
              onClick={handleGoRanking}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 active:bg-gray-100"
            >
              <Trophy className="w-5 h-5 text-purple-500" />
              <div className="flex flex-col items-start">
                <span className="font-medium">랭킹</span>
                <span className="text-[11px] text-gray-500">
                  팬 랭킹 / 활동 순위 보기
                </span>
              </div>
            </button>

            {/* 팔로우한 아티스트 → 아티스트 리스트/팔로우 페이지 */}
            <button
              onClick={handleGoFollowedArtists}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 active:bg-gray-100"
            >
              <Heart className="w-5 h-5 text-pink-500" />
              <div className="flex flex-col items-start">
                <span className="font-medium">팔로우한 아티스트</span>
                <span className="text-[11px] text-gray-500">
                  팔로우 관리 및 아티스트 찾기
                </span>
              </div>
            </button>

            {/* (선택) 마이페이지 */}
            {user && (
              <button
                onClick={() => {
                  navigate("/mypage");
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 active:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs">
                  MY
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">마이페이지</span>
                  <span className="text-[11px] text-gray-500">
                    내 정보와 활동 보기
                  </span>
                </div>
              </button>
            )}
          </nav>

          {/* 하단 작은 안내 */}
          <div className="mt-auto px-4 pb-5 pt-2 text-[10px] text-gray-400 border-t border-gray-100">
            DuckOn · MemeDuck beta
            <br />
            오늘도 즐거운 덕질 되세요 🐥
          </div>
        </aside>
      </>
    );
  }

  /* ─────────────────────────────────────
   *  💻 웹용 기존 덕온 헤더 (디자인 그대로, 텍스트만 i18n)
   * ──────────────────────────────────── */
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* 글래스 배경 바 */}
      <div className="bg-white/60 backdrop-blur-md border-b border-white/60 shadow-[0_10px_30px_rgba(0,0,0,.04)]">
        <nav className="max-w-7xl h-16 mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          {/* 로고 */}
          <div className="flex items-center gap-3">
            <button
              className="group flex items-center gap-2 outline-none"
              onClick={() => navigate("/")}
              aria-label={t(
                "header.web.homeAria",
                "DuckOn 홈으로 이동",
              )}
            >
              <img className="h-7 w-7" src="/duck.svg" alt="" />
              <span className="font-extrabold tracking-tight text-lg">
                DuckOn
              </span>
              {/* 로고 옆 보조 포인트 */}
              <span className="ml-1 h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 opacity-70 group-hover:opacity-100 transition" />
            </button>

            {/* MemeDuck 링크 버튼 (웹용 기존 그대로) */}
            <a
              href="https://memeduck.site"
              target="_blank"
              rel="noopener noreferrer"
              className="
                px-3 py-1.5 rounded-lg text-sm font-semibold
                text-purple-600 bg-purple-50
                hover:bg-purple-100 hover:text-purple-700
                transition-all duration-200
                border border-purple-200
              "
            >
              MemeDuck
            </a>
          </div>

          {/* 우측 영역 */}
          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            {/* 랭킹 버튼 (웹용 그대로) */}
            <button
              onClick={() => navigate("/leaderboard")}
              className="
                inline-flex items-center justify-center gap-1.5
                px-3 py-2 rounded-lg
                text-sm font-semibold text-gray-700
                bg-gradient-to-r from-purple-100 to-pink-100
                hover:from-purple-200 hover:to-pink-200
                transition-all duration-300
                hover:shadow-[0_8px_20px_rgba(168,85,247,.15)]
                hover:-translate-y-0.5
              "
            >
              <Trophy size={16} className="text-purple-600" />
              <span className="hidden sm:inline text-purple-600">
                {t("header.web.ranking", "랭킹")}
              </span>
            </button>

            {user ? (
              <HeadlessMenu as="div" className="relative">
                <HeadlessMenu.Button className="group flex items-center gap-2 rounded-full pl-1 pr-2 py-1 transition-all hover:bg-black/5 focus-visible:outline-none">
                  <img
                    src={user.imgUrl || "/default_image.png"}
                    alt="프로필 이미지"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-black/5"
                  />
                  <div className="flex items-center gap-1.5 max-w-[130px]">
                    <NicknameWithRank
                      nickname={
                        user.nickname.length > 10
                          ? `${user.nickname.slice(0, 10)}...`
                          : user.nickname
                      }
                      rankLevel={user.userRank?.rankLevel ?? "GREEN"}
                      badgeSize={18}
                    />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 transition-transform group-data-[headlessui-state=open]:rotate-180" />
                </HeadlessMenu.Button>

                <HeadlessMenu.Items
                  className="
                    absolute right-0 mt-2 w-48 origin-top-right
                    rounded-xl bg-white/85 backdrop-blur-md
                    shadow-[0_20px_60px_rgba(0,0,0,.12)]
                    border border-white/60
                    focus:outline-none overflow-hidden
                  "
                >
                  <div className="py-1">
                    <HeadlessMenu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate("/mypage")}
                          className={`${
                            active ? "bg-black/5" : ""
                          } w-full px-4 py-2 text-sm text-gray-800 text-left`}
                        >
                          {t("header.web.mypage", "마이페이지")}
                        </button>
                      )}
                    </HeadlessMenu.Item>
                    <HeadlessMenu.Item>
                      {({ active }) => (
                        <button
                          onClick={onLogout}
                          className={`${
                            active ? "bg-black/5" : ""
                          } w-full px-4 py-2 text-sm text-gray-800 text-left`}
                        >
                          {t("header.web.logout", "로그아웃")}
                        </button>
                      )}
                    </HeadlessMenu.Item>
                  </div>
                </HeadlessMenu.Items>
              </HeadlessMenu>
            ) : (
              <>
                {/* 로그인: 그라데이션 언더라인 */}
                <button
                  onClick={onLogin}
                  className="relative text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {t("header.web.login", "로그인")}
                  <span
                    className="
                      absolute -bottom-1 left-0 h-[2px] w-0
                      bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400
                      transition-all duration-300
                      hover:w-full
                    "
                  />
                </button>

                {/* 회원가입: 그라데이션 + 살짝 뜨는 효과 */}
                <button
                  onClick={onSignup}
                  className="
                    inline-flex items-center justify-center
                    px-4 py-2 rounded-full text-sm font-bold text-white
                    bg-gradient-to-r from-fuchsia-500 to-rose-500
                    shadow-[0_10px_30px_rgba(236,72,153,.25)]
                    hover:shadow-[0_16px_40px_rgba(236,72,153,.35)]
                    hover:-translate-y-0.5 active:translate-y-0
                    transition-all
                  "
                >
                  {t("header.web.signup", "회원가입")}
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

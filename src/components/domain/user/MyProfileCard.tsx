// import { type MyUser } from "../../../types/mypage";
// import { MoreVertical } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import RankProgress from "../../common/RankProgress";
// import TruncatedTitle from "../../common/TruncatedTitle";

// type MyProfileCardProps = {
//   user: MyUser;
//   onEditClick: () => void;
//   onFollowerClick?: () => void;
//   onFollowingClick?: () => void;
//   onDeleteClick: () => void;
//   onBlockListClick: () => void;
// };

// const MyProfileCard = ({
//   user,
//   onEditClick,
//   onFollowerClick,
//   onFollowingClick,
//   onDeleteClick,
//   onBlockListClick,
// }: MyProfileCardProps) => {
//   const [open, setOpen] = useState(false);
//   const menuRef = useRef<HTMLDivElement>(null);
//   const btnRef = useRef<HTMLButtonElement>(null);
//   const rankLevel = user.userRank?.rankLevel ?? "GREEN";

//   useEffect(() => {
//     if (!open) return;
//     const onDocClick = (e: MouseEvent) => {
//       const t = e.target as Node;
//       if (
//         menuRef.current &&
//         !menuRef.current.contains(t) &&
//         btnRef.current &&
//         !btnRef.current.contains(t)
//       ) {
//         setOpen(false);
//       }
//     };
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setOpen(false);
//     };
//     document.addEventListener("mousedown", onDocClick);
//     document.addEventListener("keydown", onKey);
//     return () => {
//       document.removeEventListener("mousedown", onDocClick);
//       document.removeEventListener("keydown", onKey);
//     };
//   }, [open]);

//   const handleDeleteClick = () => {
//     setOpen(false);
//     onDeleteClick();
//   };

//   const handleBlockListClick = () => {
//     setOpen(false);
//     onBlockListClick();
//   };

//   return (
//     <div className="bg-white rounded-xl px-4 sm:px-8 py-6 mb-10 w-full max-w-[880px] mx-auto shadow-sm">
//       {/* 헤더 */}
//       <div className="flex justify-between items-center mb-6 gap-3">
//         <h1 className="text-lg font-bold">프로필 정보</h1>
//         <div className="relative flex items-center gap-2">
//           <button
//             className="text-sm text-purple-600 font-medium hover:underline transition"
//             onClick={onEditClick}
//           >
//             프로필 수정
//           </button>

//           <button
//             ref={btnRef}
//             type="button"
//             aria-haspopup="menu"
//             aria-expanded={open}
//             aria-label="프로필 옵션 열기"
//             onClick={() => setOpen((v) => !v)}
//             className="p-1.5 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
//           >
//             <MoreVertical size={16} />
//           </button>
//           {open && (
//             <div
//               ref={menuRef}
//               role="menu"
//               aria-label="프로필 옵션"
//               className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg z-50 overflow-hidden"
//             >
//               <button
//                 role="menuitem"
//                 onClick={handleBlockListClick}
//                 className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
//               >
//                 차단 목록 관리
//               </button>
//               <button
//                 role="menuitem"
//                 onClick={handleDeleteClick}
//                 className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
//               >
//                 회원탈퇴
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* 본문 */}
//       <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
//         {/* 왼쪽: 프로필 + 팔/팔 */}
//         <div className="flex flex-col items-center w-full sm:w-32 shrink-0">
//           <img
//             src={user.imgUrl || "/default_image.png"}
//             alt="프로필 이미지"
//             className="w-24 h-24 object-cover rounded-full"
//           />

//           <div className="mt-4 flex gap-10 sm:gap-6 text-center">
//             <button
//               onClick={onFollowerClick}
//               disabled={!onFollowerClick}
//               className="group text-center disabled:cursor-default"
//               aria-label="팔로워 목록 열기"
//             >
//               <div className="text-lg font-bold group-hover:text-purple-600">
//                 {user.followerCount?.toLocaleString() ?? "0"}
//               </div>
//               <div className="text-xs text-gray-500 group-hover:underline">
//                 팔로워
//               </div>
//             </button>
//             <button
//               onClick={onFollowingClick}
//               disabled={!onFollowingClick}
//               className="group text-center disabled:cursor-default"
//               aria-label="팔로잉 목록 열기"
//             >
//               <div className="text-lg font-bold group-hover:text-purple-600">
//                 {user.followingCount?.toLocaleString() ?? "0"}
//               </div>
//               <div className="text-xs text-gray-500 group-hover:underline">
//                 팔로잉
//               </div>
//             </button>
//           </div>
//         </div>

//         {/* 오른쪽: 라벨 옆 값(항상 가로 배치) */}
//         <div className="min-w-0 flex-1 text-l space-y-2">
//           {/* 이메일 */}
//           <div className="flex items-start gap-2">
//             <div className="shrink-0 w-20 sm:w-24 text-gray-500 font-medium">
//               이메일
//             </div>
//             <div className="min-w-0 flex-1 break-all sm:whitespace-nowrap sm:truncate">
//               {user.email}
//             </div>
//           </div>

//           {/* 아이디 */}
//           <div className="flex items-start gap-2">
//             <div className="shrink-0 w-20 sm:w-24 text-gray-500 font-medium">
//               아이디
//             </div>
//             <div className="min-w-0 flex-1 break-all sm:whitespace-nowrap sm:truncate">
//               {user.userId}
//             </div>
//           </div>

//           {/* 닉네임 */}
//           <div className="flex items-start gap-2">
//             <div className="shrink-0 w-20 sm:w-24 text-gray-500 font-medium">
//               닉네임
//             </div>
//             <div className="min-w-0 flex-1">
//               <TruncatedTitle
//                 title={user.nickname}
//                 className="text-sm sm:text-base"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* ✅ 하단: 랭크 진행도 영역 */}
//       <div className="mt-8">
//         <RankProgress
//           rankLevel={rankLevel}
//           roomCreateCount={user.userRank?.roomCreateCount ?? 0}
//         />
//       </div>
//     </div>
//   );
// };

// export default MyProfileCard;

import { type MyUser } from "../../../types/mypage";
import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import RankProgress from "../../common/RankProgress";
import TruncatedTitle from "../../common/TruncatedTitle";

type MyProfileCardProps = {
  user: MyUser;
  onEditClick: () => void;
  onFollowerClick?: () => void;
  onFollowingClick?: () => void;
  onDeleteClick: () => void;
  onBlockListClick: () => void;
  onChangePasswordClick?: () => void;
};

const MyProfileCard = ({
  user,
  onEditClick,
  onFollowerClick,
  onFollowingClick,
  onDeleteClick,
  onBlockListClick,
  onChangePasswordClick,
}: MyProfileCardProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const rankLevel = user.userRank?.rankLevel ?? "GREEN";
  const isSocial = !!(user as any).socialLogin;

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(t) &&
        btnRef.current &&
        !btnRef.current.contains(t)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleDeleteClick = () => {
    setOpen(false);
    onDeleteClick();
  };

  const handleBlockListClick = () => {
    setOpen(false);
    onBlockListClick();
  };

  return (
    <div className="bg-white rounded-xl px-4 sm:px-8 py-6 mb-10 w-full max-w-[880px] mx-auto shadow-sm">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6 gap-3">
        <h1 className="text-lg font-bold">프로필 정보</h1>
        <div className="relative flex items-center gap-2">
          <button
            className="text-sm text-purple-600 font-medium hover:underline transition"
            onClick={onEditClick}
          >
            프로필 수정
          </button>

          {/* 일반 로그인 사용자만 비밀번호 변경 버튼 표시 */}
          {!isSocial && onChangePasswordClick && (
            <button
              className="text-sm text-purple-600 font-medium hover:underline transition"
              onClick={onChangePasswordClick}
            >
              비밀번호 변경
            </button>
          )}

          <button
            ref={btnRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="프로필 옵션 열기"
            onClick={() => setOpen((v) => !v)}
            className="p-1.5 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <MoreVertical size={16} />
          </button>
          {open && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="프로필 옵션"
              className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg z-50 overflow-hidden"
            >
              <button
                role="menuitem"
                onClick={handleBlockListClick}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                차단 목록 관리
              </button>
              <button
                role="menuitem"
                onClick={handleDeleteClick}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                회원탈퇴
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 📱 모바일 인스타 스타일 */}
      <div className="flex flex-col gap-5 md:hidden">

        {/* 상단: 아바타 + 닉네임 + 팔/팔 */}
        <div className="flex items-start gap-4">
          {/* 프로필 이미지 */}
          <img
            src={user.imgUrl || "/default_image.png"}
            alt="프로필 이미지"
            className="w-20 h-20 object-cover rounded-full"
          />

          {/* 오른쪽 정보 */}
          <div className="flex-1 flex flex-col">

            {/* 닉네임 */}
            <div className="text-base font-semibold mb-2">
              <TruncatedTitle title={user.nickname} />
            </div>

            {/* 팔로워 / 팔로잉 (왼쪽 정렬) */}
            <div className="flex gap-6">
              <button
                onClick={onFollowerClick}
                disabled={!onFollowerClick}
                className="group flex flex-col items-start disabled:cursor-default"
              >
                <div className="text-base font-bold group-hover:text-purple-600">
                  {user.followerCount?.toLocaleString() ?? "0"}
                </div>
                <div className="text-[11px] text-gray-500 group-hover:underline">
                  팔로워
                </div>
              </button>

              <button
                onClick={onFollowingClick}
                disabled={!onFollowingClick}
                className="group flex flex-col items-start disabled:cursor-default"
              >
                <div className="text-base font-bold group-hover:text-purple-600">
                  {user.followingCount?.toLocaleString() ?? "0"}
                </div>
                <div className="text-[11px] text-gray-500 group-hover:underline">
                  팔로잉
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 하단 정보 라벨 */}
        <div className="space-y-1.5 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-14 text-gray-500 font-medium">이메일</div>
            <div className="flex-1 break-all">{user.email}</div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-14 text-gray-500 font-medium">아이디</div>
            <div className="flex-1 break-all">{user.userId}</div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-14 text-gray-500 font-medium">닉네임</div>
            <div className="flex-1">
              <TruncatedTitle title={user.nickname} />
            </div>
          </div>
        </div>
      </div>


      {/* ======================= */}
      {/* 💻 기존 웹 레이아웃 그대로 */}
      {/* ======================= */}
      <div className="hidden md:flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
        {/* 왼쪽: 프로필 + 팔/팔 (원래 웹 디자인) */}
        <div className="flex flex-col items-center w-full sm:w-32 shrink-0">
          <img
            src={user.imgUrl || "/default_image.png"}
            alt="프로필 이미지"
            className="w-24 h-24 object-cover rounded-full"
          />

          <div className="mt-4 flex gap-10 sm:gap-6 text-center">
            <button
              onClick={onFollowerClick}
              disabled={!onFollowerClick}
              className="group text-center disabled:cursor-default"
              aria-label="팔로워 목록 열기"
            >
              <div className="text-lg font-bold group-hover:text-purple-600">
                {user.followerCount?.toLocaleString() ?? "0"}
              </div>
              <div className="text-xs text-gray-500 group-hover:underline">
                팔로워
              </div>
            </button>
            <button
              onClick={onFollowingClick}
              disabled={!onFollowingClick}
              className="group text-center disabled:cursor-default"
              aria-label="팔로잉 목록 열기"
            >
              <div className="text-lg font-bold group-hover:text-purple-600">
                {user.followingCount?.toLocaleString() ?? "0"}
              </div>
              <div className="text-xs text-gray-500 group-hover:underline">
                팔로잉
              </div>
            </button>
          </div>
        </div>

        {/* 오른쪽: 라벨 옆 값 (원래 웹 디자인) */}
        <div className="min-w-0 flex-1 text-l space-y-2">
          <div className="flex items-start gap-2">
            <div className="shrink-0 w-20 sm:w-24 text-gray-500 font-medium">
              이메일
            </div>
            <div className="min-w-0 flex-1 break-all sm:whitespace-nowrap sm:truncate">
              {user.email}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="shrink-0 w-20 sm:w-24 text-gray-500 font-medium">
              아이디
            </div>
            <div className="min-w-0 flex-1 break-all sm:whitespace-nowrap sm:truncate">
              {user.userId}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="shrink-0 w-20 sm:w-24 text-gray-500 font-medium">
              닉네임
            </div>
            <div className="min-w-0 flex-1">
              <TruncatedTitle
                title={user.nickname}
                className="text-sm sm:text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 랭크 진행도 – 공통 */}
      <div className="mt-8">
        <RankProgress
          rankLevel={rankLevel}
          roomCreateCount={user.userRank?.roomCreateCount ?? 0}
        />
      </div>
    </div>
  );
};

export default MyProfileCard;

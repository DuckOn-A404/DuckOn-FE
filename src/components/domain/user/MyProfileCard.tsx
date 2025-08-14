import { type MyUser } from "../../../types/mypage";
import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type MyProfileCardProps = {
  user: MyUser;
  onEditClick: () => void;
  onFollowerClick?: () => void;
  onFollowingClick?: () => void;
  onDeleteClick: () => void;
};

const MyProfileCard = ({
  user,
  onEditClick,
  onFollowerClick,
  onFollowingClick,
  onDeleteClick,
}: MyProfileCardProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

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

  return (
    <div className="bg-white rounded-xl px-8 py-6 mb-10 w-full max-w-[880px] mx-auto shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold">프로필 정보</h1>
        <div className="relative flex items-center gap-2">
          <button
            className="text-sm text-purple-600 font-medium hover:underline transition"
            onClick={onEditClick}
          >
            프로필 수정
          </button>

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
                onClick={handleDeleteClick}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                회원탈퇴
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* 왼쪽: 프로필 이미지 + 팔로워/팔로잉 */}
        <div className="flex flex-col items-center w-32 shrink-0">
          <img
            src={user.imgUrl || "/default_image.png"}
            alt="프로필 이미지"
            className="w-24 h-24 object-cover rounded-full"
          />

          <div className="mt-4 flex gap-6 text-center">
            {/* 팔로워: 숫자+라벨 통째로 클릭 */}
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

            {/* 팔로잉: 숫자+라벨 통째로 클릭 */}
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

        {/* 오른쪽: 사용자 정보 */}
        <div className="flex-1 text-sm grid gap-4">
          <div className="flex">
            <div className="w-32 text-gray-500 font-medium">이메일</div>
            <div>{user.email}</div>
          </div>
          <div className="flex">
            <div className="w-32 text-gray-500 font-medium">아이디</div>
            <div>{user.userId}</div>
          </div>
          <div className="flex">
            <div className="w-32 text-gray-500 font-medium">닉네임</div>
            <div>{user.nickname}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfileCard;

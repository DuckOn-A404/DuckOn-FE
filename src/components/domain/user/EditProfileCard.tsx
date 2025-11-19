import { useState, useRef } from "react";
import type { MyUser } from "../../../types/mypage";
import { fetchMyProfile, updateUserProfile } from "../../../api/userService";
import { Camera, ChevronDown } from "lucide-react";
import { useUserStore } from "../../../store/useUserStore";
import { Dialog } from "@headlessui/react";

export type EditProfileCardProps = {
  user: MyUser;
  onCancel: () => void;
  onUpdate: (updatedUser: MyUser) => void;
};

const DEFAULT_IMG = "/default_image.png";

// 언어 옵션 정의
const LANGUAGE_OPTIONS = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "zh", label: "中文" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
] as const;


const EditProfileCard = ({ user, onCancel, onUpdate }: EditProfileCardProps) => {
  const [nickname, setNickname] = useState(user.nickname);
  const [language, setLanguage] = useState(user.language || "ko");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user.imgUrl ?? DEFAULT_IMG);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [shouldResetToDefault, setShouldResetToDefault] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: '', message: '' });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      
      if (file.size > MAX_SIZE) {
        setErrorDialog({
          open: true,
          title: '파일 용량 초과',
          message: `이미지 용량이 너무 큽니다.\n\n파일 크기: ${(file.size / 1024 / 1024).toFixed(2)}MB\n최대 허용: 5MB\n\n더 작은 이미지를 선택해주세요.`,
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowImageOptions(false);
      setShouldResetToDefault(false);
    }
  };

  const handleResetToDefaultImage = () => {
    setPreviewUrl(DEFAULT_IMG);
    setProfileImage(null);
    setShowImageOptions(false);
    setShouldResetToDefault(true);
  };

  const handleCameraClick = () => {
    if (previewUrl === DEFAULT_IMG || user.imgUrl === null) {
      fileInputRef.current?.click();
    } else {
      setShowImageOptions(!showImageOptions);
    }
  };

  const handleSubmit = async () => {

    // ─────────────────────────────────────────────
    // FormData: 바뀐 값만, 그리고 profileImg는 "선택했을 때만" 포함
    // ─────────────────────────────────────────────
    const fd = new FormData();

    const trimmedNick = nickname.trim();
    if (trimmedNick && trimmedNick !== user.nickname) {
      fd.append("nickname", trimmedNick);
    }

    // 언어 필드 - 변경된 경우에만 추가
    if (language && language !== user.language) {
      fd.append("language", language);
    }

    // 기본 이미지로 변경하는 경우: 실제 default_image.png 파일 전송
    if (shouldResetToDefault) {
      try {
        const response = await fetch('/default_image.png');
        const blob = await response.blob();
        fd.append("profileImg", blob, "default_image.png");
      } catch (error) {
        console.error('기본 이미지 로드 실패:', error);
        // 기본 이미지 로드 실패 시 빈 Blob 전송
        fd.append("profileImg", new Blob([]), "default.png");
      }
    } else if (profileImage && profileImage.size > 0) {
      fd.append("profileImg", profileImage);
    }

    try {
      await updateUserProfile(fd);

      // 항상 서버 최신값으로 동기화 (이미지/닉/기타 모두 반영)
      const refreshed = await fetchMyProfile();

      // 서버가 일시적으로 빈 값/누락을 줄 때 이전 이미지를 보존
      const prevImg = (user as any)?.imgUrl;
      const incomingImg = (refreshed as any)?.imgUrl;
      const safeImg =
        incomingImg && String(incomingImg).trim() !== "" ? incomingImg : prevImg ?? incomingImg;

      const next: MyUser = { ...refreshed, imgUrl: safeImg } as MyUser;

      // 전역 스토어 동기화
      useUserStore.getState().setMyUser({
        ...next,
        artistList: next.artistList ?? [],
      });

      // 상위로 반영
      onUpdate(next);
    } catch (err) {
      setErrorDialog({
        open: true,
        title: '프로필 수정 실패',
        message: '프로필 수정 중 오류가 발생했습니다.\n다시 시도해주세요.',
      });
    }
  };


  const handleCloseErrorDialog = () => {
    setErrorDialog({ open: false, title: '', message: '' });
  };

  return (
    <>
    <div className="bg-white rounded-xl px-4 sm:px-8 py-6 mb-10 w-full max-w-[880px] mx-auto shadow-sm">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold">프로필 수정</h1>
        <div className="space-x-2">
          <button
            className="text-sm text-purple-600 font-medium hover:underline transition"
            onClick={handleSubmit}
          >
            저장
          </button>
          <button
            className="text-sm text-gray-500 font-medium hover:underline"
            onClick={onCancel}
          >
            취소
          </button>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
        {/* 왼쪽: 이미지/팔로워 */}
        <div className="flex flex-col items-center w-full sm:w-32 shrink-0">
          <div className="relative">
            <img
              src={previewUrl}
              alt="프로필 이미지"
              className="w-24 h-24 rounded-full object-cover"
            />
            <button
              onClick={handleCameraClick}
              className="absolute bottom-0 right-0 bg-purple-600 text-white p-1 rounded-full hover:scale-105 transition"
            >
              <Camera size={18} />
            </button>
          </div>

          {showImageOptions && (
            <div className="mt-2 space-y-1 text-sm">
              <button onClick={handleImageClick} className="text-purple-600 hover:underline">
                변경하기
              </button>
              {user.imgUrl && user.imgUrl !== DEFAULT_IMG && (
                <button
                  onClick={handleResetToDefaultImage}
                  className="text-gray-500 hover:underline"
                >
                  기본 이미지로 변경
                </button>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          <div className="mt-4 flex gap-10 sm:gap-6 text-center">
            <div>
              <div className="text-lg font-bold">
                {user.followerCount?.toLocaleString() ?? "0"}
              </div>
              <div className="text-xs text-gray-500">팔로워</div>
            </div>
            <div>
              <div className="text-lg font-bold">
                {user.followingCount?.toLocaleString() ?? "0"}
              </div>
              <div className="text-xs text-gray-500">팔로잉</div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 폼 (반응형 레이블-값) */}
        <div className="min-w-0 flex-1 text-sm grid gap-4">
          {/* 이메일(읽기전용) */}
          <div className="grid grid-cols-1 sm:grid-cols-[8rem,1fr] items-center gap-2 sm:gap-3">
            <label className="text-gray-500 font-medium">이메일</label>
            <div className="min-w-0">
              <input
                value={user.email}
                readOnly
                className="w-full rounded-lg border border-gray-200 text-gray-500 bg-gray-50 px-2 py-1"
              />
            </div>
          </div>

          {/* 아이디(읽기전용) */}
          <div className="grid grid-cols-1 sm:grid-cols-[8rem,1fr] items-center gap-2 sm:gap-3">
            <label className="text-gray-500 font-medium">아이디</label>
            <div className="min-w-0">
              <input
                value={user.userId}
                readOnly
                className="w-full rounded-lg border border-gray-200 text-gray-500 bg-gray-50 px-2 py-1"
              />
            </div>
          </div>

          {/* 닉네임 */}
          <div className="grid grid-cols-1 sm:grid-cols-[8rem,1fr] items-center gap-2 sm:gap-3">
            <label htmlFor="nickname" className="text-gray-500 font-medium">
              닉네임
            </label>
            <div className="min-w-0">
              <input
                id="nickname"
                className="w-full rounded-lg border border-gray-200 px-2 py-1"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          </div>

          {/* 언어 선택 */}
          <div className="grid grid-cols-1 sm:grid-cols-[8rem,1fr] items-center gap-2 sm:gap-3">
            <label htmlFor="language" className="text-gray-500 font-medium">
              언어
            </label>
            <div className="min-w-0 relative">
              <select
                id="language"
                className="w-full rounded-lg border border-gray-200 px-2 py-1 pr-8 appearance-none bg-white cursor-pointer hover:border-purple-300 transition"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown 
                size={16} 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

        </div>
      </div>
    </div>

    {/* 에러 알림 Dialog */}
    <Dialog
      open={errorDialog.open}
      onClose={handleCloseErrorDialog}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm w-full bg-white rounded-2xl shadow-xl">
          <div className="p-6">
            <Dialog.Title className="text-lg font-bold text-center text-red-600 mb-4">
              {errorDialog.title}
            </Dialog.Title>
            
            <p className="text-sm text-gray-600 text-center whitespace-pre-line leading-relaxed mb-6">
              {errorDialog.message}
            </p>
            
            <div className="flex justify-center">
              <button
                onClick={handleCloseErrorDialog}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition min-w-[100px]"
              >
                확인
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
    </>
  );
};

export default EditProfileCard;

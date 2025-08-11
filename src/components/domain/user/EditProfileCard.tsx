import { useState, useRef } from "react";
import type { MyUser } from "../../../types/mypage";
import { fetchMyProfile, updateUserProfile } from "../../../api/userService";
import { Camera } from "lucide-react";
// import {
//   fetchLanguages,
//   type LanguageOption,
// } from "../../../api/languageSelect";
import { useUserStore } from "../../../store/useUserStore";

export type EditProfileCardProps = {
  user: MyUser;
  onCancel: () => void;
  onUpdate: (updatedUser: MyUser) => void;
};

const DEFAULT_IMG = "/default_image.png";

const EditProfileCard = ({
  user,
  onCancel,
  onUpdate,
}: EditProfileCardProps) => {
  const [nickname, setNickname] = useState(user.nickname);
  // const [language, setLanguage] = useState(user.language);
  // const [languageOptions, setLanguageOptions] = useState<LanguageOption[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    user.imgUrl ?? DEFAULT_IMG
  );
  const [showImageOptions, setShowImageOptions] = useState(false);

  const [didPickNewImage, setDidPickNewImage] = useState(false)
  // const [didResetImage, setDidResetImage] = useState(false)

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // useEffect(() => {
  //   const loadLanguages = async () => {
  //     const langs = await fetchLanguages();
  //     setLanguageOptions(langs);
  //   };
  //   loadLanguages();
  // }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowImageOptions(false);
      setDidPickNewImage(true); // 새 파일 선택
      // setDidResetImage(false);
    }
  };

  const handleResetToDefaultImage = () => {
    setPreviewUrl(DEFAULT_IMG);
    setProfileImage(null);
    setShowImageOptions(false);
    // setDidResetImage(true)  // 기본 이미지로 변경 의도
    setDidPickNewImage(false);
  };

  const handleCameraClick = () => {
    if (previewUrl === DEFAULT_IMG || user.imgUrl === null) {
      fileInputRef.current?.click();
    } else {
      setShowImageOptions(!showImageOptions);
    }
  };

  const handleSubmit = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError("새 비밀번호와 확인이 일치하지 않습니다.");
      return;
    } else {
      setConfirmPasswordError("");
    }

    if (newPassword && newPassword.length < 8) {
      setNewPasswordError("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    const formData = new FormData();
    formData.append("nickname", nickname);
    formData.append("language", "ko");

    if (newPassword) {
      formData.append("newPassword", newPassword);
    }
    if (profileImage) {
      formData.append("profileImg", profileImage);
    }

    try {
      await updateUserProfile(formData);
      if (didPickNewImage) {
        const refreshed = await fetchMyProfile()
        const next = { ...refreshed }
        useUserStore.getState().setMyUser({ ...next, artistList: next. artistList ?? [] })
        onUpdate(next)
      } else {
        const next = {
          ...user,
          nickname,
        }
        useUserStore.getState().setMyUser({ ...next, artistList: next.artistList ?? [] })
        onUpdate(next)
      }
      // const updated = await fetchMyProfile(); // 다시 내 정보 불러오기
      // const merged: MyUser = {
      //   ...updated,
      //   imgUrl:
      //     (didPickNewImage || didResetImage)
      //       ? updated.imgUrl ?? (didResetImage ? DEFAULT_IMG: user.imgUrl)
      //       : (updated.imgUrl ?? user.imgUrl),
      // };

      // useUserStore.getState().setMyUser({
      //   ...merged,
      //   artistList: merged.artistList ?? [],
      // });
      // onUpdate(merged);
    } catch (err) {
      alert("프로필 수정 중 오류가 발생했습니다.");
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPassword(val);

    if (val && val.length < 8) {
      setNewPasswordError("8자리 이상 입력해 주세요.");
    } else {
      setNewPasswordError("");
    }

    // 비밀번호 확인값이 존재하고 일치하지 않으면 에러
    if (confirmPassword && val !== confirmPassword) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value;
    setConfirmPassword(val);

    if (newPassword && newPassword !== val) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmPasswordError("");
    }
  };

  return (
    <div className="bg-white rounded-xl px-8 py-6 mb-10 w-full max-w-[680px] mx-auto shadow-sm">
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

      <div className="flex gap-8 items-start">
        <div className="flex flex-col items-center w-32 shrink-0">
          <div className="relative">
            <img
              src={(didPickNewImage ? previewUrl : (user.imgUrl ?? DEFAULT_IMG))}
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

          {/* 이미지 수정 옵션 */}
          {showImageOptions && (
            <div className="mt-2 space-y-1 text-sm">
              <button
                onClick={handleImageClick}
                className="text-purple-600 hover:underline"
              >
                변경하기
              </button>
              {/* 기본 이미지가 아닌 경우에만 뜨기 */}
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
          <div className="mt-4 flex gap-6 text-center">
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
            <input
              className="border px-2 py-1 rounded w-full"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          {/* <div className="flex items-center">
            <div className="w-32 text-gray-500 font-medium">주언어</div>
            <select
              className="border px-1 py-1 rounded w-full"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languageOptions.map((lang) => (
                <option key={lang.langCode} value={lang.langCode}>
                  {lang.langName}
                </option>
              ))}
            </select>
          </div> */}

          <div className="flex items-start">
            <div className="w-32 text-gray-500 font-medium pt-2">
              새 비밀번호
            </div>

            {/* 입력 필드와 에러 메시지를 세로로 쌓음 */}
            <div className="flex flex-col w-full">
              <input
                type="password"
                className="border px-2 py-1 rounded"
                value={newPassword}
                onChange={handleNewPasswordChange}
              />
              {newPasswordError && (
                <p className="text-red-500 text-xs mt-1">{newPasswordError}</p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-32 text-gray-500 font-medium pt-2">
              비밀번호 확인
            </div>

            {/* 입력 필드와 에러 메시지를 세로로 쌓음 */}
            <div className="flex flex-col w-full">
              <input
                type="password"
                className="border px-2 py-1 rounded"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              {confirmPasswordError && (
                <p className="text-red-500 text-xs mt-1">
                  {confirmPasswordError}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileCard;

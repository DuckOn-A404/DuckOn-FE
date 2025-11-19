// import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignupForm } from "../hooks/useSignupForm";
import LoginSignupCard from "../components/common/LoginSignupCard";
import InputField from "../components/common/InputField";
// import SelectField from "../components/common/SelectField";
// import { fetchLanguages } from "../api/languageSelect";
import {
  Mail,
  User,
  MessageSquareText,
  LockKeyhole,
  ArrowLeft,
  // Globe,
} from "lucide-react";

// type SelectOption = {
//   value: string;
//   label: string;
// };

const LANGUAGE_OPTIONS = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "zh", label: "中文" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
];

const SignupPage = () => {
  const navigate = useNavigate();
  const {
    formData,
    loading,
    error,
    handleChange,
    handleFileChange,
    handleSubmit,
    emailError,
    userIdError,
    emailSuccess,
    userIdSuccess,
    handleCheckUserId,
    passwordConfirmError,
    passwordError,
    nicknameError,
    // 이메일 인증 관련
    verificationCode,
    setVerificationCode,
    isCodeSent,
    isCodeVerified,
    codeError,
    codeSuccess,
    sendingCode,
    verifyingCode,
    handleSendVerificationCode,
    handleVerifyCode,
    remainingSeconds,
  } = useSignupForm();

  // const [languageOptions, setLanguageOptions] = useState<SelectOption[]>([]);
  const iconStyle = "w-5 h-5 text-gray-400";

  // useEffect(() => {
  //   const loadLanguages = async () => {
  //     const languages = await fetchLanguages();
  //     const options = languages.map((lang) => ({
  //       value: lang.langCode,
  //       label: lang.langName,
  //     }));
  //     setLanguageOptions(options);
  //   };

  //   loadLanguages();
  // }, []);

  // 'Enter' 키 동작을 제어하는 이벤트 핸들러
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter") return;

    const target = e.target as HTMLInputElement | HTMLSelectElement | null;
    const targetId = target?.id;

    // 이메일 입력창에서 Enter를 누르면 인증번호 발송
    if (targetId === "email") {
      e.preventDefault();
      if (!isCodeSent) {
        handleSendVerificationCode();
      }
    }
    // 인증번호 입력창에서 Enter를 누르면 인증 확인
    else if (targetId === "verificationCode") {
      e.preventDefault();
      handleVerifyCode();
    }
    // 아이디 입력창에서 Enter를 누르면 아이디 중복 확인 실행
    else if (targetId === "userId") {
      e.preventDefault();
      handleCheckUserId();
    } else {
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-600 to-pink-500">
      <LoginSignupCard>
        {/* 로고 영역 */}
        <div className="flex flex-col items-center gap-1 mb-4">
          <img src="/logo.svg" alt="Duck-On 로고" className="h-8 w-auto" />
          <p className="text-center text-gray-500 text-base font-normal leading-normal">
            새로운 K-POP 경험을 시작하세요
          </p>
        </div>

        {/* 회원가입 폼 영역 */}
        <form
          onSubmit={handleSubmit}
          onKeyDown={handleFormKeyDown}
          className="w-full flex flex-col gap-4"
        >
          <div className="flex gap-2 items-start">
            <div className="flex-grow">
              <InputField
                id="email"
                label="이메일*"
                type="email"
                placeholder="이메일을 입력하세요"
                icon={<Mail className={iconStyle} />}
                value={formData.email}
                onChange={handleChange}
                error={emailError}
                success={emailSuccess}
                disabled={isCodeVerified}
              />
            </div>
            <button
              type="button"
              onClick={handleSendVerificationCode}
              disabled={sendingCode || isCodeVerified
                || (isCodeSent && !isCodeVerified && (remainingSeconds ?? 0) > 0)
              }
              className="h-11 mt-[30px] px-4 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:text-gray-500 whitespace-nowrap"
            >
              {sendingCode ? "발송 중..." : isCodeVerified ? "인증 완료" : "인증번호 발송"}
            </button>
          </div>
          
          {/* 인증번호가 발송된 상태 */}
          {isCodeSent && !isCodeVerified && (
            <>
              {remainingSeconds !== null && remainingSeconds > 0 && (
                <p className="text-xs text-gray-500 pl-1 -mt-2">
                  남은 시간 {String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:
                  {String(remainingSeconds % 60).padStart(2, "0")} 내에 인증을 완료해주세요.
                </p>
              )}

              {remainingSeconds !== 0 && (
                <div className="flex gap-2 items-start">
                  <div className="flex-grow">
                    <InputField
                      id="verificationCode"
                      label="인증번호*"
                      type="text"
                      placeholder="인증번호를 입력하세요"
                      icon={<Mail className={iconStyle} />}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      error={codeError}
                      success={codeSuccess}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={verifyingCode}
                    className="h-11 mt-[30px] px-4 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:text-gray-500 whitespace-nowrap"
                  >
                    {verifyingCode ? "확인 중..." : "인증 확인"}
                  </button>
                </div>
              )}
            </>
          )}
          <div className="flex gap-2 items-start">
            <div className="flex-grow">
              <InputField
                id="userId"
                label="아이디*"
                type="text"
                placeholder="아이디를 입력하세요"
                icon={<User className={iconStyle} />}
                value={formData.userId}
                onChange={handleChange}
                error={userIdError}
                success={userIdSuccess}
              />
            </div>
            <button
              type="button"
              onClick={handleCheckUserId}
              className="h-11 mt-[30px] px-4 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 whitespace-nowrap"
            >
              중복 확인
            </button>
          </div>
          <div className="flex gap-2 items-start">
            <div className="flex-grow">
              <InputField
                id="nickname"
                label="닉네임"
                type="text"
                placeholder="닉네임을 입력하세요"
                icon={<MessageSquareText className={iconStyle} />}
                value={formData.nickname}
                onChange={handleChange}
                error={nicknameError}
              />
            </div>
          </div>
          <InputField
            id="password"
            label="비밀번호*"
            type="password"
            placeholder="비밀번호를 입력하세요"
            icon={<LockKeyhole className={iconStyle} />}
            value={formData.password}
            onChange={handleChange}
            error={passwordError}
          />
          <InputField
            id="passwordConfirm"
            label="비밀번호 확인*"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            icon={<LockKeyhole className={iconStyle} />}
            value={formData.passwordConfirm}
            onChange={handleChange}
            error={passwordConfirmError}
          />
          {/* <SelectField
            id="language"
            label="언어 선택"
            icon={<Globe className={iconStyle} />}
            value={formData.language}
            onChange={handleChange}
            options={languageOptions}
          /> */}

          {/* ======= 언어 선택 필드 추가 시작 ======= */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="language"
              className="text-gray-700 text-sm font-medium mb-1 flex items-center gap-2"
            >
              {/* <Globe className={iconStyle} /> */}
              <span>주언어*</span>
            </label>
            <div className="relative">
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="
                  w-full appearance-none
                  rounded-lg border border-gray-300 bg-white
                  pl-3 pr-8 py-2
                  text-sm text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                "
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {/* 셀렉트 오른쪽 아래 화살표 */}
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                ▼
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              선택한 언어로 사이트 UI와 채팅 번역이 제공됩니다.
            </p>
          </div>
          {/* ======= 언어 선택 필드 추가 끝 ======= */}

          <div>
            <label
              htmlFor="profileImg"
              className="text-gray-700 text-sm font-medium mb-2 flex items-center gap-2"
            >
              프로필 이미지
            </label>
            <input
              id="profileImg"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          {/* 에러 메시지 표시 */}
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold mt-5"
          >
            회원가입
          </button>
        </form>

        {/* 기타 */}
        <p className="mt-4 text-sm text-gray-500">
          이미 계정이 있으신가요?
          <Link
            to="/login"
            className="text-purple-600 font-medium hover:underline"
          >
            로그인
          </Link>
        </p>
      </LoginSignupCard>
      <div
        className="my-6 flex items-center gap-2 text-white cursor-pointer hover:underline"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={18} />
        <span className="text-sm">홈으로 돌아가기</span>
      </div>
    </div>
  );
};

export default SignupPage;

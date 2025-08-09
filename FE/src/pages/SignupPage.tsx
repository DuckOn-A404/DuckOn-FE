import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignupForm } from "../hooks/useSignupForm";
import LoginSignupCard from "../components/common/LoginSignupCard";
import InputField from "../components/common/InputField";
import SelectField from "../components/common/SelectField";
import { fetchLanguages } from "../api/languageSelect";
import {
  Mail,
  User,
  MessageSquareText,
  LockKeyhole,
  ArrowLeft,
  Globe,
} from "lucide-react";

type SelectOption = {
  value: string;
  label: string;
};

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
    handleCheckEmail,
    handleCheckUserId,
    passwordConfirmError,
    passwordError,
  } = useSignupForm();

  const [languageOptions, setLanguageOptions] = useState<SelectOption[]>([]);
  const iconStyle = "w-5 h-5 text-gray-400";

  useEffect(() => {
    const loadLanguages = async () => {
      const languages = await fetchLanguages();
      const options = languages.map((lang) => ({
        value: lang.langCode,
        label: lang.langName,
      }));
      setLanguageOptions(options);
    };

    loadLanguages();
  }, []);

  // 'Enter' 키 동작을 제어하는 이벤트 핸들러
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    const target = e.target as HTMLInputElement;
    const targetId = target?.id;

    // 이메일 입력창에서 Enter를 누르면 이메일 중복 확인 실행
    if (targetId === "email") {
      e.preventDefault();
      handleCheckEmail();
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
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex gap-2 items-start">
            <div className="flex-grow">
              <InputField
                id="email"
                label="이메일"
                type="email"
                placeholder="이메일을 입력하세요"
                icon={<Mail className={iconStyle} />}
                value={formData.email}
                onChange={handleChange}
                error={emailError}
                success={emailSuccess}
              />
            </div>
            <button
              type="button"
              onClick={handleCheckEmail}
              className="h-11 mt-[30px] px-4 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 whitespace-nowrap"
            >
              중복 확인
            </button>
          </div>
          <div className="flex gap-2 items-start">
            <div className="flex-grow">
              <InputField
                id="userId"
                label="아이디"
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
              />
            </div>
          </div>
          <InputField
            id="password"
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력하세요"
            icon={<LockKeyhole className={iconStyle} />}
            value={formData.password}
            onChange={handleChange}
            error={passwordError}
          />
          <InputField
            id="passwordConfirm"
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            icon={<LockKeyhole className={iconStyle} />}
            value={formData.passwordConfirm}
            onChange={handleChange}
            error={passwordConfirmError}
          />
          <SelectField
            id="language"
            label="언어 선택"
            icon={<Globe className={iconStyle} />}
            value={formData.language}
            onChange={handleChange}
            options={languageOptions}
          />
          <div>
            <label
              htmlFor="profileImg"
              className="text-gray-700 text-sm font-medium mb-2 flex items-center gap-2"
            >
              프로필 이미지 (선택)
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
          {error && (
            <p className="text-sm text-red-500 text-center mt-2">{error}</p>
          )}

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

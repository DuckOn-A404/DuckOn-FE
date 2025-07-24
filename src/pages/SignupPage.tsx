import LoginSignupCard from "../components/common/LoginSignupCard";
import InputField from "../components/common/InputField";
import { Link } from "react-router-dom";
import { Mail, User, MessageSquareText, LockKeyhole } from "lucide-react";

type SignupPageProps = {};

const SignupPage = ({}: SignupPageProps) => {
  const iconStyle = "w-5 h-5 text-gray-400";
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-600 to-pink-500">
      <LoginSignupCard>
        <div className="w-96 h-16 inline-flex flex-col justify-start items-start mb-4">
          <div className="pb-2">
            <div className="w-96 h-9 flex justify-center items-center">
              <img
                src="/logo.svg"
                alt="Duck-On 로고"
                className="h-full w-auto"
              />
            </div>
          </div>
          <div className="w-96 h-6 inline-flex justify-center items-center ">
            <div className="text-center justify-center text-gray-500 text-base font-normal font-['Roboto'] leading-normal">
              새로운 K-POP 경험을 시작하세요
            </div>
          </div>
        </div>

        <form className="w-full flex flex-col gap-4">
          {/* 3. icon prop에 import한 Lucide 아이콘 컴포넌트를 전달합니다. */}
          <InputField
            id="email"
            label="이메일"
            type="email"
            placeholder="이메일을 입력하세요"
            icon={<Mail className={iconStyle} />}
          />
          <InputField
            id="userId"
            label="아이디"
            type="text"
            placeholder="아이디를 입력하세요"
            icon={<User className={iconStyle} />}
          />
          <InputField
            id="nickname"
            label="닉네임"
            type="text"
            placeholder="닉네임을 입력하세요"
            icon={<MessageSquareText className={iconStyle} />}
          />
          <InputField
            id="password"
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력하세요"
            icon={<LockKeyhole className={iconStyle} />}
          />
          <InputField
            id="password-confirm"
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            icon={<LockKeyhole className={iconStyle} />}
          />
        </form>

        {/* 회원가입 버튼 */}
        <button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold mt-5">
          회원가입
        </button>
        <div className="w-full flex flex-col items-center gap-4 pt-8">
          <div className="w-full flex items-center gap-4">
            <div className="h-px flex-grow bg-gray-300"></div>
            <span className="text-gray-500 text-sm">또는</span>
            <div className="h-px flex-grow bg-gray-300"></div>
          </div>

          <div className="w-full flex flex-col gap-3">
            <button
              type="button"
              className="w-full h-14 flex justify-center items-center gap-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium text-base hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M47.532 24.552c0-1.566-.14-3.084-.404-4.548H24.44v8.58h13.084c-.562 2.76-2.198 5.108-4.686 6.702v5.52h7.094c4.144-3.822 6.56-9.456 6.56-16.254Z"
                  fill="#4285F4"
                />
                <path
                  d="M24.44 48c6.516 0 12-2.142 16-5.7L33.346 36.8c-2.16 1.452-4.92 2.304-8.906 2.304-6.84 0-12.636-4.602-14.7-10.782H2.59v5.7C7.054 42.642 15.17 48 24.44 48Z"
                  fill="#34A853"
                />
                <path
                  d="M9.74 28.32c-.522-1.566-.822-3.234-.822-4.98s.3-3.414.822-4.98v-5.7H2.59C.946 15.99.01 19.83.01 24.06c0 4.23.936 8.07 2.58 11.46L9.74 28.32Z"
                  fill="#FBBC05"
                />
                <path
                  d="M24.44 9.498c3.54 0 6.696 1.224 9.186 3.6l6.294-6.294C36.426 2.19 30.954 0 24.44 0 15.17 0 7.054 5.358 2.59 12.618l7.15 5.7c2.064-6.18 7.86-10.782 14.7-10.782Z"
                  fill="#EA4335"
                />
              </svg>
              <span>Google로 회원가입</span>
            </button>

            <button
              type="button"
              className="w-full h-14 flex justify-center items-center gap-3 bg-[#FEE500] rounded-xl text-gray-900 font-medium text-base hover:opacity-90 transition-opacity"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M16 4C9.373 4 4 8.81 4 14.654c0 4.148 2.59 7.766 6.356 9.496l-2.288 8.167c-.203.723.498 1.343 1.187.97l9.02-4.832c.56-.002 1.118-.02 1.67-.058C27.428 27.873 32 22.18 32 16.654 32 10.81 27.373 6 20.746 6c-1.896 0-3.692.42-5.28 1.155C14.28 4.81 12.485 4 10.515 4H16Z"
                  transform="translate(-1.4 -2.9)"
                  fill="#191919"
                />
              </svg>
              <span>카카오로 회원가입</span>
            </button>
          </div>
        </div>

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
    </div>
  );
};

export default SignupPage;

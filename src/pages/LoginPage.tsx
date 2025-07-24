import LoginSignupCard from "../components/common/LoginSignupCard";
import { Mail, LockKeyhole, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type LoginPageProps = {
};

const LoginPage = ({}: LoginPageProps) => {
    const navigate = useNavigate()
    return (
        <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-600 to-pink-500">
        <LoginSignupCard>

            {/* 로고 & 문구 */}
            <div className="flex flex-col items-center gap-x-2 mb-12">
                <img className="h-8" src="/logo.svg" alt="Duck On 로고" />
                <p className="mt-4 text-sm text-gray-600 text-center">
                    좋아하는 아티스트와 함께하는 시간
                </p>
            </div>

            {/* 이메일 입력 */}
            <div className="w-full mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    이메일(아이디)
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="email"
                        placeholder="이메일 또는 아이디를 입력하세요"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>

            {/* 비밀번호 입력 */}
            <div className="w-full mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    비밀번호
                </label>
                <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>

            {/* 로그인 상태 유지 + 비밀번호 찾기 */}
            <div className="w-full flex justify-between items-center text-sm mb-4">
                <label className="flex items-center gap-2 text-gray-600 text-left">
                    <input type="checkbox" className="w-4 h-4"/>
                    로그인 상태 유지
                </label>
                <button className="text-purple-600 font-medium hover:underline">비밀번호 찾기</button>
            </div>

            {/* 로그인 버튼 */}
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold">
            로그인
            </button>

            {/* 구분선 */}
            <div className="flex items-center my-6 w-full">
                <div className="flex-grow h-px bg-gray-300" />
                <span className="px-4 text-sm text-gray-500 whitespace-nowrap">또는</span>
                <div className="flex-grow h-px bg-gray-300" />
            </div>

            {/* Google 로그인 */}
            <button className="w-full flex items-center justify-center gap-2 border border-gray-300 py-3 rounded-xl text-sm font-medium text-gray-700 mb-3">
            {/* <img src="/icon_google.png" alt="Google" className="w-5 h-5" /> */}
            <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#fbc02d" d="M43.6 20.5H42V20H24v8h11.3C34.1 32.2 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l6-6C34.5 5.1 29.5 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/>
                <path fill="#e53935" d="M6.3 14.1l6.6 4.8C14.4 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.6 7.4 6.3 14.1z"/>
                <path fill="#4caf50" d="M24 44c5.5 0 10.5-2.1 14.2-5.5l-6.6-5.5c-2 1.4-4.5 2.2-7.6 2.2-5.6 0-10.3-3.8-11.9-8.9l-6.5 5c3.3 6.5 10.1 11 18.4 11z"/>
                <path fill="#1565c0" d="M43.6 20.5H42V20H24v8h11.3c-1.4 4.1-5.4 8-11.3 8-5.6 0-10.3-3.8-11.9-8.9l-6.5 5C9.6 36.6 16.3 41 24 41c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/>
                </svg>
            Google로 계속하기
            </button>

            {/* Kakao 로그인 */}
            <button className="w-full flex items-center justify-center gap-2 bg-yellow-400 py-3 rounded-xl text-sm font-medium text-black mb-6">
            {/* <img src="/icon_kakao.png" alt="Kakao" className="w-5 h-5" /> */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#3c1e1e">
                <path d="M12 2C6.5 2 2 5.8 2 10.4c0 2.5 1.6 4.7 4 6.2l-.9 3.3c-.1.4.3.8.7.6l3.7-1.6c.5.1 1 .1 1.5.1 5.5 0 10-3.8 10-8.5S17.5 2 12 2z" />
                </svg>
            카카오로 계속하기
            </button>

            {/* 회원가입 안내 */}
            <p className="text-sm text-gray-500 text-center">
            계정이 없으신가요?{" "}
            <span className="text-purple-600 font-medium cursor-pointer">
                회원가입
            </span>
            </p>
        </LoginSignupCard>
        <div
            className="mt-6 flex items-center gap-2 text-white cursor-pointer hover:underline"
            onClick={() => navigate("/")}
        >
        <ArrowLeft size={18} />
        <span className="text-sm">홈으로 돌아가기</span>
      </div>
    </div>
  );
};

export default LoginPage;
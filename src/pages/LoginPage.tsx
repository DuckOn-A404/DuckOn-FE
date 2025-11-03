import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {logIn} from "../api/authService";
import LoginSignupCard from "../components/common/LoginSignupCard";
import {Mail, LockKeyhole, ArrowLeft} from "lucide-react";
import {useUserStore} from "../store/useUserStore";
import {buildLoginCredentials} from "../utils/authUtils";
import {fetchMyProfile} from "../api/userService";
import {emitTokenRefreshed} from "../api/axiosInstance";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const setUser = useUserStore((state) => state.setMyUser);

  const API_BASE_URL = import.meta.env.VITE_OAUTH2_BASE_URL ?? "";

  const handleLogin = async () => {
    setError("");
    const credentials = buildLoginCredentials(loginInput.trim(), password);

    try {
      await logIn(credentials);

      emitTokenRefreshed(localStorage.getItem("accessToken"));
      const userData = await fetchMyProfile();
      const userForStore = {
        ...userData,
        artistList: userData.artistList || [],
      };
      setUser(userForStore);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "로그인에 실패했습니다.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-600 to-pink-500">
      <LoginSignupCard>
        {/* 로고 & 문구 */}
        <div className="flex flex-col items-center gap-x-2 mb-10">
          <img className="h-8" src="/logo.svg" alt="Duck On 로고" />
          <p className="text-sm text-gray-600 text-center">
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
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        {/* 에러 메시지 */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            아이디 또는 비밀번호를 확인해주세요.
          </p>
        )}
        {/* 로그인 상태 유지 + 비밀번호 찾기
        <div className="w-full flex justify-between items-center text-sm mb-4">
          <label className="flex items-center gap-2 text-gray-600 text-left">
            <input type="checkbox" className="w-4 h-4" />
            로그인 상태 유지
          </label>
          <button className="text-purple-600 font-medium hover:underline">
            비밀번호 찾기
          </button>
        </div> */}

        {/* 로그인 버튼 */}
        <button
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:brightness-110 hover:shadow-lg"
          onClick={handleLogin}
        >
          로그인
        </button>
        {/* 구분선 */}
        <div className="flex items-center my-6 w-full">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="px-4 text-sm text-gray-500 whitespace-nowrap">
            또는
          </span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>
        {/* Google 로그인 */}
        <a
          href={`${API_BASE_URL}/login/oauth2/authorization/google`}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 py-3 rounded-xl text-sm font-medium text-gray-700 mb-3 transition-colors hover:bg-gray-50"
        >
          {" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 48 48"
          >
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.322C33.76 32.042 29.369 35 24 35c-6.075 0-11-4.925-11-11s4.925-11 11-11c2.653 0 5.077.976 6.938 2.582l6.045-6.045C33.27 6.337 28.88 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20c11.046 0 20-8.954 20-20 0-1.34-.138-2.651-.389-3.917z"
            />
            <path
              fill="#FF3D00"
              d="M6.306 14.691l6.571 4.819C14.145 16.093 18.727 13 24 13c2.653 0 5.077.976 6.938 2.582l6.045-6.045C33.27 6.337 28.88 4 24 4 16.318 4 9.656 8.531 6.306 14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c4.737 0 9.055-1.62 12.438-4.348l-5.781-4.89C28.369 35.613 26.261 36 24 36c-5.354 0-9.748-3.525-11.341-8.307l-6.57 5.061C9.622 40.367 16.296 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.322c-1.004 2.728-3.038 5.033-5.665 6.454l.001-.001 5.781 4.89C35.186 40.869 39 37 41.5 32.5c1.468-2.708 2.111-5.933 2.111-9.417 0-1.34-.138-2.651-.389-3.917z"
            />
          </svg>
          Google로 계속하기
        </a>
        {/* Kakao 로그인 */}
        <a
          href={`${API_BASE_URL}/login/oauth2/authorization/kakao`}
          className="w-full flex items-center justify-center gap-2 bg-[#FEE500] py-3 rounded-xl text-sm font-medium text-black mb-3 transition-colors hover:bg-yellow-400"
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              fill="#191919"
              d="M12 4.44c-4.24 0-7.68 2.89-7.68 6.44 0 2.43 1.58 4.54 3.84 5.62-.28 1-.58 2.11-.82 2.88-.04.13.06.27.19.27.08 0 .15-.04.19-.11l3.9-2.01c.54.08 1.1.12 1.68.12 4.24 0 7.68-2.89 7.68-6.44S16.24 4.44 12 4.44z"
            />
          </svg>
          카카오로 계속하기
        </a>
        {/* Naver 로그인 */}
        <a
          href={`${API_BASE_URL}/login/oauth2/authorization/naver`}
          className="w-full flex items-center justify-center gap-2 bg-[#03C75A] py-3 rounded-xl text-sm font-medium text-white transition-colors hover:bg-green-600"
        >
          {/* Naver 로고 SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            className="w-4 h-4"
          >
            <path d="M4 4h5.5l5 6.5V4H20v16h-5.5l-5-6.5V20H4V4z" />
          </svg>
          네이버로 계속하기
        </a>
        {/* 회원가입 안내 */}
        <p className="text-sm text-gray-500 text-center mt-2">
          계정이 없으신가요?{" "}
          <Link
            to="/signup"
            className="text-purple-600 font-medium hover:underline"
          >
            회원가입
          </Link>
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

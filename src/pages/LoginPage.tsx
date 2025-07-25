import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { logIn } from "../api/authService"
import LoginSignupCard from "../components/common/LoginSignupCard"
import { Mail, LockKeyhole, ArrowLeft } from "lucide-react"
import { useUserStore } from "../store/useUserStore"
import { buildLoginCredentials } from "../utils/authUtils"

const LoginPage = () => {
  const navigate = useNavigate()
  const [loginInput, setLoginInput] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const setUser = useUserStore((state) => state.setUser)    // Zustand 훅 사용

  const handleLogin = async () => {
    setError("")
    const credentials = buildLoginCredentials(loginInput.trim(), password)
    // @의 존재 여부로 이메일과 아이디 구분하여 입력값 확인 가능!

    try {
      const res = await logIn(credentials)
      setUser(res.user) // zustand에 로그인 사용자 저장
      navigate("/")
    } catch (err: any) {
      setError(err.message || "로그인에 실패했습니다.")
    }
  }

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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        {/* 로그인 상태 유지 + 비밀번호 찾기 */}
        <div className="w-full flex justify-between items-center text-sm mb-4">
          <label className="flex items-center gap-2 text-gray-600 text-left">
            <input type="checkbox" className="w-4 h-4" />
            로그인 상태 유지
          </label>
          <button className="text-purple-600 font-medium hover:underline">비밀번호 찾기</button>
        </div>

        {/* 로그인 버튼 */}
        <button
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold"
          onClick={handleLogin}
        >
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
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.322C33.76 32.042 29.369 35 24 35c-6.075 0-11-4.925-11-11s4.925-11 11-11c2.653 0 5.077.976 6.938 2.582l6.045-6.045C33.27 6.337 28.88 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20c11.046 0 20-8.954 20-20 0-1.34-.138-2.651-.389-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.145 16.093 18.727 13 24 13c2.653 0 5.077.976 6.938 2.582l6.045-6.045C33.27 6.337 28.88 4 24 4 16.318 4 9.656 8.531 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c4.737 0 9.055-1.62 12.438-4.348l-5.781-4.89C28.369 35.613 26.261 36 24 36c-5.354 0-9.748-3.525-11.341-8.307l-6.57 5.061C9.622 40.367 16.296 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.322c-1.004 2.728-3.038 5.033-5.665 6.454l.001-.001 5.781 4.89C35.186 40.869 39 37 41.5 32.5c1.468-2.708 2.111-5.933 2.111-9.417 0-1.34-.138-2.651-.389-3.917z"/>
          </svg>

          Google로 계속하기
        </button>

        {/* Kakao 로그인 */}
        <button className="w-full flex items-center justify-center gap-2 bg-yellow-400 py-3 rounded-xl text-sm font-medium text-black mb-6">
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
          카카오로 계속하기
        </button>

        {/* 회원가입 안내 */}
        <p className="text-sm text-gray-500 text-center">
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
  )
}

export default LoginPage

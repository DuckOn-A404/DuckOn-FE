import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { logIn } from "../api/authService"
import LoginSignupCard from "../components/common/LoginSignupCard"
import { Mail, LockKeyhole, ArrowLeft } from "lucide-react"
import { useUserStore } from "../store/useUserStore"

const LoginPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const setUser = useUserStore((state) => state.setUser)    // Zustand 훅 사용

  const handleLogin = async () => {
    setError("")
    try {
      const res = await logIn({ email, password })
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <svg width="20" height="20" viewBox="0 0 48 48">...</svg>
          Google로 계속하기
        </button>

        {/* Kakao 로그인 */}
        <button className="w-full flex items-center justify-center gap-2 bg-yellow-400 py-3 rounded-xl text-sm font-medium text-black mb-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#3c1e1e">...</svg>
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
  )
}

export default LoginPage

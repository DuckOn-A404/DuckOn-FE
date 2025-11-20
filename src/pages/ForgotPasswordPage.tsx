import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetCode, verifyPasswordResetCode, setNewPassword as updatePassword } from "../api/authService";
import LoginSignupCard from "../components/common/LoginSignupCard";
import { Mail, LockKeyhole, ArrowLeft, CheckCircle } from "lucide-react";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  
  // 단계: 1=이메일 입력, 2=인증번호 입력, 3=새 비밀번호 입력
  const [step, setStep] = useState(1);
  
  // 이메일 인증 관련
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // 비밀번호 변경 관련
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // 에러 및 메시지
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 비밀번호 유효성 검사 (8자 이상, 영어+숫자+특문)
  const validatePassword = (password: string): boolean => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= 8 && hasLetter && hasNumber && hasSpecial;
  };

  // 이메일 유효성 검사
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 1단계: 인증번호 발송
  const handleSendCode = async () => {
    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }

    if (!validateEmail(email)) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setIsSendingCode(true);
    try {
      const response = await sendPasswordResetCode(email);
      if (response.sent) {
        setSuccessMessage("인증번호가 발송되었습니다. 이메일을 확인해주세요.");
        setStep(2);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "인증번호 발송에 실패했습니다.");
    } finally {
      setIsSendingCode(false);
    }
  };

  // 2단계: 인증번호 검증 및 JWT 토큰 발급
  const handleVerifyCode = async () => {
    setError("");
    setSuccessMessage("");

    if (!verificationCode.trim()) {
      setError("인증번호를 입력해주세요.");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await verifyPasswordResetCode(email, verificationCode);
      if (response.data?.accessToken && response.data?.refreshToken) {
        // JWT 토큰 저장
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        setSuccessMessage("인증이 완료되었습니다.");
        setStep(3);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "인증번호가 올바르지 않습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  // 3단계: 새 비밀번호 설정
  const handleChangePassword = async () => {
    setError("");
    setSuccessMessage("");

    if (!newPassword || !confirmPassword) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError("비밀번호는 8자 이상, 영어+숫자+특수문자를 포함해야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await updatePassword(newPassword);
      setSuccessMessage("비밀번호가 성공적으로 변경되었습니다.");
      
      // 토큰 제거 (비밀번호 변경 후 다시 로그인해야 함)
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      
      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "비밀번호 변경에 실패했습니다.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-600 to-pink-500">
      <LoginSignupCard>
        {/* 로고 & 문구 */}
        <div className="flex flex-col items-center gap-x-2 mb-10">
          <img className="h-8" src="/logo.svg" alt="Duck On 로고" />
          <p className="text-sm text-gray-600 text-center mt-2">
            비밀번호 찾기
          </p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="flex justify-center items-center mb-8 gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? "bg-purple-600 text-white" : "bg-gray-300 text-gray-600"}`}>
            1
          </div>
          <div className={`w-12 h-1 ${step >= 2 ? "bg-purple-600" : "bg-gray-300"}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? "bg-purple-600 text-white" : "bg-gray-300 text-gray-600"}`}>
            2
          </div>
          <div className={`w-12 h-1 ${step >= 3 ? "bg-purple-600" : "bg-gray-300"}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 3 ? "bg-purple-600 text-white" : "bg-gray-300 text-gray-600"}`}>
            3
          </div>
        </div>

        {/* 1단계: 이메일 입력 */}
        {step === 1 && (
          <>
            <div className="w-full mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="가입한 이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              onClick={handleSendCode}
              disabled={isSendingCode}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:brightness-110 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingCode ? "발송 중..." : "인증번호 발송"}
            </button>
          </>
        )}

        {/* 2단계: 인증번호 입력 */}
        {step === 2 && (
          <>
            <div className="w-full mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            <div className="w-full mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                인증번호
              </label>
              <input
                type="text"
                placeholder="이메일로 받은 인증번호를 입력하세요"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={handleVerifyCode}
              disabled={isVerifying}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:brightness-110 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {isVerifying ? "인증 중..." : "인증번호 확인"}
            </button>

            <button
              onClick={handleSendCode}
              disabled={isSendingCode}
              className="w-full text-purple-600 py-2 text-sm font-medium hover:underline"
            >
              인증번호 재발송
            </button>
          </>
        )}

        {/* 3단계: 새 비밀번호 입력 */}
        {step === 3 && (
          <>
            <div className="w-full mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                새 비밀번호
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="새 비밀번호 (8자 이상, 영어+숫자+특문)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="w-full mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChangePassword()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:brightness-110 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? "변경 중..." : "비밀번호 변경"}
            </button>
          </>
        )}

        {/* 에러 메시지 */}
        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">
            {error}
          </p>
        )}

        {/* 성공 메시지 */}
        {successMessage && (
          <div className="flex items-center justify-center gap-2 text-green-600 text-sm mt-4">
            <CheckCircle size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 로그인 페이지로 돌아가기 */}
        <p className="text-sm text-gray-500 text-center mt-6">
          비밀번호가 기억나셨나요?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-purple-600 font-medium hover:underline"
          >
            로그인
          </button>
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

export default ForgotPasswordPage;

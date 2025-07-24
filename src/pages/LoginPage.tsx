import LoginSignupCard from "../components/common/LoginSignupCard";

type LoginPageProps = {
};

const LoginPage = ({}: LoginPageProps) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-600 to-pink-500">
      <LoginSignupCard>
        <h2 className="text-3xl font-bold text-purple-600 mb-6">로그인</h2>

        {/* 이메일 입력 */}
        <input
          type="text"
          placeholder="이메일 또는 아이디"
          className="w-full p-3 border border-gray-300 rounded-xl mb-4"
        />

        {/* 비밀번호 입력 */}
        <input
          type="password"
          placeholder="비밀번호"
          className="w-full p-3 border border-gray-300 rounded-xl mb-4"
        />

        {/* 로그인 버튼 */}
        <button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold">
          로그인
        </button>

        {/* 기타 */}
        <p className="mt-4 text-sm text-gray-500">
          계정이 없으신가요?{" "}
          <span className="text-purple-600 font-medium cursor-pointer">
            회원가입
          </span>
        </p>
      </LoginSignupCard>
    </div>
  );
};

export default LoginPage;
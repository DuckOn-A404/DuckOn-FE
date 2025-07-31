import { type User } from "../../types";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

type HeaderProps = {
  user: User | null;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
};

/* 
name : Header
summary : User 객체의 존재 여부에 따라 버튼이 구성요소가 달라짐
props
- user : 로그인 여부를 판단하는 User 객체 (현재 임시 index.ts에 User 타입 사용)
- onLogin() : 로그인 페이지로 이동
- onSignup() : 회원가입 페이지로 이동
- onLogout() : 로그아웃 페이지로 이동 
*/
const Header = ({ user, onLogin, onSignup, onLogout }: HeaderProps) => {
  const navigate = useNavigate();
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <nav className="max-w-7xl h-16 mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* 왼쪽: 로고 */}
        <div
          className="flex items-center gap-x-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img className="h-8" src="/logo.svg" alt="Duck On 로고" />
        </div>

        {/* 오른쪽: 사용자 인증 메뉴 */}
        <div className="flex items-center gap-x-3">
          {user ? (
            // 로그인 상태일 때
            <>
              <span
                onClick={() => navigate("/mypage")}
                className="text-sm font-medium text-gray-700 hover:text-purple-600 hover:underline transition-colors duration-200 cursor-pointer"
              >
                {user.nickname} 님
              </span>
              <Button onClick={onLogout} variant="secondary">
                로그아웃
              </Button>
            </>
          ) : (
            // 로그아웃 상태일 때
            <>
              <Button onClick={onLogin} variant="secondary">
                로그인
              </Button>
              <Button onClick={onSignup}>회원가입</Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;

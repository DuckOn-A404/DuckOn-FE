import { type User } from "../../types";
import { useNavigate } from "react-router-dom";
// ✅ 1. 드롭다운 메뉴와 아이콘을 위해 필요한 컴포넌트를 import 합니다.
import { Menu } from "@headlessui/react";
import { ChevronDown } from "lucide-react";

type HeaderProps = {
  user: User | null;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
};

/* name : Header
summary : User 객체의 존재 여부에 따라 버튼이 구성요소가 달라짐
*/
const Header = ({ user, onLogin, onSignup, onLogout }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm shadow-sm">
      <nav className="max-w-7xl h-16 mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* 왼쪽: 로고 */}
        <div
          className="flex items-center gap-x-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img className="h-8" src="/logo.svg" alt="Duck On 로고" />
        </div>

        {/* 오른쪽: 사용자 인증 메뉴 */}
        <div className="flex items-center gap-x-4">
          {user ? (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-gray-100">
                <img
                  src={user.profileImg || "/default_image.png"}
                  alt="프로필 이미지"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-semibold text-gray-800">
                  {user.nickname}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => navigate("/mypage")}
                        className={`${
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                        } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                      >
                        마이페이지
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={onLogout}
                        className={`${
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                        } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                      >
                        로그아웃
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Menu>
          ) : (
            <>
              <button
                onClick={onLogin}
                className="text-sm font-semibold text-gray-600 transition-colors hover:text-purple-600"
              >
                로그인
              </button>
              <button
                onClick={onSignup}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-full shadow-sm transition-all duration-300 hover:bg-purple-700 hover:shadow-md"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;

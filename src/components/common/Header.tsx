import {type User} from "../../types";
import {useNavigate} from "react-router-dom";
import {Menu} from "@headlessui/react";
import {ChevronDown} from "lucide-react";

type HeaderProps = {
  user: User | null;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
};

/* name : Header
summary : User 객체의 존재 여부에 따라 버튼이 구성요소가 달라짐 (디자인만 강화) */
const Header = ({user, onLogin, onSignup, onLogout}: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* 글래스 배경 바 */}
      <div className="bg-white/60 backdrop-blur-md border-b border-white/60 shadow-[0_10px_30px_rgba(0,0,0,.04)]">
        <nav className="max-w-7xl h-16 mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          {/* 로고 */}
          <button
            className="group flex items-center gap-2 outline-none"
            onClick={() => navigate("/")}
            aria-label="DuckOn 홈으로 이동"
          >
            <img className="h-7 w-7" src="/duck.svg" alt="" />
            <span className="font-extrabold tracking-tight text-lg">
              DuckOn
            </span>
            {/* 로고 옆 보조 포인트 */}
            <span className="ml-1 h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 opacity-70 group-hover:opacity-100 transition" />
          </button>

          {/* 우측 영역 */}
          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="group flex items-center gap-2 rounded-full pl-1 pr-2 py-1 transition-all hover:bg-black/5 focus-visible:outline-none">
                  <img
                    src={user.imgUrl || "/default_image.png"}
                    alt="프로필 이미지"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-black/5"
                  />
                  <span className="text-sm font-semibold text-gray-800">
                    {user.nickname}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500 transition-transform group-data-[headlessui-state=open]:rotate-180" />
                </Menu.Button>

                <Menu.Items
                  className="
                    absolute right-0 mt-2 w-48 origin-top-right
                    rounded-xl bg-white/85 backdrop-blur-md
                    shadow-[0_20px_60px_rgba(0,0,0,.12)]
                    border border-white/60
                    focus:outline-none overflow-hidden
                  "
                >
                  <div className="py-1">
                    <Menu.Item>
                      {({active}) => (
                        <button
                          onClick={() => navigate("/mypage")}
                          className={`${active ? "bg-black/5" : ""
                            } w-full px-4 py-2 text-sm text-gray-800 text-left`}
                        >
                          마이페이지
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({active}) => (
                        <button
                          onClick={onLogout}
                          className={`${active ? "bg-black/5" : ""
                            } w-full px-4 py-2 text-sm text-gray-800 text-left`}
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
                {/* 로그인: 그라데이션 언더라인 */}
                <button
                  onClick={onLogin}
                  className="relative text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  로그인
                  <span
                    className="
                      absolute -bottom-1 left-0 h-[2px] w-0
                      bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400
                      transition-all duration-300
                      hover:w-full
                    "
                  />
                </button>

                {/* 회원가입: 그라데이션 + 살짝 뜨는 효과 */}
                <button
                  onClick={onSignup}
                  className="
                    inline-flex items-center justify-center
                    px-4 py-2 rounded-full text-sm font-bold text-white
                    bg-gradient-to-r from-fuchsia-500 to-rose-500
                    shadow-[0_10px_30px_rgba(236,72,153,.25)]
                    hover:shadow-[0_16px_40px_rgba(236,72,153,.35)]
                    hover:-translate-y-0.5 active:translate-y-0
                    transition-all
                  "
                >
                  회원가입
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

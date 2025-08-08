import Header from "../components/common/Header";
import { Outlet, useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";

/**
 * 푸터(Footer)가 없는 페이지를 위한 레이아웃 컴포넌트입니다.
 * 무한 스크롤이 있는 페이지 등에서 사용됩니다.
 */
const LayoutWithoutFooter = () => {
  const navigate = useNavigate();
  const { myUser, setMyUser } = useUserStore();

  const handleLogin = () => navigate("/login");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user-storage");
    setMyUser(null);
    navigate("/");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <Header
        user={myUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSignup={handleSignup}
      />

      {/* 본문: 남은 공간을 모두 채우도록 설정 */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutWithoutFooter;

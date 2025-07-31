// src/layouts/MainLayout.tsx
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { Outlet, useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";

const MainLayout = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore(); // Zustand 훅으로 전역 상태 사용

  const handleLogin = () => navigate("/login");

  const handleLogout = () => {
    localStorage.clear(); // 로컬 스토리지 지우기
    setUser(null); // 전역 상태 초기화
  };

  const handleSignup = () => {
    console.log("회원가입 페이지로 이동");
    navigate("/signup");
  };

  return (
    <div>
      {/* 헤더 */}
      <Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSignup={handleSignup}
      />

      {/* 본문 */}
      <main>
        <Outlet />
      </main>

      {/* 푸터 */}
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;

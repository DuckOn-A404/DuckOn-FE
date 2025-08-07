// src/layouts/MainLayout.tsx
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { Outlet, useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";

const MainLayout = () => {
  const navigate = useNavigate();
  const { myUser, setMyUser } = useUserStore();

  const handleLogin = () => navigate("/login");

  const handleLogout = () => {
    localStorage.clear();
    setMyUser(null);
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <div>
      {/* 헤더 */}
      <Header
        user={myUser}
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

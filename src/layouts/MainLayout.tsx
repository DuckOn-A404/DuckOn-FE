// src/layouts/MainLayout.tsx
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { type User } from "../types";

const MainLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const handleLogin = () => {
    console.log("로그인 시도");
    setUser({
      id: "123",
      name: "홍길동",
      email: "hong@example.com",
    });
    navigate("/login");
  };

  const handleLogout = () => {
    console.log("로그아웃");
    setUser(null);
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
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;

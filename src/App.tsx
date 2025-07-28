import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import ArtistListPage from "./pages/ArtistListPage";
import ArtistDetailPage from "./pages/ArtistDetailPage";
// import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* 공통 레이아웃이 적용되는 페이지들 */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/artist-list" element={<ArtistListPage />} />
            <Route path="/artist/:nameEn" element={<ArtistDetailPage />} />
          </Route>

          {/* 로그인/회원가입 등 공통 레이아웃이 필요 없는 페이지들 */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

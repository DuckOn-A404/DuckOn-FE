import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import ArtistListPage from "./pages/ArtistListPage";
import ArtistDetailPage from "./pages/ArtistDetailPage";
import MyPage from "./pages/MyPage";
import OtherUserPage from "./pages/OtherUserPage";
import LiveRoomPage from "./pages/LiveRoomPage";
import LayoutWithoutFooter from "./layouts/LayoutWithoutFooter";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";
import ScrollToTop from "./components/common/ScrollToTop";
import NotFoundPage from "./pages/NotFoundPage";
// import SmallScreenBlocker from "./components/common/SmallScreenBlocker";
// import RoomListPage from "./pages/RoomListPage";
import { useEffect } from "react";
import { sendPageView } from "./analytics";
import RoomListPage from "./pages/RoomListPage";

function RouteChangeTracker() {
  const loc = useLocation();
  useEffect(() => {
    sendPageView(loc.pathname + loc.search);
  }, [loc.pathname, loc.search]);
  return null; // UI 없음
}

function App() {
  return (
    <>
      <BrowserRouter>
        <RouteChangeTracker />
        <ScrollToTop />
        <Routes>
          {/* 공통 레이아웃이 적용되는 페이지들 */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/artist/:nameEn" element={<ArtistDetailPage />} />
            <Route path="mypage" element={<MyPage />} />
            <Route path="/user/:userId" element={<OtherUserPage />} />
          </Route>

          {/* 푸터가 없는 페이지들 */}
          <Route element={<LayoutWithoutFooter />}>
            {/* <Route path="/room-list" element={<RoomListPage />}></Route> */}
            <Route path="/artist-list" element={<ArtistListPage />} />
            <Route path="/room-list" element={<RoomListPage />} />
          </Route>

          {/* 레이아웃이 필요 없는 페이지들 */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/live/:roomId" element={<LiveRoomPage />} />
          <Route path="oauth2/success" element={<OAuth2RedirectHandler />} />

          {/* 404 페이지 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* <SmallScreenBlocker /> */}
      </BrowserRouter>
    </>
  );
}

export default App;

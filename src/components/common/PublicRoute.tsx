import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";

const PublicRoute = () => {
  const { myUser } = useUserStore();

  // 로그인 상태라면 홈으로 리다이렉트
  if (myUser) {
    return <Navigate to="/" replace />;
  }

  // 비로그인 상태라면 해당 페이지 접근 허용
  return <Outlet />;
};

export default PublicRoute;

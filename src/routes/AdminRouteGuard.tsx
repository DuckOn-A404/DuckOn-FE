// 관리자 페이지는 관리자만 볼 수 있도록 해주는 코드
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { isAdminRole } from "../utils/authRole";

export default function AdminRouteGuard() {
  const user = useUserStore((s) => s.myUser);
  const loc = useLocation();

  if (!isAdminRole(user?.role)) {
    return <Navigate to="/" replace state={{ from: loc.pathname }} />;
  }

  return <Outlet />;
}

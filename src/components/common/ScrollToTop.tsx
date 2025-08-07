import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router
 * 라우터의 경로(URL)가 바뀔 때마다 화면 스크롤을 맨 위로 이동시킵니다.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;

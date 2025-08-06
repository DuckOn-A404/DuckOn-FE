// src/pages/OAuth2RedirectHandler.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { fetchMyProfile } from "../api/userService";

/**
 * 소셜 로그인 성공 후, 백엔드로부터 리다이렉트되는 페이지입니다.
 * 사용자 정보를 가져와 상태를 업데이트하고, 홈페이지로 이동시킵니다.
 */
const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const { setMyUser } = useUserStore();

  useEffect(() => {
    const processLogin = async () => {
      try {
        // 1. 백엔드로부터 내 유저 정보를 가져옵니다.
        //    (백엔드가 쿠키에 토큰을 저장했으므로, 이 요청 시 자동으로 토큰이 함께 전송됩니다)
        const userData = await fetchMyProfile();

        // 2. Zustand 스토어에 유저 정보를 저장하여 로그인 상태로 만듭니다.
        setMyUser(userData);

        // 3. 모든 처리가 끝나면 홈페이지로 이동시킵니다.
        navigate("/");
      } catch (error) {
        console.error("소셜 로그인 처리 중 오류 발생:", error);
        // 에러 발생 시 로그인 페이지로 다시 보냅니다.
        navigate("/login");
      }
    };

    processLogin();
  }, [navigate, setMyUser]);

  // 처리 중 사용자에게 보여줄 로딩 화면
  return (
    <div className="flex justify-center items-center h-screen">
      <p>로그인 처리 중입니다. 잠시만 기다려주세요...</p>
    </div>
  );
};

export default OAuth2RedirectHandler;

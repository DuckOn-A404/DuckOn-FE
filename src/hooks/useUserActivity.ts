import { useEffect, useRef } from "react";
import { useUserStore } from "../store/useUserStore";
import { api, emitTokenRefreshed } from "../api/axiosInstance";
import { logoutUser } from "../api/authService";

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15분
const TOKEN_REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10분

export const useUserActivity = () => {
  const { myUser, logout } = useUserStore();
  const lastActivityTimeRef = useRef(Date.now());

  // 1. 사용자 활동 감지하여 마지막 활동 시간 업데이트
  useEffect(() => {
    // 로그인 상태가 아니면 이벤트 리스너를 달 필요가 없음
    if (!myUser) return;

    // 쓰로틀링: 이벤트를 너무 자주 갱신하지 않도록(1초에 한 번만)
    let throttleTimeout: NodeJS.Timeout | null = null;
    const updateActivity = () => {
      if (throttleTimeout) return;
      
      throttleTimeout = setTimeout(() => {
        lastActivityTimeRef.current = Date.now();
        throttleTimeout = null;
      }, 1000);
    };

    // 감지할 이벤트들
    const events = ["mousemove", "mousedown", "keypress", "touchstart", "scroll"];
    
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [myUser]);

  // 2. 주기적으로 확인 (타이머)
  useEffect(() => {
    // 로그인 상태가 아니면 타이머 동작 안함
    if (!myUser) return;

    const interval = setInterval(async () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTimeRef.current;

      // [A] 활동이 없어서 15분이 지났다면 -> 강제 로그아웃
      if (timeSinceLastActivity >= INACTIVITY_LIMIT_MS) {
        try {
          await logoutUser(); // 백엔드 세션/쿠키 만료 호출
        } catch (e) {
          console.warn("Silent logout fail", e);
        } finally {
          logout(); // 프론트엔드 상태 초기화 (여기서 accessToken 삭제됨)
        }
        return;
      }

      // [B] 유저가 활동 중이라면 -> 토큰을 조용히 갱신 (10분 주기)
      // 토큰 갱신 주기는 setInterval이 1분마다 돌면서, 지난 갱신 이후 10분이 지났는지 확인하는 식으로도 짤 수 있지만,
      // 가장 간단한 건 `setInterval`을 토큰 갱신용으로 따로 분리하거나,
      // 여기서 현재 시간이 토큰 갱신 주기 배수에 도달했는지 체크하는 것입니다.
      // 하지만 가장 직관적인 방법은, 이 인터벌 자체를 1분마다 돌게 하고,
      // 별도의 토큰 갱신용 10분짜리 타이머를 하나 더 두는 것입니다. (아래 3번 참고)

    }, 60 * 1000); // 1분마다 무활동(15분) 체크

    return () => clearInterval(interval);
  }, [myUser, logout]);

  // 3. 토큰 Silent Refresh 전용 타이머 (10분마다 갱신)
  useEffect(() => {
    if (!myUser) return;

    const refreshInterval = setInterval(async () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTimeRef.current;

      // 만약 최근 15분간 활동이 있었다면 토큰 갱신
      // (단, 15분이 넘었다면 어차피 위 2번 타이머에 의해 로그아웃 됨)
      if (timeSinceLastActivity < INACTIVITY_LIMIT_MS) {
        try {
          const resp = await api.post(
            "/auth/refresh",
            {},
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );
          const newAccessToken = resp.data?.data?.accessToken || resp.data?.accessToken;
          
          if (newAccessToken) {
            if (localStorage.getItem("accessToken")) {
              localStorage.setItem("accessToken", newAccessToken);
            } else {
              sessionStorage.setItem("accessToken", newAccessToken);
            }
            emitTokenRefreshed(newAccessToken);
          }
        } catch (e) {
          // 리프레시 실패 시(예: 리프레시 토큰 만료)
          logout();
        }
      }
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => clearInterval(refreshInterval);
  }, [myUser, logout]);
};

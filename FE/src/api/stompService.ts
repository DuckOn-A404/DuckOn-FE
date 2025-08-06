// 실제 STOMP 클라이언트를 생성하고 연결/해제하는 통신 로직
// 순수한 통신 기능만 담당 (엔진 역할)
import { Client } from "@stomp/stompjs";

/**
 * STOMP 클라이언트를 생성하고 기본 설정을 구성하는 함수
 * @param token - 인증에 사용할 Bearer 토큰
 * @returns - 설정이 완료된 STOMP 클라이언트 인스턴스
 */
export const createStompClient = (token: string) => {
  const client = new Client({
    /**
     * brokerURL: 웹소켓 서버의 엔드포인트 주소입니다.
     * 'ws://'는 http, 'wss://'는 https 환경에서 사용되는 프로토콜입니다.
     * SockJS 없이 기본(Native) WebSocket을 직접 사용합니다.
     */
    brokerURL: "ws://localhost:8080/ws",

    /**
     * connectHeaders: STOMP 클라이언트가 서버에 연결을 시도할 때 보낼 헤더입니다.
     * 서버는 이 헤더의 Authorization 토큰을 검증하여 연결을 허용할지 결정합니다.
     */
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    /**
     * debug: STOMP 통신의 모든 내부 동작을 콘솔에 출력하는 콜백 함수입니다.
     * 개발 및 디버깅 시 메시지 흐름을 파악하는 데 매우 유용합니다.
     */
    debug: (str) => {
      console.log(new Date(), str);
    },

    /**
     * reconnectDelay: 네트워크 문제 등으로 연결이 끊어졌을 때,
     * 자동으로 재연결을 시도하기까지의 대기 시간(밀리초 단위)입니다.
     * 1000ms = 1초
     */
    reconnectDelay: 1000,
  });

  return client;
};

import {Client} from "@stomp/stompjs";

export const createStompClient = (
	accessToken: string,
	onConnectCallback?: () => void
): Client => {
	const scheme = window.location.protocol === "https:" ? "wss" : "ws";
	const path = "/ws-chat";
	const socketUrl = `${scheme}://${window.location.host}${path}?token=${accessToken}`;

	const client = new Client({
		webSocketFactory: () => new WebSocket(socketUrl),
		reconnectDelay: 5000,
		debug: (str) => console.log("[STOMP]", str),
		onConnect: () => {
			console.log("STOMP 연결 성공");
			onConnectCallback?.();
		},
	});

	return client;
};

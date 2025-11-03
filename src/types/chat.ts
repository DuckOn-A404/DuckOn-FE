// // 보낼 때
// export interface ChatMessageRequest {
//   roomId: string;
//   senderId: string;
//   senderName: string;
//   content: string;
//   timestamp?: string;
//   chatType: "TALK" | "ENTER" | "EXIT";
// }

// // 받을 때
// export interface ChatMessage {
//   roomId: number;
//   senderId: string;
//   senderNickName: string;
//   content: string;
//   sentAt: string;

//   chatType?: "TALK" | "ENTER" | "EXIT";
// }


// 보낼 때
export interface ChatMessageRequest {
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp?: string;
  chatType: "TALK" | "ENTER" | "EXIT";
  /** ✅ 선택: 이미지 URL 전송 시 true */
  isImage?: boolean;
}

// 받을 때
export interface ChatMessage {
  roomId: number;
  senderId: string;
  senderNickName: string;
  content: string;
  sentAt: string;

  chatType?: "TALK" | "ENTER" | "EXIT";

  /** ✅ 서버에서 내려주는 이미지 여부(있으면 ChatPanel이 <img>로 렌더) */
  isImage?: boolean;
}

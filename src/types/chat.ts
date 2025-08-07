// 보낼 때
export interface ChatMessageRequest {
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp?: string;
  chatType: "TALK" | "ENTER" | "EXIT";
}

// 받을 때
export interface ChatMessage {
  messageId: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  chatType: "TALK" | "ENTER" | "EXIT";
}

import type { UserRank } from "./rank";

export type artistChatMessage = {
  messageId: string;
  userId: string;
  userNickname: string;
  content: string;
  sentAt: string;

  userRank?: UserRank;
};

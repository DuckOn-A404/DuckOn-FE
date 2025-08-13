import type { RoomHistory, trendingRoom } from "./room";

export type OtherUser = {
  userId: string;
  nickname: string;
  imgUrl?: string | null;
  followerCount: number;
  followingCount: number;
  following: boolean;

  roomList?: RoomHistory[];          // BE에서 내려줌
  activeRoom?: trendingRoom | null;  // BE에서 내려줌
};

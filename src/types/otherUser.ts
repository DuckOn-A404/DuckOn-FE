import type { trendingRoom } from "./room";
import type { UserRank } from "./rank";

export type OtherUser = {
  userId: string;
  nickname: string;
  imgUrl?: string | null;
  followerCount: number;
  followingCount: number;
  following: boolean;  // 로그인한 사용자가 이 유저를 팔로우하고 있는지

  activeRoom?: trendingRoom | null;  // BE에서 내려줌

  userRank?: UserRank;
};

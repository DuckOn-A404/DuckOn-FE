import type { UserRank } from "./rank";

export type FollowUser = {
  userId: string;
  nickname: string;
  profileImg: string | null;  // ← null 허용
  profileImgUrl?: string | null;
  following?: boolean;        // 팔로워 목록일 때만 내려올 수 있음

  userRank?: UserRank;
  userRankDTO?: UserRank;
};

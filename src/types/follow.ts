export type FollowUser = {
  userId: string;
  nickname: string;
  profileImg: string | null;  // ← null 허용
  following?: boolean;        // 팔로워 목록일 때만 내려올 수 있음
};

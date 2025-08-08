export type FollowUser = {
    userId: string;
    nickname: string;
    profileImg: string;
    following?: boolean;    // 선택적으로 팔로워 목록만 해당
}
export type FollowerUser = {
    userId: string;
    nickname: string;
    profileImg: string;
    following: boolean; // 내가 이 사람을 팔로우하는가
}

export type FollowingUser = {
    userId: string;
    nickname: string;
    profileImg: string;
    // following은 포함되지 않음
}
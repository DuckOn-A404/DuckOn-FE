export type OtherUser = {
    userId: string;
    nickname: string;
    followerCount: number;
    followingCount: number;
    imgUrl?: string;
    following?: boolean;
}
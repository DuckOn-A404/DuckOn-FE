export type MyUser = {
    userId: string;
    email: string;
    password: string;   // 사용자 비밀번호(해시값)
    nickname: string;
    artistList?: number[];  // 선호 아티스트 id 객체 목록
    language: string;
    role: "ADMIN" | "USER";
    followingCount: number; // 팔로잉 수(내가 팔로우한 사용자 수)
    followerCount: number;  // 팔로워 수(나를 팔로우한 사용자 수)
    bannedTill?: string;    // 제재 당한 사용자라면 언제까지인지 날짜
    imgUrl?: string;
    roomList?: any[];
    penaltyList: any[];
}
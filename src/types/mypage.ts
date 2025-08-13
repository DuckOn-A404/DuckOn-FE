export type MyUser = {
  userId: string;
  email: string;
  password: string; // 사용자 비밀번호(해시값)
  nickname: string;
  artistList?: number[];
  language: string;
  role: "ADMIN" | "USER";
  followingCount: number;
  followerCount: number;
  bannedTill?: string; // 제재 당한 사용자라면 언제까지인지 날짜
  imgUrl?: string;
  roomList?: RoomHistory[];   // 내가 만든 방 히스토리
  penaltyList: any[];
  socialLogin?: boolean
};

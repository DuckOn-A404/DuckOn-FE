// 임의로 User type 선언 -> 이건 API명세서 따라서 가져온겁니다.
export type User = {
  email: string;
  userId: string;
  nickname: string;
  role: 'ADMIN' | 'USER' | 'BANNED';
  artistList: number[];
  bannedTill?: string;
  profileImg?: string;
};

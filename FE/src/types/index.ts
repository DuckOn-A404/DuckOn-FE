export type User = {
  email: string;
  userId: string;
  nickname: string;
  role: "ADMIN" | "USER" | "BANNED";
  artistList: number[];
  bannedTill?: string;
  imgUrl?: string;
};

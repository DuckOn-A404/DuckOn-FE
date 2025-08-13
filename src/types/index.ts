/*
  일반 User 타입
*/
export type User = {
  email: string;
  userId: string;
  nickname: string;
  role: "ADMIN" | "USER" | "BANNED";
  artistList: number[];
  bannedTill?: string;
  imgUrl?: string;
  language: string;
};

/**
 * 추천 유저의 데이터 타입을 정의합니다.
 * API 응답에 맞춰 속성을 추가하거나 수정하세요.
 */
export interface RecommendedUser {
  userId: string;
  nickname: string;
  imgUrl: string | null;
  mutualFollows: number;
  reasons: string[];
  following: boolean;
}

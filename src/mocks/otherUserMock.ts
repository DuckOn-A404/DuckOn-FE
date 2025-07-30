// 테스트용 더미 데이터
import type { FollowerUser, FollowingUser } from "../types/follow";
import type { MyUser } from "../types/mypage";

export const mockOtherUsers: MyUser[] = [
  {
    email: "blackpinklover@example.com",
    userId: "user_12855a6a",
    nickname: "블핑사랑해",
    role: "USER",
    artistList: [],
    bannedTill: undefined,
    profileImg: "/default_image.png",
    followerCount: 1,
    followingCount: 0,
    language: "ko",
    password: "1234"
  },
  {
    email: "kpopmaster@example.com",
    userId: "june01",
    nickname: "케이팝 고인물",
    role: "USER",
    artistList: [],
    bannedTill: undefined,
    profileImg: "/default_image.png",
    followerCount: 152,
    followingCount: 45,
    language: "en",
    password: "1234"
  }
];

export const followerMock: FollowerUser[] = [
  {
    userId: "iu001",
    nickname: "아이유",
    profileImg: "/default_image.png",
    following: true,
  },
  {
    userId: "bts002",
    nickname: "방탄소년단",
    profileImg: "/default_image.png",
    following: false,
  },
];

export const followingMock: FollowingUser[] = [
  {
    userId: "blackpink003",
    nickname: "블랙핑크",
    profileImg: "/default_image.png",
  },
  {
    userId: "newjeans004",
    nickname: "뉴진스",
    profileImg: "/default_image.png",
  },
];
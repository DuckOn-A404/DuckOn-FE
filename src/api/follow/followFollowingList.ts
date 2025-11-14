import { api } from "../axiosInstance";
import type { FollowUser } from "../../types/follow";

const token = localStorage.getItem("accessToken") || "";

// 팔로워 목록 조회
export const fetchFollowList = async (): Promise<FollowUser[]> => {
  const res = await api.get("/me/followers", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.followers.map((user: any) => ({
    userId: user.userId,
    nickname: user.nickname,
    // 서버가 주는 두 가지 다 살려서 넘김
    profileImg: user.profileImg ?? null,
    profileImgUrl: user.profileImgUrl ?? null,
    following: user.following,

    // 여기서 잘라먹지 말고 그대로 올려보내야 모달에서 쓸 수 있음
    userRank: user.userRank ?? undefined,
    userRankDTO: user.userRankDTO ?? undefined,
  }));
};

// 팔로잉 목록 조회
export const fetchFollowingList = async (): Promise<FollowUser[]> => {
  const res = await api.get("/me/following", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.following.map((user: any) => ({
    userId: user.userId,
    nickname: user.nickname,
    profileImg: user.profileImg ?? null,
    profileImgUrl: user.profileImgUrl ?? null,
    following: true,

    // 팔로잉 쪽은 보통 userRank로 오겠지만 혹시 DTO로 와도 살려둠
    userRank: user.userRank ?? undefined,
    userRankDTO: user.userRankDTO ?? undefined,
  }));
};

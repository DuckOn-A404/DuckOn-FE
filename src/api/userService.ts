import { api, getRefreshToken, getAccessToken } from "./axiosInstance";
import { type MyUser } from "../types/mypage";
import { type RecommendedUser } from "../types";
import type { OtherUser } from "../types/otherUser";
import type { RoomHistory } from "../types/room";
import { useUserStore } from "../store/useUserStore";

export type BlockedUser = {
  userId: string;
  nickname: string;
  imgUrl: string | null;
};

type ApiMessage = { message: string };

// 현재 사용자 정보 조회
export const fetchMyProfile = async (): Promise<MyUser> => {
  const response = await api.get<MyUser>("/me");
  return response.data;
};

// 특정 유저의 방 생성 목록 조회 (페이지네이션 지원)
export type UserRoomsResponse = {
  page: number;
  size: number;
  total: number;
  roomList: RoomHistory[];
};

export const fetchUserRooms = async (
  userId: string,
  page: number = 1,
  size: number = 10
): Promise<UserRoomsResponse> => {
  const response = await api.get(`/users/${userId}/rooms`, {
    params: { page, size }
  });
  const data = response.data?.data;
  return {
    page: data?.page ?? page,
    size: data?.size ?? size,
    total: data?.total ?? 0,
    roomList: data?.roomList ?? []
  };
};

// 타 유저 정보 조회
export const fetchOtherUserProfile = async (
  otherUserId: string,
  myUserIdOrNull?: string | null
): Promise<OtherUser> => {
  const params = myUserIdOrNull ? { myUserIdOrNull } : {};
  const response = await api.get<OtherUser>(`/users/${otherUserId}`, { params });
  return response.data;
};

/** 비밀번호 확인 API */
export const verifyPassword = async (password: string): Promise<boolean> => {
  try {
    const response = await api.post("/me/verify-password", { password });
    return response.data.valid === true;
  } catch (error) {
    console.error("비밀번호 검증 실패", error);
    throw error;
  }
};

/** 유저 프로필 수정 API */
export const updateUserProfile = async (
  formData: FormData
): Promise<MyUser> => {
  const fd = new FormData();
  for (const [key, value] of formData.entries()) {
    if (key === "profileImg") {
      if (value instanceof File && value.size > 0) fd.append("profileImg", value);
      continue;
    }
    if (typeof value === "string") {
      const v = value.trim();
      if (v !== "") fd.append(key, v);
      continue;
    }
    fd.append(key, value as any);
  }
  const res = await api.patch<MyUser>("/me", fd);
  return res.data;
};

/** 비밀번호 변경 API */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ status: number; message: string }> => {
  const response = await api.patch("/me/password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};

/** 차단된 사용자 목록 조회 */
export const getBlockedUsers = async (): Promise<BlockedUser[]> => {
  const token = getAccessToken();
  if (!token) return [];

  try {
    const res = await api.get("/block");
    const raw = res.data;
    const list =
      raw?.blockedList ??
      raw?.data?.blockedList ??
      raw ?? [];
    return (list as any[]).map((d) => ({
      userId: String(d.userId),
      nickname: d.nickname ?? "",
      imgUrl: d.imgUrl ?? null,
    }));
  } catch {
    return [];
  }
};

/** 차단 */
export const blockUser = async (
  userId: string
): Promise<{ message: string }> => {
  try {
    const response = await api.post(`/block/${encodeURIComponent(String(userId))}`, {});

    // 1. 즉시 로컬 반영
    const store = useUserStore.getState();
    store.blockLocal(userId);

    // 2. 서버 목록으로 재동기화
    const list = await getBlockedUsers();
    store.setBlockedList(list.map((u) => u.userId));

    return response.data;
  } catch (error) {
    console.error("사용자 차단 API 호출 실패:", error);
    throw error;
  }
};

/** 차단 해제 */
export const unblockUser = async (userId: string): Promise<string> => {
  const { data } = await api.delete(`/block/${encodeURIComponent(String(userId))}`);

  // 1. 즉시 로컬 반영
  const store = useUserStore.getState();
  store.unblockLocal(userId);

  // 2. 서버 목록으로 재동기화
  const list = await getBlockedUsers();
  store.setBlockedList(list.map((u) => u.userId));

  return data?.message ?? "사용자를 차단 해제하였습니다.";
};

/** 회원 탈퇴 */
export const deleteMyAccount = async (
  refreshOverride?: string
): Promise<ApiMessage> => {
  const refresh = refreshOverride ?? getRefreshToken();
  if (!refresh)
    throw new Error("리프레시 토큰이 없어 회원탈퇴 요청을 보낼 수 없습니다.");

  const res = await api.delete<ApiMessage>("/me", {
    headers: { "X-Refresh-Token": refresh },
  });
  return res.data;
};

/** 비슷한 유저 추천 */
export const getRecommendedUsers = async (
  artistId?: number,
  size: number = 10,
  includeReasons: boolean = false
): Promise<RecommendedUser[]> => {
  const response = await api.get<{ users: RecommendedUser[] }>(
    "/users/recommendations",
    {
      params: { artistId, size, includeReasons },
    }
  );
  return response.data.users ?? [];
};

/** 리더보드 조회 */
export interface LeaderboardUser {
  nickname: string;
  userId: string;
  profileImgUrl: string;
  userRank: {
    roomCreateCount: number;
    rankLevel: "VIP" | "GOLD" | "PURPLE" | "YELLOW" | "GREEN";
  };
}

export interface LeaderboardResponse {
  status: number;
  message: string;
  data: LeaderboardUser[];
}

export const getUserLeaderboard = async (
  page: number = 0,
  size: number = 50
): Promise<LeaderboardResponse> => {
  const response = await api.get<LeaderboardResponse>("/users/leaderboard", {
    params: { page, size },
  });
  return response.data;
};

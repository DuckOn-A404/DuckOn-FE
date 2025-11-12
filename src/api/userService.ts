// import { api, getRefreshToken } from "./axiosInstance";
// import { type MyUser } from "../types/mypage";
// import { type RecommendedUser } from "../types";
// import type { OtherUser } from "../types/otherUser";
// import { getAccessToken } from "./axiosInstance";

// export type BlockedUser = {
//   userId: string;
//   nickname: string;
//   imgUrl: string | null;
// };

// type ApiMessage = { message: string };

// // 현재 사용자 정보 조회
// export const fetchMyProfile = async (): Promise<MyUser> => {
//   const response = await api.get<MyUser>("/users/me");
//   return response.data;
// };

// // 타 유저 정보 조회
// export const fetchOtherUserProfile = async (
//   userId: string
// ): Promise<OtherUser> => {
//   const response = await api.get<OtherUser>(`/users/${userId}`);
//   return response.data;
// };

// /**
//  * 비밀번호 확인 API (비밀번호가 맞는지 서버에서 검증)
//  * @param password 입력한 현재 비밀번호
//  * @returns 성공 시 true, 실패 시 예외 발생
//  */
// export const verifyPassword = async (password: string): Promise<boolean> => {
//   try {
//     const response = await api.post("/users/me/verify-password", { password });
//     return response.data.valid === true;
//   } catch (error) {
//     console.error("비밀번호 검증 실패", error);
//     throw error;
//   }
// };

// /**
//  * 유저 프로필 수정 API
//  * 백엔드 명세에 따라 multipart/form-data 형식으로 요청
//  * profileImg는 파일 전송용이고, 나머지는 일반 string
//  * 그래도 넘어가는건 formData 형식으로 넘어가게 될것
//  *
//  * @param formData - FormData 객체(nickname, language, oldPassword, newPassword, profileImg)
//  * @returns 백엔드에서 응답받은 수정된 유저 정보 객체
//  */
// // export const updateUserProfile = async (
// //   formData: FormData
// // ): Promise<MyUser> => {
// //   const response = await api.patch("/users/me", formData);
// //   return response.data;
// // };

// export const updateUserProfile = async (
//   formData: FormData
// ): Promise<MyUser> => {
//   const fd = new FormData();
//   for (const [key, value] of formData.entries()) {
//     if (key === "profileImg") {
//       if (value instanceof File && value.size > 0)
//         fd.append("profileImg", value);
//       continue; // 비어있으면 절대 전송하지 않음
//     }
//     if (typeof value === "string") {
//       const v = value.trim();
//       if (v !== "") fd.append(key, v);
//       continue;
//     }
//     fd.append(key, value as any);
//   }
//   const res = await api.patch<MyUser>("/users/me", fd);
//   return res.data;
// };

// /**
//  * 차단한 사용자 목록을 가져오는 API 함수
//  * @returns 차단된 사용자 목록 배열
//  */
// // export const getBlockedUsers = async (): Promise<BlockedUser[]> => {
// //   const token = getAccessToken();

// //   if (!token) return [];

// //   try {
// //     const response = await api.get("/block");
// //     return response.data.blockedList || [];
// //   } catch {
// //     return [];
// //   }
// // };

// export const getBlockedUsers = async (): Promise<BlockedUser[]> => {
//   const token = getAccessToken();
//   if (!token) return [];

//   try {
//     const res = await api.get("/block");
//     const raw = res.data;
//     const list =
//       raw?.blockedList ??
//       raw?.data?.blockedList ??
//       raw ?? [];
//     return (list as any[]).map((d) => ({
//       userId: String(d.userId),
//       nickname: d.nickname ?? "",
//       imgUrl: d.imgUrl ?? null,
//     }));
//   } catch {
//     return [];
//   }
// };

// /** 차단 해제 */
// // export const unblockUser = async (userId: string): Promise<string> => {
// //   const { data } = await api.delete(`/block/${userId}`);
// //   return data?.message ?? "사용자를 차단 해제하였습니다.";
// // };

// export const unblockUser = async (userId: string): Promise<string> => {
//   const { data } = await api.delete(`/block/${encodeURIComponent(String(userId))}`);
//   return data?.message ?? "사용자를 차단 해제하였습니다.";
// };

// /**
//  * 회원 탈퇴를 위한 API 함수
//  * @param userId - 차단할 사용자의 ID
//  * @returns 성공 메시지
//  */
// // export const blockUser = async (
// //   userId: string
// // ): Promise<{ message: string }> => {
// //   try {
// //     const response = await api.post(`/block/${userId}`);

// //     return response.data;
// //   } catch (error) {
// //     console.error("사용자 차단 API 호출에 실패했습니다:", error);
// //     throw error;
// //   }
// // };

// export const blockUser = async (
//   userId: string
// ): Promise<{ message: string }> => {
//   try {
//     const response = await api.post(`/block/${encodeURIComponent(String(userId))}`, {}); // {} 중요
//     return response.data;
//   } catch (error) {
//     console.error("사용자 차단 API 호출에 실패했습니다:", error);
//     throw error;
//   }
// };

// // 회원탈퇴: DELETE /users/me (X-Refresh-Token 필수)
// export const deleteMyAccount = async (
//   refreshOverride?: string
// ): Promise<ApiMessage> => {
//   const refresh = refreshOverride ?? getRefreshToken();
//   if (!refresh)
//     throw new Error("리프레시 토큰이 없어 회원탈퇴 요청을 보낼 수 없습니다.");

//   const res = await api.delete<ApiMessage>("/users/me", {
//     headers: { "X-Refresh-Token": refresh },
//   });
//   return res.data;
// };

// /**
//  * 특정 아티스트 기반으로 비슷한 취향의 유저를 추천받는 API 함수
//  * - 로그인 상태면 Authorization 헤더 자동 첨부
//  * - 비로그인 상태면 헤더 없이 공개 호출
//  */
// export const getRecommendedUsers = async (
//   artistId?: number,
//   size: number = 10,
//   includeReasons: boolean = false
// ): Promise<RecommendedUser[]> => {
//   const response = await api.get<{ users: RecommendedUser[] }>(
//     "/users/recommendations",
//     {
//       params: { artistId, size, includeReasons },
//     }
//   );
//   return response.data.users ?? [];
// };

// // 리더보드 유저 타입
// export interface LeaderboardUser {
//   nickname: string;
//   userId: string;
//   profileImgUrl: string;
//   userRank: {
//     roomCreateCount: number;
//     rankLevel: "VIP" | "GOLD" | "PURPLE" | "YELLOW" | "GREEN";
//   };
// }

// // 리더보드 응답 타입
// export interface LeaderboardResponse {
//   status: number;
//   message: string;
//   data: LeaderboardUser[];
// }

// // 유저 리더보드 조회
// export const getUserLeaderboard = async (
//   page: number = 0,
//   size: number = 50
// ): Promise<LeaderboardResponse> => {
//   const response = await api.get<LeaderboardResponse>("/users/leaderboard", {
//     params: { page, size },
//   });
//   return response.data;
// };

import { api, getRefreshToken, getAccessToken } from "./axiosInstance";
import { type MyUser } from "../types/mypage";
import { type RecommendedUser } from "../types";
import type { OtherUser } from "../types/otherUser";
import { useUserStore } from "../store/useUserStore"; // ✅ 추가

export type BlockedUser = {
  userId: string;
  nickname: string;
  imgUrl: string | null;
};

type ApiMessage = { message: string };

// 현재 사용자 정보 조회
export const fetchMyProfile = async (): Promise<MyUser> => {
  const response = await api.get<MyUser>("/users/me");
  return response.data;
};

// 타 유저 정보 조회
export const fetchOtherUserProfile = async (
  userId: string
): Promise<OtherUser> => {
  const response = await api.get<OtherUser>(`/users/${userId}`);
  return response.data;
};

/** 비밀번호 확인 API */
export const verifyPassword = async (password: string): Promise<boolean> => {
  try {
    const response = await api.post("/users/me/verify-password", { password });
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
  const res = await api.patch<MyUser>("/users/me", fd);
  return res.data;
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

/** ✅ 차단 */
export const blockUser = async (
  userId: string
): Promise<{ message: string }> => {
  try {
    const response = await api.post(`/block/${encodeURIComponent(String(userId))}`, {});

    // 🔹 1. 즉시 로컬 반영
    const store = useUserStore.getState();
    store.blockLocal(userId);

    // 🔹 2. 서버 목록으로 재동기화
    const list = await getBlockedUsers();
    store.setBlockedList(list.map((u) => u.userId));

    return response.data;
  } catch (error) {
    console.error("사용자 차단 API 호출 실패:", error);
    throw error;
  }
};

/** ✅ 차단 해제 */
export const unblockUser = async (userId: string): Promise<string> => {
  const { data } = await api.delete(`/block/${encodeURIComponent(String(userId))}`);

  // 🔹 1. 즉시 로컬 반영
  const store = useUserStore.getState();
  store.unblockLocal(userId);

  // 🔹 2. 서버 목록으로 재동기화
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

  const res = await api.delete<ApiMessage>("/users/me", {
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

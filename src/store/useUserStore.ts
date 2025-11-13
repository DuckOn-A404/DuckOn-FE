// // store/useUserStore.ts
// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import type { User } from "../types";
// import { emitTokenRefreshed } from "../api/axiosInstance";
// import { getBlockedUsers } from "../api/userService";

// // 공용 유틸 (이미지 보존용)
// const isEmpty = (v: unknown) =>
//   v === undefined || v === null || (typeof v === "string" && v.trim() === "");

// const lastImgKey = (userId: string) => `last-img:${userId}`;
// const saveLastImg = (userId?: string, url?: string) => {
//   if (!userId) return;
//   if (!isEmpty(url)) localStorage.setItem(lastImgKey(userId), String(url));
// };
// const loadLastImg = (userId?: string): string | undefined => {
//   if (!userId) return undefined;
//   const v = localStorage.getItem(lastImgKey(userId)) || undefined;
//   return v && v.trim() !== "" ? v : undefined;
// };

// type UserState = {
//   myUser: User | null; // 내 정보
//   otherUser: User | null; // 타 유저 정보
//   setMyUser: (user: User | null) => void;
//   setOtherUser: (user: User | null) => void;

//   // 전역 차단 상태
//   blockedSet: Set<string>;
//   setBlockedList: (ids: string[]) => void;
//   blockLocal: (userId: string) => void;
//   unblockLocal: (userId: string) => void;
  
  

//   logout: () => void;
// };

// export const useUserStore = create<UserState>()(
//   persist(
//     (set) => ({
//       myUser: null,
//       otherUser: null,

//       // 어디서든 setMyUser 호출 시 이미지 보존/복구
//       setMyUser: (user) =>
//         set((state) => {
//           if (user == null) return { myUser: null };

//           const prev = state.myUser as any;
//           const uid = (user as any).userId ?? prev?.userId;
//           const incomingImg = (user as any).imgUrl;

//           // 유효한 imgUrl이 오면 그대로, 아니면 이전/캐시 이미지로 복구
//           const fallbackImg = prev?.imgUrl ?? loadLastImg(uid);
//           const nextImg = !isEmpty(incomingImg) ? incomingImg : fallbackImg;

//           const next = { ...prev, ...user, imgUrl: nextImg } as any;

//           if (!isEmpty(nextImg)) saveLastImg(uid, nextImg);

//           return { myUser: next };
//         }),

//       setOtherUser: (user) => set({ otherUser: user }),

//       // 전역 차단 상태 (항상 Set 유지)
//       blockedSet: new Set<string>(),
//       setBlockedList: (ids) => set({ blockedSet: new Set(ids) }),
//       blockLocal: (userId) =>
//         set((s) => {
//           const ns = new Set(s.blockedSet);
//           ns.add(userId);
//           return { blockedSet: ns };
//         }),
//       unblockLocal: (userId) =>
//         set((s) => {
//           const ns = new Set(s.blockedSet);
//           ns.delete(userId);
//           return { blockedSet: ns };
//         }),

//       logout: () => {
//         localStorage.removeItem("accessToken");
//         localStorage.removeItem("refreshToken");
//         emitTokenRefreshed(null);
//         // last-img 캐시는 남겨둠(다음 로그인 복원용)
//         set({ myUser: null, otherUser: null, blockedSet: new Set() });
//       },
//     }),
//     {
//       name: "user-storage",

//       partialize: (state) => ({
//         ...state,
//         blockedSet: Array.from(state.blockedSet),
//       }),

//       merge: (persisted, current) => {
//         const p = persisted as any;
//         return {
//           ...current,
//           ...p,
//           blockedSet: new Set(p?.blockedSet ?? []),
//         } as UserState;
//       },
//     }
//   )
// );


import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";
import { emitTokenRefreshed } from "../api/axiosInstance";
import { getBlockedUsers } from "../api/userService";

// 공용 유틸 (이미지 보존용)
const isEmpty = (v: unknown) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "");

const lastImgKey = (userId: string) => `last-img:${userId}`;
const saveLastImg = (userId?: string, url?: string) => {
  if (!userId) return;
  if (!isEmpty(url)) localStorage.setItem(lastImgKey(userId), String(url));
};
const loadLastImg = (userId?: string): string | undefined => {
  if (!userId) return undefined;
  const v = localStorage.getItem(lastImgKey(userId)) || undefined;
  return v && v.trim() !== "" ? v : undefined;
};

type UserState = {
  myUser: User | null; // 내 정보
  otherUser: User | null; // 타 유저 정보
  setMyUser: (user: User | null) => void;
  setOtherUser: (user: User | null) => void;

  // 전역 차단 상태
  blockedSet: Set<string>;
  setBlockedList: (ids: (string | number)[]) => void; // 응답 타입 혼재 대비
  blockLocal: (userId: string | number) => void;
  unblockLocal: (userId: string | number) => void;
  refreshBlockedList: () => Promise<void>;

  logout: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      myUser: null,
      otherUser: null,

      // 어디서든 setMyUser 호출 시 이미지 보존/복구
      setMyUser: (user) =>
        set((state) => {
          if (user == null) return { myUser: null };

          const prev = state.myUser as any;
          const uid = (user as any).userId ?? prev?.userId;
          const incomingImg = (user as any).imgUrl;

          // --- guest 유저라면 guest id를 세션에 저장해서 채팅에서 재사용 ---
          if (uid && String(uid).startsWith("guest:")) {
            try {
              if (typeof window !== "undefined") {
                sessionStorage.setItem("duckon_guest_id", String(uid));
              }
            } catch {
              // 세션 접근 불가한 환경이면 그냥 무시
            }
          }

          // 유효한 imgUrl이 오면 그대로, 아니면 이전/캐시 이미지로 복구
          const fallbackImg = prev?.imgUrl ?? loadLastImg(uid);
          const nextImg = !isEmpty(incomingImg) ? incomingImg : fallbackImg;

          const next = { ...prev, ...user, imgUrl: nextImg } as any;

          if (!isEmpty(nextImg)) saveLastImg(uid, nextImg);

          return { myUser: next };
        }),

      setOtherUser: (user) => set({ otherUser: user }),

      // 전역 차단 상태 (항상 Set 유지)
      blockedSet: new Set<string>(),
      setBlockedList: (ids) =>
        set({ blockedSet: new Set(ids.map((v) => String(v))) }),
      blockLocal: (userId) =>
        set((s) => {
          const ns = new Set(s.blockedSet);
          ns.add(String(userId));
          return { blockedSet: ns };
        }),
      unblockLocal: (userId) =>
        set((s) => {
          const ns = new Set(s.blockedSet);
          ns.delete(String(userId));
          return { blockedSet: ns };
        }),

      // 서버 재동기화
      refreshBlockedList: async () => {
        const list = await getBlockedUsers();
        set({ blockedSet: new Set(list.map((u) => String(u.userId))) });
      },

      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        emitTokenRefreshed(null);
        // last-img 캐시는 남겨둠(다음 로그인 복원용)
        try {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("duckon_guest_id");
          }
        } catch {
          // 세션 접근 불가면 무시
        }
        set({ myUser: null, otherUser: null, blockedSet: new Set() });
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        ...state,
        blockedSet: Array.from(state.blockedSet), // Set 직렬화
      }),
      merge: (persisted, current) => {
        const p = persisted as any;
        return {
          ...current,
          ...p,
          blockedSet: new Set(p?.blockedSet ?? []), // Set 복원
        } as UserState;
      },
    }
  )
);

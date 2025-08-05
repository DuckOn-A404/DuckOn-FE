// src/store/useUserStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types';

type UserState = {
  myUser: User | null // 내 정보
  otherUser: User | null  // 타 유저 정보
  setMyUser: (user: User | null) => void
  setOtherUser: (user: User | null) => void
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      myUser: null,
      otherUser: null,
      setMyUser: (user) => set({ myUser: user }),
      setOtherUser: (user) => set({ otherUser: user }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

import { create } from "zustand";
import { getFollowedArtists } from "../api/artistService";
import { type Artist } from "../types/artist";

/* 
FollowState - 아티스트 팔로우 기능과 관련된 상태 정의

- followedArtists: 현재 사용자가 팔로우한 아티스트 목록
- isFollowing: 특정 artistId가 팔로우되어 있는지를 빠르게 확인하기 위한 Set
- isLoading: 팔로우 목록을 불러오는 중인지 여부
- hasLoaded: 최소 한 번은 서버에서 목록을 가져왔는지 여부
- error: 에러 발생 시 메시지 저장
- fetchFollowedArtists: 서버에서 팔로우한 아티스트 목록을 가져오는 함수
- addFollow: 새로운 아티스트를 팔로우 상태에 추가하는 함수
- removeFollow: 특정 아티스트를 팔로우 목록에서 제거하는 함수
- clearFollows: 팔로우 관련 상태를 초기화하는 함수 (ex. 로그아웃 시)
*/
type FollowState = {
  followedArtists: Artist[];
  isFollowing: Set<number>;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchFollowedArtists: () => Promise<void>;
  addFollow: (artist: Artist) => void;
  removeFollow: (artistId: number) => void;
  clearFollows: () => void;
};

export const useArtistFollowStore = create<FollowState>((set, get) => ({
  followedArtists: [],
  isFollowing: new Set(),
  isLoading: false,
  hasLoaded: false,
  error: null,

  // 팔로우 목록 불러오기 액션
  fetchFollowedArtists: async () => {
    // 이미 불러왔거나, 현재 로딩 중이면 다시 호출 안 함
    if (get().hasLoaded || get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const response = await getFollowedArtists(1, 500);
      const artists: Artist[] = response.artistList || [];
      const artistIdSet = new Set(artists.map((artist) => artist.artistId));

      set({
        followedArtists: artists,
        isFollowing: artistIdSet,
        isLoading: false,
        hasLoaded: true,
      });
    } catch (err) {
      set({
        isLoading: false,
        hasLoaded: true, // 실패했어도 '시도는 했다' 상태
        error: "팔로우 목록을 불러오는 데 실패했습니다.",
      });
    }
  },

  // 액션: UI 즉시 반영을 위해 스토어에 팔로우 아티스트 추가
  addFollow: (artist) => {
    set((state) => ({
      followedArtists: [...state.followedArtists, artist],
      isFollowing: new Set(state.isFollowing).add(artist.artistId),
    }));
  },

  // 액션: UI 즉시 반영을 위해 스토어에서 언팔로우 아티스트 제거
  removeFollow: (artistId) => {
    set((state) => {
      const newFollowingSet = new Set(state.isFollowing);
      newFollowingSet.delete(artistId);
      return {
        followedArtists: state.followedArtists.filter(
          (artist) => artist.artistId !== artistId
        ),
        isFollowing: newFollowingSet,
      };
    });
  },

  // 액션: 로그아웃 시 모든 상태를 초기값으로 리셋
  clearFollows: () => {
    set({
      followedArtists: [],
      isFollowing: new Set(),
      isLoading: false,
      hasLoaded: false,
      error: null,
    });
  },
}));

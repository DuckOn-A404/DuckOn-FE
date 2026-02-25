import { create } from "zustand";
import { getFollowedArtists } from "../api/artistService";
import { getFollowedEmergingArtists } from "../api/emergingArtistService";
import { type Artist } from "../types/artist";

/* 
FollowState - 아티스트 팔로우 기능과 관련된 상태 정의

- followedArtists: 현재 사용자가 팔로우한 정식/라이징 아티스트 전체 목록
- isFollowing: 특정 artistId가 팔로우되어 있는지를 빠르게 확인하기 위한 Set
- isFollowingEmerging: 특정 emergingArtistId가 팔로우되어 있는지를 빠르게 확인하기 위한 Set
- isLoading: 팔로우 목록을 불러오는 중인지 여부
- hasLoaded: 최소 한 번은 서버에서 목록을 가져왔는지 여부
- error: 에러 발생 시 메시지 저장
- fetchFollowedArtists: 서버에서 팔로우한 정식+라이징 아티스트 목록을 가져오는 함수
- addFollow: 새로운 정식 아티스트를 팔로우 상태에 추가하는 함수
- addFollowEmerging: 새로운 라이징 아티스트를 팔로우 상태에 추가하는 함수
- removeFollow: 특정 정식 아티스트를 팔로우 목록에서 제거하는 함수
- removeFollowEmerging: 특정 라이징 아티스트를 팔로우 목록에서 제거하는 함수
- clearFollows: 팔로우 관련 상태를 초기화하는 함수 (ex. 로그아웃 시)
*/
type FollowState = {
  followedArtists: Artist[];
  isFollowing: Set<number>;
  isFollowingEmerging: Set<number>;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchFollowedArtists: () => Promise<void>;
  addFollow: (artist: Artist) => void;
  addFollowEmerging: (artist: Artist) => void;
  removeFollow: (artistId: number) => void;
  removeFollowEmerging: (emergingArtistId: number) => void;
  clearFollows: () => void;
};

export const useArtistFollowStore = create<FollowState>((set, get) => ({
  followedArtists: [],
  isFollowing: new Set(),
  isFollowingEmerging: new Set(),
  isLoading: false,
  hasLoaded: false,
  error: null,

  // 팔로우 목록 불러오기 액션 (정식 + 라이징 모두)
  fetchFollowedArtists: async () => {
    // 이미 불러왔거나, 현재 로딩 중이면 다시 호출 안 함
    if (get().hasLoaded || get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      // 두 API를 병렬로 호출
      const [artistRes, emergingRes] = await Promise.all([
        getFollowedArtists(1, 500).catch(() => ({ artistList: [] })),
        getFollowedEmergingArtists(1, 500).catch(() => ({ items: [] }))
      ]);

      const normalArtists: Artist[] = artistRes.artistList || [];
      
      // 라이징 아티스트 데이터를 Artist 타입에 맞춰 매핑 (artistId 대신 emergingArtistId 사용 등 구분 필요)
      // UI에서는 isEmerging 플래그를 추가하여 구분할 수 있습니다.
      const emergingArtists: Artist[] = (emergingRes.items || []).map(ea => ({
        artistId: ea.emergingArtistId, // UI 리스트 키용
        nameKr: ea.nameKr,
        nameEn: ea.nameEn,
        imgUrl: ea.imgUrl,
        debutDate: ea.debutDate,
        followerCount: ea.followerCount,
        isEmerging: true, // 라이징 아티스트 식별자
      }));

      // 두 배열을 합침 (최신순 또는 이름순 정렬 등 필요시 여기서 수행)
      const combinedArtists = [...normalArtists, ...emergingArtists];
      
      const artistIdSet = new Set(normalArtists.map((artist) => artist.artistId));
      const emergingArtistIdSet = new Set(emergingArtists.map((artist) => artist.artistId));

      set({
        followedArtists: combinedArtists,
        isFollowing: artistIdSet,
        isFollowingEmerging: emergingArtistIdSet,
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

  // 액션: UI 즉시 반영을 위해 스토어에 정식 팔로우 아티스트 추가
  addFollow: (artist) => {
    set((state) => ({
      followedArtists: [...state.followedArtists, artist],
      isFollowing: new Set(state.isFollowing).add(artist.artistId),
    }));
  },

  // 액션: UI 즉시 반영을 위해 스토어에 라이징 팔로우 아티스트 추가
  addFollowEmerging: (artist) => {
    set((state) => ({
      followedArtists: [...state.followedArtists, { ...artist, isEmerging: true }],
      isFollowingEmerging: new Set(state.isFollowingEmerging).add(artist.artistId),
    }));
  },

  // 액션: UI 즉시 반영을 위해 스토어에서 정식 언팔로우 아티스트 제거
  removeFollow: (artistId) => {
    set((state) => {
      const newFollowingSet = new Set(state.isFollowing);
      newFollowingSet.delete(artistId);
      return {
        followedArtists: state.followedArtists.filter(
          (artist) => artist.isEmerging || artist.artistId !== artistId
        ),
        isFollowing: newFollowingSet,
      };
    });
  },

  // 액션: UI 즉시 반영을 위해 스토어에서 라이징 언팔로우 아티스트 제거
  removeFollowEmerging: (emergingArtistId) => {
    set((state) => {
      const newFollowingSet = new Set(state.isFollowingEmerging);
      newFollowingSet.delete(emergingArtistId);
      return {
        followedArtists: state.followedArtists.filter(
          (artist) => !artist.isEmerging || artist.artistId !== emergingArtistId
        ),
        isFollowingEmerging: newFollowingSet,
      };
    });
  },

  // 액션: 로그아웃 시 모든 상태를 초기값으로 리셋
  clearFollows: () => {
    set({
      followedArtists: [],
      isFollowing: new Set(),
      isFollowingEmerging: new Set(),
      isLoading: false,
      hasLoaded: false,
      error: null,
    });
  },
}));

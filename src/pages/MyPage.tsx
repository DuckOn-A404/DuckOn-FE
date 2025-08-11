import {useEffect, useState} from "react";
import {type MyUser} from "../types/mypage";
import {deleteMyAccount, fetchMyProfile, verifyPassword} from "../api/userService";
import PasswordConfirm from "../components/common/PasswordConfirm";
import EditProfileCard from "../components/domain/user/EditProfileCard";
import FollowerList from "../components/common/modal/FollowerList";
import FollowingList from "../components/common/modal/FollowingList";
import MyProfileCard from "../components/domain/user/MyProfileCard";

const isEmptyImg = (v: unknown): boolean =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "");
import {useUserStore} from "../store/useUserStore";
import {useNavigate} from "react-router-dom";
import DeleteAccountModal from "../components/common/modal/DeleteAccountModal";

const MyPage = () => {
  const navigate = useNavigate();
  const [myUser, setMyUser] = useState<MyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openList, setOpenList] = useState<"follower" | "following" | null>(
    null
  );

  const syncGlobal = (u: MyUser) => {
    useUserStore.getState().setMyUser({
      ...(u as any),
      // 프로젝트 타입 차이를 피하려고 artistList 기본값 보정
      artistList: (u as any).artistList ?? [],
    } as any);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const {setMyUser: setStoreUser} = useUserStore();

  const handleConfirm = async (password: string): Promise<boolean> => {
    const isValid = await verifyPassword(password);
    if (isValid) {
      setShowModal(false);
      setIsEditing(true);
      return true;
    }
    return false;
  };

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
  }

  const handleConfirmDelete = async () => {
    if (deleting) return;
    try {
      setDeleting(true);
      await deleteMyAccount();
      // 로컬 정리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user-storage");
      setMyUser(null);
      setStoreUser(null);
      // 모달 닫고 이동
      setShowDeleteModal(false);
      navigate("/");
    } catch (e) {
      console.error("회원 탈퇴 실패:", e);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const data = await fetchMyProfile();
        setMyUser(data);
        syncGlobal(data)
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // useEffect(() => {
  //   if (openList === null) {
  //     const reloadProfile = async () => {
  //       try {
  //         const updated = await fetchMyProfile();
  //         setMyUser(updated);
  //       } catch {}
  //     };
  //     reloadProfile();
  //   }
  // }, [openList]);

  useEffect(() => {
    if (openList === null) {
      const reloadProfile = async () => {
        try {
          const updated = await fetchMyProfile();
          setMyUser((prev) => {
            if (!prev) {
              syncGlobal(updated);
              return updated;
            }
            // imgUrl 병합: undefined/""면 이전 유지, 문자열이면 교체
            const nextImgUrl =
              !isEmptyImg((updated as any).imgUrl)
                ? (updated as any).imgUrl
                : prev.imgUrl;

            const next: MyUser = {...prev, ...updated, imgUrl: nextImgUrl};
            syncGlobal(next); // 헤더 갱신
            return next;
          });
        } catch { }
      };
      reloadProfile();
    }
  }, [openList]);

  if (loading) return <div className="p-6">불러오는 중...</div>;
  if (!myUser) return <div className="p-6 text-red-500">사용자 정보 없음</div>;

  const isSocial = !!myUser.socialLogin // true면 소셜, false/undefined면 일반 로그인

  return (
    <div className="px-8 py-6">
      {!isEditing ? (
        <MyProfileCard
          key={`mypage-${myUser.userId}`}
          user={myUser}
          onEditClick={() => {
            if (isSocial) {
              // 소셜 로그인: 모달 없이 바로 편집
              setIsEditing(true)
            } else {
              // 일반 로그인: 비밀번호 확인 모달
              setShowModal(true);
            }
          }}
          onFollowerClick={() => setOpenList("follower")}
          onFollowingClick={() => setOpenList("following")}
        />
      ) : (
        <EditProfileCard
          user={myUser}
          onCancel={() => setIsEditing(false)}
          onUpdate={(updatedUser) => {
            // onUpdate 병합: undefined/""는 이전 유지, 문자열은 교체
            setMyUser((prev) => {
              if (!prev) {
                syncGlobal(updatedUser as any);
                return updatedUser;
              }
              const nextImgUrl =
                (updatedUser as any).imgUrl !== undefined &&
                  !isEmptyImg((updatedUser as any).imgUrl)
                  ? (updatedUser as any).imgUrl // 문자열(새 URL 또는 DEFAULT_IMG)
                  : prev.imgUrl;                // 유지

              const next: MyUser = {...prev, ...updatedUser, imgUrl: nextImgUrl};
              syncGlobal(next); // 헤더 즉시 반영
              return next;
            });
            setIsEditing(false);
          }}
        />
      )}

      {/* 일반 로그인일 때만 모달 렌더링 */}
      {!isSocial && (
        <PasswordConfirm
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
        />
      )}

      {/* 팔로워/팔로잉 모달 */}
      {openList === "follower" && (
        <FollowerList onClose={() => setOpenList(null)} />
      )}
      {openList === "following" && (
        <FollowingList onClose={() => setOpenList(null)} />
      )}

      <div className="mt-10 flex flex-col items-center text-center">
        <button
          type="button"
          onClick={handleOpenDeleteModal} // API 호출 없음
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition
               hover:bg-red-100 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-60"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 6h18M9 6v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0l1 14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {deleting ? "탈퇴 처리 중..." : "회원 탈퇴"}
        </button>
        <p className="mt-2 text-xs text-gray-500">
          탈퇴 시 계정 및 데이터가 삭제되며 복구할 수 없습니다.
        </p>
      </div>

      {/* 탈퇴 확인 모달 */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        loading={deleting}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete} // 여기서 실제 API 호출
      />

    </div>
  );
};

export default MyPage;

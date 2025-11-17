import { useEffect, useState } from "react";
import { type MyUser } from "../types/mypage";
import {
  deleteMyAccount,
  fetchMyProfile,
  verifyPassword,
} from "../api/userService";
import PasswordConfirm from "../components/common/PasswordConfirm";
import EditProfileCard from "../components/domain/user/EditProfileCard";
import FollowerList from "../components/common/modal/FollowerList";
import FollowingList from "../components/common/modal/FollowingList";
import MyProfileCard from "../components/domain/user/MyProfileCard";
import MyCreatedRoomsPanel from "../components/domain/room/MyCreatedRoomsPanel";
import BlockListModal from "../components/common/modal/BlockListModal";
import ChangePasswordModal from "../components/common/modal/ChangePasswordModal";

const isEmptyImg = (v: unknown): boolean =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "");
import { useUserStore } from "../store/useUserStore";
import { useNavigate } from "react-router-dom";
import DeleteAccountModal from "../components/common/modal/DeleteAccountModal";

// userId별 마지막 imgUrl을 보관/복구
const lastImgKey = (userId: string) => `last-img:${userId}`;
const saveLastImg = (userId?: string, url?: string) => {
  if (!userId) return;
  if (url && url.trim() !== "") {
    localStorage.setItem(lastImgKey(userId), url);
  }
};
const loadLastImg = (userId?: string): string | undefined => {
  if (!userId) return undefined;
  const v = localStorage.getItem(lastImgKey(userId)) || undefined;
  return v && v.trim() !== "" ? v : undefined;
};

const MyPage = () => {
  const navigate = useNavigate();
  const [myUser, setMyUser] = useState<MyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openList, setOpenList] = useState<"follower" | "following" | null>(
    null
  );
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const syncGlobal = (u: MyUser) => {
    useUserStore.getState().setMyUser({
      ...(u as any),
      artistList: (u as any).artistList ?? [],
    } as any);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { setMyUser: setStoreUser } = useUserStore();

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
  };

  const handleConfirmDelete = async () => {
    if (deleting) return;
    try {
      setDeleting(true);
      await deleteMyAccount();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user-storage");
      setMyUser(null);
      setStoreUser(null);
      setShowDeleteModal(false);
      navigate("/");
    } catch (e) {
      console.error("회원 탈퇴 실패:", e);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!myUser) return;
    syncGlobal(myUser);
  }, [myUser]);

  // 최초 로드: 서버 imgUrl이 비면 userId별 보관 값으로 복구
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const data = await fetchMyProfile();
        setMyUser((prev) => {
          const uid = (data as any)?.userId ?? (prev as any)?.userId;
          const incomingImg = (data as any)?.imgUrl;
          const storedImg = loadLastImg(uid);
          const chosenImg = !isEmptyImg(incomingImg) ? incomingImg : storedImg;

          const next: MyUser = { ...(prev ?? {}), ...data, imgUrl: chosenImg } as MyUser;
          saveLastImg(uid, next.imgUrl as any);
          return next;
        });
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // 이후 재조회도 동일한 병합 + 보관
  useEffect(() => {
    if (openList === null) {
      const reloadProfile = async () => {
        try {
          const updated = await fetchMyProfile();
          setMyUser((prev) => {
            if (!prev) {
              saveLastImg((updated as any)?.userId, (updated as any)?.imgUrl);
              return updated;
            }
            const nextImgUrl = !isEmptyImg((updated as any).imgUrl)
              ? (updated as any).imgUrl
              : prev.imgUrl;

            const next: MyUser = { ...prev, ...updated, imgUrl: nextImgUrl };
            saveLastImg((next as any)?.userId, nextImgUrl as any);
            return next;
          });
        } catch {
          // ignore
        }
      };
      reloadProfile();
    }
  }, [openList]);

  // 로딩/에러일 때도 같은 앱 레이아웃 유지
  if (loading || !myUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f9f5ff] via-[#fdfbff] to-white md:bg-transparent">
        <div className="mx-auto w-full max-w-[430px] md:max-w-5xl px-4 md:px-8 pt-10 pb-24">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-10 text-center text-sm">
            {loading ? (
              <span className="text-gray-500">불러오는 중...</span>
            ) : (
              <span className="text-red-500">사용자 정보 없음</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isSocial = !!myUser.socialLogin;

  return (
    // 모바일: 연한 그라데이션 + 430px 캔버스
    // 웹(md 이상): 배경 투명, 기존 max width 느낌 유지
    <div className="min-h-screen bg-gradient-to-b from-[#f9f5ff] via-[#fdfbff] to-white md:bg-transparent">
      <div className="mx-auto w-full max-w-[430px] md:max-w-5xl px-4 md:px-8 pt-5 md:pt-6 pb-24 space-y-6 md:space-y-8">
        {!isEditing ? (
          <MyProfileCard
            key={`mypage-${myUser.userId}`}
            user={myUser}
            onEditClick={() => {
              if (isSocial) {
                setIsEditing(true);
              } else {
                setShowModal(true);
              }
            }}
            onFollowerClick={() => setOpenList("follower")}
            onFollowingClick={() => setOpenList("following")}
            onDeleteClick={handleOpenDeleteModal}
            onBlockListClick={() => setIsBlockModalOpen(true)}
          />
        ) : (
          <EditProfileCard
            user={myUser}
            onCancel={() => setIsEditing(false)}
            onUpdate={(updatedUser) => {
              setMyUser((prev) => {
                if (!prev) {
                  saveLastImg(
                    (updatedUser as any)?.userId,
                    (updatedUser as any)?.imgUrl
                  );
                  return updatedUser;
                }
                const nextImgUrl =
                  (updatedUser as any).imgUrl !== undefined &&
                  !isEmptyImg((updatedUser as any).imgUrl)
                    ? (updatedUser as any).imgUrl
                    : prev.imgUrl;

                const next: MyUser = {
                  ...prev,
                  ...updatedUser,
                  imgUrl: nextImgUrl,
                };
                saveLastImg((next as any)?.userId, nextImgUrl as any);
                return next;
              });
              setIsEditing(false);
            }}
          />
        )}

        {/* 내가 만든 방 패널 */}
        <MyCreatedRoomsPanel rooms={myUser.roomList ?? []} pageSize={12} />
      </div>

      {/* 모달들 – 전체 화면 기준이라 바깥에 그대로 둠 */}
      {!isSocial && (
        <PasswordConfirm
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
        />
      )}

      {openList === "follower" && (
        <FollowerList onClose={() => setOpenList(null)} />
      )}
      {openList === "following" && (
        <FollowingList onClose={() => setOpenList(null)} />
      )}

      <DeleteAccountModal
        isOpen={showDeleteModal}
        loading={deleting}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />

      {isBlockModalOpen && <BlockListModal onClose={() => setIsBlockModalOpen(false)} />}

      {/* 비밀번호 변경 모달 */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default MyPage;


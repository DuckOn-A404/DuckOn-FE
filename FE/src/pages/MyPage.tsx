import { useEffect, useState } from "react";
import { type MyUser } from "../types/mypage";
import { fetchMyProfile, verifyPassword } from "../api/userService";
import PasswordConfirm from "../components/common/PasswordConfirm";
import EditProfileCard from "../components/domain/user/EditProfileCard";
import FollowerList from "../components/common/modal/FollowerList";
import FollowingList from "../components/common/modal/FollowingList";
import MyProfileCard from "../components/domain/user/MyProfileCard";
import { useUserStore } from "../store/useUserStore";

const isEmptyImg = (v: unknown): boolean =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "");

const MyPage = () => {
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

  const handleConfirm = async (password: string): Promise<boolean> => {
    const isValid = await verifyPassword(password);
    if (isValid) {
      setShowModal(false);
      setIsEditing(true);
      return true;
    }
    return false;
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

            const next: MyUser = { ...prev, ...updated, imgUrl: nextImgUrl };
            syncGlobal(next); // ✅ 헤더 갱신
            return next;
          });
        } catch {}
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
            // ✅ onUpdate 병합: undefined/""는 이전 유지, 문자열은 교체
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

              const next: MyUser = { ...prev, ...updatedUser, imgUrl: nextImgUrl };
              syncGlobal(next); // ✅ 헤더 즉시 반영
              return next;
            });
            setIsEditing(false);
          }}
        />
        // <EditProfileCard
        //   user={myUser}
        //   onCancel={() => setIsEditing(false)}
        //   onUpdate={(updatedUser) => {
        //     const merged = {
        //       ...myUser,
        //       ...updatedUser,
        //       imgUrl: updatedUser.imgUrl ?? myUser.imgUrl,
        //     }
        //     setMyUser(merged);
        //     setIsEditing(false);
        //   }}
        // />
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
    </div>
  );
};

export default MyPage;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type MyUser } from "../types/mypage";
import { fetchMyProfile, verifyPassword } from "../api/userService";
import PasswordConfirm from "../components/common/PasswordConfirm";
import EditProfileCard from "../components/domain/user/EditProfileCard";
import FollowerList from "../components/common/modal/FollowerList";
import FollowingList from "../components/common/modal/FollowingList";
import MyProfileCard from "../components/domain/user/MyProfileCard";
import { useUserStore } from "../store/useUserStore";

const MyPage = () => {
  const [myUser, setMyUser] = useState<MyUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [openList, setOpenList] = useState<"follower" | "following" | null>(null)
  const navigate = useNavigate()

  const handleConfirm = async (password: string): Promise<boolean> => {
    const isValid = await verifyPassword(password)
    if (isValid) {
      setShowModal(false)
      setIsEditing(true)  // 수정 모드 전환
      return true
    }
    return false
  }

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true)
      try {
        const data = await fetchMyProfile();
        console.log("받아온 사용자 정보:", data);
        setMyUser(data);
      } catch (error) {
        console.error("사용자 정보를 불러오지 못했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (openList === null) {
      const reloadProfile = async () => {
        try {
          const updated = await fetchMyProfile()
          console.log("모달 닫힌 후 갱신된 사용자 정보:", updated)
          setMyUser(updated)
        } catch (error) {
          console.error("사용자 정보 갱신 실패:", error)
        }
      }
      reloadProfile()
    }
  }, [openList])

  if (loading) return <div className="p-6">불러오는 중...</div>;
  if (!myUser) return <div className="p-6 text-red-500">사용자 정보 없음</div>;

  return (
    <div className="px-8 py-6">
      {!isEditing ? (
        <MyProfileCard
          key={`mypage-${myUser.userId}`}
          user={myUser} 
          onEditClick={() => setShowModal(true)}
          onFollowerClick={() => setOpenList("follower")}
          onFollowingClick={() => setOpenList("following")}
        />
      ) : (
        <EditProfileCard
          user={myUser}
          onCancel = {() => setIsEditing(false)}
          onUpdate = {(updatedUser) => {
            setMyUser(updatedUser)
            setIsEditing(false)
          }}
        />
      )}

      <PasswordConfirm
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
      />

      {/* 팔로워/팔로잉 모달 */}
      {openList === "follower" && <FollowerList onClose={() => setOpenList(null)} />}
      {openList === "following" && <FollowingList onClose={() => setOpenList(null)} />}
    </div>
  );
};

export default MyPage;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type MyUser } from "../types/mypage";
import { fetchMyProfile, verifyPassword } from "../api/userService";
import ProfileCard from "../components/domain/user/ProfileCard";
import PasswordConfirm from "../components/common/PasswordConfirm";

const MyPage = () => {
  const [user, setUser] = useState<MyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  const handleConfirm = async (password: string): Promise<boolean> => {
    const isValid = await verifyPassword(password)
    if (isValid) {
      setShowModal(false)
      navigate("/mypage")
      return true
    }
    return false
    // try {
    //     // 실제 백엔드 API 호출로 비밀번호 검증
    //     const isValid = await verifyPassword(password)  // 백엔드 API 함수

    //     if (isValid) {
    //         setShowModal(false)
    //         navigate("/mypage")
    //     } else {
    //         alert("비밀번호가 일치하지 않습니다.")
    //     }
    // } catch (error) {
    //     console.error("비밀번호 확인 중 오류 발생:", error)
    // }
  }

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchMyProfile();
        setUser(data);
      } catch (error) {
        console.error("사용자 정보를 불러오지 못했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) return <div className="p-6">불러오는 중...</div>;
  if (!user) return <div className="p-6 text-red-500">사용자 정보 없음</div>;

  return (
    <div className="px-8 py-6">
        <ProfileCard user={user} onEditClick={() => setShowModal(true)} />
        <PasswordConfirm
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={handleConfirm}
        />
    </div>
  );
};

export default MyPage;

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProfileCard from "../components/domain/user/ProfileCard";
import { mockOtherUsers } from "../mocks/otherUserMock";
import type { MyUser } from "../types/mypage";
import { fetchOtherUserProfile } from "../api/userService";

const OtherUserPage = () => {
    const { userId } = useParams()
    const [user, setUser] = useState<MyUser | null>(null)

    useEffect(() => {
        // 백엔드 연동 예정 코드
        /*
        const getUserData = async () => {
        try {
            const data = await fetchOtherUserProfile(userId!);
            setUser(data);
        } catch (err) {
            console.error("타 유저 정보 조회 실패", err);
        }
        };
        getUserData();
        */

        // 현재는 mock 데이터로 받아오기
        const dummy = mockOtherUsers.find(u => u.userId === userId);
        if (dummy) {
        setUser(dummy);
        }
    }, [userId]);

    if (!user) return <div className="text-center mt-20">유저 정보를 불러오는 중입니다...</div>;

    return (
        <div className="py-10">
        <ProfileCard user={user} onEditClick={() => {}} />
        </div>
    )
}

export default OtherUserPage;
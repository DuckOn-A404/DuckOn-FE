import { useEffect, useState } from "react";
import type { FollowerUser } from "../../../types/follow";
import { followUser } from "../../../api/followService";

type FollowerListProps = {
    onClose: () => void
}

const FollowerList = ({ onClose }: FollowerListProps) => {
    const [followers, setFollowers] = useState<FollowerUser[]>([])

    // useEffect(() => {
    //     // 백엔드 연동용 fetch
    //     // const fetchFollowers = async () => {
    //     //     const res = await fetch("/api/followers", {
    //     //         headers: {Authorization: `Bearer ${token}` },
    //     //     })
    //     //     const data = await res.json()
    //     //     setFollowers(data.followers)
    //     // }
    //     // fetchFollowers()

    //     // mock 데이터로 확인
    //     setFollowers(followerMock)
    // }, [])

    const toggleFollow = async (user: FollowerUser) => {
        try {
            await followUser(user.userId)   // 실제 백엔드 호출
            setFollowers((prev) =>
                prev.map((f) =>
                    f.userId === user.userId ? {...f, following: !user.following } : f
                )
            )
        } catch (error) {
            console.error("팔로우 실패: ", error)
            alert("팔로우 처리 중 문제가 발생했습니다.")
        }
    }
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex justify-center items-center">
            <div className="bg-white rounded-xl p-6 w-[350px] max-h-[80vh] overflow-y-auto relative shadow-xl">
                <h2 className="text-lg font-bold mb-4">팔로워</h2>
                <button
                onClick={onClose}
                className="absolute top-3 right-4 text-gray-500 hover:text-black"
                aria-label="닫기"
                >
                ✕
                </button>

                <ul className="space-y-4">
                {followers.map((user) => (
                    <li key={user.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                        src={user.profileImg || "/default_image.png"}
                        alt="profile"
                        className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-gray-700">{user.nickname}</span>
                    </div>
                    <button
                        onClick={() => toggleFollow(user)}
                        className={`text-sm px-3 py-1 rounded transition ${
                        user.following
                            ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            : "bg-purple-500 text-white hover:bg-purple-600"
                        }`}
                    >
                        {user.following ? "언팔로우" : "팔로우"}
                    </button>
                    </li>
                ))}
                </ul>
            </div>
        </div>
    );
};

export default FollowerList;
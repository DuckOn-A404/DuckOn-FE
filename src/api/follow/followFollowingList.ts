import { api } from "../axiosInstance"
import type { FollowUser } from "../../types/follow"

const token = localStorage.getItem("accessToken") || ""

// 팔로워 목록 조회(내가 팔로우 했는가..?)
export const fetchFollowList = async (): Promise<FollowUser[]> => {
    const res = await api.get("/api/users/me/followers", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    console.log("followers API 응답:", res.data)
    return res.data.followers.map((user: any) => ({
        userId: user.userId,
        nickname: user.nickname,
        profileImg: user.profileImg,
        following: user.following,
    }))
}

// 팔로잉 목록 조회
export const fetchFollowingList = async (): Promise<FollowUser[]> => {
    const res = await api.get("/api/users/me/following", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    
    return res.data.following.map((user:any) => ({
        userId: user.userId,
        nickname: user.nickname,
        profileImg: user.profileImg,
        following: true,
    }))
}
import { useQuery } from "@tanstack/react-query";
import { getRecommendedUsers } from "../api/userService";

/**
 * 추천 유저 데이터를 가져오는 커스텀 훅
 * @param artistId - 아티스트 ID
 */
export const useRecommendedUsers = (artistId: number) => {
  return useQuery({
    queryKey: ["recommendedUsers", artistId],

    queryFn: () => getRecommendedUsers(artistId),

    enabled: !!artistId,
  });
};

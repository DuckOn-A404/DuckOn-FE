import type { OtherUser } from "../../../types/otherUser";
import RankProgress from "../../common/RankProgress"; // ✅ 추가
import TruncatedTitle from "../../common/TruncatedTitle";

type OtherProfileCardProps = {
  user: OtherUser;
  onToggleFollow: () => void;
  onFollowerClick?: () => void;
  onFollowingClick?: () => void;
  isFollowLoading?: boolean;
};

const OtherProfileCard = ({
  user,
  onToggleFollow,
}: OtherProfileCardProps) => {
  const rankLevel = user.userRank?.rankLevel ?? "GREEN";

  return (
    <div className="relative bg-white rounded-xl px-4 sm:px-8 py-6 mb-10 w-full max-w-[880px] mx-auto shadow-sm">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6 gap-3">
        <h1 className="text-lg font-bold text-gray-800">프로필 정보</h1>
        <button
          onClick={onToggleFollow}
          className={`w-20 flex-shrink-0 px-2 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            user.following
              ? "bg-gray-200 text-gray-500 hover:bg-gray-300"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
        >
          {user.following ? "팔로잉" : "팔로우"}
        </button>
      </div>

      {/* 본문 */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
        {/* 왼쪽: 프로필 + 팔/팔 */}
        <div className="flex flex-col items-center w-full sm:w-32 shrink-0">
          <img
            src={user.imgUrl || "/default_image.png"}
            alt="프로필 이미지"
            className="w-24 h-24 object-cover rounded-full"
          />

          <div className="mt-4 flex gap-10 sm:gap-6 text-center select-none">
            <div className="text-center">
              <div className="text-lg font-bold">
                {user.followerCount?.toLocaleString() ?? "0"}
              </div>
              <div className="text-xs text-gray-500">팔로워</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {user.followingCount?.toLocaleString() ?? "0"}
              </div>
              <div className="text-xs text-gray-500">팔로잉</div>
            </div>
          </div>
        </div>

        {/* 가운데: 정보 영역 */}
        <div className="min-w-0 flex-[0.7] text-l space-y-2 mt-5">
          <div className="flex items-start gap-2">
            <div className="shrink-0 w-20 sm:w-24 text-gray-500 font-medium">
              아이디
            </div>
            <div className="min-w-0 flex-1 break-all sm:whitespace-nowrap sm:truncate">
              {user.userId}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="shrink-0 w-20 sm:w-24 text-gray-500 font-medium">
              닉네임
            </div>
            <div className="min-w-0 flex-1">
              <TruncatedTitle
                title={user.nickname}
                className="text-sm sm:text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 하단: 랭크 진행도 영역 */}
      <div className="mt-8">
        <RankProgress
          rankLevel={rankLevel}
          roomCreateCount={user.userRank?.roomCreateCount ?? 0}
        />
      </div>
    </div>
  );
};

export default OtherProfileCard;

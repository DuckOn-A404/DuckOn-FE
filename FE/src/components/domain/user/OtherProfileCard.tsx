import type { OtherUser } from "../../../types/otherUser";

type OtherProfileCardProps = {
  user: OtherUser;
  onToggleFollow: () => void;
  onFollowerClick?: () => void;
  onFollowingClick?: () => void;
};

const OtherProfileCard = ({
  user,
  onToggleFollow,
  onFollowerClick,
  onFollowingClick,
}: OtherProfileCardProps) => {
  return (
    <div className="bg-white rounded-xl px-8 py-6 mb-10 w-full max-w-[680px] mx-auto shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold">프로필 정보</h1>

        {/* 팔로우 버튼만 표시 */}
        <button
          className="text-sm text-white bg-purple-500 px-4 py-1.5 rounded-md hover:bg-purple-600 transition"
          onClick={onToggleFollow}
        >
          {user.following ? "언팔로우" : "팔로우"}
        </button>
      </div>

      <div className="flex gap-8 items-start">
        <div className="flex flex-col items-center w-32 shrink-0">
          <img
            src={user.imgUrl || "/default_image.png"}
            alt="프로필 이미지"
            className="w-24 h-24 object-cover rounded-full"
          />

          <div className="mt-4 flex gap-6 text-center">
            <div>
              <div className="text-lg font-bold">
                {user.followerCount?.toLocaleString() ?? "0"}
              </div>
              <button
                onClick={onFollowerClick}
                className="text-xs text-gray-500 hover:underline cursor-pointer focus:outline-none"
              >
                팔로워
              </button>
            </div>
            <div>
              <div className="text-lg font-bold">
                {user.followingCount?.toLocaleString() ?? "0"}
              </div>
              <button
                onClick={onFollowingClick}
                className="text-xs text-gray-500 hover:underline cursor-pointer focus:outline-none"
              >
                팔로잉
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 text-sm grid gap-4">
          <div className="flex">
            <div className="w-32 text-gray-500 font-medium">아이디</div>
            <div>{user.userId}</div>
          </div>
          <div className="flex">
            <div className="w-32 text-gray-500 font-medium">닉네임</div>
            <div>{user.nickname}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherProfileCard;

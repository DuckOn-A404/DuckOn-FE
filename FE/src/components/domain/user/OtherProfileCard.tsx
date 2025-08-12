import type { OtherUser } from "../../../types/otherUser";

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
  onFollowerClick,
  onFollowingClick,
}: OtherProfileCardProps) => {
  return (
    <div className="bg-white rounded-xl px-8 py-6 mb-10 w-full max-w-[680px] mx-auto shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">프로필 정보</h1>
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

      <div className="flex gap-8 items-center">
        <div className="flex flex-col items-center w-32 shrink-0">
          <img
            src={user.imgUrl || "/default_image.png"}
            alt="프로필 이미지"
            className="w-28 h-28 object-cover rounded-full border-4 border-white shadow-md"
          />
          <div className="mt-4 flex gap-6 text-center">
            <div>
              <div className="text-xl font-bold text-gray-800">
                {user.followerCount?.toLocaleString() ?? "0"}
              </div>
              <button
                onClick={onFollowerClick}
                disabled={!onFollowerClick}
                className="text-sm text-gray-500 hover:text-purple-600 hover:underline disabled:no-underline disabled:text-gray-400 disabled:cursor-default focus:outline-none"
              >
                팔로워
              </button>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">
                {user.followingCount?.toLocaleString() ?? "0"}
              </div>
              <button
                onClick={onFollowingClick}
                disabled={!onFollowingClick}
                className="text-sm text-gray-500 hover:text-purple-600 hover:underline disabled:no-underline disabled:text-gray-400 disabled:cursor-default focus:outline-none"
              >
                팔로잉
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 text-base grid gap-y-5 pt-2 pl-5">
          <div className="flex items-center">
            <div className="w-24 text-gray-500 font-semibold">아이디</div>
            <div className="text-gray-800">{user.userId}</div>
          </div>
          <div className="flex items-center">
            <div className="w-24 text-gray-500 font-semibold">닉네임</div>
            <div className="text-gray-800 font-semibold">{user.nickname}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherProfileCard;

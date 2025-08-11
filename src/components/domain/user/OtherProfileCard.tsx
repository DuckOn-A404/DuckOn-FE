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
    <div className="bg-white rounded-xl px-8 py-6 mb-10 w-full max-w-[680px] mx-auto shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">프로필 정보</h1>

        {/* 팔로우/언팔로우 버튼 */}
        <button
          onClick={onToggleFollow}
          className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-wait ${
            user.following
              ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
              : "text-white bg-purple-600 hover:bg-purple-700 shadow-md"
          }`}
        ></button>
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

        <div className="flex-1 text-base grid gap-y-5 pt-2">
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

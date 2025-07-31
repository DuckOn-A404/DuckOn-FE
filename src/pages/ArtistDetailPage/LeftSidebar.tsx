import { useNavigate } from "react-router-dom";
import { useArtistFollowStore } from "../../store/useArtistFollowStore";
import { List, CheckSquare } from "lucide-react";
import { dummyArtists } from "../../mocks/artists";
import Button from "../../components/common/Button";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { followedArtists } = useArtistFollowStore();

  return (
    <aside className="w-72 p-4">
      {/* 모든 콘텐츠를 포함하는 하나의 큰 하얀색 카드 */}
      <div className="bg-white rounded-2xl shadow p-4 flex flex-col min-h-[calc(100vh-6rem)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">팔로우한 아티스트</h2>
          <List className="w-5 h-5 text-gray-500 cursor-pointer" />
        </div>

        {followedArtists.length > 0 ? (
          // 팔로우한 아티스트가 있을 때
          <>
            <ul className="space-y-2 text-sm mb-4 flex-grow overflow-y-auto custom-scrollbar">
              {followedArtists.map((followedArtist) => {
                const fullArtistInfo = dummyArtists.find(
                  (artist) => artist.artistId === followedArtist.artistId
                );
                const artistImgUrl =
                  fullArtistInfo?.imgUrl || "https://placehold.co/32x32";

                return (
                  <li
                    key={followedArtist.artistId}
                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() =>
                      navigate(`/artists/${followedArtist.nameEn}`)
                    }
                  >
                    <img
                      src={artistImgUrl}
                      alt={followedArtist.nameKr}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="font-medium">
                        {followedArtist.nameKr}
                      </span>
                      <span className="text-purple-500 text-xs">15개 방</span>
                      <CheckSquare className="w-4 h-4 text-purple-400" />
                    </div>
                  </li>
                );
              })}
            </ul>
            <button
              className="mt-auto w-full bg-purple-600 text-white text-sm py-2 rounded-xl"
              onClick={() => navigate("/artist-list")}
            >
              + 아티스트 더보기
            </button>
          </>
        ) : (
          // 팔로우한 아티스트가 없을 때
          <div className="flex flex-col items-center justify-center text-center flex-grow">
            <p className="text-sm text-gray-500 mb-4">
              팔로우한 아티스트가 없습니다.
            </p>
            <button
              className="mt-auto w-full bg-purple-600 text-white text-sm py-2 rounded-xl cursor-pointer"
              onClick={() => navigate("/artist-list")}
            >
              + 아티스트 팔로우 하러가기
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default LeftSidebar;

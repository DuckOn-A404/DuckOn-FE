import { Users } from "lucide-react";

type ArtistCardProps = {
  artistId: number;
  nameEn: string;
  nameKr: string;
  imgUrl: string;
  followerCount?: number;
  onClick: () => void;
};

const PLACEHOLDER_URL =
  "https://placehold.co/240x240/eeeeee/aaaaaa?text=No+Image&font=roboto";

/*
  name: ArtistCard
  summary: 아티스트 목록에서 사용하는 카드 컴포넌트
*/
const ArtistCard = ({
  nameEn,
  nameKr,
  imgUrl,
  followerCount,
  onClick,
}: ArtistCardProps) => {
  const thumbnailUrl = imgUrl || PLACEHOLDER_URL;

  return (
    <div
      className="w-full max-w-[220px] bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg mb-4">
        <img
          src={thumbnailUrl}
          alt={nameEn}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="text-center">
        <p className="font-bold text-lg text-gray-800 truncate" title={nameKr}>
          {nameKr}
        </p>
        <p className="text-sm text-gray-400 truncate" title={nameEn}>
          {nameEn}
        </p>
      </div>

      {followerCount !== undefined && (
        <div className="mt-4 flex items-center gap-1.5 text-sm text-purple-600">
          <Users className="h-4 w-4" />
          <span className="font-semibold">
            {followerCount.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default ArtistCard;

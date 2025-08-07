import { Users } from "lucide-react";

type ArtistCardProps = {
  artistId: number;
  nameEn: string;
  nameKr: string;
  imgUrl: string;
  followerCount?: number;
  onClick: () => void;
};

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
  return (
    // 1. 카드 전체 컨테이너: 패딩과 보더를 추가하여 더 깔끔하게 만듭니다.
    <div
      className="w-full max-w-[220px] bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1"
      onClick={onClick}
    >
      {/* 2. 원형 이미지: 크기를 키우고 그림자를 추가해 입체감을 줍니다. */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg mb-4">
        <img src={imgUrl} alt={nameEn} className="w-full h-full object-cover" />
      </div>

      {/* 3. 텍스트 영역: 중앙 정렬하고 폰트와 색상을 조정합니다. */}
      <div className="text-center">
        <p className="font-bold text-lg text-gray-800 truncate" title={nameKr}>
          {nameKr}
        </p>
        <p className="text-sm text-gray-400 truncate" title={nameEn}>
          {nameEn}
        </p>
      </div>

      {/* 4. 팔로워 수: 페이지의 포인트 컬러(보라색)를 사용해 강조합니다. */}
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

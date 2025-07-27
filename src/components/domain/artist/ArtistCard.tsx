import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ArtistCardProps = {
  engName: string;
  korName: string;
  imageUrl: string;
  followers: number;
  // '솔로', '그룹' 등의 태그
  tag?: string;
};

/*
  name: ArtistCard
  summary: 홈 페이지에서 인기 아티스트 목록 부분과 앞 전체 아티스트 목록에서 사용이 가능한 카드. 클릭시 아티스트 상세 페이지로 넘어가게 수정할 계획
  props:
    engName: 아티스트 영어 이름
    korName: 아티스트 한국 이름
    imageUrl: 아티스트 사진
    followers: 아티스트를 팔로우한 회원 수
    tag?: '솔로', '그룹' 등의 태그
*/

const ArtistCard = ({
  engName,
  korName,
  imageUrl,
  followers,
  tag,
}: ArtistCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/artist/${encodeURIComponent(engName)}`);
  };

  return (
    <div
      className="w-full max-w-[220px] rounded-2xl shadow-md overflow-hidden"
      onClick={handleClick}
    >
      <div className="relative w-full aspect-[3/4]">
        <img src={imageUrl} alt={engName} className="w-full h-full object-co" />

        {tag && (
          <span className="absolute top-2 left-2 bg-white/80 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
            {tag}
          </span>
        )}

        {/* 이미지 위 반투명 텍스트 박스 */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/45 px-4 py-3 text-white">
          <div className="text-lg font-bold">{engName}</div>
          <div className="flex justify-between items-center text-sm mt-1">
            <div>{korName}</div>
            <div className="whitespace-nowrap">
              <Users className="h-4 w-4" />
              <span>{followers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistCard;

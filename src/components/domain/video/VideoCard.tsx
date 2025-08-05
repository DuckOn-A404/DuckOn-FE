import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { formatCompactNumber } from "../../../utils/formatters";
import type { Room } from "../../../types/Room";

type VideoCardProps = Room & {
  artistName?: string;
};

/* 
  name : VideoCard
  summary : 방송 목록을 보여줄 때 사용하는 비디오 카드 컴포넌트, Live 여부에 따라 뱃지 등의 디자인이 변경됨
  props
    - isLive : 라이브 방송 여부 (방송 중/방송 예약)
    - viewerCount : 시청자 수 (1,000 단위 이상은 K로 포매팅 됨)
    - artistName : 방송 아티스트 이름 (아티스트 상세 페이지에서는 방장 닉네임으로 가능하도록 수정 필요)
    - title : 방 제목
*/
const VideoCard = ({
  roomId,
  title,
  imgUrl,
  participantCount,
  artistName,
}: VideoCardProps) => {
  const navigate = useNavigate();
  const thumbnailUrl = imgUrl;

  const handleCardClick = () => {
    if (roomId) {
      navigate(`/live/${roomId}`);
    }
  };

  return (
    <div
      className="w-full max-w-sm cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
      onClick={handleCardClick}
    >
      <div className="w-full h-auto bg-white rounded-2xl shadow-sm outline outline-1 outline-gray-100 overflow-hidden flex flex-col">
        <div className="w-full relative aspect-[16/9]">
          <img
            className="w-full h-full object-cover"
            src={thumbnailUrl}
            alt={`${title} 썸네일`}
          />
          <div className="absolute right-3 bottom-3 w-auto min-w-[4rem] h-6 inline-flex justify-center items-center gap-x-1 px-2 rounded bg-black/70 text-xs text-white">
            <Users className="h-3 w-3" />
            <span>{formatCompactNumber(participantCount)}</span>
          </div>
        </div>

        <div className="w-full p-4 flex flex-col">
          <div className="pb-1 text-purple-600 text-sm font-medium truncate">
            {artistName}
          </div>
          <div className="w-full text-gray-900 text-sm font-bold truncate">
            {title}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;

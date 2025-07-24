import { Users } from "lucide-react";
import { formatCompactNumber } from "../../../utils/formatters";

type VideoCardProps = {
  isLive: boolean;
  // startTime?: string; -> DB에는 없는듯
  viewerCount: number;
  artistName: string;
  title: string;
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
  isLive,
  viewerCount,
  artistName,
  title,
}: VideoCardProps) => {
  const badgeText = isLive ? "LIVE" : "예정";
  const badgeClass = isLive
    ? "bg-red-500 text-white"
    : "bg-blue-500 text-white";

  return (
    <div className="w-full max-w-sm h-auto bg-white rounded-2xl shadow-sm outline outline-1 outline-gray-100 overflow-hidden flex flex-col">
      <div className="w-full aspect-video relative">
        <img
          className="w-full h-full object-cover"
          src="https://placehold.co/387x160"
        />
        <div
          className={`absolute top-3 left-3 px-2 h-6 inline-flex items-center gap-x-1.5 rounded-full text-xs font-bold text-white ${badgeClass}`}
        >
          <div className="w-2 h-2 bg-white rounded-full" />
          <span>{badgeText}</span>
        </div>

        <div className="absolute right-3 bottom-3 w-16 h-6 inline-flex justify-center items-center gap-x-1 rounded bg-black/70 text-xs text-white">
          <Users className="h-3 w-3" />
          <span>{formatCompactNumber(viewerCount)}</span>
        </div>
      </div>

      <div className="w-full p-4 flex flex-col">
        <div className="pb-1 text-purple-600 text-sm font-medium">
          {artistName}
        </div>
        <div className="w-full text-gray-900 text-sm font-bold truncate">
          {title}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;

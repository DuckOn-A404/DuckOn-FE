/*
  [필요한 props 내 생각..]
  1. LIVE 중인지 아닌지
    LIVE면 LIVE, 뱃지 빨간색
    아니면 예정, 뱃지 파란색
      근데 예정이라면 몇시에 시작하는지 정보를 받고 싶음
  2. 시청자 수
    숫자로 보여주기(근데 천명 단위 이상이면 K이런식으로)
  3. 아티스트 명
  4. 방 제목
    너무 길면 ...으로 줄여서
*/
import { Users } from "lucide-react";
import { formatCompactNumber } from "../../../utils/formatters";

type VideoCardProps = {
  isLive: boolean;
  // startTime?: string; -> DB에는 없는듯
  viewerCount: number;
  artistName: string;
  title: string;
};

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

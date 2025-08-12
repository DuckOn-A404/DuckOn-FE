import {User} from "lucide-react";

type LiveHeaderProps = {
  isHost: boolean;
  title: string;
  hostId: string;
  hostNickname: string;
  participantCount: number;
  onExit: () => void;
  onDelete?: () => void;
};

const LiveHeader = ({
  isHost,
  title,
  hostId,
  hostNickname,
  participantCount,
  onExit,
  onDelete,
}: LiveHeaderProps) => {
  return (
    <div className="bg-black text-white px-6 py-3 flex justify-between items-center border-b border-gray-800">
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          {title || "제목 없음"}
        </h1>
        <div className="text-sm text-gray-400 mt-1.5 flex items-center gap-x-4">
          <span>호스트: {hostNickname || "알 수 없음"}</span>
          <div className="flex items-center gap-x-1.5">
            <User size={15} className="text-gray-500" />
            <span>{participantCount}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-x-3">
        {isHost ? (
          onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              방 삭제
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={onExit}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            나가기
          </button>
        )}
      </div>
    </div>
  );
};

export default LiveHeader;

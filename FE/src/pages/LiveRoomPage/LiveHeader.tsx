import { User } from "lucide-react";

type LiveHeaderProps = {
  isHost: boolean;
  title: string;
  hostId: string;
  participandCount: number;
  onExit: () => void;
};

const LiveHeader = ({
  // isHost,
  title,
  hostId,
  participandCount,
  onExit,
}: LiveHeaderProps) => {
  return (
    <div className="bg-black text-white px-6 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold">{title || "제목 없음"}</h2>
        <div className="text-sm text-gray-300 mt-1 flex items-center gap-4">
          <span>호스트: {hostId || "알 수 없음"}</span>
          <span className="ml-4 flex items-center gap-1">
            <User size={16} />
            {participandCount}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* {isHost ? (
          <div>
            <Settings size={20} />
          </div>
        ) : (
          <div>
            <Siren size={20} color="red"/>
          </div>
        )} */}
        <button
          onClick={onExit}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
        >
          나가기
        </button>
      </div>
    </div>
  );
};

export default LiveHeader;

import { User, Siren, Settings } from "lucide-react";

type LiveHeaderProps = {
  isHost: boolean;
  title: string;
  hostId: string;
  participandCount: number;
  onExit: () => void;
}

const LiveHeader = ({ isHost, title, hostId, participandCount, onExit }: LiveHeaderProps) => {
  return (
    <div className="bg-black text-white px-6 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold">제목임둥{title}</h2>
        <div className="text-sm text-gray-300 mt-1 flex items-center gap-4">
          <span>호스트: {hostId}</span>
          <span className="ml-4 flex items-center gap-1">
            <User size={16} />
            {participandCount}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isHost ? (
          <div>
            <Settings size={20} />
          </div>
        ) : (
          <div>
            <Siren size={20} color="red"/>
          </div>
        )}
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

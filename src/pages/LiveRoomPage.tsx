import { useParams } from "react-router-dom";

const LiveRoomPage = () => {
  const { roomId } = useParams();

  return (
    <div>
      <h2>{roomId}번 방</h2>
    </div>
  );
};

export default LiveRoomPage;

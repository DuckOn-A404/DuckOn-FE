export type room = {
  roomId: number;
  title: string;
  hostId: string;
  hostNickname: string;
  hostProfileImgUrl: string;
  imgUrl: string | null;
  participantCount: number;
};

// 서버 enum과 매칭되는 프론트 타입(문자열 리터럴 유니온)
export type RoomSyncEventType = "SYNC_STATE" | "ROOM_DELETED" | "ROOM_UPDATE";

// 서버가 브로드캐스트하는 메시지 DTO
export type LiveRoomSyncDTO = {
  eventType: RoomSyncEventType;

  roomId: number;
  hostId: string;

  // ROOM_UPDATE에서 주로 오는 필드
  title?: string;
  hostNickname?: string;

  // SYNC_STATE에서 주로 오는 필드
  playlist?: string[];
  currentVideoIndex?: number;
  currentTime?: number;
  playing?: boolean;
  lastUpdated?: number;

  // 옵션: 서버가 같이 보낼 수도 있는 값
  participantCount?: number;
};

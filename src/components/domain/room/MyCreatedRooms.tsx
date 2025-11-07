import type { RoomHistory } from "../../../types/room";
import type { ReactNode } from "react";
import TruncatedTitle from "../../common/TruncatedTitle";

type Props = {
  rooms: RoomHistory[];
  title?: string;
  liveRoomId?: number | null;
  onEnterLive?: (roomId: number) => void;
  /** 제목 바로 아래에 꽂을 커스텀 필터/정렬 바 */
  filters?: ReactNode;
};

const NO_IMAGE = "https://placehold.co/1280x720?text=No+Image";

const MyCreatedRooms = ({
  rooms,
  title = "내가 만든 방",
  liveRoomId,
  onEnterLive,
  filters,
}: Props) => {
  const list = (rooms ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // "홍길동님이 만든 방" 패턴일 때 분리
  const madeBySuffix = "님이 만든 방";
  const isMadeByTitle = title.endsWith(madeBySuffix);
  const ownerName = isMadeByTitle
    ? title.slice(0, title.length - madeBySuffix.length)
    : "";
  const subText = isMadeByTitle ? "님이 만든 방" : "";

  const fmt = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="bg-white rounded-xl px-8 py-6 w-full max-w-[880px] mx-auto shadow-sm">
      {/* 제목 영역 */}
      {isMadeByTitle ? (
        <div className="mb-4 leading-snug">
          {/* 이름 줄 - 툴팁 포함 */}
          <TruncatedTitle title={ownerName} className="text-xl font-semibold" />
          {/* 설명 줄 - 동일한 두께로 맞춤 */}
          <div className="text-l font-semibold text-gray-700 mt-0.5">
            {subText}
          </div>
        </div>
      ) : (
        <h2 className="mb-4">
          <TruncatedTitle title={title} className="text-lg font-bold" />
        </h2>
      )}

      {/* 필터 바 */}
      {filters}

      {list.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((r) => {
            const isLive = liveRoomId != null && r.roomId === liveRoomId;
            return (
              <div
                key={r.roomId}
                className={`border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition ${
                  isLive ? "ring-2 ring-purple-500" : ""
                }`}
              >
                <div className="relative aspect-video bg-gray-50">
                  <img
                    src={r.imgUrl || NO_IMAGE}
                    alt={r.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isLive && (
                    <div className="absolute top-2 left-2 px-2 py-1 text-xs font-bold bg-red-500 text-white rounded">
                      LIVE
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="font-semibold line-clamp-1">{r.title}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    생성: {fmt(r.createdAt)}
                  </div>

                  <div className="mt-2 text-[11px] text-gray-600 flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                      {r.artistNameKr ??
                        r.artistNameEn ??
                        `artistId: ${r.artistId}`}
                    </span>
                  </div>

                  {isLive && (
                    <button
                      onClick={() => onEnterLive?.(r.roomId)}
                      className="mt-3 w-full px-3 py-2 rounded-md text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700"
                    >
                      입장하기
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {list.length === 0 && (
        <div className="text-center text-gray-500">
          <p>아직 만든 방이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default MyCreatedRooms;

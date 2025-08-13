import type { RoomHistory } from "../../../types/Room";

type Props = {
  rooms: RoomHistory[];
  title?: string;
};

const MyCreatedRooms = ({ rooms, title = "내가 만든 방" }: Props) => {
  const list = (rooms ?? [])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (!list.length) {
    return (
      <div className="bg-white rounded-xl px-8 py-6 w-full max-w-[880px] mx-auto shadow-sm">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="text-sm text-gray-500">아직 만든 방이 없습니다.</p>
      </div>
    );
  }

  const fmt = (iso: string) => {
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  };

  return (
    <div className="bg-white rounded-xl px-8 py-6 w-full max-w-[880px] mx-auto shadow-sm">
      <h2 className="text-lg font-bold mb-4">{title}</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((r) => (
          <div
            key={r.roomId}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition"
          >
            <div className="aspect-video bg-gray-50">
              <img
                src={r.imgUrl || "/default_room.png"}
                alt={r.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="p-4">
              <div className="font-semibold line-clamp-1">{r.title}</div>
              <div className="mt-1 text-xs text-gray-500">생성: {fmt(r.createdAt)}</div>

              <div className="mt-2 text-[11px] text-gray-600 flex flex-wrap gap-2">
                <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                  artistId: {r.artistId}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                  creator: {r.creatorId}
                </span>
              </div>

              {/* 입장/링크 없음: 히스토리 전용 */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCreatedRooms;

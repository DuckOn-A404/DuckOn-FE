import { useMemo, useState } from "react";
import type { RoomHistory, trendingRoom } from "../../../types/room";
import MyCreatedRooms from "./MyCreatedRooms";
import RangeCalendar from "../../common/RangeCalendar";
import TruncatedTitle from "../../common/TruncatedTitle";

type QuickRange = "all" | "7d" | "30d" | "thisYear";

type Props = {
  rooms: RoomHistory[];
  activeRoom?: trendingRoom | null;
  pageSize?: number;
  title?: string;
};

function startOfThisYear() {
  const d = new Date();
  return new Date(d.getFullYear(), 0, 1);
}
function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

const OtherUserRoomsPanel = ({
  rooms,
  activeRoom,
  pageSize = 12,
  title = "만든 방",
}: Props) => {
  const [quick, setQuick] = useState<QuickRange>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [artistId, setArtistId] = useState<number | "all">("all");
  const [visible, setVisible] = useState(pageSize);
  const [openCalendar, setOpenCalendar] = useState(false);

  // 긴 제목 잘라서 쓸 거
  const madeBySuffix = "님이 만든 방";
  const isMadeByTitle = title.endsWith(madeBySuffix);
  const ownerName = isMadeByTitle
    ? title.slice(0, title.length - madeBySuffix.length)
    : "";

  const artistOptions = useMemo(() => {
    const map = new Map<number, string>();
    (rooms ?? []).forEach((r) => {
      const label = r.artistNameKr ?? r.artistNameEn ?? `#${r.artistId}`;
      if (!map.has(r.artistId)) map.set(r.artistId, label);
    });
    return Array.from(map.entries()).sort((a, b) =>
      a[1].localeCompare(b[1], "ko")
    );
  }, [rooms]);

  const applyQuick = (q: QuickRange) => {
    setQuick(q);
    setVisible(pageSize);
    const now = new Date();
    if (q === "all") {
      setFrom("");
      setTo("");
      return;
    }
    if (q === "7d") {
      setFrom(addDays(now, -7).toISOString().slice(0, 10));
      setTo(now.toISOString().slice(0, 10));
      return;
    }
    if (q === "30d") {
      setFrom(addDays(now, -30).toISOString().slice(0, 10));
      setTo(now.toISOString().slice(0, 10));
      return;
    }
    if (q === "thisYear") {
      const s = startOfThisYear();
      setFrom(s.toISOString().slice(0, 10));
      setTo(now.toISOString().slice(0, 10));
    }
  };

  // 라이브 방 주입
  const merged = useMemo<RoomHistory[]>(() => {
    const base = (rooms ?? []).slice();
    if (!activeRoom) return base;

    const exists = base.some((r) => r.roomId === activeRoom.roomId);
    if (exists) return base;

    const injected: RoomHistory = {
      roomId: activeRoom.roomId,
      active: true,  // activeRoom은 현재 활성화된 방
      title: activeRoom.title,
      imgUrl: activeRoom.imgUrl,
      createdAt: new Date().toISOString(),
      creatorId: Number(activeRoom.hostId) || 0,  // string을 number로 변환
      artistId: activeRoom.artistId,
      artistNameEn: (activeRoom as any).artistNameEn,
      artistNameKr: (activeRoom as any).artistNameKr,
    };
    return [injected, ...base];
  }, [rooms, activeRoom]);

  // 필터 적용
  const filtered = useMemo(() => {
    const fromDate = from ? new Date(from + "T00:00:00") : null;
    const toDate = to ? new Date(to + "T23:59:59.999") : null;
    return merged
      .filter((r) => {
        if (!r?.createdAt) return true;
        const t = new Date(r.createdAt);
        if (Number.isNaN(t.getTime())) return true;
        if (fromDate && t < fromDate) return false;
        if (toDate && t > toDate) return false;
        if (artistId !== "all" && r.artistId !== artistId) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [merged, from, to, artistId]);

  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  // 필터 여부 / 미래 날짜 여부
  const now = new Date();
  const fromDateObj = from ? new Date(from + "T00:00:00") : null;
  const isFromInFuture =
    fromDateObj !== null && fromDateObj.getTime() > now.getTime();
  const isDateFiltered = quick !== "all" || !!from || !!to;

  // 필터 바
  const Filters = (
    <div className="mb-4">
      <div className="flex flex-wrap md:flex-nowrap md:whitespace-nowrap items-center gap-3">
        {/* 빠른 범위 */}
        <div className="flex items-center gap-2 flex-wrap basis-full md:basis-auto shrink-0">
          {[
            { k: "all", label: "전체" },
            { k: "7d", label: "최근 7일" },
            { k: "30d", label: "최근 30일" },
            { k: "thisYear", label: "올해" },
          ].map(({ k, label }) => (
            <button
              key={k}
              onClick={() => {
                applyQuick(k as QuickRange);
                setOpenCalendar(false);
              }}
              className={`px-3 py-1 rounded-full text-sm border transition ${
                quick === k
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 구분선 */}
        <div className="h-5 w-px bg-gray-200 hidden md:block shrink-0" />

        {/* 기간 */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOpenCalendar((o) => !o)}
            className="border rounded-md px-3 py-2 text-sm bg-white flex items-center gap-2 min-w-[190px]"
          >
            <span className="text-gray-500 text-xs">기간</span>
            <span className="text-gray-800">
              {from ? from : "시작일"}{" "}
              <span className="text-gray-400 mx-1">~</span>{" "}
              {to ? to : "종료일"}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-gray-400 ml-auto"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {openCalendar && (
            <div className="absolute z-50 mt-3">
              <RangeCalendar
                start={from}
                end={to}
                onChange={(s, e) => {
                  setFrom(s);
                  setTo(e);
                  setQuick("all");
                  setVisible(pageSize);
                }}
                onClose={() => setOpenCalendar(false)}
              />
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="h-5 w-px bg-gray-200 hidden md:block shrink-0" />

        {/* 아티스트 */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-xs text-gray-500 shrink-0">아티스트</div>
          <select
            value={artistId}
            onChange={(e) => {
              const v = e.target.value;
              setArtistId(v === "all" ? "all" : Number(v));
              setVisible(pageSize);
            }}
            className="border rounded-md px-2 py-2 text-sm w-[160px] sm:w-auto shrink-0 bg-white"
          >
            <option value="all">전체</option>
            {artistOptions.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[880px] mx-auto">
      {shown.length > 0 ? (
        <MyCreatedRooms
          rooms={shown}
          title={title}
          filters={Filters}
        />
      ) : (
        // 여기서도 제목을 TruncatedTitle로 찍어줘야 함
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {isMadeByTitle ? (
            <div className="mb-4 leading-snug">
              <TruncatedTitle
                title={ownerName}
                className="text-xl font-semibold"
              />
              <div className="text-l font-semibold text-gray-700 mt-0.5">
                님이 만든 방
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <TruncatedTitle title={title} className="text-lg font-bold" />
            </div>
          )}
          {Filters}
          <div className="py-10 text-center text-gray-400 text-sm">
            {isFromInFuture
              ? "아직 만든 방이 없습니다."
              : isDateFiltered
              ? "이 기간에는 방을 생성하지 않았습니다."
              : "아직 만든 방이 없습니다."}
          </div>
        </div>
      )}

      {hasMore && shown.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setVisible((v) => v + pageSize)}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
          >
            더 보기 ({shown.length}/{filtered.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default OtherUserRoomsPanel;

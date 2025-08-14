import { useMemo, useState } from "react";
import type { RoomHistory } from "../../../types/room";
import MyCreatedRooms from "./MyCreatedRooms";

type QuickRange = "all" | "7d" | "30d" | "thisYear";

type Props = {
  rooms: RoomHistory[];
  pageSize?: number;
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

const MyCreatedRoomsPanel = ({ rooms, pageSize = 12 }: Props) => {
  const [quick, setQuick] = useState<QuickRange>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [artistId, setArtistId] = useState<number | "all">("all");
  const [visible, setVisible] = useState<number>(pageSize);

  // 아티스트 옵션: 응답의 이름(kr > en > #id) 사용, 이름 기준 정렬
  const artistOptions = useMemo(() => {
    const map = new Map<number, string>();
    (rooms ?? []).forEach((r) => {
      const label = r.artistNameKr ?? r.artistNameEn ?? `#${r.artistId}`;
      if (!map.has(r.artistId)) map.set(r.artistId, label);
    });
    return Array.from(map.entries()).sort((a, b) =>
      a[1].localeCompare(b[1], "ko")
    ); // [["98","뉴진스"], ...]
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
    } else if (q === "30d") {
      setFrom(addDays(now, -30).toISOString().slice(0, 10));
      setTo(now.toISOString().slice(0, 10));
    } else if (q === "thisYear") {
      const s = startOfThisYear();
      setFrom(s.toISOString().slice(0, 10));
      setTo(now.toISOString().slice(0, 10));
    }
  };

  const filtered = useMemo(() => {
    const fromDate = from ? new Date(from + "T00:00:00") : null;
    const toDate = to ? new Date(to + "T23:59:59.999") : null;
    return (rooms ?? [])
      .filter((r) => {
        if (!r?.createdAt) return false;
        const t = new Date(r.createdAt);
        if (Number.isNaN(t.getTime())) return false;
        if (fromDate && t < fromDate) return false;
        if (toDate && t > toDate) return false;
        if (artistId !== "all" && r.artistId !== artistId) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [rooms, from, to, artistId]);

  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  return (
    <div className="w-full max-w-[880px] mx-auto">
      {/* 필터 바 */}
      <div className="bg-white rounded-xl px-6 py-4 mb-4 shadow-sm border border-gray-100">
        {/* 메인 컨테이너: flex-col로 두 줄 레이아웃을 만듭니다. */}
        <div className="flex flex-col gap-4">
          {/* 첫 번째 줄: 빠른 범위 버튼들 */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { k: "all", label: "전체" },
              { k: "7d", label: "최근 7일" },
              { k: "30d", label: "최근 30일" },
              { k: "thisYear", label: "올해" },
            ].map(({ k, label }) => (
              <button
                key={k}
                onClick={() => applyQuick(k as QuickRange)}
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

          {/* 두 번째 줄: 상세 필터들 (기간, 아티스트) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* 날짜 범위 */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 shrink-0">기간</div>
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setQuick("all");
                  setVisible(pageSize);
                }}
                className="border rounded-md px-2 py-1 text-sm w-full sm:w-auto"
              />
              <span className="text-gray-400">~</span>
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setQuick("all");
                  setVisible(pageSize);
                }}
                className="border rounded-md px-2 py-1 text-sm w-full sm:w-auto"
              />
            </div>

            {/* 아티스트 셀렉트 */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 shrink-0">아티스트</div>
              <select
                value={artistId}
                onChange={(e) => {
                  const v = e.target.value;
                  setArtistId(v === "all" ? "all" : Number(v));
                  setVisible(pageSize);
                }}
                className="border rounded-md px-2 py-1 text-sm w-full sm:w-auto"
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
      </div>

      {/* 리스트 */}
      <MyCreatedRooms rooms={shown} title="내가 만든 방" />

      {/* 더 보기 */}
      {hasMore && (
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

export default MyCreatedRoomsPanel;

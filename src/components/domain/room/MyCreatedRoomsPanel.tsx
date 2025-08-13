import { useMemo, useState } from "react";
import type { RoomHistory } from "../../../types/Room";
import MyCreatedRooms from "./MyCreatedRooms";

type QuickRange = "all" | "7d" | "30d" | "thisYear";

type Props = {
  rooms: RoomHistory[];
  artistMap?: Record<number, string>; // 선택: artistId → 이름 매핑(있으면 셀렉트에 이름 표시)
  pageSize?: number;                  // 기본 12개씩 보기
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

const MyCreatedRoomsPanel = ({ rooms, artistMap, pageSize = 12 }: Props) => {
  // --- 필터 상태 ---
  const [quick, setQuick] = useState<QuickRange>("all");
  const [from, setFrom] = useState<string>(""); // yyyy-MM-dd
  const [to, setTo] = useState<string>("");
  const [artistId, setArtistId] = useState<number | "all">("all");

  // --- 페이지네이션 ---
  const [visible, setVisible] = useState<number>(pageSize);

  // 유니크 아티스트 목록
  const artists = useMemo(() => {
    const ids = new Set<number>();
    rooms?.forEach((r) => ids.add(r.artistId));
    return Array.from(ids).sort((a, b) => a - b);
  }, [rooms]);

  // 빠른 범위 버튼 → 날짜 입력에 반영
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

  // 필터링
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
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [rooms, from, to, artistId]);

  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  return (
    <div className="w-full max-w-[980px] mx-auto">
      {/* 필터 바 */}
      <div className="bg-white rounded-xl px-6 py-4 mb-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-end gap-3">
          {/* 빠른 범위 */}
          <div className="flex items-center gap-2">
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

          {/* 날짜 범위 */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="text-xs text-gray-500">기간</div>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setQuick("all");
                setVisible(pageSize);
              }}
              className="border rounded-md px-2 py-1 text-sm"
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
              className="border rounded-md px-2 py-1 text-sm"
            />
          </div>

          {/* 아티스트 셀렉트 */}
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">아티스트</div>
            <select
              value={artistId}
              onChange={(e) => {
                const v = e.target.value;
                setArtistId(v === "all" ? "all" : Number(v));
                setVisible(pageSize);
              }}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="all">전체</option>
              {artists.map((id) => (
                <option key={id} value={id}>
                  {artistMap?.[id] ?? `artistId: ${id}`}
                </option>
              ))}
            </select>
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

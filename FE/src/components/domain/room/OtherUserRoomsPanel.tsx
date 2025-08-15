import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RoomHistory, trendingRoom } from "../../../types/room";
import MyCreatedRooms from "./MyCreatedRooms";
import { enterRoom } from "../../../api/roomService";

type Props = {
  rooms: RoomHistory[];
  activeRoom?: trendingRoom | null; // 레디스 현재방 (없으면 null)
  pageSize?: number;
  title?: string;
};

type QuickRange = "all" | "7d" | "30d" | "thisYear";

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
  const navigate = useNavigate();

  // 필터 상태들
  const [quick, setQuick] = useState<QuickRange>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [artistId, setArtistId] = useState<number | "all">("all");
  const [visible, setVisible] = useState<number>(pageSize);

  // 아티스트 옵션 (이름 기준 정렬)
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
      setFrom(""); setTo(""); return;
    }
    if (q === "7d")  {
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

  // 라이브 병합(중복 제거)
  const merged = useMemo<RoomHistory[]>(() => {
    const base = (rooms ?? []).slice();
    const hasLive = !!activeRoom;
    if (!hasLive) return base;

    const exists = base.some((r) => r.roomId === activeRoom!.roomId);
    if (exists) return base;

    const injected: RoomHistory = {
      roomId: activeRoom!.roomId,
      title: activeRoom!.title,
      imgUrl: activeRoom!.imgUrl,
      createdAt: new Date().toISOString(),
      creatorId: activeRoom!.hostId,
      artistId: activeRoom!.artistId,
      artistNameEn: (activeRoom as any).artistNameEn,
      artistNameKr: (activeRoom as any).artistNameKr,
    };
    return [injected, ...base];
  }, [rooms, activeRoom]);

  // 필터 적용
  const filtered = useMemo(() => {
    const fromDate = from ? new Date(from + "T00:00:00") : null;
    const toDate   = to   ? new Date(to   + "T23:59:59.999") : null;
    return merged
      .filter((r) => {
        if (!r?.createdAt) return true; // 주입카드 보호
        const t = new Date(r.createdAt);
        if (Number.isNaN(t.getTime())) return true;
        if (fromDate && t < fromDate) return false;
        if (toDate && t > toDate) return false;
        if (artistId !== "all" && r.artistId !== artistId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [merged, from, to, artistId]);

  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  const liveRoomId = activeRoom?.roomId ?? null;

  const handleEnterLive = async (roomId: number) => {
    try {
      await enterRoom(String(roomId), "");
      navigate(`/live/${roomId}`);
    } catch (err: any) {
      const q =
        err?.response?.data?.extra?.entryQuestion ||
        err?.response?.data?.entryQuestion ||
        err?.response?.data?.message;
      if (q) {
        const answer = window.prompt(q);
        if (answer === null) return;
        try {
          await enterRoom(String(roomId), answer);
          navigate(`/live/${roomId}`);
        } catch {
          alert("입장에 실패했습니다. 비밀번호/정답을 다시 확인해주세요.");
        }
      } else {
        alert("입장에 실패했습니다.");
      }
    }
  };

  // 🔽 제목 바로 아래에 넣는 반응형 필터 바 (sm↓ 2줄, md↑ 1줄 고정)
  const Filters = (
    <div className="mb-4">
      <div className="flex flex-wrap md:flex-nowrap md:whitespace-nowrap items-center gap-3">
        {/* 빠른 범위 버튼들 — 모바일에선 첫 줄 전폭 */}
        <div className="flex items-center gap-2 flex-wrap basis-full md:basis-auto shrink-0">
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

        {/* 구분선: md 이상에서만 보이도록 */}
        <div className="h-5 w-px bg-gray-200 hidden md:block shrink-0" />

        {/* 기간 필터 (입력 2개가 절대 줄바꿈되지 않도록 shrink-0) */}
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap shrink-0">
          <div className="text-xs text-gray-500 shrink-0">기간</div>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setQuick("all");
              setVisible(pageSize);
            }}
            className="border rounded-md px-2 py-1 text-sm w-[130px] sm:w-auto shrink-0"
          />
          <span className="text-gray-400 shrink-0">~</span>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setQuick("all");
              setVisible(pageSize);
            }}
            className="border rounded-md px-2 py-1 text-sm w-[130px] sm:w-auto shrink-0"
          />
        </div>

        {/* 구분선: md 이상에서만 */}
        <div className="h-5 w-px bg-gray-200 hidden md:block shrink-0" />

        {/* 아티스트 셀렉트 */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-xs text-gray-500 shrink-0">아티스트</div>
          <select
            value={artistId}
            onChange={(e) => {
              const v = e.target.value;
              setArtistId(v === "all" ? "all" : Number(v));
              setVisible(pageSize);
            }}
            className="border rounded-md px-2 py-1 text-sm w-[160px] sm:w-auto shrink-0"
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
      <MyCreatedRooms
        rooms={shown}
        title={title}
        liveRoomId={liveRoomId}
        onEnterLive={handleEnterLive}
        filters={Filters}
      />

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

export default OtherUserRoomsPanel;

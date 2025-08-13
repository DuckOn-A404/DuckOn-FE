import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RoomHistory, trendingRoom } from "../../../types/room";
import MyCreatedRooms from "./MyCreatedRooms";
import { enterRoom } from "../../../api/roomService";

type Props = {
  rooms: RoomHistory[];
  activeRoom?: trendingRoom | null;   // 레디스 현재방 (없으면 null)
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

const OtherUserRoomsPanel = ({ rooms, activeRoom, pageSize = 12, title = "만든 방" }: Props) => {
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
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1], "ko"));
  }, [rooms]);

  const applyQuick = (q: QuickRange) => {
    setQuick(q);
    setVisible(pageSize);
    const now = new Date();
    if (q === "all") { setFrom(""); setTo(""); return; }
    if (q === "7d")  { setFrom(addDays(now, -7).toISOString().slice(0,10));  setTo(now.toISOString().slice(0,10)); return; }
    if (q === "30d") { setFrom(addDays(now, -30).toISOString().slice(0,10)); setTo(now.toISOString().slice(0,10)); return; }
    if (q === "thisYear") {
      const s = startOfThisYear();
      setFrom(s.toISOString().slice(0,10)); setTo(now.toISOString().slice(0,10));
    }
  };

  // 라이브 병합(중복 제거): roomId가 히스토리에 있으면 그 카드만 "입장" 활성화.
  // 히스토리에 없으면 임시 카드 하나를 주입.
  const merged = useMemo<RoomHistory[]>(() => {
    const base = (rooms ?? []).slice();
    const hasLive = !!activeRoom;
    if (!hasLive) return base;

    const exists = base.some(r => r.roomId === activeRoom!.roomId);
    if (exists) return base;

    // 임시 카드 주입 (createdAt은 현재시각로 표시)
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

//   const handleEnterLive = (roomId: number) => {
//     // 보안 질문/잠금 방 처리는 방 페이지에서 진행한다고 가정
//     navigate(`/rooms/${roomId}`);
//   };
  const handleEnterLive = async (roomId: number) => {
    try {
      await enterRoom(String(roomId), "");
      navigate(`/live/${roomId}`);
    } catch (err: any) {
      const q = err?.response?.data?.extra?.entryQuestion
             || err?.response?.data?.entryQuestion
             || err?.response?.data?.message;
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


  return (
    <div className="w-full max-w-[980px] mx-auto">
      {/* 필터 바 */}
      <div className="bg-white rounded-xl px-6 py-4 mb-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-end gap-3">
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
                  quick === k ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 날짜 범위 */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="text-xs text-gray-500">기간</div>
            <input type="date" value={from} onChange={(e)=>{ setFrom(e.target.value); setQuick("all"); setVisible(pageSize); }} className="border rounded-md px-2 py-1 text-sm" />
            <span className="text-gray-400">~</span>
            <input type="date" value={to} onChange={(e)=>{ setTo(e.target.value); setQuick("all"); setVisible(pageSize); }} className="border rounded-md px-2 py-1 text-sm" />
          </div>

          {/* 아티스트 셀렉트 */}
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">아티스트</div>
            <select
              value={artistId}
              onChange={(e)=>{ const v = e.target.value; setArtistId(v==="all" ? "all" : Number(v)); setVisible(pageSize); }}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="all">전체</option>
              {artistOptions.map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 리스트 (라이브 방은 해당 카드에만 "입장하기" 버튼 노출) */}
      <MyCreatedRooms
        rooms={shown}
        title={title}
        liveRoomId={liveRoomId}
        onEnterLive={handleEnterLive}
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

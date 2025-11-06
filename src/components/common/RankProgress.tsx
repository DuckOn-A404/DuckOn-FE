// src/components/common/RankProgress.tsx
import React, { useState } from "react";
import RankingGuide from "./modal/RankingGuide";

const RANK_ORDER = ["GREEN", "YELLOW", "PURPLE", "GOLD", "VIP"] as const;
type RankLevel = (typeof RANK_ORDER)[number];

type RankProgressProps = {
  rankLevel: RankLevel;
  roomCreateCount?: number;
};

const rankLabelMap: Record<RankLevel, string> = {
  GREEN: "GREEN",
  YELLOW: "YELLOW",
  PURPLE: "PURPLE",
  GOLD: "GOLD",
  VIP: "VIP",
};

// 등급별 포인트 색만 관리
const rankStyleMap: Record<
  RankLevel,
  {
    accent: string; // 텍스트/점에만 쓸 색
    topTint: string; // 위쪽에만 살짝 끼울 색
  }
> = {
  GREEN: {
    accent: "#22c55e",
    topTint: "rgba(34,197,94,0.22)",
  },
  YELLOW: {
    accent: "#facc15",
    topTint: "rgba(250,204,21,0.22)",
  },
  PURPLE: {
    accent: "#a855f7",
    topTint: "rgba(168,85,247,0.22)",
  },
  GOLD: {
    accent: "#fbbf24",
    topTint: "rgba(251,191,36,0.22)",
  },
  VIP: {
    accent: "#38bdf8",
    topTint: "rgba(56,189,248,0.22)",
  },
};

const RankProgress: React.FC<RankProgressProps> = ({
  rankLevel,
  roomCreateCount,
}) => {
  const currentIndex = RANK_ORDER.indexOf(rankLevel);
  const style = rankStyleMap[rankLevel];
  const [open, setOpen] = useState(false);

  return (
    <>
        <div
        className="relative overflow-hidden rounded-2xl text-white p-5 sm:p-6 flex gap-4 sm:gap-6"
        style={{
            // 위에서만 살짝 색이 내려오는 느낌
            backgroundImage: `linear-gradient(to bottom, ${style.topTint} 0%, rgba(15,16,32,0) 35%), linear-gradient(to right, #0f1020, #141428)`,
        }}
        >
        {/* 왼쪽 */}
        <div className="flex-1 min-w-0">
            {/* 등급 이름 */}
            <div
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-2"
            style={{ color: style.accent }}
            >
            {rankLabelMap[rankLevel]}
            </div>

            {/* 서브텍스트 */}
            <div className="text-sm text-white/80 mb-6 flex items-center gap-1">
            {roomCreateCount !== undefined
                ? `${roomCreateCount}개 방 생성 · 참여도 등급`
                : "활동 등급"}
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-white/40 text-[10px] leading-none ml-1 hover:bg-white/10"
                >
                i
                </button>
            </div>

            {/* 진행 바 */}
            <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-white/10 rounded-full relative">
                {/* 채워진 부분 */}
                <div
                className="absolute left-0 top-0 h-1 rounded-full transition-all"
                style={{
                    width: `${(currentIndex / (RANK_ORDER.length - 1)) * 100}%`,
                    backgroundColor: style.accent,
                }}
                />
                {/* 점들 */}
                <div className="absolute inset-0 flex justify-between items-center">
                {RANK_ORDER.map((rank, idx) => {
                    const active = idx <= currentIndex;
                    return (
                    <div
                        key={rank}
                        className={`w-3 h-3 rounded-full border-2 transition-colors ${
                        active
                            ? "border-transparent"
                            : "bg-[#0f1020] border-white/25"
                        }`}
                        style={active ? { backgroundColor: style.accent } : {}}
                    />
                    );
                })}
                </div>
            </div>
            </div>

            {/* 아래 랭크 이름들 */}
            <div className="mt-3 flex justify-between text-[11px] sm:text-xs tracking-wide uppercase">
            {RANK_ORDER.map((rank, idx) => {
                const active = idx === currentIndex;
                return (
                <span
                    key={rank}
                    className={active ? "font-semibold" : "text-white/50"}
                    style={active ? { color: style.accent } : {}}
                >
                    {rank}
                </span>
                );
            })}
            </div>
        </div>

        {/* 오른쪽 배지 - 박스 없이 */}
        <div className="hidden sm:flex items-center justify-center">
            <img
            src={`/badge/${rankLevel.toLowerCase()}_badge.png`}
            alt={rankLevel}
            className="w-20 h-20 object-contain"
            />
        </div>
        </div>
        {open && (
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            >
                <div
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-gray-200 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                >
                {/* 헤더: sticky 삭제 + 흰색 배경 + 검정 텍스트 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                    <h2 className="text-base font-semibold text-gray-800">
                    🏆 덕온 랭킹 안내
                    </h2>
                    <button
                    onClick={() => setOpen(false)}
                    className="rounded-full px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
                    >
                    닫기
                    </button>
                </div>

                {/* 내용 부분도 흰색 배경으로 */}
                <div className="p-6 bg-white">
                    <RankingGuide/>
                </div>
                </div>
            </div>
        )}
    </>
  );
};

export default RankProgress;


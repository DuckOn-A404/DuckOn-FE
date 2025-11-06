// import React from "react";

type RankingGuideProps = {
  /** 상단 안내 메시지 (모달 헤더용 등으로 표시) */
  message?: string;
};

/**
 * 덕온 랭킹 시스템 안내 컴포넌트
 * - props로 message를 전달할 수 있음
 * - React + TypeScript + TailwindCSS
 */
const RankingGuide = ({ message }: RankingGuideProps) => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">
      {/* ✅ message가 있을 경우 상단에 추가 안내 표시 */}
      {message && (
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">{message}</h1>
        </div>
      )}

      {/* 헤더 */}
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          🏆 덕온 랭킹 시스템 안내
        </h1>
        <p className="text-muted-foreground text-base">
          덕온 랭킹은 <b>활동적인 팬들에게 주어지는 참여도 등급</b>이에요. 팬으로서 얼마나 꾸준히 소통하고,
          방을 만들고, 덕질에 참여하는지를 기반으로 <b>매일 자동 갱신</b>됩니다.
        </p>
      </section>

      {/* 등급 종류 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">🌈 등급 종류</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TierCard
            badge="VIP"
            color="bg-gradient-to-r from-sky-200 via-sky-400 to-sky-300"
            ringColor="ring-sky-300"
            desc="가장 활발하게 활동하는 팬! 덕온이 인정한 TOP 팬이에요."
            icon="🕊️"
          />
          <TierCard
            badge="GOLD"
            color="bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-200"
            ringColor="ring-yellow-300"
            desc="활발한 참여와 꾸준한 활동으로 커뮤니티를 이끄는 팬이에요."
            icon="🏅"
          />
          <TierCard
            badge="PURPLE"
            color="bg-gradient-to-r from-purple-100 via-purple-300 to-fuchsia-200"
            ringColor="ring-purple-300"
            desc="꾸준히 활동하고 있는 팬이에요."
            icon="💜"
          />
          <TierCard
            badge="YELLOW"
            color="bg-gradient-to-r from-yellow-50 via-yellow-200 to-amber-100"
            ringColor="ring-yellow-200"
            desc="덕질을 즐겁게 시작한 팬이에요."
            icon="🌼"
          />
          <TierCard
            badge="GREEN"
            color="bg-gradient-to-r from-emerald-50 via-emerald-200 to-green-100"
            ringColor="ring-emerald-200"
            desc="새로 합류한 팬! 앞으로의 활동이 기대돼요."
            icon="🍀"
          />
        </div>
      </section>

      {/* 갱신 주기 */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">📅 갱신 주기</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>등급은 매일 한 번, 전체 활동 데이터를 기반으로 자동 갱신돼요.</li>
          <li>채팅, 방 생성/참여 등 커뮤니티 내 활동에 따라 다음 날 등급이 달라질 수 있어요.</li>
        </ul>
      </section>

      {/* 혜택 */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">🎁 혜택 안내</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>등급 배지와 프로필 효과 제공</li>
          <li>상위 등급 전용 이벤트/굿즈 응모 기회</li>
          <li>리더보드 노출로 커뮤니티 내 인지도 상승 ✨</li>
        </ul>
        <p className="text-xs text-muted-foreground">
          * 혜택은 추후 업데이트될 수 있어요.
        </p>
      </section>

      {/* 참고사항 */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">💬 참고사항</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>
            등급은 <b>활동 참여도와 커뮤니티 기여도</b>를 바탕으로 자동 계산돼요.
          </li>
          <li>특정 행동만 반복한다고 해서 등급이 보장되지는 않아요.</li>
          <li>모든 유저는 동일한 기준으로 평가되며, 매일 새롭게 기회가 주어집니다.</li>
        </ul>
      </section>
    </div>
  );
};

export default RankingGuide;

/* 내부 카드 컴포넌트 */
function TierCard({
  badge,
  color,
  ringColor,
  desc,
  icon,
}: {
  badge: string;
  color: string;
  ringColor: string;
  desc: string;
  icon: string;
}) {
  return (
    <div
      className={[
        "rounded-2xl border shadow-sm p-5 flex items-start gap-4",
        "bg-white/60 backdrop-blur",
      ].join(" ")}
    >
      <div className={`shrink-0 ring-2 ${ringColor} rounded-full p-2`}>
        <span
          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold text-gray-900 ${color}`}
        >
          {icon} {badge}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

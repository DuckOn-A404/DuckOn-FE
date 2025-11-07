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
      {/* message가 있을 경우 상단에 추가 안내 표시 */}
      {message && (
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">{message}</h1>
        </div>
      )}

      {/* 헤더 */}
      <section className="text-center space-y-3">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold tracking-tight">
            <img
                src="/duck.svg" 
                alt="DuckOn Logo"
                className="w-8 h-8 object-contain"
            />
            덕온 랭킹 시스템 안내
        </h1>
        <p className="text-muted-foreground text-base">
          덕온 랭킹은 <b>활동적인 팬들에게 주어지는 참여도 등급</b>이에요. <br />팬으로서 얼마나 꾸준히 소통하고,
          방을 만들고, 덕질에 참여하는지를 기반으로 <b>매일 자동 갱신</b>됩니다.
        </p>
      </section>

      {/* 등급 종류 - 피라미드 버전 */}
<section className="space-y-4">
  <h2 className="text-xl font-semibold">🌈 등급 종류</h2>

  <div className="flex flex-col lg:flex-row gap-8 items-start">
    {/* 왼쪽: 피라미드 (RankProgress 팔레트 + 현재 텍스트색 유지) */}
    <div className="relative w-48 mx-auto lg:mx-0">
        {/* VIP */}
        <div
            className="rounded-l-[9999px] rounded-tr-[12px] rounded-br-[4px] h-12 ml-0 flex items-center justify-between px-4 text-sky-600 text-sm font-semibold shadow"
            style={{
            background: "linear-gradient(90deg, rgba(56,189,248,0.22), #38bdf8)",
            }}
        >
            <span>VIP</span>
            <span className="text-xs opacity-80">TOP</span>
        </div>

        {/* GOLD */}
        <div
            className="rounded-l-[9999px] rounded-tr-[12px] rounded-br-[4px] h-12 ml-3 mt-2 flex items-center justify-between px-4 text-yellow-600 text-sm font-semibold shadow"
            style={{
            background: "linear-gradient(90deg, rgba(251,191,36,0.22), #fbbf24)",
            }}
        >
            <span>GOLD</span>
            <span className="text-xs opacity-70">활발</span>
        </div>

        {/* PURPLE */}
        <div
            className="rounded-l-[9999px] rounded-tr-[12px] rounded-br-[4px] h-12 ml-6 mt-2 flex items-center justify-between px-4 text-purple-600 text-sm font-semibold shadow"
            style={{
            background: "linear-gradient(90deg, rgba(168,85,247,0.22), #a855f7)",
            }}
        >
            <span>PURPLE</span>
            <span className="text-xs opacity-70">꾸준</span>
        </div>

        {/* YELLOW */}
        <div
            className="rounded-l-[9999px] rounded-tr-[12px] rounded-br-[4px] h-12 ml-9 mt-2 flex items-center justify-between px-4 text-amber-600 text-sm font-semibold shadow"
            style={{
            background: "linear-gradient(90deg, rgba(250,204,21,0.22), #facc15)",
            }}
        >
            <span>YELLOW</span>
            <span className="text-xs opacity-70">시작</span>
        </div>

        {/* GREEN */}
        <div
            className="rounded-l-[9999px] rounded-tr-[12px] rounded-br-[4px] h-12 ml-12 mt-2 flex items-center justify-between px-4 text-emerald-600 text-sm font-semibold shadow"
            style={{
            background: "linear-gradient(90deg, rgba(34,197,94,0.22), #22c55e)",
            }}
        >
            <span>GREEN</span>
            <span className="text-xs opacity-70">신규</span>
        </div>
    </div>


    {/* 오른쪽: 실제 배지 + 한 줄 설명 */}
    <div className="flex-1 space-y-4">
      {/* VIP */}
      <div className="flex items-center gap-3">
        <img
          src="/badge/vip_badge.png"
          alt="VIP Badge"
          className="w-10.5 h-10.5 object-contain"
        />
        <p className="text-sm text-gray-700">
          <b>가장 활발하게 활동하는 팬!</b> 덕온이 인정한 TOP 팬이에요.
        </p>
      </div>

      {/* GOLD */}
      <div className="flex items-center gap-3">
        <img src="/badge/gold_badge.png" alt="Gold Badge" className="w-10.5 h-10.5 object-contain" />
        <p className="text-sm text-gray-700">
          <b>활발한 참여와 꾸준한 활동</b>으로 커뮤니티를 이끄는 팬이에요.
        </p>
      </div>

      {/* PURPLE */}
      <div className="flex items-center gap-3">
        <img src="/badge/purple_badge.png" alt="Purple Badge" className="w-10.5 h-10.5 object-contain" />
        <p className="text-sm text-gray-700"><b>꾸준히 활동</b>하고 있는 팬이에요.</p>
      </div>

      {/* YELLOW */}
      <div className="flex items-center gap-3">
        <img src="/badge/yellow_badge.png" alt="Yellow Badge" className="w-10.5 h-10.5 object-contain" />
        <p className="text-sm text-gray-700"><b>덕질을 즐겁게 시작</b>한 팬이에요.</p>
      </div>

      {/* GREEN */}
      <div className="flex items-center gap-3">
        <img src="/badge/green_badge.png" alt="Green Badge" className="w-10.5 h-10.5 object-contain" />
        <p className="text-sm text-gray-700">
          <b>새로 합류한 팬!</b> 앞으로의 활동이 기대돼요.
        </p>
      </div>
    </div>
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


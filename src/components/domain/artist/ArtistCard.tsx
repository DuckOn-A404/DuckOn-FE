import {useRef, useState} from "react";
import {Users} from "lucide-react";
import {motion, useMotionValue, useSpring, useTransform} from "framer-motion";

type ArtistCardProps = {
  artistId: number;
  nameEn: string;
  nameKr: string;
  imgUrl: string;
  followerCount?: number;
  onClick: () => void;
};

const PLACEHOLDER_URL =
  "https://placehold.co/240x240/f8f8f8/999999?text=No+Image&font=roboto";

/**
 * Cursor-locked Spot Border (wider trail)
 * - 기존 디자인 유지, 스팟 반경과 페이드를 확 늘려서 "보더가 더 길게" 보이게
 * - farthest-side 로 중앙에서도 보더에 닿도록
 * - padding(=border width) 살짝 증가해 선도 더 선명
 */
export default function ArtistCard({
  nameEn,
  nameKr,
  imgUrl,
  followerCount,
  onClick,
}: ArtistCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);

  // tilt
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const rx = useSpring(useTransform(ty, [-50, 50], [8, -8]), {stiffness: 220, damping: 20});
  const ry = useSpring(useTransform(tx, [-50, 50], [-10, 10]), {stiffness: 220, damping: 20});
  const scale = useSpring(1, {stiffness: 220, damping: 20});

  const [vars, setVars] = useState<React.CSSProperties>({
    ["--mx" as any]: "50%",
    ["--my" as any]: "50%",
    ["--bw" as any]: "2.5px", // 보더 두께 살짝 업
    // 색감 동일
    ["--glow" as any]: "rgba(168,85,247,.96)",
    ["--glow2" as any]: "rgba(236,72,153,.96)",
    ["--halo" as any]: "rgba(251,191,36,.90)",
    // 스팟 크기(대폭 증가) → 보더가 더 길게 보임
    ["--spot" as any]: "420px", // 원래 120px 근처였던 걸 크게
  });

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;

    // tilt (±50 범위)
    const px = e.clientX - (r.left + r.width / 2);
    const py = e.clientY - (r.top + r.height / 2);
    tx.set(Math.max(-50, Math.min(50, px / 4)));
    ty.set(Math.max(-50, Math.min(50, py / 4)));

    setVars(v => ({...v, ["--mx" as any]: `${x}%`, ["--my" as any]: `${y}%`}));
  };

  const onEnter = () => {setHovered(true); scale.set(1.02);};
  const onLeave = () => {setHovered(false); tx.set(0); ty.set(0); scale.set(1);};

  const thumbnailUrl = imgUrl || PLACEHOLDER_URL;

  return (
    <motion.div
      ref={ref}
      style={{rotateX: rx, rotateY: ry, scale}}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => {if (e.key === "Enter" || e.key === " ") onClick();}}
      className="group relative w-[176px] select-none cursor-pointer outline-none"
      aria-label={`${nameKr} 아티스트 카드`}
      role="button"
    >
      {/* ✅ 보더 네온 (더 길게 보이도록 확장) */}
      <div
        aria-hidden
        style={{
          ...vars,
          // farthest-side 로 중앙에서도 보더에 닿고,
          // spot/페이드 비율을 넓혀서 라인이 길게 따라옴
          background: `
            radial-gradient(farthest-side at var(--mx) var(--my),
              var(--glow) 0%,
              var(--glow2) 20%,
              var(--halo) 38%,
              rgba(168,85,247,0) 85%)
          `,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "var(--bw)",
          borderRadius: "18px",
          opacity: hovered ? 1 : 0,
          transition: "opacity .16s ease",
          // 라인 강조감 ↑
          boxShadow: hovered ? "0 24px 70px rgba(147, 51, 234, .22)" : "none",
          // 스팟 크기 적용 (Safari 대응을 위해 배경 크기 대신 변수만)
          // 추가 확산 느낌
          filter: "saturate(1.1) blur(.0px)",
        } as React.CSSProperties}
        className="pointer-events-none absolute -inset-px"
      />

      {/* 카드 본체 (그대로) */}
      <div className="relative rounded-2xl bg-white/90 backdrop-blur-sm border border-white/70 shadow-sm overflow-hidden">
        <div className="pointer-events-none absolute -top-20 left-0 right-0 h-32 bg-white/40 blur-2xl" />
        <div className="p-5 pb-3">
          <div className="relative mx-auto w-[136px] h-[136px] rounded-2xl overflow-hidden ring-1 ring-black/5">
            <motion.img
              src={thumbnailUrl}
              alt={nameEn}
              className="w-full h-full object-cover"
              initial={false}
              animate={{scale: hovered ? 1.06 : 1}}
              transition={{type: "spring", stiffness: 120, damping: 15}}
              onError={(e) => {(e.currentTarget as HTMLImageElement).src = PLACEHOLDER_URL;}}
            />
            <motion.div
              className="absolute top-2 right-2"
              initial={{opacity: 0, scale: 0.8}}
              animate={{opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8}}
              transition={{duration: 0.16}}
            >
            </motion.div>
          </div>
        </div>

        <div className="px-5 pb-4 text-center">
          <p className="font-extrabold text-[17px] text-gray-900 truncate" title={nameKr}>{nameKr}</p>
          <p className="text-[13px] text-gray-500 truncate" title={nameEn}>{nameEn}</p>
          {typeof followerCount === "number" && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              <Users className="h-4 w-4" />
              <span className="font-semibold">{followerCount.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-6 -bottom-2 h-4 blur-xl bg-black/10 rounded-full" />
      </div>
    </motion.div>
  );
}

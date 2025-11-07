// src/components/common/RankBadge.tsx
import React from "react";

type RankLevel = "VIP" | "GOLD" | "PURPLE" | "YELLOW" | "GREEN";

interface RankBadgeProps {
  rankLevel?: RankLevel;
  size?: number;
  className?: string;
}

/**
 * 랭크 이미지들은 public/badge 에 넣어둔다.
 * 예) /public/badge/vip_badge.png -> /badge/vip_badge.png 로 접근
 */
const RankBadge: React.FC<RankBadgeProps> = ({
  rankLevel = "GREEN",
  size = 18,
  className = "",
}) => {
  const rankImageMap: Record<RankLevel, string> = {
    VIP: "/badge/vip_badge.png",
    GOLD: "/badge/gold_badge.png",
    PURPLE: "/badge/purple_badge.png",
    YELLOW: "/badge/yellow_badge.png",
    GREEN: "/badge/green_badge.png",
  };

  const src = rankLevel ? rankImageMap[rankLevel] : rankImageMap.GREEN;

  return (
    <img
      src={src}
      alt={rankLevel}
      width={size}
      height={size}
      className={`inline-block align-middle ml-1 ${className}`}
    />
  );
};

export default RankBadge;

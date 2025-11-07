export type RankLevel = "VIP" | "GOLD" | "PURPLE" | "YELLOW" | "GREEN";

export type UserRank = {
  roomCreateCount: number;
  rankLevel: RankLevel;
};

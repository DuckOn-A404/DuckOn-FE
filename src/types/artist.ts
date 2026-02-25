export interface Artist {
  artistId: number;
  nameEn: string;
  nameKr: string;
  debutDate: string;
  imgUrl: string;
  followerCount?: number;
  isEmerging?: boolean;
}

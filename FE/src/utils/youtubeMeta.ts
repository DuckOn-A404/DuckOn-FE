export type YouTubeMeta = {
  title: string;
  author: string;   // channel name
  thumbnail: string;
};

const metaCache = new Map<string, YouTubeMeta>();

export async function fetchYouTubeMeta(videoId: string): Promise<YouTubeMeta | null> {
  if (!videoId) return null;
  if (metaCache.has(videoId)) return metaCache.get(videoId)!;

  const oembed = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

  try {
    const res = await fetch(oembed, { method: "GET" });
    if (!res.ok) throw new Error(`oEmbed ${res.status}`);
    const data = await res.json();
    const meta: YouTubeMeta = {
      title: data?.title ?? "",
      author: data?.author_name ?? "",
      thumbnail: data?.thumbnail_url ?? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
    metaCache.set(videoId, meta);
    return meta;
  } catch {
    // 실패해도 썸네일은 제공
    const fallback: YouTubeMeta = {
      title: "",
      author: "",
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
    metaCache.set(videoId, fallback);
    return fallback;
  }
}

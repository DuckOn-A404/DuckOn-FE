export type YouTubeMeta = { title: string; author: string; thumbnail: string };

const metaCache = new Map<string, YouTubeMeta>();

export async function fetchYouTubeMeta(videoId: string): Promise<YouTubeMeta | null> {
  if (!videoId) return null;
  if (metaCache.has(videoId)) return metaCache.get(videoId)!;

  try {
    const res = await fetch(`/api/public/youtube/meta/${videoId}`, { method: "GET" });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const meta: YouTubeMeta = {
      title: data?.title ?? "",
      author: data?.author ?? "",
      thumbnail: data?.thumbnail ?? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
    metaCache.set(videoId, meta);
    return meta;
  } catch {
    const fallback = {
      title: "",
      author: "",
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
    metaCache.set(videoId, fallback);
    return fallback;
  }
}

/**
 * 유튜브 썸네일 URL을 고화질로 변환
 * 
 * 유튜브 썸네일 화질 옵션:
 * - default.jpg: 120x90 (최저화질)
 * - mqdefault.jpg: 320x180 (중화질)
 * - hqdefault.jpg: 480x360 (고화질)
 * - sddefault.jpg: 640x480 (SD)
 * - maxresdefault.jpg: 1280x720 (최고화질, 일부 비디오에만 존재)
 */
export const getHighQualityThumbnail = (thumbnailUrl: string | null | undefined): string => {
  console.log("🔍 [thumbnailUtils] Original URL:", thumbnailUrl);
  
  if (!thumbnailUrl) return "";
  
  // 유튜브 썸네일 URL이 아니면 그대로 반환
  if (!thumbnailUrl.includes("img.youtube.com/vi/")) {
    console.log("⚠️ [thumbnailUtils] Not a YouTube thumbnail URL");
    return thumbnailUrl;
  }
  
  // 현재 화질 표시자를 고화질로 교체
  // maxresdefault가 없을 수 있으므로 sddefault 사용 (640x480)
  const highQualityUrl = thumbnailUrl
    .replace(/\/default\.jpg/, "/sddefault.jpg")
    .replace(/\/mqdefault\.jpg/, "/sddefault.jpg")
    .replace(/\/hqdefault\.jpg/, "/sddefault.jpg");
  
  console.log("✅ [thumbnailUtils] Converted to SD:", highQualityUrl);
  return highQualityUrl;
};

/**
 * 유튜브 썸네일 URL을 최고화질로 변환 (1280x720)
 * maxresdefault가 없을 경우 sddefault(640x480)로 fallback
 */
export const getMaxQualityThumbnail = (thumbnailUrl: string | null | undefined): string => {
  console.log("🔍 [thumbnailUtils MAX] Original URL:", thumbnailUrl);
  
  if (!thumbnailUrl) {
    console.log("❌ [thumbnailUtils MAX] URL is null or undefined");
    return "";
  }
  
  // 유튜브 썸네일 URL이 아니면 그대로 반환
  if (!thumbnailUrl.includes("img.youtube.com/vi/")) {
    console.log("⚠️ [thumbnailUtils MAX] Not a YouTube thumbnail URL - returning original");
    console.log("   URL does not contain 'img.youtube.com/vi/'");
    return thumbnailUrl;
  }
  
  // sddefault로 변환 (더 안정적, 대부분의 영상에 존재)
  const highQualityUrl = thumbnailUrl
    .replace(/\/default\.jpg/g, "/sddefault.jpg")
    .replace(/\/mqdefault\.jpg/g, "/sddefault.jpg")
    .replace(/\/hqdefault\.jpg/g, "/sddefault.jpg");
  
  console.log("✅ [thumbnailUtils MAX] Converted to SD (640x480):", highQualityUrl);
  console.log("   Note: Using sddefault instead of maxresdefault for better compatibility");
  return highQualityUrl;
};

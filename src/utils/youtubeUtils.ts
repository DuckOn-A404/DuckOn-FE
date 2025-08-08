/**
 * 다양한 형태의 YouTube URL에서 비디오 ID를 추출합니다.
 * @param url - 검사할 YouTube URL 문자열
 * @returns 추출된 비디오 ID 또는 null (유효하지 않은 경우)
 */
export const extractVideoId = (url: string): string | null => {
  // YouTube 비디오 ID를 찾기 위한 정규식
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);

  return match ? match[1] : null;
};

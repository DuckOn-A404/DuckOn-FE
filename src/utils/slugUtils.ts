/**
 * 문자열을 URL에 사용 가능한 슬러그(slug) 형태로 변환합니다.
 * @param {string} text - 변환할 텍스트
 * @returns {string} 변환된 슬러그
 */
export const createSlug = (text: string) => {
  if (!text) return "";

  return (
    text
      .toString()
      // 1. 모두 소문자로 변환
      .toLowerCase()
      // 2. 앞뒤 공백 제거
      .trim()
      // 3. URL에 포함될 수 없는 특수문자 제거 (알파벳, 숫자, 공백, 하이픈(-)만 남김)
      .replace(/[^\w\s-]/g, "")
      // 4. 공백 및 여러 개의 하이픈을 단일 하이픈으로 교체
      .replace(/[\s_-]+/g, "-")
      // 5. 맨 앞이나 맨 뒤에 있을 수 있는 하이픈 제거
      .replace(/^-+|-+$/g, "")
  );
};

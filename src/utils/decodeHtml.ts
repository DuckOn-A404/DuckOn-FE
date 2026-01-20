/**
 * HTML entities를 디코딩하여 일반 텍스트로 변환
 * 예: "&#39;" -> "'"
 */
export const decodeHtmlEntities = (text: string): string => {
  if (!text) return text;

  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
};

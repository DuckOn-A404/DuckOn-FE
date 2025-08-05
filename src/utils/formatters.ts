/**
 * 함수명 : formatCompactNumber
 * 숫자를 간결한 형태의 문자열로 변환
 * 1,000 이상은 'K'로, 1,000,000 이상은 쉼표(,)로 포맷
 * @param {number} count - 포맷할 숫자
 * @returns {string} - 변환된 문자열 (예: 999, 1.2K, 1,234,567)
 */
export function formatCompactNumber(num: number | undefined | null) {
  if (!num) {
    return "0";
  }

  if (num >= 10000) {
    return `${(num / 10000).toFixed(1).replace(/\.0$/, "")}만`;
  }

  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

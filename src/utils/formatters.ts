/**
 * 함수명 : formatCompactNumber
 * 숫자를 간결한 형태의 문자열로 변환
 * 1,000 이상은 'K'로, 1,000,000 이상은 쉼표(,)로 포맷
 * @param {number} count - 포맷할 숫자
 * @returns {string} - 변환된 문자열 (예: 999, 1.2K, 1,234,567)
 */
export const formatCompactNumber = (count: number): string => {
  if (count >= 1000000) {
    return count.toLocaleString("en-US");
  }
  if (count >= 1000) {
    const thousands = (count / 1000).toFixed(1);
    return (
      (thousands.endsWith(".0") ? thousands.slice(0, -2) : thousands) + "K"
    );
  }
  return count.toString();
};

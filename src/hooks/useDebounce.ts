import { useEffect, useState } from "react";

/**
 * 주어진 값이 일정 시간 후에만 변경되도록 디바운스 처리합니다.
 * @param value - 디바운스를 적용할 값
 * @param delay - 지연 시간 (ms), 기본값: 300ms
 * @returns 디바운스된 값
 */
export const useDebounce = <T>(value: T, delay = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer); // 값이 변경될 때 이전 타이머 제거
  }, [value, delay]);

  return debouncedValue;
};

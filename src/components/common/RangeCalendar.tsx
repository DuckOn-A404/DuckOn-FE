import React, { useEffect, useRef, useState } from "react";

type RangeCalendarProps = {
  start?: string;
  end?: string;
  onChange: (nextStart: string, nextEnd: string) => void;
  min?: string;
  max?: string;
  onClose?: () => void;
};

const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

function toYMD(d: Date) {
  return d.toISOString().slice(0, 10);
}

function makeMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startWeek = first.getDay();
  return { year, month, startWeek, lastDate };
}

function isSameDay(a?: string, b?: string) {
  return !!a && !!b && a === b;
}

function inRange(d: string, start?: string, end?: string) {
  if (!start || !end) return false;
  return d >= start && d <= end;
}

export default function RangeCalendar({
  start,
  end,
  onChange,
  min,
  max,
  onClose,
}: RangeCalendarProps) {
  // "" 로 들어온 것도 undefined 처럼 다룰 수 있게 정규화
  const normStart = start || undefined;
  const normEnd = end || undefined;

  // 기준 달
  const base = normStart ? new Date(normStart + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(base.getFullYear());
  const [viewMonth, setViewMonth] = useState(base.getMonth()); // 0~11

  const ref = useRef<HTMLDivElement>(null);

  // 바깥 클릭 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const minDate = min ? new Date(min + "T00:00:00") : null;
  const maxDate = max ? new Date(max + "T00:00:00") : null;

  const monthInfo = makeMonth(viewYear, viewMonth);

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const goNext = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelect = (dateStr: string) => {
    const dateObj = new Date(dateStr + "T00:00:00");
    if (minDate && dateObj < minDate) return;
    if (maxDate && dateObj > maxDate) return;

    // 1. 시작이 없으면 시작만
    if (!normStart) {
      onChange(dateStr, "");
      return;
    }

    // 2. 시작만 있고 끝이 없으면 끝 선택
    if (normStart && !normEnd) {
      if (dateStr < normStart) {
        // 시작보다 앞 = 새로 시작
        onChange(dateStr, "");
      } else {
        onChange(normStart, dateStr);
      }
      return;
    }

    // 3. 둘 다 있으면 다시 시작
    onChange(dateStr, "");
  };

  const renderMonth = (info: ReturnType<typeof makeMonth>) => {
    const { year, month, startWeek, lastDate } = info;
    const cells: React.ReactNode[] = [];

    // 앞쪽 공백
    for (let i = 0; i < startWeek; i++) {
      cells.push(<div key={`empty-${i}`} />);
    }

    for (let day = 1; day <= lastDate; day++) {
      const d = new Date(year, month, day);
      const dStr = toYMD(d);
      // 여기서 boolean 확정시켜줌
      const disabled = !!(
        (minDate && d < minDate) ||
        (maxDate && d > maxDate) ||
        (normStart && !normEnd && dStr < normStart)
      );

      const isStart = isSameDay(dStr, normStart);
      const isEnd = isSameDay(dStr, normEnd);
      const isInRange = inRange(dStr, normStart, normEnd);

      // start~end가 있고, 지금 이 날짜가 그 안에 있으면 배경바를 깔아줌
      const shouldShowBg =
        (isInRange && !isStart && !isEnd) ||
        (isStart && normEnd && !isSameDay(normStart, normEnd)) ||
        (isEnd && normStart && !isSameDay(normStart, normEnd));

      // 배경바 왼쪽/오른쪽 얼마나 채울지
      let bgClass = "left-0 right-0";
      if (isStart && normEnd && !isSameDay(normStart, normEnd)) {
        bgClass = "left-1/2 right-0";
      } else if (isEnd && normStart && !isSameDay(normStart, normEnd)) {
        bgClass = "left-0 right-1/2";
      }

      cells.push(
        <div key={dStr} className="relative flex items-center justify-center">
          {shouldShowBg && (
            <div
              className={`absolute ${bgClass} top-2 bottom-2 bg-purple-50 rounded-full pointer-events-none`}
            />
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleSelect(dStr)}
            className={[
              "relative z-[1] h-9 w-9 flex items-center justify-center rounded-full text-sm transition",
              disabled
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-purple-50",
              isStart || isEnd
                ? "bg-purple-500 text-white hover:bg-purple-500"
                : "",
            ].join(" ")}
          >
            {day}
          </button>
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="text-center font-semibold text-gray-800 mb-3">
          {year}년 {month + 1}월
        </div>
        <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
          {dayLabels.map((d, idx) => (
            <div key={d} className={idx === 0 ? "text-red-300" : ""}>
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">{cells}</div>
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className="w-[360px] bg-white rounded-3xl shadow-[0_12px_35px_rgba(15,23,42,0.08)] border border-gray-100 p-5"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-2 bg-gray-100 rounded-full p-1">
          <button className="px-4 py-1 rounded-full bg-white text-sm font-medium text-gray-800 shadow-sm">
            날짜 지정
          </button>
        </div>
        <div className="flex-1" />
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ‹
          </button>
          <button
            onClick={goNext}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ›
          </button>
        </div>
      </div>

      {/* 달력 */}
      {renderMonth(monthInfo)}

      {/* 하단 */}
      <div className="mt-5 flex justify-between items-center">
        <button
          onClick={() => onChange("", "")}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          날짜 지우기
        </button>
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-full bg-purple-500 text-white text-sm font-medium hover:bg-purple-600"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

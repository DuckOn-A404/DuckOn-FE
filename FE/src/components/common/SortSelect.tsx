import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, ChevronDown, Check } from "lucide-react";

export type SortKey = "followers" | "name" | "debut";
export type SortOrder = "asc" | "desc";
export type SortOption = { label: string; key: SortKey; order: SortOrder };

type Props = {
  value: { key: SortKey; order: SortOrder };
  options: SortOption[];
  onChange: (next: { key: SortKey; order: SortOrder }) => void;
  className?: string;
};

export default function SortSelect({
  value,
  options,
  onChange,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);
  const ref = useRef<HTMLDivElement | null>(null);

  const selectedIndex = useMemo(
    () =>
      options.findIndex((o) => o.key === value.key && o.order === value.order),
    [options, value]
  );

  // 바깥 클릭 닫기
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // 열릴 때 하이라이트 초기화
  useEffect(() => {
    if (open) setHighlight(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, selectedIndex]);

  const commit = (idx: number) => {
    const opt = options[idx];
    if (!opt) return;
    onChange({ key: opt.key, order: opt.order });
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (
      !open &&
      (e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "Enter" ||
        e.key === " ")
    ) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(options.length - 1, h < 0 ? 0 : h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h < 0 ? 0 : h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit(highlight >= 0 ? highlight : selectedIndex);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`} onKeyDown={onKeyDown}>
      {/* 버튼 (InputField 무드 복제) */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="
          w-full h-12 pl-12 pr-10
          bg-white rounded-xl border border-gray-300
          text-gray-800 text-base leading-normal text-left
          shadow-sm hover:border-gray-300
          focus:outline-none focus:ring-2 focus:ring-purple-500
          transition
          relative
        "
        onClick={() => setOpen((v) => !v)}
      >
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <ArrowUpDown className="h-5 w-5 text-gray-400" aria-hidden />
        </span>
        <span>{options[selectedIndex]?.label ?? "정렬"}</span>
        <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </span>
      </button>

      {/* 드롭다운 */}
      {open && (
        <ul
          role="listbox"
          className="
            absolute z-50 mt-1 w-full
            bg-white rounded-xl border border-gray-200
            shadow-lg ring-1 ring-black/5
            overflow-hidden
          "
        >
          {options.map((o, i) => {
            const selected = i === selectedIndex;
            const active = i === highlight;
            return (
              <li
                key={`${o.key}:${o.order}`}
                role="option"
                aria-selected={selected}
                className={`
                  flex items-center justify-between
                  px-3.5 py-2.5 cursor-pointer
                  ${active ? "bg-fuchsia-50" : ""}
                  ${selected ? "font-medium text-gray-900" : "text-gray-700"}
                  hover:bg-fuchsia-50
                `}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(i)}
              >
                <span>{o.label}</span>
                {selected && (
                  <Check className="h-4 w-4 text-fuchsia-500" aria-hidden />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

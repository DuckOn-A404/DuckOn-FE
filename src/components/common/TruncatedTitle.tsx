import { useState } from "react";

type Props = {
  title: string;
  className?: string;
};

export default function TruncatedTitle({ title, className = "" }: Props) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`relative inline-block max-w-[320px] ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* 줄여서 보여줄 제목 */}
      <div className="truncate cursor-default">{title}</div>

      {/* 예쁜 툴팁 */}
      {hover && (
        <div className="absolute left-0 top-full mt-2 z-50">
          <div
            className="
              relative
              bg-[#F1F5F9] text-[#334155] text-xs font-medium
              border border-[#CBD5E1]
              px-3 py-2 rounded-lg shadow-lg
              whitespace-nowrap break-all
            "
          >
            {title}
            {/* 꼬다리 */}
            <span
              className="
                absolute -top-1 left-4 w-2 h-2
                bg-[#F1F5F9] rotate-45 border-l border-t border-[#CBD5E1]
              "
            />
          </div>
        </div>
      )}
    </div>
  );
}

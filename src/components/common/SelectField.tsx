import React from "react";
import { ChevronDown } from "lucide-react";

// <option> 태그를 만들기 위한 데이터 형식
type SelectOption = {
  value: string | number;
  label: string;
};

// SelectField가 받을 props 타입
type SelectFieldProps = {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  error?: string;
  helperText?: string;
};

const SelectField = ({
  id,
  label,
  icon,
  value,
  onChange,
  options,
  error,
  helperText,
}: SelectFieldProps) => {
  return (
    <div>
      {/* 필드 설명 영역 (InputField와 동일) */}
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="text-gray-700 text-sm font-medium">
          {label}
        </label>
        {helperText && (
          <span className="text-zinc-400 text-xs font-medium">
            {helperText}
          </span>
        )}
      </div>

      {/* Select 영역 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {icon}
        </div>
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          // InputField와 동일한 스타일에, appearance-none과 오른쪽 패딩(pr-10) 추가
          className="w-full h-12 pl-12 pr-10 py-3 bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* 커스텀 드롭다운 화살표 */}
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* 에러 메시지 영역 (InputField와 동일) */}
      <div className="min-h-[1rem] mt-1">
        {error && <p className="text-xs text-red-500 leading-tight">{error}</p>}
      </div>
    </div>
  );
};

export default SelectField;

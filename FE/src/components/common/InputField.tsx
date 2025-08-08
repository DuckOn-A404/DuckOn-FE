import React from "react";

type InputFieldProps = {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  helperText?: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  success?: string;
};

const InputField = ({
  id,
  label,
  type,
  placeholder,
  helperText,
  icon,
  value,
  onChange,
  error,
  success,
}: InputFieldProps) => {
  return (
    <div>
      {/* 필드 설명 영역 */}
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
      {/* 인풋 영역 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          className="w-full h-12 pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder={placeholder}
        />
      </div>
      {/* 에러 메시지 영역 */}
      <div className="min-h-[1rem] mt-1.5 pl-1">
        {error && <p className="text-xs text-red-500 leading-tight">{error}</p>}
        {success && <p className="text-xs text-blue-500">{success}</p>}
      </div>
    </div>
  );
};

export default InputField;

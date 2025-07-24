import React from "react";

type InputFieldProps = {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  helperText?: string;
  icon: React.ReactNode;
};

const InputField = ({
  id,
  label,
  type,
  placeholder,
  helperText,
  icon,
}: InputFieldProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="text-gray-700 text-sm font-medium">
          {label}*
        </label>
        {helperText && (
          <span className="text-zinc-400 text-xs font-medium">
            {helperText}
          </span>
        )}
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          id={id}
          className="w-full h-12 pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default InputField;

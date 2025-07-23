import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

/* 
  name : Button
  summary : 헤더에서 사용된 버튼 스타일 (보라색 바탕)
  props
    - children : 버튼에 보여줄 텍스트 혹은 아이콘
    - ...props : onClick, disabled 등 HTML <button> 태그가 가질 수 있는 모든 속성
*/
const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <button
      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-300"
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

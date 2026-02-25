// src/components/common/Toast.tsx
import React from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  position?: "top-center" | "bottom-right";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  position = "bottom-right", // 기본값은 우측 하단
  onClose 
}) => {
  const positionClasses = position === "top-center"
    ? "top-6 left-1/2 -translate-x-1/2" // 가운데 상단
    : "bottom-6 right-6"; // 우측 하단

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      <div
        className={[
          "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm",
          type === "success" ? "bg-green-600" : "bg-red-600",
        ].join(" ")}
      >
        {type === "success" ? (
          <CheckCircle size={18} />
        ) : (
          <XCircle size={18} />
        )}
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:bg-white/20 rounded p-1 transition"
          aria-label="닫기"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
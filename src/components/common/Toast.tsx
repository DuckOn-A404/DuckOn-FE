// src/components/common/Toast.tsx
import React from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
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
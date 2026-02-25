// Toast 알림 상태를 관리하고 표시/숨김 기능을 제공하는 커스텀 훅
import { useState, useCallback } from "react";

type ToastType = "success" | "error";
type ToastState = { message: string; type: ToastType } | null;

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2500);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
};
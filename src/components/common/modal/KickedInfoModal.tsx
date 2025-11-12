import { useEffect } from "react";
import { X } from "lucide-react";


/**
* KickedInfoModal - 강퇴된 사용자에게 알림을 표시하는 모달
*/


export type KickedInfoModalProps = {
isOpen: boolean;
title?: string;
description?: string;
confirmText?: string;
onConfirm?: () => void;
onClose?: () => void;
force?: boolean; // true면 배경/ESC로 닫기 불가
};


const KickedInfoModal = ({
isOpen,
title = "입장 불가",
description = "해당 방에서 강퇴되어 입장이 불가합니다.",
confirmText = "확인",
onConfirm,
onClose,
force = false,
}: KickedInfoModalProps) => {
useEffect(() => {
if (!isOpen || force) return;
const onKey = (e: KeyboardEvent) => {
if (e.key === "Escape") onClose?.();
};
window.addEventListener("keydown", onKey);
return () => window.removeEventListener("keydown", onKey);
}, [isOpen, force, onClose]);


if (!isOpen) return null;


return (
<div className="fixed inset-0 z-[1000] flex items-center justify-center" aria-modal="true" role="dialog">
<div
className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
onClick={() => !force && onClose?.()}
/>


<div className="relative w-[92%] max-w-md rounded-2xl bg-white shadow-2xl border border-black/5">
<div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
<h3 className="text-base font-semibold text-zinc-900">{title}</h3>
{!force && (
<button
aria-label="닫기"
className="p-1 rounded-md hover:bg-zinc-100"
onClick={onClose}
>
<X className="w-5 h-5" />
</button>
)}
</div>


<div className="px-5 py-4">
<p className="text-sm leading-6 text-zinc-700 whitespace-pre-line">{description}</p>
</div>


<div className="px-5 py-4 border-t border-zinc-100 flex justify-end gap-2">
<button
className="inline-flex select-none items-center justify-center rounded-xl px-4 h-10 text-sm font-medium shadow-sm border border-zinc-200 hover:bg-zinc-50 active:translate-y-[1px] transition"
onClick={() => onConfirm?.()}
>
{confirmText}
</button>
</div>
</div>
</div>
);
};


export default KickedInfoModal;
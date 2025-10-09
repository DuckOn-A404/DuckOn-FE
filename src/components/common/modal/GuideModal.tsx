import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export type GuideStep = {
  title: string;
  desc: string;
  img: string; // public/ 경로 기준
  alt: string;
};

interface GuideModalProps {
  open: boolean;
  steps: GuideStep[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const GuideModal = ({
  open,
  steps,
  index,
  onClose,
  onPrev,
  onNext,
}: GuideModalProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onPrev();
      if (e.key === "ArrowRight" && index < steps.length - 1) onNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, onPrev, onNext, index, steps.length]);

  if (!open) return null;
  const step = steps[index];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <button
        aria-label="닫기"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative mx-4 max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
          aria-label="닫기"
        >
          <X />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Text */}
          <div className="bg-gray-50 p-6 md:p-8">
            <p className="text-sm font-semibold text-purple-600 mb-2">
              STEP {index + 1} / {steps.length}
            </p>
            <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
            <p className="text-gray-600 leading-relaxed">{step.desc}</p>

            <div className="mt-6 flex gap-2">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i === index ? "bg-purple-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 flex items-center gap-3">
              {index > 0 && (
                <button
                  onClick={onPrev}
                  className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50 flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  이전
                </button>
              )}

              {index < steps.length - 1 && (
                <button
                  onClick={onNext}
                  className="px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="bg-gray-50 p-4 md:p-6 order-1 md:order-2">
            <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden shadow">
              <img
                src={step.img}
                alt={step.alt}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;

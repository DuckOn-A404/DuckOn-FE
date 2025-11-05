import {useEffect, useRef, useState} from "react";
import {motion} from "framer-motion"; // 라이트 스윕용으로 motion은 유지
import {ChevronLeft, ChevronRight} from "lucide-react";

type Banner = {id: number; img?: string; title?: string; subtitle?: string; gradient?: string;};
type Props = {items: Banner[]; current: number; setCurrent: (i: number) => void; autoplayMs?: number;};

export default function HeroBanner({items, current, setCurrent, autoplayMs = 4800}: Props) {
    const timer = useRef<number | null>(null);
    const [dragStartX, setDragStartX] = useState<number | null>(null);

    const next = () => setCurrent((current + 1) % items.length);
    const prev = () => setCurrent((current - 1 + items.length) % items.length);

    useEffect(() => {stop(); start(); return stop;}, [current, items.length]);
    const start = () => {stop(); timer.current = window.setInterval(next, autoplayMs);};
    const stop = () => {if (timer.current) window.clearInterval(timer.current);};

    const onPointerDown = (e: React.PointerEvent) => {stop(); setDragStartX(e.clientX);};
    const onPointerUp = (e: React.PointerEvent) => {
        if (dragStartX == null) return;
        const dx = e.clientX - dragStartX;
        if (dx > 40) prev(); else if (dx < -40) next();
        setDragStartX(null); start();
    };

    const active = items[current];
    const SAFE_W = "60.390625%"; // 1546 / 2560
    const SAFE_H = "29.375%";    // 423 / 1440

    return (
        <section className="relative w-full">
            <div className="relative w-full pt-[27.4%] overflow-hidden rounded-2xl">
                {/* ★ 전환 애니메이션 제거: 그냥 div */}
                <div
                    className="absolute inset-0"
                    onPointerDown={onPointerDown}
                    onPointerUp={onPointerUp}
                >
                    {active.img ? (
                        <img
                            src={active.img}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover select-none"
                            draggable={false}
                            onError={(e) => {(e.currentTarget as HTMLImageElement).src = "https://placehold.co/2560x1440?text=DUCKON";}}
                        />
                    ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${active.gradient ?? "from-fuchsia-500 via-rose-500 to-amber-500"}`} />
                    )}

                    {/* 라이트 스윕(계속 흐르는 효과는 유지) */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/40" />
                    <motion.div
                        aria-hidden
                        className="pointer-events-none absolute -inset-1 rounded-3xl"
                        style={{
                            background:
                                "linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.25) 50%, rgba(255,255,255,0) 100%)",
                            maskImage: "radial-gradient(80% 80% at 50% 50%, #000 40%, transparent)",
                        }}
                        animate={{backgroundPosition: ["-200% 0%", "200% 0%"]}}
                        transition={{duration: 8, repeat: Infinity}}
                    />

                    {/* 세이프존 */}
                    <div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                        style={{width: SAFE_W, height: SAFE_H}}
                    >
                        {active.title && (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center text-white px-2 md:px-4">
                                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold drop-shadow-[0_2px_8px_rgba(0,0,0,.35)]">
                                    {active.title}
                                </div>
                                {active.subtitle && (
                                    <div className="mt-2 text-[11px] sm:text-sm md:text-base opacity-95">
                                        {active.subtitle}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                </div>

                {/* 좌/우 컨트롤 */}
                <button
                    onClick={prev}
                    aria-label="이전"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-black/35 hover:bg-black/45 text-white rounded-full"
                >
                    <ChevronLeft size={18} />
                </button>
                <button
                    onClick={next}
                    aria-label="다음"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-black/35 hover:bg-black/45 text-white rounded-full"
                >
                    <ChevronRight size={18} />
                </button>

                {/* 인디케이터 */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`h-1.5 rounded-full transition-all ${i === current ? "w-8 bg-white" : "w-2 bg-white/60 hover:bg-white/80"}`}
                            aria-label={`배너 ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

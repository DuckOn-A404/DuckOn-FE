import {motion, useReducedMotion} from "framer-motion";

export default function AuroraStreakBG() {
    const reduce = useReducedMotion();

    return (
        <div className="pointer-events-none fixed inset-0 -z-10">
            {!reduce && (
                <>
                    {/* 오로라 블롭 */}
                    <motion.div
                        className="absolute -top-1/3 -left-1/4 w-[60vw] h-[60vw] rounded-full blur-3xl"
                        style={{background: "radial-gradient(closest-side, rgba(236,72,153,.18), transparent)"}}
                        animate={{x: ["0%", "8%", "-6%", "0%"], y: ["0%", "10%", "4%", "0%"]}}
                        transition={{duration: 24, repeat: Infinity}}
                    />
                    <motion.div
                        className="absolute bottom-[-25%] right-[-15%] w-[58vw] h-[58vw] rounded-full blur-3xl"
                        style={{background: "radial-gradient(closest-side, rgba(99,102,241,.16), transparent)"}}
                        animate={{x: ["0%", "-6%", "6%", "0%"], y: ["0%", "8%", "-6%", "0%"]}}
                        transition={{duration: 26, repeat: Infinity}}
                    />
                    {/* 라이트 스트릭 */}
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.18) 50%, rgba(255,255,255,0) 100%)",
                            maskImage:
                                "radial-gradient(62% 62% at 50% 50%, black, transparent)",
                        }}
                        animate={{backgroundPosition: ["-200% 0%", "200% 0%"]}}
                        transition={{duration: 8, repeat: Infinity}}
                    />
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(300deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.12) 50%, rgba(255,255,255,0) 100%)",
                            maskImage:
                                "radial-gradient(60% 60% at 50% 50%, black, transparent)",
                        }}
                        animate={{backgroundPosition: ["200% 0%", "-200% 0%"]}}
                        transition={{duration: 10, repeat: Infinity}}
                    />
                </>
            )}

            {/* 미세 노이즈 */}
            <div
                className="absolute inset-0 opacity-[.03] mix-blend-multiply"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.9'/></svg>\")",
                }}
            />
        </div>
    );
}

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface CounterProps {
    value: number;
    direction?: "up" | "down";
    decimals?: number;
    prefix?: string;
    suffix?: string;
}

export default function Counter({
    value,
    direction = "up",
    decimals = 0,
    prefix = "",
    suffix = "",
}: CounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(direction === "down" ? value : 0);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
    });
    const isInView = useInView(ref, { once: false, margin: "-10px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        } else {
            motionValue.set(direction === "down" ? value : 0);
        }
    }, [motionValue, isInView, value, direction]);

    useEffect(() => {
        // Initialize with starting value
        if (ref.current) {
            const initial = direction === "down" ? value : 0;
            ref.current.textContent = prefix + Intl.NumberFormat("en-US", {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            }).format(initial) + suffix;
        }

        const unsubscribe = springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = prefix + Intl.NumberFormat("en-US", {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals,
                }).format(latest) + suffix;
            }
        });
        return () => unsubscribe();
    }, [springValue, decimals, prefix, suffix, value, direction]);

    return <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }} />;
}

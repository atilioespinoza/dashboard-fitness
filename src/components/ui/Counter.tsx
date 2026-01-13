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
    const isInView = useInView(ref, { once: false, margin: "-50px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        } else {
            motionValue.set(direction === "down" ? value : 0);
        }
    }, [motionValue, isInView, value, direction]);

    useEffect(() => {
        springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = prefix + Intl.NumberFormat("en-US", {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals,
                }).format(latest) + suffix;
            }
        });
    }, [springValue, decimals, prefix, suffix]);

    return <span ref={ref} />;
}

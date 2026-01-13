import { motion } from "framer-motion";
import React from "react";

interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
    className?: string;
    fullWidth?: boolean;
}

export const FadeIn = ({
    children,
    delay = 0,
    direction = "up",
    className = "",
    fullWidth = false
}: FadeInProps) => {
    const directions = {
        up: { y: 40 },
        down: { y: -40 },
        left: { x: 40 },
        right: { x: -40 },
    };

    const variants = {
        hidden: {
            opacity: 0,
            ...directions[direction]
        },
        show: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
                duration: 0.6,
                delay: delay,
                ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number]
            }
        }
    };

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: "-50px" }}
            className={`${fullWidth ? "w-full" : ""} ${className}`}
        >
            {children}
        </motion.div>
    );
};

export const FadeInStagger = ({ children, staggerDelay = 0.1, className = "" }: { children: React.ReactNode, staggerDelay?: number, className?: string }) => {
    return (
        <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: "-50px" }}
            variants={{
                hidden: {},
                show: {
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

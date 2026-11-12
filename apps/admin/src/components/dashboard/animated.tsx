"use client";

import { useReducedMotion } from "motion/react";
import BlurText from "@/components/react-bits/BlurText";
import CountUp from "@/components/react-bits/CountUp";
import FadeContent from "@/components/react-bits/FadeContent";

type TextTag = "p" | "h1" | "h2" | "h3" | "h4" | "span" | "div";

/** React Bits BlurText for every dashboard text block. Static text for reduced motion. */
export function AnimatedText({
  text,
  as: Tag = "p",
  className,
}: {
  text: string;
  as?: TextTag;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <Tag className={className}>{text}</Tag>;
  return (
    <BlurText
      as={Tag}
      text={text}
      className={className}
      animateBy="words"
      direction="top"
      delay={45}
      stepDuration={0.3}
      blur={6}
      distance={8}
    />
  );
}

/** React Bits CountUp with French amounts (1 234,500 DT) and tabular figures. */
export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
  className,
  delay = 0,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    const text = new Intl.NumberFormat("fr-TN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
    return <span className={className}>{text}{suffix}</span>;
  }
  return (
    <CountUp
      to={value}
      from={0}
      decimals={decimals}
      separator={" "}
      decimalSeparator=","
      suffix={suffix}
      duration={1.1}
      delay={delay}
      className={className}
    />
  );
}

/** React Bits FadeContent to reveal cards and charts as they enter the viewport. */
export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <FadeContent className={className} blur duration={0.55} delay={delay} threshold={0.05} initialOpacity={0}>
      {children}
    </FadeContent>
  );
}

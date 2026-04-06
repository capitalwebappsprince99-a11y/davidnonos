"use client";

import { motion } from "framer-motion";
import React from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  as?: "div" | "span" | "h1" | "h2" | "h3" | "p";
}

// Text reveal animation - slides up from below with opacity fade
export function TextReveal({
  text,
  className = "",
  delay = 0,
  as: Tag = "div",
}: AnimatedTextProps) {
  return (
    <Tag style={{ overflow: "hidden" }}>
      <motion.div
        className={className}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {text}
      </motion.div>
    </Tag>
  );
}

// Word-by-word reveal — exact iconoclast.tv style
export function WordReveal({
  text,
  className = "",
  delay = 0,
  stagger = 0.06,
  once = true,
  triggerAnimate = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  triggerAnimate?: boolean;
}) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            overflow: "hidden",
            verticalAlign: "bottom",
            marginRight: i < words.length - 1 ? "0.28em" : 0,
          }}
        >
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once, margin: "-20px" }}
            transition={{
              duration: 0.75,
              ease: [0.16, 1, 0.3, 1],
              delay: delay + i * stagger,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// Character-by-character reveal
export function CharReveal({
  text,
  className = "",
  delay = 0,
  stagger = 0.025,
  once = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
        >
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once, margin: "-20px" }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: delay + i * stagger,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// Stagger children reveal - each child slides up in sequence
export function StaggerReveal({
  children,
  className = "",
  staggerDelay = 0.04,
  initialDelay = 0,
}: {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.6,
            delay: initialDelay + i * staggerDelay,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

// Fade in animation
export function FadeIn({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// Scroll-triggered reveal
export function ScrollReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navCenter = [
  { label: "Directors", href: "/directors" },
  { label: "Clips", href: "/filmtv" },
  { label: "Moodboard", href: "/image" },
];

const navRight = [
  { label: "Bio", href: "/bio" },
  { label: "Contact", href: "/contact" },
];

const InterlockingText = ({ text, isActive }: { text: string; isActive?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.span
      className="interlocking-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ display: "inline-flex", cursor: "pointer" }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          animate={{
            x: isHovered || isActive ? -index * 3.5 : 0, // Butter-smooth interlocking
          }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1], // Cubic-bezier for maximum smoothness
            delay: index * 0.005,
          }}
          style={{ 
            display: "inline-block", 
            letterSpacing: "0.08em",
            whiteSpace: "pre" 
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="nav-main">
      <div className="nav-container">
        {/* Branding - Left */}
        <Link href="/" className="nav-logo">
          <InterlockingText text="DavidNonos" />
        </Link>

        {/* Center links */}
        <ul className="nav-links-row nav-links-center">
          {navCenter.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={pathname === link.href ? "active" : ""}>
                <InterlockingText text={link.label} isActive={pathname === link.href} />
              </Link>
            </li>
          ))}
        </ul>

        {/* Right links */}
        <ul className="nav-links-row nav-links-right">
          {navRight.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={pathname === link.href ? "active" : ""}>
                <InterlockingText text={link.label} isActive={pathname === link.href} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

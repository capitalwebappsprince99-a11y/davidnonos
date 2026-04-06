"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { directors } from "@/data/content";
import { WordReveal } from "@/components/AnimatedText";

interface BgVideo {
  file_path: string | null;
}

const sections = [
  { title: "", data: directors.iconoclast },
  { title: "New Talents", data: directors.newTalents },
  { title: "Special Guests", data: directors.specialGuests },
  { title: "New Land", data: directors.newLand },
  { title: "SOMESUCH", data: directors.somesuch },
];

export default function DirectorsPage() {
  const [bgVideo, setBgVideo] = useState<BgVideo | null>(null);

  useEffect(() => {
    fetch("/api/directors/bg-video")
      .then((r) => r.json())
      .then(setBgVideo);
  }, []);

  return (
    <div className="directors-page" style={{ position: "relative", minHeight: "100vh" }}>
      {/* Background Video */}
      {bgVideo?.file_path && (
        <>
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: "fixed",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: -2,
            }}
            src={bgVideo.file_path}
          />
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: -1,
              background: "rgba(10, 10, 10, 0.74)",
            }}
          />
        </>
      )}

      {sections
        .filter((s) => s.data.length > 0)
        .map((section, sectionIndex) => (
          <div key={sectionIndex} className="directors-section">
            {/* Section title — hidden if empty */}
            {section.title && (
              <motion.h2
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  delay: sectionIndex * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {section.title}
              </motion.h2>
            )}

            {/* Director names — word-by-word reveal */}
            <div className="directors-grid">
              {section.data.map((name, i) => (
                <span
                  key={name}
                  style={{ display: "inline-flex", alignItems: "baseline" }}
                >
                  <Link
                    href={`/directors/${name.toLowerCase().replace(/\s+/g, "-")}`}
                    style={{ overflow: "visible" }}
                  >
                    <WordReveal
                      text={name}
                      delay={sectionIndex * 0.08 + i * 0.035}
                      stagger={0.04}
                    />
                  </Link>
                  {i < section.data.length - 1 && (
                    <motion.span
                      className="director-separator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                      transition={{
                        duration: 0.4,
                        delay: sectionIndex * 0.08 + i * 0.035 + 0.25,
                      }}
                    >
                      ,
                    </motion.span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

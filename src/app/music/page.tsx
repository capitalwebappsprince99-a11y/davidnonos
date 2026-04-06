"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { musicEntries } from "@/data/content";

export default function MusicPage() {
  const labelPublishing = musicEntries.filter(
    (e) => e.category === "Label & Publishing"
  );
  const services = musicEntries.filter((e) => e.category === "Services");

  return (
    <div className="music-page">
      <div className="music-section">
        {/* Section header fades in */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Label &amp; Publishing
        </motion.h2>

        <div className="music-list">
          {labelPublishing.map((entry, i) => (
            <div key={entry.name} style={{ overflow: "hidden" }}>
              <motion.div
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.75,
                  delay: 0.08 + i * 0.055,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  href={`/music/${entry.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {entry.name}
                </Link>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {services.length > 0 && (
        <div className="music-section">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            Services
          </motion.h2>

          <div className="music-list">
            {services.map((entry, i) => (
              <div key={entry.name} style={{ overflow: "hidden" }}>
                <motion.div
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.75,
                    delay: 0.3 + i * 0.055,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={`/music/${entry.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {entry.name}
                  </Link>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

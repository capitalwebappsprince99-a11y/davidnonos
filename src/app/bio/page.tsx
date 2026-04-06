"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Collaborator {
  id: string;
  name: string;
  role: string | null;
}

interface BioData {
  image_path: string | null;
  bio_text: string | null;
  collaborators: Collaborator[];
}

const WordHighlight = ({ text }: { text: string }) => (
  <div className="bio-description">
    {text.split(" ").map((word, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0.15, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.55, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: "inline-block", marginRight: "0.25em" }}
      >
        {word}
      </motion.span>
    ))}
  </div>
);

function MarqueeRow({
  items,
  reverse = false,
  speed = 40,
}: {
  items: Collaborator[];
  reverse?: boolean;
  speed?: number;
}) {
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <motion.div
        style={{
          display: "flex",
          whiteSpace: "nowrap",
        }}
        animate={{ x: reverse ? ["0%", "50%"] : ["0%", "-50%"] }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {doubled.map((c, i) => (
          <motion.div
            key={i}
            className="marquee-item"
            whileHover={{ scale: 1.08, opacity: 0.7 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "inline-block" }}
          >
            {c.name.toUpperCase()}
            {c.role && (
              <span style={{ opacity: 0.35, marginLeft: "0.5em", fontSize: "0.7em", fontWeight: 400 }}>
                {c.role}
              </span>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default function BioPage() {
  const [bio, setBio] = useState<BioData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);

  useEffect(() => {
    fetch("/api/bio")
      .then((r) => r.json())
      .then(setBio);
  }, []);

  const collaborators = bio?.collaborators ?? [];

  return (
    <div className="bio-page" ref={containerRef}>
      {/* HERO: PHOTO + BIO */}
      <section className="bio-hero">
        <motion.div
          className="photo-frame-container"
          whileHover={{ scale: 1.015 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="photo-frame-shutter"
            initial={{ height: "100%" }}
            whileInView={{ height: "0%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.19, 1, 0.22, 1], delay: 0.1 }}
          />
          <motion.div className="photo-frame-inner-wrapper" style={{ scale }}>
            {bio?.image_path ? (
              <img
                src={bio.image_path}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <div style={{ background: "#111", width: "100%", height: "100%" }} />
            )}
          </motion.div>
        </motion.div>

        {bio?.bio_text ? (
          <WordHighlight text={bio.bio_text} />
        ) : (
          <div className="bio-description" />
        )}
      </section>

      {/* MARQUEE: COLLABORATORS — deux rangées */}
      {collaborators.length > 0 && (
        <section className="marquee-section" style={{ padding: "80px 0", overflow: "hidden", background: "#fff" }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ display: "flex", flexDirection: "column", gap: 0 }}
          >
            <MarqueeRow items={collaborators} reverse={false} speed={50} />
            <MarqueeRow items={collaborators} reverse={true} speed={38} />
          </motion.div>
        </section>
      )}

      {/* FOOTER */}
      <section style={{ height: "35vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="collaborators-label"
        >
          Pushing visual boundaries.
        </motion.div>
      </section>
    </div>
  );
}

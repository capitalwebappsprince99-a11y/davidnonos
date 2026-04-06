"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Clip {
  id: string;
  youtube_url: string;
  youtube_id: string | null;
  title: string | null;
}

export default function FilmTVPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [selected, setSelected] = useState<Clip | null>(null);

  useEffect(() => {
    fetch("/api/clips")
      .then((r) => r.json())
      .then(setClips);
  }, []);

  useEffect(() => {
    if (!selected) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected]);

  return (
    <div className="filmtv-page">
      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="filmtv-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSelected(null)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 100, cursor: "pointer",
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: "min(90vw, 960px)", aspectRatio: "16/9", cursor: "default" }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${selected.youtube_id}?autoplay=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="filmtv-grid">
        {clips.length === 0 ? (
          <p style={{ color: "#555", fontSize: 12, letterSpacing: "4px", padding: "4rem 0" }}>
            AUCUN CLIP
          </p>
        ) : (
          clips.map((clip, i) => (
            <motion.div
              key={clip.id}
              className="filmtv-card"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.7,
                delay: (i % 3) * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelected(clip)}
              style={{ cursor: "pointer" }}
            >
              {clip.youtube_id ? (
                <img
                  src={`https://img.youtube.com/vi/${clip.youtube_id}/maxresdefault.jpg`}
                  alt={clip.title ?? ""}
                  className="card-bg"
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${clip.youtube_id}/mqdefault.jpg`;
                  }}
                />
              ) : (
                <div
                  className="card-bg"
                  style={{ background: `linear-gradient(135deg, hsl(${i * 28}, 25%, 20%) 0%, hsl(${i * 28 + 40}, 15%, 10%) 100%)` }}
                />
              )}
              <div className="card-overlay">
                {clip.title && (
                  <div style={{ overflow: "hidden" }}>
                    <motion.div
                      className="card-title"
                      initial={{ y: "100%" }}
                      whileInView={{ y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: (i % 3) * 0.1 + 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {clip.title}
                    </motion.div>
                  </div>
                )}
                {/* Play icon */}
                <motion.div
                  style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.1 + 0.3 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      width: 52, height: 52, borderRadius: "50%",
                      background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                      <path d="M4 2l10 6-10 6V2z" />
                    </svg>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Photo {
  id: string;
  file_path: string;
  alt_text: string | null;
}

export default function ImagePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  useEffect(() => {
    fetch("/api/moodboard")
      .then((r) => r.json())
      .then(setPhotos);
  }, []);

  const openLightbox = (photo: Photo, index: number) => {
    setLightbox(photo);
    setLightboxIndex(index);
  };

  const navigate = (dir: 1 | -1) => {
    const next = (lightboxIndex + dir + photos.length) % photos.length;
    setLightbox(photos[next]);
    setLightboxIndex(next);
  };

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, lightboxIndex, photos]);

  return (
    <div className="image-page">
      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setLightbox(null)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 100, cursor: "zoom-out",
            }}
          >
            {/* Prev / Next */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                  style={{
                    position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "rgba(255,255,255,0.4)",
                    fontSize: 32, cursor: "pointer", padding: "12px", lineHeight: 1,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                >
                  ←
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(1); }}
                  style={{
                    position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "rgba(255,255,255,0.4)",
                    fontSize: 32, cursor: "pointer", padding: "12px", lineHeight: 1,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                >
                  →
                </button>
              </>
            )}
            <motion.img
              key={lightbox.id}
              src={lightbox.file_path}
              alt={lightbox.alt_text ?? ""}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "88vw", maxHeight: "88vh", objectFit: "contain", cursor: "default" }}
            />
            <div style={{
              position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
              fontSize: 11, letterSpacing: "3px", color: "rgba(255,255,255,0.25)",
            }}>
              {lightboxIndex + 1} / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {photos.length === 0 ? (
        <p style={{ color: "#555", fontSize: 12, letterSpacing: "4px", padding: "4rem 0" }}>
          AUCUNE PHOTO
        </p>
      ) : (
        <div className="moodboard-masonry">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className="moodboard-item"
              onClick={() => openLightbox(photo, i)}
            >
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.85,
                  delay: (i % 3) * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ scale: 1.02 }}
                style={{ overflow: "hidden" }}
              >
                <motion.img
                  src={photo.file_path}
                  alt={photo.alt_text ?? ""}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{ width: "100%", display: "block", verticalAlign: "top" }}
                />
              </motion.div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

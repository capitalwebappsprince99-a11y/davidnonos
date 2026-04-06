"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDE_DURATION = 10000;

interface LandingVideo {
  id: string;
  title: string;
  subtitle: string | null;
  file_path: string;
  order_index: number;
}

export default function HomeCarousel() {
  const [videos, setVideos] = useState<LandingVideo[]>([]);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    fetch("/api/landing-videos")
      .then((r) => r.json())
      .then((data: LandingVideo[]) => setVideos(data));
  }, []);

  const goTo = useCallback((index: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setCurrent(index);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!videos.length) return;
    activeRef.current = true;
    startTimeRef.current = Date.now();
    setProgress(0);

    const tick = () => {
      if (!activeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(elapsed / SLIDE_DURATION, 1);
      setProgress(pct);
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setCurrent((prev) => (prev + 1) % videos.length);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      activeRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [current, videos.length]);

  if (!videos.length) {
    return (
      <div className="carousel-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#333", letterSpacing: "6px", fontSize: "10px" }}>ICONOCLAST</div>
      </div>
    );
  }

  const slide = videos[current];
  const words = slide.title.split(" ");

  return (
    <div className="carousel-container">
      {/* Background Video */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          className="slide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <video
            className="slide-bg"
            src={slide.file_path}
            autoPlay
            muted
            loop
            playsInline
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Content overlay */}
      <div className="slide-overlay">
        <AnimatePresence mode="wait">
          <motion.div key={`text-${slide.id}`}>
            {slide.subtitle && (
              <div className="director-name" style={{ overflow: "hidden" }}>
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                >
                  {slide.subtitle}
                </motion.div>
              </div>
            )}

            <div className="brand-name">
              {words.map((word, wi) => (
                <span
                  key={wi}
                  style={{
                    display: "inline-block",
                    overflow: "hidden",
                    verticalAlign: "bottom",
                    marginRight: wi < words.length - 1 ? "0.18em" : 0,
                  }}
                >
                  <motion.span
                    style={{ display: "inline-block" }}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-100%" }}
                    transition={{
                      duration: 0.9,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.15 + wi * 0.08,
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="carousel-progress-track">
        <div
          className="carousel-progress-fill"
          style={{ transform: `scaleX(${progress})`, transformOrigin: "left" }}
        />
      </div>

      {/* Pagination */}
      <div className="carousel-pagination">
        {videos.map((_, index) => (
          <button
            key={index}
            className={`pagination-item ${index === current ? "active" : ""}`}
            onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          >
            <span className="pagination-number">{index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

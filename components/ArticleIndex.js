"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ArticleIndex({ articles, onSelectArticle, onBack, isStandalone = true }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const containerRef = useRef(null);

  const handleSelect = useCallback(() => {
    const slug = articles[selectedIndex].slug;
    if (onSelectArticle) {
      onSelectArticle(slug);
    } else {
      router.push(`/notas/${slug}`);
    }
  }, [selectedIndex, articles, router, onSelectArticle]);

  const handleScroll = useCallback(
    (steps) => {
      setSelectedIndex((prev) =>
        Math.max(0, Math.min(articles.length - 1, prev + steps))
      );
    },
    [articles.length]
  );

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      switch (e.key) {
        case "ArrowUp":   e.preventDefault(); handleScroll(-1); break;
        case "ArrowDown": e.preventDefault(); handleScroll(1);  break;
        case "Enter":     handleSelect(); break;
        case "Escape":
          if (onBack) {
            e.preventDefault();
            onBack();
          }
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleScroll, handleSelect, onBack]);

  // Mouse wheel
  const handleScrollRef = useRef(handleScroll);
  useEffect(() => { handleScrollRef.current = handleScroll; }, [handleScroll]);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let acc = 0;
    const onWheel = (e) => {
      e.preventDefault();
      acc += e.deltaY;
      const steps = Math.trunc(acc / 60);
      if (steps !== 0) {
        acc -= steps * 60;
        handleScrollRef.current(steps > 0 ? 1 : -1);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={containerRef}
      className="ipod-no-select"
      style={{
        position: isStandalone ? "fixed" : "absolute",
        inset: 0,
        background: "#070708",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Scanline */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.025) 3px, rgba(0,0,0,0.025) 4px)",
          pointerEvents: "none",
          zIndex: 50,
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "18px 28px 0",
          flexShrink: 0,
          position: "relative",
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: 9,
            color: "rgba(255,255,255,0.18)",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
          }}
        >
          SUBSTRATO
        </span>
        {onBack ? (
          <button
            onClick={onBack}
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 9,
              color: "rgba(255,255,255,0.18)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            NOTAS
          </button>
        ) : (
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 9,
              color: "rgba(255,255,255,0.18)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
            }}
          >
            NOTAS
          </span>
        )}
      </div>

      {/* Article list */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "24px 28px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 640, width: "100%" }}>
          {articles.map((article, i) => {
            const isSel = i === selectedIndex;
            return (
              <motion.div
                key={article.id}
                animate={{ opacity: isSel ? 1 : 0.38 }}
                transition={{ duration: 0.18 }}
                onClick={handleSelect}
                style={{
                  padding: "20px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 20,
                }}
              >
                {/* Number */}
                <span
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: 10,
                    color: isSel ? article.accent : "rgba(255,255,255,0.25)",
                    letterSpacing: "0.1em",
                    flexShrink: 0,
                    transition: "color 0.18s",
                  }}
                >
                  {article.number}
                </span>

                {/* Title */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
                      fontSize: isSel ? 20 : 18,
                      fontWeight: isSel ? 600 : 400,
                      color: isSel ? "#fff" : "rgba(255,255,255,0.75)",
                      letterSpacing: isSel ? "-0.01em" : "0",
                      lineHeight: 1.2,
                      transition: "font-size 0.18s",
                    }}
                  >
                    {article.title}
                  </div>
                  {isSel && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        fontFamily: "var(--font-geist-mono), monospace",
                        fontSize: 10,
                        color: "rgba(255,255,255,0.28)",
                        letterSpacing: "0.08em",
                        marginTop: 5,
                        textTransform: "uppercase",
                      }}
                    >
                      {article.category} · {article.date}
                    </motion.div>
                  )}
                </div>

                {/* Chevron */}
                {isSel && (
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderTop: `1.5px solid ${article.accent}88`,
                      borderRight: `1.5px solid ${article.accent}88`,
                      transform: "rotate(45deg)",
                      flexShrink: 0,
                      marginBottom: 2,
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Hint */}
      <div
        style={{
          padding: "0 28px 20px",
          textAlign: "center",
          flexShrink: 0,
          position: "relative",
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: 8,
            color: "rgba(255,255,255,0.1)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          ↑ ↓ navegar · Enter leer
        </span>
      </div>
    </div>
  );
}

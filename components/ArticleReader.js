"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ─── SCREEN: COVER ────────────────────────────────────────────────────────────
function CoverScreen({ article }) {
  const words = article.title.split(" ");
  // Split title into lines of ~2-3 words for typographic impact
  const lines = [];
  for (let i = 0; i < words.length; i += 2) {
    lines.push(words.slice(i, i + 2).join(" "));
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 28px",
        maxWidth: 720,
        width: "100%",
      }}
    >
      {/* Category + number */}
      <div
        style={{
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: 10,
          color: article.accent,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 36,
          opacity: 0.85,
        }}
      >
        {article.number} &nbsp;·&nbsp; {article.category} &nbsp;·&nbsp; {article.date}
      </div>

      {/* Title — each line as a block */}
      <div style={{ marginBottom: 40 }}>
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 700,
              color: i === lines.length - 1 ? article.accent : "#fff",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Author */}
      <div
        style={{
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.28)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        {article.author}
      </div>
    </div>
  );
}

// ─── SCREEN: TEXT ─────────────────────────────────────────────────────────────
function TextScreen({ screen, index }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 28px",
        maxWidth: 680,
        width: "100%",
      }}
    >
      {/* Section marker */}
      <div
        style={{
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: 9,
          color: "rgba(255,255,255,0.15)",
          letterSpacing: "0.2em",
          marginBottom: 36,
        }}
      >
        {String(index).padStart(2, "0")}
      </div>

      {screen.content.map((paragraph, i) => (
        <p
          key={i}
          style={{
            fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
            fontSize: 17,
            lineHeight: 1.85,
            color: "rgba(255,255,255,0.82)",
            margin: 0,
            marginBottom: i < screen.content.length - 1 ? "1.6em" : 0,
            letterSpacing: "0.005em",
            maxWidth: "62ch",
          }}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

// ─── SCREEN: QUOTE ────────────────────────────────────────────────────────────
function QuoteScreen({ screen, accent }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 28px",
        maxWidth: 680,
        width: "100%",
      }}
    >
      {/* Decorative dash */}
      <div
        style={{
          width: 32,
          height: 2,
          background: accent,
          marginBottom: 32,
          opacity: 0.7,
        }}
      />

      <blockquote
        style={{
          fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
          fontSize: "clamp(22px, 3.2vw, 32px)",
          fontWeight: 400,
          color: "#fff",
          lineHeight: 1.4,
          letterSpacing: "-0.01em",
          margin: 0,
        }}
      >
        {screen.content}
      </blockquote>

      {screen.attribution && (
        <div
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginTop: 24,
          }}
        >
          — {screen.attribution}
        </div>
      )}
    </div>
  );
}

// ─── SCREEN: CLOSING ─────────────────────────────────────────────────────────
function ClosingScreen({ screen, accent }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 28px",
        maxWidth: 680,
        width: "100%",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
          fontSize: "clamp(22px, 3.2vw, 32px)",
          fontWeight: 400,
          color: "rgba(255,255,255,0.65)",
          lineHeight: 1.5,
          letterSpacing: "-0.01em",
          marginBottom: 48,
          maxWidth: "48ch",
        }}
      >
        {screen.content}
      </div>

      {/* End mark */}
      <div
        style={{
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: 11,
          color: accent,
          letterSpacing: "0.22em",
          opacity: 0.6,
        }}
      >
        ■
      </div>
    </div>
  );
}

// ─── READER ───────────────────────────────────────────────────────────────────
const SPRING = { type: "spring", stiffness: 380, damping: 40 };

export default function ArticleReader({ article, onBack, isStandalone = true }) {
  const [screen, setScreen] = useState(0);
  const directionRef = useRef(1);
  const router = useRouter();
  const containerRef = useRef(null);
  const total = article.screens.length;

  const goNext = useCallback(() => {
    if (screen < total - 1) {
      directionRef.current = 1;
      setScreen((s) => s + 1);
    }
  }, [screen, total]);

  const goPrev = useCallback(() => {
    if (screen > 0) {
      directionRef.current = -1;
      setScreen((s) => s - 1);
    } else {
      if (onBack) {
        onBack();
      } else {
        router.push("/notas");
      }
    }
  }, [screen, router, onBack]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":         e.preventDefault(); goNext(); break;
        case "ArrowLeft": goPrev(); break;
        case "Escape":
          if (onBack) {
            e.preventDefault();
            onBack();
          } else {
            router.push("/notas");
          }
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, router, onBack]);

  // Touch swipe
  const touchRef = useRef(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onStart = (e) => { touchRef.current = e.touches[0].clientX; };
    const onEnd = (e) => {
      if (touchRef.current === null) return;
      const diff = touchRef.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
      touchRef.current = null;
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [goNext, goPrev]);

  const renderScreen = (s, i) => {
    switch (s.type) {
      case "cover":   return <CoverScreen article={article} />;
      case "text":    return <TextScreen screen={s} index={i} />;
      case "quote":   return <QuoteScreen screen={s} accent={article.accent} />;
      case "closing": return <ClosingScreen screen={s} accent={article.accent} />;
      default:        return null;
    }
  };

  const variants = {
    enter:  (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir) => ({ x: dir > 0 ? "-30%" : "30%", opacity: 0 }),
  };

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

      {/* Subtle accent tint on cover screen */}
      <AnimatePresence>
        {screen === 0 && (
          <motion.div
            key="cover-tint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.07 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse 80% 70% at 20% 50%, ${article.accent}, transparent)`,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
        <button
          onClick={() => onBack ? onBack() : router.push("/notas")}
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: 9,
            color: "rgba(255,255,255,0.18)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          NOTAS
        </button>
      </div>

      {/* Screen content */}
      <div
        style={{
          flex: 1,
          position: "relative",
          zIndex: 10,
          display: "flex",
          overflow: "hidden",
        }}
      >
        <AnimatePresence mode="wait" custom={directionRef.current}>
          <motion.div
            key={screen}
            custom={directionRef.current}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={SPRING}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            {renderScreen(article.screens[screen], screen)}
          </motion.div>
        </AnimatePresence>

        {/* Edge click zones */}
        <div
          onClick={goPrev}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "15%",
            cursor: screen > 0 ? "w-resize" : "default",
            zIndex: 20,
          }}
        />
        <div
          onClick={goNext}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "15%",
            cursor: screen < total - 1 ? "e-resize" : "default",
            zIndex: 20,
          }}
        />
      </div>

      {/* Bottom bar: progress + hint */}
      <div
        style={{
          padding: "0 28px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Dot progress */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {article.screens.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === screen ? 16 : 4,
                background: i === screen ? article.accent : "rgba(255,255,255,0.18)",
              }}
              transition={{ duration: 0.22 }}
              style={{
                height: 2,
                borderRadius: 1,
              }}
            />
          ))}
        </div>

        <span
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: 8,
            color: "rgba(255,255,255,0.1)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          ← → navegar · Esc índice
        </span>
      </div>
    </div>
  );
}

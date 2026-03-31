"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── TRACK DATA ───────────────────────────────────────────────────────────────
const TRACKS = [
  {
    id: 1,
    number: "001",
    title: "Estratos I",
    artist: "Colectivo Substrato",
    edition: "Vol. 1 · 2024",
    duration: "58:34",
    bg: "linear-gradient(135deg, #0d0d1a 0%, #1a0533 45%, #2d1b69 100%)",
    accent: "#a855f7",
    src: "",
    notes: "El primer set nació de una pregunta simple: ¿qué suena debajo de todo? No el bajo, no el kick — algo anterior. Esta sesión fue grabada en vivo durante la presentación del primer número de Substrato, en un espacio que antes fue una imprenta. Las paredes todavía olían a tinta.",
  },
  {
    id: 2,
    number: "002",
    title: "Grieta",
    artist: "Anónima b2b Rex",
    edition: "Vol. 1 · 2024",
    duration: "1:02:17",
    bg: "linear-gradient(135deg, #1a0000 0%, #3d0000 40%, #6b0000 100%)",
    accent: "#ef4444",
    src: "",
    notes: "Una grieta no es un error en la roca. Es el registro de una tensión que no encontró otra salida. Anónima y Rex se conocieron en un sótano y nunca se volvieron a ver después de esta grabación. Lo que queda es la presión.",
  },
  {
    id: 3,
    number: "003",
    title: "Profundidad",
    artist: "Nacht Kollektiv",
    edition: "Vol. 1 · 2024",
    duration: "49:45",
    bg: "linear-gradient(135deg, #0a1628 0%, #0f3460 50%, #16213e 100%)",
    accent: "#22d3ee",
    src: "",
    notes: "A 200 metros bajo el mar la presión aplana todo sonido excepto los de muy baja frecuencia. Nacht Kollektiv construyó este set desde esa premisa: ¿qué llega hasta el fondo? Grabado completamente en analógico, sin overdubs.",
  },
  {
    id: 4,
    number: "004",
    title: "Substrato Vivo",
    artist: "Marco Ferro",
    edition: "Vol. 1 · 2024",
    duration: "1:15:03",
    bg: "linear-gradient(135deg, #002010 0%, #004d40 45%, #1b5e20 100%)",
    accent: "#4ade80",
    src: "",
    notes: "El suelo no es inerte. Hay millones de organismos en cada centímetro cúbico de tierra viva. Marco Ferro trabajó con samples de campo grabados en distintos bosques de la región, procesados hasta volverse irreconocibles — o casi.",
  },
  {
    id: 5,
    number: "005",
    title: "Capas",
    artist: "Isla Muerta",
    edition: "Vol. 2 · 2025",
    duration: "55:22",
    bg: "linear-gradient(135deg, #180a00 0%, #7c2d12 50%, #431407 100%)",
    accent: "#fb923c",
    src: "",
    notes: "Cada capa sedimentaria es un archivo. El segundo número de Substrato explora la idea de que la memoria no es lineal sino estratigráfica: está enterrada, comprimida, deformada. Isla Muerta abre el segundo volumen con esta lectura.",
  },
  {
    id: 6,
    number: "006",
    title: "Sedimento",
    artist: "Arca Negra",
    edition: "Vol. 2 · 2025",
    duration: "1:08:44",
    bg: "linear-gradient(135deg, #0d0d2e 0%, #1e1b4b 45%, #1e40af 100%)",
    accent: "#818cf8",
    src: "",
    notes: "El sedimento es lo que el agua deja cuando se retira. Arca Negra construyó este set a lo largo de seis meses, añadiendo y quitando capas como un proceso geológico deliberado. La versión que escuchas es la undécima.",
  },
  {
    id: 7,
    number: "007",
    title: "Núcleo",
    artist: "Bajo Tierra",
    edition: "Vol. 2 · 2025",
    duration: "52:18",
    bg: "linear-gradient(135deg, #1a001a 0%, #4a0070 50%, #7b0080 100%)",
    accent: "#e879f9",
    src: "",
    notes: "El núcleo terrestre gira a una velocidad ligeramente diferente al resto del planeta. Nadie sabe exactamente por qué. Bajo Tierra lleva años explorando esa fricción invisible — la que existe entre dos sistemas que deberían ser uno.",
  },
  {
    id: 8,
    number: "008",
    title: "Superficie",
    artist: "Los Muertos Vivos",
    edition: "Vol. 2 · 2025",
    duration: "1:00:00",
    bg: "linear-gradient(135deg, #111 0%, #2a2a2a 50%, #404040 100%)",
    accent: "#d4d4d8",
    src: "",
    notes: "Después de todo lo anterior, la superficie. El lugar donde respiramos, donde el sonido viaja rápido y se disipa. Los Muertos Vivos cierran el segundo volumen con un set que suena exactamente como salir.",
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function formatTime(secs) {
  if (!isFinite(secs) || secs < 0) return "–:––";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── COVER ART ────────────────────────────────────────────────────────────────
function CoverArt({ track, size = 200 }) {
  const strata = [14, 26, 38, 50, 62, 74, 86];
  const radius = Math.round(size * 0.09);
  return (
    <div
      style={{
        width: size,
        height: size,
        background: track.bg,
        borderRadius: radius,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        boxShadow: `0 24px 64px ${track.accent}35, 0 0 0 1px rgba(255,255,255,0.07)`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        aria-hidden
      >
        {strata.map((y, i) => {
          const wave = i % 2 === 0 ? 1 : -1;
          return (
            <path
              key={i}
              d={`M -5 ${y + wave * 4} C 25 ${y + wave * 7} 75 ${y - wave * 7} 105 ${y + wave * 4}`}
              fill="none"
              stroke={track.accent}
              strokeWidth={0.35 + i * 0.07}
              opacity={0.12 + i * 0.07}
            />
          );
        })}
        <circle cx="50" cy="50" r="19" fill="none" stroke={track.accent} strokeWidth="0.8" opacity="0.45" />
        <circle cx="50" cy="50" r="9"  fill="none" stroke={track.accent} strokeWidth="0.7" opacity="0.6" />
        <circle cx="50" cy="50" r="2.5" fill={track.accent} opacity="0.8" />
        <radialGradient id={`glow-${track.id}`} cx="20%" cy="20%" r="50%">
          <stop offset="0%"   stopColor={track.accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={track.accent} stopOpacity="0" />
        </radialGradient>
        <rect x="0" y="0" width="100" height="100" fill={`url(#glow-${track.id})`} />
      </svg>
      <div
        style={{
          position: "absolute",
          bottom: Math.round(size * 0.05),
          right: Math.round(size * 0.06),
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: Math.round(size * 0.09),
          color: track.accent,
          opacity: 0.9,
          fontWeight: 700,
          letterSpacing: "0.04em",
          lineHeight: 1,
        }}
      >
        {track.number}
      </div>
    </div>
  );
}

// ─── COVER FLOW VIEW ─────────────────────────────────────────────────────────
function CoverFlowView({ tracks, selectedIndex }) {
  const sel = tracks[selectedIndex];
  const COVER = 220;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        padding: "0 24px 24px",
      }}
    >
      {/* Carousel */}
      <div
        style={{
          perspective: "1000px",
          height: COVER + 20,
          width: "100%",
          position: "relative",
        }}
      >
        {tracks.map((track, i) => {
          const offset = i - selectedIndex;
          const abs = Math.abs(offset);
          if (abs > 3) return null;

          const x = offset * 170;
          const rotateY = offset === 0 ? 0 : offset < 0 ? 52 : -52;
          const scale = abs === 0 ? 1 : abs === 1 ? 0.7 : 0.52;
          const z = abs === 0 ? 0 : -90;
          const opacity = abs > 2 ? 0 : abs === 2 ? 0.25 : 1;

          return (
            <motion.div
              key={track.id}
              animate={{ x, rotateY, scale, z, opacity }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                marginLeft: -(COVER / 2),
                marginTop: -(COVER / 2),
                transformStyle: "preserve-3d",
                zIndex: 10 - abs,
              }}
            >
              <CoverArt track={track} size={COVER} />
            </motion.div>
          );
        })}
      </div>

      {/* Selected track info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sel.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={{ textAlign: "center" }}
        >
          <div
            style={{
              fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            {sel.title}
          </div>
          <div
            style={{
              fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
              fontSize: 12,
              color: sel.accent,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginTop: 6,
              opacity: 0.85,
            }}
          >
            {sel.artist}
          </div>
          <div
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.22)",
              letterSpacing: "0.12em",
              marginTop: 5,
            }}
          >
            {sel.edition} · {sel.duration}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── TRACK LIST VIEW ─────────────────────────────────────────────────────────
function TrackListView({ tracks, selectedIndex, currentIndex }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 580 }}>
        {tracks.map((track, i) => {
          const isSel = i === selectedIndex;
          const isCur = i === currentIndex;

          return (
            <motion.div
              key={track.id}
              animate={{
                backgroundColor: isSel ? `${track.accent}15` : "transparent",
              }}
              transition={{ duration: 0.14 }}
              style={{
                height: 52,
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                borderRadius: 8,
                gap: 12,
              }}
            >
              {/* Playing dot */}
              <div
                style={{
                  width: 10,
                  flexShrink: 0,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {isCur && (
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: track.accent,
                      boxShadow: `0 0 8px ${track.accent}`,
                    }}
                  />
                )}
              </div>

              {/* Number */}
              <div
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: 10,
                  color: isSel ? track.accent : "rgba(255,255,255,0.2)",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  flexShrink: 0,
                  width: 30,
                }}
              >
                {track.number}
              </div>

              {/* Title + artist */}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div
                  style={{
                    fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
                    fontSize: isSel ? 15 : 14,
                    fontWeight: isSel ? 600 : 400,
                    color: isSel ? "#fff" : "rgba(255,255,255,0.55)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.01em",
                  }}
                >
                  {track.title}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
                    fontSize: 11,
                    color: isSel ? `${track.accent}cc` : "rgba(255,255,255,0.25)",
                    marginTop: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.02em",
                  }}
                >
                  {track.artist}
                </div>
              </div>

              {/* Duration */}
              <div
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: 11,
                  color: isSel ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.18)",
                  flexShrink: 0,
                }}
              >
                {track.duration}
              </div>

              {/* Chevron */}
              {isSel && (
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderTop: `1.5px solid ${track.accent}88`,
                    borderRight: `1.5px solid ${track.accent}88`,
                    transform: "rotate(45deg)",
                    flexShrink: 0,
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── NOW PLAYING VIEW ─────────────────────────────────────────────────────────
function NowPlayingView({ track, isPlaying, elapsed, duration, onSeek }) {
  const progress = duration > 0 ? elapsed / duration : 0;
  const barRef = useRef(null);

  const handleBarClick = useCallback(
    (e) => {
      if (!barRef.current) return;
      const rect = barRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(pct);
    },
    [onSeek]
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 40px",
        gap: 32,
      }}
    >
      {/* Cover */}
      <AnimatePresence mode="wait">
        <motion.div
          key={track.id}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.24 }}
        >
          <CoverArt track={track} size={272} />
        </motion.div>
      </AnimatePresence>

      {/* Title + artist */}
      <AnimatePresence mode="wait">
        <motion.div
          key={track.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{ textAlign: "center", width: "100%", maxWidth: 400 }}
        >
          <div
            style={{
              fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.02em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {track.title}
          </div>
          <div
            style={{
              fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
              fontSize: 13,
              color: track.accent,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginTop: 7,
              opacity: 0.85,
            }}
          >
            {track.artist}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress + times */}
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div
          ref={barRef}
          onClick={handleBarClick}
          style={{
            width: "100%",
            height: 3,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 2,
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          <motion.div
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5, ease: "linear" }}
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${track.accent}99, ${track.accent})`,
              borderRadius: 2,
              boxShadow: `0 0 8px ${track.accent}66`,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.32)",
          }}
        >
          <span>{formatTime(elapsed)}</span>
          <motion.span
            animate={{ opacity: isPlaying ? [0.45, 1, 0.45] : 0.45 }}
            transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
            style={{
              color: isPlaying ? track.accent : "rgba(255,255,255,0.32)",
              fontSize: 11,
            }}
          >
            {isPlaying ? "▶" : "❚❚"}
          </motion.span>
          <span>{track.duration}</span>
        </div>
      </div>
    </div>
  );
}

// ─── NOTES VIEW ──────────────────────────────────────────────────────────────
function NotesView({ track, onClose }) {
  const strata = [14, 26, 38, 50, 62, 74, 86];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Background: track gradient, opaque */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: track.bg,
          zIndex: 0,
        }}
      />
      {/* Dark overlay for readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.62)",
          zIndex: 1,
        }}
      />
      {/* Strata decoration — full-width SVG behind text */}
      <svg
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          height: 200,
          zIndex: 2,
          opacity: 0.18,
          pointerEvents: "none",
        }}
      >
        {strata.map((y, i) => {
          const wave = i % 2 === 0 ? 1 : -1;
          return (
            <path
              key={i}
              d={`M -10 ${y + wave * 6} C 200 ${y + wave * 14} 600 ${y - wave * 14} 810 ${y + wave * 6}`}
              fill="none"
              stroke={track.accent}
              strokeWidth={1 + i * 0.2}
              opacity={0.2 + i * 0.1}
            />
          );
        })}
      </svg>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "18px 28px 20px",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            marginBottom: 40,
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
            onClick={onClose}
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
            CERRAR
          </button>
        </div>

        {/* Text body — vertically centered */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: 580,
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Track number */}
          <div
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 10,
              color: track.accent,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 14,
              opacity: 0.85,
            }}
          >
            {track.number} · {track.edition}
          </div>

          {/* Title */}
          <div
            style={{
              fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
              fontSize: 32,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 10,
            }}
          >
            {track.title}
          </div>

          {/* Artist */}
          <div
            style={{
              fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
              fontSize: 12,
              color: track.accent,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              opacity: 0.75,
              marginBottom: 32,
            }}
          >
            {track.artist}
          </div>

          {/* Separator */}
          <div
            style={{
              width: 32,
              height: 1,
              background: `linear-gradient(90deg, ${track.accent}88, transparent)`,
              marginBottom: 28,
            }}
          />

          {/* Notes paragraph */}
          <p
            style={{
              fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
              fontSize: 15,
              lineHeight: 1.8,
              color: "rgba(255,255,255,0.72)",
              margin: 0,
              letterSpacing: "0.01em",
            }}
          >
            {track.notes}
          </p>
        </div>

        {/* Hint */}
        <div
          style={{
            flexShrink: 0,
            textAlign: "center",
            paddingTop: 16,
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
            I · cerrar
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── PLAYER ───────────────────────────────────────────────────────────────────
export default function IPodPlayer() {
  const [view, setView] = useState("coverflow"); // coverflow | tracklist | nowplaying
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);

  const audioRef    = useRef(null);
  const intervalRef = useRef(null);
  const onNextRef   = useRef(null);
  const containerRef = useRef(null);

  const currentTrack  = TRACKS[currentTrackIndex];
  const highlightTrack = TRACKS[selectedIndex];

  // ── Init audio
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.addEventListener("ended", () => onNextRef.current?.());
    audio.addEventListener("loadedmetadata", () => setAudioDuration(audio.duration));
    audio.addEventListener("durationchange",  () => setAudioDuration(audio.duration));
    return () => {
      audio.pause();
      clearInterval(intervalRef.current);
    };
  }, []);

  const startTicker = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (audioRef.current) setElapsed(audioRef.current.currentTime);
    }, 500);
  }, []);

  const playTrack = useCallback(
    (index) => {
      const track = TRACKS[index];
      setCurrentTrackIndex(index);
      setSelectedIndex(index);
      setElapsed(0);
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.src = track.src;
      if (track.src) {
        audio.play().catch(() => {});
        setIsPlaying(true);
        startTicker();
      } else {
        setIsPlaying(false);
      }
      setView("nowplaying");
    },
    [startTicker]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      if (audio.src) {
        audio.play().catch(() => {});
        setIsPlaying(true);
        startTicker();
      }
    }
  }, [isPlaying, startTicker]);

  const handleNext = useCallback(() => {
    const next = (currentTrackIndex + 1) % TRACKS.length;
    if (isPlaying) playTrack(next);
    else { setCurrentTrackIndex(next); setSelectedIndex(next); }
  }, [currentTrackIndex, isPlaying, playTrack]);

  const handlePrev = useCallback(() => {
    const prev = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
    if (isPlaying) playTrack(prev);
    else { setCurrentTrackIndex(prev); setSelectedIndex(prev); }
  }, [currentTrackIndex, isPlaying, playTrack]);

  useEffect(() => { onNextRef.current = handleNext; }, [handleNext]);

  const handleMenu = useCallback(() => {
    if (view === "nowplaying") { setNotesOpen(false); setView("tracklist"); }
    else if (view === "tracklist") setView("coverflow");
  }, [view]);

  const handleSelect = useCallback(() => {
    if (view === "coverflow")  setView("tracklist");
    else if (view === "tracklist") playTrack(selectedIndex);
    else if (view === "nowplaying") togglePlay();
  }, [view, selectedIndex, playTrack, togglePlay]);

  const handleScroll = useCallback(
    (steps) => {
      if (view === "nowplaying") return;
      setSelectedIndex((prev) => Math.max(0, Math.min(TRACKS.length - 1, prev + steps)));
    },
    [view]
  );

  const handleSeek = useCallback((pct) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = pct * audio.duration;
    setElapsed(audio.currentTime);
  }, []);

  // ── Keyboard
  useEffect(() => {
    const onKey = (e) => {
      switch (e.key) {
        case "ArrowUp":    e.preventDefault(); handleScroll(-1); break;
        case "ArrowDown":  e.preventDefault(); handleScroll(1);  break;
        case "ArrowLeft":  handlePrev();   break;
        case "ArrowRight": handleNext();   break;
        case " ":          e.preventDefault(); togglePlay();     break;
        case "Enter":      handleSelect(); break;
        case "i":
        case "I":
          if (view === "nowplaying") setNotesOpen((prev) => !prev);
          break;
        case "Escape":
        case "Backspace":
          if (notesOpen) setNotesOpen(false);
          else handleMenu();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleScroll, handlePrev, handleNext, togglePlay, handleSelect, handleMenu, view, notesOpen]);

  // ── Mouse wheel (non-passive so we can preventDefault)
  const handleScrollRef = useRef(handleScroll);
  useEffect(() => { handleScrollRef.current = handleScroll; }, [handleScroll]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let acc = 0;
    const onWheel = (e) => {
      e.preventDefault();
      acc += e.deltaY;
      const STEP = 60;
      const steps = Math.trunc(acc / STEP);
      if (steps !== 0) {
        acc -= steps * STEP;
        handleScrollRef.current(steps > 0 ? 1 : -1);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ── Background: nowplaying → track gradient; else → subtle tint of selected
  const bgIsNowPlaying = view === "nowplaying";

  return (
    <div
      ref={containerRef}
      className="ipod-no-select"
      style={{
        position: "fixed",
        inset: 0,
        background: "#070708",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Background gradient layer */}
      <AnimatePresence>
        <motion.div
          key={`${bgIsNowPlaying ? "np" : "tint"}-${bgIsNowPlaying ? currentTrack.id : highlightTrack.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: bgIsNowPlaying ? 0.52 : 0.06 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute",
            inset: 0,
            background: bgIsNowPlaying ? currentTrack.bg : highlightTrack.bg,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      </AnimatePresence>

      {/* ── Scanline (LCD nod, very subtle) */}
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

      {/* ── Status bar */}
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

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link
            href="/notas"
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 9,
              color: "rgba(255,255,255,0.18)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            NOTAS
          </Link>
          {view !== "coverflow" && (
            <button
              onClick={handleMenu}
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
              MENU
            </button>
          )}
          {isPlaying && (
            <motion.span
              animate={{ opacity: [0.3, 0.85, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ fontSize: 8, color: currentTrack.accent }}
            >
              ▶
            </motion.span>
          )}
        </div>
      </div>

      {/* ── Main views */}
      <AnimatePresence mode="wait">
        {view === "coverflow" && (
          <motion.div
            key="cf"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 10, overflow: "hidden" }}
          >
            <CoverFlowView tracks={TRACKS} selectedIndex={selectedIndex} />
          </motion.div>
        )}

        {view === "tracklist" && (
          <motion.div
            key="tl"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 10, overflow: "hidden" }}
          >
            <TrackListView
              tracks={TRACKS}
              selectedIndex={selectedIndex}
              currentIndex={currentTrackIndex}
            />
          </motion.div>
        )}

        {view === "nowplaying" && (
          <motion.div
            key="np"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 10, overflow: "hidden" }}
          >
            <NowPlayingView
              track={currentTrack}
              isPlaying={isPlaying}
              elapsed={elapsed}
              duration={audioDuration}
              onSeek={handleSeek}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hint bar */}
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
          {view === "coverflow"  && "↑ ↓ navegar · Enter seleccionar"}
          {view === "tracklist"  && "↑ ↓ navegar · Enter reproducir · Esc volver"}
          {view === "nowplaying" && !notesOpen && "Space pausar · ← → cambiar · I · notas · Esc volver"}
          {view === "nowplaying" && notesOpen && ""}
        </span>
      </div>

      {/* ── Notes overlay */}
      <AnimatePresence>
        {notesOpen && view === "nowplaying" && (
          <motion.div
            key="notes"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 38 }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 60,
            }}
          >
            <NotesView
              track={currentTrack}
              onClose={() => setNotesOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

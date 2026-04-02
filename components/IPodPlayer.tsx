"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTracks, getArticles, getArticleForTrack } from "@/lib/tracks";
import { adaptArticleForPlayer } from "@/lib/articleAdapter";
import { getSoundCloudEmbedUrl } from "@/lib/soundcloud";
import type { 
  Track, 
  Article, 
  AdaptedArticle, 
  ViewType, 
  CoverFlowViewProps, 
  TrackListViewProps, 
  NowPlayingViewProps, 
  NotesViewProps 
} from "@/types/player";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function formatTime(secs: number): string {
  if (!isFinite(secs) || secs < 0) return "–:––";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── COVER ART ────────────────────────────────────────────────────────────────
interface CoverArtProps {
  track: Track;
  size?: number;
}

function CoverArt({ track, size = 200 }: CoverArtProps) {
  const strata = [14, 26, 38, 50, 62, 74, 86];
  const radius = Math.round(size * 0.09);
  
  // Valores por defecto si track es undefined
  const trackBg = track?.bg || 'linear-gradient(135deg, #0d0d1a 0%, #1a0533 45%, #2d1b69 100%)';
  const trackAccent = track?.accent || '#a855f7';
  
  return (
    <div
      style={{
        width: size,
        height: size,
        background: trackBg,
        borderRadius: radius,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        boxShadow: `0 24px 64px ${trackAccent}35, 0 0 0 1px rgba(255,255,255,0.07)`,
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
              stroke={trackAccent}
              strokeWidth={0.35 + i * 0.07}
              opacity={0.12 + i * 0.07}
            />
          );
        })}
        <circle cx="50" cy="50" r="19" fill="none" stroke={trackAccent} strokeWidth="0.8" opacity="0.45" />
        <circle cx="50" cy="50" r="9"  fill="none" stroke={trackAccent} strokeWidth="0.7" opacity="0.6" />
        <circle cx="50" cy="50" r="2.5" fill={trackAccent} opacity="0.8" />
        <radialGradient id={`glow-${track?.id || 'default'}`} cx="20%" cy="20%" r="50%">
          <stop offset="0%"   stopColor={trackAccent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={trackAccent} stopOpacity="0" />
        </radialGradient>
        <rect x="0" y="0" width="100" height="100" fill={`url(#glow-${track?.id || 'default'})`} />
      </svg>
      <div
        style={{
          position: "absolute",
          bottom: Math.round(size * 0.05),
          right: Math.round(size * 0.06),
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: Math.round(size * 0.09),
          color: trackAccent,
          opacity: 0.9,
          fontWeight: 700,
          letterSpacing: "0.04em",
          lineHeight: 1,
        }}
      >
        {track?.number || '000'}
      </div>
    </div>
  );
}

// ─── COVER FLOW VIEW ─────────────────────────────────────────────────────────
function CoverFlowView({ tracks, selectedIndex, onSelect }: CoverFlowViewProps) {
  // Filtrar solo tracks válidos (que tengan información real)
  const validTracks = tracks?.filter(track => {
    if (!track) return false;
    
    // Verificar que tenga un ID válido
    if (!track.id) return false;
    
    // Verificar que no sea un track vacío con solo valores por defecto
    const hasRealTitle = track.title && track.title !== 'Sin título' && track.title.trim() !== '';
    const hasRealArtist = track.artist && track.artist !== 'Artista desconocido' && track.artist.trim() !== '';
    const hasRealNumber = track.number && track.number !== '000' && track.number.trim() !== '';
    
    // Aceptamos el track si tiene al menos un campo real
    return hasRealTitle || hasRealArtist || hasRealNumber;
  }) || [];
  
  // Mapeo de índices: de original a válido
  const originalToValidIndex = (originalIndex: number) => {
    const track = tracks[originalIndex];
    if (!track) return 0;
    return validTracks.findIndex(t => t.id === track.id);
  };
  
  // Mapeo de índices: de válido a original
  const validToOriginalIndex = (validIndex: number) => {
    const validTrack = validTracks[validIndex];
    if (!validTrack) return 0;
    return tracks.findIndex(t => t?.id === validTrack.id);
  };
  
  // Convertir el selectedIndex del array original al array válido
  const validSelectedIndex = originalToValidIndex(selectedIndex);
  const sel = validTracks[validSelectedIndex];
  const COVER = 220;

  // Manejo de navegación interno
  const handleInternalSelect = (validIndex: number) => {
    const originalIndex = validToOriginalIndex(validIndex);
    onSelect(originalIndex);
  };
  
  const handleInternalNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? Math.max(0, validSelectedIndex - 1)
      : Math.min(validTracks.length - 1, validSelectedIndex + 1);
    const originalIndex = validToOriginalIndex(newIndex);
    onSelect(originalIndex);
  };

  // Si no hay tracks válidos, mostrar mensaje
  if (!validTracks || validTracks.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#a855f7",
          fontSize: 18,
        }}
      >
        No hay canciones disponibles
      </div>
    );
  }

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
          width: "100%",
          maxWidth: 800,
          height: COVER,
          position: "relative",
          transformStyle: "preserve-3d",
          overflow: "visible",
        }}
      >
        {validTracks.map((track, i) => {
          let dist = i - validSelectedIndex;
          // Shortest path in circle
          if (dist > validTracks.length / 2) dist -= validTracks.length;
          if (dist < -validTracks.length / 2) dist += validTracks.length;
          
          // Horizontal carousel layout
          const SPACING = 240;
          const x = dist * SPACING;
          const z = 0; // No depth for horizontal carousel
          
          // Rotation to face the viewer (no rotation for horizontal carousel)
          const rotateY = 0;
          
          // Visual tweaks based on distance from center
          const absDist = Math.abs(dist);
          const scale = Math.max(0.4, Math.min(1, 1 - absDist * 0.15));
          const opacity = Math.max(0.3, Math.min(1, 1 - absDist * 0.25));
          const zIndex = Math.max(0, 10 - Math.round(absDist * 2));
          
          // Validar valores geométricos
          const safeX = isNaN(x) ? 0 : x;
          const safeZ = isNaN(z) ? 0 : z;
          const safeRotateY = isNaN(rotateY) ? 0 : rotateY;
          const safeScale = isNaN(scale) ? 1 : scale;
          const safeOpacity = isNaN(opacity) ? 1 : opacity;
          const safeZIndex = isNaN(zIndex) ? 1 : zIndex;

          return (
            <motion.div
              key={track?.id || i}
              onClick={() => handleInternalSelect(i)}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                x: safeX, 
                scale: safeScale, 
                z: safeZ, 
                opacity: safeOpacity,
                filter: `blur(${(absDist || 0) * 1.5}px)`
              }}
              transition={{ 
                type: "spring", 
                stiffness: 150, 
                damping: 25,
                mass: 1
              }}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                marginLeft: -(COVER / 2),
                marginTop: -(COVER / 2),
                transformStyle: "preserve-3d",
                zIndex: safeZIndex,
                cursor: "pointer",
                pointerEvents: absDist > 1.5 ? "none" : "auto",
              }}
            >
              <CoverArt track={track || {} as Track} size={COVER} />
            </motion.div>
          );
        })}
      </div>

      {/* Selected track info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sel?.id || 'selected-track'}
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
            {sel?.title || 'Sin título'}
          </div>
          <div
            style={{
              fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
              fontSize: 12,
              color: sel?.accent || '#a855f7',
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginTop: 6,
              opacity: 0.85,
            }}
          >
            {sel?.artist || 'Artista desconocido'}
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
            {sel?.edition || 'Sin edición'} · {sel?.duration || '--:--'}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── TRACK LIST VIEW ─────────────────────────────────────────────────────────
function TrackListView({ tracks, selectedIndex, currentIndex, onPlay }: TrackListViewProps) {
  // Si no hay tracks, mostrar mensaje
  if (!tracks || tracks.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#a855f7",
          fontSize: 18,
        }}
      >
        No hay canciones disponibles
      </div>
    );
  }

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
              key={track?.id || `track-${i}`}
              onClick={() => onPlay(i)}
              whileTap={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              animate={{
                backgroundColor: isSel ? `${track?.accent || '#a855f7'}15` : "rgba(0,0,0,0)",
              }}
              transition={{ duration: 0.14 }}
              style={{
                height: 52,
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                borderRadius: 8,
                cursor: "pointer",
                borderLeft: `3px solid ${isSel ? (track?.accent || '#a855f7') : "transparent"}`,
              }}
            >
              {/* Track number */}
              <div
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: 10,
                  color: isSel ? (track?.accent || '#a855f7') : "rgba(255,255,255,0.2)",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  flexShrink: 0,
                  width: 30,
                }}
              >
                {track?.number || '000'}
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
                  }}
                >
                  {track?.title || 'Sin título'}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
                    fontSize: 13,
                    color: isSel ? (track?.accent || '#a855f7') : "rgba(255,255,255,0.32)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginTop: 7,
                    opacity: 0.85,
                  }}
                >
                  {track?.artist || 'Artista desconocido'}
                </div>
              </div>

              {/* Duration + play indicator */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: 11,
                }}
              >
                <span>{track?.duration || '--:--'}</span>
                {isCur && (
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: track?.accent || '#a855f7',
                    }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── NOW PLAYING VIEW ─────────────────────────────────────────────────────────
function NowPlayingView({ 
  track, 
  isPlaying, 
  elapsed, 
  duration, 
  onSeek, 
  onInfoToggle, 
  soundCloudWidget = false,
  widgetRef,
  togglePlay 
}: NowPlayingViewProps) {
  const progress = duration > 0 ? elapsed / duration : 0;
  const barRef = useRef<HTMLDivElement>(null);
  
  // Valores por defecto para track
  const trackAccent = track?.accent || '#a855f7';
  
  // URL del widget de SoundCloud
  const widgetUrl = track?.soundcloud_url ? getSoundCloudEmbedUrl(track.soundcloud_url) : null;

  const handleBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
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
          key={track?.id || 'nowplaying-track'}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.24 }}
          whileTap={{ scale: 0.96 }}
          onClick={onInfoToggle}
          style={{ cursor: "pointer", position: "relative" }}
        >
          <CoverArt track={track} size={272} />
          
          {/* SoundCloud Widget */}
          {soundCloudWidget && widgetUrl && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              height: "100%",
              zIndex: 1000,
              backgroundColor: "rgba(0,0,0,0.9)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <iframe
                ref={widgetRef}
                src={widgetUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: 8
                }}
                allow="autoplay"
              />
            </div>
          )}
          
          {/* Mobile indicator */}
          <div style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "4px 8px",
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            borderRadius: 12,
            border: `1px solid ${trackAccent}44`,
            color: trackAccent,
            fontSize: 9,
            fontWeight: "bold",
            fontFamily: "var(--font-geist-mono)",
            pointerEvents: "none"
          }}>
            INFO
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Title + artist */}
      <AnimatePresence mode="wait">
        <motion.div
          key={track?.id || 'nowplaying-track'}
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
            {track?.title || 'Sin título'}
          </div>
          <div
            style={{
              fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
              fontSize: 13,
              color: trackAccent,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginTop: 7,
              opacity: 0.85,
            }}
          >
            {track?.artist || 'Artista desconocido'}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress bar + time + play/pause - only show for non-SoundCloud tracks */}
      {!soundCloudWidget && (
        <div>
          <div
            style={{
              width: "100%",
              height: 4,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <motion.div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${progress * 100}%`,
                background: `linear-gradient(90deg, ${trackAccent}99, ${trackAccent})`,
                borderRadius: 2,
                boxShadow: `0 0 8px ${trackAccent}66`,
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
            {togglePlay && (
              <motion.span
                onClick={togglePlay}
                animate={{ opacity: isPlaying ? [0.45, 1, 0.45] : 0.45 }}
                transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
                style={{
                  color: isPlaying ? trackAccent : "rgba(255,255,255,0.32)",
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                {isPlaying ? "❚❚" : "▶"}
              </motion.span>
            )}
            <span>{track?.duration || '--:--'}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NOTES VIEW ──────────────────────────────────────────────────────────────
function NotesView({ track, article, onClose }: NotesViewProps) {
  const strata = [14, 26, 38, 50, 62, 74, 86];
  
  // Valores por defecto para track
  const trackAccent = track?.accent || '#a855f7';
  const trackBg = track?.bg || 'linear-gradient(135deg, #0d0d1a 0%, #1a0533 45%, #2d1b69 100%)';

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
          background: trackBg,
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
              stroke={trackAccent}
              strokeWidth={1 + i * 0.2}
              opacity={0.2 + i * 0.1}
            />
          );
        })}
      </svg>

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          overflowY: "auto",
          padding: "40px 32px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: 10,
                color: trackAccent,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 14,
                opacity: 0.85,
              }}
            >
              {track?.number || '000'} · {track?.edition || 'Sin edición'}
            </div>

            {/* Title */}
            <div
              style={{
                fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
                fontSize: 32,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: 8,
              }}
            >
              {track?.title || 'Sin título'}
            </div>

            {/* Artist */}
            <div
              style={{
                fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
                fontSize: 12,
                color: trackAccent,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                opacity: 0.75,
                marginBottom: 32,
              }}
            >
              {track?.artist || 'Artista desconocido'}
            </div>

            {/* Separator */}
            <div
              style={{
                width: 60,
                height: 2,
                background: trackAccent,
                marginBottom: 32,
              }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: 24,
              cursor: "pointer",
              padding: 8,
              borderRadius: 8,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
            }}
          >
            ×
          </button>
        </div>

        {/* Article content */}
        {article?.screens?.map((screen, idx) => {
          switch (screen.type) {
            case "text":
              return (
                <p
                  key={idx}
                  style={{
                    fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.9)",
                    marginBottom: 16,
                  }}
                >
                  {screen.content}
                </p>
              );
            case "heading":
              return (
                <h2
                  key={idx}
                  style={{
                    fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
                    fontSize: 24,
                    fontWeight: 600,
                    color: "#fff",
                    letterSpacing: "-0.02em",
                    marginBottom: 16,
                  }}
                >
                  {screen.content}
                </h2>
              );
            case "quote":
              return (
                <blockquote
                  key={idx}
                  style={{
                    fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
                    fontSize: 18,
                    lineHeight: 1.6,
                    color: trackAccent,
                    margin: "2em 0",
                    paddingLeft: "1em",
                    borderLeft: `2px solid ${trackAccent}88`,
                    fontStyle: "italic",
                  }}
                >
                  {screen.content}
                </blockquote>
              );
            case "closing":
              return (
                <p
                  key={idx}
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: 14,
                    color: "rgba(255,255,255,0.7)",
                    textAlign: "right",
                    fontStyle: "italic",
                    marginTop: "2em",
                  }}
                >
                  {screen.content}
                </p>
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────
interface IPodPlayerProps {
  isStandalone?: boolean;
  onBack?: () => void;
}

export default function IPodPlayer({ isStandalone = true, onBack }: IPodPlayerProps) {
  const [view, setView] = useState<ViewType>("coverflow");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundCloudWidget, setSoundCloudWidget] = useState(false);
  const [spaceFeedback, setSpaceFeedback] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [volume, setVolume] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onNextRef = useRef<(() => void) | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLIFrameElement>(null);

  const currentTrack = tracks[currentTrackIndex] || {} as Track;
  const highlightTrack = tracks[selectedIndex] || {} as Track;
  const rawArticle = getArticleForTrack(articles, currentTrack.number);
  const currentArticle = adaptArticleForPlayer(rawArticle);

  // ── Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tracksData, articlesData] = await Promise.all([
          getTracks(),
          getArticles()
        ]);
        setTracks(tracksData || []);
        setArticles(articlesData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ── Init audio
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.addEventListener("ended", () => onNextRef.current?.());
    audio.addEventListener("loadedmetadata", () => setAudioDuration(audio.duration));
    audio.addEventListener("durationchange",  () => setAudioDuration(audio.duration));
    return () => {
      audio.pause();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTicker = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (audioRef.current) setElapsed(audioRef.current.currentTime);
    }, 500);
  }, []);

  const playTrack = useCallback(
    (index: number) => {
      const track = tracks[index];
      if (!track) return;
      
      setCurrentTrackIndex(index);
      setSelectedIndex(index);
      setElapsed(0);
      
      // Si es SoundCloud, mostrar widget en lugar de audio
      if (track.soundcloud_url && track.soundcloud_url.includes('soundcloud.com')) {
        setSoundCloudWidget(true);
        setView("nowplaying");
        setIsPlaying(true);
        return;
      }
      
      // Para otros formatos, intentar reproducción directa
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.src = track.soundcloud_url || '';
      
      if (track.soundcloud_url) {
        audio.play().catch((error) => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
        setIsPlaying(true);
        startTicker();
      } else {
        setIsPlaying(false);
      }
      setView("nowplaying");
    },
    [startTicker, tracks]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    
    if (isPlaying) {
      // Pausar
      if (audio) {
        audio.pause();
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      setIsPlaying(false);
    } else {
      // Reproducir
      let hasStartedPlaying = false;
      
      if (audio && audio.src) {
        audio.play().catch(() => {});
        setIsPlaying(true);
        startTicker();
        hasStartedPlaying = true;
      }
      
      // Para SoundCloud, no hacemos nada - el usuario controla el widget directamente
      // Solo actualizamos el estado para consistencia visual
      if (soundCloudWidget) {
        setIsPlaying(true);
        hasStartedPlaying = true;
      }
      
      // Si no hay nada, igual actualizamos el estado
      if (!audio && !soundCloudWidget) {
        setIsPlaying(true);
        hasStartedPlaying = true;
      }
      
      // Si no se pudo reproducir nada, mantener en pausa
      if (!hasStartedPlaying) {
        setIsPlaying(false);
      }
    }
  }, [isPlaying, startTicker, soundCloudWidget]);

  const handleNext = useCallback(() => {
    const next = (currentTrackIndex + 1) % tracks.length;
    if (isPlaying) playTrack(next);
    else { setCurrentTrackIndex(next); setSelectedIndex(next); }
  }, [currentTrackIndex, isPlaying, playTrack, tracks]);

  const handlePrev = useCallback(() => {
    const prev = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    if (isPlaying) playTrack(prev);
    else { setCurrentTrackIndex(prev); setSelectedIndex(prev); }
  }, [currentTrackIndex, isPlaying, playTrack, tracks]);

  useEffect(() => { onNextRef.current = handleNext; }, [handleNext]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for our shortcuts
      if ([" ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "j", "k", "l", "h", "i", "m", "f", "v", "?", "Escape", "Enter"].includes(e.key)) {
        e.preventDefault();
      }
      
      if (e.key === "ArrowRight" || e.key === "l") {
        if (e.shiftKey) {
          // Fast forward
          handleSeek(Math.min(1, elapsed / audioDuration + 0.1));
        } else {
          if (view === "coverflow" || view === "tracklist") {
            // En coverflow/tracklist, solo navegar sin reproducir
            handleSelect(selectedIndex + 1);
          } else {
            // En nowplaying, ir a siguiente canción
            handleNext();
          }
        }
      } else if (e.key === "ArrowLeft" || e.key === "j") {
        if (e.shiftKey) {
          // Rewind
          handleSeek(Math.max(0, elapsed / audioDuration - 0.1));
        } else {
          if (view === "coverflow" || view === "tracklist") {
            // En coverflow/tracklist, solo navegar sin reproducir
            handleSelect(selectedIndex - 1);
          } else {
            // En nowplaying, ir a canción anterior
            handlePrev();
          }
        }
      } else if (e.key === "ArrowUp" || e.key === "k") {
        // Volume up
        setVolume(Math.min(1, volume + 0.1));
        if (audioRef.current) audioRef.current.volume = volume;
      } else if (e.key === "ArrowDown" || e.key === "h") {
        // Volume down
        setVolume(Math.max(0, volume - 0.1));
        if (audioRef.current) audioRef.current.volume = volume;
      } else if (e.key === " ") {
        // Play/Pause
        if (view === "nowplaying" && soundCloudWidget) {
          setSpaceFeedback(true);
          setTimeout(() => setSpaceFeedback(false), 800);
        } else {
          togglePlay();
        }
      } else if (e.key === "Enter") {
        if (view === "coverflow" || view === "tracklist") {
          playTrack(selectedIndex);
        } else {
          togglePlay();
        }
      } else if (e.key === "i") {
        setNotesOpen(!notesOpen);
      } else if (e.key === "m") {
        // Mute/Unmute
        if (audioRef.current) {
          audioRef.current.muted = !audioRef.current.muted;
        }
      } else if (e.key === "f") {
        // Toggle fullscreen
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        } else {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      } else if (e.key === "v") {
        // Switch view
        const views: ViewType[] = ["coverflow", "tracklist", "nowplaying"];
        const currentIndex = views.indexOf(view);
        setView(views[(currentIndex + 1) % views.length]);
      } else if (e.key === "?") {
        // Toggle help
        setShowHelp(!showHelp);
      } else if (e.key === "Escape") {
        if (notesOpen) {
          setNotesOpen(false);
        } else if (showHelp) {
          setShowHelp(false);
        } else {
          setView("coverflow");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view, selectedIndex, currentTrackIndex, isPlaying, togglePlay, handleNext, handlePrev, playTrack, notesOpen, soundCloudWidget, volume, elapsed, audioDuration, showHelp]);

  // Touch/click navigation
  const handleSelect = useCallback((index: number) => {
    if (index === selectedIndex) {
      playTrack(index);
    } else {
      setSelectedIndex(index);
    }
  }, [selectedIndex, playTrack]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 50;
    
    // Horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right - next track or next view
        if (view === "nowplaying") {
          handleNext();
        } else {
          handleSelect(selectedIndex + 1);
        }
      } else {
        // Swipe left - previous track or previous view
        if (view === "nowplaying") {
          handlePrev();
        } else {
          handleSelect(selectedIndex - 1);
        }
      }
    }
    
    // Vertical swipe
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0) {
        // Swipe down - go back to coverflow
        setView("coverflow");
      } else {
        // Swipe up - go to nowplaying
        if (view !== "nowplaying") {
          playTrack(selectedIndex);
        }
      }
    }
    
    setTouchStart(null);
  }, [touchStart, view, selectedIndex, handleNext, handlePrev, handleSelect, playTrack]);

  // Double tap for play/pause
  const lastTapRef = useRef<number>(0);
  const handleDoubleTap = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      togglePlay();
    }
    lastTapRef.current = now;
  }, [togglePlay]);

  const handleSeek = useCallback((progress: number) => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      const newTime = progress * audio.duration;
      audio.currentTime = newTime;
      setElapsed(newTime);
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#0d0d1a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#a855f7",
          fontSize: isMobile ? 16 : 18,
          fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
          gap: 20,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(168, 85, 247, 0.2)",
            borderTop: "3px solid #a855f7",
            borderRadius: "50%",
          }}
        />
        <div>Cargando música...</div>
        <div style={{ fontSize: 12, opacity: 0.6 }}>Presiona ? para ayuda</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        background: "#0d0d1a",
        fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
        color: "#fff",
        overflow: "hidden",
        touchAction: "pan-y", // Allow vertical scrolling but disable horizontal overscroll
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background gradient */}
      <AnimatePresence>
        <motion.div
          key={`${view === "nowplaying" ? "np" : "tint"}-${view === "nowplaying" ? currentTrack.id : highlightTrack.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: view === "nowplaying" ? 0.52 : 0.06 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute",
            inset: 0,
            background: view === "nowplaying" 
              ? (currentTrack.bg || 'linear-gradient(135deg, #0d0d1a 0%, #1a0533 45%, #2d1b69 100%)')
              : (highlightTrack.bg || 'linear-gradient(135deg, #0d0d1a 0%, #1a0533 45%, #2d1b69 100%)'),
            zIndex: 1,
          }}
        />
      </AnimatePresence>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Back button (standalone only) */}
        {isStandalone && onBack && (
          <button
            onClick={onBack}
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
              fontSize: isMobile ? 10 : 12,
              fontWeight: "bold",
              fontFamily: "var(--font-geist-mono)",
              padding: isMobile ? "4px 8px" : "8px 12px",
              cursor: "pointer",
              zIndex: 20,
            }}
          >
            ← BACK
          </button>
        )}
        {/* Status indicators */}
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            display: "flex",
            gap: 8,
            zIndex: 20,
          }}
        >
          {/* Mobile indicator */}
          {isMobile && (
            <div
              style={{
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 10,
                fontWeight: "bold",
                fontFamily: "var(--font-geist-mono)",
                padding: "4px 8px",
              }}
            >
              📱
            </div>
          )}
          
          {/* Playing indicator */}
          {isPlaying && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                background: "rgba(168, 85, 247, 0.2)",
                backdropFilter: "blur(4px)",
                borderRadius: 12,
                border: "1px solid rgba(168, 85, 247, 0.3)",
                color: "#a855f7",
                fontSize: 10,
                fontWeight: "bold",
                fontFamily: "var(--font-geist-mono)",
                padding: "4px 8px",
              }}
            >
              ▶
            </motion.div>
          )}
          
          {/* Fullscreen indicator */}
          {isFullscreen && (
            <div
              style={{
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 10,
                fontWeight: "bold",
                fontFamily: "var(--font-geist-mono)",
                padding: "4px 8px",
              }}
            >
              ⛶
            </div>
          )}
          
          {/* Mobile info button - only show on mobile */}
          {isMobile && (
            <button
              onClick={() => setNotesOpen(!notesOpen)}
              style={{
                background: notesOpen 
                  ? "rgba(168, 85, 247, 0.3)" 
                  : "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
                borderRadius: 12,
                border: notesOpen 
                  ? "1px solid rgba(168, 85, 247, 0.5)" 
                  : "1px solid rgba(255,255,255,0.1)",
                color: notesOpen ? "#a855f7" : "rgba(255,255,255,0.7)",
                fontSize: 12,
                fontWeight: "bold",
                fontFamily: "var(--font-geist-mono)",
                padding: "6px 10px",
                cursor: "pointer",
                minWidth: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              📄
            </button>
          )}
          
          {/* Help button */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            style={{
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 12,
              fontWeight: "bold",
              fontFamily: "var(--font-geist-mono)",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            ?
          </button>
        </div>

        {/* Views */}
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
              <CoverFlowView 
                tracks={tracks} 
                selectedIndex={selectedIndex} 
                onSelect={handleSelect}
              />
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
                tracks={tracks}
                selectedIndex={selectedIndex}
                currentIndex={currentTrackIndex}
                onPlay={(i) => {
                  if (i === currentTrackIndex && isPlaying) {
                    // Si es el track actual y está reproduciendo, pausar
                    togglePlay();
                  } else {
                    // Si no es el track actual o está pausado, reproducir
                    playTrack(i);
                  }
                }}
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
                onInfoToggle={() => setNotesOpen(!notesOpen)}
                soundCloudWidget={soundCloudWidget}
                widgetRef={widgetRef}
                togglePlay={togglePlay}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Hint bar */}
        <div
          style={{
            padding: isMobile ? "0 16px 16px" : "0 28px 20px",
            textAlign: "center",
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: isMobile ? 8 : 10,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            zIndex: 15,
          }}
        >
          {view === "coverflow" && (
            isMobile 
              ? "Swipe: Navigate • Tap: Play • 📄: Info • ?: Help"
              : "← → Navigate • Space: Play • I: Info • ?: Help • V: Views"
          )}
          {view === "tracklist" && (
            isMobile 
              ? "Swipe: Navigate • Tap: Play • 📄: Info • ?: Help"
              : "↑ ↓ Navigate • Space: Play • I: Info • ?: Help • V: Views"
          )}
          {view === "nowplaying" && (
            isMobile 
              ? "Double tap: Play/Pause • Swipe: Navigate • 📄: Info • ?: Help"
              : "← →: Seek • Space: Play/Pause • I: Info • Shift+Arrows: Seek • ?: Help • F: Fullscreen"
          )}
        </div>
      </div>

      {/* Notes overlay */}
      <AnimatePresence>
        {notesOpen && currentArticle && (
          <motion.div
            key="notes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 100,
            }}
          >
            <NotesView
              track={currentTrack}
              article={currentArticle}
              onClose={() => setNotesOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Space feedback overlay for SoundCloud widget */}
      <AnimatePresence>
        {spaceFeedback && (
          <motion.div
            key="space-feedback"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(168, 85, 247, 0.9)",
              color: "white",
              padding: "16px 24px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: "bold",
              fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
              zIndex: 200,
              pointerEvents: "none",
              backdropFilter: "blur(4px)",
            }}
          >
            Usa los controles del widget de SoundCloud
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help overlay */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            key="help"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.9)",
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: isMobile ? 20 : 40,
            }}
            onClick={() => setShowHelp(false)}
          >
            <div
              style={{
                background: "rgba(13, 13, 26, 0.95)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: 16,
                padding: isMobile ? 20 : 32,
                maxWidth: 600,
                width: "100%",
                color: "#fff",
                fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
              }}
            >
              <h2 style={{ 
                fontSize: isMobile ? 20 : 24, 
                fontWeight: 700, 
                marginBottom: 20,
                color: "#a855f7" 
              }}>
                Atajos de Teclado
              </h2>
              
              <div style={{ display: "grid", gap: 12, fontSize: isMobile ? 12 : 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Reproducir/Pausar</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", color: "#a855f7" }}>Space</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Siguiente canción</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", color: "#a855f7" }}>→ / L</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Anterior canción</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", color: "#a855f7" }}>← / J</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Adelantar 10s</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", color: "#a855f7" }}>Shift + →</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Retroceder 10s</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", color: "#a855f7" }}>Shift + ←</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Subir volumen</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", color: "#a855f7" }}>↑ / K</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Bajar volumen</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", color: "#a855f7" }}>↓ / H</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Silenciar</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", color: "#a855f7" }}>M</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Cambiar vista</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", color: "#a855f7" }}>V</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Pantalla completa</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", color: "#a855f7" }}>F</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Ver info</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", color: "#a855f7" }}>I</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Salir</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", color: "#a855f7" }}>Esc</span>
                </div>
              </div>

              <h3 style={{ 
                fontSize: isMobile ? 16 : 18, 
                fontWeight: 600, 
                marginTop: 24, 
                marginBottom: 12,
                color: "#a855f7" 
              }}>
                Gestos Táctiles
              </h3>
              
              <div style={{ display: "grid", gap: 12, fontSize: isMobile ? 12 : 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Navegar</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", color: "#a855f7" }}>Swipe horizontal</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Reproducir</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", color: "#a855f7" }}>Doble tap</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Vista nowplaying</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", color: "#a855f7" }}>Swipe arriba</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Volver</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", color: "#a855f7" }}>Swipe abajo</span>
                </div>
              </div>

              <button
                style={{
                  marginTop: 24,
                  background: "#a855f7",
                  border: "none",
                  borderRadius: 8,
                  color: "white",
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 600,
                  padding: "8px 16px",
                  cursor: "pointer",
                  width: "100%",
                }}
                onClick={() => setShowHelp(false)}
              >
                Cerrar (Esc)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import IPodPlayer from "./IPodPlayer";

const TRANSITION = { type: "spring", stiffness: 300, damping: 30 };
const SECTION_ORDER = { player: 0, notas: 1, article: 2 };

export default function App() {
  const router = useRouter();
  const pathname = usePathname();
  const prevSectionRef = useRef(null);

  // Determine initial state from URL - always show player
  const getInitialState = () => {
    return { section: "player", articleSlug: null };
  };

  const [state, setState] = useState(getInitialState());
  const { section, articleSlug } = state;

  // Update state when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const newState = getInitialState();
    if (newState.section !== state.section || newState.articleSlug !== articleSlug) {
      setState(newState);
    }
  }, [pathname]);

  // Redirect /notas and /notas/* to home page (notes integrated into player)
  useEffect(() => {
    if (pathname.startsWith('/notas')) {
      router.replace('/');
    }
  }, [pathname, router]);

  // Track direction for transitions
  const direction = prevSectionRef.current !== null && prevSectionRef.current !== section
    ? SECTION_ORDER[section] - SECTION_ORDER[prevSectionRef.current]
    : 0;
  
  useEffect(() => {
    prevSectionRef.current = section;
  }, [section]);

  const navigateToPlayer = useCallback(() => {
    setState({ section: "player", articleSlug: null });
    router.push("/", { scroll: false });
  }, [router]);

  // navigateToNotas removed - integrated into player

  // navigateToArticle removed - articles integrated into player

  const handleBack = useCallback(() => {
    // Only player section exists - back does nothing
  }, []);

  // Articles integrated into player - no separate article view

  const getVariants = (dir) => ({
    enter: { 
      y: dir > 0 ? "100%" : dir < 0 ? "-100%" : "0%",
      opacity: 0 
    },
    animate: { 
      y: 0, 
      opacity: 1 
    },
    exit: { 
      y: dir > 0 ? "-100%" : dir < 0 ? "100%" : "0%",
      opacity: 0 
    },
  });

  return (
    <div
      className="ipod-no-select"
      style={{
        position: "fixed",
        inset: 0,
        background: "#070708",
        overflow: "hidden",
      }}
    >
      {/* Scanline overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.025) 3px, rgba(0,0,0,0.025) 4px)",
          pointerEvents: "none",
          zIndex: 50,
        }}
      />

      <div style={{ position: "absolute", inset: 0 }}>
        <IPodPlayer
          onNavigateToNotas={null}
          isStandalone={false}
        />
      </div>
    </div>
  );
}
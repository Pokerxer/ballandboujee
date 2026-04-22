"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, AnimatePresence, useScroll, useSpring } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  type: "photo" | "video";
  caption: string;
  category: string;
  date: string;
  photographer: string;
  featured: boolean;
}

// ── Normalize DB item → GalleryItem ───────────────────────────────

function normalizeItem(e: any): GalleryItem {
  return {
    id: e._id ?? e.id ?? "",
    src: e.url ?? "",
    alt: e.title ?? "",
    type: e.type === "video" ? "video" : "photo",
    caption: e.caption ?? "",
    category: e.category ?? "Events",
    date: e.date ? new Date(e.date).toISOString().split("T")[0] : "",
    photographer: e.photographer ?? "@ballandboujee",
    featured: !!e.featured,
  };
}

// ── Helpers ────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────

function Lightbox({ items, currentIndex, onClose, onNext, onPrev }: {
  items: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onNext, onPrev]);

  const item = items[currentIndex];
  if (!item) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center"
      onClick={onClose}
    >
      {/* Counter */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 font-body text-sm text-white/50 z-10">
        {currentIndex + 1} / {items.length}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-accent hover:text-background flex items-center justify-center text-white transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 md:left-8 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-accent hover:text-background flex items-center justify-center text-white transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
      </button>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 md:right-8 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-accent hover:text-background flex items-center justify-center text-white transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
      </button>

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative max-w-5xl w-full mx-16 aspect-[4/3]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            className="object-contain"
            priority
            unoptimized
          />
        </motion.div>
      </AnimatePresence>

      {/* Caption bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <p className="font-display text-lg text-white text-center">{item.alt}</p>
        {item.caption && <p className="font-body text-sm text-white/60 text-center mt-1">{item.caption}</p>}
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="font-body text-xs text-accent">{item.category}</span>
          <span className="text-white/30">•</span>
          <span className="font-body text-xs text-white/50">{item.photographer}</span>
          <span className="text-white/30">•</span>
          <span className="font-body text-xs text-white/50">{new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
      </div>

      {/* Dot strip */}
      {items.length <= 20 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); if (i < currentIndex) onPrev(); else if (i > currentIndex) onNext(); }}
              className={`h-1.5 rounded-full transition-all ${i === currentIndex ? "w-6 bg-accent" : "w-1.5 bg-white/25"}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Gallery Card ──────────────────────────────────────────────────

function GalleryCard({ item, index, onClick, viewMode }: {
  item: GalleryItem;
  index: number;
  onClick: () => void;
  viewMode: "grid" | "masonry" | "list";
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const isLarge = viewMode === "masonry" && (index % 5 === 0);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: (index % 6) * 0.06 }}
      className={viewMode === "masonry" && isLarge ? "md:col-span-2" : ""}
    >
      <button onClick={onClick} className="w-full block group">
        {viewMode === "list" ? (
          /* List layout */
          <div className="flex gap-4 items-center bg-card/50 hover:bg-card border border-transparent hover:border-accent/10 rounded-2xl p-3 transition-all">
            <div className="relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-surface">
              {item.src && (
                <Image src={item.src} alt={item.alt} fill className="object-cover" unoptimized />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-display text-base text-primary group-hover:text-accent transition-colors truncate">{item.alt}</p>
              {item.caption && <p className="font-body text-xs text-accent-2 truncate mt-0.5">{item.caption}</p>}
              <div className="flex items-center gap-2 mt-1">
                <span className="font-body text-[10px] text-accent uppercase tracking-wider">{item.category}</span>
                <span className="text-accent-2/30 text-[10px]">•</span>
                <span className="font-body text-[10px] text-accent-2">{new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-2/30 group-hover:text-accent flex-shrink-0 transition-colors">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        ) : (
          /* Grid / Masonry layout */
          <div className={`relative overflow-hidden rounded-2xl bg-card ${isLarge ? "aspect-[16/9]" : "aspect-square"}`}>
            {item.src ? (
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-surface" />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Video indicator */}
            {item.type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-background ml-1"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
            )}

            {/* Category pill */}
            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="font-body text-[10px] uppercase tracking-wider px-2 py-1 bg-black/60 backdrop-blur-sm text-white rounded-md">
                {item.category}
              </span>
            </div>

            {/* Bottom info on hover */}
            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <p className="font-display text-sm text-white leading-tight">{item.alt}</p>
              <p className="font-body text-[10px] text-white/60 mt-0.5">{item.photographer}</p>
            </div>
          </div>
        )}
      </button>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function GalleryPage() {
  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "masonry" | "list">("masonry");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Fetch from backend — try proxy route first, fall back to direct backend URL
  const fetchArchive = useCallback(async () => {
    setLoading(true);
    setError("");

    const BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://backend.ballandboujee.com/api";

    // Try the Next.js proxy route first, then fall back to direct backend
    const urls = [
      "/api/archive?status=published&limit=200",
      `${BACKEND}/archive?status=published&limit=200`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue;
        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        if (items.length === 0 && !data.success) continue;
        setAllItems(items.map(normalizeItem));
        setDbCategories(Array.isArray(data.categories) ? data.categories : []);
        setLoading(false);
        return;
      } catch {
        continue;
      }
    }

    setError("Could not load archive. Please try again.");
    setLoading(false);
  }, []);

  useEffect(() => { fetchArchive(); }, [fetchArchive]);

  // Derived state
  const filteredItems = selectedCategory === "all"
    ? allItems
    : allItems.filter((i) => i.category === selectedCategory);

  const featuredItems = allItems.filter((i) => i.featured).slice(0, 4);

  const categories = [
    { id: "all", label: "All", count: allItems.length },
    ...dbCategories.map((c) => ({
      id: c,
      label: c,
      count: allItems.filter((i) => i.category === c).length,
    })),
  ];

  const handleNext = () => setLightboxIndex((i) => i !== null ? (i + 1) % filteredItems.length : null);
  const handlePrev = () => setLightboxIndex((i) => i !== null ? (i - 1 + filteredItems.length) % filteredItems.length : null);

  return (
    <main className="min-h-screen bg-background pt-16">
      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-accent z-50 origin-left" />

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative py-24 md:py-36 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/3 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-accent/30 rounded-full mb-6"
          >
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-body text-xs uppercase tracking-[0.2em] text-accent">Visual Stories</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="font-display text-6xl md:text-8xl lg:text-9xl text-primary leading-none mb-4"
          >
            THE <span className="text-accent">ARCHIVE</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-body text-lg md:text-xl text-accent-2"
          >
            Capturing the culture. One moment at a time.
          </motion.p>
        </div>
      </section>

      {/* ── States ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-sm text-accent-2">Loading archive…</p>
        </div>
      ) : error ? (
        <div className="text-center py-24 px-4">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="font-display text-xl text-primary mb-2">Something went wrong</h3>
          <p className="font-body text-sm text-accent-2 mb-6">{error}</p>
          <button
            onClick={fetchArchive}
            className="px-6 py-3 bg-accent text-background hover:bg-accent/90 font-body text-sm uppercase tracking-wider rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : allItems.length === 0 ? (
        <div className="text-center py-24 px-4">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <h3 className="font-display text-xl text-primary mb-2">Archive Coming Soon</h3>
          <p className="font-body text-sm text-accent-2">Check back soon for photos from our events.</p>
        </div>
      ) : (
        <>
          {/* ── Featured strip ── */}
          {featuredItems.length > 0 && (
            <section className="py-10 px-4">
              <FadeIn>
                <div className="max-w-6xl mx-auto">
                  <h3 className="font-display text-2xl text-primary mb-6">Featured</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {featuredItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative aspect-video rounded-2xl overflow-hidden cursor-pointer"
                        onClick={() => {
                          const idx = filteredItems.findIndex((i) => i.id === item.id);
                          setLightboxIndex(idx >= 0 ? idx : 0);
                        }}
                      >
                        <Image
                          src={item.src}
                          alt={item.alt}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-display text-base text-white leading-tight">{item.alt}</h4>
                          <p className="font-body text-[10px] text-white/60 mt-0.5 uppercase tracking-wider">{item.category}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </section>
          )}

          {/* ── Filters & view toggle ── */}
          <section className="py-6 px-4 sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b border-accent/5">
            <FadeIn>
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                {/* Category filters */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-1.5 rounded-full font-body text-xs uppercase tracking-wider transition-all ${
                        selectedCategory === cat.id
                          ? "bg-accent text-background"
                          : "bg-surface text-accent-2 hover:text-primary border border-accent-2/10"
                      }`}
                    >
                      {cat.label}
                      <span className={`ml-1.5 ${selectedCategory === cat.id ? "opacity-70" : "opacity-50"}`}>
                        ({cat.count})
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-body text-xs text-accent-2 hidden sm:inline">
                    {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
                  </span>
                  {/* View toggles */}
                  <div className="flex items-center gap-1 bg-surface border border-accent-2/10 rounded-lg p-1">
                    {(["grid", "masonry", "list"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        title={mode.charAt(0).toUpperCase() + mode.slice(1)}
                        className={`p-1.5 rounded transition-colors ${viewMode === mode ? "bg-accent text-background" : "text-accent-2 hover:text-primary"}`}
                      >
                        {mode === "grid" && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                          </svg>
                        )}
                        {mode === "masonry" && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
                            <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
                          </svg>
                        )}
                        {mode === "list" && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </section>

          {/* ── Gallery grid ── */}
          <section className="py-8 px-4 pb-24">
            <div className="max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedCategory}-${viewMode}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={
                    viewMode === "list"
                      ? "space-y-2"
                      : viewMode === "masonry"
                      ? "grid grid-cols-2 md:grid-cols-4 gap-3"
                      : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                  }
                >
                  {filteredItems.map((item, index) => (
                    <GalleryCard
                      key={item.id}
                      item={item}
                      index={index}
                      viewMode={viewMode}
                      onClick={() => setLightboxIndex(index)}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>

              {filteredItems.length === 0 && (
                <div className="text-center py-20">
                  <h3 className="font-display text-xl text-primary mb-2">No Photos Found</h3>
                  <button onClick={() => setSelectedCategory("all")} className="font-body text-sm text-accent hover:text-accent/80 transition-colors mt-2">
                    Clear filter
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ── CTA ── */}
      <section className="py-20 px-4 bg-surface">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-6">Share Your Moments</h2>
            <p className="font-body text-accent-2 text-lg mb-8 max-w-2xl mx-auto">
              Been to one of our events? Tag us @BallAndBoujee or use #BallAndBoujee to get featured in our archive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events" className="inline-block px-8 py-4 bg-accent text-background hover:bg-accent/90 transition-colors font-body text-sm uppercase tracking-wider rounded-xl">
                View Events
              </Link>
              <Link href="/shop" className="inline-block px-8 py-4 border border-accent/30 text-primary hover:bg-accent hover:text-background transition-colors font-body text-sm uppercase tracking-wider rounded-xl">
                Shop Merch
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            items={filteredItems}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

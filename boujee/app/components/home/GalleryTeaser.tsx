"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://backend.ballandboujee.com/api";

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  type: "photo" | "video";
  title: string;
  category: string;
}

function normalizeItem(raw: any): GalleryItem {
  return {
    id: raw._id || raw.id || String(Math.random()),
    src: raw.url || raw.src || "",
    alt: raw.caption || raw.title || "",
    type: raw.type === "video" ? "video" : "photo",
    title: raw.title || "",
    category: raw.category || "Events",
  };
}

function Lightbox({
  items,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  items: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onNext, onPrev]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/98 backdrop-blur-lg flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-card flex items-center justify-center text-primary hover:bg-accent hover:text-background transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 md:left-8 z-10 w-12 h-12 rounded-full bg-card flex items-center justify-center text-primary hover:bg-accent hover:text-background transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 md:right-8 z-10 w-12 h-12 rounded-full bg-card flex items-center justify-center text-primary hover:bg-accent hover:text-background transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: "spring", damping: 25 }}
          className="relative max-w-5xl w-full mx-20 aspect-video"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={items[currentIndex].src}
            alt={items[currentIndex].alt}
            fill
            className="object-contain"
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
            <p className="font-body text-sm text-accent-2">{items[currentIndex].title}</p>
            <p className="font-body text-xs text-accent">{items[currentIndex].category}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={(e) => { e.stopPropagation(); if (index !== currentIndex) index > currentIndex ? onNext() : onPrev(); }}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex ? "w-8 bg-accent" : "w-2 bg-accent-2/30 hover:bg-accent-2/50"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

function GalleryCard({ item, index, onClick }: { item: GalleryItem; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative"
    >
      <button onClick={onClick} className="w-full block">
        <div className="relative aspect-square bg-card overflow-hidden rounded-2xl">
          <Image
            src={item.src}
            alt={item.alt}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 25vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

          {item.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-background ml-1">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </motion.div>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-primary bg-accent px-3 py-1">View</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </motion.div>

          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="font-body text-[10px] uppercase tracking-wider px-2 py-1 bg-background/80 backdrop-blur-sm text-primary">
              {item.category}
            </span>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

export default function GalleryTeaser() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const urls = [
      "/api/archive?status=published&limit=12",
      `${BACKEND}/archive?status=published&limit=12`,
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue;
        const data = await res.json();
        const items: GalleryItem[] = Array.isArray(data.items) ? data.items.map(normalizeItem) : [];
        if (items.length === 0 && !data.success) continue;
        setAllItems(items);
        const cats = Array.isArray(data.categories) ? data.categories : [];
        setCategories(["All", ...cats]);
        setLoading(false);
        return;
      } catch {
        continue;
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filteredItems = filter === "All"
    ? allItems.slice(0, 6)
    : allItems.filter((i) => i.category === filter).slice(0, 6);

  const handleNext = () => {
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
  };
  const handlePrev = () => {
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
  };

  return (
    <section ref={ref} className="py-20 md:py-32 px-4 bg-background relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-3"
          >
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-accent"
            />
            <span className="font-body text-xs uppercase tracking-[0.2em] text-accent">Visual Stories</span>
          </motion.div>

          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-primary">THE ARCHIVE</h2>
          <p className="font-body text-accent-2 mt-2">Capturing the culture</p>
        </motion.div>

        {!loading && categories.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`relative px-4 py-2 font-body text-xs uppercase tracking-wider transition-colors ${
                  filter === category ? "text-background" : "text-accent-2 hover:text-primary"
                }`}
              >
                {filter === category && (
                  <motion.div
                    layoutId="teaserCategoryFilter"
                    className="absolute inset-0 bg-accent rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{category}</span>
              </button>
            ))}
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`animate-pulse ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <div className="aspect-square bg-white/5 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
            >
              {filteredItems.map((item, index) => (
                <div key={item.id} className={index === 0 ? "col-span-2 row-span-2" : ""}>
                  <GalleryCard item={item} index={index} onClick={() => setLightboxIndex(index)} />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && filteredItems.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="font-body text-accent-2">No items in this category yet.</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/gallery"
            className="group inline-flex items-center gap-3 font-body text-sm uppercase tracking-wider px-8 py-4 border border-accent/30 text-primary hover:bg-accent hover:border-accent hover:text-background transition-all rounded-full"
          >
            <span>View Full Archive</span>
            <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </motion.span>
          </Link>
        </motion.div>
      </div>

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
    </section>
  );
}

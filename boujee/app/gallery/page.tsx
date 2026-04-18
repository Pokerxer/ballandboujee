"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  type: "photo" | "video";
  title?: string;
  category: string;
  date: string;
  photographer?: string;
}

const galleryItems: GalleryItem[] = [
  { id: "1", src: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80", alt: "Abuja Summer Jam Finals", type: "photo", category: "Events", date: "2026-03-15", photographer: "@ballandboujee" },
  { id: "2", src: "https://images.unsplash.com/photo-1519861531473-92002639313cc?w=1200&q=80", alt: "Street Basketball Action", type: "photo", category: "Action", date: "2026-03-10", photographer: "@ballandboujee" },
  { id: "3", src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80", alt: "Championship Game", type: "photo", category: "Games", date: "2026-02-28", photographer: "@ballandboujee" },
  { id: "4", src: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1200&q=80", alt: "Game Time Decisions", type: "photo", category: "Action", date: "2026-02-20", photographer: "@ballandboujee" },
  { id: "5", src: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=1200&q=80", alt: "Fashion Week Appearance", type: "photo", category: "Fashion", date: "2026-02-15", photographer: "@ballandboujee" },
  { id: "6", src: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=1200&q=80", alt: "Rising Star", type: "photo", category: "Players", date: "2026-02-10", photographer: "@ballandboujee" },
  { id: "7", src: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=80", alt: "Launch Party Vibes", type: "photo", category: "Events", date: "2025-12-01", photographer: "@ballandboujee" },
  { id: "8", src: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80", alt: "Team Huddle", type: "photo", category: "Teams", date: "2026-01-28", photographer: "@ballandboujee" },
  { id: "9", src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80", alt: "Open Run Session", type: "photo", category: "Training", date: "2026-01-20", photographer: "@ballandboujee" },
  { id: "10", src: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=80", alt: "Street Style Collection", type: "photo", category: "Fashion", date: "2026-01-15", photographer: "@ballandboujee" },
  { id: "11", src: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200&q=80", alt: "Victory Celebration", type: "photo", category: "Events", date: "2026-01-10", photographer: "@ballandboujee" },
  { id: "12", src: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=1200&q=80", alt: "Game Day Ready", type: "photo", category: "Fashion", date: "2025-12-20", photographer: "@ballandboujee" },
  { id: "13", src: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=1200&q=80", alt: "MVP Award", type: "photo", category: "Events", date: "2025-12-15", photographer: "@ballandboujee" },
  { id: "14", src: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&q=80", alt: "Community Meetup", type: "photo", category: "Community", date: "2025-12-10", photographer: "@ballandboujee" },
  { id: "15", src: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80", alt: "Champion Team", type: "photo", category: "Teams", date: "2025-11-28", photographer: "@ballandboujee" },
  { id: "16", src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80", alt: "Half Time Show", type: "photo", category: "Events", date: "2025-11-20", photographer: "@ballandboujee" },
];

const categories = [
  { id: "all", label: "All", count: 16 },
  { id: "Events", label: "Events", count: 5 },
  { id: "Action", label: "Action", count: 2 },
  { id: "Games", label: "Games", count: 1 },
  { id: "Fashion", label: "Fashion", count: 4 },
  { id: "Players", label: "Players", count: 1 },
  { id: "Teams", label: "Teams", count: 2 },
  { id: "Training", label: "Training", count: 1 },
  { id: "Community", label: "Community", count: 1 },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
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

function Lightbox({ 
  items, 
  currentIndex, 
  onClose, 
  onNext, 
  onPrev 
}: { 
  items: GalleryItem[]; 
  currentIndex: number; 
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight") onNext();
    if (e.key === "ArrowLeft") onPrev();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/98 backdrop-blur-lg flex items-center justify-center"
      onKeyDown={handleKeyDown}
      tabIndex={0}
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
        onClick={onPrev}
        className="absolute left-4 md:left-8 z-10 w-12 h-12 rounded-full bg-card flex items-center justify-center text-primary hover:bg-accent hover:text-background transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 md:right-8 z-10 w-12 h-12 rounded-full bg-card flex items-center justify-center text-primary hover:bg-accent hover:text-background transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative max-w-6xl w-full mx-4 aspect-[4/3]"
      >
        <Image
          src={items[currentIndex].src}
          alt={items[currentIndex].alt}
          fill
          className="object-contain"
          priority
        />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background to-transparent">
          <h3 className="font-display text-xl text-primary">{items[currentIndex].alt}</h3>
          <div className="flex items-center gap-4 mt-2">
            <span className="font-body text-sm text-accent">{items[currentIndex].category}</span>
            <span className="font-body text-xs text-accent-2">•</span>
            <span className="font-body text-sm text-accent-2">{items[currentIndex].photographer}</span>
            <span className="font-body text-xs text-accent-2">•</span>
            <span className="font-body text-sm text-accent-2">{new Date(items[currentIndex].date).toLocaleDateString()}</span>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => index !== currentIndex && (index > currentIndex ? onNext() : onPrev())}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "w-8 bg-accent" : "bg-accent-2/30 hover:bg-accent-2/50"
            }`}
          />
        ))}
      </div>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 font-body text-sm text-accent-2">
        {currentIndex + 1} / {items.length}
      </div>
    </motion.div>
  );
}

function GalleryCard({ item, index, onClick, viewMode }: { item: GalleryItem; index: number; onClick: () => void; viewMode: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const isLarge = viewMode === "masonry" && (index === 0 || index === 4 || index === 8 || index === 12);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 8) * 0.08 }}
      className={`group relative ${viewMode === "masonry" && isLarge ? "md:col-span-2 md:row-span-2" : ""}`}
    >
      <button onClick={onClick} className="w-full block">
        <div className={`relative bg-card overflow-hidden rounded-2xl ${
          viewMode === "list" ? "flex" : "aspect-square md:aspect-video"
        }`}>
          <Image
            src={item.src}
            alt={item.alt}
            fill={viewMode !== "list"}
            width={viewMode === "list" ? 200 : undefined}
            height={viewMode === "list" ? 150 : undefined}
            className={`object-cover transition-all duration-700 group-hover:scale-110 ${
              viewMode === "list" ? "w-48 h-full" : ""
            }`}
            sizes={viewMode === "masonry" ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 768px) 50vw, 25vw"}
          />
          
          <div className={`absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent transition-all duration-300 ${
            viewMode === "list" ? "bg-gradient-to-r" : ""
          } ${viewMode === "list" ? "opacity-0 group-hover:opacity-100" : "opacity-0 group-hover:opacity-100"}`} />

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
            whileHover={{ opacity: 1, y: 0 }}
            className={`absolute p-4 transition-all duration-300 ${
              viewMode === "list" ? "relative opacity-100" : "inset-x-0 bottom-0 opacity-0 group-hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-primary bg-accent px-3 py-1">
                View
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </motion.div>

          <div className={`absolute top-3 left-3 transition-opacity ${
            viewMode === "list" ? "relative top-0 left-0" : "opacity-0 group-hover:opacity-100"
          }`}>
            <span className="font-body text-[10px] uppercase tracking-wider px-2 py-1 bg-background/80 backdrop-blur-sm text-primary">
              {item.category}
            </span>
          </div>

          {viewMode === "list" && (
            <div className="flex-1 p-4 flex flex-col justify-end text-left">
              <h3 className="font-display text-lg text-primary">{item.alt}</h3>
              <p className="font-body text-xs text-accent-2 mt-1">{item.photographer} • {new Date(item.date).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </button>
    </motion.div>
  );
}

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<"all" | "events" | "community">("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "masonry" | "list">("masonry");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const filteredItems = selectedCategory === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  const handleNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    }
  };

  const handlePrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  const featuredItems = galleryItems.slice(0, 4);

  return (
    <main className="min-h-screen bg-background pt-16">
      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-accent z-50 origin-left" />

      <section ref={heroRef} className="relative py-24 md:py-36 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/3 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-accent/30 rounded-full mb-6"
            >
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-accent" />
              <span className="font-body text-xs uppercase tracking-[0.2em] text-accent">Visual Stories</span>
            </motion.div>

            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-primary leading-none mb-4">
              THE <span className="text-accent">ARCHIVE</span>
            </h1>
            <p className="font-body text-lg md:text-xl text-accent-2">
              Capturing the culture. One moment at a time.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 px-4">
        <FadeIn>
          <div className="max-w-lg mx-auto bg-surface rounded-full p-1">
            {(["all", "events", "community"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 relative py-3 font-body text-sm uppercase tracking-wider rounded-full transition-colors"
              >
                <span className={`relative z-10 ${activeTab === tab ? "text-background" : "text-accent-2 hover:text-primary"}`}>
                  {tab === "all" ? "All Photos" : tab === "events" ? "Events" : "Community"}
                </span>
                {activeTab === tab && (
                  <motion.div
                    layoutId="galleryTab"
                    className="absolute inset-0 bg-accent rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </FadeIn>
      </section>

      {activeTab === "events" && (
        <section className="py-8 px-4">
          <FadeIn delay={0.1}>
            <div className="max-w-6xl mx-auto">
              <h3 className="font-display text-2xl text-primary mb-6">Featured Events</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative aspect-video rounded-2xl overflow-hidden cursor-pointer"
                    onClick={() => {
                      const idx = filteredItems.findIndex(i => i.id === item.id);
                      setLightboxIndex(idx >= 0 ? idx : 0);
                    }}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className="font-display text-lg text-primary">{item.alt}</h4>
                      <p className="font-body text-xs text-accent-2">{item.category}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>
        </section>
      )}

      {activeTab === "community" && (
        <section className="py-8 px-4">
          <FadeIn delay={0.1}>
            <div className="max-w-4xl mx-auto text-center py-16 bg-surface rounded-3xl">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="font-display text-3xl text-primary mb-3">Join Our Community</h3>
              <p className="font-body text-accent-2 max-w-md mx-auto mb-6">
                Share your moments with #BallAndBoujee and get featured on our page.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-accent text-background hover:bg-accent/90 transition-colors font-body text-sm uppercase tracking-wider rounded-xl"
              >
                Share Your Story
              </Link>
            </div>
          </FadeIn>
        </section>
      )}

      {activeTab === "all" && (
        <>
          <section className="py-8 px-4">
            <FadeIn delay={0.1}>
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-full font-body text-xs uppercase tracking-wider transition-all ${
                          selectedCategory === cat.id
                            ? "bg-accent text-background"
                            : "bg-surface text-accent-2 hover:text-primary"
                        }`}
                      >
                        {cat.label} ({cat.count})
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 bg-surface rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-accent text-background" : "text-accent-2 hover:text-primary"}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode("masonry")}
                      className={`p-2 rounded transition-colors ${viewMode === "masonry" ? "bg-accent text-background" : "text-accent-2 hover:text-primary"}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="9" />
                        <rect x="14" y="3" width="7" height="5" />
                        <rect x="14" y="12" width="7" height="9" />
                        <rect x="3" y="16" width="7" height="5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-accent text-background" : "text-accent-2 hover:text-primary"}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p className="font-body text-sm text-accent-2 mb-4">
                  {filteredItems.length} photo{filteredItems.length !== 1 ? "s" : ""}
                </p>
              </div>
            </FadeIn>
          </section>

          <section className="py-8 px-4 pb-24">
            <div className="max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory + viewMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={viewMode === "masonry" ? "grid grid-cols-2 md:grid-cols-4 gap-4" : viewMode === "list" ? "space-y-4" : "grid grid-cols-2 md:grid-cols-4 gap-4"}
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mx-auto mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl text-primary mb-2">No Photos Found</h3>
                  <p className="font-body text-sm text-accent-2">Check back soon for new content.</p>
                </motion.div>
              )}
            </div>
          </section>
        </>
      )}

      <section className="py-20 px-4 bg-surface">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-6">
              Share Your Moments
            </h2>
            <p className="font-body text-accent-2 text-lg mb-8 max-w-2xl mx-auto">
              Been to one of our events? Tag us @BallAndBoujee or use #BallAndBoujee to get featured in our archive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/events"
                className="inline-block px-8 py-4 bg-accent text-background hover:bg-accent/90 transition-colors font-body text-sm uppercase tracking-wider rounded-xl"
              >
                View Events
              </Link>
              <Link
                href="/shop"
                className="inline-block px-8 py-4 border border-accent/30 text-primary hover:bg-accent hover:text-background transition-colors font-body text-sm uppercase tracking-wider rounded-xl"
              >
                Shop Merch
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

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

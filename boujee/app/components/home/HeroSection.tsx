"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  tagline: string;
  ctas: { text: string; href: string; primary: boolean }[];
  image: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "BALL & BOUJEE",
    subtitle: "Where the Court Meets Culture.",
    tagline: "Basketball • Fashion • Community",
    ctas: [
      { text: "Shop Merch", href: "/shop", primary: true },
      { text: "Upcoming Events", href: "/events", primary: false },
      { text: "Join Community", href: "/contact", primary: false },
    ],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80",
  },
  {
    id: 2,
    title: "INFINITY",
    subtitle: "Limited Drops. No Restocks.",
    tagline: "Exclusive • Limited • Legacy",
    ctas: [
      { text: "Shop Infinity", href: "/shop", primary: true },
      { text: "View Collection", href: "/shop", primary: false },
    ],
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80",
  },
  {
    id: 3,
    title: "THE RUNS",
    subtitle: "Tournament Season Is Here",
    tagline: "Compete • Connect • Conquer",
    ctas: [
      { text: "Secure Your Spot", href: "/events", primary: true },
      { text: "View All Events", href: "/events", primary: false },
    ],
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80",
  },
];

function SlideContent({ slide, isActive }: { slide: Slide; isActive: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex items-center justify-center px-4"
        >
          <div className="relative z-10 text-center max-w-5xl">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="font-display text-[clamp(3rem,15vw,11rem)] leading-[0.85] tracking-tight text-primary">
                {slide.title.split(" ").map((word, i) => (
                  <span key={i} className={i === 1 ? "shimmer" : ""}>
                    {word}{" "}
                  </span>
                ))}
              </h1>
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="font-accent italic text-[clamp(1rem,2.5vw,1.75rem)] text-accent-2 mt-6"
            >
              {slide.subtitle}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="font-body text-xs md:text-sm uppercase tracking-[0.4em] text-accent-2/70 mt-4"
            >
              {slide.tagline}
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap gap-3 md:gap-4 mt-10 md:mt-14 justify-center"
            >
              {slide.ctas.map((cta, i) => (
                <Link key={i} href={cta.href}>
                  <motion.span
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`inline-block font-body text-xs md:text-sm font-semibold uppercase tracking-wider px-6 md:px-10 py-4 transition-all ${
                      cta.primary
                        ? "bg-accent text-background hover:shadow-[0_0_30px_rgba(201,168,76,0.4)]"
                        : "border border-primary/30 text-primary hover:bg-primary hover:text-background"
                    }`}
                  >
                    {cta.text}
                  </motion.span>
                </Link>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SlideIndicator({ slides, activeSlide, onSlideChange }: {
  slides: Slide[];
  activeSlide: number;
  onSlideChange: (index: number) => void;
}) {
  return (
    <div className="absolute bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => onSlideChange(index)}
            className="group relative"
          >
            <motion.div
              className={`h-0.5 transition-all duration-500 ${
                index === activeSlide ? "w-8 bg-accent" : "w-4 bg-accent-2/30 hover:bg-accent-2/50"
              }`}
            />
            {index === activeSlide && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function NavigationArrows({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <div className="absolute top-1/2 left-4 md:left-8 right-auto z-20">
      <button
        onClick={onPrev}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-accent-2/30 flex items-center justify-center text-accent-2 hover:border-accent hover:text-accent transition-all group"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="group-hover:-translate-x-0.5 transition-transform"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    </div>
  );
}

function NavigationArrowsRight({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <div className="absolute top-1/2 right-4 md:right-8 left-auto z-20">
      <button
        onClick={onNext}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-accent-2/30 flex items-center justify-center text-accent-2 hover:border-accent hover:text-accent transition-all group"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="group-hover:translate-x-0.5 transition-transform"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setActiveSlide(index);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrev = () => goToSlide((activeSlide - 1 + slides.length) % slides.length);
  const goToNext = () => goToSlide((activeSlide + 1) % slides.length);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
              style={{ backgroundImage: `url('${slide.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
            <div className="absolute inset-0 grain-overlay" />
          </div>
        ))}
      </motion.div>

      <div className="relative z-10 h-full">
        {slides.map((slide, index) => (
          <SlideContent key={slide.id} slide={slide} isActive={index === activeSlide} />
        ))}
      </div>

      <NavigationArrows onPrev={goToPrev} onNext={goToNext} />
      <NavigationArrowsRight onPrev={goToPrev} onNext={goToNext} />
      <SlideIndicator slides={slides} activeSlide={activeSlide} onSlideChange={goToSlide} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex flex-col items-center gap-2">
          <div className="w-6 h-10 rounded-full border-2 border-accent-2/50 flex justify-center pt-2">
            <motion.div
              animate={{ opacity: [1, 0], y: [0, 12] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-accent rounded-full"
            />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-accent-2/60">Scroll</span>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-3"
      >
        {slides.map((_, i) => (
          <motion.a
            key={i}
            href="#"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 + i * 0.1 }}
            whileHover={{ scale: 1.1, x: -5 }}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i === activeSlide
                ? "border border-accent text-accent"
                : "border border-accent-2/30 text-accent-2 hover:border-accent hover:text-accent"
            }`}
          >
            {i + 1}
          </motion.a>
        ))}
      </motion.div>

      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20 flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-full border border-accent-2/10">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="font-body text-xs text-accent-2 uppercase tracking-wider">
            {activeSlide + 1} / {slides.length}
          </span>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "EST. 2024", label: "Our Beginning" },
  { value: "100+", label: "Community Members" },
  { value: "DROPS", label: "Limited Edition" },
];

export default function AboutTeaser() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 md:py-32 px-4 bg-surface relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row gap-6 md:gap-10"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group relative"
              >
                <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-accent transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                <span className="font-display text-3xl md:text-4xl lg:text-5xl text-primary group-hover:text-accent transition-colors">
                  {stat.value}
                </span>
                <p className="font-body text-[10px] md:text-xs text-accent-2 uppercase tracking-[0.2em] mt-2">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-accent via-accent/50 to-transparent" />
            <div className="pl-6 md:pl-8">
              <p className="font-body text-base md:text-lg text-accent-2 leading-relaxed mb-8">
                We are more than a brand — we are a movement bridging the gap between 
                basketball culture and high fashion. From the courts to the streets, 
                we create apparel that tells a story of legacy, style, and community.
              </p>
              <Link 
                href="/about"
                className="group inline-flex items-center gap-3 font-body text-sm uppercase tracking-wider text-primary hover:text-accent transition-colors"
              >
                <span className="relative">
                  Our Story
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
                </span>
                <motion.span 
                  whileHover={{ x: 5 }}
                  className="flex items-center"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-16 md:mt-24 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent origin-center"
        />
      </div>
    </section>
  );
}

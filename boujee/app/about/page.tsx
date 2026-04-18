"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";

const stats = [
  { value: "10K+", label: "Community Members", suffix: "" },
  { value: "15", label: "Limited Drops", suffix: "+" },
  { value: "8", label: "African Countries", suffix: "" },
  { value: "95", label: "Customer Satisfaction", suffix: "%" },
];

const values = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Authenticity",
    description: "Every piece tells a story rooted in basketball culture and street style."
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Limited Drops",
    description: "Exclusivity matters. We release limited quantities. No restocks."
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Community First",
    description: "We're building a movement, not just a brand. Join the family."
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Quality Above All",
    description: "Premium materials and craftsmanship in every stitch."
  }
];

const timeline = [
  {
    year: "2024",
    title: "The Beginning",
    description: "Ball & Boujee was born in Abuja from a love of basketball and high fashion. We saw a gap between the court and the runway in Africa's fashion scene.",
    image: "https://images.unsplash.com/photo-1519861531473-92002639313cc?w=600&q=80"
  },
  {
    year: "2024",
    title: "First Drop",
    description: "Our inaugural collection sold out across Nigeria in hours. The movement had begun.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80"
  },
  {
    year: "2025",
    title: "Going Continental",
    description: "Now shipping across Africa and beyond. From Lagos to Nairobi to London, the family keeps growing.",
    image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&q=80"
  }
];

const team = [
  {
    name: "Chidi Okonkwo",
    role: "Founder & Creative Director",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    bio: "Former basketball player turned designer. Born in Abuja, raised on the court.",
    quote: "Style is the ultimate game-time decision."
  },
  {
    name: "Adaeze Nwosu",
    role: "Head of Design",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
    bio: "Fashion industry veteran bringing African elegance to streetwear.",
    quote: "Every thread tells a story of legacy."
  },
  {
    name: "Emeka Okafor",
    role: "Community Lead",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
    bio: "Connecting with our community across the continent.",
    quote: "It's not just apparel, it's a lifestyle."
  }
];

const faqs = [
  {
    question: "How do I know my size?",
    answer: "Check our size guide on each product page. We recommend sizing up for an oversized fit."
  },
  {
    question: "What's your return policy?",
    answer: "We offer free returns within 30 days of purchase in Nigeria. Items must be unworn with tags attached."
  },
  {
    question: "Do you ship across Africa?",
    answer: "Yes! We ship to 8 African countries and counting. Free shipping on orders over ₦30,000 within Nigeria."
  },
  {
    question: "How can I stay updated on new drops?",
    answer: "Subscribe to our newsletter and follow us on social media for exclusive early access to drops."
  }
];

const gallery = [
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80",
  "https://images.unsplash.com/photo-1519861531473-92002639313cc?w=600&q=80",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
  "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&q=80",
  "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80",
];

function AnimatedCounter({ value, suffix, label }: { value: string; suffix: string; label: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  const numValue = parseInt(value.replace(/\D/g, ""));

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = numValue / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= numValue) {
          setCount(numValue);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, numValue]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl md:text-5xl text-accent">
        {count}{suffix}
      </div>
      <div className="font-body text-sm text-accent-2 mt-2 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function FadeIn({ children, delay = 0, direction = "up" }: { children: React.ReactNode; delay?: number; direction?: "up" | "down" | "left" | "right" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const directions = {
    up: { opacity: 0, y: 40 },
    down: { opacity: 0, y: -40 },
    left: { opacity: 0, x: 40 },
    right: { opacity: 0, x: -40 },
  };

  return (
    <motion.div
      ref={ref}
      initial={directions[direction]}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1 }}
      className="border-b border-accent-2/10"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="font-body text-base text-primary group-hover:text-accent transition-colors pr-4">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-accent flex-shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="font-body text-sm text-accent-2 pb-5 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AboutPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <main className="min-h-screen bg-background pt-16">
      <section ref={heroRef} className="relative py-24 md:py-40 px-4 overflow-hidden">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-20 left-10 w-32 h-32 border border-accent/20 rounded-full"
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-20 right-10 w-24 h-24 border border-accent/30 rounded-full"
        />
        
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[180px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-accent/30 rounded-full mb-8"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-accent"
              />
              <span className="font-body text-xs uppercase tracking-[0.2em] text-accent">Our Story</span>
            </motion.div>
            
            <motion.h1 
              className="font-display text-7xl md:text-9xl lg:text-[10rem] text-primary leading-[0.9] mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              BALL & <br />
              <span className="text-accent relative">
                BOUJEE
                <motion.svg
                  className="absolute -bottom-4 left-0 w-full"
                  viewBox="0 0 200 8"
                  fill="none"
                  initial={{ width: 0 }}
                  animate={heroInView ? { width: "100%" } : {}}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  <path d="M0 4C50 0 150 8 200 4" stroke="currentColor" strokeWidth="2" />
                </motion.svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
              className="font-body text-lg md:text-xl text-accent-2 max-w-2xl mx-auto"
            >
              Born in Abuja. Playing worldwide.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <div className="relative">
                <div className="absolute -inset-4 bg-accent/5 rounded-3xl" />
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80"
                    alt="Basketball court aesthetic"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent rounded-2xl flex items-center justify-center shadow-xl"
                >
                  <div className="text-center">
                    <div className="font-display text-3xl text-background">2024</div>
                    <div className="font-body text-[10px] text-background/70 uppercase tracking-wider">Est.</div>
                  </div>
                </motion.div>
              </div>
            </FadeIn>

            <FadeIn direction="left" delay={0.2}>
              <div>
                <h2 className="font-display text-4xl md:text-5xl text-primary mb-8 leading-tight">
                  From the Courts of <br />
                  <span className="text-accent">Abuja to the World</span>
                </h2>
                <div className="space-y-6 text-accent-2 font-body leading-relaxed">
                  <p className="text-lg">
                    Ball & Boujee started in Abuja with a simple idea: what happens when you blend 
                    the energy of Nigerian basketball culture with the elegance of high fashion? The answer 
                    was something entirely new.
                  </p>
                  <p>
                    We grew up on the courts of Abuja and Lagos. We grew up loving fashion. We saw how 
                    athletes expressed themselves through their style off the court, and we 
                    wanted to create something that captured that magic.
                  </p>
                  <p>
                    Every piece in our collection is designed with intention — premium 
                    materials, thoughtful details, and an aesthetic that speaks to those who 
                    know the game and appreciate the style.
                  </p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 flex items-center gap-4"
                >
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-12 h-12 rounded-full border-2 border-background bg-surface overflow-hidden">
                        <Image
                          src={`https://i.pravatar.cc/100?img=${i + 20}`}
                          alt="Community member"
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="font-body text-sm">
                    <span className="text-primary font-semibold">10K+</span>
                    <span className="text-accent-2"> across Africa</span>
                  </div>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-4 bg-surface relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <AnimatedCounter key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-block font-body text-xs uppercase tracking-[0.3em] text-accent mb-4"
              >
                What We Stand For
              </motion.span>
              <h2 className="font-display text-5xl md:text-6xl text-primary mb-6">
                Our Values
              </h2>
              <p className="font-body text-accent-2 text-lg max-w-2xl mx-auto">
                The principles that guide everything we do.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <FadeIn key={value.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group bg-card p-8 rounded-3xl h-full border border-transparent hover:border-accent/20 transition-all"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-background transition-all"
                  >
                    {value.icon}
                  </motion.div>
                  <h3 className="font-display text-2xl text-primary mb-4 group-hover:text-accent transition-colors">
                    {value.title}
                  </h3>
                  <p className="font-body text-sm text-accent-2 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="inline-block font-body text-xs uppercase tracking-[0.3em] text-accent mb-4">
                The Timeline
              </span>
              <h2 className="font-display text-5xl md:text-6xl text-primary mb-6">
                Our Journey
              </h2>
              <p className="font-body text-accent-2 text-lg max-w-2xl mx-auto">
                From a vision to a movement.
              </p>
            </div>
          </FadeIn>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent/0 via-accent/30 to-accent/0 hidden md:block transform -translate-x-1/2" />
            
            <div className="space-y-16 md:space-y-24">
              {timeline.map((item, index) => (
                <FadeIn key={item.year} delay={index * 0.15}>
                  <div className={`md:flex md:items-center md:gap-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'}`}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-surface rounded-3xl overflow-hidden inline-block"
                      >
                        <div className="relative aspect-video md:w-80 lg:w-96">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
                        </div>
                        <div className="p-6">
                          <span className="font-display text-4xl text-accent mb-2 block">{item.year}</span>
                          <h3 className="font-display text-xl text-primary mb-2">{item.title}</h3>
                          <p className="font-body text-sm text-accent-2">{item.description}</p>
                        </div>
                      </motion.div>
                    </div>
                    <div className="hidden md:flex md:w-12 justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        className="w-4 h-4 rounded-full bg-accent border-4 border-background shadow-lg"
                      />
                    </div>
                    <div className="md:w-1/2" />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-4 bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="inline-block font-body text-xs uppercase tracking-[0.3em] text-accent mb-4">
                The Family
              </span>
              <h2 className="font-display text-5xl md:text-6xl text-primary mb-6">
                Meet the Team
              </h2>
              <p className="font-body text-accent-2 text-lg max-w-2xl mx-auto">
                The people behind the brand.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <FadeIn key={member.name} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-6">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <p className="font-body text-sm text-primary italic mb-2">"{member.quote}"</p>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-display text-2xl text-primary group-hover:text-accent transition-colors">{member.name}</h3>
                  <p className="font-body text-sm text-accent mt-2 mb-3">{member.role}</p>
                  <p className="font-body text-sm text-accent-2">{member.bio}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="inline-block font-body text-xs uppercase tracking-[0.3em] text-accent mb-4">
                In the Wild
              </span>
              <h2 className="font-display text-5xl md:text-6xl text-primary mb-6">
                Community Gallery
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {gallery.map((img, index) => (
              <FadeIn key={index} delay={index * 0.05}>
                <motion.div
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  className="relative aspect-square rounded-2xl overflow-hidden"
                >
                  <Image
                    src={img}
                    alt="Gallery"
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-4 bg-surface">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="inline-block font-body text-xs uppercase tracking-[0.3em] text-accent mb-4">
                Help
              </span>
              <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">
                Frequently Asked Questions
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="bg-card rounded-3xl p-6 md:p-8">
              {faqs.map((faq, index) => (
                <FAQItem key={faq.question} {...faq} index={index} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 md:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeIn>
            <h2 className="font-display text-5xl md:text-6xl text-primary mb-8">
              Join the <span className="text-accent">Movement</span>
            </h2>
            <p className="font-body text-accent-2 text-lg mb-10 max-w-2xl mx-auto">
              Be the first to know about new drops, exclusive content, and community events across Nigeria and Africa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-card border border-accent-2/20 rounded-xl font-body text-primary placeholder:text-accent-2/50 focus:outline-none focus:border-accent transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-accent text-background hover:bg-accent/90 transition-colors font-body text-sm uppercase tracking-wider rounded-xl"
              >
                Subscribe
              </motion.button>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 flex flex-wrap justify-center gap-6"
            >
              <Link href="/shop" className="px-8 py-4 bg-accent text-background hover:bg-accent/90 transition-colors font-body text-sm uppercase tracking-wider rounded-xl">
                Shop Latest Drop
              </Link>
              <Link href="/" className="px-8 py-4 border border-accent/30 text-primary hover:bg-accent hover:text-background transition-colors font-body text-sm uppercase tracking-wider rounded-xl">
                Back to Home
              </Link>
            </motion.div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}

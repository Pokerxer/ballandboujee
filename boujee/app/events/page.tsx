"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";

interface EventData {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  endDate?: string;
  location: string;
  address: string;
  price: number;
  priceLabel: string;
  image: string;
  tags: string[];
  spots: number;
  totalSpots: number;
  description: string;
  featured: boolean;
  category: string;
}

function formatCategory(cat: string): string {
  if (!cat) return "";
  return cat.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function normalizeEvent(e: any): EventData {
  const spots = e.capacity ? Math.max(0, e.capacity - (e.registrations ?? 0)) : 0;
  return {
    id: e._id ?? e.id ?? "",
    title: e.title ?? "",
    subtitle: e.description ? e.description.slice(0, 100) : formatCategory(e.category),
    date: e.date ? new Date(e.date).toISOString() : "",
    endDate: e.endDate ? new Date(e.endDate).toISOString() : undefined,
    location: e.location ?? "",
    address: e.address ?? "",
    price: Number(e.price) || 0,
    priceLabel: "Per Person",
    image: e.image?.url ?? e.image ?? "",
    tags: Array.isArray(e.tags) ? e.tags : [],
    spots,
    totalSpots: e.capacity ?? 0,
    description: e.description ?? "",
    featured: e.isFeatured ?? false,
    category: e.category ?? "other",
  };
}

function AnimatedCounter({ value, label }: { value: number; label: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = value / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) { setCount(value); clearInterval(timer); }
        else { setCount(Math.floor(start)); }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl md:text-5xl text-accent">{count}+</div>
      <div className="font-body text-xs text-accent-2 uppercase tracking-wider mt-2">{label}</div>
    </div>
  );
}

function FlipCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-14 h-16 md:w-20 md:h-24 bg-card border border-accent/20 rounded-xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
        <motion.div
          key={value}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="font-display text-2xl md:text-4xl text-accent font-bold">
            {String(value).padStart(2, "0")}
          </span>
        </motion.div>
        <div className="absolute inset-x-0 top-1/2 h-px bg-accent/20" />
      </div>
      <span className="font-body text-[10px] md:text-xs uppercase tracking-wider text-accent-2 mt-2">{label}</span>
    </div>
  );
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;
      if (difference <= 0) { setIsExpired(true); clearInterval(interval); return; }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className="flex items-center gap-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="font-display text-3xl md:text-5xl text-accent">
          LIVE NOW
        </motion.div>
        <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-3 h-3 rounded-full bg-danger" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 md:gap-3">
      <FlipCard value={timeLeft.days} label="Days" />
      <span className="font-display text-xl md:text-3xl text-accent-2/50 mt-[-20px]">:</span>
      <FlipCard value={timeLeft.hours} label="Hours" />
      <span className="font-display text-xl md:text-3xl text-accent-2/50 mt-[-20px]">:</span>
      <FlipCard value={timeLeft.minutes} label="Mins" />
      <span className="font-display text-xl md:text-3xl text-accent-2/50 mt-[-20px] hidden md:inline">:</span>
      <FlipCard value={timeLeft.seconds} label="Secs" />
    </div>
  );
}

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

function RegistrationModal({
  event,
  isOpen,
  onClose,
}: {
  event: EventData | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", teamName: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", eventId: event.id, ...formData }),
      });
    } catch { /* ignore */ }
    setIsSubmitted(true);
    setIsSubmitting(false);
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
      setFormData({ name: "", email: "", phone: "", teamName: "" });
    }, 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-auto"
        >
          {isSubmitted ? (
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6"
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </motion.div>
              <h3 className="font-display text-2xl text-primary mb-2">Registered!</h3>
              <p className="font-body text-accent-2">We'll be in touch with confirmation details.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-2xl text-primary">Register</h3>
                  <p className="font-body text-sm text-accent-2">{event.title}</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-accent-2 hover:text-primary transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-body text-sm text-accent-2 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm text-accent-2 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm text-accent-2 mb-2">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent"
                    placeholder="+234 800 000 0000"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm text-accent-2 mb-2">Team / Group Name (optional)</label>
                  <input
                    type="text"
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent"
                    placeholder="Your team or group name"
                  />
                </div>

                <div className="bg-surface rounded-xl p-4 mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-sm text-accent-2">Event</span>
                    <span className="font-body text-sm text-primary">{event.title}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-sm text-accent-2">Date</span>
                    <span className="font-body text-sm text-primary">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-accent-2/10">
                    <span className="font-body text-sm text-accent-2">Total</span>
                    <span className="font-display text-xl text-accent">
                      {event.price > 0 ? `₦${event.price.toLocaleString()}` : "Free"}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-body text-sm uppercase tracking-wider py-4 bg-accent text-background hover:bg-accent/90 transition-colors rounded-xl mt-4 disabled:opacity-60"
                >
                  {isSubmitting ? "Registering…" : "Complete Registration"}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function FeaturedEvent({ event, onRegister }: { event: EventData; onRegister: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-3xl overflow-hidden mb-16"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-transparent to-accent/10 z-10" />

      {event.image ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105 cursor-pointer"
          style={{ backgroundImage: `url('${event.image}')` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-card" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30 z-20" />

      <div className="relative z-30 p-8 md:p-12 lg:p-16">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-full mb-6"
        >
          <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-background" />
          <span className="font-body text-xs uppercase tracking-wider font-semibold">Featured Event</span>
        </motion.div>

        <div className="max-w-3xl">
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-primary mb-2 leading-none">
            {event.title}
          </h2>
          {event.subtitle && <p className="font-body text-xl text-accent-2 mb-6">{event.subtitle}</p>}

          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-8">
              {event.tags.map((tag) => (
                <span key={tag} className="font-body text-xs uppercase tracking-wider px-4 py-2 bg-card/80 backdrop-blur-sm border border-accent/20 text-primary">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {event.description && (
            <p className="font-body text-lg text-accent-2 max-w-2xl mb-8">{event.description}</p>
          )}

          <div className="flex flex-col lg:flex-row lg:items-end gap-8">
            <div className="flex-1">
              <CountdownTimer targetDate={event.date} />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 items-start lg:items-end">
              <div>
                <div className="font-display text-4xl text-accent">
                  {event.price > 0 ? `₦${event.price.toLocaleString()}` : "Free"}
                </div>
                <div className="font-body text-xs text-accent-2 uppercase">{event.priceLabel}</div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRegister}
                className="px-8 py-4 bg-accent text-background hover:bg-accent/90 transition-colors font-body text-sm uppercase tracking-wider rounded-xl"
              >
                Register Now
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {event.totalSpots > 0 && (
        <div className="absolute bottom-6 right-6 flex gap-3 z-30">
          <div className="bg-background/80 backdrop-blur-sm rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="font-body text-xs text-accent uppercase">Spots Open</span>
            </div>
            <div className="w-24 h-1.5 bg-card rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(event.spots / event.totalSpots) * 100}%` }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="h-full bg-accent rounded-full"
              />
            </div>
            <p className="font-body text-[10px] text-accent-2 mt-1">{event.spots}/{event.totalSpots}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function UpcomingEventCard({
  event,
  index,
  onRegister,
}: {
  event: EventData;
  index: number;
  onRegister: () => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <div className="relative aspect-[16/10] md:aspect-[21/9] rounded-3xl overflow-hidden mb-6">
        {event.image ? (
          <Image src={event.image} alt={event.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-card" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        {event.tags.length > 0 && (
          <div className="absolute top-4 left-4 flex gap-2">
            {event.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="font-body text-[10px] uppercase tracking-wider px-3 py-1.5 bg-accent text-background font-semibold">
                {tag}
              </span>
            ))}
          </div>
        )}

        {event.totalSpots > 0 && (
          <div className="absolute top-4 right-4">
            <div className="bg-background/90 backdrop-blur-sm rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-body text-xs text-accent uppercase">Spots Open</span>
              </div>
              <div className="w-24 h-1.5 bg-card rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(event.spots / event.totalSpots) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-accent rounded-full"
                />
              </div>
              <p className="font-body text-[10px] text-accent-2 mt-1">{event.spots}/{event.totalSpots}</p>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <motion.h3
            className="font-display text-3xl md:text-5xl text-primary group-hover:text-accent transition-colors"
            whileHover={{ x: 10 }}
          >
            {event.title}
          </motion.h3>
          {event.subtitle && <p className="font-body text-accent-2 mt-1">{event.subtitle}</p>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-accent-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="font-body">
                {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                {" • "}
                {new Date(event.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-3 text-accent-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="font-body">{event.location}</span>
              </div>
            )}
          </div>

          {event.description && (
            <p className="font-body text-accent-2 leading-relaxed">{event.description}</p>
          )}
        </div>

        <div className="lg:text-right">
          <div className="bg-surface/50 rounded-2xl p-6">
            <div className="mb-6">
              <CountdownTimer targetDate={event.date} />
            </div>
            <div className="mb-6">
              <div className="font-display text-4xl text-accent">
                {event.price > 0 ? `₦${event.price.toLocaleString()}` : "Free"}
              </div>
              <div className="font-body text-xs text-accent-2 uppercase mt-1">{event.priceLabel}</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRegister}
              className="w-full font-body text-sm uppercase tracking-wider py-4 bg-accent text-background hover:bg-accent/90 transition-colors rounded-xl"
            >
              Register Now
            </motion.button>
            {event.totalSpots > 0 && (
              <p className="font-body text-xs text-accent-2 mt-3 text-center">{event.spots} spots remaining</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PastEventCard({ event, index }: { event: EventData; index: number }) {
  return (
    <FadeIn delay={index * 0.1}>
      <motion.div
        whileHover={{ y: -10, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="group cursor-pointer"
      >
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
          {event.image ? (
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-card" />
          )}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <span className="inline-block font-body text-[10px] uppercase tracking-wider px-2 py-1 bg-accent/20 text-accent mb-2 w-fit">
              Completed
            </span>
            <h3 className="font-display text-2xl text-primary group-hover:text-accent transition-colors">{event.title}</h3>
            {event.subtitle && <p className="font-body text-sm text-accent-2">{event.subtitle}</p>}
          </div>
        </div>
      </motion.div>
    </FadeIn>
  );
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
  const [pastEvents, setPastEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "calendar">("cards");
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    async function fetchEvents() {
      try {
        const [upRes, pastRes] = await Promise.all([
          fetch("/api/events?type=upcoming"),
          fetch("/api/events?status=completed"),
        ]);
        const upData = await upRes.json();
        const pastData = await pastRes.json();

        const upList = Array.isArray(upData) ? upData : (upData.events ?? []);
        const pastList = Array.isArray(pastData) ? pastData : (pastData.events ?? []);

        setUpcomingEvents(upList.map(normalizeEvent));
        setPastEvents(pastList.map(normalizeEvent));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const featuredEvent = upcomingEvents.find((e) => e.featured) ?? upcomingEvents[0] ?? null;
  const regularEvents = upcomingEvents.filter((e) => e.id !== featuredEvent?.id);

  // Build filter options from unique categories across all upcoming events
  const allCategories = Array.from(new Set(upcomingEvents.map((e) => e.category).filter(Boolean)));
  const categoryFilters = ["all", ...allCategories];

  const filteredUpcomingEvents = regularEvents.filter((event) => {
    return selectedFilter === "all" || event.category === selectedFilter;
  });

  const handleRegister = (event: EventData) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-background pt-16">
      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-accent z-50 origin-left" />

      {/* Hero */}
      <section ref={heroRef} className="relative py-24 md:py-36 px-4 overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute top-20 left-10 w-20 h-20 border border-accent/20 rounded-full hidden md:block" />

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
              <span className="font-body text-xs uppercase tracking-[0.2em] text-accent">Live Events</span>
            </motion.div>

            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-primary leading-none mb-4">
              THE <span className="text-accent">RUNS</span>
            </h1>
            <p className="font-body text-lg md:text-xl text-accent-2">
              Ball & Boujee Events
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tab toggle */}
      <section className="py-8 -mt-8 relative z-20">
        <FadeIn>
          <div className="max-w-lg mx-auto bg-surface/80 backdrop-blur-xl rounded-full p-1 shadow-xl border border-accent/10 px-2 flex">
            {(["upcoming", "past"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 relative py-3 font-body text-sm uppercase tracking-wider rounded-full transition-colors"
              >
                <span className={`relative z-10 ${activeTab === tab ? "text-background" : "text-accent-2 hover:text-primary"}`}>
                  {tab === "upcoming" ? "Upcoming" : "Past Events"}
                </span>
                {activeTab === tab && (
                  <motion.div
                    layoutId="eventsTab"
                    className="absolute inset-0 bg-accent rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Filters (upcoming only) */}
      {activeTab === "upcoming" && allCategories.length > 0 && (
        <section className="py-8 px-4">
          <FadeIn delay={0.1}>
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-body text-sm text-accent-2 py-2">Filter:</span>
                {categoryFilters.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilter(cat)}
                    className={`px-4 py-2 rounded-full font-body text-xs uppercase tracking-wider transition-all ${
                      selectedFilter === cat
                        ? "bg-accent text-background"
                        : "bg-surface text-accent-2 hover:text-primary border border-accent-2/20"
                    }`}
                  >
                    {cat === "all" ? "All" : formatCategory(cat)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === "cards" ? "bg-accent text-background" : "text-accent-2 hover:text-primary"}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === "calendar" ? "bg-accent text-background" : "text-accent-2 hover:text-primary"}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </button>
                <span className="font-body text-xs text-accent-2 ml-2">
                  {filteredUpcomingEvents.length} event{filteredUpcomingEvents.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </FadeIn>
        </section>
      )}

      {/* Stats */}
      <section className="py-8 px-4 bg-surface">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8">
            <AnimatedCounter value={upcomingEvents.length + pastEvents.length || 0} label="Events" />
            <AnimatedCounter value={
              [...upcomingEvents, ...pastEvents].reduce((sum, e) => sum + (e.totalSpots - e.spots), 0) || 0
            } label="Registered" />
            <AnimatedCounter value={pastEvents.length || 0} label="Completed" />
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 px-4 pb-32">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === "upcoming" ? (
                <motion.div
                  key="upcoming"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-16"
                >
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-2">
                          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                        </svg>
                      </div>
                      <h3 className="font-display text-xl text-primary mb-2">No Upcoming Events</h3>
                      <p className="font-body text-sm text-accent-2">Check back soon for new events!</p>
                    </div>
                  ) : (
                    <>
                      {featuredEvent && (
                        <FeaturedEvent event={featuredEvent} onRegister={() => handleRegister(featuredEvent)} />
                      )}

                      {viewMode === "calendar" ? (
                        <div className="space-y-8">
                          <h3 className="font-display text-2xl text-primary">Events Calendar</h3>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredUpcomingEvents.map((event, index) => (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleRegister(event)}
                                className="bg-surface rounded-2xl p-6 cursor-pointer hover:border-accent/30 border border-transparent transition-all group"
                              >
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex flex-col items-center justify-center flex-shrink-0">
                                    <span className="font-display text-xs text-accent uppercase">
                                      {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                                    </span>
                                    <span className="font-display text-2xl text-accent">
                                      {new Date(event.date).getDate()}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-display text-lg text-primary group-hover:text-accent transition-colors">{event.title}</h4>
                                    <p className="font-body text-xs text-accent-2">{event.location}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-body text-sm text-accent">
                                    {event.price > 0 ? `₦${event.price.toLocaleString()}` : "Free"}
                                  </span>
                                  {event.totalSpots > 0 && (
                                    <span className="font-body text-xs text-accent-2">{event.spots} spots left</span>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ) : filteredUpcomingEvents.length > 0 ? (
                        <div className="space-y-12">
                          <h3 className="font-display text-2xl text-primary">
                            {featuredEvent ? "More Events" : "Upcoming Events"}
                          </h3>
                          {filteredUpcomingEvents.map((event, index) => (
                            <UpcomingEventCard
                              key={event.id}
                              event={event}
                              index={index}
                              onRegister={() => handleRegister(event)}
                            />
                          ))}
                        </div>
                      ) : selectedFilter !== "all" ? (
                        <div className="text-center py-12">
                          <h3 className="font-display text-xl text-primary mb-2">No Events Found</h3>
                          <p className="font-body text-sm text-accent-2 mb-4">Try a different filter</p>
                          <button onClick={() => setSelectedFilter("all")} className="font-body text-sm text-accent hover:text-accent/80">
                            Clear Filter
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="past"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {pastEvents.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="font-body text-accent-2">No past events yet.</p>
                    </div>
                  ) : (
                    <FadeIn>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pastEvents.map((event, index) => (
                          <PastEventCard key={event.id} event={event} index={index} />
                        ))}
                      </div>
                    </FadeIn>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-surface relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeIn>
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-6">
              Host an Event with Us
            </h2>
            <p className="font-body text-accent-2 text-lg mb-8 max-w-2xl mx-auto">
              Want to partner with Ball & Boujee for your next event? We'd love to hear from you.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-accent text-background hover:bg-accent/90 transition-colors font-body text-sm uppercase tracking-wider rounded-xl"
            >
              Get in Touch
            </Link>
          </FadeIn>
        </div>
      </section>

      <RegistrationModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}

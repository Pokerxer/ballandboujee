"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useAppDispatch } from "../../hooks/useStore";
import { openCartDrawer } from "../../store/slices/cartSlice";

interface EventData {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  endDate?: string;
  location: string;
  address: string;
  price: number;
  image: string;
  tags: string[];
  spots: number;
  totalSpots: number;
}

const upcomingEvent: EventData = {
  id: "1",
  title: "SUMMER JAM",
  subtitle: "3v3 Tournament",
  date: "2026-03-20T18:00:00",
  location: "Downtown Basketball Courts",
  address: "123 Hoops Ave, Los Angeles, CA",
  price: 25,
  image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
  tags: ["3v3", "Open Run", "Prize Money"],
  spots: 24,
  totalSpots: 32,
};

const pastEvents = [
  {
    id: "2",
    title: "WINTER CLASSIC",
    subtitle: "5v5 League Finals",
    date: "2026-02-15T14:00:00",
    location: "Venice Beach Courts",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80",
  },
  {
    id: "3",
    title: "STREET HOOPS",
    subtitle: "1v1 Challenge",
    date: "2026-01-28T16:00:00",
    location: "Hollywood Basketball Center",
    image: "https://images.unsplash.com/photo-1519861531473-92002639313cc?w=600&q=80",
  },
];

function FlipCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-20 md:w-20 md:h-24 bg-card border border-accent/20 rounded-xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
        <motion.div
          key={value}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="font-display text-3xl md:text-4xl text-accent font-bold">
            {String(value).padStart(2, "0")}
          </span>
        </motion.div>
        <div className="absolute inset-x-0 top-1/2 h-px bg-accent/20" />
      </div>
      <span className="font-body text-[10px] md:text-xs uppercase tracking-wider text-accent-2 mt-3">
        {label}
      </span>
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

      if (difference <= 0) {
        setIsExpired(true);
        clearInterval(interval);
        return;
      }

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
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="font-display text-3xl md:text-5xl text-accent"
        >
          LIVE NOW
        </motion.div>
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-3 h-3 rounded-full bg-danger"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <FlipCard value={timeLeft.days} label="Days" />
      <span className="font-display text-2xl md:text-3xl text-accent-2/50 mt-[-24px]">:</span>
      <FlipCard value={timeLeft.hours} label="Hours" />
      <span className="font-display text-2xl md:text-3xl text-accent-2/50 mt-[-24px]">:</span>
      <FlipCard value={timeLeft.minutes} label="Mins" />
      <span className="font-display text-2xl md:text-3xl text-accent-2/50 mt-[-24px] hidden md:inline">:</span>
      <FlipCard value={timeLeft.seconds} label="Secs" />
    </div>
  );
}

function EventCard({ event, isUpcoming = true }: { event: EventData | typeof pastEvents[0]; isUpcoming?: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const dispatch = useAppDispatch();
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = () => {
    dispatch(openCartDrawer());
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`group relative overflow-hidden rounded-2xl ${isUpcoming ? 'col-span-full' : ''}`}
    >
      <div className="relative aspect-[21/9] md:aspect-[3/1] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url('${('image' in event ? event.image : '')}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" />
        
        {!isUpcoming && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
        )}

        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
          <div className="flex items-start justify-between">
            <div>
              {!isUpcoming && (
                <span className="inline-block font-body text-[10px] uppercase tracking-wider px-2 py-1 bg-accent/20 text-accent mb-3">
                  Completed
                </span>
              )}
              <h3 className="font-display text-3xl md:text-5xl text-primary group-hover:text-accent transition-colors">
                {event.title}
              </h3>
              {'subtitle' in event && (
                <p className="font-body text-accent-2 mt-1">{event.subtitle}</p>
              )}
            </div>

            {isUpcoming && 'price' in event && (
              <div className="text-right">
                <span className="font-display text-3xl md:text-4xl text-accent">₦{event.price?.toLocaleString()}</span>
                <p className="font-body text-[10px] text-accent-2 uppercase">Per Team</p>
              </div>
            )}
          </div>
        </div>

        {isUpcoming && 'spots' in event && (
          <div className="absolute top-4 right-4">
            <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="font-body text-xs text-accent-2 uppercase">Spots Left</span>
              </div>
              <div className="w-20 h-1.5 bg-card rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(event.spots / event.totalSpots) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-accent rounded-full"
                />
              </div>
              <p className="font-body text-[10px] text-accent-2 mt-1">{event.spots}/{event.totalSpots} teams</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function EventTeaser() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  return (
    <section ref={ref} className="py-20 md:py-32 px-4 bg-surface relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-accent/30 rounded-full mb-4">
            <motion.span 
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-accent"
            />
            <span className="font-body text-xs uppercase tracking-widest text-accent">Live Events</span>
          </div>
          
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-primary">
            THE RUNS
          </h2>
          <p className="font-body text-accent-2 mt-2">Ball & Boujee Events</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex bg-card rounded-full p-1">
            {(["upcoming", "past"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2 font-body text-sm uppercase tracking-wider rounded-full transition-colors ${
                  activeTab === tab ? "text-background" : "text-accent-2 hover:text-primary"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="eventTab"
                    className="absolute inset-0 bg-accent rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "upcoming" ? (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <EventCard event={upcomingEvent} isUpcoming />

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card border border-accent/10 rounded-2xl p-6 md:p-10"
              >
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <motion.span 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-accent"
                      />
                      <span className="font-body text-xs uppercase tracking-wider text-accent">
                        Coming Up
                      </span>
                    </div>
                    
                    <h3 className="font-display text-3xl md:text-5xl lg:text-6xl text-primary leading-tight">
                      {upcomingEvent.title}
                    </h3>
                    
                    <p className="font-body text-accent-2 text-lg">{upcomingEvent.subtitle}</p>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 text-accent-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="font-body">
                          {new Date(upcomingEvent.date).toLocaleDateString("en-US", { 
                            weekday: "long", 
                            year: "numeric", 
                            month: "long", 
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-accent-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="font-body">{upcomingEvent.location}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {upcomingEvent.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="font-body text-[10px] uppercase tracking-wider px-3 py-1.5 bg-background border border-accent-2/20 text-accent-2"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-center lg:items-end">
                    <CountdownTimer targetDate={upcomingEvent.date} />
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-8"
                    >
                      <button 
                        onClick={() => dispatch(openCartDrawer())}
                        className="font-body text-sm font-semibold uppercase tracking-wider px-10 py-4 bg-accent text-background hover:bg-accent/90 transition-colors inline-block rounded-xl"
                      >
                        Register Now
                      </button>
                    </motion.div>
                    
                    <p className="font-body text-xs text-accent-2 mt-4">
                      ₦{upcomingEvent.price?.toLocaleString()} per team • {upcomingEvent.spots} spots left
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="past"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {pastEvents.map((event, index) => (
                <EventCard key={event.id} event={event} isUpcoming={false} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link 
            href="/events"
            className="inline-flex items-center gap-3 font-body text-sm uppercase tracking-wider px-8 py-4 border border-accent/30 text-primary hover:bg-accent hover:border-accent hover:text-background transition-all rounded-full"
          >
            View All Events
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

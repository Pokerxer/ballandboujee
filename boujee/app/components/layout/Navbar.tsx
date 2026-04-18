"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useStore";
import { openCartDrawer } from "../../store/slices/cartSlice";
import { logout } from "../../store/slices/authSlice";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/shop", label: "Shop" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const searchProducts = [
  { id: "1", name: "Infinity Classic Tank", slug: "infinity-classic-tank", price: 45, image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=200&q=80", category: "tank" },
  { id: "2", name: "Courtside Tee", slug: "courtside-tee", price: 55, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&q=80", category: "tee" },
  { id: "3", name: "Boujee Hoops Hoodie", slug: "boujee-hoops-hoodie", price: 85, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&q=80", category: "hoodie" },
  { id: "4", name: "Street Legend Cap", slug: "street-legend-cap", price: 35, image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200&q=80", category: "accessory" },
  { id: "5", name: "Game Day Shorts", slug: "game-day-shorts", price: 48, image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=200&q=80", category: "shorts" },
  { id: "6", name: "Classic Crew Socks", slug: "classic-crew-socks", price: 18, image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=200&q=80", category: "accessory" },
  { id: "7", name: "Venice Beach Tank", slug: "venice-beach-tank", price: 40, image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&q=80", category: "tank" },
  { id: "8", name: "Oversized Hoodie", slug: "oversized-hoodie", price: 95, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=200&q=80", category: "hoodie" },
];

const socialLinks = [
  { name: "Instagram", href: "#", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" },
  { name: "X", href: "#", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { name: "TikTok", href: "#", icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
];

function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof searchProducts>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = searchProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/98 backdrop-blur-lg flex items-start justify-center pt-24 px-4"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-primary hover:text-accent transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-2xl"
      >
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-2"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-12 pr-4 py-4 bg-surface border border-accent-2/20 rounded-2xl font-body text-primary placeholder:text-accent-2/50 focus:outline-none focus:border-accent transition-colors text-lg"
          />
        </div>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 bg-surface rounded-2xl overflow-hidden"
            >
              <div className="p-2">
                <p className="font-body text-xs text-accent-2 uppercase tracking-wider px-3 py-2">
                  Products ({results.length})
                </p>
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-card transition-colors"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-card flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-body text-sm text-primary truncate">{product.name}</h4>
                      <p className="font-body text-xs text-accent-2 capitalize">{product.category}</p>
                    </div>
                    <span className="font-body text-sm font-bold text-accent">₦{product.price.toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {query.length > 0 && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center"
          >
            <p className="font-body text-accent-2">No products found for "{query}"</p>
            <p className="font-body text-sm text-accent-2/70 mt-2">Try searching for "tank", "tee", "hoodie", or "shorts"</p>
          </motion.div>
        )}

        {query.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <p className="font-body text-xs text-accent-2 uppercase tracking-wider mb-4">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {["tank", "tee", "hoodie", "shorts", "cap", "socks"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-4 py-2 bg-surface rounded-full font-body text-sm text-accent-2 hover:text-primary hover:bg-card transition-colors capitalize"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg lg:hidden"
        >
          <div className="flex flex-col h-full pt-24 px-6 pb-8">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="font-display text-4xl text-primary hover:text-accent transition-colors block py-2"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto">
              <p className="font-body text-xs text-accent-2 uppercase tracking-widest mb-4">Follow Us</p>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-12 h-12 rounded-full border border-accent-2/30 flex items-center justify-center text-accent-2 hover:border-accent hover:text-accent transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-primary hover:text-accent transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CartButton() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <button 
      onClick={() => dispatch(openCartDrawer())}
      className="relative p-2 text-primary hover:text-accent transition-colors"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {itemCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-background text-[10px] font-bold rounded-full flex items-center justify-center"
        >
          {itemCount > 9 ? "9+" : itemCount}
        </motion.span>
      )}
    </button>
  );
}

function AuthButtons() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    router.push("/");
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-8 bg-accent-2/10 rounded-lg animate-pulse" />
        <div className="w-16 h-8 bg-accent-2/10 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="px-3 py-2 font-body text-sm text-primary hover:text-accent transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 bg-accent text-background font-body text-sm rounded-lg hover:bg-accent/90 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 p-2 text-primary hover:text-accent transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-48 bg-card border border-accent-2/10 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-accent-2/10">
              <p className="font-body text-sm text-primary">{user?.name}</p>
              <p className="font-body text-xs text-accent-2">{user?.email}</p>
            </div>
            <div className="py-1">
              <Link
                href="/account"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2 font-body text-sm text-primary hover:bg-surface transition-colors"
              >
                My Account
              </Link>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left font-body text-sm text-danger hover:bg-surface transition-colors"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled || pathname !== "/" 
            ? "bg-background/95 backdrop-blur-md border-b border-accent-2/10" 
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-display text-2xl md:text-3xl text-primary group-hover:text-accent transition-colors">
                B&B
              </span>
              <span className="hidden sm:inline font-body text-[10px] uppercase tracking-widest text-accent-2">
                Ball & Boujee
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 font-body text-sm uppercase tracking-wider transition-colors ${
                    pathname === link.href ? "text-accent" : "text-primary hover:text-accent"
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-0 right-0 h-px bg-accent"
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <CartButton />
              
              <AuthButtons />
              
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2 text-primary hover:text-accent transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-primary hover:text-accent transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <AnimatePresence>
        {searchOpen && <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

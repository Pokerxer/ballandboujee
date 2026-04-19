"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../hooks/useStore";
import { addToCart, openCartDrawer } from "../store/slices/cartSlice";
import { addToWishlist, removeFromWishlist } from "../store/slices/wishlistSlice";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images?: string[];
  badge?: "new" | "limited" | "sold-out";
  sizes?: { size: string; stock: number }[];
  colors?: { name: string; hex: string }[];
  category: string;
  description?: string;
}

const categories = [
  { id: "all", label: "All Products" },
  { id: "Female Fashion", label: "Female Fashion" },
  { id: "Male Fashion", label: "Male Fashion" },
  { id: "Bags & Purses", label: "Bags & Purses" },
  { id: "Shoes", label: "Shoes" },
  { id: "Accessories", label: "Accessories" },
  { id: "Perfumes", label: "Perfumes" },
  { id: "Luxury Hair", label: "Luxury Hair" },
  { id: "Skincare", label: "Skincare" },
  { id: "Gift Items", label: "Gift Items" },
  { id: "Kiddies Fashion", label: "Kiddies Fashion" },
];

const priceRanges = [
  { id: "all", label: "All Prices", min: 0, max: Infinity },
  { id: "0-40", label: "Under ₦40,000", min: 0, max: 40000 },
  { id: "40-60", label: "₦40,000 - ₦60,000", min: 40000, max: 60000 },
  { id: "60-100", label: "₦60,000 - ₦100,000", min: 60000, max: 100000 },
  { id: "100+", label: "₦100,000+", min: 100000, max: Infinity },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

function normalizeProduct(p: any): Product {
  const images = (p.images || []).map((img: any) => (typeof img === "string" ? img : img.url)).filter(Boolean);
  const image = images[0] || "/placeholder.jpg";

  const variants = p.variants || [];
  const firstVariant = variants[0];
  const price = firstVariant?.price || 0;
  const compareAtPrice = firstVariant?.compareAtPrice || undefined;

  const sizeMap = new Map<string, number>();
  for (const v of variants) {
    if (v.size) sizeMap.set(v.size, (sizeMap.get(v.size) || 0) + (v.stock || 0));
  }
  const sizes = sizeMap.size > 0
    ? Array.from(sizeMap.entries()).map(([size, stock]) => ({ size, stock }))
    : undefined;

  const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
  let badge: "new" | "limited" | "sold-out" | undefined;
  if (totalStock === 0) badge = "sold-out";
  else if (totalStock <= 5) badge = "limited";
  else if (p.tags?.includes("new")) badge = "new";

  return {
    _id: p._id?.toString() || p.id,
    name: p.name,
    slug: p.slug,
    price,
    compareAtPrice,
    image,
    images,
    badge,
    sizes,
    category: p.category,
    description: p.description,
  };
}

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-accent-2/10 pb-5 mb-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <h3 className="font-body text-xs uppercase tracking-wider text-primary group-hover:text-accent transition-colors">
          {title}
        </h3>
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-accent-2"
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Sidebar({ 
  activeCategory,
  onCategoryChange,
  activePriceRange,
  onPriceRangeChange,
  activeBadges,
  onBadgesChange,
}: { 
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  activePriceRange: string;
  onPriceRangeChange: (range: string) => void;
  activeBadges: string[];
  onBadgesChange: (badges: string[]) => void;
}) {
  const activeFiltersCount = [
    activeCategory !== "all",
    activePriceRange !== "all",
    activeBadges.length > 0,
  ].filter(Boolean).length;

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-32 bg-surface/50 backdrop-blur-sm rounded-2xl p-6 border border-accent-2/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-primary">FILTERS</h2>
          {activeFiltersCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 bg-accent text-background text-xs font-bold rounded-full flex items-center justify-center"
            >
              {activeFiltersCount}
            </motion.span>
          )}
        </div>

        <div className="space-y-2">
          <FilterSection title="Category">
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all ${
                    activeCategory === category.id
                      ? "bg-accent text-background"
                      : "text-primary hover:bg-background hover:text-accent"
                  }`}
                >
                  <span className="font-body text-sm">{category.label}</span>
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Price Range">
            <div className="space-y-1">
              {priceRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => onPriceRangeChange(range.id)}
                  className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-all ${
                    activePriceRange === range.id
                      ? "bg-accent text-background"
                      : "text-primary hover:bg-background hover:text-accent"
                  }`}
                >
                  <span className="font-body text-sm">{range.label}</span>
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Badges">
            <div className="space-y-1">
              {["new", "limited", "sold-out"].map((badge) => (
                <label
                  key={badge}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-background transition-colors"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={activeBadges.includes(badge)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onBadgesChange([...activeBadges, badge]);
                        } else {
                          onBadgesChange(activeBadges.filter((b) => b !== badge));
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-accent-2/30 rounded transition-all peer-checked:bg-accent peer-checked:border-accent flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-background opacity-0 peer-checked:opacity-100">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  </div>
                  <span className="font-body text-sm capitalize text-primary">{badge.replace("-", " ")}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {(activeCategory !== "all" || activePriceRange !== "all" || activeBadges.length > 0) && (
            <button
              onClick={() => {
                onCategoryChange("all");
                onPriceRangeChange("all");
                onBadgesChange([]);
              }}
              className="w-full py-3 border border-accent/30 text-accent hover:bg-accent hover:text-background transition-colors font-body text-sm uppercase tracking-wider rounded-lg"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

function MobileFilters({ 
  isOpen,
  onClose,
  activeCategory,
  onCategoryChange,
  activePriceRange,
  onPriceRangeChange,
  activeBadges,
  onBadgesChange,
}: { 
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  activePriceRange: string;
  onPriceRangeChange: (range: string) => void;
  activeBadges: string[];
  onBadgesChange: (badges: string[]) => void;
}) {
  const activeFiltersCount = [
    activeCategory !== "all",
    activePriceRange !== "all",
    activeBadges.length > 0,
  ].filter(Boolean).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/90 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-card border-r border-accent-2/10 overflow-y-auto"
          >
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-accent-2/10 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-xl text-primary">FILTERS</h2>
                  {activeFiltersCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 bg-accent text-background text-xs font-bold rounded-full flex items-center justify-center"
                    >
                      {activeFiltersCount}
                    </motion.span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-accent-2 hover:text-primary transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-2">
              <FilterSection title="Category">
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => { onCategoryChange(category.id); onClose(); }}
                      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all ${
                        activeCategory === category.id
                          ? "bg-accent text-background"
                          : "text-primary hover:bg-surface hover:text-accent"
                      }`}
                    >
                      <span className="font-body text-sm">{category.label}</span>
                    </button>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Price Range">
                <div className="space-y-1">
                  {priceRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => { onPriceRangeChange(range.id); onClose(); }}
                      className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-all ${
                        activePriceRange === range.id
                          ? "bg-accent text-background"
                          : "text-primary hover:bg-surface hover:text-accent"
                      }`}
                    >
                      <span className="font-body text-sm">{range.label}</span>
                    </button>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Badges">
                <div className="space-y-1">
                  {["new", "limited", "sold-out"].map((badge) => (
                    <label
                      key={badge}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-surface transition-colors"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={activeBadges.includes(badge)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              onBadgesChange([...activeBadges, badge]);
                            } else {
                              onBadgesChange(activeBadges.filter((b) => b !== badge));
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 border-2 border-accent-2/30 rounded transition-all peer-checked:bg-accent peer-checked:border-accent flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-background opacity-0 peer-checked:opacity-100">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </div>
                      </div>
                      <span className="font-body text-sm capitalize text-primary">{badge.replace("-", " ")}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {(activeCategory !== "all" || activePriceRange !== "all" || activeBadges.length > 0) && (
                <button
                  onClick={() => {
                    onCategoryChange("all");
                    onPriceRangeChange("all");
                    onBadgesChange([]);
                    onClose();
                  }}
                  className="w-full py-3 border border-accent/30 text-accent hover:bg-accent hover:text-background transition-colors font-body text-sm uppercase tracking-wider rounded-lg"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const { token } = useAppSelector((state) => state.auth);

  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showSecondImage, setShowSecondImage] = useState(false);

  const isWishlisted = wishlistItems.some((item) => item.id === product._id);
  const hasMultipleImages = product.images && product.images.length > 1;
  const hasSizes = product.sizes && product.sizes.length > 0;
  const selectedSizeData = selectedSize !== null ? product.sizes?.[selectedSize] : null;
  const isSizeAvailable = selectedSizeData ? selectedSizeData.stock > 0 : true;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSizeAvailable && hasSizes) return;

    const size = product.sizes?.[selectedSize ?? 0]?.size || "M";
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      size,
      quantity,
    }));
    dispatch(openCartDrawer());
    setIsAdded(true);
    setQuantity(1);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      dispatch(removeFromWishlist({ id: product._id }));
      if (token) {
        try {
          await fetch(`/api/auth?action=wishlist&productId=${product._id}&token=${token}`, { method: "PUT" });
        } catch (err) {
          console.error("Failed to remove from wishlist:", err);
        }
      }
    } else {
      dispatch(addToWishlist({
        id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
      }));
      if (token) {
        try {
          await fetch(`/api/auth?action=wishlist&productId=${product._id}&token=${token}`, { method: "PUT" });
        } catch (err) {
          console.error("Failed to add to wishlist:", err);
        }
      }
    }
  };

  const discount = product.compareAtPrice && Number(product.compareAtPrice) > 0
    ? Math.round(((Number(product.compareAtPrice) - product.price) / Number(product.compareAtPrice)) * 100)
    : 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link href={`/shop/${product.slug}`} className="group block">
        <div
          className="relative aspect-[3/4] bg-surface overflow-hidden rounded-2xl"
          onMouseEnter={() => {
            setIsHovered(true);
            if (hasMultipleImages) setShowSecondImage(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            setShowSecondImage(false);
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={showSecondImage ? "second" : "first"}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={hasMultipleImages && showSecondImage ? product.images![1] : product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent"
          />

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: isHovered ? 0 : -20, opacity: isHovered ? 1 : 0 }}
            className="absolute top-0 left-0 right-0 p-4 flex justify-between"
          >
            <div className="flex flex-col gap-2">
              {product.badge && (
                <span className={`font-body text-[10px] uppercase tracking-wider px-3 py-1.5 font-bold ${
                  product.badge === "new" ? "bg-accent text-background" :
                  product.badge === "limited" ? "bg-primary text-background" :
                  "bg-danger text-primary"
                }`}>
                  {product.badge}
                </span>
              )}
              {discount > 0 && (
                <span className="font-body text-[10px] uppercase tracking-wider px-3 py-1.5 bg-danger text-primary font-bold w-fit">
                  -{discount}%
                </span>
              )}
            </div>

            <motion.button
              onClick={handleWishlist}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center transition-colors shadow-lg ${
                isWishlisted ? "text-danger" : "text-primary hover:text-danger"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
            className="absolute bottom-0 left-0 right-0 p-4"
          >
            {hasSizes && (
              <div className="bg-background/95 backdrop-blur-md rounded-xl p-3 mb-3 shadow-xl">
                <div className="flex gap-1">
                  {product.sizes!.map((sizeData, i) => (
                    <button
                      key={sizeData.size}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedSize(i); }}
                      disabled={sizeData.stock === 0}
                      className={`flex-1 h-9 text-xs font-medium transition-all ${
                        selectedSize === i
                          ? "bg-accent text-background"
                          : sizeData.stock === 0
                          ? "bg-surface text-accent-2/30 cursor-not-allowed line-through"
                          : "bg-surface text-primary hover:bg-accent hover:text-background"
                      }`}
                    >
                      {sizeData.size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={handleAddToCart}
              disabled={!isSizeAvailable && hasSizes}
              className={`w-full font-body text-xs uppercase tracking-wider py-3.5 transition-colors flex items-center justify-center gap-2 rounded-xl shadow-lg ${
                isSizeAvailable || !hasSizes
                  ? "bg-accent text-background hover:bg-accent/90"
                  : "bg-surface text-accent-2 cursor-not-allowed"
              }`}
            >
              {isAdded ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Added
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  {hasSizes && selectedSizeData?.stock === 0 ? "Sold Out" : "Add to Cart"}
                </>
              )}
            </button>
          </motion.div>
        </div>

        <div className="mt-4 px-1">
          <h3 className="font-body text-base font-semibold text-primary group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-body text-base font-bold text-primary">₦{product.price.toLocaleString()}</span>
            {product.compareAtPrice && product.compareAtPrice > 0 && (
              <span className="font-body text-sm text-accent-2 line-through">₦{product.compareAtPrice.toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ListProductCard({ product, index }: { product: Product; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const { token } = useAppSelector((state) => state.auth);

  const [selectedSize, setSelectedSize] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showSecondImage, setShowSecondImage] = useState(false);

  const isWishlisted = wishlistItems.some((item) => item.id === product._id);
  const hasMultipleImages = product.images && product.images.length > 1;
  const hasSizes = product.sizes && product.sizes.length > 0;
  const selectedSizeData = hasSizes ? product.sizes?.[selectedSize] : null;
  const isSizeAvailable = selectedSizeData ? selectedSizeData.stock > 0 : true;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isSizeAvailable && hasSizes) return;

    const size = product.sizes?.[selectedSize]?.size || "M";
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      size,
      quantity,
    }));
    dispatch(openCartDrawer());
    setIsAdded(true);
    setQuantity(1);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWishlist = async () => {
    if (isWishlisted) {
      dispatch(removeFromWishlist({ id: product._id }));
      if (token) {
        try {
          await fetch(`/api/auth?action=wishlist&productId=${product._id}&token=${token}`, { method: "PUT" });
        } catch (err) {
          console.error("Failed to remove from wishlist:", err);
        }
      }
    } else {
      dispatch(addToWishlist({
        id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
      }));
      if (token) {
        try {
          await fetch(`/api/auth?action=wishlist&productId=${product._id}&token=${token}`, { method: "PUT" });
        } catch (err) {
          console.error("Failed to add to wishlist:", err);
        }
      }
    }
  };

  const discount = product.compareAtPrice && Number(product.compareAtPrice) > 0
    ? Math.round(((Number(product.compareAtPrice) - product.price) / Number(product.compareAtPrice)) * 100)
    : 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.2) }}
    >
      <Link href={`/shop/${product.slug}`} className="group block">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 bg-surface/50 hover:bg-surface rounded-2xl transition-colors">
          <div 
            className="relative w-32 h-48 flex-shrink-0 bg-card overflow-hidden rounded-xl"
            onMouseEnter={() => hasMultipleImages && setShowSecondImage(true)}
            onMouseLeave={() => setShowSecondImage(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={showSecondImage ? "second" : "first"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <Image
                  src={hasMultipleImages && showSecondImage ? product.images![1] : product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </motion.div>
            </AnimatePresence>

            {product.badge && (
              <span className={`absolute top-2 left-2 font-body text-[9px] uppercase tracking-wider px-2 py-1 font-bold ${
                product.badge === "new" ? "bg-accent text-background" :
                product.badge === "limited" ? "bg-primary text-background" :
                "bg-danger text-primary"
              }`}>
                {product.badge}
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between py-2">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-body text-lg font-semibold text-primary group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <p className="font-body text-sm text-accent-2 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); handleWishlist(); }}
                  className={`flex-shrink-0 w-10 h-10 rounded-full border border-accent-2/20 flex items-center justify-center transition-colors ${
                    isWishlisted ? "text-danger border-danger" : "text-accent-2 hover:text-danger hover:border-danger"
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="font-body text-xl font-bold text-primary">₦{product.price.toLocaleString()}</span>
                {product.compareAtPrice && product.compareAtPrice > 0 && (
                  <span className="font-body text-sm text-accent-2 line-through">₦{product.compareAtPrice.toLocaleString()}</span>
                )}
                {discount > 0 && (
                  <span className="font-body text-xs text-danger">-{discount}% OFF</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
              {hasSizes && (
                <div className="flex gap-1">
                  {product.sizes!.map((sizeData, i) => (
                    <button
                      key={sizeData.size}
                      onClick={(e) => { e.preventDefault(); setSelectedSize(i); }}
                      disabled={sizeData.stock === 0}
                      className={`w-10 h-10 text-xs font-medium transition-all ${
                        selectedSize === i
                          ? "bg-accent text-background"
                          : sizeData.stock === 0
                          ? "bg-card text-accent-2/30 cursor-not-allowed line-through"
                          : "bg-card text-primary hover:bg-accent hover:text-background"
                      }`}
                    >
                      {sizeData.size}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-accent-2">Qty:</span>
                <div className="flex items-center border border-accent-2/20 rounded-lg">
                  <button
                    onClick={(e) => { e.preventDefault(); setQuantity(Math.max(1, quantity - 1)); }}
                    className="w-8 h-8 flex items-center justify-center text-primary hover:text-accent transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  <span className="w-8 text-center font-body text-sm text-primary">{quantity}</span>
                  <button
                    onClick={(e) => { e.preventDefault(); setQuantity(Math.min(10, quantity + 1)); }}
                    className="w-8 h-8 flex items-center justify-center text-primary hover:text-accent transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!isSizeAvailable && hasSizes}
                className={`ml-auto font-body text-xs uppercase tracking-wider px-4 sm:px-6 py-3 transition-colors flex items-center gap-2 rounded-xl ${
                  isSizeAvailable || !hasSizes
                    ? "bg-accent text-background hover:bg-accent/90"
                    : "bg-card text-accent-2 cursor-not-allowed"
                }`}
              >
                {isAdded ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Added
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    {hasSizes && selectedSizeData?.stock === 0 ? "Sold Out" : "Add"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ShopPage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activePriceRange, setActivePriceRange] = useState("all");
  const [activeBadges, setActiveBadges] = useState<string[]>([]);
  const [activeSort, setActiveSort] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      try {
        const queryParams = new URLSearchParams();
        if (activeCategory !== "all") queryParams.append("category", activeCategory);
        if (activePriceRange !== "all") {
          const ranges: Record<string, [number, number]> = {
            "0-40": [0, 40000],
            "40-60": [40000, 60000],
            "60-100": [60000, 100000],
            "100+": [100000, Infinity],
          };
          const [min, max] = ranges[activePriceRange];
          if (min !== undefined) queryParams.append("minPrice", min.toString());
          if (max !== undefined && max !== Infinity) queryParams.append("maxPrice", max.toString());
        }
        if (activeBadges.length > 0) {
          activeBadges.forEach(badge => queryParams.append("badge", badge));
        }
        queryParams.append("sort", activeSort);
        queryParams.append("page", currentPage.toString());
        queryParams.append("limit", productsPerPage.toString());

        const response = await fetch(`/api/products?${queryParams}`);
        const data = await response.json();

        if (data.success) {
          setProducts((data.products || []).map(normalizeProduct));
          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, activePriceRange, activeBadges, activeSort, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activePriceRange, activeBadges]);

  const activeFiltersCount = [
    activeCategory !== "all",
    activePriceRange !== "all",
    activeBadges.length > 0,
  ].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-background pt-16">
      <section className="relative py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-3 px-5 py-2 border border-accent/30 rounded-full mb-6"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-accent"
              />
              <span className="font-body text-xs uppercase tracking-[0.2em] text-accent">Infinity Collection</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="font-display text-6xl md:text-8xl lg:text-9xl text-primary leading-none"
            >
              SHOP
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="font-body text-accent-2 mt-4 text-lg"
            >
              Limited Drops. No Restocks.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="sticky top-16 z-30 bg-background/98 backdrop-blur-xl border-b border-accent-2/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-accent-2/30 text-primary hover:border-accent hover:text-accent transition-colors rounded-lg"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                </svg>
                <span className="font-body text-sm uppercase tracking-wider hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 bg-accent text-background text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <span className="font-body text-sm text-accent-2">
                <span className="hidden sm:inline">Showing </span>
                <span className="text-primary font-medium">{products.length}</span>
                <span className="hidden sm:inline"> products</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 border border-accent-2/20 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-accent text-background" : "text-accent-2 hover:text-primary"}`}
                  title="Grid view"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-accent text-background" : "text-accent-2 hover:text-primary"}`}
                  title="List view"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
              </div>
              
              <div className="relative">
                <select
                  value={activeSort}
                  onChange={(e) => setActiveSort(e.target.value)}
                  className="appearance-none bg-surface border border-accent-2/20 px-4 py-2 pr-10 font-body text-sm text-primary focus:outline-none focus:border-accent cursor-pointer rounded-lg"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-card">
                      {option.label}
                    </option>
                  ))}
                </select>
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-accent-2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileFilters
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        activePriceRange={activePriceRange}
        onPriceRangeChange={setActivePriceRange}
        activeBadges={activeBadges}
        onBadgesChange={setActiveBadges}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex gap-8 px-4 py-8">
          <Sidebar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            activePriceRange={activePriceRange}
            onPriceRangeChange={setActivePriceRange}
            activeBadges={activeBadges}
            onBadgesChange={setActiveBadges}
          />

          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center min-h-[40vh]">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                  <p className="font-body text-accent-2">Loading products...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24"
              >
                <div className="w-24 h-24 rounded-full bg-card flex items-center justify-center mx-auto mb-6">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <h2 className="font-display text-4xl text-primary mb-3">No Products Found</h2>
                <p className="font-body text-accent-2 mb-6 max-w-md mx-auto">We couldn't find any products matching your criteria. Try adjusting your filters.</p>
                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setActivePriceRange("all");
                    setActiveBadges([]);
                  }}
                  className="px-6 py-3 bg-accent text-background hover:bg-accent/90 transition-colors font-body text-sm uppercase tracking-wider"
                >
                  Clear All Filters
                </button>
              </motion.div>
            ) : viewMode === "grid" ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                {products.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {products.map((product, index) => (
                  <ListProductCard key={product._id} product={product} index={index} />
                ))}
              </motion.div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-lg border border-accent-2/30 flex items-center justify-center text-primary hover:bg-accent hover:text-background hover:border-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-body text-sm transition-colors ${
                      currentPage === page
                        ? "bg-accent text-background"
                        : "border border-accent-2/30 text-primary hover:bg-accent hover:text-background hover:border-accent"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-lg border border-accent-2/30 flex items-center justify-center text-primary hover:bg-accent hover:text-background hover:border-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useStore";
import { addToCart, openCartDrawer } from "../../store/slices/cartSlice";
import { addToWishlist, removeFromWishlist } from "../../store/slices/wishlistSlice";
import { openQuickView } from "../../store/slices/uiSlice";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images?: string[];
  badge?: "new" | "limited" | "sold-out";
  sizes?: { size: string; stock: number }[];
  colors?: { name: string; hex: string }[];
  description?: string;
}

function StockIndicator({ stock }: { stock: number }) {
  if (stock === 0) return <span className="text-xs text-danger">Sold Out</span>;
  if (stock <= 3) return <span className="text-xs text-danger">Only {stock} left!</span>;
  return <span className="text-xs text-accent">In Stock</span>;
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const { token } = useAppSelector((state) => state.auth);
  
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [showSecondImage, setShowSecondImage] = useState(false);

  const isWishlisted = wishlistItems.some((item) => item.id === product.id);
  const hasMultipleImages = product.images && product.images.length > 1;
  const hasMultipleColors = product.colors && product.colors.length > 1;
  const hasSizes = product.sizes && product.sizes.length > 0;
  
  const selectedSizeData = selectedSize !== null ? product.sizes?.[selectedSize] : null;
  const isSizeAvailable = selectedSizeData ? selectedSizeData.stock > 0 : true;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSizeAvailable && hasSizes) return;

    const size = product.sizes?.[selectedSize ?? 0]?.size || "M";
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
        size,
        color: product.colors?.[selectedColor]?.name,
      })
    );
    dispatch(openCartDrawer());
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      dispatch(removeFromWishlist({ id: product.id }));
      if (token) {
        try {
          await fetch(`/api/auth?action=wishlist&productId=${product.id}&token=${token}`, { method: "PUT" });
        } catch (err) {
          console.error("Failed to remove from wishlist:", err);
        }
      }
    } else {
      dispatch(
        addToWishlist({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.image,
          size: product.sizes?.[0]?.size,
        })
      );
      if (token) {
        try {
          await fetch(`/api/auth?action=wishlist&productId=${product.id}&token=${token}`, { method: "PUT" });
        } catch (err) {
          console.error("Failed to add to wishlist:", err);
        }
      }
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(openQuickView(product));
  };

  const discount = product.compareAtPrice && product.compareAtPrice > 0
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/shop/${product.slug}`} className="group block">
        <div 
          className="relative aspect-[3/4] bg-card overflow-hidden rounded-2xl"
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
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={index < 2}
              />
            </motion.div>
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent"
          />

          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
            <div className="flex flex-col gap-2">
              {product.badge && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`font-body text-[10px] uppercase tracking-wider px-3 py-1.5 font-bold ${
                    product.badge === "new" ? "bg-accent text-background" :
                    product.badge === "limited" ? "bg-primary text-background" :
                    "bg-danger text-primary"
                  }`}
                >
                  {product.badge}
                </motion.span>
              )}
              {discount > 0 && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.25 + index * 0.1 }}
                  className="font-body text-[10px] uppercase tracking-wider px-3 py-1.5 bg-danger text-primary font-bold w-fit"
                >
                  -{discount}% OFF
                </motion.span>
              )}
            </div>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
              onClick={handleWishlist}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-colors ${
                isWishlisted ? "text-danger" : "text-primary hover:text-danger"
              }`}
            >
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill={isWishlisted ? "currentColor" : "none"} 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </motion.button>
          </div>

          {hasMultipleColors && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              className="absolute top-20 left-4"
            >
              <div className="flex gap-1.5">
                {product.colors!.map((color, i) => (
                  <button
                    key={color.name}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColor(i);
                    }}
                    className={`w-5 h-5 rounded-full transition-all ${
                      selectedColor === i ? "ring-2 ring-offset-2 ring-offset-card ring-accent" : ""
                    }`}
                    style={{ backgroundColor: color.hex, border: color.hex === '#FFFFFF' ? '1px solid #333' : 'none' }}
                    title={color.name}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {isHovered && hasSizes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-24 left-3 right-3"
              >
                <div className="bg-background/95 backdrop-blur-md rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-body text-[10px] uppercase tracking-wider text-accent-2">Select Size</span>
                    {selectedSizeData && <StockIndicator stock={selectedSizeData.stock} />}
                  </div>
                  <div className="flex gap-1">
                    {product.sizes!.map((sizeData, i) => (
                      <button
                        key={sizeData.size}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedSize(i);
                        }}
                        disabled={sizeData.stock === 0}
                        className={`flex-1 h-9 text-xs font-medium transition-all relative ${
                          selectedSize === i
                            ? "bg-accent text-background"
                            : sizeData.stock === 0
                            ? "bg-card text-accent-2/30 cursor-not-allowed line-through"
                            : "bg-card text-primary hover:bg-accent hover:text-background"
                        }`}
                      >
                        {sizeData.size}
                        {sizeData.stock > 0 && sizeData.stock <= 3 && selectedSize !== i && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            className="absolute bottom-4 left-4 right-4"
          >
            <button
              onClick={handleAddToCart}
              disabled={!isSizeAvailable && hasSizes}
              className={`w-full font-body text-xs uppercase tracking-wider py-3.5 transition-colors flex items-center justify-center gap-2 rounded-xl ${
                isSizeAvailable || !hasSizes
                  ? "bg-accent text-background hover:bg-accent/90"
                  : "bg-card text-accent-2 cursor-not-allowed"
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

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 translate-x-4 flex flex-col gap-2"
          >
            <button 
              onClick={handleQuickView}
              className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-primary hover:bg-accent hover:text-background transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
            <button className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-primary hover:bg-accent hover:text-background transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </motion.div>
        </div>

        <div className="mt-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-body text-base font-semibold text-primary group-hover:text-accent transition-colors">
                {product.name}
              </h3>
              <p className="font-body text-xs text-accent-2 mt-1 line-clamp-1">
                {product.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="font-body text-base font-bold text-primary">
              ₦{product.price?.toLocaleString() || product.price}
            </span>
            {product.compareAtPrice && product.compareAtPrice > 0 && (
              <span className="font-body text-sm text-accent-2 line-through">
                ₦{product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            {hasMultipleColors && (
              <div className="flex gap-1">
                {product.colors!.map((color, i) => (
                  <span
                    key={color.name}
                    className={`w-4 h-4 rounded-full border ${
                      i === selectedColor ? "ring-1 ring-accent" : "ring-transparent"
                    }`}
                    style={{ backgroundColor: color.hex, borderColor: color.hex === '#FFFFFF' ? '#333' : color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            )}
            <span className="font-body text-[10px] text-accent-2">
              {hasSizes ? product.sizes!.map(s => s.size).join(" / ") : "One Size"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function FeaturedProducts() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/products?action=featured");
        const data = await res.json();
        if (data.success) {
          setFeaturedProducts(data.products.slice(0, 6));
        }
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeatured();
  }, []);

  return (
    <section ref={ref} className="py-20 md:py-32 px-4 bg-background relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
        >
          <div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-3"
            >
              <motion.span 
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-accent"
              />
              <span className="font-body text-xs uppercase tracking-[0.2em] text-accent">Exclusive Drops</span>
            </motion.div>
            <h2 className="font-display text-6xl md:text-8xl lg:text-9xl text-primary leading-none">
              INFINITY
            </h2>
            <p className="font-body text-accent-2 mt-3 text-lg">Limited Drops. No Restocks.</p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <Link 
              href="/shop"
              className="group inline-flex items-center gap-3 font-body text-sm uppercase tracking-wider text-accent-2 hover:text-primary transition-colors"
            >
              View All Drops
              <motion.span
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <Link 
            href="/shop"
            className="group inline-flex items-center gap-4 font-body text-sm uppercase tracking-wider px-10 py-5 border-2 border-accent/30 text-primary hover:bg-accent hover:border-accent hover:text-background transition-all rounded-full"
          >
            <span>Explore Full Collection</span>
            <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

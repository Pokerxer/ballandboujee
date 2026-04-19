"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../hooks/useStore";
import { addToCart, openCartDrawer } from "../../store/slices/cartSlice";
import { addToWishlist, removeFromWishlist } from "../../store/slices/wishlistSlice";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  description?: string;
  image: string;
  images?: string[];
  badge?: "new" | "limited" | "sold-out";
  sizes?: { size: string; stock: number }[];
  colors?: { name: string; hex: string }[];
  category: string;
}

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

type Props = {
  params: Promise<{ slug: string }>;
};

export default function ProductDetailPage({ params }: Props) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const { token } = useAppSelector((state) => state.auth);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(false);
      
      try {
        const res = await fetch(`/api/products?action=bySlug&slug=${slug}`);
        const data = await res.json();
        
        if (data.success) {
          const normalized = normalizeProduct(data.product);
          setProduct(normalized);

          const relatedRes = await fetch(`/api/products?category=${encodeURIComponent(data.product.category)}&limit=5`);
          const relatedData = await relatedRes.json();
          if (relatedData.success) {
            setRelatedProducts(
              relatedData.products
                .filter((p: any) => p._id?.toString() !== data.product._id?.toString())
                .slice(0, 4)
                .map(normalizeProduct)
            );
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
      
      setSelectedImageIndex(0);
      setSelectedSize(null);
      setQuantity(1);
      setIsAdded(false);
      window.scrollTo(0, 0);
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-32 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="font-body text-accent-2">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-background pt-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-display text-4xl text-primary mb-4">Product Not Found</h1>
          <Link href="/shop" className="inline-block px-6 py-3 bg-accent text-background hover:bg-accent/90 transition-colors font-body text-sm uppercase tracking-wider">
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const isWishlisted = wishlistItems.some((item) => item.id === product._id);
  const hasMultipleImages = product.images && product.images.length > 1;
  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasColors = product.colors && product.colors.length > 0;
  const selectedSizeData = selectedSize !== null ? product.sizes?.[selectedSize] : null;
  const isSizeAvailable = selectedSizeData ? selectedSizeData.stock > 0 : true;
  
  const discount = product.compareAtPrice && product.compareAtPrice > 0
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (hasSizes && !isSizeAvailable) return;

    const size = product.sizes?.[selectedSize ?? 0]?.size || "One Size";
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      size,
      quantity,
      color: product.colors?.[selectedColor]?.name,
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
        } catch (e) {
          console.error("Failed to remove from wishlist:", e);
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
        } catch (e) {
          console.error("Failed to add to wishlist:", e);
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const totalImages = (product.images && product.images.length > 0 ? product.images : [product.image]).filter(Boolean);

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm mb-8"
        >
          <Link href="/" className="text-accent-2 hover:text-accent transition-colors">Home</Link>
          <span className="text-accent-2">/</span>
          <Link href="/shop" className="text-accent-2 hover:text-accent transition-colors">Shop</Link>
          <span className="text-accent-2">/</span>
          <span className="text-primary">{product.name}</span>
        </motion.nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-[3/4] bg-surface rounded-2xl overflow-hidden mb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 cursor-zoom-in"
                  onClick={() => setIsZoomed(!isZoomed)}
                  onMouseMove={handleMouseMove}
                  style={isZoomed ? {
                    backgroundImage: `url(${totalImages[selectedImageIndex]})`,
                    backgroundSize: '200%',
                    backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                  } : {}}
                >
                  <Image
                    src={totalImages[selectedImageIndex]}
                    alt={product.name}
                    fill
                    className={`object-cover transition-transform duration-500 ${isZoomed ? 'scale-150' : ''}`}
                    style={isZoomed ? { objectFit: 'fill' } : {}}
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {product.badge && (
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className={`font-body text-xs uppercase tracking-wider px-3 py-1.5 font-bold ${
                    product.badge === "new" ? "bg-accent text-background" :
                    product.badge === "limited" ? "bg-primary text-background" :
                    "bg-danger text-primary"
                  }`}>
                    {product.badge}
                  </span>
                  {discount > 0 && (
                    <span className="font-body text-xs uppercase tracking-wider px-3 py-1.5 bg-danger text-primary font-bold w-fit">
                      -{discount}%
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={handleWishlist}
                className={`absolute top-4 right-4 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center transition-colors shadow-lg ${
                  isWishlisted ? "text-danger" : "text-primary hover:text-danger"
                }`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              {isZoomed && (
                <button
                  onClick={() => setIsZoomed(false)}
                  className="absolute bottom-4 right-4 px-4 py-2 bg-background/90 backdrop-blur-sm rounded-lg text-sm text-primary"
                >
                  Click to zoom out
                </button>
              )}
            </div>

            {hasMultipleImages && (
              <div className="flex gap-3">
                {totalImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-24 rounded-xl overflow-hidden transition-all ${
                      selectedImageIndex === index
                        ? "ring-2 ring-accent ring-offset-2"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:sticky lg:top-32 lg:self-start"
          >
            <div className="space-y-6">
              <div>
                <p className="font-body text-sm text-accent uppercase tracking-wider mb-2">
                  {product.category}
                </p>
                <h1 className="font-display text-4xl md:text-5xl text-primary">
                  {product.name}
                </h1>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="font-body text-3xl font-bold text-primary">
                  ₦{product.price.toLocaleString()}
                </span>
                {product.compareAtPrice && product.compareAtPrice > 0 && (
                  <>
                    <span className="font-body text-xl text-accent-2 line-through">
                      ₦{product.compareAtPrice.toLocaleString()}
                    </span>
                    <span className="font-body text-sm text-danger font-medium">
                      Save ₦{(product.compareAtPrice - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              <p className="font-body text-accent-2 leading-relaxed">
                {product.description}
              </p>

              {hasColors && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-body text-sm text-primary">Color</span>
                    <span className="font-body text-sm text-accent-2">
                      {product.colors?.[selectedColor]?.name}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {product.colors!.map((color, index) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(index)}
                        className={`w-10 h-10 rounded-full transition-all ${
                          selectedColor === index
                            ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                            : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: color.hex || '#000' }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {hasSizes && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-body text-sm text-primary">Size</span>
                    <button 
                      onClick={() => setShowSizeGuide(true)}
                      className="font-body text-sm text-accent underline underline-offset-2"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes!.map((sizeData, index) => (
                      <button
                        key={sizeData.size}
                        onClick={() => setSelectedSize(index)}
                        disabled={sizeData.stock === 0}
                        className={`min-w-[48px] h-12 px-4 font-body text-sm font-medium transition-all rounded-lg ${
                          selectedSize === index
                            ? "bg-accent text-background"
                            : sizeData.stock === 0
                            ? "bg-surface text-accent-2/30 cursor-not-allowed line-through"
                            : "bg-surface text-primary hover:bg-accent hover:text-background border border-accent-2/10"
                        }`}
                      >
                        {sizeData.size}
                      </button>
                    ))}
                  </div>
                  {selectedSize !== null && !isSizeAvailable && (
                    <p className="mt-2 text-sm text-danger">This size is currently out of stock</p>
                  )}
                </div>
              )}

              <div>
                <span className="font-body text-sm text-primary block mb-3">Quantity</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-accent-2/20 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center text-primary hover:text-accent hover:bg-surface transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                    <span className="w-16 text-center font-body text-lg text-primary">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="w-12 h-12 flex items-center justify-center text-primary hover:text-accent hover:bg-surface transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>
                  <span className="font-body text-sm text-accent-2">
                    {selectedSizeData ? `${selectedSizeData.stock} in stock` : 'In stock'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={hasSizes && !isSizeAvailable}
                  className={`flex-1 h-14 font-body text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-xl ${
                    isSizeAvailable || !hasSizes
                      ? "bg-accent text-background hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25"
                      : "bg-surface text-accent-2 cursor-not-allowed"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      {hasSizes && selectedSizeData?.stock === 0 ? "Sold Out" : "Add to Cart"}
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-accent-2/10">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center mx-auto mb-2 text-accent">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  </div>
                  <p className="font-body text-xs text-accent-2">Free Shipping</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center mx-auto mb-2 text-accent">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <p className="font-body text-xs text-accent-2">Easy Returns</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center mx-auto mb-2 text-accent">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <p className="font-body text-xs text-accent-2">Secure Payment</p>
                </div>
              </div>
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {showSizeGuide && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSizeGuide(false)}
                  className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl p-6 md:p-8 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl text-primary">Size Guide</h2>
                    <button
                      onClick={() => setShowSizeGuide(false)}
                      className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-accent-2 hover:text-primary transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-surface rounded-xl p-4">
                      <h3 className="font-body text-sm font-medium text-primary mb-3">How to Measure</h3>
                      <ul className="font-body text-sm text-accent-2 space-y-2">
                        <li>• <strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</li>
                        <li>• <strong>Waist:</strong> Measure around your natural waistline, keeping the tape loose.</li>
                        <li>• <strong>Hip:</strong> Measure around the fullest part of your hips, about 20cm below your waist.</li>
                        <li>• <strong>Length:</strong> Measure from shoulder to the desired length.</li>
                      </ul>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-accent-2/10">
                            <th className="text-left py-3 px-4 font-body text-primary">Size</th>
                            <th className="text-left py-3 px-4 font-body text-primary">Chest (inches)</th>
                            <th className="text-left py-3 px-4 font-body text-primary">Waist (inches)</th>
                            <th className="text-left py-3 px-4 font-body text-primary">Hip (inches)</th>
                          </tr>
                        </thead>
                        <tbody className="font-body text-accent-2">
                          <tr className="border-b border-accent-2/5">
                            <td className="py-3 px-4 font-medium text-primary">S</td>
                            <td className="py-3 px-4">34-36</td>
                            <td className="py-3 px-4">28-30</td>
                            <td className="py-3 px-4">34-36</td>
                          </tr>
                          <tr className="border-b border-accent-2/5">
                            <td className="py-3 px-4 font-medium text-primary">M</td>
                            <td className="py-3 px-4">38-40</td>
                            <td className="py-3 px-4">32-34</td>
                            <td className="py-3 px-4">38-40</td>
                          </tr>
                          <tr className="border-b border-accent-2/5">
                            <td className="py-3 px-4 font-medium text-primary">L</td>
                            <td className="py-3 px-4">42-44</td>
                            <td className="py-3 px-4">36-38</td>
                            <td className="py-3 px-4">42-44</td>
                          </tr>
                          <tr className="border-b border-accent-2/5">
                            <td className="py-3 px-4 font-medium text-primary">XL</td>
                            <td className="py-3 px-4">46-48</td>
                            <td className="py-3 px-4">40-42</td>
                            <td className="py-3 px-4">46-48</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 font-medium text-primary">2XL</td>
                            <td className="py-3 px-4">50-52</td>
                            <td className="py-3 px-4">44-46</td>
                            <td className="py-3 px-4">50-52</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-accent/10 rounded-xl p-4">
                      <h3 className="font-body text-sm font-medium text-primary mb-2">Fit Tips</h3>
                      <ul className="font-body text-sm text-accent-2 space-y-1">
                        <li>• If you're between sizes, we recommend sizing up for a looser fit.</li>
                        <li>• For a fitted look, size down.</li>
                        <li>• Model measurements are shown for reference.</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-24"
          >
            <h2 className="font-display text-3xl text-primary mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Link href={`/shop/${item.slug}`} className="group block">
                    <div className="relative aspect-[3/4] bg-surface rounded-2xl overflow-hidden mb-4">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {item.badge && (
                        <span className={`absolute top-3 left-3 font-body text-[10px] uppercase tracking-wider px-2 py-1 font-bold ${
                          item.badge === "new" ? "bg-accent text-background" :
                          item.badge === "limited" ? "bg-primary text-background" :
                          "bg-danger text-primary"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-body text-base text-primary group-hover:text-accent transition-colors">
                      {item.name}
                    </h3>
                    <p className="font-body text-sm font-bold text-primary mt-1">
                      ₦{item.price.toLocaleString()}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
}

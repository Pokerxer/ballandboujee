"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useStore";
import { closeQuickView } from "../../store/slices/uiSlice";
import { addToCart, openCartDrawer } from "../../store/slices/cartSlice";
import { addToWishlist, removeFromWishlist } from "../../store/slices/wishlistSlice";

export default function QuickViewModal() {
  const dispatch = useAppDispatch();
  const { isQuickViewOpen, quickViewProduct } = useAppSelector((state) => state.ui);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const { token } = useAppSelector((state) => state.auth);

  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isWishlisted = wishlistItems.some((item) => item.id === quickViewProduct?.id);

  const handleClose = () => {
    dispatch(closeQuickView());
    setSelectedSize(null);
    setSelectedColor(0);
    setQuantity(1);
    setIsAdded(false);
    setCurrentImageIndex(0);
  };

  const handleAddToCart = () => {
    if (!quickViewProduct) return;

    const size = quickViewProduct.sizes?.[selectedSize ?? 0]?.size || "M";
    dispatch(
      addToCart({
        id: quickViewProduct.id,
        name: quickViewProduct.name,
        slug: quickViewProduct.slug,
        price: quickViewProduct.price,
        image: quickViewProduct.image,
        size,
        color: quickViewProduct.colors?.[selectedColor]?.name,
        quantity,
      })
    );
    dispatch(openCartDrawer());
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWishlistToggle = async () => {
    if (!quickViewProduct) return;

    if (isWishlisted) {
      dispatch(removeFromWishlist({ id: quickViewProduct.id }));
      if (token) {
        try {
          await fetch(`/api/auth?action=wishlist&productId=${quickViewProduct.id}&token=${token}`, { method: "PUT" });
        } catch (err) {
          console.error("Failed to remove from wishlist:", err);
        }
      }
    } else {
      dispatch(
        addToWishlist({
          id: quickViewProduct.id,
          name: quickViewProduct.name,
          slug: quickViewProduct.slug,
          price: quickViewProduct.price,
          image: quickViewProduct.image,
          size: quickViewProduct.sizes?.[0]?.size,
        })
      );
      if (token) {
        try {
          await fetch(`/api/auth?action=wishlist&productId=${quickViewProduct.id}&token=${token}`, { method: "PUT" });
        } catch (err) {
          console.error("Failed to add to wishlist:", err);
        }
      }
    }
  };

  if (!quickViewProduct) return null;

  const discount = quickViewProduct.compareAtPrice && quickViewProduct.compareAtPrice > 0
    ? Math.round(
        ((quickViewProduct.compareAtPrice - quickViewProduct.price) /
          quickViewProduct.compareAtPrice) *
          100
      )
    : 0;

  return (
    <AnimatePresence>
      {isQuickViewOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-background/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-card w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center text-primary hover:bg-accent hover:text-background transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="grid md:grid-cols-2 h-full max-h-[90vh] overflow-auto">
              <div className="relative aspect-square md:aspect-auto bg-surface">
                <Image
                  src={
                    quickViewProduct.images?.[currentImageIndex] ||
                    quickViewProduct.image
                  }
                  alt={quickViewProduct.name}
                  fill
                  className="object-cover"
                />

                {quickViewProduct.images && quickViewProduct.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {quickViewProduct.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentImageIndex === index
                            ? "bg-accent w-6"
                            : "bg-primary/50"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {quickViewProduct.badge && (
                  <span
                    className={`absolute top-4 left-4 font-body text-xs uppercase tracking-wider px-3 py-1.5 ${
                      quickViewProduct.badge === "new"
                        ? "bg-accent text-background"
                        : quickViewProduct.badge === "limited"
                        ? "bg-primary text-background"
                        : "bg-danger text-primary"
                    }`}
                  >
                    {quickViewProduct.badge}
                  </span>
                )}
              </div>

              <div className="p-6 md:p-8 flex flex-col">
                <div className="flex-1">
                  <Link
                    href={`/shop/${quickViewProduct.slug}`}
                    onClick={handleClose}
                    className="group"
                  >
                    <h2 className="font-display text-3xl md:text-4xl text-primary group-hover:text-accent transition-colors">
                      {quickViewProduct.name}
                    </h2>
                  </Link>

                  <div className="flex items-center gap-3 mt-3">
                    <span className="font-body text-2xl font-bold text-primary">
                      ₦{quickViewProduct.price?.toLocaleString() || quickViewProduct.price}
                    </span>
                    {quickViewProduct.compareAtPrice && quickViewProduct.compareAtPrice > 0 && (
                      <span className="font-body text-lg text-accent-2 line-through">
                        ₦{quickViewProduct.compareAtPrice.toLocaleString()}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="font-body text-sm text-danger">
                        -{discount}% OFF
                      </span>
                    )}
                  </div>

                  <p className="font-body text-sm text-accent-2 mt-4 leading-relaxed">
                    {quickViewProduct.description ||
                      "Premium quality apparel from the Infinity collection. Designed for those who demand style and substance."}
                  </p>

                  {quickViewProduct.colors && quickViewProduct.colors.length > 1 && (
                    <div className="mt-6">
                      <span className="font-body text-xs uppercase tracking-wider text-accent-2">
                        Color: {quickViewProduct.colors[selectedColor]?.name}
                      </span>
                      <div className="flex gap-2 mt-2">
                        {quickViewProduct.colors.map((color, index) => (
                          <button
                            key={color.name}
                            onClick={() => setSelectedColor(index)}
                            className={`w-8 h-8 rounded-full transition-all ${
                              selectedColor === index
                                ? "ring-2 ring-offset-2 ring-offset-card ring-accent"
                                : ""
                            }`}
                            style={{
                              backgroundColor: color.hex,
                              border:
                                color.hex === "#FFFFFF" ? "1px solid #333" : "none",
                            }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
                    <div className="mt-6">
                      <div className="flex justify-between items-center">
                        <span className="font-body text-xs uppercase tracking-wider text-accent-2">
                          Select Size
                        </span>
                        <button className="font-body text-xs text-accent hover:text-primary transition-colors">
                          Size Guide
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {quickViewProduct.sizes.map((sizeData, index) => (
                          <button
                            key={sizeData.size}
                            onClick={() => setSelectedSize(index)}
                            disabled={sizeData.stock === 0}
                            className={`min-w-[48px] h-12 px-3 text-sm font-medium transition-all ${
                              selectedSize === index
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

                  <div className="mt-6">
                    <span className="font-body text-xs uppercase tracking-wider text-accent-2">
                      Quantity
                    </span>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 bg-surface flex items-center justify-center text-primary hover:bg-accent hover:text-background transition-colors"
                      >
                        -
                      </button>
                      <span className="font-body text-lg w-12 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 bg-surface flex items-center justify-center text-primary hover:bg-accent hover:text-background transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 font-body text-sm uppercase tracking-wider py-4 bg-accent text-background hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 rounded-xl"
                  >
                    {isAdded ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className={`w-14 h-14 flex items-center justify-center border transition-colors ${
                      isWishlisted
                        ? "border-danger bg-danger/10 text-danger"
                        : "border-accent-2/30 text-primary hover:border-accent hover:text-accent"
                    }`}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={isWishlisted ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>

                <Link
                  href={`/shop/${quickViewProduct.slug}`}
                  onClick={handleClose}
                  className="block text-center mt-4 font-body text-sm text-accent-2 hover:text-primary transition-colors"
                >
                  View Full Details →
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

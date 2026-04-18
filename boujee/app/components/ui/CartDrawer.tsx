"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../../hooks/useStore";
import { closeCartDrawer, removeFromCart, updateQuantity, clearCart } from "../../store/slices/cartSlice";

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const { items, isDrawerOpen } = useAppSelector((state) => state.cart);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleClose = () => dispatch(closeCartDrawer());

  const handleRemove = (id: string, size: string, color?: string) => {
    dispatch(removeFromCart({ id, size, color }));
  };

  const handleQuantityChange = (
    id: string,
    size: string,
    color: string | undefined,
    quantity: number
  ) => {
    dispatch(updateQuantity({ id, size, color, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-card shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-accent-2/10">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl text-primary">Your Cart</h2>
                <span className="font-body text-sm text-accent-2">
                  ({totalItems} {totalItems === 1 ? "item" : "items"})
                </span>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary hover:bg-accent hover:text-background transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                  <h3 className="font-body text-lg text-primary mb-2">Your cart is empty</h3>
                  <p className="font-body text-sm text-accent-2 mb-6">
                    Looks like you haven&apos;t added anything yet.
                  </p>
                  <Link
                    href="/shop"
                    onClick={handleClose}
                    className="font-body text-sm uppercase tracking-wider px-6 py-3 bg-accent text-background hover:bg-accent/90 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.size}-${item.color}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex gap-4 p-4 bg-surface rounded-xl"
                    >
                      <div className="relative w-20 h-24 flex-shrink-0 bg-card rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/shop/${item.slug}`}
                          onClick={handleClose}
                          className="font-body text-sm font-medium text-primary hover:text-accent transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-body text-xs text-accent-2">
                            Size: {item.size}
                          </span>
                          {item.color && (
                            <>
                              <span className="text-accent-2">•</span>
                              <span className="font-body text-xs text-accent-2">
                                {item.color}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-accent-2/20 rounded-lg">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.id,
                                  item.size,
                                  item.color,
                                  item.quantity - 1
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center text-accent-2 hover:text-primary transition-colors rounded-l-lg"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                            </button>
                            <span className="w-8 text-center font-body text-sm">{item.quantity}</span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.id,
                                  item.size,
                                  item.color,
                                  item.quantity + 1
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center text-accent-2 hover:text-primary transition-colors rounded-r-lg"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                            </button>
                          </div>

                          <span className="font-body text-sm font-bold text-primary">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id, item.size, item.color)}
                        className="self-start p-1 text-accent-2 hover:text-danger transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-accent-2/10 bg-surface">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm text-accent-2">Subtotal</span>
                    <span className="font-body text-sm text-primary">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm text-accent-2">Shipping</span>
                    <span className="font-body text-sm text-primary">
                      {shipping === 0 ? <span className="text-accent">FREE</span> : `₦${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="font-body text-xs text-accent-2">
                      Free shipping on orders over ₦100,000
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-accent-2/10">
                    <span className="font-body text-base text-primary">Total</span>
                    <span className="font-body text-xl font-bold text-primary">₦{total.toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={handleClose}
                  className="w-full font-body text-sm uppercase tracking-wider py-4 bg-accent text-background hover:bg-accent/90 transition-colors rounded-xl mb-3 block text-center"
                >
                  Checkout
                </Link>

                <div className="flex items-center justify-between">
                  <button
                    onClick={handleClose}
                    className="font-body text-sm text-accent-2 hover:text-primary transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="font-body text-sm text-accent-2 hover:text-danger transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../hooks/useStore";
import { createOrder, clearCart } from "../store/slices/cartSlice";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paystack" | "bank">("paystack");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
      }));
    }
  }, [isAuthenticated, user]);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingCost = subtotal > 100000 ? 0 : 9999;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shippingCost + tax;

  const initializePayment = async () => {
    setIsProcessing(true);
    
    try {
      const orderData = {
        orderItems: items.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          price: item.price,
          image: item.image,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
        shipping: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        paymentMethod,
        subtotal,
        shippingCost,
        tax,
        total,
        userId: isAuthenticated ? user?.id : undefined,
      };

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        throw new Error(orderResult.error || "Failed to create order");
      }

      // Store order ID for success page
      sessionStorage.setItem("lastOrderId", orderResult.order._id);
      setOrderId(orderResult.order._id);

      if (paymentMethod === "paystack") {
        const paystackResponse = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "paystackInitialize",
            token,
            amount: total,
            email: formData.email,
            orderId: orderResult.order._id,
            callbackUrl: `${window.location.origin}/checkout/callback`,
          }),
        });

        const paystackResult = await paystackResponse.json();

        if (paystackResult.success) {
          window.location.href = paystackResult.authorizationUrl;
        } else {
          throw new Error(paystackResult.error || "Failed to initialize payment");
        }
      } else if (paymentMethod === "stripe") {
        const stripeResponse = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "stripeCreateIntent",
            token,
            amount: total,
            email: formData.email,
            orderId: orderResult.order._id,
          }),
        });

        const stripeResult = await stripeResponse.json();

        if (stripeResult.success) {
          setOrderSuccess(true);
          dispatch(clearCart());
          router.push(`/checkout/success?order=${orderResult.order._id}&payment=intent`);
        } else {
          throw new Error(stripeResult.error || "Failed to initialize payment");
        }
      } else if (paymentMethod === "bank") {
        setOrderSuccess(true);
        dispatch(clearCart());
        router.push(`/checkout/success?order=${orderResult.order._id}&payment=bank`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(error instanceof Error ? error.message : "Payment failed");
    }
    
    setIsProcessing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await initializePayment();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (items.length === 0 && !orderSuccess) {
    return (
      <main className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-primary mb-4">Your cart is empty</h1>
          <Link href="/shop" className="text-accent hover:underline">Continue Shopping</Link>
        </div>
      </main>
    );
  }

  if (orderSuccess) {
    return (
      <main className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="font-display text-4xl text-primary mb-4">Order Placed!</h1>
          <p className="font-body text-accent-2 mb-8">Thank you for your order. You will receive a confirmation email shortly.</p>
          <Link href="/shop" className="inline-block px-6 py-3 bg-accent text-background rounded-xl hover:bg-accent/90 transition-colors">
            Continue Shopping
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-16">
      <section className="relative py-12 md:py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-5xl md:text-7xl text-primary"
            >
              CHECKOUT
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-body text-accent-2 mt-3"
            >
              Complete your order
            </motion.p>
          </motion.div>
        </div>
      </section>

      {items.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h2 className="font-display text-3xl text-primary mb-3">Your cart is empty</h2>
            <p className="font-body text-accent-2 mb-6">Add some items to your cart to checkout.</p>
            <Link
              href="/shop"
              className="inline-block font-body text-sm uppercase tracking-wider px-6 py-3 bg-accent text-background hover:bg-accent/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 pb-24">
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                <div className="bg-surface/50 rounded-2xl p-6 md:p-8">
                  <h2 className="font-display text-xl text-primary mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-accent text-background text-sm font-bold flex items-center justify-center">1</span>
                    Shipping Information
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-body text-sm text-accent-2 mb-2">First Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-card border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent transition-colors"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block font-body text-sm text-accent-2 mb-2">Last Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-card border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block font-body text-sm text-accent-2 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-card border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block font-body text-sm text-accent-2 mb-2">Phone</label>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-3 bg-card border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block font-body text-sm text-accent-2 mb-2">Address</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-card border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent transition-colors"
                      placeholder="123 Basketball Ave"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block font-body text-sm text-accent-2 mb-2">City</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-card border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent transition-colors"
                        placeholder="Los Angeles"
                      />
                    </div>
                    <div>
                      <label className="block font-body text-sm text-accent-2 mb-2">State</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-card border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent transition-colors"
                        placeholder="CA"
                      />
                    </div>
                    <div>
                      <label className="block font-body text-sm text-accent-2 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-card border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent transition-colors"
                        placeholder="90001"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-surface/50 rounded-2xl p-6 md:p-8">
                  <h2 className="font-display text-xl text-primary mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-accent text-background text-sm font-bold flex items-center justify-center">2</span>
                    Payment Method
                  </h2>

                  <div className="space-y-3 mb-6">
                    <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === "paystack" 
                        ? "border-accent bg-accent/5" 
                        : "border-accent-2/20 hover:border-accent/50"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="paystack"
                        checked={paymentMethod === "paystack"}
                        onChange={(e) => setPaymentMethod(e.target.value as "paystack")}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "paystack" ? "border-accent" : "border-accent-2/30"
                      }`}>
                        {paymentMethod === "paystack" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-body text-sm text-primary">Pay with Paystack</span>
                        <p className="font-body text-xs text-accent-2">Card, Bank Transfer, USSD</p>
                      </div>
                      <svg width="40" height="16" viewBox="0 0 40 16" fill="none" className="text-accent">
                        <path d="M8 2L16 14H24L8 2Z" fill="currentColor"/>
                        <rect x="26" y="4" width="12" height="8" rx="2" fill="currentColor"/>
                      </svg>
                    </label>

                    <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === "stripe" 
                        ? "border-accent bg-accent/5" 
                        : "border-accent-2/20 hover:border-accent/50"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="stripe"
                        checked={paymentMethod === "stripe"}
                        onChange={(e) => setPaymentMethod(e.target.value as "stripe")}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "stripe" ? "border-accent" : "border-accent-2/30"
                      }`}>
                        {paymentMethod === "stripe" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-body text-sm text-primary">Pay with Stripe</span>
                        <p className="font-body text-xs text-accent-2">Credit / Debit Card</p>
                      </div>
                      <div className="flex gap-1">
                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                          <rect width="24" height="16" rx="2" fill="#1A1F71"/>
                          <path d="M9 11L11 5H13L11 11H9Z" fill="white"/>
                        </svg>
                      </div>
                    </label>

                    <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === "bank" 
                        ? "border-accent bg-accent/5" 
                        : "border-accent-2/20 hover:border-accent/50"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="bank"
                        checked={paymentMethod === "bank"}
                        onChange={(e) => setPaymentMethod(e.target.value as "bank")}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "bank" ? "border-accent" : "border-accent-2/30"
                      }`}>
                        {paymentMethod === "bank" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-body text-sm text-primary">Bank Transfer</span>
                        <p className="font-body text-xs text-accent-2">Pay directly to our bank account</p>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <line x1="3" y1="9" x2="21" y2="9"/>
                      </svg>
                    </label>
                  </div>

                  {paymentMethod === "bank" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-surface rounded-xl p-4 mb-6"
                    >
                      <p className="font-body text-sm text-primary mb-2">Bank Details:</p>
                      <p className="font-body text-xs text-accent-2">Bank: First Bank of Nigeria</p>
                      <p className="font-body text-xs text-accent-2">Account Name: Ball & Boujee</p>
                      <p className="font-body text-xs text-accent-2">Account Number: 1234567890</p>
                      <p className="font-body text-xs text-danger mt-2">Please upload proof of payment to our WhatsApp or email.</p>
                    </motion.div>
                  )}

                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="sticky top-24 bg-surface/50 rounded-2xl p-6 md:p-8">
                  <h2 className="font-display text-xl text-primary mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6 max-h-[300px] overflow-auto">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4">
                        <div className="relative w-16 h-20 bg-card rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-background text-[10px] font-bold rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-body text-sm text-primary truncate">{item.name}</h3>
                          <p className="font-body text-xs text-accent-2 mt-1">
                            Size: {item.size} {item.color && `• ${item.color}`}
                          </p>
                        </div>
                        <span className="font-body text-sm font-medium text-primary">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 py-4 border-t border-accent-2/10">
                    <div className="flex items-center justify-between">
                      <span className="font-body text-sm text-accent-2">Subtotal</span>
                      <span className="font-body text-sm text-primary">₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-sm text-accent-2">Shipping</span>
                      <span className="font-body text-sm text-primary">
                        {shippingCost === 0 ? <span className="text-accent">FREE</span> : `₦${shippingCost.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-sm text-accent-2">Tax</span>
                      <span className="font-body text-sm text-primary">₦{tax.toLocaleString()}</span>
                    </div>
                    {shippingCost > 0 && (
                      <p className="font-body text-xs text-accent-2">
                        Free shipping on orders over ₦100,000
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-accent-2/10 mb-6">
                    <span className="font-body text-lg text-primary">Total</span>
                    <span className="font-display text-2xl text-primary">₦{total.toLocaleString()}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full font-body text-sm uppercase tracking-wider py-4 bg-accent text-background hover:bg-accent/90 transition-colors rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        Place Order
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 mt-6 text-accent-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span className="font-body text-xs">Secure checkout</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </form>

          {orderSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="font-display text-4xl text-primary mb-4">Order Confirmed!</h2>
              <p className="font-body text-accent-2 mb-8 max-w-md mx-auto">
                Thank you for your order. We'll send you a confirmation email with your order details and tracking information.
              </p>
              <Link
                href="/shop"
                className="inline-block px-8 py-4 bg-accent text-background hover:bg-accent/90 transition-colors font-body text-sm uppercase tracking-wider rounded-xl"
              >
                Continue Shopping
              </Link>
            </motion.div>
          )}
        </div>
      )}
    </main>
  );
}

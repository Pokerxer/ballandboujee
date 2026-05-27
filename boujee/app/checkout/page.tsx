"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../hooks/useStore";
import { clearCart } from "../store/slices/cartSlice";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348000000001";
const DEFAULT_BANK = { bankName: "First Bank of Nigeria", accountName: "Ball & Boujee", accountNumber: "1234567890" };

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [bankDetails, setBankDetails] = useState(DEFAULT_BANK);
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
    fetchBankDetails();
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
      }));
    }
  }, [isAuthenticated, user]);

  const fetchBankDetails = async () => {
    try {
      const res = await fetch("/api/bank-details");
      const data = await res.json();
      if (data.success) {
        setBankDetails(data.data);
      }
    } catch {
      console.error("Failed to fetch bank details");
    }
  };

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingCost = subtotal > 100000 ? 0 : 9999;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shippingCost + tax;

  const placeOrder = async () => {
    setIsProcessing(true);

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
      paymentMethod: "bank",
      subtotal,
      shippingCost,
      tax,
      total,
      userId: isAuthenticated ? user?.id : undefined,
    };

    const orderId = sessionStorage.getItem("lastOrderId");
    sessionStorage.setItem("lastOrder", JSON.stringify(orderData));

    if (orderId) {
      dispatch(clearCart());
      router.push(`/checkout/success?order=${orderId}&payment=manual`);
      return;
    }

    try {
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderResponse.json();

      if (orderResult.success) {
        sessionStorage.setItem("lastOrderId", orderResult.order._id);
        setOrderId(orderResult.order._id);
        dispatch(clearCart());
        router.push(`/checkout/success?order=${orderResult.order._id}&payment=manual`);
      } else {
        router.push(`/checkout/success?payment=manual`);
      }
    } catch (error) {
      console.error("Order error:", error);
      router.push(`/checkout/success?payment=manual`);
    }

    setIsProcessing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await placeOrder();
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
          <p className="font-body text-accent-2 mb-8">Thank you for your order. Complete your payment via bank transfer and send the receipt to us on WhatsApp.</p>
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
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-card border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent transition-colors"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block font-body text-sm text-accent-2 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
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
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-card border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block font-body text-sm text-accent-2 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-card border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block font-body text-sm text-accent-2 mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
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
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-card border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent transition-colors"
                        placeholder="Los Angeles"
                      />
                    </div>
                    <div>
                      <label className="block font-body text-sm text-accent-2 mb-2">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-card border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent transition-colors"
                        placeholder="CA"
                      />
                    </div>
                    <div>
                      <label className="block font-body text-sm text-accent-2 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
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

                  <div className="bg-card border border-accent-2/10 rounded-xl p-5 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded-full border-2 border-accent flex items-center justify-center flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                      </div>
                      <div className="flex-1">
                        <span className="font-body text-sm text-primary">Manual Payment (Bank Transfer)</span>
                        <p className="font-body text-xs text-accent-2">Pay directly to our bank account</p>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent flex-shrink-0">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <line x1="3" y1="9" x2="21" y2="9"/>
                      </svg>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-surface rounded-xl p-5 mb-4 space-y-2"
                  >
                    <p className="font-body text-sm font-medium text-primary mb-3">Bank Details:</p>
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent flex-shrink-0">
                        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>
                        <line x1="12" y1="22" x2="12" y2="15.5"/>
                        <polyline points="22 8.5 12 15.5 2 8.5"/>
                      </svg>
                      <span className="font-body text-xs text-accent-2">Bank: <span className="text-primary">{bankDetails.bankName}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent flex-shrink-0">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span className="font-body text-xs text-accent-2">Account Name: <span className="text-primary">{bankDetails.accountName}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent flex-shrink-0">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <line x1="2" y1="10" x2="22" y2="10"/>
                      </svg>
                      <span className="font-body text-xs text-accent-2">Account Number: <span className="text-primary font-medium">{bankDetails.accountNumber}</span></span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-green-500/5 border border-green-500/20 rounded-xl p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-body text-sm font-medium text-primary mb-1">Confirm via WhatsApp</p>
                        <p className="font-body text-xs text-accent-2 mb-3">
                          After placing your order, send your payment receipt to us on WhatsApp for confirmation.
                        </p>
                        <a
                          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Ball%20%26%20Boujee%2C%20I%20just%20placed%20an%20order%20and%20I'm%20sending%20my%20payment%20receipt%20for%20confirmation.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white font-body text-sm rounded-xl hover:bg-green-600 transition-colors"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Contact us on WhatsApp
                        </a>
                      </div>
                    </div>
                  </motion.div>
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
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        I've made payment
                      </>
                    )}
                  </button>

                  <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 flex-shrink-0">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <span className="font-body text-xs text-accent-2">
                        Your order will be confirmed after payment verification on WhatsApp.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 mt-4 text-accent-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span className="font-body text-xs">Secure checkout</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348000000001";
const DEFAULT_BANK = { bankName: "First Bank of Nigeria", accountName: "Ball & Boujee", accountNumber: "1234567890" };

interface Order {
  _id: string;
  orderItems: Array<{
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  total: number;
  status: string;
  createdAt: string;
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
  };
  paymentMethod: string;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("order");
  const paymentType = searchParams.get("payment");

  const [bankDetails, setBankDetails] = useState(DEFAULT_BANK);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const isManualPayment = paymentType === "manual" || paymentType === "bank";

  useEffect(() => {
    fetchBankDetails();
    fetchOrder();
  }, []);

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

  const fetchOrder = async () => {
    try {
      const orderId = urlOrderId || sessionStorage.getItem("lastOrderId");

      if (!orderId) {
        console.log("No order ID found");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders?token=${token || ""}`);
      const data = await response.json();

      if (data.success && data.orders) {
        const foundOrder = data.orders.find((o: Order) => o._id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        }
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    }
    setLoading(false);
  };

  const displayOrderId = order?._id
    ? order._id.slice(-8).toUpperCase()
    : urlOrderId
      ? urlOrderId.slice(-8).toUpperCase()
      : sessionStorage.getItem("lastOrderId")?.slice(-8).toUpperCase() || "";

  const waMessage = encodeURIComponent(
    `Hi Ball & Boujee! I just placed order #${displayOrderId}. Here is my payment receipt for confirmation.`
  );

  const getStatusStep = (status: string) => {
    switch (status) {
      case "pending": return 0;
      case "processing": return 1;
      case "shipped": return 2;
      case "delivered": return 3;
      default: return 0;
    }
  };

  const statusLabels = ["Order Placed", "Processing", "Shipped", "Delivered"];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-12 w-12 text-accent mx-auto" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-16 pb-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </motion.div>
          <h1 className="font-display text-4xl md:text-5xl text-primary mb-4">ORDER CONFIRMED!</h1>
          <p className="font-body text-accent-2 text-lg">Thank you for your purchase</p>
        </motion.div>

        {isManualPayment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6 md:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h2 className="font-display text-xl text-primary">Payment Confirmation Required</h2>
            </div>

            <p className="font-body text-sm text-accent-2 mb-5">
              Your order has been placed. To complete it, please make a bank transfer and send your payment receipt to us on WhatsApp.
            </p>

            <div className="bg-card rounded-xl p-5 mb-5 space-y-2">
              <p className="font-body text-sm font-medium text-primary mb-2">Bank Transfer Details:</p>
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
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent flex-shrink-0">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <span className="font-body text-xs text-accent-2">Amount: <span className="text-primary font-medium">₦{order?.total?.toLocaleString() || "—"}</span></span>
              </div>
            </div>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-green-500 text-white font-body text-sm font-medium rounded-xl hover:bg-green-600 transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Send Payment Receipt on WhatsApp
            </a>
          </motion.div>
        )}

        {order && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-accent-2/10 rounded-2xl p-6 mb-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <p className="font-body text-sm text-accent-2">Order Number</p>
                  <p className="font-display text-xl text-primary">#{displayOrderId}</p>
                </div>
                <div className="text-right">
                  <p className="font-body text-sm text-accent-2">Date</p>
                  <p className="font-body text-primary">
                    {new Date(order.createdAt).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center py-8">
                <div className="flex items-center w-full max-w-md">
                  {statusLabels.map((label, index) => {
                    const currentStep = getStatusStep(order.status);
                    const isCompleted = index <= currentStep;
                    const isLast = index === statusLabels.length - 1;

                    return (
                      <div key={label} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? "bg-accent text-background"
                                : "bg-accent-2/20 text-accent-2"
                            }`}
                          >
                            {isCompleted ? (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            ) : (
                              <span className="font-body text-sm">{index + 1}</span>
                            )}
                          </div>
                          <span className={`font-body text-xs mt-2 ${isCompleted ? "text-primary" : "text-accent-2"}`}>
                            {label}
                          </span>
                        </div>
                        {!isLast && (
                          <div className={`flex-1 h-1 mx-2 ${index < currentStep ? "bg-accent" : "bg-accent-2/20"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-center">
                <Link
                  href={`/checkout/track/${order._id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background font-body text-sm rounded-xl hover:bg-accent/90 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Track Order
                </Link>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card border border-accent-2/10 rounded-2xl p-6"
              >
                <h2 className="font-display text-lg text-primary mb-4">Shipping Address</h2>
                <div className="font-body text-sm text-accent-2 space-y-1">
                  <p className="text-primary">{order.shipping.firstName} {order.shipping.lastName}</p>
                  <p>{order.shipping.address}</p>
                  <p>{order.shipping.city}, {order.shipping.state}</p>
                  <p>{order.shipping.phone}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card border border-accent-2/10 rounded-2xl p-6"
              >
                <h2 className="font-display text-lg text-primary mb-4">Order Summary</h2>
                <div className="space-y-3">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-surface overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-primary truncate">{item.name}</p>
                        <p className="font-body text-xs text-accent-2">×{item.quantity}</p>
                      </div>
                      <p className="font-body text-sm text-primary">₦{item.price.toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-accent-2/10 flex justify-between">
                    <span className="font-body text-primary">Total</span>
                    <span className="font-display text-lg text-primary">₦{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            href="/shop"
            className="inline-block px-8 py-4 border border-accent text-accent font-body text-sm rounded-xl hover:bg-accent hover:text-background transition-colors"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>

      <motion.a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-xl hover:shadow-green-500/30 transition-shadow"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </motion.a>
    </main>
  );
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-background pt-16 flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin h-12 w-12 text-accent mx-auto" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="font-body text-accent-2 mt-4">Loading order details...</p>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

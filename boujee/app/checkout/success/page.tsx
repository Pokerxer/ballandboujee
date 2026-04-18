"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

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
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, []);

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
                  <p className="font-display text-xl text-primary">#{order._id.slice(-8).toUpperCase()}</p>
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

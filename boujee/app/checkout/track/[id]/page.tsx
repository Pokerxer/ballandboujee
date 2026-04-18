"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  isPaid: boolean;
  paidAt: string;
  isDelivered: boolean;
  deliveredAt: string;
}

const statusSteps = [
  { key: "pending", label: "Order Placed", description: "Your order has been received" },
  { key: "processing", label: "Processing", description: "Order is being prepared" },
  { key: "shipped", label: "Shipped", description: "On the way to you" },
  { key: "delivered", label: "Delivered", description: "Order completed" },
];

const getEstimatedDelivery = (status: string, orderDate: string) => {
  const date = new Date(orderDate);
  switch (status) {
    case "pending":
      date.setDate(date.getDate() + 3);
      break;
    case "processing":
      date.setDate(date.getDate() + 2);
      break;
    case "shipped":
      date.setDate(date.getDate() + 1);
      break;
    case "delivered":
      return null;
    default:
      date.setDate(date.getDate() + 5);
  }
  return date;
};

const getStatusTimeline = (order: Order) => {
  const timeline = [];
  const orderDate = new Date(order.createdAt);
  
  timeline.push({
    status: "Order Placed",
    date: orderDate,
    completed: true,
    description: "Your order was successfully placed",
  });
  
  if (["processing", "shipped", "delivered"].includes(order.status)) {
    const processDate = new Date(orderDate);
    processDate.setDate(processDate.getDate() + 1);
    timeline.push({
      status: "Processing",
      date: processDate,
      completed: true,
      description: "Your order is being processed",
    });
  }
  
  if (["shipped", "delivered"].includes(order.status)) {
    const shipDate = new Date(orderDate);
    shipDate.setDate(shipDate.getDate() + 2);
    timeline.push({
      status: "Shipped",
      date: shipDate,
      completed: true,
      description: "Your order has been shipped",
    });
  }
  
  if (order.status === "delivered") {
    const deliverDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date();
    timeline.push({
      status: "Delivered",
      date: deliverDate,
      completed: true,
      description: "Your order has been delivered",
    });
  }
  
  return timeline;
};

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders?token=${token || ""}`);
      const data = await response.json();
      
      if (data.success) {
        const foundOrder = data.orders.find((o: Order) => o._id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError("Order not found");
        }
      } else {
        setError("Failed to fetch order");
      }
    } catch (err) {
      setError("Failed to fetch order");
    }
    setLoading(false);
  };

  const getCurrentStep = () => {
    if (!order) return 0;
    const step = statusSteps.findIndex(s => s.key === order.status);
    return step >= 0 ? step : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-500 bg-yellow-500/10";
      case "processing": return "text-blue-500 bg-blue-500/10";
      case "shipped": return "text-purple-500 bg-purple-500/10";
      case "delivered": return "text-green-500 bg-green-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  if (loading) {
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

  if (error || !order) {
    return (
      <main className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="font-display text-3xl text-primary mb-4">{error || "Order Not Found"}</h1>
          <p className="font-body text-accent-2 mb-8">We couldn&apos;t find this order</p>
          <Link href="/" className="text-accent hover:underline">Go Home</Link>
        </motion.div>
      </main>
    );
  }

  const currentStep = statusSteps.findIndex(s => s.key === order.status);
  const estimatedDelivery = getEstimatedDelivery(order.status, order.createdAt);
  const timeline = getStatusTimeline(order);

  const shareOrder = () => {
    const text = `Track my Ball & Boujee order #${order._id.slice(-8).toUpperCase()}: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: "Track Order", text });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <main className="min-h-screen bg-background pt-16 pb-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link href="/account" className="inline-flex items-center gap-2 text-accent-2 hover:text-accent transition-colors mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Account
              </Link>
              <h1 className="font-display text-4xl text-primary">TRACK ORDER</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="font-body text-accent-2">Order #{order._id.slice(-8).toUpperCase()}</p>
                <span className="w-1 h-1 rounded-full bg-accent-2" />
                <p className="font-body text-accent-2">{new Date(order.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={shareOrder}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-accent-2/20 rounded-xl text-primary font-body text-sm hover:border-accent transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share
              </button>
              <a
                href={`https://wa.me/2348000000000?text=Hi, I'm tracking order #${order._id.slice(-8).toUpperCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-body text-sm hover:bg-green-600 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </motion.div>

        {estimatedDelivery && order.status !== "delivered" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="font-body text-sm text-accent-2">Estimated Delivery</p>
                <p className="font-display text-xl text-primary">
                  {estimatedDelivery.toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-accent-2/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-xl text-primary">Order Status</h2>
                <span className={`px-4 py-2 rounded-full font-body text-sm capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="flex items-center justify-between mb-8">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isCompleted
                            ? "bg-accent text-background"
                            : "bg-accent-2/20 text-accent-2"
                        }`}
                      >
                        {isCompleted ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {index === 0 && <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
                            {index === 1 && <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />}
                            {index === 2 && <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />}
                            {index === 3 && <path d="M5 13l4 4L19 7" />}
                          </svg>
                        ) : (
                          <span className="font-body text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                      <span className={`font-body text-xs mt-2 text-center ${isCurrent ? "text-primary font-medium" : "text-accent-2"}`}>
                        {step.label}
                      </span>
                      {isCurrent && (
                        <span className="font-body text-[10px] text-accent">Current</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="h-2 bg-accent-2/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((currentStep + 1) / statusSteps.length) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card border border-accent-2/10 rounded-2xl p-6"
            >
              <h2 className="font-display text-xl text-primary mb-6">Order Timeline</h2>
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${event.completed ? "bg-accent" : "bg-accent-2/30"}`} />
                      {index < timeline.length - 1 && <div className="w-0.5 h-full bg-accent-2/20 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="font-body text-sm text-primary">{event.status}</p>
                      <p className="font-body text-xs text-accent-2">{event.description}</p>
                      <p className="font-body text-xs text-accent-2/70 mt-1">
                        {event.date.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-accent-2/10 rounded-2xl p-6"
            >
              <h2 className="font-display text-xl text-primary mb-6">Order Items ({order.orderItems.length})</h2>
              <div className="space-y-4">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-surface overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-body text-primary">{item.name}</h3>
                      <p className="font-body text-sm text-accent-2">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-body text-primary">₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-accent-2/10 space-y-2">
                <div className="flex justify-between font-body">
                  <span className="text-accent-2">Subtotal</span>
                  <span className="text-primary">₦{order.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-body">
                  <span className="text-accent-2">Shipping</span>
                  <span className="text-green-500">Free</span>
                </div>
                <div className="flex justify-between font-display text-lg pt-4 border-t border-accent-2/10">
                  <span className="text-primary">Total</span>
                  <span className="text-primary">₦{order.total.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-accent-2/10 rounded-2xl p-6"
            >
              <h2 className="font-display text-lg text-primary mb-4">Shipping Address</h2>
              <div className="font-body text-sm text-accent-2 space-y-1">
                <p className="text-primary font-medium">{order.shipping.firstName} {order.shipping.lastName}</p>
                <p>{order.shipping.address}</p>
                <p>{order.shipping.city}, {order.shipping.state}</p>
                <p>{order.shipping.phone}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-accent-2/10 rounded-2xl p-6"
            >
              <h2 className="font-display text-lg text-primary mb-4">Payment Info</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-body text-sm text-accent-2">Method</span>
                  <span className="font-body text-sm text-primary capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-sm text-accent-2">Status</span>
                  <span className={`font-body text-sm ${order.isPaid ? "text-green-500" : "text-yellow-500"}`}>
                    {order.isPaid ? "Paid" : "Pending"}
                  </span>
                </div>
                {order.isPaid && order.paidAt && (
                  <div className="flex justify-between">
                    <span className="font-body text-sm text-accent-2">Paid On</span>
                    <span className="font-body text-sm text-primary">
                      {new Date(order.paidAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card border border-accent-2/10 rounded-2xl p-6"
            >
              <h2 className="font-display text-lg text-primary mb-4">Need Help?</h2>
              <p className="font-body text-sm text-accent-2 mb-4">
                Contact our support team for any questions about your order.
              </p>
              <Link
                href="/contact"
                className="block w-full text-center py-3 border border-accent text-accent rounded-xl font-body text-sm hover:bg-accent hover:text-background transition-colors"
              >
                Contact Support
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}

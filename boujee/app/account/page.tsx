"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../hooks/useStore";
import { logout } from "../store/slices/authSlice";
import { removeFromWishlist } from "../store/slices/wishlistSlice";

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
    address: string;
    city: string;
    state: string;
    phone: string;
  };
  paymentMethod: string;
  isPaid: boolean;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  images?: string[];
}

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "profile", label: "Profile" },
  { id: "wishlist", label: "Wishlist" },
];

const statusFilters = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

export default function AccountPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, token } = useAppSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [backendWishlist, setBackendWishlist] = useState<Product[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch(`/api/orders?token=${token}`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
    setLoadingOrders(false);
  };

  const fetchWishlist = async () => {
    setLoadingWishlist(true);
    try {
      const response = await fetch(`/api/auth?action=getWishlist&token=${token}`);
      const data = await response.json();
      if (data.success && data.wishlist) {
        setBackendWishlist(data.wishlist);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
    setLoadingWishlist(false);
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/auth?action=wishlist&productId=${productId}&token=${token}`, {
        method: "PUT",
      });
      const data = await response.json();
      if (data.success) {
        setBackendWishlist(data.wishlist);
        dispatch(removeFromWishlist({ id: productId }));
      }
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if ((activeTab === "orders" || activeTab === "overview") && token) {
      fetchOrders();
    }
  }, [activeTab, token]);

  useEffect(() => {
    if (activeTab === "wishlist" && token) {
      fetchWishlist();
    }
  }, [activeTab, token]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "processing":
        return "bg-blue-500/10 text-blue-500";
      case "shipped":
        return "bg-purple-500/10 text-purple-500";
      case "delivered":
        return "bg-green-500/10 text-green-500";
      case "cancelled":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl md:text-5xl text-primary">MY ACCOUNT</h1>
          <p className="font-body text-accent-2 mt-2">Welcome back, {user?.name}!</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-card border border-accent-2/10 rounded-2xl p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-accent-2/10">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="font-display text-xl text-accent">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-body text-sm text-primary">{user?.name}</p>
                  <p className="font-body text-xs text-accent-2">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-body text-sm transition-colors ${
                      activeTab === tab.id
                        ? "bg-accent text-background"
                        : "text-primary hover:bg-surface"
                    }`}
                  >
                    {tab.label}
                    {tab.id === "orders" && orders.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-accent-2/20 rounded-full">
                        {orders.length}
                      </span>
                    )}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl font-body text-sm text-danger hover:bg-danger/10 transition-colors"
                >
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-card border border-accent-2/10 rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-body text-2xl font-bold text-primary">{orders.length}</p>
                          <p className="font-body text-xs text-accent-2">Total Orders</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card border border-accent-2/10 rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-500">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-body text-2xl font-bold text-primary">{orders.filter(o => o.status === 'pending').length}</p>
                          <p className="font-body text-xs text-accent-2">Pending</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card border border-accent-2/10 rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-body text-2xl font-bold text-primary">{orders.filter(o => o.status === 'processing').length}</p>
                          <p className="font-body text-xs text-accent-2">Processing</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card border border-accent-2/10 rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-body text-2xl font-bold text-primary">{orders.filter(o => o.status === 'delivered').length}</p>
                          <p className="font-body text-xs text-accent-2">Delivered</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {orders.length > 0 && (
                    <div className="bg-card border border-accent-2/10 rounded-2xl p-6 mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display text-xl text-primary">Recent Orders</h2>
                        <button 
                          onClick={() => setActiveTab("orders")}
                          className="text-accent text-sm hover:underline"
                        >
                          View All
                        </button>
                      </div>
                      <div className="space-y-3">
                        {orders.slice(0, 3).map((order) => (
                          <div 
                            key={order._id}
                            className="flex items-center justify-between p-3 bg-surface rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                  <line x1="3" y1="6" x2="21" y2="6" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-body text-sm text-primary">#{order._id.slice(-8).toUpperCase()}</p>
                                <p className="font-body text-xs text-accent-2">{order.orderItems.length} items • ₦{order.total.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded-full font-body text-xs ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                              <Link
                                href={`/checkout/track/${order._id}`}
                                className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                  <circle cx="12" cy="10" r="3" />
                                </svg>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-card border border-accent-2/10 rounded-2xl p-6">
                    <h2 className="font-display text-xl text-primary mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Link
                        href="/shop"
                        className="p-4 bg-surface rounded-xl text-center hover:bg-accent/10 transition-colors"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-accent mb-2">
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        <p className="font-body text-sm text-primary">Shop Now</p>
                      </Link>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="p-4 bg-surface rounded-xl text-center hover:bg-accent/10 transition-colors"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-accent mb-2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <p className="font-body text-sm text-primary">View Orders</p>
                      </button>
                      <button
                        onClick={() => setActiveTab("wishlist")}
                        className="p-4 bg-surface rounded-xl text-center hover:bg-accent/10 transition-colors"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-accent mb-2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <p className="font-body text-sm text-primary">Wishlist</p>
                      </button>
                      <button
                        onClick={() => setActiveTab("profile")}
                        className="p-4 bg-surface rounded-xl text-center hover:bg-accent/10 transition-colors"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-accent mb-2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <p className="font-body text-sm text-primary">Edit Profile</p>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="bg-card border border-accent-2/10 rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <h2 className="font-display text-xl text-primary">My Orders</h2>
                      <div className="flex flex-wrap gap-2">
                        {statusFilters.map((filter) => (
                          <button
                            key={filter.value}
                            onClick={() => setStatusFilter(filter.value)}
                            className={`px-4 py-2 rounded-lg font-body text-sm transition-colors ${
                              statusFilter === filter.value
                                ? "bg-accent text-background"
                                : "bg-surface text-primary hover:bg-accent/10"
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {loadingOrders ? (
                      <div className="flex items-center justify-center py-12">
                        <svg className="animate-spin h-8 w-8 text-accent" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-accent-2 mb-4">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        <p className="font-body text-accent-2 mb-4">No orders yet</p>
                        <Link
                          href="/shop"
                          className="inline-block px-6 py-3 bg-accent text-background font-body text-sm rounded-xl hover:bg-accent/90 transition-colors"
                        >
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders
                          .filter(order => statusFilter === "all" || order.status === statusFilter)
                          .map((order) => (
                          <div
                            key={order._id}
                            className="border border-accent-2/10 rounded-xl overflow-hidden hover:border-accent/30 transition-colors"
                          >
                            <div 
                              className="p-4 cursor-pointer"
                              onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <p className="font-body text-sm text-accent-2">Order #{order._id.slice(-8).toUpperCase()}</p>
                                    <p className="font-body text-xs text-accent-2">
                                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`px-3 py-1 rounded-full font-body text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                  <svg 
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2"
                                    className={`text-accent-2 transition-transform ${expandedOrder === order._id ? 'rotate-180' : ''}`}
                                  >
                                    <path d="M6 9l6 6 6-6"/>
                                  </svg>
                                </div>
                              </div>
                            </div>

                            <AnimatePresence>
                              {expandedOrder === order._id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-accent-2/10"
                                >
                                  <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="font-body text-xs text-accent-2 mb-2">Order Items</p>
                                        <div className="space-y-2">
                                          {order.orderItems.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                              <div className="w-12 h-12 rounded-lg bg-surface overflow-hidden flex-shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="font-body text-sm text-primary truncate">{item.name}</p>
                                                <p className="font-body text-xs text-accent-2">₦{item.price.toLocaleString()} × {item.quantity}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="space-y-4">
                                        <div>
                                          <p className="font-body text-xs text-accent-2 mb-2">Shipping To</p>
                                          <p className="font-body text-sm text-primary">
                                            {order.shipping?.firstName} {order.shipping?.lastName}
                                          </p>
                                          <p className="font-body text-xs text-accent-2">
                                            {order.shipping?.address}, {order.shipping?.city}, {order.shipping?.state}
                                          </p>
                                          <p className="font-body text-xs text-accent-2">{order.shipping?.phone}</p>
                                        </div>
                                        <div>
                                          <p className="font-body text-xs text-accent-2 mb-1">Payment</p>
                                          <p className="font-body text-sm text-primary capitalize">{order.paymentMethod || 'N/A'}</p>
                                          <p className={`font-body text-xs ${order.isPaid ? 'text-green-500' : 'text-yellow-500'}`}>
                                            {order.isPaid ? 'Paid' : 'Pending'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-accent-2/10">
                                      <div className="flex items-center gap-4">
                                        <div>
                                          <p className="font-body text-xs text-accent-2">Total</p>
                                          <p className="font-display text-lg text-primary">₦{order.total.toLocaleString()}</p>
                                        </div>
                                      </div>
                                      <Link
                                        href={`/checkout/track/${order._id}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-background font-body text-sm rounded-lg hover:bg-accent/90 transition-colors"
                                      >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                          <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        Track Order
                                      </Link>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                        {orders.filter(order => statusFilter === "all" || order.status === statusFilter).length === 0 && (
                          <div className="text-center py-8">
                            <p className="font-body text-accent-2">No orders with this status</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="bg-card border border-accent-2/10 rounded-2xl p-6">
                    <h2 className="font-display text-xl text-primary mb-6">Profile Settings</h2>
                    
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block font-body text-sm text-primary mb-2">Full Name</label>
                          <input
                            type="text"
                            defaultValue={user?.name}
                            className="w-full px-4 py-3 bg-surface border border-accent-2/20 rounded-xl text-primary font-body focus:outline-none focus:border-accent transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block font-body text-sm text-primary mb-2">Email Address</label>
                          <input
                            type="email"
                            defaultValue={user?.email}
                            disabled
                            className="w-full px-4 py-3 bg-surface/50 border border-accent-2/20 rounded-xl text-accent-2 font-body cursor-not-allowed"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block font-body text-sm text-primary mb-2">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="+234 800 000 0000"
                          className="w-full px-4 py-3 bg-surface border border-accent-2/20 rounded-xl text-primary font-body placeholder:text-accent-2/50 focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label className="block font-body text-sm text-primary mb-2">Shipping Address</label>
                        <textarea
                          rows={3}
                          placeholder="Enter your shipping address"
                          className="w-full px-4 py-3 bg-surface border border-accent-2/20 rounded-xl text-primary font-body placeholder:text-accent-2/50 focus:outline-none focus:border-accent transition-colors resize-none"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        className="px-6 py-3 bg-accent text-background font-body text-sm rounded-xl hover:bg-accent/90 transition-colors"
                      >
                        Save Changes
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === "wishlist" && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="bg-card border border-accent-2/10 rounded-2xl p-6">
                    <h2 className="font-display text-xl text-primary mb-6">My Wishlist</h2>
                    
                    {loadingWishlist ? (
                      <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto"></div>
                        <p className="font-body text-accent-2 mt-4">Loading wishlist...</p>
                      </div>
                    ) : backendWishlist.length === 0 ? (
                      <div className="text-center py-12">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-accent-2 mb-4">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <p className="font-body text-accent-2 mb-4">Your wishlist is empty</p>
                        <Link
                          href="/shop"
                          className="inline-block px-6 py-3 bg-accent text-background font-body text-sm rounded-xl hover:bg-accent/90 transition-colors"
                        >
                          Browse Products
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {backendWishlist.map((item) => (
                          <div
                            key={item._id}
                            className="group border border-accent-2/10 rounded-xl overflow-hidden hover:border-accent/30 transition-colors"
                          >
                            <Link href={`/shop/${item.slug}`}>
                              <div className="aspect-square relative bg-surface">
                                <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="p-4">
                                <h3 className="font-body text-sm text-primary group-hover:text-accent transition-colors truncate">
                                  {item.name}
                                </h3>
                                <p className="font-body text-sm font-bold text-primary mt-1">
                                  ₦{item.price?.toLocaleString()}
                                </p>
                              </div>
                            </Link>
                            <button
                              onClick={() => handleRemoveFromWishlist(item._id)}
                              className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              </svg>
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}

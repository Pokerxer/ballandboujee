"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState<BankDetails>({
    bankName: "",
    accountName: "",
    accountNumber: "",
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAdmin(false);
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getMe", token }),
      });
      const data = await res.json();
      if (data?.user?.role === "admin") {
        setIsAdmin(true);
        fetchBankDetails();
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  };

  const fetchBankDetails = async () => {
    try {
      const res = await fetch("/api/bank-details");
      const data = await res.json();
      if (data.success) {
        setForm(data.data);
      }
    } catch {
      console.error("Failed to fetch bank details");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/bank-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Bank details updated successfully!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }

    setSaving(false);
  };

  if (isAdmin === null) {
    return (
      <main className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-accent" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl text-primary mb-3">Access Denied</h1>
          <p className="font-body text-accent-2 mb-6">You need admin privileges to access this page.</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-accent text-background rounded-xl font-body text-sm hover:bg-accent/90 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-16 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-4xl md:text-5xl text-primary mb-3">ADMIN SETTINGS</h1>
          <p className="font-body text-accent-2">Manage your store&apos;s bank transfer details</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface/50 rounded-2xl p-6 md:p-8"
        >
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl font-body text-sm ${
                message.type === "success"
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : "bg-danger/10 text-danger border border-danger/20"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-body text-sm text-accent-2 mb-2">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-card border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent transition-colors"
                placeholder="e.g. First Bank of Nigeria"
              />
            </div>

            <div>
              <label className="block font-body text-sm text-accent-2 mb-2">Account Name</label>
              <input
                type="text"
                name="accountName"
                value={form.accountName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-card border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent transition-colors"
                placeholder="e.g. Ball & Boujee"
              />
            </div>

            <div>
              <label className="block font-body text-sm text-accent-2 mb-2">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-card border border-accent-2/20 rounded-xl font-body text-primary focus:outline-none focus:border-accent transition-colors"
                placeholder="e.g. 1234567890"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-accent text-background font-body text-sm uppercase tracking-wider rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>

          <p className="mt-6 text-center font-body text-xs text-accent-2">
            These details will be shown to customers during checkout.
          </p>
        </motion.div>
      </div>
    </main>
  );
}

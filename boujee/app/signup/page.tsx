"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../hooks/useStore";
import { register, clearError } from "../store/slices/authSlice";

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, router, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setValidationError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    dispatch(register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    }));
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card border border-accent-2/10 rounded-3xl p-8 md:p-10 shadow-xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-3 px-4 py-2 border border-accent/30 rounded-full mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="font-body text-xs uppercase tracking-wider text-accent">New Account</span>
            </motion.div>
            <h1 className="font-display text-4xl md:text-5xl text-primary">JOIN THE<br/>SQUAD</h1>
            <p className="font-body text-accent-2 mt-3">Create your account and start shopping</p>
          </div>

          {(error || validationError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl mb-6 font-body text-sm"
            >
              {error || validationError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block font-body text-sm text-primary mb-2">
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-surface border border-accent-2/20 rounded-xl text-primary font-body placeholder:text-accent-2/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-body text-sm text-primary mb-2">
                Email Address <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-surface border border-accent-2/20 rounded-xl text-primary font-body placeholder:text-accent-2/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block font-body text-sm text-primary mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+234 800 000 0000"
                className="w-full px-4 py-3 bg-surface border border-accent-2/20 rounded-xl text-primary font-body placeholder:text-accent-2/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-body text-sm text-primary mb-2">
                Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-surface border border-accent-2/20 rounded-xl text-primary font-body placeholder:text-accent-2/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block font-body text-sm text-primary mb-2">
                Confirm Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-surface border border-accent-2/20 rounded-xl text-primary font-body placeholder:text-accent-2/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-accent text-background font-body text-sm uppercase tracking-wider rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="font-body text-sm text-accent-2">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:text-accent/80 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-accent-2/10">
            <p className="font-body text-xs text-accent-2 text-center">
              By creating an account, you agree to our{" "}
              <Link href="/about" className="text-accent hover:underline">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/about" className="text-accent hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const trxref = searchParams.get("trxref");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const ref = reference || trxref;
    if (ref) {
      verifyPayment(ref);
    } else {
      setStatus("error");
      setMessage("No payment reference found");
    }
  }, [reference, trxref]);

  const verifyPayment = async (ref: string) => {
    try {
      const token = localStorage.getItem("token");
      const orderId = sessionStorage.getItem("lastOrderId");
      
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "paystackVerify",
          token,
          reference: ref,
        }),
      });

      const result = await response.json();

      if (result.success && result.paymentStatus === "success") {
        setStatus("success");
        setMessage("Payment successful! Redirecting...");
        
        if (orderId && token) {
          try {
            await fetch(`/api/orders?id=${orderId}&token=${token}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                status: "processing",
                paymentReference: ref 
              }),
            });
          } catch (err) {
            console.error("Failed to update order:", err);
          }
        }
        
        sessionStorage.setItem("paymentReference", ref);
        
        setTimeout(() => {
          router.push(`/checkout/success?payment=paystack&ref=${ref}`);
        }, 2000);
      } else {
        setStatus("error");
        setMessage(result.error || "Payment verification failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to verify payment");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center px-4"
    >
      {status === "loading" && (
        <>
          <svg className="animate-spin h-16 w-16 text-accent mx-auto mb-6" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <h1 className="font-display text-3xl text-primary mb-4">Verifying Payment</h1>
        </>
      )}

      {status === "success" && (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </motion.div>
          <h1 className="font-display text-3xl text-primary mb-4">Payment Successful!</h1>
        </>
      )}

      {status === "error" && (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </motion.div>
          <h1 className="font-display text-3xl text-primary mb-4">Payment Failed</h1>
        </>
      )}

      <p className="font-body text-accent-2">{message}</p>

      {status === "error" && (
        <button
          onClick={() => router.push("/checkout")}
          className="mt-8 px-6 py-3 bg-accent text-background font-body text-sm rounded-xl hover:bg-accent/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="text-center">
      <svg className="animate-spin h-16 w-16 text-accent mx-auto mb-6" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="font-body text-accent-2">Loading...</p>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <main className="min-h-screen bg-background pt-16 flex items-center justify-center">
      <Suspense fallback={<LoadingState />}>
        <PaymentCallbackContent />
      </Suspense>
    </main>
  );
}

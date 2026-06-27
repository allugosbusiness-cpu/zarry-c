"use client";

import React, { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HiCheck, HiXMark, HiClock } from "react-icons/hi2";
import { useSearchParams } from "next/navigation";

function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"checking" | "paid" | "failed" | "cancelled">("checking");

  useEffect(() => {
    if (!reference) {
      setStatus("cancelled");
      return;
    }

    // Poll for payment status from PayNow
    const checkPayment = async () => {
      try {
        const res = await fetch(`/api/paynow/status?reference=${reference}`);
        const data = await res.json();
        if (data.paid) {
          setStatus("paid");
        } else if (data.status === "failed" || data.status === "cancelled") {
          setStatus("failed");
        } else if (data.status === "pending") {
          // Still pending, keep checking
          setTimeout(checkPayment, 3000);
        } else {
          setStatus("cancelled");
        }
      } catch {
        setStatus("failed");
      }
    };

    checkPayment();
  }, [reference]);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 pb-20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg mx-auto px-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6"
          >
            <HiClock className="w-10 h-10 text-yellow-400" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-4">Verifying Payment...</h1>
          <p className="text-white/50">Please wait while we confirm your payment status.</p>
        </motion.div>
      </div>
    );
  }

  if (status === "paid") {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 pb-20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg mx-auto px-4">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
          >
            <HiCheck className="w-10 h-10 text-green-400" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">Payment Successful! 🎉</h1>
          <p className="text-white/50 mb-2">Thank you for your purchase.</p>
          <p className="text-white/30 text-sm mb-8">Reference: {reference}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/"><Button variant="pink">Back to Home</Button></Link>
            <Link href="/music"><Button variant="outline">Explore Music</Button></Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg mx-auto px-4">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <HiXMark className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          {status === "cancelled" ? "Payment Cancelled" : "Payment Failed"}
        </h1>
        <p className="text-white/50 mb-2">
          {status === "cancelled"
            ? "Your payment was not completed."
            : "Unfortunately, your payment did not go through."}
        </p>
        <p className="text-white/30 text-sm mb-8">No charges were made. You can try again whenever you're ready.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/"><Button variant="pink">Back to Home</Button></Link>
          <Link href="/music"><Button variant="outline">Browse Music</Button></Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-950 pt-24 pb-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
      </div>
    }>
      <PaymentVerifyContent />
    </Suspense>
  );
}
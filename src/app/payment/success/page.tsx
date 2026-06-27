"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HiCheck } from "react-icons/hi2";

export default function PaymentSuccessPage() {
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
        <p className="text-white/30 text-sm mb-8">Your transaction has been completed and a receipt has been sent to your email.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/"><Button variant="pink">Back to Home</Button></Link>
          <Link href="/music"><Button variant="outline">Explore Music</Button></Link>
        </div>
      </motion.div>
    </div>
  );
}
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HiXMark } from "react-icons/hi2";

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg mx-auto px-4">
        <motion.div
          className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6"
        >
          <HiXMark className="w-10 h-10 text-red-400" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white mb-4">Payment Cancelled</h1>
        <p className="text-white/50 mb-2">Your payment was not processed.</p>
        <p className="text-white/30 text-sm mb-8">No charges were made. You can try again whenever you're ready.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/"><Button variant="pink">Back to Home</Button></Link>
          <Link href="/music"><Button variant="outline">Browse Music</Button></Link>
        </div>
      </motion.div>
    </div>
  );
}
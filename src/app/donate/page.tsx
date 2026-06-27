"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { HiArrowLeft, HiHeart } from "react-icons/hi2";
import { PayNowButton } from "@/components/ui/paynow-button";

export default function DonatePage() {
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const quickAmounts = [1, 5, 10, 20, 50, 100, 500, 1000];
  const amount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
            <HiArrowLeft className="w-4 h-4" /> Back
          </Link>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}>
            <HiHeart className="w-20 h-20 text-pink-400 mx-auto mb-6" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">Support the Movement</h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
            Every donation, big or small, fuels the journey. Thank you for your generosity.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-semibold text-white mb-6">Choose an amount</h2>
          <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto mb-8">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                className={`p-3 rounded-xl border text-lg font-bold transition-all ${
                  selectedAmount === amt
                    ? "bg-pink-500/20 border-pink-500/50 ring-2 ring-pink-500/30 text-white"
                    : amt === 10
                    ? "bg-pink-500/10 border-pink-500/30 text-white"
                    : "bg-dark-800/50 border-white/5 text-white hover:border-white/20"
                }`}
              >
                {amt === 10 && <span className="block text-[10px] font-normal text-pink-400 -mt-1 mb-1">Popular</span>}
                ${amt}
              </button>
            ))}
          </div>

          <div className="mb-8 max-w-xs mx-auto">
            <input
              type="number" min="1" step="1"
              placeholder="Custom amount ($)"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
              className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-white/10 text-white placeholder:text-white/20 text-center focus:outline-none focus:border-pink-500/50 transition-all"
            />
            <p className="text-white/20 text-xs mt-2">Any amount from $1 upward</p>
          </div>

          <div className="max-w-xs mx-auto">
            <PayNowButton
              fullWidth
              size="xl"
              variant="pink"
              amount={amount > 0 ? amount : 1}
              itemName="Donation to Zarry C"
              description={`Generous donation of $${amount > 0 ? amount : 1}`}
              icon={<HiHeart className="w-5 h-5" />}
            >
              {amount > 0 ? `Donate $${amount}` : "Donate Now"}
            </PayNowButton>
          </div>

          <p className="text-white/30 text-xs mt-4">Powered by PayNow. Secure payments.</p>
        </motion.div>
      </div>
    </div>
  );
}
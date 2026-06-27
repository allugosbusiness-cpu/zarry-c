"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { merchItems } from "@/data/site-data";
import { Button } from "@/components/ui/button";
import { HiArrowLeft, HiShoppingBag, HiClock } from "react-icons/hi2";
import { useCartStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function MerchPage() {
  const addItem = useCartStore(s => s.addItem);

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"><HiArrowLeft className="w-4 h-4" /> Back</Link>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">Merch</h1>
          <p className="text-white/40 text-lg max-w-xl">Limited drops, exclusive bundles, and official gear. Once they're gone, they're gone.</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["All", "Clothing", "Vinyl", "Bundles", "Accessories"].map(cat => (
            <button key={cat} className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all">{cat}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {merchItems.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="group">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-dark-800 mb-3">
                  <div className="absolute inset-0 bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center">
                    <HiShoppingBag className="w-10 h-10 text-white/10" />
                  </div>
                  {item.limited && <div className="absolute top-2 left-2"><span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-semibold uppercase">Limited</span></div>}
                  {item.originalPrice && <div className="absolute top-2 right-2"><span className="px-2 py-0.5 rounded-full bg-red-500/80 text-white text-[10px] font-semibold">-{Math.round((1 - item.price / item.originalPrice) * 100)}%</span></div>}
                  {item.hasCountdown && <div className="absolute bottom-2 left-2 right-2"><span className="flex items-center gap-1 justify-center px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px]"><HiClock className="w-3 h-3" /> Limited Drop</span></div>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="sm" variant="pink" onClick={() => { addItem({ id: item.id, name: item.name, price: item.price, image: item.images[0] }); toast.success("Added to cart!"); }}>Quick Add</Button>
                  </div>
                </div>
                <h3 className="text-white text-sm font-semibold truncate">{item.name}</h3>
                <div className="flex items-center gap-2">
                  {item.originalPrice && <span className="text-white/30 text-xs line-through">${item.originalPrice}</span>}
                  <span className="text-pink-400 text-sm font-semibold">${item.price}</span>
                </div>
                {item.sizes && <p className="text-white/30 text-[10px] mt-0.5">{item.sizes.join(", ")}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
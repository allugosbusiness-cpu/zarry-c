"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { blogPosts } from "@/data/site-data";
import { Button } from "@/components/ui/button";
import { HiArrowLeft, HiCamera } from "react-icons/hi2";

export default function BlogPage() {
  const categories = ["All", "release", "production", "behind-scenes", "playlist", "news"];

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"><HiArrowLeft className="w-4 h-4" /> Back</Link>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">Blog</h1>
          <p className="text-white/40 text-lg max-w-xl">Release notes, behind-the-scenes, production diaries, and more.</p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button key={cat} className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all capitalize">
              {cat === "All" ? "All" : cat.replace("-", " ")}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group cursor-pointer">
              <div className="aspect-video rounded-xl overflow-hidden bg-dark-800 mb-4">
                <div className="w-full h-full bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center">
                  <HiCamera className="w-8 h-8 text-white/10" />
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/30 mb-2">
                <span>{post.date}</span><span>&bull;</span><span>{post.readTime}</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 text-[10px] uppercase">{post.category.replace("-", " ")}</span>
              </div>
              <h3 className="text-white font-semibold group-hover:text-pink-400 transition-colors">{post.title}</h3>
              <p className="text-white/50 text-sm mt-1">{post.excerpt}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {post.tags.map(tag => <span key={tag} className="text-white/20 text-[10px]">#{tag}</span>)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
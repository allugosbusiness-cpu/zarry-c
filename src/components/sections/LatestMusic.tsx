"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { albums } from "@/data/site-data";
import { HiPlay, HiArrowRight } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/lib/store";

export function LatestMusic() {
  const { play } = usePlayerStore();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background ambient glow */}
      <motion.div
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-pink-500 blur-[200px]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <span className="text-pink-400 text-sm font-semibold uppercase tracking-widest">Latest</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2">Music</h2>
          </div>
          <Link href="/music" className="hidden sm:inline-flex items-center gap-2 text-white/50 hover:text-pink-400 text-sm font-medium transition-colors group">
            View All <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Albums Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {albums.slice(0, 3).map((album, i) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link href={`/music/${album.id}`} className="group block perspective-1000">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-dark-800">
                  <Image
                    src={album.cover}
                    alt={album.title}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Hover play button */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-16 h-16 rounded-full bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30"
                    >
                      <HiPlay className="w-7 h-7 text-white ml-0.5" />
                    </motion.div>
                  </div>

                  {/* Type badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium uppercase tracking-wider border border-white/10">
                      {album.type}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-bold text-lg mb-1 group-hover:text-pink-400 transition-colors">
                    {album.title}
                  </h3>
                  <p className="text-white/40 text-sm mb-2">{album.genre.join(" / ")}</p>
                  <div className="flex items-center gap-3 text-xs text-white/30">
                    <span>{album.tracks.length} tracks</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{album.streams} streams</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" size="lg" icon={<HiArrowRight className="w-4 h-4" />}>
            View All Music
          </Button>
        </div>
      </div>
    </section>
  );
}
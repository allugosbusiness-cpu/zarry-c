"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { albums as staticAlbums } from "@/data/site-data";
import { getMusicAlbums, getMusicSingles } from "@/lib/firebase/data/content";
import { Button } from "@/components/ui/button";
import { PayNowButton } from "@/components/ui/paynow-button";
import { HiPlay, HiArrowLeft, HiShoppingCart, HiMusicalNote } from "react-icons/hi2";

export default function MusicPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [singles, setSingles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        const [fetchedAlbums, fetchedSingles] = await Promise.all([
          getMusicAlbums(),
          getMusicSingles(),
        ]);
        setAlbums(fetchedAlbums);
        setSingles(fetchedSingles);
      } catch {
        setAlbums(staticAlbums.filter(a => a.type === "album" || a.type === "ep").sort(
          (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        ));
        setSingles(staticAlbums.filter(a => a.type === "single").sort(
          (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        ));
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  const displayAlbums = loading ? staticAlbums.filter(a => a.type === "album" || a.type === "ep") : albums;
  const displaySingles = loading ? staticAlbums.filter(a => a.type === "single") : singles;

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
            <HiArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">Music</h1>
          <p className="text-white/40 text-lg max-w-xl">Albums, singles, and sounds. Listen, stream, buy, and dive into the catalog.</p>
        </motion.div>

        {/* Albums & EPs */}
        {displayAlbums.length > 0 && (
          <>
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-white mb-6">
              Albums & EPs
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {displayAlbums.map((album, i) => (
                <motion.div key={album.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="group block">
                    <Link href={`/music/${album.id}`}>
                      <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-dark-800">
                        {album.cover ? (
                          <Image src={album.cover} alt={album.title} fill className="object-cover transition-all duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-dark-700 to-dark-900 flex items-center justify-center">
                            <HiMusicalNote className="w-16 h-16 text-white/10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <motion.div whileHover={{ scale: 1.1 }} className="w-16 h-16 rounded-full bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                            <HiPlay className="w-7 h-7 text-white ml-0.5" />
                          </motion.div>
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium uppercase tracking-wider border border-white/10">
                            {album.type}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div>
                      <Link href={`/music/${album.id}`}>
                        <h3 className="text-white font-bold text-lg mb-1 group-hover:text-pink-400 transition-colors">{album.title}</h3>
                      </Link>
                      <p className="text-white/40 text-sm mb-2">{album.genre?.join(" / ") || ""}</p>
                      <div className="flex items-center gap-3 text-xs text-white/30 mb-3">
                        <span>{album.tracks?.length || 0} tracks</span>
                        {album.streams && <><span className="w-1 h-1 rounded-full bg-white/20" /><span>{album.streams} streams</span></>}
                        {album.price && <><span className="w-1 h-1 rounded-full bg-white/20" /><span className="text-pink-400 font-semibold">${album.price}</span></>}
                      </div>
                      <PayNowButton
                        fullWidth
                        amount={album.price || 1}
                        itemName={album.title}
                        description={`${album.type?.toUpperCase() || "ALBUM"} by Zarry C`}
                        icon={<HiShoppingCart className="w-4 h-4" />}
                      >
                        Buy ${album.price} — {album.title}
                      </PayNowButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Singles */}
        {displaySingles.length > 0 && (
          <>
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-white mb-6">
              Singles
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displaySingles.map((single, i) => (
                <motion.div key={single.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="group block">
                    <Link href={`/music/${single.id}`}>
                      <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-dark-800">
                        {single.cover ? (
                          <Image src={single.cover} alt={single.title} fill className="object-cover transition-all duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-dark-700 to-dark-900 flex items-center justify-center">
                            <HiMusicalNote className="w-16 h-16 text-white/10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <motion.div whileHover={{ scale: 1.1 }} className="w-16 h-16 rounded-full bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                            <HiPlay className="w-7 h-7 text-white ml-0.5" />
                          </motion.div>
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium uppercase tracking-wider border border-white/10">
                            {single.type || "single"}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div>
                      <Link href={`/music/${single.id}`}>
                        <h3 className="text-white font-bold text-lg mb-1 group-hover:text-pink-400 transition-colors">{single.title}</h3>
                      </Link>
                      <p className="text-white/40 text-sm mb-2">{single.genre?.join(" / ") || ""}</p>
                      <div className="flex items-center gap-3 text-xs text-white/30 mb-3">
                        <span>{single.tracks?.length || 1} track{single.tracks?.length !== 1 ? "s" : ""}</span>
                        {single.streams && <><span className="w-1 h-1 rounded-full bg-white/20" /><span>{single.streams} streams</span></>}
                        {single.price && <><span className="w-1 h-1 rounded-full bg-white/20" /><span className="text-pink-400 font-semibold">${single.price}</span></>}
                      </div>
                      <PayNowButton
                        fullWidth
                        amount={single.price || 1}
                        itemName={single.title}
                        description={`Single by Zarry C - ${single.title}`}
                        icon={<HiShoppingCart className="w-4 h-4" />}
                      >
                        Buy ${single.price} — {single.title}
                      </PayNowButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && displayAlbums.length === 0 && displaySingles.length === 0 && (
          <div className="text-center py-20">
            <HiMusicalNote className="w-20 h-20 text-white/10 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No music yet</h3>
            <p className="text-white/40">Music will appear here once uploaded.</p>
          </div>
        )}
      </div>
    </div>
  );
}
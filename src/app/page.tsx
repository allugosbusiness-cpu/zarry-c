"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { HeroSection } from "@/components/sections/HeroSection";
import { SocialFeed } from "@/components/sections/SocialFeed";
import { LatestMusic } from "@/components/sections/LatestMusic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PayNowButton } from "@/components/ui/paynow-button";
import { artistInfo, videos as staticVideos, fanClubTiers, merchItems, beats as staticBeats, tourDates, testimonials, blogPosts, playlists } from "@/data/site-data";
import { getBeats, getVideos } from "@/lib/firebase/data/content";
import { getViews, formatViews } from "@/lib/view-tracker";
import { HiPlay, HiArrowRight, HiHeart, HiStar, HiCheck, HiMusicalNote, HiShoppingBag, HiUserGroup, HiCamera, HiSparkles } from "react-icons/hi2";

export default function HomePage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [beats, setBeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredHomeVideo, setHoveredHomeVideo] = useState<string | null>(null);
  const homeVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const homeHoverTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleHomeVideoEnter = useCallback((videoId: string) => {
    if (homeHoverTimeoutRef.current[videoId]) {
      clearTimeout(homeHoverTimeoutRef.current[videoId]);
    }
    homeHoverTimeoutRef.current[videoId] = setTimeout(() => {
      setHoveredHomeVideo(videoId);
      const videoEl = homeVideoRefs.current[videoId];
      if (videoEl) {
        videoEl.muted = true;
        videoEl.currentTime = 0;
        videoEl.play().catch(() => {});
      }
    }, 300);
  }, []);

  const handleHomeVideoLeave = useCallback((videoId: string) => {
    if (homeHoverTimeoutRef.current[videoId]) {
      clearTimeout(homeHoverTimeoutRef.current[videoId]);
    }
    setHoveredHomeVideo(null);
    const videoEl = homeVideoRefs.current[videoId];
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    async function loadContent() {
      try {
        const [fetchedVideos, fetchedBeats] = await Promise.all([
          getVideos(),
          getBeats(),
        ]);
        setVideos(fetchedVideos);
        setBeats(fetchedBeats);
      } catch {
        // Fallback to static data sorted by date
        setVideos([...staticVideos].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
        setBeats([...staticBeats]);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  return (
    <div className="bg-dark-950">
      <HeroSection />

      <SocialFeed />

      {/* Beats Preview with Buy Now */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-dark-900/50">
        <motion.div
          animate={{ opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-pink-500 blur-[200px]"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-pink-400 text-sm font-semibold uppercase tracking-widest">Marketplace</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2">Producer Beats</h2>
            </div>
            <Link href="/beats" className="hidden sm:inline-flex items-center gap-2 text-white/50 hover:text-pink-400 text-sm font-medium transition-colors group">
              Browse All <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(loading ? staticBeats : beats).slice(0, 3).map((beat, i) => (
              <motion.div
                key={beat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, borderColor: "rgba(255,77,166,0.3)" }}
                className="group bg-dark-800/50 hover:bg-dark-800 border border-white/5 rounded-xl p-5 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{beat.title}</h3>
                    <p className="text-white/40 text-xs">{beat.bpm} BPM · {beat.key}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,77,166,0.2)" }}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center cursor-pointer"
                  >
                    <HiPlay className="w-5 h-5 text-white/60 group-hover:text-pink-400 transition-colors" />
                  </motion.div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {beat.tags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-[10px]">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40">{formatViews(getViews(beat.id))} plays</span>
                  {!beat.sold ? (
                    <span className="text-pink-400 font-semibold">${beat.price || 5} All Rights</span>
                  ) : (
                    <span className="text-red-400 font-semibold">Sold</span>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-white/5">
                  <Link href={`/beats`} className="w-full block">
                    <Button variant="outline" size="sm" fullWidth>
                      {beat.sold ? "Sold Out" : `Buy All Rights $${beat.price || 5}`}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Videos Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-pink-400 text-sm font-semibold uppercase tracking-widest">Watch</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2">Featured Videos</h2>
            </div>
            <Link href="/video" className="hidden sm:inline-flex items-center gap-2 text-white/50 hover:text-pink-400 text-sm font-medium transition-colors group">
              View All <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {(loading ? staticVideos : videos).slice(0, 2).map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onMouseEnter={() => handleHomeVideoEnter(video.id)}
                onMouseLeave={() => handleHomeVideoLeave(video.id)}
              >
                <motion.div
                  whileHover={{ rotateY: 3, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group relative aspect-video rounded-2xl overflow-hidden bg-dark-800 cursor-pointer"
                >
                  {/* Main video for hover preview and poster */}
                  <video
                    ref={(el) => { homeVideoRefs.current[video.id] = el; }}
                    src={video.videoUrl}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-10 ${
                      hoveredHomeVideo === video.id ? "opacity-100" : "opacity-30"
                    }`}
                    playsInline
                    muted
                    preload="auto"
                    onError={(e) => console.log("[Home Video] Error loading:", video.videoUrl, e)}
                  />
                  {/* Thumbnail overlay - only shown when a custom thumbnail exists */}
                  {video.thumbnail && (
                    <div className={`absolute inset-0 transition-opacity duration-300 ${
                      hoveredHomeVideo === video.id ? "opacity-0 pointer-events-none" : "opacity-100"
                    }`}>
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300`} />
                  {/* Play button */}
                  {hoveredHomeVideo !== video.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.15 }}
                        className="w-16 h-16 rounded-full bg-pink-500/90 flex items-center justify-center shadow-lg shadow-pink-500/30"
                      >
                        <HiPlay className="w-7 h-7 text-white ml-0.5" />
                      </motion.div>
                    </div>
                  )}
                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex gap-2 flex-wrap z-20">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">{video.duration}</span>
                    {hoveredHomeVideo === video.id && (
                      <span className="px-2.5 py-1 rounded-full bg-pink-500/60 text-white text-xs font-medium animate-pulse">
                        Preview
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
                    <div>
                      <p className="text-white font-semibold text-lg drop-shadow-lg">{video.title}</p>
                      <p className="text-white/60 text-sm">{video.location}</p>
                    </div>
                    {video.buyPrice && (
                      <PayNowButton
                        variant="green"
                        size="sm"
                        amount={video.buyPrice}
                        itemName={video.title}
                        description={`Download ${video.title}`}
                      >
                        Buy ${video.buyPrice}
                      </PayNowButton>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <LatestMusic />

      {/* Fan Club */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-pink-400 text-sm font-semibold uppercase tracking-widest">Community</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 mb-4">Fan Club</h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">Go deeper. Exclusive tracks, direct access, and a front-row seat to the journey.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {fanClubTiers.map((tier, i) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className={`relative rounded-2xl p-6 border transition-all duration-300 ${
                  tier.popular
                    ? "bg-gradient-to-b from-pink-500/10 to-transparent border-pink-500/30 ring-1 ring-pink-500/20"
                    : "bg-dark-800/50 border-white/5 hover:border-white/10"
                }`}
              >
                {tier.popular && (
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[linear-gradient(135deg,#FF4DA6,#FF1493)] text-white text-xs font-semibold"
                  >
                    Most Popular
                  </motion.div>
                )}
                <div className="mb-4">
                  <h3 className="text-white font-bold text-xl mb-1">{tier.name}</h3>
                  <div className="text-3xl font-bold text-white">{tier.priceLabel}</div>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {tier.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-white/60">
                      <HiCheck className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/fan-club">
                  <Button variant={tier.popular ? "pink" : "outline"} fullWidth>
                    {tier.id === "tier-free" ? "Join Free" : "Subscribe"}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Tour Dates */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-pink-400 text-sm font-semibold uppercase tracking-widest">Live</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2">Tour Dates</h2>
            </div>
            <Link href="/tour" className="hidden sm:inline-flex items-center gap-2 text-white/50 hover:text-pink-400 text-sm font-medium transition-colors group">
              All Dates <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="space-y-3 max-w-3xl">
            {tourDates.filter(d => d.status === "upcoming").slice(0, 4).map((date, i) => (
              <motion.div
                key={date.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.03)" }}
                className="flex items-center justify-between bg-dark-800/50 hover:bg-dark-800 border border-white/5 rounded-xl px-5 py-4 transition-all"
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center hidden sm:block"
                  >
                    <div className="text-lg font-bold text-white leading-tight">{new Date(date.date).toLocaleDateString("en-US", { day: "numeric" })}</div>
                    <div className="text-xs text-white/40 uppercase">{new Date(date.date).toLocaleDateString("en-US", { month: "short" })}</div>
                  </motion.div>
                  <div>
                    <p className="text-white font-semibold">{date.city}, {date.country}</p>
                    <p className="text-white/40 text-sm">{date.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {date.vipAvailable && <span className="text-xs text-pink-400 hidden sm:block">VIP</span>}
                  {date.soldOut ? (
                    <Button variant="dark" size="sm" disabled>Sold Out</Button>
                  ) : date.ticketUrl ? (
                    <a href={date.ticketUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="pink" size="sm">Tickets</Button>
                    </a>
                  ) : (
                    <PayNowButton
                      variant="pink"
                      size="sm"
                      amount={date.vipPrice || 20}
                      itemName={`Ticket - ${date.city} (${date.venue})`}
                      description={`Show ticket for ${date.city} on ${new Date(date.date).toLocaleDateString()}`}
                    >
                      Tickets
                    </PayNowButton>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Merch Showcase */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-pink-400 text-sm font-semibold uppercase tracking-widest">Shop</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2">Merch</h2>
            </div>
            <Link href="/merch" className="hidden sm:inline-flex items-center gap-2 text-white/50 hover:text-pink-400 text-sm font-medium transition-colors group">
              Shop All <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {merchItems.slice(0, 4).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer perspective-1000"
              >
                <motion.div
                  whileHover={{ rotateY: 5, scale: 1.02 }}
                  className="relative aspect-square rounded-xl overflow-hidden bg-dark-800 mb-3"
                >
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {item.limited && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-semibold uppercase tracking-wider">Limited</span>
                    </div>
                  )}
                  {item.originalPrice && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded-full bg-red-500/80 text-white text-[10px] font-semibold">-{Math.round((1 - item.price / item.originalPrice) * 100)}%</span>
                    </div>
                  )}
                </motion.div>
                <h3 className="text-white text-sm font-semibold truncate">{item.name}</h3>
                <div className="flex items-center gap-2">
                  {item.originalPrice && <span className="text-white/30 text-xs line-through">${item.originalPrice}</span>}
                  <span className="text-pink-400 text-sm font-semibold">${item.price}</span>
                </div>
                <PayNowButton
                  fullWidth
                  variant="green"
                  size="sm"
                  amount={item.price}
                  itemName={item.name}
                  description={`Merch: ${item.name} (${item.category})`}
                >
                  Buy ${item.price}
                </PayNowButton>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-pink-400 text-sm font-semibold uppercase tracking-widest">Reviews</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2">What People Say</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-dark-800/50 border border-white/5 rounded-xl p-6"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.2, color: "#FF4DA6" }}>
                      <HiStar className="w-4 h-4 text-pink-400" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[linear-gradient(135deg,#FF4DA6,#FF1493)]/30 flex-shrink-0">
                    <Image src={t.avatar} alt={t.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Donate CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.02, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-pink-500 blur-[150px]"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <HiHeart className="w-16 h-16 text-pink-400 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Support the Movement</h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
              Your support fuels the music, videos, and art. Every contribution helps create more.
            </p>
            <Link href="/donate">
              <Button variant="pink" size="xl" icon={<HiHeart className="w-5 h-5" />}>
                Donate Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-pink-400 text-sm font-semibold uppercase tracking-widest">Journal</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2">Latest News</h2>
            </div>
            <Link href="/blog" className="hidden sm:inline-flex items-center gap-2 text-white/50 hover:text-pink-400 text-sm font-medium transition-colors group">
              All Posts <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.slice(0, 3).map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-800 mb-4">
                  <Image src={post.image} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-3 text-xs text-white/30 mb-2">
                  <span>{post.date}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>{post.readTime}</span>
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 text-[10px] uppercase">{post.category.replace("-", " ")}</span>
                </div>
                <h3 className="text-white font-semibold group-hover:text-pink-400 transition-colors">{post.title}</h3>
                <p className="text-white/50 text-sm mt-1">{post.excerpt}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-pink-500/5 to-dark-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <motion.h2
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
            >
              Ready for the next wave?
            </motion.h2>
            <p className="text-xl text-white/40 mb-8 max-w-xl mx-auto">
              New music. New visuals. New drops. The journey continues.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/music">
                <Button variant="pink" size="xl" icon={<HiMusicalNote className="w-5 h-5" />}>
                  Listen Now
                </Button>
              </Link>
              <Link href="/fan-club">
                <Button variant="outline" size="xl" icon={<HiUserGroup className="w-5 h-5" />}>
                  Join Free
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
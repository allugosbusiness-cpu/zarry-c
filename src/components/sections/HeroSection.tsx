"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { artistInfo, streamsCount, followersCount, videoViewsCount } from "@/data/site-data";
import { HiPlay, HiEye, HiUserGroup, HiShoppingBag, HiHeart } from "react-icons/hi2";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const stats = [
    { icon: HiPlay, value: streamsCount, label: "Total Streams" },
    { icon: HiUserGroup, value: followersCount, label: "Followers" },
    { icon: HiEye, value: videoViewsCount, label: "Video Views" },
  ];

  // Floating particles - use state to hydrate on client only
  const [particles, setParticles] = useState<Array<{id: number; x: number; y: number; size: number; duration: number; delay: number}>>([]);
  
  useEffect(() => {
    setParticles(Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    })));
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden bg-dark-950">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 100, 0, -80, 0], y: [0, -60, 120, 60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-pink-500/15 blur-[150px]"
        />
        <motion.div
          animate={{ x: [0, -100, 60, 120, 0], y: [0, 120, -60, -100, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-pink-600/10 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1, 1.15, 1], opacity: [0.2, 0.5, 0.2, 0.4, 0.2] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-500/8 blur-[100px]"
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-pink-400/20"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{
              y: [0, -30, 0, 20, 0],
              x: [0, 20, -20, 10, 0],
              opacity: [0.2, 0.8, 0.3, 0.6, 0.2],
            }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
          />
        ))}
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div style={{ y: contentY, opacity }} className="order-2 lg:order-1">
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse-soft" />
                New EP Out Now
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-4"
            >
              Zarry C
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600 leading-[1.2] tracking-tight mb-6"
            >
              Listen. Watch. Join the inner circle.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-xl md:text-2xl text-white/40 font-light italic mb-8"
            >
              &ldquo;{artistInfo.tagline}&rdquo;
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap gap-3 mb-12"
            >
              <Link href="/music">
                <Button variant="pink" size="xl" icon={<HiPlay className="w-5 h-5" />}>
                  Listen / Watch
                </Button>
              </Link>
              <Link href="/fan-club">
                <Button variant="outline" size="xl" icon={<HiUserGroup className="w-5 h-5" />}>
                  Join Fan Club
                </Button>
              </Link>
              <Link href="/merch">
                <Button variant="dark" size="xl" icon={<HiShoppingBag className="w-5 h-5" />}>
                  Shop Merch
                </Button>
              </Link>
              <Link href="/donate">
                <Button variant="outline" size="xl" icon={<HiHeart className="w-5 h-5" />}>
                  Donate
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-6 sm:gap-8"
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base sm:text-lg">{stat.value}</p>
                    <p className="text-white/40 text-xs">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Artist Image with 3D Animation */}
          <motion.div
            style={{ scale: imageScale, y: imageY }}
            className="order-1 lg:order-2 relative flex items-center justify-center -mt-8 sm:-mt-12 lg:-mt-16"
          >
            {/* Glow behind image */}
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[400px] h-[400px] rounded-full bg-pink-500/20 blur-[80px]"
            />

            {/* Image container with 3D tilt — circular frame */}
            <motion.div
              className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[420px] lg:h-[420px]"
              animate={{
                y: [0, -15, 0],
                rotateY: [0, 5, 0, -5, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Circular frame decoration */}
              <div className="absolute inset-0 rounded-full border-2 border-pink-500/30 bg-gradient-to-b from-pink-500/10 to-pink-600/5 p-1.5">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={artistInfo.heroImage}
                    alt="Zarry C"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 280px, 420px"
                  />
                  {/* Gradient overlay for depth */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-dark-950/40 via-transparent to-transparent" />
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -top-2 -right-2 px-4 py-2 rounded-full bg-pink-500 text-white text-xs font-bold shadow-lg shadow-pink-500/30 z-10"
              >
                Tafemerana EP
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-2 -left-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white text-xs font-bold z-10"
              >
                4.2M+ Streams
              </motion.div>
            </motion.div>

            {/* Orbiting ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-[400px] h-[400px] sm:w-[480px] sm:h-[480px] lg:w-[560px] lg:h-[560px] rounded-full border border-pink-500/10"
            >
              <motion.div
                className="absolute -top-2 left-1/2 w-4 h-4 rounded-full bg-pink-400 shadow-lg shadow-pink-500/50"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-3 bg-pink-400 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
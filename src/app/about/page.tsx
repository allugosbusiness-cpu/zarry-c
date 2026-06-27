"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { artistInfo, faqs, testimonials } from "@/data/site-data";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { HiArrowLeft, HiHeart, HiEnvelope, HiArrowDownTray, HiStar } from "react-icons/hi2";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"><HiArrowLeft className="w-4 h-4" /> Back</Link>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">About</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Bio */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold text-white mb-4">The Story</h2>
            <p className="text-white/60 leading-relaxed mb-6">{artistInfo.bio}</p>
            <p className="text-white/60 leading-relaxed mb-6">Justice Zari is an independent force in music and visual arts — producing genre-blending tracks, directing cinematic visuals, and capturing stories through the lens. From the streets of Harare to stages worldwide, the mission is simple: create without limits.</p>
            <p className="text-pink-400 text-lg font-medium italic mb-8">&ldquo;{artistInfo.tagline}&rdquo;</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="pink" icon={<HiArrowDownTray className="w-4 h-4" />}>Download EPK</Button>
              <Button variant="outline" icon={<HiEnvelope className="w-4 h-4" />}>{artistInfo.email}</Button>
            </div>
          </motion.div>

          {/* Photo placeholder */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5"
          >
            <Image 
              src={artistInfo.artistAnotherPose} 
              alt="Zarry C Portrait" 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Image src={artistInfo.logo} alt="ZARRY C" width={40} height={40} className="object-contain" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Testimonials */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20">
          <h2 className="text-2xl font-bold text-white mb-6">Press & Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={t.id} className="bg-dark-800/50 border border-white/5 rounded-xl p-6">
                <div className="flex gap-1 mb-3">{[...Array(t.rating)].map((_, j) => <HiStar key={j} className="w-4 h-4 text-pink-400" />)}</div>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#FF4DA6,#FF1493)]/30 flex items-center justify-center text-white text-sm font-bold">{t.name[0]}</div>
                  <div><p className="text-white text-sm font-semibold">{t.name}</p><p className="text-white/40 text-xs">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20" id="faq">
          <h2 className="text-2xl font-bold text-white mb-6">FAQ</h2>
          <div className="space-y-3 max-w-3xl">
            {faqs.map((faq, i) => (
              <details key={faq.id} className="group bg-dark-800/50 border border-white/5 rounded-xl overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer text-white font-medium hover:text-pink-400 transition-colors flex items-center justify-between">
                  {faq.question}
                  <span className="text-white/30 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 py-4 border-t border-white/5">
                  <p className="text-white/60 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20" id="contact">
          <h2 className="text-2xl font-bold text-white mb-6">Contact</h2>
          <div className="bg-dark-800/50 border border-white/5 rounded-2xl p-8 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input placeholder="Name" className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 text-sm" />
              <input placeholder="Email" className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 text-sm" />
            </div>
            <select className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white/60 focus:outline-none focus:border-pink-500/50 text-sm mb-4">
              <option>Select subject</option>
              <option>Booking</option>
              <option>Sync Licensing</option>
              <option>Press</option>
              <option>General</option>
            </select>
            <textarea placeholder="Message" rows={4} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 text-sm mb-4" />
            <Button variant="pink" size="lg" fullWidth>Send Message</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { videographyPackages } from "@/data/site-data";
import { Button } from "@/components/ui/button";
import { HiArrowLeft, HiCheck, HiCamera, HiVideoCamera, HiMusicalNote } from "react-icons/hi2";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"><HiArrowLeft className="w-4 h-4" /> Back</Link>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">Videography & Photography</h1>
          <p className="text-white/40 text-lg max-w-2xl">Professional videography, photography, and music video production. Based in Harare, available worldwide.</p>
        </motion.div>

        {/* Services offered */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: HiVideoCamera, label: "Music Videos", desc: "Concept to final cut" },
            { icon: HiCamera, label: "Events", desc: "Weddings, brands, shows" },
            { icon: HiMusicalNote, label: "Production", desc: "Editing, color, sound" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-dark-800/50 border border-white/5 rounded-xl p-6 text-center">
              <s.icon className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold">{s.label}</h3>
              <p className="text-white/40 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {videographyPackages.map((pkg, i) => (
            <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`relative rounded-2xl p-6 border transition-all ${pkg.popular ? "bg-gradient-to-b from-pink-500/10 to-transparent border-pink-500/30 ring-1 ring-pink-500/20" : "bg-dark-800/50 border-white/5 hover:border-white/10"}`}>
              {pkg.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[linear-gradient(135deg,#FF4DA6,#FF1493)] text-white text-xs font-semibold">Popular</div>}
              <h3 className="text-white font-bold text-lg mb-1">{pkg.name}</h3>
              <p className="text-white/40 text-xs mb-1">{pkg.duration}</p>
              <div className="text-3xl font-bold text-white mb-4">${pkg.price}</div>
              <p className="text-white/50 text-sm mb-4">{pkg.description}</p>
              <ul className="space-y-2 mb-6">
                {pkg.deliverables.map(d => (
                  <li key={d} className="flex items-start gap-2 text-sm text-white/60"><HiCheck className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />{d}</li>
                ))}
              </ul>
              <div className="text-xs text-white/30 mb-4">Turnaround: {pkg.turnaround}</div>
              <Button variant={pkg.popular ? "pink" : "outline"} fullWidth>Book Now</Button>
            </motion.div>
          ))}
        </div>

        {/* Contact form preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-2xl bg-dark-800/50 border border-white/5 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Book a Session</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input placeholder="Name" className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 transition-colors text-sm" />
            <input placeholder="Email" className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 transition-colors text-sm" />
          </div>
          <select className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white/60 focus:outline-none focus:border-pink-500/50 transition-colors text-sm mb-4">
            <option>Select package</option>
            {videographyPackages.map(p => <option key={p.id}>{p.name} - ${p.price}</option>)}
          </select>
          <textarea placeholder="Tell me about your project..." rows={4} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 transition-colors text-sm mb-4" />
          <Button variant="pink" size="lg" fullWidth>Send Inquiry</Button>
        </motion.div>
      </div>
    </div>
  );
}
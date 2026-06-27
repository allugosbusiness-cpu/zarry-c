"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { tourDates } from "@/data/site-data";
import { Button } from "@/components/ui/button";
import { PayNowButton } from "@/components/ui/paynow-button";
import { HiArrowLeft, HiMapPin, HiCalendarDays, HiUserGroup } from "react-icons/hi2";

export default function TourPage() {
  const upcoming = tourDates.filter(d => d.status === "upcoming");
  const past = tourDates.filter(d => d.status === "past");

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"><HiArrowLeft className="w-4 h-4" /> Back</Link>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">Tour</h1>
          <p className="text-white/40 text-lg max-w-xl">Upcoming shows, VIP packages, and past performances.</p>
        </motion.div>

        {upcoming.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><HiCalendarDays className="w-5 h-5 text-pink-400" /> Upcoming Dates</h2>
            <div className="space-y-3 mb-16">
              {upcoming.map((date, i) => (
                <motion.div key={date.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between bg-dark-800/50 hover:bg-dark-800 border border-white/5 rounded-xl px-5 py-4 transition-all">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center hidden sm:block">
                      <div className="text-lg font-bold text-white leading-tight">{new Date(date.date).toLocaleDateString("en-US", { day: "numeric" })}</div>
                      <div className="text-xs text-white/40 uppercase">{new Date(date.date).toLocaleDateString("en-US", { month: "short" })}</div>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{date.city}, {date.country}</p>
                      <p className="text-white/40 text-sm">{date.venue}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    {date.vipAvailable && <span className="text-xs text-pink-400 hidden sm:block">VIP ${date.vipPrice}</span>}
                    {date.meetAndGreet && <span className="text-xs text-white/40 hidden sm:block">M&G</span>}
                    {date.soldOut ? (
                      <Button variant="dark" size="sm" disabled>Sold Out</Button>
                    ) : date.ticketUrl ? (
                      <a href={date.ticketUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="pink" size="sm">Tickets</Button>
                      </a>
                    ) : (
                      <PayNowButton variant="pink" size="sm" amount={date.vipPrice || 20}
                        itemName={`${date.city} Show Ticket - ${date.venue}`}
                        description={`Ticket for ${date.city} at ${date.venue} on ${new Date(date.date).toLocaleDateString()}`}>
                        Tickets
                      </PayNowButton>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* VIP CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2"><HiUserGroup className="w-6 h-6 text-pink-400" /> VIP Experience</h2>
          <p className="text-white/50 mb-6 max-w-lg mx-auto">Meet & greet, early entry, exclusive merch, and more. Upgrade your show experience.</p>
          <Button variant="pink" size="lg">View VIP Packages</Button>
        </motion.div>

        {past.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-white mb-4 text-white/40">Past Shows</h2>
            <div className="space-y-2">
              {past.map((date, i) => (
                <div key={date.id} className="flex items-center justify-between bg-dark-800/30 border border-white/5 rounded-xl px-5 py-3 opacity-60">
                  <div className="flex items-center gap-4">
                    <p className="text-white font-semibold">{date.city}, {date.country}</p>
                    <p className="text-white/40 text-sm">{date.venue}</p>
                  </div>
                  <span className="text-white/30 text-xs">{new Date(date.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
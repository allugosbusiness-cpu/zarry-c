"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { artistInfo } from "@/data/site-data";
import { FaInstagram, FaTwitter, FaYoutube, FaSpotify, FaSoundcloud, FaTiktok, FaFacebook } from "react-icons/fa";
import { HiHeart } from "react-icons/hi";

const footerLinks = [
  { label: "Music", href: "/music" },
  { label: "Video", href: "/video" },
  { label: "Merch", href: "/merch" },
  { label: "Fan Club", href: "/fan-club" },
  { label: "Beats", href: "/beats" },
  { label: "Tour", href: "/tour" },
  { label: "Services", href: "/services" },
  { label: "Donate", href: "/donate" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/about#contact" },
];

const socialLinks = [
  { icon: FaInstagram, href: artistInfo.socials.instagram, label: "Instagram" },
  { icon: FaTwitter, href: artistInfo.socials.twitter, label: "Twitter" },
  { icon: FaYoutube, href: artistInfo.socials.youtube, label: "YouTube" },
  { icon: FaSpotify, href: artistInfo.socials.spotify, label: "Spotify" },
  { icon: FaSoundcloud, href: artistInfo.socials.soundcloud, label: "SoundCloud" },
  { icon: FaTiktok, href: artistInfo.socials.tiktok, label: "TikTok" },
  { icon: FaFacebook, href: artistInfo.socials.facebook, label: "Facebook" },
];

export function Footer() {
  return (
    <footer className="relative bg-dark-900 border-t border-white/5 pt-16 pb-8">
      <div className="noise-bg absolute inset-0" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                <Image src={artistInfo.logo} alt="ZARRY C" width={36} height={36} className="object-contain w-full h-full" />
              </div>
              <span className="font-bold text-xl text-white">{artistInfo.brand}</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              {artistInfo.bio}
            </p>
            <p className="text-pink-400 text-sm font-medium italic">
              &ldquo;{artistInfo.tagline}&rdquo;
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-pink-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={`mailto:${artistInfo.email}`}
                  className="text-white/50 hover:text-pink-400 text-sm transition-colors"
                >
                  {artistInfo.email}
                </a>
              </li>
            </ul>
            <h3 className="text-white font-semibold mb-4 mt-6 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-white/50 hover:text-pink-400 text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-white/50 hover:text-pink-400 text-sm transition-colors">Terms of Service</Link></li>
              <li><Link href="/licensing" className="text-white/50 hover:text-pink-400 text-sm transition-colors">Licensing</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Follow</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-pink-500/20 flex items-center justify-center text-white/60 hover:text-pink-400 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <div className="mt-6">
              <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Support</h3>
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-full text-sm font-medium transition-all duration-200"
              >
                <HiHeart className="w-4 h-4" />
                Support the Movement
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} {artistInfo.brand}. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">
            Made with <span className="text-pink-400">&hearts;</span> in Zimbabwe
          </p>
        </div>
      </div>
    </footer>
  );
}
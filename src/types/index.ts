export interface Album {
  id: string;
  title: string;
  releaseDate: string;
  cover: string;
  type: 'album' | 'single' | 'ep';
  genre: string[];
  tracks: Track[];
  streams: string;
  price?: number;
  buyUrl: string;
  streamUrls: StreamUrls;
  credits: string;
  lyrics?: string;
  stemsAvailable: boolean;
  stemsPrice?: number;
  preSaveUrl?: string;
  color: string;
}

export interface Track {
  id: string;
  title: string;
  duration: string;
  featured?: string;
  plays?: string;
  audioUrl: string;
  bpm?: number;
  key?: string;
  mood?: string;
  price?: number;
}

export interface StreamUrls {
  spotify?: string;
  appleMusic?: string;
  soundcloud?: string;
  youtube?: string;
  deezer?: string;
  tidal?: string;
}

export interface Video {
  id: string;
  title: string;
  type: 'music-video' | 'videography' | 'behind-scenes' | 'live';
  thumbnail: string;
  videoUrl: string;
  duration: string;
  date: string;
  category: string[];
  buyPrice?: number;
  description: string;
  location?: string;
}

export interface MerchItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  category: 'clothing' | 'accessories' | 'vinyl' | 'poster' | 'bundle';
  sizes?: string[];
  colors?: string[];
  limited: boolean;
  limitedCount?: number;
  soldCount?: number;
  dropDate?: string;
  hasCountdown: boolean;
  waitlistAvailable: boolean;
  bundleItems?: string[];
}

export interface FanClubTier {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
  messageLimit: number;
  exclusiveContent: boolean;
  earlyAccess: boolean;
  bidAccess: boolean;
}

export interface Beat {
  id: string;
  title: string;
  bpm: number;
  key: string;
  genre: string[];
  mood: string[];
  tags: string[];
  duration: string;
  previewUrl: string;
  audioUrl: string;
  plays: number;
  price: number;
  sold: boolean;
  downloadUrl: string;
}

export interface BeatLicense {
  type: 'basic' | 'premium' | 'exclusive';
  name: string;
  price: number;
  description: string;
  terms: string[];
  delivery: string;
}

export interface TourDate {
  id: string;
  date: string;
  city: string;
  venue: string;
  country: string;
  ticketUrl: string;
  soldOut: boolean;
  vipAvailable: boolean;
  vipPrice?: number;
  meetAndGreet: boolean;
  status: 'upcoming' | 'past' | 'cancelled';
}

export interface VideographyPackage {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  deliverables: string[];
  turnaround: string;
  popular?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: 'release' | 'behind-scenes' | 'production' | 'playlist' | 'news';
  image: string;
  tags: string[];
  readTime: string;
  author: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  image: string;
  genre: string;
  mood: string;
  tracks: string[];
  trackCount: number;
  totalDuration: string;
}

export interface Bid {
  id: string;
  beatId: string;
  bidder: string;
  amount: number;
  timestamp: string;
  anonymous: boolean;
  message?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

export interface DonationTier {
  id: string;
  amount: number;
  label: string;
  description: string;
  popular?: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}
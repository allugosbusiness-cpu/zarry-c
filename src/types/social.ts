export interface SocialPost {
  id: string;
  platform: 'youtube' | 'spotify' | 'soundcloud';
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  url: string;
  publishedAt: string;
  duration?: string;
  views?: string;
  platformId: string;
}

export interface SocialFeedState {
  posts: SocialPost[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}
import { create } from 'zustand';

interface PlayerState {
  currentTrack: { id: string; title: string; artist: string; audioUrl: string; duration: string; cover?: string } | null;
  isPlaying: boolean;
  volume: number;
  queue: Array<{ id: string; title: string; artist: string; audioUrl: string; duration: string; cover?: string }>;
  queueOpen: boolean;
  play: (track: { id: string; title: string; artist: string; audioUrl: string; duration: string; cover?: string }) => void;
  pause: () => void;
  resume: () => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: { id: string; title: string; artist: string; audioUrl: string; duration: string; cover?: string }) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  next: () => void;
  prev: () => void;
  toggleQueue: () => void;
  closeQueue: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.75,
  queue: [],
  queueOpen: false,
  play: (track) => set({ currentTrack: track, isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  removeFromQueue: (id) => set((state) => ({ queue: state.queue.filter(t => t.id !== id) })),
  clearQueue: () => set({ queue: [] }),
  next: () => {
    const { queue, currentTrack } = get();
    if (queue.length > 0) {
      const nextTrack = queue[0];
      set({ currentTrack: nextTrack, isPlaying: true, queue: queue.slice(1) });
    }
  },
  prev: () => {
    // Simple prev - could implement history in future
  },
  toggleQueue: () => set((state) => ({ queueOpen: !state.queueOpen })),
  closeQueue: () => set({ queueOpen: false }),
}));

interface UIState {
  cartOpen: boolean;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  theme: 'dark' | 'light';
  toggleCart: () => void;
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  toggleTheme: () => void;
  closeCart: () => void;
  closeMobileMenu: () => void;
  closeSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
  theme: 'dark',
  toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  closeCart: () => set({ cartOpen: false }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
}));

interface CartState {
  items: Array<{ id: string; name: string; price: number; quantity: number; image: string; size?: string; color?: string }>;
  addItem: (item: { id: string; name: string; price: number; quantity?: number; image: string; size?: string; color?: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.id === item.id && i.size === item.size && i.color === item.color);
    if (existing) {
      return {
        items: state.items.map(i =>
          i.id === item.id && i.size === item.size && i.color === item.color
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        ),
      };
    }
    return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] };
  }),
  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(i => i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i),
  })),
  clearCart: () => set({ items: [] }),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
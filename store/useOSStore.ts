// store/useOSStore.ts
// This file manages ALL the data for the OS.
// Think of it as the OS's memory/brain.
// Any component can read from or write to this store.

import { create } from 'zustand';
import { DEFAULTS } from '@/config/themes';
const { openApp, addNotification } = useOSStore();

// A "Window" is one open app instance on screen
export interface OSWindow {
  id: number;          // Unique ID for this window
  appId: string;       // Which app is inside (e.g. 'browser', 'gaming')
  title: string;       // Text shown in title bar
  emoji: string;       // Icon in title bar
  color: string;       // App accent color
  x: number;           // Horizontal position on desktop (pixels from left)
  y: number;           // Vertical position on desktop (pixels from top)
  width: number;       // Window width in pixels
  height: number;      // Window height in pixels
  zIndex: number;      // Stack order — higher = in front
  minimized: boolean;  // Is it hidden in taskbar?
  maximized: boolean;  // Is it fullscreen?
  isNew: boolean;      // Used to trigger open animation
}

// A "Notification" is a popup message at bottom-right
export interface Notification {
  id: number;
  message: string;
  icon: string;
}

// The complete shape of our OS state
interface OSState {
  // ─── WINDOWS ──────────────────────────────────────
  windows: OSWindow[];
  activeWindowId: number | null;   // Which window has focus
  nextWindowId: number;            // Counter for unique IDs
  nextZIndex: number;              // Counter for stack order

  // ─── DESKTOP ──────────────────────────────────────
  wallpaperIndex: number;          // Which wallpaper is active
  accentColor: string;             // Active accent color (hex)
  accentName: string;              // Active accent name (text)
  launcherOpen: boolean;           // Is app launcher visible?
  currentTime: Date;               // Clock

  // ─── NOTIFICATIONS ────────────────────────────────
  notifications: Notification[];
  nextNotifId: number;

  // ─── APP DATA ─────────────────────────────────────
  terminalLines: Array<{ type: 'sys' | 'cmd' | 'output'; text: string }>;
  aiMessages: Array<{ role: 'user' | 'ai'; text: string }>;
  notesContent: string;
  browserUrl: string;

  // ─── ACTIONS (functions that change the state) ─────
  openApp: (appId: string, title: string, emoji: string, color: string, w: number, h: number) => void;
  closeWindow: (id: number) => void;
  minimizeWindow: (id: number) => void;
  maximizeWindow: (id: number) => void;
  focusWindow: (id: number) => void;
  moveWindow: (id: number, x: number, y: number) => void;
  resizeWindow: (id: number, w: number, h: number) => void;

  setWallpaper: (index: number) => void;
  setAccent: (color: string, name: string) => void;
  toggleLauncher: () => void;
  setTime: (date: Date) => void;

  addNotification: (message: string, icon: string) => void;
  removeNotification: (id: number) => void;

  addTerminalLine: (type: 'sys' | 'cmd' | 'output', text: string) => void;
  clearTerminal: () => void;
  addAIMessage: (role: 'user' | 'ai', text: string) => void;
  setNotesContent: (content: string) => void;
  setBrowserUrl: (url: string) => void;
}

export const useOSStore = create<OSState>((set, get) => ({
  // ─── INITIAL STATE ─────────────────────────────────
  windows: [],
  activeWindowId: null,
  nextWindowId: 1,
  nextZIndex: 10,

  wallpaperIndex: DEFAULTS.wallpaperIndex,
  accentColor: DEFAULTS.accentColor,
  accentName: DEFAULTS.accentName,
  launcherOpen: false,
  currentTime: new Date(),

  notifications: [],
  nextNotifId: 1,

  terminalLines: [
    { type: 'sys', text: 'Troy Terminal v3.2.1 — type "help" for commands' },
  ],
  aiMessages: [
    { role: 'ai', text: 'I\'m Troy AI. How can I assist you today?' },
    { role: 'ai', text: 'Do you need help with homework?' },
    { role: 'ai', text: 'Powered by Claude API' },
    { role: 'ai', text: 'hola como estas brochacho' },
  ],
  notesContent: '# Welcome to Notes\n\nStart typing your thoughts here...',
  browserUrl: '',

  // ─── WINDOW ACTIONS ────────────────────────────────

  openApp: (appId, title, emoji, color, w, h) => {
    const { windows, nextWindowId, nextZIndex } = get();

    // If app is already open, just focus it instead of opening a new one
    const existing = windows.find(win => win.appId === appId && !win.minimized);
    if (existing) {
      get().focusWindow(existing.id);
      return;
    }

    // Offset each new window slightly so they don't stack exactly on top
    const offset = windows.filter(win => !win.minimized).length * 24;

    const newWindow: OSWindow = {
      id: nextWindowId,
      appId,
      title,
      emoji,
      color,
      x: Math.min(80 + offset, 300),   // Don't go too far right
      y: Math.min(50 + offset, 200),   // Don't go too far down
      width: w,
      height: h,
      zIndex: nextZIndex,
      minimized: false,
      maximized: false,
      isNew: true,                      // Triggers open animation
    };

    set(state => ({
      windows: [...state.windows, newWindow],
      nextWindowId: state.nextWindowId + 1,
      nextZIndex: state.nextZIndex + 1,
      activeWindowId: nextWindowId,
      launcherOpen: false,             // Close launcher when app opens
    }));

    // Remove the "isNew" flag after animation completes (250ms)
    setTimeout(() => {
      set(state => ({
        windows: state.windows.map(win =>
          win.id === nextWindowId ? { ...win, isNew: false } : win
        ),
      }));
    }, 300);
  },

  closeWindow: (id) => set(state => ({
    windows: state.windows.filter(win => win.id !== id),
    activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
  })),

  minimizeWindow: (id) => set(state => ({
    windows: state.windows.map(win =>
      win.id === id ? { ...win, minimized: !win.minimized } : win
    ),
    activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
  })),

  maximizeWindow: (id) => set(state => ({
    windows: state.windows.map(win => {
      if (win.id !== id) return win;
      return { ...win, maximized: !win.maximized };
    }),
  })),

  focusWindow: (id) => set(state => ({
    windows: state.windows.map(win =>
      win.id === id
        ? { ...win, zIndex: state.nextZIndex, minimized: false }
        : win
    ),
    activeWindowId: id,
    nextZIndex: state.nextZIndex + 1,
  })),

  moveWindow: (id, x, y) => set(state => ({
    windows: state.windows.map(win =>
      win.id === id ? { ...win, x, y } : win
    ),
  })),

  resizeWindow: (id, w, h) => set(state => ({
    windows: state.windows.map(win =>
      win.id === id ? { ...win, width: w, height: h } : win
    ),
  })),

  // ─── DESKTOP ACTIONS ───────────────────────────────

  setWallpaper: (index) => set({ wallpaperIndex: index }),
  setAccent: (color, name) => set({ accentColor: color, accentName: name }),
  toggleLauncher: () => set(state => ({ launcherOpen: !state.launcherOpen })),
  setTime: (date) => set({ currentTime: date }),

  // ─── NOTIFICATION ACTIONS ──────────────────────────

  addNotification: (message, icon) => {
    const id = get().nextNotifId;
    set(state => ({
      notifications: [...state.notifications, { id, message, icon }],
      nextNotifId: state.nextNotifId + 1,
    }));
    // Auto-remove after 3.5 seconds
    setTimeout(() => get().removeNotification(id), 3500);
  },

  removeNotification: (id) => set(state => ({
    notifications: state.notifications.filter(n => n.id !== id),
  })),

  // ─── APP DATA ACTIONS ──────────────────────────────

  addTerminalLine: (type, text) => set(state => ({
    terminalLines: [...state.terminalLines, { type, text }],
  })),

  clearTerminal: () => set({ terminalLines: [] }),

  addAIMessage: (role, text) => set(state => ({
    aiMessages: [...state.aiMessages, { role, text }],
  })),

  setNotesContent: (content) => set({ notesContent: content }),
  setBrowserUrl: (url) => set({ browserUrl: url }),
}));
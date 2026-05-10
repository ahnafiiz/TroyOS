// store/useOSStore.ts
import { create } from 'zustand';
import { DEFAULTS } from '@/config/themes';

export interface OSWindow {
  id: number;
  appId: string;
  title: string;
  emoji: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  isNew: boolean;
}

export interface Notification {
  id: number;
  message: string;
  icon: string;
}

export interface IconPosition {
  appId: string;
  x: number;
  y: number;
}

export type CustomWallpaper = {
  id: string;
  name: string;
  type: 'image' | 'video';
  objectUrl: string;
} | null;

interface OSState {
  windows: OSWindow[];
  activeWindowId: number | null;
  nextWindowId: number;
  nextZIndex: number;

  wallpaperIndex: number;
  customWallpaper: CustomWallpaper;   // null = use preset
  accentColor: string;
  accentName: string;
  launcherOpen: boolean;
  currentTime: Date;

  notifications: Notification[];
  nextNotifId: number;

  terminalLines: Array<{ type: 'sys' | 'cmd' | 'output'; text: string }>;
  aiMessages: Array<{ role: 'user' | 'ai'; text: string }>;
  notesContent: string;
  browserUrl: string;

  iconPositions: IconPosition[];

  openApp: (appId: string, title: string, emoji: string, color: string, w: number, h: number) => void;
  closeWindow: (id: number) => void;
  minimizeWindow: (id: number) => void;
  maximizeWindow: (id: number) => void;
  focusWindow: (id: number) => void;
  moveWindow: (id: number, x: number, y: number) => void;
  resizeWindow: (id: number, w: number, h: number) => void;

  setWallpaper: (index: number) => void;
  setCustomWallpaper: (wp: CustomWallpaper) => void;
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

  setIconPosition: (appId: string, x: number, y: number) => void;
  resetIconPositions: () => void;
}

export const useOSStore = create<OSState>((set, get) => ({
  windows: [],
  activeWindowId: null,
  nextWindowId: 1,
  nextZIndex: 10,

  wallpaperIndex: DEFAULTS.wallpaperIndex,
  customWallpaper: null,
  accentColor: DEFAULTS.accentColor,
  accentName: DEFAULTS.accentName,
  launcherOpen: false,
  currentTime: new Date(),

  notifications: [],
  nextNotifId: 1,

  terminalLines: [{ type: 'sys', text: 'Troy Terminal v3.2.1 — type "help" for commands' }],
  aiMessages: [],
  notesContent: '# Welcome to Notes\n\nStart typing your thoughts here...',
  browserUrl: '',
  iconPositions: [],

  openApp: (appId, title, emoji, color, w, h) => {
    const { windows, nextWindowId, nextZIndex } = get();
    const existing = windows.find(win => win.appId === appId && !win.minimized);
    if (existing) { get().focusWindow(existing.id); return; }
    const offset = windows.filter(win => !win.minimized).length * 24;
    const newWindow: OSWindow = {
      id: nextWindowId, appId, title, emoji, color,
      x: Math.min(80 + offset, 300), y: Math.min(50 + offset, 200),
      width: w, height: h, zIndex: nextZIndex,
      minimized: false, maximized: false, isNew: true,
    };
    set(state => ({
      windows: [...state.windows, newWindow],
      nextWindowId: state.nextWindowId + 1,
      nextZIndex: state.nextZIndex + 1,
      activeWindowId: nextWindowId,
      launcherOpen: false,
    }));
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
    windows: state.windows.map(win =>
      win.id !== id ? win : { ...win, maximized: !win.maximized }
    ),
  })),

  focusWindow: (id) => set(state => ({
    windows: state.windows.map(win =>
      win.id === id ? { ...win, zIndex: state.nextZIndex, minimized: false } : win
    ),
    activeWindowId: id,
    nextZIndex: state.nextZIndex + 1,
  })),

  moveWindow: (id, x, y) => set(state => ({
    windows: state.windows.map(win => win.id === id ? { ...win, x, y } : win),
  })),

  resizeWindow: (id, w, h) => set(state => ({
    windows: state.windows.map(win => win.id === id ? { ...win, width: w, height: h } : win),
  })),

  setWallpaper: (index) => set({ wallpaperIndex: index, customWallpaper: null }),
  setCustomWallpaper: (wp) => set({ customWallpaper: wp }),
  setAccent: (color, name) => set({ accentColor: color, accentName: name }),
  toggleLauncher: () => set(state => ({ launcherOpen: !state.launcherOpen })),
  setTime: (date) => set({ currentTime: date }),

  addNotification: (message, icon) => {
    const id = get().nextNotifId;
    set(state => ({
      notifications: [...state.notifications, { id, message, icon }],
      nextNotifId: state.nextNotifId + 1,
    }));
    setTimeout(() => get().removeNotification(id), 3500);
  },

  removeNotification: (id) => set(state => ({
    notifications: state.notifications.filter(n => n.id !== id),
  })),

  addTerminalLine: (type, text) => set(state => ({
    terminalLines: [...state.terminalLines, { type, text }],
  })),
  clearTerminal: () => set({ terminalLines: [] }),

  addAIMessage: (role, text) => set(state => ({
    aiMessages: [...state.aiMessages, { role, text }],
  })),

  setNotesContent: (content) => set({ notesContent: content }),
  setBrowserUrl: (url) => set({ browserUrl: url }),

  setIconPosition: (appId, x, y) => set(state => {
    const exists = state.iconPositions.find(p => p.appId === appId);
    if (exists) {
      return { iconPositions: state.iconPositions.map(p => p.appId === appId ? { ...p, x, y } : p) };
    }
    return { iconPositions: [...state.iconPositions, { appId, x, y }] };
  }),

  resetIconPositions: () => set({ iconPositions: [] }),
}));
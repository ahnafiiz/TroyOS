'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULTS } from '@/config/themes';

// ─── Interfaces ──────────────────────────────────────────────────────────
export interface OSWindow {
  id: string;          
  appId: string;       
  name: string;
  emoji: string;
  color: string;
  width: number;
  height: number;
  x: number;
  y: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

export interface Notification {
  id: number;
  message: string;
  icon: string;
}

interface IconPosition {
  appId: string;
  x: number;
  y: number;
}

interface OSState {
  // ─── WINDOWS & NAVIGATION STATE ───
  windows: OSWindow[];
  activeWindowId: string | null;
  nextWindowId: number;
  nextZIndex: number;
  launcherOpen: boolean;
  currentTime: Date;
  notifications: Notification[];
  nextNotifId: number;
  iconPositions: IconPosition[];

  // ─── APP STATE ───
  terminalLines: Array<{ type: 'sys' | 'user' | 'error'; text: string }>;
  aiMessages: Array<{ role: 'user' | 'assistant'; text: string }>;
  notesContent: string;
  browserUrl: string;

  // ─── CUSTOMIZATION STATE ───
  wallpaperIndex: number;
  customWallpaper: string | null;         
  wallpaperStyle: 'fill' | 'fit' | 'tile' | 'stretch';
  customBackgroundGradient: string | null; 
  customBackgroundColor: string | null;    

  // Themes & Accents
  accentColor: string;
  accentName: string;
  isDarkMode: boolean;

  // Taskbar / Dock Settings
  dockPosition: 'bottom' | 'top' | 'left' | 'right';
  dockSize: 'small' | 'medium' | 'large';
  dockAutoHide: boolean;
  uiOpacity: number;
  uiBlur: number;
  uiBorderRadius: number;

  // Typography Settings
  systemFontFamily: string;
  systemFontSize: number; 
  systemFontWeight: '300' | '400' | '500' | '600' | '700' | '800';

  // System Sounds & Effects
  systemSoundsEnabled: boolean;
  systemVolume: number; 

  // Clock Settings
  clockSettings: {
    type: 'hud' | 'glass' | 'retro' | 'minimal';
    color: string;
    glowColor: string;
    use24Hour: boolean;
    fontFamily?: string;
    fontSize?: number;
  };

  // ─── ACTIONS ────────────────────────────────────────────────────────────
  setTime: (time: Date) => void;
  openApp: (
    appId: string, 
    name: string, 
    emoji: string, 
    color: string, 
    defaultWidth?: number, 
    defaultHeight?: number
  ) => void;
  closeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  toggleMinimize: (windowId: string) => void;
  toggleMaximize: (windowId: string) => void;
  updateWindowPosition: (windowId: string, x: number, y: number) => void;
  updateWindowSize: (windowId: string, width: number, height: number) => void;
  setLauncherOpen: (open: boolean) => void;
  toggleLauncher: () => void;
  setIconPosition: (appId: string, x: number, y: number) => void;
  resetIconPositions: () => void;
  addNotification: (message: string, icon?: string) => void;
  removeNotification: (id: number) => void;
  setClockSettings: (settings: Partial<OSState['clockSettings']>) => void;
  setNotesContent: (content: string) => void;
  addAIMessage: (role: 'user' | 'ai', text: string) => void;
  addTerminalLine: (type: 'sys' | 'user' | 'error', text: string) => void;

  // Customization Setters
  setWallpaperIndex: (index: number) => void;
  setCustomWallpaper: (wallpaperUrl: string | null) => void;
  setWallpaperStyle: (style: 'fill' | 'fit' | 'tile' | 'stretch') => void;
  setCustomBackgroundGradient: (gradient: string | null) => void;
  setCustomBackgroundColor: (color: string | null) => void;
  setAccentColor: (hexColor: string, name?: string) => void;
  setIsDarkMode: (enabled: boolean) => void;
  setDockPosition: (pos: 'bottom' | 'top' | 'left' | 'right') => void;
  setDockSize: (size: 'small' | 'medium' | 'large') => void;
  setDockAutoHide: (enabled: boolean) => void;
  setUIOpacity: (opacity: number) => void;
  setUIBlur: (blur: number) => void;
  setUIBorderRadius: (radius: number) => void;
  setSystemFontFamily: (font: string) => void;
  setSystemFontSize: (size: number) => void;
  setSystemFontWeight: (weight: '300' | '400' | '500' | '600' | '700' | '800') => void;
  setSystemSoundsEnabled: (enabled: boolean) => void;
  setSystemVolume: (volume: number) => void;
}

// ─── Store Definition ────────────────────────────────────────────────────
export const useOSStore = create<OSState>()(
  persist(
    (set, get) => ({
      // --- Initial State ---
      windows: [],
      activeWindowId: null,
      nextWindowId: 1,
      nextZIndex: 10,
      launcherOpen: false,
      currentTime: new Date(),
      notifications: [],
      nextNotifId: 1,
      iconPositions: [],

      // App Histories
      terminalLines: [{ type: 'sys', text: 'Nexus OS v2.0.4 — type "help"' }],
      aiMessages: [],
      notesContent: '# Welcome\nStart typing...',
      browserUrl: 'https://google.com',

      // Customization Initial State
      wallpaperIndex: DEFAULTS.wallpaperIndex ?? 0,
      customWallpaper: null,
      wallpaperStyle: 'fill',
      customBackgroundGradient: null,
      customBackgroundColor: null,
      accentColor: DEFAULTS.accentColor ?? '#3b82f6',
      accentName: DEFAULTS.accentName ?? 'Blue',
      isDarkMode: true,
      dockPosition: 'bottom',
      dockSize: 'medium',
      dockAutoHide: false,
      uiOpacity: 0.85,
      uiBlur: 20,
      uiBorderRadius: 16,
      systemFontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      systemFontSize: 13,
      systemFontWeight: '500',
      systemSoundsEnabled: true,
      systemVolume: 80,
      clockSettings: {
        type: 'hud',
        color: '#ffffff',
        glowColor: 'rgba(255,255,255,0.2)',
        use24Hour: true,
      },

      // --- Actions ---
      setTime: (time) => set({ currentTime: time }),

      openApp: (appId, name, emoji, color, defaultWidth = 600, defaultHeight = 450) => {
        const state = get();
        const windows = state.windows ?? [];
        
        const existingWindow = windows.find(w => w.appId === appId);
        if (existingWindow) {
          set((state) => ({
            activeWindowId: existingWindow.id,
            windows: (state.windows ?? []).map(w => 
              w.id === existingWindow.id 
                ? { ...w, isMinimized: false, zIndex: state.nextZIndex } 
                : w
            ),
            nextZIndex: state.nextZIndex + 1,
            launcherOpen: false
          }));
          return;
        }

        const newWindowId = `${appId}-${state.nextWindowId}`;
        const offsetMultiplier = windows.length % 6;
        const defaultX = 120 + offsetMultiplier * 28;
        const defaultY = 100 + offsetMultiplier * 28;

        const newWindow: OSWindow = {
          id: newWindowId,
          appId,
          name,
          emoji,
          color,
          width: defaultWidth,
          height: defaultHeight,
          x: defaultX,
          y: defaultY,
          zIndex: state.nextZIndex,
          isMinimized: false,
          isMaximized: false
        };

        set((state) => ({
          windows: [...(state.windows ?? []), newWindow],
          activeWindowId: newWindowId,
          nextWindowId: state.nextWindowId + 1,
          nextZIndex: state.nextZIndex + 1,
          launcherOpen: false
        }));
      },

      closeWindow: (windowId) => set((state) => {
        const windows = state.windows ?? [];
        const remainingWindows = windows.filter(w => w.id !== windowId);
        const nextActive = remainingWindows.reduce<OSWindow | null>((highest, win) => {
          if (win.isMinimized) return highest;
          if (!highest || win.zIndex > highest.zIndex) return win;
          return highest;
        }, null);

        return {
          windows: remainingWindows,
          activeWindowId: nextActive ? nextActive.id : null
        };
      }),

      focusWindow: (windowId) => set((state) => {
        if (state.activeWindowId === windowId) return {};
        const windows = state.windows ?? [];
        return {
          activeWindowId: windowId,
          nextZIndex: state.nextZIndex + 1,
          windows: windows.map(w => 
            w.id === windowId 
              ? { ...w, zIndex: state.nextZIndex, isMinimized: false } 
              : w
          )
        };
      }),

      toggleMinimize: (windowId) => set((state) => {
        const windows = state.windows ?? [];
        const window = windows.find(w => w.id === windowId);
        if (!window) return {};

        const willMinimize = !window.isMinimized;
        let nextActiveId = state.activeWindowId;

        if (willMinimize && state.activeWindowId === windowId) {
          const visibleWindows = windows.filter(w => w.id !== windowId && !w.isMinimized);
          const nextActive = visibleWindows.reduce<OSWindow | null>((highest, win) => {
            if (!highest || win.zIndex > highest.zIndex) return win;
            return highest;
          }, null);
          nextActiveId = nextActive ? nextActive.id : null;
        } else if (!willMinimize) {
          nextActiveId = windowId;
        }

        return {
          activeWindowId: nextActiveId,
          nextZIndex: willMinimize ? state.nextZIndex : state.nextZIndex + 1,
          windows: windows.map(w => 
            w.id === windowId 
              ? { 
                  ...w, 
                  isMinimized: willMinimize, 
                  zIndex: willMinimize ? w.zIndex : state.nextZIndex 
                } 
              : w
          )
        };
      }),

      toggleMaximize: (windowId) => set((state) => ({
        windows: (state.windows ?? []).map(w => 
          w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
        )
      })),

      updateWindowPosition: (windowId, x, y) => set((state) => ({
        windows: (state.windows ?? []).map(w => 
          w.id === windowId ? { ...w, x, y } : w
        )
      })),

      updateWindowSize: (windowId, width, height) => set((state) => ({
        windows: (state.windows ?? []).map(w => 
          w.id === windowId ? { ...w, width, height } : w
        )
      })),

      setLauncherOpen: (open) => set({ launcherOpen: open }),

      toggleLauncher: () => set((state) => ({ launcherOpen: !state.launcherOpen })),

      setIconPosition: (appId, x, y) => set((state) => {
        const iconPositions = state.iconPositions ?? [];
        const filtered = iconPositions.filter(p => p.appId !== appId);
        return {
          iconPositions: [...filtered, { appId, x, y }]
        };
      }),

      resetIconPositions: () => set(() => {
        const defaultAppIds = ['pc', 'browser', 'terminal', 'notes', 'ai', 'settings'];
        const defaultLayout = defaultAppIds.map((appId, index) => ({
          appId,
          x: 24,
          y: 24 + index * 96, 
        }));
        return { iconPositions: defaultLayout };
      }),

      addNotification: (message, icon = '🔔') => set((state) => {
        const notifications = state.notifications ?? [];
        const newNotif = { id: state.nextNotifId, message, icon };
        return {
          notifications: [newNotif, ...notifications],
          nextNotifId: state.nextNotifId + 1
        };
      }),

      removeNotification: (id) => set((state) => ({
        notifications: (state.notifications ?? []).filter(n => n.id !== id)
      })),

      setClockSettings: (settings) => set((state) => ({ 
        clockSettings: { ...state.clockSettings, ...settings } 
      })),

      setNotesContent: (content) => set({ notesContent: content }),

      addAIMessage: (role, text) => set((state) => {
        const messages = state.aiMessages ?? [];
        const mappedRole = role === 'ai' ? 'assistant' : 'user';
        return {
          aiMessages: [...messages, { role: mappedRole, text }]
        };
      }),

      addTerminalLine: (type, text) => set((state) => ({
        terminalLines: [...(state.terminalLines ?? []), { type, text }]
      })),

      // ─── CUSTOMIZATION SETTERS ───
      setWallpaperIndex: (index) => set({ 
        wallpaperIndex: index, 
        customWallpaper: null, 
        customBackgroundGradient: null, 
        customBackgroundColor: null 
      }),
      setCustomWallpaper: (wallpaperUrl) => set({ 
        customWallpaper: wallpaperUrl, 
        customBackgroundGradient: null, 
        customBackgroundColor: null 
      }),
      setWallpaperStyle: (style) => set({ wallpaperStyle: style }),
      setCustomBackgroundGradient: (gradient) => set({ 
        customBackgroundGradient: gradient, 
        customWallpaper: null, 
        customBackgroundColor: null 
      }),
      setCustomBackgroundColor: (color) => set({ 
        customBackgroundColor: color, 
        customWallpaper: null, 
        customBackgroundGradient: null 
      }),
      setAccentColor: (hexColor, name = 'Custom') => set({ accentColor: hexColor, accentName: name }),
      setIsDarkMode: (enabled) => set({ isDarkMode: enabled }),
      setDockPosition: (pos) => set({ dockPosition: pos }),
      setDockSize: (size) => set({ dockSize: size }),
      setDockAutoHide: (enabled) => set({ dockAutoHide: enabled }),
      setUIOpacity: (opacity) => set({ uiOpacity: opacity }),
      setUIBlur: (blur) => set({ uiBlur: blur }),
      setUIBorderRadius: (radius) => set({ uiBorderRadius: radius }),
      setSystemFontFamily: (font) => set({ systemFontFamily: font }),
      setSystemFontSize: (size) => set({ systemFontSize: size }),
      setSystemFontWeight: (weight) => set({ systemFontWeight: weight }),
      setSystemSoundsEnabled: (enabled) => set({ systemSoundsEnabled: enabled }),
      setSystemVolume: (volume) => set({ systemVolume: volume }),
    }),
    {
      name: 'nexus-os-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : (null as any))),
      partialize: (state) => ({ 
        windows: state.windows,          
        activeWindowId: state.activeWindowId, 
        nextWindowId: state.nextWindowId,     
        nextZIndex: state.nextZIndex,         
        iconPositions: state.iconPositions,
        wallpaperIndex: state.wallpaperIndex,
        customWallpaper: state.customWallpaper,
        wallpaperStyle: state.wallpaperStyle,
        customBackgroundGradient: state.customBackgroundGradient,
        customBackgroundColor: state.customBackgroundColor,
        accentColor: state.accentColor,
        accentName: state.accentName,
        isDarkMode: state.isDarkMode,
        dockPosition: state.dockPosition,
        dockSize: state.dockSize,
        dockAutoHide: state.dockAutoHide,
        uiOpacity: state.uiOpacity,
        uiBlur: state.uiBlur,
        uiBorderRadius: state.uiBorderRadius,
        systemFontFamily: state.systemFontFamily,
        systemFontSize: state.systemFontSize,
        systemFontWeight: state.systemFontWeight,
        systemSoundsEnabled: state.systemSoundsEnabled,
        systemVolume: state.systemVolume,
        clockSettings: state.clockSettings,
        notesContent: state.notesContent,
        aiMessages: state.aiMessages,
        terminalLines: state.terminalLines,
      }),
    }
  )
);
import { create } from "zustand";
import { persist } from "zustand/middleware";

/* TYPES (unchanged) */
export const OS_VERSION = "3.7.2";
export const OS_BUILD = "20-05-2026";

export interface WindowState {
  id: string;
  title: string;
  appId: string;
  name?: string;
  emoji?: string;
  color?: string;
  width?: number;
  height?: number;
  minimized?: boolean;
  maximized?: boolean;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  icon?: string;
}

export interface ClockSettings {
  showSeconds: boolean;
  militaryTime: boolean;
  showDate: boolean;
  dateFormat: string;
  type?: string;
  color?: string;
  glowColor?: string;
  use24Hour?: boolean;
  fontSize?: number;
}

export interface Theme {
  id: number;
  name: string;
  wallpaper: string;
  gradient?: string;
  color?: string;
}

/* TERMINAL */

export interface TerminalLine {
  type: "system" | "input" | "output" | "error" | "user" | "sys";
  text: string;
}

/* AI CHAT */

export interface AIMessage {
  role: "user" | "assistant";
  text: string;
}

/* TYPES */

export type ThemeMode =
  | "dark"
  | "light"
  | "system"
  | "glass"
  | "neon"
  | "aero";

export type DockPosition = "bottom" | "left" | "right" | "top";

export type DockStyle =
  | "glass"
  | "solid"
  | "minimal"
  | "transparent"
  | "pill";

export type UIStyleProfile =
  | "default"
  | "compact"
  | "aero"
  | "flat"
  | "neo-brutalism"
  | "cyberpunk"
  | "minimalist";

export type FontTransformStyle =
  | "none"
  | "uppercase"
  | "lowercase"
  | "capitalize";

export type CursorStyle =
  | "default"
  | "pointer"
  | "crosshair"
  | "none"
  | "dot";

export type LauncherPosition =
  | "left"
  | "center"
  | "bottom-left"
  | "bottom-right"
  | "top-left";

export type NotificationPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

export type WindowAnimationCurve =
  | "smooth"
  | "slide"
  | "fade"
  | "snappy"
  | "retro-pop";

/* ─────────────────────────────────────────────────────────────────────────── */
/* STORE INTERFACE                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

export interface OSState {
  /* WINDOWS */
  windows: WindowState[];

  openApp: (id: string, meta?: Partial<WindowState>) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;

  activeWindowId: string | null;
  setActiveWindowId: (id: string | null) => void;

  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;

  updateWindowPosition: (
    id: string,
    position: { x: number; y: number }
  ) => void;

  updateWindowSize: (
    id: string,
    size: { width: number; height: number }
  ) => void;

  /* TERMINAL */
  terminalLines: TerminalLine[];
  addTerminalLine: (type: TerminalLine["type"], text: string) => void;
  clearTerminal: () => void;

  /* AI CHAT */
  aiMessages: AIMessage[];
  addAIMessage: (role: "user" | "assistant", text: string) => void;
  clearAIMessages: () => void;

  /* LAUNCHER */
  launcherOpen: boolean;
  toggleLauncher: () => void;

  launcherPosition: LauncherPosition;
  setLauncherPosition: (pos: LauncherPosition) => void;

  /* CLOCK */
  currentTime: Date;
  setTime: (time: Date) => void;

  clockSettings: ClockSettings;
  setClockSettings: (settings: Partial<ClockSettings>) => void;

  /* WALLPAPER */
  wallpaperIndex: number;
  setWallpaperIndex: (index: number) => void;

  customWallpaper: string | null;
  setCustomWallpaper: (wallpaper: string | null) => void;

  savedWallpapers: string[];
  setSavedWallpapers: (wallpapers: string[]) => void;
  addSavedWallpaper: (wallpaper: string) => void;
  removeSavedWallpaper: (wallpaper: string) => void;

  customBackgroundGradient: string;
  customBackgroundColor: string;
  setCustomBackgroundGradient: (value: string) => void;
  setCustomBackgroundColor: (value: string) => void;

  wallpaperStyle: string;
  setWallpaperStyle: (style: string) => void;

  desktopIconLabelsVisible: boolean;
  setDesktopIconLabelsVisible: (value: boolean) => void;

  desktopIconLabelSize: number;
  setDesktopIconLabelSize: (size: number) => void;

  taskbarOpacity: number;
  setTaskbarOpacity: (value: number) => void;

  launcherOpacity: number;
  setLauncherOpacity: (value: number) => void;

  /* THEME */
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;

  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;

  accentColor: string;
  setAccentColor: (color: string) => void;

  /* ── NEW: Global icon colour ─────────────────────────────────────────── */
  /**
   * Hex colour applied to every SVG icon via CSS filter.
   * Defaults to white (#ffffff) so icons are visible on dark backgrounds.
   */
  iconColor: string;
  setIconColor: (color: string) => void;
  /* ─────────────────────────────────────────────────────────────────────── */

  /* TASKBAR */
  taskbarHeight: number;
  setTaskbarHeight: (height: number) => void;

  dockAutoHide: boolean;
  setDockAutoHide: (value: boolean) => void;

  dockPosition: DockPosition;
  setDockPosition: (pos: DockPosition) => void;

  dockStyle: DockStyle;
  setDockStyle: (style: DockStyle) => void;

  dockSize: number;
  setDockSize: (size: number) => void;

  /* UI */
  systemFontFamily: string;
  setSystemFontFamily: (font: string) => void;

  systemFontSize: number;
  setSystemFontSize: (size: number) => void;

  systemFontWeight: number;
  setSystemFontWeight: (weight: number) => void;

  uiBorderRadius: number;
  setUiBorderRadius: (radius: number) => void;

  titlebarHeight: number;
  setTitlebarHeight: (height: number) => void;

  uiOpacity: number;
  setUiOpacity: (opacity: number) => void;

  uiBlur: number;
  setUiBlur: (blur: number) => void;

  uiStyleProfile: UIStyleProfile;
  setUiStyleProfile: (profile: UIStyleProfile) => void;

  windowAnimationCurve: WindowAnimationCurve;
  setWindowAnimationCurve: (curve: WindowAnimationCurve) => void;

  fontTransformStyle: FontTransformStyle;
  setFontTransformStyle: (style: FontTransformStyle) => void;

  cursorStyle: CursorStyle;
  setCursorStyle: (style: CursorStyle) => void;

  iconSize: number;
  setIconSize: (size: number) => void;

  snapToGridEnabled: boolean;
  setSnapToGridEnabled: (value: boolean) => void;

  clockPosition: { x: number; y: number };
  setClockPosition: (position: { x: number; y: number }) => void;

  notificationPosition: NotificationPosition;
  setNotificationPosition: (position: NotificationPosition) => void;

  showDesktopGrid: boolean;
  setShowDesktopGrid: (value: boolean) => void;

  desktopGridOpacity: number;
  setDesktopGridOpacity: (value: number) => void;

  desktopGridColor: string;
  setDesktopGridColor: (value: string) => void;

  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;

  particleEffects: boolean;
  setParticleEffects: (value: boolean) => void;

  windowBorderGlow: boolean;
  setWindowBorderGlow: (value: boolean) => void;

  /* DESKTOP ICONS */
  iconPositions: Record<string, { x: number; y: number }>;
  setIconPosition: (id: string, position: { x: number; y: number }) => void;

  /* ICONS */
  iconImages: Record<string, string>;
  setIconImage: (id: string, image: string) => void;
  removeIconImage: (id: string) => void;

  /* NOTIFICATIONS */
  notifications: NotificationItem[];
  addNotification: (title: string, message: string, icon?: string) => void;
  removeNotification: (id: string) => void;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* STORE IMPLEMENTATION                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */

export const useOSStore = create<OSState>()(
  persist(
    (set) => ({

      /* WINDOWS */
      windows: [],
      openApp: (id, meta) =>
        set((state) => {
          const existing = state.windows.find((w) => w.id === id);

          if (existing) {
            return {
              windows: state.windows.map((w) =>
                w.id === id ? { ...w, minimized: false, ...meta } : w
              ),
              activeWindowId: id,
            };
          }

          return {
            windows: [
              ...state.windows,
              {
                id,
                appId: id,
                title: meta?.name ?? id,
                minimized: false,
                maximized: false,
                ...meta,
              },
            ],
            activeWindowId: id,
          };
        }),

      closeWindow: (id) =>
        set((state) => ({
          windows: state.windows.filter((w) => w.id !== id),
          activeWindowId:
            state.activeWindowId === id ? null : state.activeWindowId,
        })),

      focusWindow: (id) =>
        set({
          activeWindowId: id,
        }),

      activeWindowId: null,
      setActiveWindowId: (id) => set({ activeWindowId: id }),

      toggleMinimize: (id) =>
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, minimized: !w.minimized } : w
          ),
        })),

      toggleMaximize: (id) =>
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, maximized: !w.maximized } : w
          ),
        })),

      updateWindowPosition: (id, position) =>
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, position } : w
          ),
        })),

      updateWindowSize: (id, size) =>
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, size } : w
          ),
        })),

      /* TERMINAL */
      terminalLines: [],
      addTerminalLine: (type, text) =>
        set((state) => ({
          terminalLines: [...state.terminalLines, { type, text }],
        })),
      clearTerminal: () => set({ terminalLines: [] }),

      /* AI CHAT */
      aiMessages: [],
      addAIMessage: (role, text) =>
        set((state) => ({
          aiMessages: [...state.aiMessages, { role, text }],
        })),
      clearAIMessages: () => set({ aiMessages: [] }),

      /* LAUNCHER */
      launcherOpen: false,
      toggleLauncher: () =>
        set((state) => ({ launcherOpen: !state.launcherOpen })),

      launcherPosition: "center",
      setLauncherPosition: (pos) => set({ launcherPosition: pos }),

      /* CLOCK */
      currentTime: new Date(),
      setTime: (time) => set({ currentTime: time }),

      clockSettings: {
        showSeconds: true,
        militaryTime: false,
        showDate: true,
        dateFormat: "DD/MM/YYYY",
        type: "hud",
        color: "#ffffff",
        glowColor: "#60a5fa33",
        use24Hour: false,
        fontSize: 52,
      },
      setClockSettings: (settings) =>
        set((state) => ({
          clockSettings: { ...state.clockSettings, ...settings },
        })),

      /* WALLPAPER */
      wallpaperIndex: 0,
      setWallpaperIndex: (index) => set({ wallpaperIndex: index }),

      customWallpaper: null,
      setCustomWallpaper: (wallpaper) => set({ customWallpaper: wallpaper }),

      savedWallpapers: [],
      setSavedWallpapers: (wallpapers) => set({ savedWallpapers: wallpapers }),

      addSavedWallpaper: (wallpaper) =>
        set((state) => ({
          savedWallpapers: state.savedWallpapers.includes(wallpaper)
            ? state.savedWallpapers
            : [...state.savedWallpapers, wallpaper],
        })),

      removeSavedWallpaper: (wallpaper) =>
        set((state) => ({
          savedWallpapers: state.savedWallpapers.filter(
            (item) => item !== wallpaper
          ),
        })),

      customBackgroundGradient:
        "linear-gradient(to bottom right, #0f172a, #1e293b)",

      customBackgroundColor: "#0f172a",

      setCustomBackgroundGradient: (value) =>
        set({ customBackgroundGradient: value }),

      setCustomBackgroundColor: (value) =>
        set({ customBackgroundColor: value }),

      wallpaperStyle: "cover",
      setWallpaperStyle: (style) => set({ wallpaperStyle: style }),

      desktopIconLabelsVisible: true,
      setDesktopIconLabelsVisible: (value) =>
        set({ desktopIconLabelsVisible: value }),

      desktopIconLabelSize: 11,
      setDesktopIconLabelSize: (size) =>
        set({ desktopIconLabelSize: size }),

      taskbarOpacity: 0.82,
      setTaskbarOpacity: (value) => set({ taskbarOpacity: value }),

      launcherOpacity: 0.96,
      setLauncherOpacity: (value) => set({ launcherOpacity: value }),

      /* THEME */
      isDarkMode: true,
      setIsDarkMode: (value) => set({ isDarkMode: value }),

      themeMode: "dark",
      setThemeMode: (mode) =>
        set({
          themeMode: mode,
          isDarkMode: mode !== "light",
        }),

      accentColor: "#60a5fa",
      setAccentColor: (color) => set({ accentColor: color }),

      /* ── Global icon colour ─────────────────────────────────────────── */
      iconColor: "#ffffff",
      setIconColor: (color) => set({ iconColor: color }),
      /* ─────────────────────────────────────────────────────────────────── */

      /* TASKBAR */
      taskbarHeight: 56,
      setTaskbarHeight: (height) => set({ taskbarHeight: height }),

      dockAutoHide: false,
      setDockAutoHide: (value) => set({ dockAutoHide: value }),

      dockPosition: "bottom",
      setDockPosition: (pos) => set({ dockPosition: pos }),

      dockStyle: "glass",
      setDockStyle: (style) => set({ dockStyle: style }),

      dockSize: 56,
      setDockSize: (size) => set({ dockSize: size }),

      /* UI */
      systemFontFamily: "Inter",
      setSystemFontFamily: (font) => set({ systemFontFamily: font }),

      systemFontSize: 14,
      setSystemFontSize: (size) => set({ systemFontSize: size }),

      systemFontWeight: 400,
      setSystemFontWeight: (weight) => set({ systemFontWeight: weight }),

      uiBorderRadius: 16,
      setUiBorderRadius: (radius) => set({ uiBorderRadius: radius }),

      titlebarHeight: 40,
      setTitlebarHeight: (height) => set({ titlebarHeight: height }),

      uiOpacity: 0.75,
      setUiOpacity: (opacity) => set({ uiOpacity: opacity }),

      uiBlur: 20,
      setUiBlur: (blur) => set({ uiBlur: blur }),

      uiStyleProfile: "default",
      setUiStyleProfile: (profile) => set({ uiStyleProfile: profile }),

      windowAnimationCurve: "smooth",
      setWindowAnimationCurve: (curve) =>
        set({ windowAnimationCurve: curve }),

      fontTransformStyle: "none",
      setFontTransformStyle: (style) => set({ fontTransformStyle: style }),

      cursorStyle: "default",
      setCursorStyle: (style) => set({ cursorStyle: style }),

      iconSize: 56,          // ← reduced from 72 (was too large)
      setIconSize: (size) => set({ iconSize: size }),

      snapToGridEnabled: true,
      setSnapToGridEnabled: (value) => set({ snapToGridEnabled: value }),

      clockPosition: { x: 900, y: 100 },
      setClockPosition: (position) => set({ clockPosition: position }),

      notificationPosition: "top-right",
      setNotificationPosition: (position) =>
        set({ notificationPosition: position }),

      showDesktopGrid: false,
      setShowDesktopGrid: (value) => set({ showDesktopGrid: value }),

      desktopGridOpacity: 0.12,
      setDesktopGridOpacity: (value) =>
        set({ desktopGridOpacity: value }),

      desktopGridColor: "#ffffff",
      setDesktopGridColor: (value) =>
        set({ desktopGridColor: value }),

      reducedMotion: false,
      setReducedMotion: (value) => set({ reducedMotion: value }),

      particleEffects: true,
      setParticleEffects: (value) => set({ particleEffects: value }),

      windowBorderGlow: true,
      setWindowBorderGlow: (value) =>
        set({ windowBorderGlow: value }),

      /* ICONS */
      iconPositions: {},
      setIconPosition: (id, position) =>
        set((state) => ({
          iconPositions: {
            ...state.iconPositions,
            [id]: position,
          },
        })),

      iconImages: {
        // apps
        ai: "/icons/apps/ai.svg",
        browser: "/icons/apps/browser.svg",
        files: "/icons/apps/files.svg",
        games: "/icons/apps/games.svg",
        notes: "/icons/apps/notes.svg",
        settings: "/icons/apps/settings.svg",
        terminal: "/icons/apps/terminal.svg",

        // system ui
        appsB: "/icons/sui/apps-button.svg",
        clock: "/icons/sui/clock.svg",
        close: "/icons/sui/close.svg",
        cursorE: "/icons/sui/cursor-expand.svg",
        cursorM: "/icons/sui/cursor-move.svg",
        home: "/icons/sui/home.svg",
        tabs: "/icons/sui/laptop-tabs.svg",
        maximise: "/icons/sui/apps-button.svg",
        minimise: "/icons/sui/minimize.svg",
        palette: "/icons/sui/palette.svg",
        newW: "/icons/sui/new-window.svg",
        redo: "/icons/sui/redo.svg",
        undo: "/icons/sui/undo.svg",
        send: "/icons/sui/up-send.svg",
        sync: "/icons/sui/update-refresh.svg",
      },

      setIconImage: (id, image) =>
        set((state) => ({
          iconImages: {
            ...state.iconImages,
            [id]: image,
          },
        })),

      removeIconImage: (id) =>
        set((state) => {
          const updated = { ...state.iconImages };
          delete updated[id];
          return { iconImages: updated };
        }),

      /* NOTIFICATIONS */
      notifications: [],
      addNotification: (title, message, icon) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              id: crypto.randomUUID(),
              title,
              message,
              icon,
            },
          ],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    { name: "troy-os-store" }
  )
);
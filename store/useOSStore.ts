import { create } from "zustand";

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

export type WindowAnimationCurve =
  | "smooth"
  | "slide"
  | "fade"
  | "snappy"
  | "retro-pop";

/* STORE */

export interface OSState {
  /* WINDOWS */
  windows: WindowState[];

  openApp: (id: string) => void;
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

  addTerminalLine: (
    type: TerminalLine["type"],
    text: string
  ) => void;

  clearTerminal: () => void;

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

  customBackgroundGradient: string;
  customBackgroundColor: string;

  wallpaperStyle: string;
  setWallpaperStyle: (style: string) => void;

  /* THEME */

  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;

  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;

  accentColor: string;
  setAccentColor: (color: string) => void;

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
  setWindowAnimationCurve: (
    curve: WindowAnimationCurve
  ) => void;

  fontTransformStyle: FontTransformStyle;
  setFontTransformStyle: (
    style: FontTransformStyle
  ) => void;

  cursorStyle: CursorStyle;
  setCursorStyle: (style: CursorStyle) => void;

  iconSize: number;
  setIconSize: (size: number) => void;

  showDesktopGrid: boolean;
  setShowDesktopGrid: (value: boolean) => void;

  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;

  particleEffects: boolean;
  setParticleEffects: (value: boolean) => void;

  windowBorderGlow: boolean;
  setWindowBorderGlow: (value: boolean) => void;

  /* DESKTOP ICONS */

  iconPositions: Record<
    string,
    { x: number; y: number }
  >;

  setIconPosition: (
    id: string,
    position: { x: number; y: number }
  ) => void;

  /* NOTIFICATIONS */

  notifications: NotificationItem[];

  addNotification: (
    title: string,
    message: string,
    icon?: string
  ) => void;

  removeNotification: (id: string) => void;
}

/* STORE */

export const useOSStore = create<OSState>((set) => ({
  /* WINDOWS */

  windows: [],

  openApp: (id) =>
    set((state) => {
      const existing = state.windows.find(
        (w) => w.id === id
      );

      if (existing) {
        return {
          windows: state.windows.map((w) =>
            w.id === id
              ? { ...w, minimized: false }
              : w
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
            title: id,
            minimized: false,
            maximized: false,
          },
        ],
        activeWindowId: id,
      };
    }),

  closeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter(
        (w) => w.id !== id
      ),
      activeWindowId:
        state.activeWindowId === id
          ? null
          : state.activeWindowId,
    })),

  focusWindow: (id) =>
    set((state) => ({
      activeWindowId: id,
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, minimized: false }
          : w
      ),
    })),

  activeWindowId: null,

  setActiveWindowId: (id) =>
    set({ activeWindowId: id }),

  toggleMinimize: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, minimized: !w.minimized }
          : w
      ),
    })),

  toggleMaximize: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, maximized: !w.maximized }
          : w
      ),
    })),

  updateWindowPosition: (id, position) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, position }
          : w
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
      terminalLines: [
        ...state.terminalLines,
        {
          type,
          text,
        },
      ],
    })),

  clearTerminal: () =>
    set({
      terminalLines: [],
    }),

  /* LAUNCHER */

  launcherOpen: false,

  toggleLauncher: () =>
    set((state) => ({
      launcherOpen: !state.launcherOpen,
    })),

  launcherPosition: "center",

  setLauncherPosition: (pos) =>
    set({ launcherPosition: pos }),

  /* CLOCK */

  currentTime: new Date(),

  setTime: (time) =>
    set({ currentTime: time }),

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
      clockSettings: {
        ...state.clockSettings,
        ...settings,
      },
    })),

  /* WALLPAPER */

  wallpaperIndex: 0,

  setWallpaperIndex: (index) =>
    set({ wallpaperIndex: index }),

  customWallpaper: null,

  setCustomWallpaper: (wallpaper) =>
    set({ customWallpaper: wallpaper }),

  customBackgroundGradient:
    "linear-gradient(to bottom right, #0f172a, #1e293b)",

  customBackgroundColor: "#0f172a",

  wallpaperStyle: "cover",

  setWallpaperStyle: (style) =>
    set({ wallpaperStyle: style }),

  /* THEME */

  isDarkMode: true,

  setIsDarkMode: (value) =>
    set({ isDarkMode: value }),

  themeMode: "dark",

  setThemeMode: (mode) =>
    set({
      themeMode: mode,
      isDarkMode: mode !== "light",
    }),

  accentColor: "#60a5fa",

  setAccentColor: (color) =>
    set({ accentColor: color }),

  /* TASKBAR */

  taskbarHeight: 56,

  setTaskbarHeight: (height) =>
    set({ taskbarHeight: height }),

  dockAutoHide: false,

  setDockAutoHide: (value) =>
    set({ dockAutoHide: value }),

  dockPosition: "bottom",

  setDockPosition: (pos) =>
    set({ dockPosition: pos }),

  dockStyle: "glass",

  setDockStyle: (style) =>
    set({ dockStyle: style }),

  dockSize: 56,

  setDockSize: (size) =>
    set({ dockSize: size }),

  /* UI */

  systemFontFamily: "Inter",

  setSystemFontFamily: (font) =>
    set({ systemFontFamily: font }),

  systemFontSize: 14,

  setSystemFontSize: (size) =>
    set({ systemFontSize: size }),

  systemFontWeight: 400,

  setSystemFontWeight: (weight) =>
    set({ systemFontWeight: weight }),

  uiBorderRadius: 16,

  setUiBorderRadius: (radius) =>
    set({ uiBorderRadius: radius }),

  titlebarHeight: 40,

  setTitlebarHeight: (height) =>
    set({ titlebarHeight: height }),

  uiOpacity: 0.75,

  setUiOpacity: (opacity) =>
    set({ uiOpacity: opacity }),

  uiBlur: 20,

  setUiBlur: (blur) =>
    set({ uiBlur: blur }),

  uiStyleProfile: "default",

  setUiStyleProfile: (profile) =>
    set({ uiStyleProfile: profile }),

  windowAnimationCurve: "smooth",

  setWindowAnimationCurve: (curve) =>
    set({ windowAnimationCurve: curve }),

  fontTransformStyle: "none",

  setFontTransformStyle: (style) =>
    set({ fontTransformStyle: style }),

  cursorStyle: "default",

  setCursorStyle: (style) =>
    set({ cursorStyle: style }),

  iconSize: 72,

  setIconSize: (size) =>
    set({ iconSize: size }),

  showDesktopGrid: true,

  setShowDesktopGrid: (value) =>
    set({ showDesktopGrid: value }),

  reducedMotion: false,

  setReducedMotion: (value) =>
    set({ reducedMotion: value }),

  particleEffects: true,

  setParticleEffects: (value) =>
    set({ particleEffects: value }),

  windowBorderGlow: true,

  setWindowBorderGlow: (value) =>
    set({ windowBorderGlow: value }),

  /* DESKTOP ICONS */

  iconPositions: {},

  setIconPosition: (id, position) =>
    set((state) => ({
      iconPositions: {
        ...state.iconPositions,
        [id]: position,
      },
    })),

  /* NOTIFICATIONS */

  notifications: [],

  addNotification: (
    title,
    message,
    icon
  ) =>
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
      notifications: state.notifications.filter(
        (n) => n.id !== id
      ),
    })),
}));
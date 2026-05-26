import { create } from "zustand";
import { persist } from "zustand/middleware";

export const OS_VERSION = "4.7.2";
export const OS_BUILD = "25-05-2026";

export interface WindowState {
  id: string; title: string; appId: string; name?: string; emoji?: string;
  color?: string; width?: number; height?: number; minimized?: boolean;
  maximized?: boolean; position?: { x: number; y: number };
  size?: { width: number; height: number };
}
export interface NotificationItem { id: string; title: string; message: string; icon?: string; }
export interface ClockSettings {
  showSeconds: boolean; militaryTime: boolean; showDate: boolean; dateFormat: string;
  type?: string; color?: string; glowColor?: string; use24Hour?: boolean; fontSize?: number;
}
export interface Theme { id: number; name: string; wallpaper: string; gradient?: string; color?: string; }
export interface TerminalLine { type: "system"|"input"|"output"|"error"|"user"|"sys"; text: string; }
export interface AIMessage { role: "user"|"assistant"; text: string; }

export interface BroadcastMessage {
  id: string;
  message: string;
  from: string;
  fromRole: string;
  dismissible: boolean;
  autoClose: number | null;
  createdAt: string;
}

export type ThemeMode = "dark"|"light"|"system"|"glass"|"neon"|"aero";
export type DockPosition = "bottom"|"left"|"right"|"top";
export type DockStyle = "glass"|"solid"|"minimal"|"transparent"|"pill";
export type UIStyleProfile = "default"|"compact"|"aero"|"flat"|"neo-brutalism"|"cyberpunk"|"minimalist";
export type FontTransformStyle = "none"|"uppercase"|"lowercase"|"capitalize";
export type CursorStyle = "default"|"pointer"|"crosshair"|"none"|"dot";
export type LauncherPosition = "left"|"center"|"bottom-left"|"bottom-right"|"top-left";
export type NotificationPosition = "top-right"|"top-left"|"bottom-right"|"bottom-left";
export type WindowAnimationCurve = "smooth"|"slide"|"fade"|"snappy"|"retro-pop";

export interface UserRecord {
  role?: 'owner' | 'admin' | 'moderator' | 'user';
  isBanned?: boolean;
  isFrozen?: boolean;
  isMuted?: boolean;
  isBannable?: boolean;
  isFreezeable?: boolean;
  banUntil?: string;
  freezeUntil?: string;
  muteUntil?: string;
  kickedAt?: string;
  username: string;
  email: string;
  password?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface OSState {
  windows: WindowState[];
  openApp: (id: string, meta?: Partial<WindowState>) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  activeWindowId: string | null;
  setActiveWindowId: (id: string | null) => void;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  terminalLines: TerminalLine[];
  addTerminalLine: (type: TerminalLine["type"], text: string) => void;
  clearTerminal: () => void;
  aiMessages: AIMessage[];
  addAIMessage: (role: "user"|"assistant", text: string) => void;
  clearAIMessages: () => void;
  launcherOpen: boolean;
  toggleLauncher: () => void;
  launcherPosition: LauncherPosition;
  setLauncherPosition: (pos: LauncherPosition) => void;
  currentTime: Date;
  setTime: (time: Date) => void;
  clockSettings: ClockSettings;
  setClockSettings: (settings: Partial<ClockSettings>) => void;
  wallpaperIndex: number;
  setWallpaperIndex: (index: number) => void;
  customWallpaper: string | null;
  setCustomWallpaper: (wallpaper: string | null) => void;
  savedWallpapers: string[];
  setSavedWallpapers: (wallpapers: string[]) => void;
  addSavedWallpaper: (wallpaper: string) => void;
  removeSavedWallpaper: (wallpaper: string) => void;
  customBackgroundGradient: string;
  setCustomBackgroundGradient: (value: string) => void;
  customBackgroundColor: string;
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
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  iconColor: string;
  setIconColor: (color: string) => void;
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
  iconPositions: Record<string, { x: number; y: number }>;
  setIconPosition: (id: string, position: { x: number; y: number }) => void;
  iconImages: Record<string, string>;
  setIconImage: (id: string, image: string) => void;
  removeIconImage: (id: string) => void;
  notifications: NotificationItem[];
  addNotification: (title: string, message: string, icon?: string) => void;
  removeNotification: (id: string) => void;
  /* AUTH */
  users: UserRecord[];
  setUsers: (users: UserRecord[]) => void;
  addUser: (user: UserRecord) => void;
  user: UserRecord | null;
  isLoggedIn: boolean;
  isFirstBoot: boolean;
  bootComplete: boolean;
  emailVerified: boolean;
  pendingOTP: string | null;
  setUser: (user: UserRecord | null) => void;
  setIsLoggedIn: (value: boolean) => void;
  setIsFirstBoot: (value: boolean) => void;
  setBootComplete: (value: boolean) => void;
  setEmailVerified: (value: boolean) => void;
  setPendingOTP: (code: string | null) => void;
  logout: () => void;
  loadUsers: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  isUsersLoading: boolean;
  setIsUsersLoading: (val: boolean) => void;
  /* BROADCAST */
  broadcastMessages: BroadcastMessage[];
  addBroadcast: (msg: BroadcastMessage) => void;
  dismissBroadcast: (id: string) => void;
  seenKickedAt: string | null;
  setSeenKickedAt: (val: string | null) => void;
}

export const useOSStore = create<OSState>()(
  persist(
    (set, get) => ({
      windows: [],
      openApp: (id, meta) => set((state) => {
        const existing = state.windows.find((w) => w.id === id);
        if (existing) return { windows: state.windows.map((w) => w.id === id ? { ...w, minimized: false, ...meta } : w), activeWindowId: id };
        return { windows: [...state.windows, { id, appId: id, title: meta?.name ?? id, minimized: false, maximized: false, ...meta }], activeWindowId: id };
      }),
      closeWindow: (id) => set((state) => ({ windows: state.windows.filter((w) => w.id !== id), activeWindowId: state.activeWindowId === id ? null : state.activeWindowId })),
      focusWindow: (id) => set({ activeWindowId: id }),
      activeWindowId: null,
      setActiveWindowId: (id) => set({ activeWindowId: id }),
      toggleMinimize: (id) => set((state) => ({ windows: state.windows.map((w) => w.id === id ? { ...w, minimized: !w.minimized } : w) })),
      toggleMaximize: (id) => set((state) => ({ windows: state.windows.map((w) => w.id === id ? { ...w, maximized: !w.maximized } : w) })),
      updateWindowPosition: (id, position) => set((state) => ({ windows: state.windows.map((w) => w.id === id ? { ...w, position } : w) })),
      updateWindowSize: (id, size) => set((state) => ({ windows: state.windows.map((w) => w.id === id ? { ...w, size } : w) })),
      terminalLines: [],
      addTerminalLine: (type, text) => set((state) => ({ terminalLines: [...state.terminalLines, { type, text }] })),
      clearTerminal: () => set({ terminalLines: [] }),
      aiMessages: [],
      addAIMessage: (role, text) => set((state) => ({ aiMessages: [...state.aiMessages, { role, text }] })),
      clearAIMessages: () => set({ aiMessages: [] }),
      launcherOpen: false,
      toggleLauncher: () => set((state) => ({ launcherOpen: !state.launcherOpen })),
      launcherPosition: "center",
      setLauncherPosition: (pos) => set({ launcherPosition: pos }),
      currentTime: new Date(),
      setTime: (time) => set({ currentTime: time }),
      clockSettings: { showSeconds: true, militaryTime: false, showDate: true, dateFormat: "DD/MM/YYYY", type: "hud", color: "#ffffff", glowColor: "#60a5fa33", use24Hour: false, fontSize: 52 },
      setClockSettings: (settings) => set((state) => ({ clockSettings: { ...state.clockSettings, ...settings } })),
      wallpaperIndex: 0,
      setWallpaperIndex: (index) => set({ wallpaperIndex: index }),
      customWallpaper: null,
      setCustomWallpaper: (wallpaper) => set({ customWallpaper: wallpaper }),
      savedWallpapers: [],
      setSavedWallpapers: (wallpapers) => set({ savedWallpapers: wallpapers }),
      addSavedWallpaper: (wallpaper) => set((state) => ({ savedWallpapers: state.savedWallpapers.includes(wallpaper) ? state.savedWallpapers : [...state.savedWallpapers, wallpaper] })),
      removeSavedWallpaper: (wallpaper) => set((state) => ({ savedWallpapers: state.savedWallpapers.filter((i) => i !== wallpaper) })),
      customBackgroundGradient: "linear-gradient(to bottom right, #0f172a, #1e293b)",
      customBackgroundColor: "#0f172a",
      setCustomBackgroundGradient: (value) => set({ customBackgroundGradient: value }),
      setCustomBackgroundColor: (value) => set({ customBackgroundColor: value }),
      wallpaperStyle: "cover",
      setWallpaperStyle: (style) => set({ wallpaperStyle: style }),
      desktopIconLabelsVisible: true,
      setDesktopIconLabelsVisible: (value) => set({ desktopIconLabelsVisible: value }),
      desktopIconLabelSize: 11,
      setDesktopIconLabelSize: (size) => set({ desktopIconLabelSize: size }),
      taskbarOpacity: 0.82,
      setTaskbarOpacity: (value) => set({ taskbarOpacity: value }),
      launcherOpacity: 0.96,
      setLauncherOpacity: (value) => set({ launcherOpacity: value }),
      isDarkMode: true,
      setIsDarkMode: (value) => set({ isDarkMode: value }),
      themeMode: "dark",
      setThemeMode: (mode) => set({ themeMode: mode, isDarkMode: mode !== "light" }),
      accentColor: "#60a5fa",
      setAccentColor: (color) => set({ accentColor: color }),
      iconColor: "#ffffff",
      setIconColor: (color) => set({ iconColor: color }),
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
      setWindowAnimationCurve: (curve) => set({ windowAnimationCurve: curve }),
      fontTransformStyle: "none",
      setFontTransformStyle: (style) => set({ fontTransformStyle: style }),
      cursorStyle: "default",
      setCursorStyle: (style) => set({ cursorStyle: style }),
      iconSize: 85,
      setIconSize: (size) => set({ iconSize: size }),
      snapToGridEnabled: true,
      setSnapToGridEnabled: (value) => set({ snapToGridEnabled: value }),
      clockPosition: { x: 900, y: 100 },
      setClockPosition: (position) => set({ clockPosition: position }),
      notificationPosition: "top-right",
      setNotificationPosition: (position) => set({ notificationPosition: position }),
      showDesktopGrid: false,
      setShowDesktopGrid: (value) => set({ showDesktopGrid: value }),
      desktopGridOpacity: 0.12,
      setDesktopGridOpacity: (value) => set({ desktopGridOpacity: value }),
      desktopGridColor: "#ffffff",
      setDesktopGridColor: (value) => set({ desktopGridColor: value }),
      reducedMotion: false,
      setReducedMotion: (value) => set({ reducedMotion: value }),
      particleEffects: true,
      setParticleEffects: (value) => set({ particleEffects: value }),
      windowBorderGlow: true,
      setWindowBorderGlow: (value) => set({ windowBorderGlow: value }),
      iconPositions: {},
      setIconPosition: (id, position) => set((state) => ({ iconPositions: { ...state.iconPositions, [id]: position } })),
      iconImages: {},
      setIconImage: (id, image) => set((state) => ({ iconImages: { ...state.iconImages, [id]: image } })),
      removeIconImage: (id) => set((state) => { const upd = { ...state.iconImages }; delete upd[id]; return { iconImages: upd }; }),
      notifications: [],
      addNotification: (title, message, icon) => set((state) => ({ notifications: [...state.notifications, { id: crypto.randomUUID(), title, message, icon }] })),
      removeNotification: (id) => set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      /* AUTH */
      users: [],
      setUsers: (users: UserRecord[]) => set({ users }),
      addUser: (user: UserRecord) => set((state) => ({
        users: state.users.some(u => u.email === user.email)
          ? state.users
          : [...state.users, user],
      })),
      user: null,
      isLoggedIn: false,
      isFirstBoot: true,
      bootComplete: false,
      emailVerified: false,
      pendingOTP: null,
      setUser: (user: UserRecord | null) => set({ user, isFirstBoot: false }),
      setIsLoggedIn: (value) => set({ isLoggedIn: value }),
      setIsFirstBoot: (value) => set({ isFirstBoot: value }),
      setBootComplete: (value) => set({ bootComplete: value }),
      setEmailVerified: (value) => set({ emailVerified: value }),
      setPendingOTP: (code) => set({ pendingOTP: code }),
      logout: () => set({ user: null, isLoggedIn: false, windows: [], activeWindowId: null }),

      loadUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await fetch("/api/users");
          if (res.ok) {
            const fresh = await res.json();
            const mapped: UserRecord[] = fresh.map((u: {
              username: string; email: string; password?: string;
              createdAt: string; role?: string; isBanned?: boolean;
              isFrozen?: boolean; isMuted?: boolean; isBannable?: boolean;
              isFreezeable?: boolean; banUntil?: string; freezeUntil?: string;
              muteUntil?: string; kickedAt?: string; lastLogin?: string;
            }) => ({
              username:     u.username,
              email:        u.email,
              password:     u.password ?? "",
              createdAt:    u.createdAt ?? "",
              role:         (u.role as UserRecord["role"]) ?? "user",
              isBanned:     !!u.isBanned,
              isFrozen:     !!u.isFrozen,
              isMuted:      !!u.isMuted,
              isBannable:   !!u.isBannable,
              isFreezeable: !!u.isFreezeable,
              banUntil:     u.banUntil ?? "",
              freezeUntil:  u.freezeUntil ?? "",
              muteUntil:    u.muteUntil ?? "",
              kickedAt:     u.kickedAt ?? "",
              lastLogin:    u.lastLogin ?? "",
            }));
            set({ users: mapped });
          }
        } catch (err) {
          console.error("loadUsers failed:", err);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      refreshCurrentUser: async () => {
        const currentUser = get().user;
        if (!currentUser?.email) return;
        try {
          const res = await fetch("/api/users");
          if (!res.ok) return;
          const users = await res.json();
          const fresh = users.find((u: UserRecord) => u.email === currentUser.email);
          if (fresh) {
            set({
              user: {
                username:     fresh.username,
                email:        fresh.email,
                password:     fresh.password ?? "",
                createdAt:    fresh.createdAt ?? "",
                role:         fresh.role ?? "user",
                isBanned:     !!fresh.isBanned,
                isFrozen:     !!fresh.isFrozen,
                isMuted:      !!fresh.isMuted,
                isBannable:   !!fresh.isBannable,
                isFreezeable: !!fresh.isFreezeable,
                banUntil:     fresh.banUntil ?? "",
                freezeUntil:  fresh.freezeUntil ?? "",
                muteUntil:    fresh.muteUntil ?? "",
                kickedAt:     fresh.kickedAt ?? "",
                lastLogin:    fresh.lastLogin ?? "",
              }
            });
          }
        } catch (err) {
          console.error("refreshCurrentUser failed:", err);
        }
      },

      isUsersLoading: false,
      setIsUsersLoading: (val) => set({ isUsersLoading: val }),
      /* BROADCAST */
      broadcastMessages: [],
      addBroadcast: (msg) => set((state) => ({
        broadcastMessages: [...state.broadcastMessages, msg],
      })),
      dismissBroadcast: (id) => set((state) => ({
        broadcastMessages: state.broadcastMessages.filter(m => m.id !== id),
      })),
      seenKickedAt: null,
      setSeenKickedAt: (val) => set({ seenKickedAt: val }),
    }),
    {
      name: "troy-os-store",
      partialize: (state) => ({
        user: state.user,
        users: state.users,
        isFirstBoot: state.isFirstBoot,
        emailVerified: state.emailVerified,
        iconPositions: state.iconPositions,
        iconImages: state.iconImages,
        iconSize: state.iconSize,
        wallpaperIndex: state.wallpaperIndex,
        customWallpaper: state.customWallpaper,
        savedWallpapers: state.savedWallpapers,
        customBackgroundGradient: state.customBackgroundGradient,
        customBackgroundColor: state.customBackgroundColor,
        wallpaperStyle: state.wallpaperStyle,
        themeMode: state.themeMode,
        isDarkMode: state.isDarkMode,
        accentColor: state.accentColor,
        iconColor: state.iconColor,
        taskbarHeight: state.taskbarHeight,
        dockPosition: state.dockPosition,
        dockStyle: state.dockStyle,
        dockSize: state.dockSize,
        dockAutoHide: state.dockAutoHide,
        systemFontFamily: state.systemFontFamily,
        systemFontSize: state.systemFontSize,
        systemFontWeight: state.systemFontWeight,
        uiBorderRadius: state.uiBorderRadius,
        uiOpacity: state.uiOpacity,
        uiBlur: state.uiBlur,
        launcherPosition: state.launcherPosition,
        launcherOpacity: state.launcherOpacity,
        desktopIconLabelsVisible: state.desktopIconLabelsVisible,
        desktopIconLabelSize: state.desktopIconLabelSize,
        snapToGridEnabled: state.snapToGridEnabled,
        showDesktopGrid: state.showDesktopGrid,
        desktopGridOpacity: state.desktopGridOpacity,
        desktopGridColor: state.desktopGridColor,
        cursorStyle: state.cursorStyle,
        fontTransformStyle: state.fontTransformStyle,
        windowAnimationCurve: state.windowAnimationCurve,
        reducedMotion: state.reducedMotion,
        particleEffects: state.particleEffects,
        windowBorderGlow: state.windowBorderGlow,
        clockSettings: state.clockSettings,
        clockPosition: state.clockPosition,
        seenKickedAt: state.seenKickedAt,
      }),
      onRehydrateStorage: () => (state: OSState | undefined) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
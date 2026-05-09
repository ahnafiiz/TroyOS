export interface AppConfig {
  id: string;
  name: string;
  emoji: string;
  color: string;
  category: string;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  url?: string;
}

export const APPS: AppConfig[] = [
  // ─── PRODUCTIVITY ───────────────────────────────────
  {
    id: 'browser',
    name: 'Browser',
    emoji: '🌐',
    color: '#3b82f6',
    category: 'Productivity',
    description: 'Web Workspace',
    defaultWidth: 860,
    defaultHeight: 560,
    url: 'https://www.google.com/webhp?igu=1',
  },
  {
    id: 'notes',
    name: 'Notes',
    emoji: '📝',
    color: '#ec4899',
    category: 'Productivity',
    description: 'Smart Notepad',
    defaultWidth: 540,
    defaultHeight: 480,
  },
  {
    id: 'ai',
    name: 'AI Assistant',
    emoji: '🤖',
    color: '#f59e0b',
    category: 'Productivity',
    description: 'Neural Assistant',
    defaultWidth: 460,
    defaultHeight: 580,
  },

  // ─── ENTERTAINMENT ──────────────────────────────────
  {
    id: 'gaming',
    name: 'Gaming Hub',
    emoji: '🎮',
    color: '#8b5cf6',
    category: 'Entertainment',
    description: 'Game Launcher',
    defaultWidth: 840,
    defaultHeight: 560,
  },

  // ─── SYSTEM ─────────────────────────────────────────
  {
    id: 'files',
    name: 'Files',
    emoji: '📂',
    color: '#06b6d4',
    category: 'System',
    description: 'File Manager',
    defaultWidth: 680,
    defaultHeight: 480,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    emoji: '⌨️',
    color: '#10b981',
    category: 'System',
    description: 'Command Interface',
    defaultWidth: 660,
    defaultHeight: 420,
  },
  {
    id: 'settings',
    name: 'Settings',
    emoji: '⚙️',
    color: '#64748b',
    category: 'System',
    description: 'System Preferences',
    defaultWidth: 700,
    defaultHeight: 520,
  },
];

export const DOCK_APPS = ['browser', 'gaming', 'files', 'terminal', 'ai', 'settings'];
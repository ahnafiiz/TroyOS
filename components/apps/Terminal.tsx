/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { OS_VERSION, OS_BUILD } from '@/store/useOSStore';

type TerminalLineType = 'user' | 'sys' | 'system' | 'error' | 'input';

interface TerminalLine {
  type: TerminalLineType;
  text: string;
}

interface User {
  username: string;
  email?: string;
  password?: string;
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
  createdAt: string | number | Date;
  lastLogin?: string;
  [key: string]: unknown;
}

interface OSStore {
  terminalLines?: TerminalLine[];
  addTerminalLine: (type: TerminalLineType, text: string) => void;
  clearTerminal?: () => void;
  resetOS?: () => void;
  user: User | null;
  users?: User[];
  setUsers?: (users: User[]) => void;
  logout?: () => void;
}

const EMPTY_LINES: TerminalLine[] = [];

const INITIAL_BOOT_TIME =
  typeof window !== 'undefined' ? Date.now() - 368420000 : Date.now();

const VIRTUAL_FS: Record<string, string> = {
  'readme.md': `# troy-os\nInternal system. Unauthorized access is prohibited.`,
  'config.json': `{\n  "systemId": "NEXUS-V2",\n  "buildVersion": "2.0.6",\n  "kernelSecurity": "enforced",\n  "adminAccessLog": "/var/log/secure_auth"\n}`,
  'theme.css': `:root {\n  --terminal-green: #10b981;\n}`,
  'todo.txt': `- fix memory leak in WindowManager\n- patch sandbox escape in browser subprocess\n- call Troy re: db credentials`,
};

const ROLE_COLORS: Record<string, string> = {
  owner:     '#f59e0b',
  admin:     '#ef4444',
  moderator: '#a855f7',
  user:      '#10b981',
};

const ROLE_HIERARCHY: Record<string, number> = {
  owner: 4, admin: 3, moderator: 2, user: 1,
};

export default function Terminal() {
  const store = useOSStore() as unknown as OSStore;

  const terminalLines  = store.terminalLines ?? EMPTY_LINES;
  const addTerminalLine = store.addTerminalLine;
  const user           = store.user;
  const users          = store.users ?? [];
  const setUsers       = store.setUsers ?? (() => {});
  const logout         = store.logout ?? (() => {});

  const username  = user?.username ?? 'guest';
  const role      = user?.role ?? 'user';
  const roleColor = ROLE_COLORS[role] ?? '#10b981';

  const isOwner = role === 'owner';
  const isAdmin = role === 'admin' || isOwner;
  const isMod   = role === 'moderator' || isAdmin;

  const clearTerminal = store.clearTerminal ?? (() => {});

  const [input,        setInput]        = useState('');
  const [bootTime,     setBootTime]     = useState(INITIAL_BOOT_TIME);
  const [history,      setHistory]      = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  const getUptime = (): string => {
    const diff  = Date.now() - bootTime;
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff / 3600000) % 24);
    const mins  = Math.floor((diff / 60000) % 60);
    const secs  = Math.floor((diff / 1000) % 60);
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  };

  const line = (text: string) => addTerminalLine('sys', text);
  const err  = (text: string) => addTerminalLine('error', text);

  const parseDuration = (str?: string): string => {
    if (!str || str === 'permanent') return 'permanent';
    const num = parseInt(str);
    if (isNaN(num)) return 'permanent';
    const unit = str.slice(-1);
    const ms =
      unit === 'm' ? num * 60 * 1000 :
      unit === 'h' ? num * 60 * 60 * 1000 :
      unit === 'd' ? num * 24 * 60 * 60 * 1000 : null;
    if (!ms) return 'permanent';
    return new Date(Date.now() + ms).toISOString();
  };

  const writeLog = async (action: string, targetEmail: string, details: string) => {
    if (!user?.email) return;
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp:   new Date().toISOString(),
        adminEmail:  user.email,
        adminRole:   role,
        action,
        targetEmail,
        details,
      }),
    }).catch(console.error);
  };

  const patchUser = async (email: string, updates: Record<string, unknown>) => {
    await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, updates }),
    });
  };

  const runCommand = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const tokens  = trimmed.split(' ');
    const cmd     = tokens[0].toLowerCase();
    const args    = tokens.slice(1);

    if (cmd === 'clear') {
      clearTerminal();
      setInput('');
      return;
    }

    addTerminalLine('user', trimmed);
    setHistory(prev => [trimmed, ...prev.filter(h => h !== trimmed)].slice(0, 50));
    setHistoryIndex(-1);

    // Permission helpers
    const requireRole = (minRole: string): boolean => {
      if ((ROLE_HIERARCHY[role] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 99)) return true;
      err('permission denied');
      return false;
    };

    switch (cmd) {

      // ─── HELP ─────────────────────────────────────────────
      case 'help':
        line(`┌─ Commands ────────────────────────────────────┐`);
        line(`│  help              show this list             │`);
        line(`│  user              show your account info     │`);
        line(`│  whoami            print current user         │`);
        line(`│  ls                list files                 │`);
        line(`│  cat [file]        print file contents        │`);
        line(`│  echo [text]       print text                 │`);
        line(`│  pwd               working directory          │`);
        line(`│  date              current date & time        │`);
        line(`│  uptime            system uptime              │`);
        line(`│  top / ps          running processes          │`);
        line(`│  neofetch          system info                │`);
        line(`│  ip / ifconfig     network info               │`);
        line(`│  ping [host]       ping a host                │`);
        line(`│  env               environment vars           │`);
        line(`│  matrix            ???                        │`);
        line(`│  clear             clear terminal             │`);
        line(`└───────────────────────────────────────────────┘`);

        if (isMod) {
          line(``);
          line(`┌─ Moderator Commands ──────────────────────────┐`);
          line(`│  users                      list all users    │`);
          line(`│  whois <email>              user details      │`);
          line(`│  freeze <email> [dur]       freeze a user     │`);
          line(`│  unfreeze <email>           unfreeze a user   │`);
          line(`│  mute <email> [dur]         mute a user       │`);
          line(`│  unmute <email>             unmute a user     │`);
          line(`│  audit [email1] [email2]    view audit logs   │`);
          line(`│                                               │`);
          line(`│  durations: 30m · 2h · 7d · permanent        │`);
          line(`└───────────────────────────────────────────────┘`);
        }

        if (isAdmin) {
          line(``);
          line(`┌─ Admin Commands ──────────────────────────────┐`);
          line(`│  ban <email> [dur]          ban a user        │`);
          line(`│  unban <email>              unban a user      │`);
          line(`│  kick <email>               kick a user       │`);
          line(`│  promote <email> <role>     promote user      │`);
          line(`│  demote <email> <role>      demote user       │`);
          line(`│  chpass <email> <pass>      change password   │`);
          line(`│  broadcast <target> <msg>   send message      │`);
          line(`│    --time <s>               auto-close secs   │`);
          line(`│    --persist                not dismissible   │`);
          line(`│  reset                      factory reset     │`);
          line(`└───────────────────────────────────────────────┘`);
        }

        if (isOwner) {
          line(``);
          line(`┌─ Owner Commands ──────────────────────────────┐`);
          line(`│  setrole <email> <role>     set any role      │`);
          line(`│  roles available: owner · admin · moderator · user`);
          line(`└───────────────────────────────────────────────┘`);
        }
        break;

      // ─── BASIC ────────────────────────────────────────────
      case 'user':
        line(`┌─ Account ─────────────────────────────────┐`);
        line(`│  username   ${(user?.username ?? 'guest').padEnd(30)}│`);
        line(`│  email      ${(user?.email ?? 'n/a').padEnd(30)}│`);
        line(`│  role       ${(role).padEnd(30)}│`);
        line(`│  joined     ${(String(user?.createdAt ?? 'unknown')).padEnd(30)}│`);
        line(`│  last login ${(String(user?.lastLogin ?? 'unknown')).padEnd(30)}│`);
        line(`└───────────────────────────────────────────┘`);
        break;

      case 'whoami':
        line(`${username} (${role})`);
        break;

      case 'ls':
        line(`Documents/   Downloads/   Pictures/   Games/`);
        line(`config.json  readme.md    theme.css   todo.txt`);
        break;

      case 'pwd':
        line(isOwner ? '/root/owner' : isAdmin ? '/root' : `/home/${username}`);
        break;

      case 'date':
        line(new Date().toLocaleString('en-IE', { timeZone: 'Europe/Dublin' }));
        break;

      case 'echo':
        line(args.join(' '));
        break;

      case 'env':
        line(`USER     = ${isAdmin ? 'root' : username}`);
        line(`HOME     = ${isOwner ? '/root/owner' : isAdmin ? '/root' : `/home/${username}`}`);
        line(`SHELL    = /bin/bash`);
        line(`ROLE     = ${role}`);
        line(`PATH     = /usr/local/sbin:/usr/local/bin:/usr/bin:/bin`);
        line(`DISPLAY  = :0.0`);
        line(`HOSTTYPE = x86_64`);
        break;

      case 'uptime':
        line(`uptime:  ${getUptime()}`);
        line(`load avg: 0.21  0.14  0.05`);
        break;

      case 'ps':
      case 'top':
        line(`  PID   USER       %CPU  %MEM  COMMAND`);
        line(`  ───   ────       ────  ────  ───────`);
        line(`    1   root        0.0   0.0  init`);
        line(`   14   ${username.padEnd(10)}  4.2   1.1  nextjs-server`);
        line(`   44   ${username.padEnd(10)}  1.1   0.1  window-mgr`);
        line(`   98   ${username.padEnd(10)}  0.7   0.0  terminal`);
        break;

      case 'ping':
        if (!args[0]) { err('ping: missing host operand'); break; }
        line(`PING ${args[0]}: 56 data bytes`);
        line(`64 bytes from ${args[0]}: icmp_seq=0 ttl=64 time=12.4 ms`);
        line(`64 bytes from ${args[0]}: icmp_seq=1 ttl=64 time=11.8 ms`);
        line(`2 packets transmitted, 2 received, 0% packet loss`);
        break;

      case 'ip':
      case 'ifconfig':
        line(`eth0   inet 192.168.1.144   netmask 255.255.255.0`);
        line(`lo     inet 127.0.0.1       netmask 255.0.0.0`);
        break;

      case 'cat':
        if (!args[0]) { err('cat: missing operand'); break; }
        if (VIRTUAL_FS[args[0].toLowerCase()]) {
          line(VIRTUAL_FS[args[0].toLowerCase()]);
        } else {
          err(`cat: ${args[0]}: no such file or directory`);
        }
        break;

      case 'matrix':
        line('wake up, neo...');
        let counter = 0;
        const interval = setInterval(() => {
          if (counter > 8) { clearInterval(interval); return; }
          line(Array.from({ length: 4 }, () =>
            Math.random().toString(36).substring(2, 10)
          ).join('  '));
          counter++;
        }, 80);
        break;

      case 'neofetch':
      case 'system':
        line(`                                              `);
        line(` ████████╗██████╗  ██████╗ ██╗   ██╗        `);
        line(` ╚══██╔══╝██╔══██╗██╔═══██╗╚██╗ ██╔╝        `);
        line(`    ██║   ██████╔╝██║   ██║ ╚████╔╝         `);
        line(`    ██║   ██╔══██╗██║   ██║  ╚██╔╝          `);
        line(`    ██║   ██║  ██║╚██████╔╝   ██║           `);
        line(`    ╚═╝   ╚═╝  ╚═╝ ╚═════╝    ╚═╝           `);
        line(`                                              `);
        line(`  OS          Troy OS ${OS_VERSION} (build ${OS_BUILD})`);
        line(`  Uptime      ${getUptime()}`);
        line(`  Shell       bash`);
        line(`  Role        ${role}`);
        line(`  User        ${username}`);
        line(`  Resolution  ${typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown'}`);
        line(`                                              `);
        break;

      // ─── MODERATOR ────────────────────────────────────────
      case 'users':
        if (!requireRole('moderator')) break;
        line(`  ${'USERNAME'.padEnd(16)} ${'EMAIL'.padEnd(30)} ${'ROLE'.padEnd(12)} STATUS`);
        line(`  ${'────────'.padEnd(16)} ${'─────'.padEnd(30)} ${'────'.padEnd(12)} ──────`);
        users.forEach((u: User) => {
          const status = u.isBanned ? 'banned' : u.isFrozen ? 'frozen' : u.isMuted ? 'muted' : 'active';
          line(`  ${u.username.padEnd(16)} ${(u.email ?? '').padEnd(30)} ${(u.role ?? 'user').padEnd(12)} ${status}`);
        });
        break;

      case 'whois':
        if (!requireRole('moderator')) break;
        if (!args[0]) { err('usage: whois <email>'); break; }
        {
          const target = users.find((u: User) => u.email === args[0] || u.username === args[0]);
          if (!target) { err(`user not found: ${args[0]}`); break; }
          line(`┌─ User: ${target.username} ─────────────────────────┐`);
          line(`│  email       ${(target.email ?? 'n/a').padEnd(28)}│`);
          line(`│  role        ${(target.role ?? 'user').padEnd(28)}│`);
          line(`│  joined      ${String(target.createdAt ?? 'unknown').padEnd(28)}│`);
          line(`│  last login  ${String(target.lastLogin ?? 'never').padEnd(28)}│`);
          line(`│  banned      ${String(!!target.isBanned).padEnd(28)}│`);
          line(`│  frozen      ${String(!!target.isFrozen).padEnd(28)}│`);
          line(`│  muted       ${String(!!target.isMuted).padEnd(28)}│`);
          line(`│  bannable    ${String(target.isBannable ?? true).padEnd(28)}│`);
          line(`│  freezeable  ${String(target.isFreezeable ?? true).padEnd(28)}│`);
          if (target.banUntil)    line(`│  ban until   ${target.banUntil.padEnd(28)}│`);
          if (target.freezeUntil) line(`│  freeze until ${target.freezeUntil.padEnd(27)}│`);
          if (target.muteUntil)   line(`│  mute until  ${target.muteUntil.padEnd(28)}│`);
          line(`└───────────────────────────────────────────┘`);
        }
        break;

      case 'freeze':
        if (!requireRole('moderator')) break;
        {
          const email = args[0];
          const duration = args[1];
          if (!email) { err('usage: freeze <email> [duration]'); break; }
          const idx = users.findIndex((u: User) => u.email === email);
          if (idx === -1) { err(`user not found: ${email}`); break; }
          if (!users[idx].isFreezeable) { err(`${email} is not freezeable`); break; }
          if ((ROLE_HIERARCHY[users[idx].role ?? 'user'] ?? 0) >= (ROLE_HIERARCHY[role] ?? 0)) {
            err('cannot freeze a user with equal or higher role'); break;
          }
          const freezeUntil = parseDuration(duration);
          const label = freezeUntil === 'permanent' ? 'permanently' : `until ${new Date(freezeUntil).toLocaleString('en-IE')}`;
          try {
            await patchUser(email, { isFrozen: true, freezeUntil });
            const newUsers = [...users]; newUsers[idx] = { ...users[idx], isFrozen: true, freezeUntil };
            setUsers(newUsers);
            line(`frozen: ${email} ${label}`);
            await writeLog('freeze', email, `duration: ${duration ?? 'permanent'}`);
          } catch { err(`failed to freeze: ${email}`); }
        }
        break;

      case 'unfreeze':
        if (!requireRole('moderator')) break;
        {
          const email = args[0];
          if (!email) { err('usage: unfreeze <email>'); break; }
          const idx = users.findIndex((u: User) => u.email === email);
          if (idx === -1) { err(`user not found: ${email}`); break; }
          try {
            await patchUser(email, { isFrozen: false, freezeUntil: '' });
            const newUsers = [...users]; newUsers[idx] = { ...users[idx], isFrozen: false, freezeUntil: '' };
            setUsers(newUsers);
            line(`unfrozen: ${email}`);
            await writeLog('unfreeze', email, '');
          } catch { err(`failed to unfreeze: ${email}`); }
        }
        break;

      case 'mute':
        if (!requireRole('moderator')) break;
        {
          const email = args[0];
          const duration = args[1];
          if (!email) { err('usage: mute <email> [duration]'); break; }
          const idx = users.findIndex((u: User) => u.email === email);
          if (idx === -1) { err(`user not found: ${email}`); break; }
          if ((ROLE_HIERARCHY[users[idx].role ?? 'user'] ?? 0) >= (ROLE_HIERARCHY[role] ?? 0)) {
            err('cannot mute a user with equal or higher role'); break;
          }
          const muteUntil = parseDuration(duration);
          const label = muteUntil === 'permanent' ? 'permanently' : `until ${new Date(muteUntil).toLocaleString('en-IE')}`;
          try {
            await patchUser(email, { isMuted: true, muteUntil });
            const newUsers = [...users]; newUsers[idx] = { ...users[idx], isMuted: true, muteUntil };
            setUsers(newUsers);
            line(`muted: ${email} ${label}`);
            await writeLog('mute', email, `duration: ${duration ?? 'permanent'}`);
          } catch { err(`failed to mute: ${email}`); }
        }
        break;

      case 'unmute':
        if (!requireRole('moderator')) break;
        {
          const email = args[0];
          if (!email) { err('usage: unmute <email>'); break; }
          const idx = users.findIndex((u: User) => u.email === email);
          if (idx === -1) { err(`user not found: ${email}`); break; }
          try {
            await patchUser(email, { isMuted: false, muteUntil: '' });
            const newUsers = [...users]; newUsers[idx] = { ...users[idx], isMuted: false, muteUntil: '' };
            setUsers(newUsers);
            line(`unmuted: ${email}`);
            await writeLog('unmute', email, '');
          } catch { err(`failed to unmute: ${email}`); }
        }
        break;

      case 'audit':
        if (!requireRole('moderator')) break;
        {
          const targets = args.filter(a => !a.startsWith('--'));
          let url = '/api/logs';
          if (targets.length > 0) {
            url += '?' + targets.map(e => `email=${encodeURIComponent(e)}`).join('&');
          }
          try {
            const res = await fetch(url);
            const logs = await res.json();
            // Moderators only see their own actions
            const filtered = role === 'moderator'
              ? logs.filter((l: { adminEmail: string }) => l.adminEmail === user?.email)
              : role === 'admin'
              ? logs.filter((l: { adminRole: string }) => l.adminRole !== 'owner')
              : logs;
            if (filtered.length === 0) { line('no logs found.'); break; }
            line(`  ${'TIMESTAMP'.padEnd(18)} ${'ADMIN'.padEnd(24)} ${'ACTION'.padEnd(12)} TARGET`);
            line(`  ${'─────────'.padEnd(18)} ${'─────'.padEnd(24)} ${'──────'.padEnd(12)} ──────`);
            filtered.slice(-20).forEach((l: { timestamp: string; adminEmail: string; action: string; targetEmail: string; details: string }) => {
              line(`  ${l.timestamp.substring(0, 16).padEnd(18)} ${l.adminEmail.padEnd(24)} ${l.action.padEnd(12)} ${l.targetEmail}`);
              if (l.details) line(`  ${''.padEnd(18)} ${''.padEnd(24)} ${''.padEnd(12)} ↳ ${l.details}`);
            });
          } catch { err('failed to fetch audit logs'); }
        }
        break;

      // ─── ADMIN ────────────────────────────────────────────
      case 'ban':
        if (!requireRole('admin')) break;
        {
          const email = args[0];
          const duration = args[1];
          if (!email) { err('usage: ban <email> [duration]'); break; }
          const idx = users.findIndex((u: User) => u.email === email);
          if (idx === -1) { err(`user not found: ${email}`); break; }
          if (!users[idx].isBannable) { err(`${email} is not bannable`); break; }
          if ((ROLE_HIERARCHY[users[idx].role ?? 'user'] ?? 0) >= (ROLE_HIERARCHY[role] ?? 0)) {
            err('cannot ban a user with equal or higher role'); break;
          }
          const banUntil = parseDuration(duration);
          const label = banUntil === 'permanent' ? 'permanently' : `until ${new Date(banUntil).toLocaleString('en-IE')}`;
          try {
            await patchUser(email, { isBanned: true, banUntil });
            const newUsers = [...users]; newUsers[idx] = { ...users[idx], isBanned: true, banUntil };
            setUsers(newUsers);
            line(`banned: ${email} ${label}`);
            await writeLog('ban', email, `duration: ${duration ?? 'permanent'}`);
            if (user?.email === email) setTimeout(() => logout(), 800);
          } catch { err(`failed to ban: ${email}`); }
        }
        break;

      case 'unban':
        if (!requireRole('admin')) break;
        {
          const email = args[0];
          if (!email) { err('usage: unban <email>'); break; }
          const idx = users.findIndex((u: User) => u.email === email);
          if (idx === -1) { err(`user not found: ${email}`); break; }
          try {
            await patchUser(email, { isBanned: false, banUntil: '' });
            const newUsers = [...users]; newUsers[idx] = { ...users[idx], isBanned: false, banUntil: '' };
            setUsers(newUsers);
            line(`unbanned: ${email}`);
            await writeLog('unban', email, '');
          } catch { err(`failed to unban: ${email}`); }
        }
        break;

      case 'kick':
        if (!requireRole('admin')) break;
        {
          const email = args[0];
          if (!email) { err('usage: kick <email>'); break; }
          const idx = users.findIndex((u: User) => u.email === email);
          if (idx === -1) { err(`user not found: ${email}`); break; }
          if ((ROLE_HIERARCHY[users[idx].role ?? 'user'] ?? 0) >= (ROLE_HIERARCHY[role] ?? 0)) {
            err('cannot kick a user with equal or higher role'); break;
          }
          try {
            await fetch('/api/users/kick', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            });
            line(`kicked: ${email}`);
            await writeLog('kick', email, '');
          } catch { err(`failed to kick: ${email}`); }
        }
        break;

      case 'promote':
        if (!requireRole('admin')) break;
        {
          const [email, newRole] = args;
          if (!email || !newRole) { err('usage: promote <email> <role>'); break; }
          const validRoles = isOwner
            ? ['owner', 'admin', 'moderator', 'user']
            : ['moderator', 'user'];
          if (!validRoles.includes(newRole)) {
            err(`invalid role. ${isOwner ? 'use: owner · admin · moderator · user' : 'admins can only promote to: moderator · user'}`);
            break;
          }
          const idx = users.findIndex((u: User) => u.email === email);
          if (idx === -1) { err(`user not found: ${email}`); break; }
          const targetRank = ROLE_HIERARCHY[users[idx].role ?? 'user'] ?? 0;
          const newRank    = ROLE_HIERARCHY[newRole] ?? 0;
          if (!isOwner && targetRank >= ROLE_HIERARCHY['admin']) {
            err('admins cannot promote/demote other admins or owners'); break;
          }
          if (newRank <= targetRank) { err(`that would be a demotion — use demote instead`); break; }
          try {
            await patchUser(email, { role: newRole });
            const newUsers = [...users]; newUsers[idx] = { ...users[idx], role: newRole as User['role'] };
            setUsers(newUsers);
            line(`promoted: ${email} → ${newRole}`);
            await writeLog('promote', email, `new role: ${newRole}`);
          } catch { err(`failed to promote: ${email}`); }
        }
        break;

      case 'demote':
        if (!requireRole('admin')) break;
        {
          const [email, newRole] = args;
          if (!email || !newRole) { err('usage: demote <email> <role>'); break; }
          const validRoles = isOwner
            ? ['admin', 'moderator', 'user']
            : ['moderator', 'user'];
          if (!validRoles.includes(newRole)) {
            err(`invalid role. ${isOwner ? 'use: admin · moderator · user' : 'admins can only demote to: moderator · user'}`);
            break;
          }
          const idx = users.findIndex((u: User) => u.email === email);
          if (idx === -1) { err(`user not found: ${email}`); break; }
          const targetRank = ROLE_HIERARCHY[users[idx].role ?? 'user'] ?? 0;
          const newRank    = ROLE_HIERARCHY[newRole] ?? 0;
          if (!isOwner && targetRank >= ROLE_HIERARCHY['admin']) {
            err('admins cannot promote/demote other admins or owners'); break;
          }
          if (newRank >= targetRank) { err(`that would be a promotion — use promote instead`); break; }
          try {
            await patchUser(email, { role: newRole });
            const newUsers = [...users]; newUsers[idx] = { ...users[idx], role: newRole as User['role'] };
            setUsers(newUsers);
            line(`demoted: ${email} → ${newRole}`);
            await writeLog('demote', email, `new role: ${newRole}`);
          } catch { err(`failed to demote: ${email}`); }
        }
        break;

      case 'setrole':
        if (!requireRole('owner')) break;
        {
          const [email, newRole] = args;
          if (!email || !newRole) { err('usage: setrole <email> <role>'); break; }
          if (!['owner', 'admin', 'moderator', 'user'].includes(newRole)) {
            err('invalid role. use: owner · admin · moderator · user'); break;
          }
          const idx = users.findIndex((u: User) => u.email === email);
          if (idx === -1) { err(`user not found: ${email}`); break; }
          try {
            await patchUser(email, { role: newRole });
            const newUsers = [...users]; newUsers[idx] = { ...users[idx], role: newRole as User['role'] };
            setUsers(newUsers);
            line(`role set: ${email} → ${newRole}`);
            await writeLog('setrole', email, `new role: ${newRole}`);
          } catch { err(`failed to set role: ${email}`); }
        }
        break;

      case 'broadcast':
        if (!requireRole('admin')) break;
        {
          // broadcast <email|all> <message> [--time <s>] [--persist]
          if (args.length < 2) { err('usage: broadcast <email|all> <message> [--time <s>] [--persist]'); break; }
          const target = args[0];
          const persistFlag = args.includes('--persist');
          const timeIdx = args.indexOf('--time');
          const autoClose = timeIdx !== -1 ? parseInt(args[timeIdx + 1]) || null : null;
          const msgParts = args.slice(1).filter((a, i) => {
            if (a === '--persist') return false;
            if (a === '--time') return false;
            if (timeIdx !== -1 && i === timeIdx) return false;
            if (timeIdx !== -1 && i === timeIdx + 1 - 1) return false; // the number after --time
            return true;
          });
          // Cleaner parse — grab everything between target and flags
          const flagStart = args.findIndex(a => a.startsWith('--'));
          const messageArgs = flagStart === -1 ? args.slice(1) : args.slice(1, flagStart);
          const message = messageArgs.join(' ');
          if (!message) { err('broadcast message cannot be empty'); break; }
          try {
            await fetch('/api/broadcast', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                target,
                message,
                from: user?.email ?? username,
                fromRole: role,
                dismissible: !persistFlag,
                autoClose,
              }),
            });
            line(`broadcast sent → ${target}`);
            if (autoClose) line(`  auto-closes in ${autoClose}s`);
            if (persistFlag) line(`  not dismissible`);
            await writeLog('broadcast', target, message);
          } catch { err('failed to send broadcast'); }
        }
        break;

      case 'chpass':
        if (!requireRole('admin')) break;
        {
          const [email, newPass] = args;
          if (!email || !newPass) { err('usage: chpass <email> <new_password>'); break; }
          const idx = users.findIndex((u: User) => u.email === email);
          if (idx === -1) { err(`user not found: ${email}`); break; }
          try {
            await patchUser(email, { password: newPass });
            const newUsers = [...users]; newUsers[idx] = { ...users[idx], password: newPass };
            setUsers(newUsers);
            line(`password updated: ${email}`);
            await writeLog('chpass', email, '');
          } catch { err(`failed to update password: ${email}`); }
        }
        break;

      case 'reset':
        if (!requireRole('admin')) break;
        err('initiating factory reset...');
        setTimeout(() => {
          clearTerminal();
          setBootTime(Date.now());
          if (store.resetOS) store.resetOS();
          line('system reset complete.');
          line('type "help" to get started.');
        }, 1200);
        break;

      default:
        err(`${cmd}: command not found`);
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHistoryIndex(prev => {
        const next = Math.min(prev + 1, history.length - 1);
        setInput(history[next] ?? '');
        return next;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHistoryIndex(prev => {
        const next = prev - 1;
        if (next < 0) { setInput(''); return -1; }
        setInput(history[next] ?? '');
        return next;
      });
    }
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#040d07', fontFamily: "'SF Mono', 'Cascadia Code', monospace",
    }}>
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        {terminalLines.map((l, i) => {
          const isUserCmd = l.type === 'user' || l.type === 'input';
          const isError   = l.type === 'error';
          return (
            <div key={i} style={{
              fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre',
              color: isError ? '#ef4444' : isUserCmd ? '#ffffff' : '#10b981',
            }}>
              {isUserCmd && (
                <span>
                  <span style={{ color: roleColor, fontWeight: 600 }}>
                    {`${username}@troy-os`}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {isOwner || isAdmin ? ':# ' : ':~$ '}
                  </span>
                </span>
              )}
              {l.text}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px',
        borderTop: '1px solid rgba(16,185,129,0.12)',
        background: 'rgba(2,6,4,0.6)', flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, color: roleColor, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {`${username}@troy-os${isOwner || isAdmin ? ':# ' : ':~$ '}`}
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 12, outline: 'none' }}
        />
        <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}.cursor{animation:blink 1s step-end infinite}`}</style>
        <span className="cursor" style={{ fontSize: 13, color: roleColor, marginLeft: -4 }}>█</span>
      </div>
    </div>
  );
}
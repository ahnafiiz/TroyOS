'use client';

import { useState, useEffect, useRef } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { OS_VERSION, OS_BUILD } from '@/store/useOSStore';

// ─── TYPES ───────────────────────────────────────────────────

type TerminalLineType = 'user' | 'sys' | 'system' | 'error' | 'input';

interface TerminalLine {
  type: TerminalLineType;
  text: string;
}

interface User {
  username: string;
  email?: string;
  password?: string;
  role?: 'user' | 'admin';
  isBanned?: boolean;
  isFrozen?: boolean;
  createdAt: string | number | Date;
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

// ─── CONSTANTS ───────────────────────────────────────────────

const EMPTY_LINES: TerminalLine[] = [];

const INITIAL_BOOT_TIME =
  typeof window !== 'undefined' ? Date.now() - 368420000 : Date.now();

const VIRTUAL_FS: Record<string, string> = {
  'readme.md': `# troy-os\nInternal system. Unauthorized access is prohibited.`,
  'config.json': `{\n  "systemId": "NEXUS-V2",\n  "buildVersion": "2.0.6",\n  "kernelSecurity": "enforced",\n  "adminAccessLog": "/var/log/secure_auth"\n}`,
  'theme.css': `:root {\n  --terminal-green: #10b981;\n}`,
  'todo.txt': `- fix memory leak in WindowManager\n- patch sandbox escape in browser subprocess\n- call Troy re: db credentials`,
};

// ─── COMPONENT ───────────────────────────────────────────────

export default function Terminal() {
  const store = useOSStore() as unknown as OSStore;

  const terminalLines = store.terminalLines ?? EMPTY_LINES;
  const addTerminalLine = store.addTerminalLine;
  const user = store.user;
  const users = store.users ?? [];
  const setUsers = store.setUsers ?? (() => {});
  const logout = store.logout ?? (() => {});

  const username = user?.username ?? 'guest';
  const isAdmin = user?.role === 'admin';

  const clearTerminal =
    store.clearTerminal ??
    (() => {
      if (store.terminalLines) store.terminalLines.length = 0;
    });

  const [input, setInput] = useState('');
  const [bootTime, setBootTime] = useState(INITIAL_BOOT_TIME);
  const [history, setHistory] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const runCommand = (raw: string) => {
    const requireAdmin = () => {
      if (!isAdmin) { err('permission denied'); return false; }
      return true;
    };

    const trimmed = raw.trim();
    if (!trimmed) return;

    const tokens = trimmed.split(' ');
    const cmd    = tokens[0].toLowerCase();
    const args   = tokens.slice(1);

    if (cmd === 'clear') {
      clearTerminal();
      if (store.terminalLines) store.terminalLines.length = 0;
      setInput('');
      return;
    }

    addTerminalLine('user', trimmed);
    setHistory(prev => [trimmed, ...prev.filter(h => h !== trimmed)].slice(0, 50));
    setHistoryIndex(-1);

    switch (cmd) {

      case 'help':
        line(`┌─ Commands ────────────────────────────────┐`);
        line(`│  help            show this list           │`);
        line(`│  user            show your account info   │`);
        line(`│  whoami          print current user       │`);
        line(`│  ls              list files               │`);
        line(`│  cat [file]      print file contents      │`);
        line(`│  echo [text]     print text               │`);
        line(`│  pwd             working directory        │`);
        line(`│  date            current date & time      │`);
        line(`│  uptime          system uptime            │`);
        line(`│  top / ps        running processes        │`);
        line(`│  neofetch        system info              │`);
        line(`│  ip / ifconfig   network info             │`);
        line(`│  ping [host]     ping a host              │`);
        line(`│  env             environment vars         │`);
        line(`│  matrix          ???                      │`);
        line(`│  clear           clear terminal           │`);
        line(`└───────────────────────────────────────────┘`);
        if (isAdmin) {
          line(``);
          line(`┌─ Admin Commands ──────────────────────────┐`);
          line(`│  ban <email>               ban a user     │`);
          line(`│  unban <email>             unban a user   │`);
          line(`│  freeze <email>            freeze a user  │`);
          line(`│  unfreeze <email>          unfreeze user  │`);
          line(`│  chpass <email> <pass>     change pass    │`);
          line(`│  reset                     factory reset  │`);
          line(`└───────────────────────────────────────────┘`);
        }
        break;

      case 'user':
        line(`┌─ Account ─────────────────────────────────┐`);
        line(`│  username   ${(user?.username ?? 'guest').padEnd(30)}│`);
        line(`│  email      ${(user?.email ?? 'n/a').padEnd(30)}│`);
        line(`│  role       ${(user?.role ?? 'user').padEnd(30)}│`);
        line(`│  joined     ${(String(user?.createdAt ?? 'unknown')).padEnd(30)}│`);
        line(`└───────────────────────────────────────────┘`);
        break;

      case 'whoami':
        line(isAdmin ? 'root' : username);
        break;

      case 'ls':
        line(`Documents/   Downloads/   Pictures/   Games/`);
        line(`config.json  readme.md    theme.css   todo.txt`);
        break;

      case 'pwd':
        line(isAdmin ? '/root' : `/home/${username}`);
        break;

      case 'date':
        line(new Date().toLocaleString('en-IE', { timeZone: 'Europe/Dublin' }));
        break;

      case 'echo':
        line(args.join(' '));
        break;

      case 'env':
        line(`USER     = ${isAdmin ? 'root' : username}`);
        line(`HOME     = ${isAdmin ? '/root' : `/home/${username}`}`);
        line(`SHELL    = /bin/bash`);
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
        line(`   14   ${(isAdmin ? 'root' : username).padEnd(10)}  4.2   1.1  nextjs-server`);
        line(`   44   ${(isAdmin ? 'root' : username).padEnd(10)}  1.1   0.1  window-mgr`);
        line(`   98   ${(isAdmin ? 'root' : username).padEnd(10)}  0.7   0.0  terminal`);
        break;

      case 'ping':
        if (!args[0]) {
          err('ping: missing host operand');
        } else {
          const host = args[0];
          line(`PING ${host}: 56 data bytes`);
          line(`64 bytes from ${host}: icmp_seq=0 ttl=64 time=12.4 ms`);
          line(`64 bytes from ${host}: icmp_seq=1 ttl=64 time=11.8 ms`);
          line(`2 packets transmitted, 2 received, 0% packet loss`);
        }
        break;

      case 'ip':
      case 'ifconfig':
        line(`eth0   inet 192.168.1.144   netmask 255.255.255.0`);
        line(`lo     inet 127.0.0.1       netmask 255.0.0.0`);
        break;

      case 'cat':
        if (!args[0]) {
          err('cat: missing operand');
        } else {
          const file = args[0].toLowerCase();
          if (VIRTUAL_FS[file]) {
            line(VIRTUAL_FS[file]);
          } else {
            err(`cat: ${args[0]}: no such file or directory`);
          }
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
        line(`  User        ${username}${isAdmin ? ' (admin)' : ''}`);
        line(`  Resolution  ${typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown'}`);
        line(`                                              `);
        break;

      // ─── ADMIN ONLY ──────────────────────────────────────────

      case 'ban':
        if (requireAdmin()) {
          const email = args[0];
          if (!email) {
            err('usage: ban <email>');
          } else {
            const idx = users.findIndex((u: User) => u.email === email);
            if (idx === -1) {
              err(`user not found: ${email}`);
            } else {
              fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, updates: { isBanned: true } }),
              }).catch(console.error);
              const newUsers = [...users];
              newUsers[idx] = { ...users[idx], isBanned: true };
              setUsers(newUsers);
              line(`banned: ${email}`);
              if (user?.email === email) {
                setTimeout(() => logout(), 800);
              }
            }
          }
        }
        break;

      case 'unban':
        if (requireAdmin()) {
          const email = args[0];
          if (!email) {
            err('usage: unban <email>');
          } else {
            const idx = users.findIndex((u: User) => u.email === email);
            if (idx === -1) {
              err(`user not found: ${email}`);
            } else {
              fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, updates: { isBanned: false } }),
              }).catch(console.error);
              const newUsers = [...users];
              newUsers[idx] = { ...users[idx], isBanned: false };
              setUsers(newUsers);
              line(`unbanned: ${email}`);
            }
          }
        }
        break;

      case 'freeze':
        if (requireAdmin()) {
          const email = args[0];
          if (!email) {
            err('usage: freeze <email>');
          } else {
            const idx = users.findIndex((u: User) => u.email === email);
            if (idx === -1) {
              err(`user not found: ${email}`);
            } else {
              fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, updates: { isFrozen: true } }),
              }).catch(console.error);
              const newUsers = [...users];
              newUsers[idx] = { ...users[idx], isFrozen: true };
              setUsers(newUsers);
              line(`frozen: ${email}`);
              if (user?.email === email) {
                setTimeout(() => logout(), 800);
              }
            }
          }
        }
        break;

      case 'unfreeze':
        if (requireAdmin()) {
          const email = args[0];
          if (!email) {
            err('usage: unfreeze <email>');
          } else {
            const idx = users.findIndex((u: User) => u.email === email);
            if (idx === -1) {
              err(`user not found: ${email}`);
            } else {
              fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, updates: { isFrozen: false } }),
              }).catch(console.error);
              const newUsers = [...users];
              newUsers[idx] = { ...users[idx], isFrozen: false };
              setUsers(newUsers);
              line(`unfrozen: ${email}`);
            }
          }
        }
        break;

      case 'chpass':
        if (requireAdmin()) {
          const [email, newPass] = args;
          if (!email || !newPass) {
            err('usage: chpass <email> <new_password>');
          } else {
            const idx = users.findIndex((u: User) => u.email === email);
            if (idx === -1) {
              err(`user not found: ${email}`);
            } else {
              fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, updates: { password: newPass } }),
              }).catch(console.error);
              const newUsers = [...users];
              newUsers[idx] = { ...users[idx], password: newPass };
              setUsers(newUsers);
              line(`password updated: ${email}`);
            }
          }
        }
        break;

      case 'reset':
        if (!requireAdmin()) break;
        err('initiating factory reset...');
        setTimeout(() => {
          clearTerminal();
          if (store.terminalLines) store.terminalLines.length = 0;
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

  // ─── KEYBOARD ────────────────────────────────────────────────

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

  // ─── UI ──────────────────────────────────────────────────────

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#040d07',
      fontFamily: "'SF Mono', 'Cascadia Code', monospace",
    }}>
      {/* OUTPUT */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        {terminalLines.map((line, i) => {
          const isUserCmd = line.type === 'user' || line.type === 'input';
          const isError   = line.type === 'error';
          return (
            <div key={i} style={{
              fontSize: 12,
              lineHeight: 1.7,
              whiteSpace: 'pre',
              color: isError ? '#ef4444' : isUserCmd ? '#ffffff' : '#10b981',
            }}>
              {isUserCmd && (
                <span>
                  <span style={{ color: isAdmin ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                    {isAdmin ? 'root@troy-os' : `${username}@troy-os`}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {isAdmin ? ':# ' : ':~$ '}
                  </span>
                </span>
              )}
              {line.text}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        borderTop: '1px solid rgba(16,185,129,0.12)',
        background: 'rgba(2,6,4,0.6)',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 12,
          color: isAdmin ? '#ef4444' : '#10b981',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          {isAdmin ? 'root@troy-os:# ' : `${username}@troy-os:~$ `}
        </span>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder=""
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: 12,
            outline: 'none',
          }}
        />

        <style>{`
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
          .cursor { animation: blink 1s step-end infinite; }
        `}</style>

        <span className="cursor" style={{
          fontSize: 13,
          color: isAdmin ? '#ef4444' : '#10b981',
          marginLeft: -4,
        }}>█</span>
      </div>
    </div>
  );
}
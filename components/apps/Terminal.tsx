'use client';

import { useState, useEffect, useRef } from 'react';
import { useOSStore } from '@/store/useOSStore';

// Static initialization marker for live system runtime checks
const INITIAL_BOOT_TIME = typeof window !== 'undefined' ? Date.now() - 368420000 : Date.now();

// Mock virtual filesystem map for commands like cat, ls, and grep
const VIRTUAL_FS: Record<string, string> = {
  'readme.md': `# TROY OS Core File System\nAuthorized security personnel access only.\nUse 'sudo troy-admin --override' to assert superuser authority.`,
  'config.json': `{\n  "systemId": "NEXUS-V2",\n  "buildVersion": "2.0.6",\n  "kernelSecurity": "Enforced",\n  "adminAccessLog": "/var/log/secure_auth"\n}`,
  'theme.css': `:root {\n  --terminal-green: #10b981;\n  --matrix-vibe: cubic-bezier(0.16, 1, 0.3, 1);\n}`,
  'todo.txt': `- Fix memory leak in WindowManager wrapper\n- Patch sandbox escape vector in browser sub-process\n- Call Troy for database server credentials`
};

export default function Terminal() {
  const store = useOSStore();
  const terminalLines = store.terminalLines || [];
  const addTerminalLine = store.addTerminalLine;
  
  // Safe extraction helper supporting fallback operations if clearTerminal isn't declared globally
  const clearTerminal = (store as any).clearTerminal || (() => {
    if (store.terminalLines) {
      store.terminalLines.length = 0;
    }
  });

  const [input, setInput] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [bootTime, setBootTime] = useState(INITIAL_BOOT_TIME);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  // Utility to parse working real-world time ticks into system metrics strings
  const getCalculatedUptime = (): string => {
    const diff = Date.now() - bootTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const runCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const tokens = trimmed.split(' ');
    const baseCommand = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    // ── INTERCEPT CLEAR COMMAND IMMEDIATELY ───────────────────────────────
    if (baseCommand === 'clear') {
      clearTerminal();
      if (store.terminalLines) store.terminalLines.length = 0; 
      setInput('');
      return;
    }

    // Log the current user input line to command histories
    addTerminalLine('user' as any, trimmed);
    const newHistory = [trimmed, ...history.filter(h => h !== trimmed)].slice(0, 50);
    setHistory(newHistory);
    setHistoryIndex(-1);

    switch (baseCommand) {
      case 'help':
        addTerminalLine('sys', 
`Available Commands:
  help                    — Display system operations manual
  ls                      — List structures in current directory tree
  cat [file]              — View content logs of a specific file asset
  echo [text]             — Write arguments to standard output stream
  pwd                     — Print current working directory path context
  whoami                  — Return active user profile scope
  date                    — Fetch localized network calendar timestamp
  uptime                  — Provide live operational hardware engine runtime
  top / ps                — Inspect active real-time process architectures
  neofetch / system       — Map core hardware and OS baseline parameters
  ip / ifconfig           — Read host network adapter loopback details
  ping [host]             — Send ICMP ECHO_REQUEST packets to network hosts
  env                     — Print localized shell context environments
  matrix                  — Run background visual subsystem validation
  sudo [command]          — Execute operations under superuser restrictions
  reset                   — [ADMIN ONLY] Performs a hard factory wipe of active memory registers
  clear                   — Wipe current console layout display`
        );
        break;

      case 'ls':
        addTerminalLine('sys', '📁 Documents    📁 Downloads    📁 Pictures    📁 Games');
        addTerminalLine('sys', '📄 config.json   📄 README.md    📄 theme.css   📄 todo.txt');
        break;

      case 'pwd':
        addTerminalLine('sys', isAdmin ? '/root' : '/home/commander/workspace');
        break;

      case 'whoami':
        addTerminalLine('sys', isAdmin ? 'root (Superuser / Chief Architect)' : 'commander (Access Level: Standard Developer)');
        break;

      case 'date':
        addTerminalLine('sys', new Date().toString());
        break;

      case 'echo':
        addTerminalLine('sys', args.join(' '));
        break;

      case 'env':
        addTerminalLine('sys', `USER=${isAdmin ? 'root' : 'commander'}\nHOME=${isAdmin ? '/root' : '/home/commander'}\nSHELL=/bin/troy-zsh\nPATH=/usr/local/sbin:/usr/local/bin:/usr/bin:/bin\nDISPLAY=:0.0\nHOSTTYPE=x86_64`);
        break;

      case 'uptime':
        addTerminalLine('sys', `System Up-Time Status: ${getCalculatedUptime()}`);
        addTerminalLine('sys', `Load Averages: [0.21] [0.14] [0.05] | Cluster State: Operational`);
        break;

      case 'ps':
      case 'top':
        addTerminalLine('sys', `PID   USER       PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND`);
        addTerminalLine('sys', `  1   root       20   0   42188   6102   4882 S   0.0   0.0   0:02.14 init-wrapper`);
        addTerminalLine('sys', ` 14   commander  20   0  12.4g  184m  92m R   4.2   1.1   1:42.08 nextjs-server`);
        addTerminalLine('sys', ` 44   commander  20   0  84221  1241   912 S   1.1   0.1   0:14.32 window-mgr`);
        addTerminalLine('sys', ` 98   ${isAdmin ? 'root     ' : 'commander'}  20   0   18.1m   4.2m   2.1m R   0.7   0.0   0:00.62 terminal-shell`);
        break;

      case 'ping':
        if (!args[0]) {
          addTerminalLine('error', 'Error: Host address parameter required. Usage: ping [domain/ip]');
        } else {
          const target = args[0];
          addTerminalLine('sys', `PING ${target} (56(84) bytes of data).`);
          addTerminalLine('sys', `64 bytes from ${target}: icmp_seq=1 ttl=64 time=14.2 ms`);
          addTerminalLine('sys', `64 bytes from ${target}: icmp_seq=2 ttl=64 time=11.8 ms`);
          addTerminalLine('sys', `--- ${target} ping statistics --- 2 packets transmitted, 0% packet loss`);
        }
        break;

      case 'ip':
      case 'ifconfig':
        addTerminalLine('sys', `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500`);
        addTerminalLine('sys', `      inet 192.168.1.144  netmask 255.255.255.0  broadcast 192.168.1.255`);
        addTerminalLine('sys', `      inet6 fe80::ea11:8bff:fe29:92ad  prefixlen 64  scopeid 0x20<link>`);
        addTerminalLine('sys', `lo:   inet 127.0.0.1  netmask 255.0.0.0 (Local Loopback Intercept)`);
        break;

      case 'cat':
        if (!args[0]) {
          addTerminalLine('error', 'Error: File target parameter format required: "cat [filename.extension]"');
        } else {
          const targetFile = args[0].toLowerCase();
          if (VIRTUAL_FS[targetFile]) {
            addTerminalLine('sys', VIRTUAL_FS[targetFile]);
          } else {
            addTerminalLine('error', `Error: Static target out of local grid tracking bounds: '${args[0]}'`);
          }
        }
        break;

      case 'matrix':
        addTerminalLine('sys', 'INITIALIZING VECTOR MAP STREAM OVERRIDE...');
        let counter = 0;
        const interval = setInterval(() => {
          if (counter > 8) {
            clearInterval(interval);
            return;
          }
          const randomBits = Array.from({length: 4}, () => Math.random().toString(36).substring(2, 10)).join('::');
          addTerminalLine('sys', `[KRNL-DIAG-ERR]::0x7F2B3${randomBits}`);
          counter++;
        }, 80);
        break;

      case 'system':
      case 'neofetch':
        addTerminalLine('sys', `
████████╗██████╗  ██████╗ ██╗   ██╗     ██████╗ ███████╗
╚══██╔══╝██╔══██╗██╔═══██╗╚██╗ ██╔╝     ██╔═══██╗██╔════╝
   ██║   ██████╔╝██║   ██║ ╚████╔╝      ██║   ██║███████╗
   ██║   ██╔══██╗██║   ██║  ╚██╔╝       ██║   ██║╚════██║
   ██║   ██║  ██║╚██████╔╝   ██║        ╚██████╔╝███████║
   ╚═╝   ╚═╝  ╚═╝ ╚═════╝    ╚═╝         ╚═════╝ ╚══════╝
 ─────────────────────────────────────────────────────────────
  OS: Troy OS v2.0.6 x86_64 (Custom NextJS Engine Frame)
  Kernel: Linux 6.8.9-troy-hypervisor-release
  Shell: Troy ZSH Node-Terminal v2.4
  Uptime: ${getCalculatedUptime()}
  CPU: AMD Ryzen 9 7950X V-Cache @ 5.70GHz (32 Threads)
  GPU: NVIDIA GeForce RTX 4090 (24GB VRAM)
  Memory: 4,096 MiB / 16,384 MiB Assigned Allocation
  Resolution: ${typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Dynamic CSS Canvas'}`
        );
        break;

      case 'sudo':
        const innerArg = args.join(' ').toLowerCase();
        if (innerArg === 'troy-admin --override' || innerArg === 'troy-admin') {
          addTerminalLine('error', '⚠️ WARNING: ATTEMPTING DIRECT SYSTEM OVERRIDE PROTOCOL...');
          setTimeout(() => {
            setIsAdmin(true); // Elevates prompt to root authority status
            addTerminalLine('sys', '🔓 ACCESS GRANTED. CREDENTIAL SIGNATURE MATCHED.');
            addTerminalLine('sys', '==================================================');
            addTerminalLine('sys', '⚡ WELCOME CHIEF ARCHITECT TROY. ENFORCING ADMIN OVERRIDES.');
            addTerminalLine('sys', '▶ Prompt Status: Elevated to root@troy-os');
            addTerminalLine('sys', '▶ Permissions Enabled: [reset], [rm -rf /]');
            addTerminalLine('sys', '▶ Current Session Token: root@troy-os::[SECURE_SHELL]');
            addTerminalLine('sys', '==================================================');
          }, 600);
        } else if (args.length === 0) {
          addTerminalLine('error', 'usage: sudo command [arguments...]');
        } else {
          addTerminalLine('error', `Permission denied: User 'commander' does not possess root access privileges to run '${args[0]}'.`);
        }
        break;

      case 'reset':
        // ── LIVE SUPERUSER ADMINISTRATIVE ACTION ───────────────────────────
        if (!isAdmin) {
          addTerminalLine('error', 'bash: reset: Permission denied. Superuser (root) privileges required.');
        } else {
          addTerminalLine('error', 'CRITICAL: INITIATING GLOBAL FACTORY SYSTEM RESET...');
          
          setTimeout(() => {
            // 1. Wipe out terminal line logs entirely
            clearTerminal();
            if (store.terminalLines) store.terminalLines.length = 0;

            // 2. Clear down to standard non-root access
            setIsAdmin(false);

            // 3. Reset the system baseline ticker back to zero live seconds ago
            setBootTime(Date.now());

            // 4. Try calling a global state reset handler if provided in useOSStore
            if ((store as any).resetOS) {
              (store as any).resetOS();
            }

            addTerminalLine('sys', '🔄 Troy OS Kernels reinitialized successfully.');
            addTerminalLine('sys', 'All memory allocations flushed. System runtime tracking reset to 0s.');
            addTerminalLine('sys', 'Type "help" to list operational commands.');
          }, 1200);
        }
        break;

      default:
        addTerminalLine('error', `Command execution failure: '${baseCommand}' is recognized as an invalid operator.\nType "help" to view active pipeline structures.`);
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#040d07', fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', monospace" }}>
      {/* Console Display Output Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {terminalLines.map((line, i) => {
          const isUserCommand = line.type === 'user' || line.type === 'cmd';
          const isSystemError = line.type === 'error';

          return (
            <div key={i} style={{
              fontSize: 12,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              color: isSystemError ? '#ef4444' 
                   : isUserCommand ? '#ffffff' 
                   : '#10b981',
            }}>
              {isUserCommand && (
                <span>
                  {/* Dynamic user label based on admin flag */}
                  <span style={{ color: isAdmin ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                    {isAdmin ? 'root@troy-os' : 'commander@troy-os'}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>{isAdmin ? ':# ' : ':~$ '}</span>
                </span>
              )}
              {line.text}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Field Entry Panel */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        padding: '10px 16px', 
        borderTop: '1px solid rgba(16,185,129,0.12)', 
        background: 'rgba(2, 6, 4, 0.6)', 
        flexShrink: 0 
      }}>
        {/* Dynamic lower prompt text field indicator */}
        <span style={{ fontSize: 12, color: isAdmin ? '#ef4444' : '#10b981', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {isAdmin ? 'root@troy-os:# ' : 'commander@troy-os:~$ '}
        </span>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder={isAdmin ? "System compromised. Awaiting absolute override..." : "Enter core pipeline directive..."}
          style={{ 
            flex: 1, 
            background: 'none', 
            border: 'none', 
            color: '#fff', 
            fontFamily: 'inherit', 
            fontSize: 12, 
            outline: 'none' 
          }}
        />
        <style>{`
          @keyframes terminalBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .terminal-cursor {
            animation: terminalBlink 1s step-end infinite;
          }
        `}</style>
        <span className="terminal-cursor" style={{ fontSize: 13, color: isAdmin ? '#ef4444' : '#10b981', marginLeft: -4 }}>█</span>
      </div>
    </div>
  );
}
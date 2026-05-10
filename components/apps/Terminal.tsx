// components/apps/Terminal.tsx
// A simulated Linux-style terminal with fake commands.
// ✏️ Add your own commands in the COMMANDS object below.

'use client';

import { useState, useEffect, useRef } from 'react';
import { useOSStore } from '@/store/useOSStore';

// ✏️ ADD YOUR OWN COMMANDS HERE
// Key = command name, value = function that returns output text
const COMMANDS: Record<string, () => string> = {
  help: () => `Available commands:
  help       — show this list
  ls         — list files
  pwd        — current directory
  whoami     — current user
  date       — current date and time
  uptime     — system uptime
  system   — system information
  owner      — owner of Troy OS
  clear      — clear the terminal`,

  ls: () => `📁 Documents    📁 Downloads
📁 Pictures     📁 Games
📄 config.json  📄 README.md
📄 theme.css    🖼️ wallpaper.png`,

  pwd: () => '/home/commander',
  whoami: () => 'commander',
  date: () => new Date().toString(),

  uptime: () => `System uptime: 4 days, 7 hours, 23 minutes
Load average: 0.42  0.38  0.35`,

  neofetch: () => `
████████╗██████╗  ██████╗ ██╗   ██╗     ██████╗ ███████╗
╚══██╔══╝██╔══██╗██╔═══██╗╚██╗ ██╔╝    ██╔═══██╗██╔════╝
   ██║   ██████╔╝██║   ██║ ╚████╔╝     ██║   ██║███████╗
   ██║   ██╔══██╗██║   ██║  ╚██╔╝      ██║   ██║╚════██║
   ██║   ██║  ██║╚██████╔╝   ██║       ╚██████╔╝███████║
   ╚═╝   ╚═╝  ╚═╝ ╚═════╝    ╚═╝        ╚═════╝ ╚══════╝
  OS:      Troy OS v2.0.1
  Kernel:  6.8.0-troy
  Shell:   troy 2.1
  CPU:     TroyCore i9-X @ 6.7GHz
  GPU:     Troy AMD RTX 670 Ti
  Memory:  16 GiB / 128 GiB
  Uptime:  4d 7h 23m`,

  owner: () => `Why the fuh do you wanna know boy`
};

export default function Terminal() {
  const { terminalLines, addTerminalLine, clearTerminal } = useOSStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new lines appear
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  const runCommand = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    addTerminalLine('cmd', raw); // Show what the user typed

    if (cmd === 'clear') {
      clearTerminal();
      return;
    }

    // Check if the command (first word) is in our COMMANDS list
    const cmdName = cmd.split(' ')[0];
    const fn = COMMANDS[cmdName];

    if (fn) {
      addTerminalLine('output', fn());
    } else {
      addTerminalLine('output', `Command not found: ${cmdName}\nType "help" to see available commands.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(input);
      setInput('');
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#040d07', fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', monospace" }}>
      {/* Output area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {terminalLines.map((line, i) => (
          <div key={i} style={{
            fontSize: 12,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            color: line.type === 'sys' ? '#10b981'
                 : line.type === 'cmd' ? 'rgba(255,255,255,0.9)'
                 : 'rgba(255,255,255,0.6)',
          }}>
            {/* Show prompt before commands */}
            {line.type === 'cmd' && (
              <span>
                <span style={{ color: '#10b981' }}>commander@nexus</span>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>:~$ </span>
              </span>
            )}
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderTop: '1px solid rgba(16,185,129,0.15)', background: 'rgba(0,0,0,0.4)', flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: '#10b981', whiteSpace: 'nowrap' }}>commander@nexus:~$</span>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder="Type a command..."
          style={{ flex: 1, background: 'none', border: 'none', color: 'rgba(255,255,255,0.9)', fontFamily: 'inherit', fontSize: 12, outline: 'none' }}
        />
        <span className="blink-anim" style={{ fontSize: 14, color: '#10b981' }}>█</span>
      </div>
    </div>
  );
}
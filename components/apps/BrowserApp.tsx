import { useState, useRef } from 'react'

const TROXY_BASE = "https://troy-os-troxy.vercel.app"

export default function BrowserApp() {
  const [currentUrl, setCurrentUrl] = useState(TROXY_BASE)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const goHome = () => {
    setCurrentUrl(TROXY_BASE)
  }

  const openInNewTab = () => {
    window.open(currentUrl, '_blank')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0f' }}>
      
      {/* Top Bar */}
      <div style={{
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        padding: '8px 12px',
        background: 'rgba(15,15,20,0.95)', 
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <button style={iconBtn} onClick={goHome} title="Home">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </button>
        
        <button style={iconBtn} onClick={handleReload} title="Reload">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </button>

        <button style={iconBtn} onClick={() => setCurrentUrl(`${TROXY_BASE}/a`)} title="Games">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4m-2-2v4"/><circle cx="17" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="17" cy="13" r="1" fill="currentColor" stroke="none"/></svg>
        </button>

        <button style={iconBtn} onClick={() => setCurrentUrl(`${TROXY_BASE}/b`)} title="Apps">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        </button>

        <button style={iconBtn} onClick={openInNewTab} title="Open in new window">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </button>
      </div>

      {/* Main iframe */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <iframe
          ref={iframeRef}
          src={currentUrl}
          style={{ 
            width: '100%', 
            height: '100%', 
            border: 'none', 
            background: '#0a0a0f',
            display: 'block'
          }}
          allow="fullscreen; microphone; camera; gamepad; clipboard-read; clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads"
        />
      </div>

      {/* Status indicator */}
      <div style={{
        padding: '4px 12px',
        background: 'rgba(15,15,20,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'monospace',
        display: 'flex',
        gap: 12
      }}>
        <span style={{ marginLeft: 'auto' }}>
          {currentUrl === TROXY_BASE ? 'Home' : 'Browsing'}
        </span>
      </div>
    </div>
  )
}

const iconBtn = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 6,
  padding: '6px 10px',
  cursor: 'pointer',
  color: 'white',
  fontSize: 14,
  transition: 'all 0.15s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 32,
  height: 32
} as const
import { useState, useRef } from 'react'

const TROXY_BASE = "https://troxy-troyos.vercel.app"

export default function BrowserApp() {
  const [currentUrl, setCurrentUrl] = useState(TROXY_BASE)
  const [displayUrl, setDisplayUrl] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const goHome = () => {
    setCurrentUrl(TROXY_BASE)
    setDisplayUrl('')
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
          🏠
        </button>
        
        <button style={iconBtn} onClick={handleReload} title="Reload">
          🔄
        </button>

        <div style={{
          flex: 1,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          padding: '6px 12px',
          color: 'rgba(255,255,255,0.5)',
          fontSize: 13,
          fontFamily: 'monospace'
        }}>
          {displayUrl || 'Use search bar inside Troxy ↓'}
        </div>

        <button style={iconBtn} onClick={() => setCurrentUrl(`${TROXY_BASE}/a`)} title="Games">
          🎮
        </button>

        <button style={iconBtn} onClick={() => setCurrentUrl(`${TROXY_BASE}/b`)} title="Apps">
          📱
        </button>

        <button style={iconBtn} onClick={openInNewTab} title="Open in new window">
          ↗️
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
        <span>🔒 Proxied via Troxy</span>
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
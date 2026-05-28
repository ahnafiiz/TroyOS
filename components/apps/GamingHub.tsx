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

  const goHome = () => setCurrentUrl(TROXY_BASE)
  const openInNewTab = () => window.open(currentUrl, '_blank')

  const isHome = currentUrl === TROXY_BASE
  const isGames = currentUrl === `${TROXY_BASE}/a`
  const isApps = currentUrl === `${TROXY_BASE}/b`

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#0a0a0f',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>

      {/* Top Nav */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 16px',
        background: 'rgba(10,10,15,0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        gap: 0,
      }}>

        {/* Left — logo/brand */}
        <div style={{
          position: 'absolute',
          left: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
          }}>Troxy</span>
        </div>

        {/* Center — pill nav */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 999,
          padding: '3px',
          gap: 2,
        }}>
          <NavPill label="Home" active={isHome} onClick={goHome} />
          <NavPill label="Games" active={isGames} onClick={() => setCurrentUrl(`${TROXY_BASE}/a`)} />
          <NavPill label="Apps" active={isApps} onClick={() => setCurrentUrl(`${TROXY_BASE}/b`)} />
        </div>

        {/* Right — utility buttons */}
        <div style={{
          position: 'absolute',
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <UtilBtn onClick={handleReload} title="Reload">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </UtilBtn>
          <UtilBtn onClick={openInNewTab} title="Open in new tab">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </UtilBtn>
        </div>
      </div>

      {/* iframe */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <iframe
          ref={iframeRef}
          src={currentUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: '#0a0a0f',
            display: 'block',
          }}
          allow="fullscreen; microphone; camera; gamepad; clipboard-read; clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads"
        />
      </div>
    </div>
  )
}

function NavPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
        border: 'none',
        borderRadius: 999,
        padding: '5px 16px',
        cursor: 'pointer',
        color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        letterSpacing: '0.01em',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

function UtilBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '50%',
        width: 30,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'rgba(255,255,255,0.5)',
        transition: 'all 0.15s ease',
      }}
    >
      {children}
    </button>
  )
}
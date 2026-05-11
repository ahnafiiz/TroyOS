// components/apps/BrowserApp.tsx
import { useState } from 'react'
import { useOSStore } from '@/store/useOSStore'

const PROXY = "https://sturdy-train-gxqpp5gpx55r3wxpp-8080.app.github.dev"

function getProxiedUrl(url: string) {
  if (!url) return ""
  const fullUrl = url.startsWith("http") ? url : `https://${url}`
  return `${PROXY}/service/${encodeURIComponent(fullUrl)}`
}

export default function BrowserApp() {
  const { browserUrl, setBrowserUrl } = useOSStore()
  const [inputVal, setInputVal] = useState(browserUrl || "")
  const [iframeUrl, setIframeUrl] = useState(browserUrl ? getProxiedUrl(browserUrl) : "")

  function navigate(url?: string) {
    const target = url || inputVal
    if (!target) return
    const full = target.startsWith("http") ? target : `https://${target}`
    setBrowserUrl(full)
    setInputVal(full)
    setIframeUrl(getProxiedUrl(full))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0f' }}>

      {/* Address Bar */}
      <div style={{
        display: 'flex', gap: 8, padding: '8px 12px',
        background: 'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        alignItems: 'center'
      }}>
        <button onClick={() => window.history.back()} style={btnStyle}>←</button>
        <button onClick={() => window.history.forward()} style={btnStyle}>→</button>
        <button onClick={() => navigate(inputVal)} style={btnStyle}>↻</button>
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && navigate()}
          placeholder="Search or enter URL..."
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, padding: '6px 12px',
            color: 'white', fontSize: 13, outline: 'none'
          }}
        />
        <button
          onClick={() => navigate()}
          style={{ ...btnStyle, background: 'rgba(99,102,241,0.4)', padding: '6px 16px' }}
        >
          Go
        </button>
      </div>

      {/* Quick Links */}
      {!iframeUrl && (
        <div style={{ padding: 24 }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 12 }}>QUICK ACCESS</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { name: 'Google', url: 'https://google.com', emoji: '🔍' },
              { name: 'YouTube', url: 'https://youtube.com', emoji: '▶️' },
              { name: 'TikTok', url: 'https://tiktok.com', emoji: '🎵' },
              { name: 'GeForce NOW', url: 'https://play.geforcenow.com', emoji: '🎮' },
              { name: 'Reddit', url: 'https://reddit.com', emoji: '🤖' },
              { name: 'Twitter/X', url: 'https://x.com', emoji: '🐦' },
              { name: 'Discord', url: 'https://discord.com/app', emoji: '💬' },
              { name: 'Spotify', url: 'https://open.spotify.com', emoji: '🎵' },
            ].map(site => (
              <button
                key={site.name}
                onClick={() => navigate(site.url)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '10px 18px',
                  color: 'white', cursor: 'pointer', fontSize: 13,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                {site.emoji} {site.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Iframe */}
      {iframeUrl && (
        <iframe
          src={iframeUrl}
          style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
          allow="fullscreen microphone camera"
        />
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '6px 10px',
  color: 'white', cursor: 'pointer', fontSize: 14,
  whiteSpace: 'nowrap'
}
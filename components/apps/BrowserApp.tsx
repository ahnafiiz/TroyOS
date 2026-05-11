// components/apps/BrowserApp.tsx
import { useState } from 'react'

const INTERSTELLAR = "https://sturdy-train-gxqpp5gpx55r3wxpp-8080.app.github.dev"

export default function BrowserApp() {
  const [src, setSrc] = useState(`${INTERSTELLAR}/d`)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0f' }}>

      {/* Top Bar */}
      <div style={{
        display: 'flex',
        gap: 8,
        padding: '6px 10px',
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left side */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => setSrc(`${INTERSTELLAR}/d`)} style={btnStyle} title="Home">🏠</button>
          <button onClick={() => setSrc(`${INTERSTELLAR}/g`)} style={btnStyle} title="Games">🎮</button>
          <button onClick={() => setSrc(`${INTERSTELLAR}/a`)} style={btnStyle} title="Apps">📱</button>
        </div>

        {/* Center label */}
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, letterSpacing: 1 }}>
          TROY BROWSER
        </span>

        {/* Right side */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => {
              const url = prompt('Enter URL:')
              if (url) setSrc(`${INTERSTELLAR}/service/${encodeURIComponent(url.startsWith('http') ? url : 'https://' + url)}`)
            }}
            style={btnStyle}
            title="Go to URL"
          >
            🔗
          </button>
          <button
            onClick={() => window.open(src, '_blank')}
            style={btnStyle}
            title="Open in new tab"
          >
            ↗
          </button>
        </div>
      </div>

      {/* Quick Links - shown only on home */}
      {src === `${INTERSTELLAR}/d` && (
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexWrap: 'wrap'
        }}>
          {[
            { name: 'YouTube', url: 'https://youtube.com', emoji: '▶️' },
            { name: 'TikTok', url: 'https://tiktok.com', emoji: '🎵' },
            { name: 'GeForce NOW', url: 'https://play.geforcenow.com', emoji: '🎮' },
            { name: 'Reddit', url: 'https://reddit.com', emoji: '👾' },
            { name: 'Twitter/X', url: 'https://x.com', emoji: '🐦' },
            { name: 'Discord', url: 'https://discord.com/app', emoji: '💬' },
            { name: 'Spotify', url: 'https://open.spotify.com', emoji: '🎧' },
            { name: 'Netflix', url: 'https://netflix.com', emoji: '🎬' },
          ].map(site => (
            <button
              key={site.name}
              onClick={() => setSrc(`${INTERSTELLAR}/service/${encodeURIComponent(site.url)}`)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, padding: '5px 12px',
                color: 'white', cursor: 'pointer', fontSize: 12,
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            >
              {site.emoji} {site.name}
            </button>
          ))}
        </div>
      )}

      {/* Iframe */}
      <iframe
        src={src}
        style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
        allow="fullscreen microphone camera"
      />

    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '6px 10px',
  color: 'white', cursor: 'pointer', fontSize: 14,
  whiteSpace: 'nowrap',
  transition: 'background 0.2s'
}
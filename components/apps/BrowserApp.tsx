import { useState, useRef } from 'react'

const INTERSTELLAR = "https://sturdy-train-gxqpp5gpx55r3wxpp-8080.app.github.dev"

export default function BrowserApp() {
  const [currentUrl, setCurrentUrl] = useState(INTERSTELLAR)
  const [inputValue, setInputValue] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault()
    let url = inputValue.trim()
    if (!url) return
    if (!url.startsWith('http')) url = 'https://' + url
    
    // Using the proxy service route
    setCurrentUrl(`${INTERSTELLAR}/service/${encodeURIComponent(url)}`)
  }

  const goHome = () => {
    setCurrentUrl(INTERSTELLAR)
    setInputValue('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0f', color: 'white' }}>
      
      {/* Address Bar UI */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
        background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={navBtnStyle} onClick={goHome}>🏠</button>
        </div>

        <form onSubmit={handleNavigate} style={{ flex: 1 }}>
          <input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search or enter URL..."
            style={{
              width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20, padding: '6px 16px', color: '#ccc', fontSize: 13, outline: 'none'
            }}
          />
        </form>

        <div style={{ display: 'flex', gap: 8 }}>
          <button style={navBtnStyle} onClick={() => setCurrentUrl(`${INTERSTELLAR}/g`)}>🎮</button>
          <button style={navBtnStyle} onClick={() => window.open(currentUrl, '_blank')}>↗️</button>
        </div>
      </div>

      {/* Browser Body */}
      <div style={{ flex: 1, position: 'relative' }}>
        {currentUrl === INTERSTELLAR && (
           <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', gap: 30 }}>
              <h1 style={{ fontSize: 48, fontWeight: 200, letterSpacing: 8, opacity: 0.8 }}>TROY <span style={{ fontWeight: 800 }}>WEB</span></h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 600 }}>
                <QuickLink name="YouTube" icon="▶️" url="https://youtube.com" onClick={setCurrentUrl} />
                <QuickLink name="Discord" icon="💬" url="https://discord.com" onClick={setCurrentUrl} />
                <QuickLink name="TikTok" icon="🎵" url="https://tiktok.com" onClick={setCurrentUrl} />
                <QuickLink name="GitHub" icon="🐙" url="https://github.com" onClick={setCurrentUrl} />
              </div>
           </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={currentUrl}
          style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
          allow="fullscreen; microphone; camera; gamepad"
          sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-popups"
        />
      </div>
    </div>
  )
}

const navBtnStyle = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'white', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer'
}

function QuickLink({ name, icon, url, onClick }: any) {
  return (
    <div 
      onClick={() => onClick(`${INTERSTELLAR}/service/${encodeURIComponent(url)}`)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', width: 100
      }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 700 }}>{name}</span>
    </div>
  )
}
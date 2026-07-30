import React from 'react'

// Colors for the 8 official SCENVY modules
export const MODULE_COLORS = {
  scenvy: { primary: '#8B5CF6', secondary: '#EC4899', bg: '#090818', label: 'Main Portal', domain: 'app.scenvy.de' },
  flow:   { primary: '#8B5CF6', secondary: '#6366F1', bg: '#1E1035', label: 'Content Feed', domain: 'flow.scenvy.de' },
  menu:   { primary: '#F97316', secondary: '#EA580C', bg: '#2A1208', label: 'Digital Menus', domain: 'menu.scenvy.de' },
  board:  { primary: '#3B82F6', secondary: '#1D4ED8', bg: '#0A192F', label: 'Digital Signage', domain: 'board.scenvy.de' },
  host:   { primary: '#10B981', secondary: '#047857', bg: '#062016', label: 'Guest Experience', domain: 'host.scenvy.de' },
  link:   { primary: '#06B6D4', secondary: '#0284C7', bg: '#08212D', label: 'NFC & QR Solutions', domain: 'link.scenvy.de' },
  store:  { primary: '#64748B', secondary: '#334155', bg: '#111827', label: 'Hardware & More', domain: 'store.scenvy.de' },
  magic:  { primary: '#A855F7', secondary: '#C026D3', bg: '#23092E', label: 'AI Automation', domain: 'magic.scenvy.de' }
}

// 1. OFFICIAL APP ICONS (Matching reference image precisely)
export function ScenvyAppIcon({ module = 'scenvy', size = 64, className = '', style = {} }) {
  const roundedSize = Math.round(size * 0.22)

  const renderIconContent = () => {
    switch (module.toLowerCase()) {
      case 'scenvy':
        return (
          // Stylized S with speed lines
          <g transform="translate(18, 18) scale(1.1)">
            <path d="M42 8 C 22 8, 8 20, 8 36 C 8 50, 20 58, 38 62 L 46 64 C 58 67, 66 73, 66 84 C 66 98, 50 108, 30 108 C 16 108, 8 102, 4 96" stroke="url(#scenvy_s_grad)" strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M12 18 L 32 18" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
            <path d="M44 98 L 68 98" stroke="#EC4899" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
          </g>
        )
      case 'flow':
        return (
          // Rounded Play Triangle
          <path d="M28 20 C28 17.5 30.8 16 33 17.3 L68 37.3 C70.2 38.6 70.2 41.4 68 42.7 L33 62.7 C30.8 64 28 62.5 28 60 Z" fill="#FFFFFF" />
        )
      case 'menu':
        return (
          // Menu List with 3 horizontal bars + 3 left dots
          <g fill="#FFFFFF">
            <circle cx="22" cy="26" r="5" />
            <rect x="34" y="22" width="34" height="8" rx="4" />
            <circle cx="22" cy="40" r="5" />
            <rect x="34" y="36" width="34" height="8" rx="4" />
            <circle cx="22" cy="54" r="5" />
            <rect x="34" y="50" width="34" height="8" rx="4" />
          </g>
        )
      case 'board':
        return (
          // TV / Digital Signage Screen with Stand
          <g fill="#FFFFFF">
            <rect x="18" y="20" width="44" height="30" rx="4" stroke="#FFFFFF" strokeWidth="3" fill="none" />
            <rect x="23" y="25" width="34" height="20" rx="2" fill="#FFFFFF" opacity="0.9" />
            <path d="M34 50 L46 50 L48 58 L32 58 Z" />
            <rect x="28" y="58" width="24" height="4" rx="2" />
          </g>
        )
      case 'host':
        return (
          // Concierge Service Bell / Cloche
          <g fill="#FFFFFF">
            <path d="M40 20 C26 20 18 32 18 42 L62 42 C62 32 54 20 40 20 Z" />
            <circle cx="40" cy="16" r="4" />
            <rect x="14" y="44" width="52" height="6" rx="3" />
            <rect x="30" y="52" width="20" height="4" rx="2" />
          </g>
        )
      case 'link':
        return (
          // Interlocking Chain Links
          <g stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none">
            <rect x="18" y="28" width="28" height="18" rx="9" transform="rotate(-35 32 37)" />
            <rect x="34" y="34" width="28" height="18" rx="9" transform="rotate(-35 48 43)" />
          </g>
        )
      case 'store':
        return (
          // Shopping Bag with Handles
          <g fill="#FFFFFF">
            <path d="M22 28 L58 28 L54 60 L26 60 Z" />
            <path d="M32 28 C32 20 48 20 48 28" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        )
      case 'magic':
        return (
          // 3 Four-Point Sparkle Stars
          <g fill="#FFFFFF">
            {/* Main Sparkle */}
            <path d="M42 16 Q42 32 58 32 Q42 32 42 48 Q42 32 26 32 Q42 32 42 16 Z" />
            {/* Secondary Sparkle */}
            <path d="M22 46 Q22 54 30 54 Q22 54 22 62 Q22 54 14 54 Q22 54 22 46 Z" opacity="0.85" />
            {/* Small Sparkle */}
            <path d="M58 48 Q58 53 63 53 Q58 53 58 58 Q58 53 53 53 Q58 53 58 48 Z" opacity="0.8" />
          </g>
        )
      default:
        return null
    }
  }

  const getGradients = () => {
    switch (module.toLowerCase()) {
      case 'scenvy':
        return { bg1: '#130C2E', bg2: '#06040E', stroke: '#8B5CF6' }
      case 'flow':
        return { bg1: '#8B5CF6', bg2: '#5B21B6', stroke: '#A78BFA' }
      case 'menu':
        return { bg1: '#F97316', bg2: '#C2410C', stroke: '#FDBA74' }
      case 'board':
        return { bg1: '#3B82F6', bg2: '#1D4ED8', stroke: '#93C5FD' }
      case 'host':
        return { bg1: '#10B981', bg2: '#047857', stroke: '#6EE7B7' }
      case 'link':
        return { bg1: '#06B6D4', bg2: '#0284C7', stroke: '#67E8F9' }
      case 'store':
        return { bg1: '#475569', bg2: '#1E293B', stroke: '#94A3B8' }
      case 'magic':
        return { bg1: '#A855F7', bg2: '#701A75', stroke: '#E9D5FF' }
      default:
        return { bg1: '#7C3AED', bg2: '#4C1D95', stroke: '#A78BFA' }
    }
  }

  const grad = getGradients()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={className}
      style={{
        borderRadius: roundedSize,
        boxShadow: `0 ${Math.round(size*0.1)}px ${Math.round(size*0.3)}px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.3)`,
        flexShrink: 0,
        ...style
      }}
    >
      <defs>
        <linearGradient id={`bg_${module}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={grad.bg1} />
          <stop offset="100%" stopColor={grad.bg2} />
        </linearGradient>
        <linearGradient id="scenvy_s_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>

      {/* Squircle Background */}
      <rect width="80" height="80" rx="20" fill={`url(#bg_${module})`} />
      <rect x="1" y="1" width="78" height="78" rx="19" fill="none" stroke={grad.stroke} strokeOpacity="0.3" strokeWidth="1.5" />

      {/* Icon Graphic */}
      {renderIconContent()}
    </svg>
  )
}

// 2. SMARTPHONE SPLASH SCREEN MOCKUP (Matching upper-right section of reference image)
export function ScenvyPhoneMockup({ module = 'flow', size = 'normal', active = false }) {
  const config = MODULE_COLORS[module] || MODULE_COLORS.flow
  const isLarge = size === 'large'
  const w = isLarge ? 220 : 160
  const h = isLarge ? 420 : 310

  const getSubtext = () => {
    switch (module) {
      case 'scenvy': return 'Connect. Engage. Elevate.'
      case 'flow': return 'VERTICAL CONTENT REELS'
      case 'menu': return 'INTERACTIVE DIGITAL MENU'
      case 'board': return 'SMART DIGITAL SIGNAGE'
      case 'host': return 'GUEST EXPERIENCE & STAY'
      case 'link': return 'NFC & SMART QR CONNECT'
      case 'store': return 'HARDWARE & KIOSKS'
      case 'magic': return 'AI CONTENT AUTOMATION'
      default: return 'HOSPITALITY ECOSYSTEM'
    }
  }

  const getBackgroundBg = () => {
    switch (module) {
      case 'menu':
        return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80'
      case 'board':
        return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80'
      case 'host':
        return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80'
      case 'store':
        return 'https://images.unsplash.com/photo-1556742049-0a6745814526?w=400&q=80'
      default:
        return null
    }
  }

  const bgImg = getBackgroundBg()

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 32,
        background: '#090812',
        border: `2px solid rgba(255,255,255,0.15)`,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: active ? `0 12px 40px ${config.primary}66, 0 0 0 2px ${config.primary}` : `0 10px 30px rgba(0,0,0,0.6)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 12px 14px',
        flexShrink: 0,
        transition: 'transform 0.3s ease, boxShadow 0.3s ease',
        cursor: 'pointer'
      }}
    >
      {/* Dynamic Island / Notch */}
      <div style={{ position: 'absolute', top: 8, width: 50, height: 12, borderRadius: 10, background: '#000000', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6 }}>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#10B981' }} />
      </div>

      {/* Ambient Color Glow Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 30%, ${config.primary}44 0%, ${config.bg} 80%)`,
          zIndex: 1
        }}
      />

      {/* Background Image overlay if applicable */}
      {bgImg && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            backgroundImage: `url(${bgImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.35,
            maskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
            zIndex: 2
          }}
        />
      )}

      {/* Center Content */}
      <div style={{ zIndex: 5, marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <ScenvyAppIcon module={module} size={isLarge ? 60 : 48} />
        <div style={{ marginTop: 12, fontSize: isLarge ? 14 : 11, fontWeight: 900, letterSpacing: 2, color: '#FFFFFF', textTransform: 'uppercase' }}>
          SCENVY
        </div>
        <div style={{ fontSize: isLarge ? 16 : 13, fontWeight: 900, letterSpacing: 1, color: config.primary, textTransform: 'uppercase', marginTop: 2 }}>
          {module.toUpperCase()}
        </div>
        <div style={{ fontSize: isLarge ? 9 : 8, color: 'rgba(255,255,255,0.6)', marginTop: 4, padding: '0 8px', letterSpacing: 0.5 }}>
          {getSubtext()}
        </div>
      </div>

      {/* Home Bar Indicator at bottom */}
      <div style={{ zIndex: 5, width: 40, height: 3, borderRadius: 2, background: config.primary, opacity: 0.8 }} />
    </div>
  )
}

// 3. FULL WEBSITE HERO MOCKUP COMPONENT (Laptop + Standing Kiosk Display + Smartphone + Module Bar)
export function ScenvyHeroShowcase() {
  return (
    <div style={{ width: '100%', position: 'relative', marginTop: 40, marginBottom: 20 }}>
      {/* Main Container Frame */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(15,12,35,0.8) 0%, rgba(8,6,20,0.95) 100%)',
          border: '1px solid rgba(139,92,246,0.25)',
          borderRadius: 28,
          padding: '32px 24px 24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          overflow: 'hidden'
        }}
      >
        {/* Device Composition Row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 24, width: '100%', flexWrap: 'wrap' }}>
          
          {/* Laptop Mockup (Dashboard) */}
          <div style={{ flex: '1 1 360px', maxWidth: 520, position: 'relative' }}>
            {/* Screen */}
            <div style={{ background: '#0F172A', borderRadius: '16px 16px 0 0', border: '3px solid #334155', borderBottom: 'none', padding: 12, height: 260, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.7)' }}>
              {/* Header bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 8, mb: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                </div>
                <div style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace' }}>app.scenvy.de/dashboard</div>
                <div style={{ fontSize: 9, color: '#8B5CF6', fontWeight: 700 }}>● LIVE</div>
              </div>
              {/* Dashboard Content Mock */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { label: 'Views', val: '12.4K', change: '+18.2%' },
                  { label: 'Interactions', val: '8.6K', change: '+21.4%' },
                  { label: 'Screens', val: '23', change: 'Online' },
                  { label: 'Conversion', val: '4.8%', change: '+13.7%' }
                ].map((st, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 9, color: '#94A3B8' }}>{st.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#FFF' }}>{st.val}</div>
                    <div style={{ fontSize: 8, color: '#10B981', fontWeight: 700 }}>{st.change}</div>
                  </div>
                ))}
              </div>
              {/* Chart Mock */}
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 12, height: 130, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#CBD5E1', marginBottom: 8 }}>Revenue Analytics & Reel CTR</div>
                <svg width="100%" height="80" viewBox="0 0 300 80">
                  <path d="M0,60 Q50,20 100,45 T200,15 T300,30 L300,80 L0,80 Z" fill="url(#dash_chart_grad)" opacity="0.3" />
                  <path d="M0,60 Q50,20 100,45 T200,15 T300,30" fill="none" stroke="#8B5CF6" strokeWidth="3" />
                  <defs>
                    <linearGradient id="dash_chart_grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            {/* Laptop Base */}
            <div style={{ background: '#1E293B', height: 12, borderRadius: '0 0 12px 12px', border: '2px solid #334155', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 60, height: 4, background: '#475569', borderRadius: '0 0 4px 4px' }} />
            </div>
          </div>

          {/* Standing Vertical Kiosk Display ("TODAY'S SPECIAL GRILLED SALMON") */}
          <div style={{ flex: '0 0 180px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: 170,
                height: 290,
                borderRadius: 16,
                background: '#090812',
                border: '4px solid #1E293B',
                boxShadow: '0 12px 30px rgba(59,130,246,0.3), inset 0 0 20px rgba(0,0,0,0.8)',
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ fontSize: 8, fontWeight: 800, color: '#F97316', letterSpacing: 1.5, textAlign: 'center', textTransform: 'uppercase' }}>
                TODAY'S SPECIAL
              </div>
              <div style={{ textAlign: 'center', margin: '6px 0' }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#FFF', leading: 1.1 }}>GRILLED SALMON</div>
                <div style={{ fontSize: 8, color: '#94A3B8', marginTop: 2 }}>with Lemon Butter Sauce</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#F97316', marginTop: 4 }}>€ 24,50</div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&q=80"
                alt="Salmon Special"
                style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: 6, display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <div style={{ width: 32, height: 32, background: '#FFF', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* QR Code Icon */}
                  <div style={{ fontSize: 16 }}>🏁</div>
                </div>
                <div style={{ fontSize: 7, color: '#E2E8F0', fontWeight: 700 }}>
                  SCAN TO VIEW MENU & ORDER
                </div>
              </div>
            </div>
            {/* Kiosk Stand */}
            <div style={{ width: 12, height: 20, background: '#334155' }} />
            <div style={{ width: 80, height: 6, background: '#1E293B', borderRadius: 4 }} />
          </div>

          {/* Smartphone Mockup ("Welcome Enjoy Your Stay") */}
          <div style={{ flex: '0 0 130px' }}>
            <ScenvyPhoneMockup module="host" size="normal" active={true} />
          </div>

        </div>

        {/* Bottom 7-Module Bar (Flow, Menu, Board, Host, Link, Store, Magic) */}
        <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
            {[
              { id: 'flow', name: 'SCENVY FLOW', label: 'Content Feed', color: '#8B5CF6' },
              { id: 'menu', name: 'SCENVY MENU', label: 'Digital Menus', color: '#F97316' },
              { id: 'board', name: 'SCENVY BOARD', label: 'Digital Signage', color: '#3B82F6' },
              { id: 'host', name: 'SCENVY HOST', label: 'Guest Experience', color: '#10B981' },
              { id: 'link', name: 'SCENVY LINK', label: 'NFC & QR Solutions', color: '#06B6D4' },
              { id: 'store', name: 'SCENVY STORE', label: 'Hardware & More', color: '#64748B' },
              { id: 'magic', name: 'SCENVY MAGIC', label: 'AI Automation', color: '#A855F7' }
            ].map((m) => (
              <div
                key={m.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${m.color}33`,
                  borderRadius: 12,
                  padding: '10px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: `0 4px 12px ${m.color}11`
                }}
              >
                <ScenvyAppIcon module={m.id} size={32} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: '#FFFFFF', whiteSpace: 'nowrap' }}>{m.name}</div>
                  <div style={{ fontSize: 8, color: m.color, fontWeight: 700, whiteSpace: 'nowrap' }}>{m.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

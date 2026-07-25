import React from 'react'

/**
 * SCENVY Iconic Ribbon 'S' Logo (Clean Vector SVG)
 */
export function ScenvyLogoIcon({ size = 32, className = '', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <defs>
        <linearGradient id="scenvyGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F2FE" />
          <stop offset="40%" stopColor="#8B5CF6" />
          <stop offset="80%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
        <linearGradient id="scenvyGradShine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <filter id="scenvyGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#8B5CF6" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter="url(#scenvyGlow)">
        {/* Outer Ribbon 3D S Curve */}
        <path
          d="M 72 24 C 82 24 86 36 78 46 C 68 58 38 52 24 64 C 14 74 18 86 32 90 C 46 94 68 88 80 80"
          stroke="url(#scenvyGradMain)"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner Overlapping Loop */}
        <path
          d="M 78 26 C 66 14 38 12 24 22 C 12 32 16 48 32 52 C 48 56 68 62 76 70"
          stroke="url(#scenvyGradMain)"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Glossy Top Overlay */}
        <path
          d="M 78 26 C 66 14 38 12 24 22 C 12 32 16 48 32 52"
          stroke="url(#scenvyGradShine)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Sprocket Filmstrip Perforations */}
        <circle cx="30" cy="20" r="2" fill="#FFFFFF" opacity="0.9" />
        <circle cx="44" cy="18" r="2" fill="#FFFFFF" opacity="0.9" />
        <circle cx="58" cy="19" r="2" fill="#FFFFFF" opacity="0.9" />
        <circle cx="70" cy="22" r="2" fill="#FFFFFF" opacity="0.9" />

        <circle cx="28" cy="80" r="2" fill="#FFFFFF" opacity="0.9" />
        <circle cx="40" cy="84" r="2" fill="#FFFFFF" opacity="0.9" />
        <circle cx="54" cy="86" r="2" fill="#FFFFFF" opacity="0.9" />
        <circle cx="68" cy="82" r="2" fill="#FFFFFF" opacity="0.9" />
      </g>
    </svg>
  )
}

/**
 * SCENVY Full Horizontal Logo
 */
export function ScenvyLogoFull({ height = 36, className = '', style = {} }) {
  const iconSize = Math.round(height * 1.1)
  const fontSize = Math.round(height * 0.72)

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.round(height * 0.28),
        userSelect: 'none',
        verticalAlign: 'middle',
        ...style,
      }}
      className={className}
    >
      <ScenvyLogoIcon size={iconSize} />
      <span
        style={{
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: `${fontSize}px`,
          letterSpacing: '0.06em',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span style={{ color: '#FFFFFF' }}>SCEN</span>
        <span
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          V
        </span>
        <span
          style={{
            background: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Y
        </span>
      </span>
    </div>
  )
}

/**
 * SCENVY Circular Emblem Badge Logo
 */
export function ScenvyLogoBadge({ size = 160, className = '', style = {} }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#0D0D14',
        border: '2px solid #7C3AED',
        boxShadow: '0 0 25px rgba(124, 58, 237, 0.35)',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
      className={className}
    >
      {/* Curved Text SVG Overlay */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <defs>
          <path id="topCirclePath" d="M 30,100 A 70,70 0 1,1 170,100" />
          <path id="bottomCirclePath" d="M 170,100 A 70,70 0 0,1 30,100" />
        </defs>

        <text fill="#FFFFFF" fontSize="13" fontWeight="800" letterSpacing="3">
          <textPath href="#topCirclePath" startOffset="50%" textAnchor="middle">
            • SCENVY •
          </textPath>
        </text>

        <text fill="#A78BFA" fontSize="8.5" fontWeight="700" letterSpacing="1.5">
          <textPath href="#bottomCirclePath" startOffset="50%" textAnchor="middle">
            • A SCROLLABLE EXPERIENCE •
          </textPath>
        </text>
      </svg>

      {/* Center Icon */}
      <ScenvyLogoIcon size={Math.round(size * 0.42)} />
    </div>
  )
}

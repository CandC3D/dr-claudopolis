import React from 'react';

function BuddyEye({ cx, state, volume }) {
  // Simple dark eyes — small circles, not cartoon ovals
  const baseR = 8;
  const r = state === 'speaking' ? baseR + volume * 1.5 : state === 'error' ? baseR - 1 : state === 'thinking' ? baseR - 0.5 : baseR;
  const cy = state === 'thinking' ? -3 : state === 'error' ? 1 : state === 'speaking' ? -volume * 2 : 0;
  const eyeColor = state === 'error' ? '#546E7A' : '#4A148C';
  const highlightR = state === 'speaking' ? 3 + volume : 2.5;

  return (
    <g transform={`translate(${cx}, 0)`}>
      {/* Main eye — solid dark circle */}
      <circle
        r={r} cy={cy}
        fill={eyeColor}
        style={{ transition: 'r 0.2s ease, cy 0.3s ease, fill 0.3s ease' }}
      />
      {/* Highlight — gives life */}
      <circle
        r={highlightR} cx={-2.5} cy={cy - 2.5}
        fill="white"
        opacity={state === 'error' ? 0.3 : 0.85}
        style={{ transition: 'cy 0.3s ease, r 0.15s ease' }}
      />
      {/* Secondary highlight */}
      <circle
        r={1.2} cx={3} cy={cy + 2}
        fill="white" opacity={0.3}
        style={{ transition: 'cy 0.3s ease' }}
      />
      {/* Thinking: orbital dots */}
      {state === 'thinking' && (
        <g style={{ animation: 'buddyPupilSpin 2s linear infinite' }}>
          {[0, 120, 240].map((deg) => (
            <circle
              key={deg}
              r={1.5}
              cx={Math.cos((deg * Math.PI) / 180) * 13}
              cy={cy + Math.sin((deg * Math.PI) / 180) * 13}
              fill="#CE93D8"
              opacity={0.7}
            />
          ))}
        </g>
      )}
      {/* Blink eyelid — slides down from top */}
      {state === 'idle' && (
        <rect
          x={-r - 2} y={-r - 4} width={(r + 2) * 2} height={r * 2 + 4}
          fill="#37474F" rx={2}
          style={{
            transformOrigin: `${cx}px ${-r - 4}px`,
            transform: 'scaleY(0)',
            animation: 'buddyBlink 5s ease-in-out infinite',
          }}
        />
      )}
      {/* Error: half-closed lids */}
      {state === 'error' && (
        <rect
          x={-r - 2} y={-r - 4} width={(r + 2) * 2} height={r + 2}
          fill="#37474F" rx={2}
          opacity={0.6}
          style={{ transition: 'all 0.3s ease' }}
        />
      )}
    </g>
  );
}

export default function BuddyRobot({ state, volume, onClick }) {
  // Subtle mouth — barely there in idle, opens slightly when speaking
  const mouthD =
    state === 'error' ? 'M -6,22 Q 0,19 6,22'
    : state === 'thinking' ? 'M -5,21 Q 0,22 5,21'
    : state === 'speaking' ? `M -7,20 Q 0,${24 + volume * 4} 7,20`
    : 'M -6,20 Q 0,24 6,20';

  return (
    <svg
      viewBox="-100 -120 200 300"
      style={{
        width: '100%',
        maxWidth: 260,
        userSelect: 'none',
        cursor: state === 'speaking' ? 'pointer' : 'default',
        flexShrink: 0,
      }}
      onClick={onClick}
    >
      <defs>
        <filter id="buddyShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.12)" />
        </filter>
        <radialGradient id="headGrad" cx="45%" cy="30%">
          <stop offset="0%" stopColor="#FAFAFA" />
          <stop offset="100%" stopColor="#E0E0E0" />
        </radialGradient>
        <linearGradient id="visorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#37474F" />
          <stop offset="100%" stopColor="#263238" />
        </linearGradient>
        <radialGradient id="bodyGrad" cx="50%" cy="20%">
          <stop offset="0%" stopColor="#F5F5F5" />
          <stop offset="100%" stopColor="#E0E0E0" />
        </radialGradient>
        <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#90A4AE" />
          <stop offset="100%" stopColor="#78909C" />
        </linearGradient>
      </defs>

      {/* --- HEAD --- */}

      {/* Head cap / dome — subtle, like NAO's head top */}
      <ellipse cx="0" cy="-68" rx="35" ry="12" fill="url(#capGrad)" />
      <ellipse cx="0" cy="-68" rx="33" ry="10" fill="url(#capGrad)" opacity="0.6" />
      {/* Cap highlight */}
      <ellipse cx="-8" cy="-72" rx="12" ry="4" fill="white" opacity="0.15" />

      {/* Head body — rounded square, slightly taller than wide */}
      <rect
        x={-55} y={-72} width={110} height={105} rx={30} ry={30}
        fill="url(#headGrad)" stroke="#BDBDBD" strokeWidth={1.5}
        filter="url(#buddyShadow)"
      />

      {/* Eye band / visor — dark region framing the eyes */}
      <rect
        x={-48} y={-18} width={96} height={30} rx={10}
        fill="url(#visorGrad)" opacity={0.85}
      />
      {/* Visor highlight */}
      <rect
        x={-44} y={-16} width={88} height={4} rx={2}
        fill="white" opacity={0.06}
      />

      {/* Eyes */}
      <BuddyEye cx={-20} state={state} volume={volume} />
      <BuddyEye cx={20} state={state} volume={volume} />

      {/* Mouth — very subtle */}
      <path
        d={mouthD}
        fill="none" stroke="#9E9E9E" strokeWidth={1.5} strokeLinecap="round"
        style={{ transition: 'd 0.2s ease' }}
      />

      {/* Subtle panel line on forehead */}
      <line x1={-20} y1={-50} x2={20} y2={-50} stroke="#BDBDBD" strokeWidth={0.8} strokeLinecap="round" />

      {/* --- NECK --- */}
      <rect x={-15} y={33} width={30} height={18} rx={4} fill="#BDBDBD" />
      {/* Neck ring detail */}
      <rect x={-20} y={38} width={40} height={6} rx={3} fill="#90A4AE" />
      <rect x={-18} y={40} width={36} height={2} rx={1} fill="white" opacity={0.15} />

      {/* --- SHOULDERS / UPPER BODY --- */}
      <path
        d="M -55,58 Q -55,48 -20,48 L 20,48 Q 55,48 55,58 L 55,90 Q 55,100 45,100 L -45,100 Q -55,100 -55,90 Z"
        fill="url(#bodyGrad)" stroke="#BDBDBD" strokeWidth={1.5}
      />
      {/* Chest panel line */}
      <rect x={-18} y={60} width={36} height={24} rx={6} fill="none" stroke="#BDBDBD" strokeWidth={1} />
      {/* Chest accent dot */}
      <circle cx="0" cy="72" r="3" fill="#CE93D8" opacity={state === 'speaking' ? 0.6 + volume * 0.4 : state === 'thinking' ? 0.5 : 0.3} style={{ transition: 'opacity 0.2s' }} />

      {/* Shoulder curves */}
      <ellipse cx={-55} cy={60} rx={12} ry={18} fill="#E0E0E0" stroke="#BDBDBD" strokeWidth={1} />
      <ellipse cx={55} cy={60} rx={12} ry={18} fill="#E0E0E0" stroke="#BDBDBD" strokeWidth={1} />

      {/* --- STATUS --- */}
      <text
        x="0" y="125" textAnchor="middle"
        fill={state === 'error' ? '#EF9A9A' : '#9C27B0'}
        fontSize="7" fontFamily="'Segoe UI', system-ui, sans-serif" letterSpacing="2"
        fontWeight="500"
      >
        {state === 'idle' ? 'READY' : state === 'thinking' ? 'THINKING' : state === 'speaking' ? 'SPEAKING' : 'ERROR'}
      </text>
    </svg>
  );
}

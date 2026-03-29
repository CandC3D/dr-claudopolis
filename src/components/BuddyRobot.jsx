import React from 'react';

function BuddyEye({ cx, state, volume }) {
  // Eye geometry shifts per state
  const scleraRy = state === 'speaking' ? 23 : state === 'error' ? 17 : state === 'thinking' ? 22 : 20;
  const pupilR = state === 'speaking' ? 7 + volume * 2 : state === 'error' ? 4 : state === 'thinking' ? 5 : 6;
  const pupilY = state === 'thinking' ? -6 : state === 'error' ? 2 : state === 'speaking' ? -volume * 4 : 0;
  const irisColor = state === 'error' ? '#78909C' : '#9C27B0';
  const highlightOpacity = state === 'error' ? 0.3 : state === 'speaking' ? 0.7 + volume * 0.3 : 0.8;

  return (
    <g transform={`translate(${cx}, -25)`}>
      {/* Sclera */}
      <ellipse
        rx={22} ry={scleraRy}
        fill="white" stroke="#B0BEC5" strokeWidth={1.5}
        style={{ transition: 'ry 0.3s ease' }}
      />
      {/* Iris */}
      <circle
        r={12} cy={pupilY}
        fill={irisColor}
        style={{ transition: 'cy 0.3s ease, fill 0.3s ease' }}
      />
      {/* Pupil */}
      <circle
        r={pupilR} cy={pupilY}
        fill="#4A148C"
        style={{ transition: 'r 0.15s ease, cy 0.3s ease' }}
      />
      {/* Highlight */}
      <circle
        r={3} cx={-4} cy={pupilY - 4}
        fill="white" opacity={highlightOpacity}
        style={{ transition: 'cy 0.3s ease, opacity 0.2s ease' }}
      />
      {/* Thinking: orbital dots */}
      {state === 'thinking' && (
        <g style={{ animation: 'buddyPupilSpin 1.5s linear infinite' }}>
          {[0, 120, 240].map((deg) => (
            <circle
              key={deg}
              r={2}
              cx={Math.cos((deg * Math.PI) / 180) * 15}
              cy={pupilY + Math.sin((deg * Math.PI) / 180) * 15}
              fill="#CE93D8"
              opacity={0.8}
            />
          ))}
        </g>
      )}
      {/* Eyelid for blink (idle) and droop (error) */}
      <ellipse
        rx={23} ry={scleraRy + 1}
        fill={state === 'error' ? '#E8EAF6' : '#F5F5F5'}
        style={{
          transformOrigin: 'center top',
          transform: state === 'error' ? 'scaleY(0.35)' : 'scaleY(0)',
          animation: state === 'idle' ? 'buddyBlink 4s ease-in-out infinite' : 'none',
          transition: 'transform 0.3s ease',
        }}
      />
    </g>
  );
}

export default function BuddyRobot({ state, volume, onClick }) {
  // Mouth path
  const mouthD =
    state === 'error' ? 'M -12,40 Q 0,34 12,40'
    : state === 'thinking' ? 'M -12,37 Q 0,40 12,37'
    : state === 'speaking' ? `M -15,35 Q 0,${45 + volume * 10} 15,35`
    : 'M -15,35 Q 0,45 15,35';

  const antennaSpeed = state === 'thinking' ? '1s' : '2.5s';
  const cheekOpacity = state === 'speaking' ? 0.5 + volume * 0.2 : state === 'error' ? 0.2 : 0.4;

  return (
    <svg
      viewBox="-120 -140 240 280"
      style={{
        width: '100%',
        maxWidth: 300,
        userSelect: 'none',
        cursor: state === 'speaking' ? 'pointer' : 'default',
        flexShrink: 0,
      }}
      onClick={onClick}
    >
      <defs>
        <filter id="buddyShadow">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,0.08)" />
        </filter>
        <filter id="cheekBlur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <radialGradient id="headGrad" cx="50%" cy="30%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0F0F0" />
        </radialGradient>
        <radialGradient id="antennaBallGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#81D4FA" />
          <stop offset="100%" stopColor="#4FC3F7" />
        </radialGradient>
      </defs>

      {/* Antenna */}
      <g style={{ transformOrigin: '0 -85px', animation: `buddyAntennaBob ${antennaSpeed} ease-in-out infinite` }}>
        <line x1="0" y1="-85" x2="0" y2="-108" stroke="#90CAF9" strokeWidth={3} strokeLinecap="round" />
        <circle cx="0" cy="-115" r={7} fill="url(#antennaBallGrad)" />
        <circle cx="-2" cy="-117" r={2} fill="white" opacity={0.6} />
      </g>

      {/* Head body */}
      <rect
        x={-75} y={-85} width={150} height={145} rx={55} ry={55}
        fill="url(#headGrad)" stroke="#B0BEC5" strokeWidth={2}
        filter="url(#buddyShadow)"
      />

      {/* Subtle ear bumps */}
      <circle cx={-68} cy={-20} r={12} fill="#E8EAF6" stroke="#B0BEC5" strokeWidth={1.5} />
      <circle cx={68} cy={-20} r={12} fill="#E8EAF6" stroke="#B0BEC5" strokeWidth={1.5} />

      {/* Eyes */}
      <BuddyEye cx={-28} state={state} volume={volume} />
      <BuddyEye cx={28} state={state} volume={volume} />

      {/* Cheeks */}
      <circle cx={-45} cy={15} r={12} fill="#FF8A80" opacity={cheekOpacity} filter="url(#cheekBlur)" />
      <circle cx={45} cy={15} r={12} fill="#FF8A80" opacity={cheekOpacity} filter="url(#cheekBlur)" />

      {/* Mouth */}
      <path
        d={mouthD}
        fill="none" stroke="#78909C" strokeWidth={2.5} strokeLinecap="round"
        style={{ transition: 'd 0.2s ease' }}
      />

      {/* Status text */}
      <text
        x="0" y="80" textAnchor="middle"
        fill={state === 'error' ? '#EF9A9A' : '#4FC3F7'}
        fontSize="8" fontFamily="'Segoe UI', system-ui, sans-serif" letterSpacing="2"
        fontWeight="600"
      >
        {state === 'idle' ? 'READY!' : state === 'thinking' ? 'THINKING...' : state === 'speaking' ? 'TALKING!' : 'OOPS...'}
      </text>
    </svg>
  );
}

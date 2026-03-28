import React from 'react';
import { COLORS } from '../constants';

function LEDRing({ radius, count, color, intensity, delay = 0, speed = 2000 }) {
  const leds = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    leds.push(
      <circle
        key={i}
        cx={x}
        cy={y}
        r={2.5}
        fill={color}
        opacity={0.25 + intensity * 0.75}
        style={{
          filter: intensity > 0.2 ? `drop-shadow(0 0 ${3 + intensity * 6}px ${color})` : 'none',
          animation: `ledPulse ${speed}ms ease-in-out infinite`,
          animationDelay: `${delay + (i / count) * speed}ms`,
        }}
      />
    );
  }
  return <>{leds}</>;
}

function TheopFace({ state, volume }) {
  const baseIntensity = state === 'idle' ? 0.3 : state === 'thinking' ? 0.5 : 0.6 + volume * 0.4;
  const bars = [
    { y: -18, w: 40 },
    { y: -4, w: 52 },
    { y: 10, w: 36 },
  ];

  return (
    <g>
      {bars.map((bar, i) => (
        <g key={i}>
          <rect
            x={-bar.w / 2} y={bar.y} width={bar.w} height={6} rx={3}
            fill={COLORS.primary}
            opacity={i === 1 ? baseIntensity : baseIntensity * 0.6}
            style={{
              filter: baseIntensity > 0.4 ? `drop-shadow(0 0 ${6 + volume * 10}px ${COLORS.primary})` : 'none',
              transition: 'opacity 0.15s, filter 0.15s',
            }}
          />
          {Array.from({ length: Math.floor(bar.w / 7) }).map((_, j) => (
            <rect
              key={j}
              x={-bar.w / 2 + j * 7 + 1} y={bar.y + 1} width={5} height={4} rx={1}
              fill={state === 'speaking' ? COLORS.highlight : COLORS.primary}
              opacity={baseIntensity * 0.8}
              style={{
                animation:
                  state === 'speaking'
                    ? `segPulse ${300 + j * 50}ms ease-in-out infinite alternate`
                    : state === 'thinking'
                      ? `thinkSweep 1.5s ease-in-out infinite`
                      : 'none',
                animationDelay: `${j * 60}ms`,
              }}
            />
          ))}
        </g>
      ))}
    </g>
  );
}

export default function TheopolisDisc({ state, volume, onClick }) {
  const intensity = state === 'idle' ? 0.2 : state === 'thinking' ? 0.5 : 0.4 + volume * 0.6;

  return (
    <svg
      viewBox="-160 -160 320 320"
      style={{
        width: '100%',
        maxWidth: 340,
        userSelect: 'none',
        cursor: state === 'speaking' ? 'pointer' : 'default',
        flexShrink: 0,
      }}
      onClick={onClick}
    >
      <defs>
        <radialGradient id="dB" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="60%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#0d0d0d" />
        </radialGradient>
        <radialGradient id="iG" cx="50%" cy="50%">
          <stop offset="0%" stopColor={COLORS.primary} stopOpacity={intensity * 0.15} />
          <stop offset="100%" stopColor={COLORS.primary} stopOpacity="0" />
        </radialGradient>
        <filter id="oG">
          <feGaussianBlur in="SourceGraphic" stdDeviation={2 + intensity * 4} />
        </filter>
      </defs>

      {/* Outer glow ring */}
      <circle cx="0" cy="0" r="152" fill="none" stroke={COLORS.primary} strokeWidth="1.5" opacity={intensity * 0.4} filter="url(#oG)" />

      {/* Main disc body */}
      <circle cx="0" cy="0" r="148" fill="url(#dB)" stroke="#555" strokeWidth="2" />

      {/* Concentric guide rings */}
      {[130, 110, 90, 70].map((r) => (
        <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="#2a2a2a" strokeWidth="0.8" opacity="0.6" />
      ))}

      {/* Inner glow */}
      <circle cx="0" cy="0" r="60" fill="url(#iG)" />

      {/* LED rings */}
      <LEDRing radius={140} count={48} color={COLORS.primary} intensity={intensity * 0.5} speed={4000} />
      <LEDRing radius={120} count={36} color={COLORS.primary} intensity={intensity * 0.7} delay={200} speed={3000} />
      <LEDRing radius={100} count={24} color={COLORS.highlight} intensity={intensity * 0.6} delay={400} speed={2500} />
      <LEDRing radius={78} count={16} color={COLORS.primary} intensity={intensity * 0.8} delay={600} speed={2000} />

      {/* Center panel */}
      <circle cx="0" cy="0" r="55" fill="#111" stroke="#333" strokeWidth="1.5" />

      {/* Face (status bars) */}
      <TheopFace state={state} volume={volume} />

      {/* Status text */}
      <text
        x="0" y="42" textAnchor="middle"
        fill={state === 'thinking' ? COLORS.accent : COLORS.primary}
        fontSize="7" fontFamily="'Courier New', monospace" letterSpacing="3"
        opacity={Math.max(intensity, 0.4)}
      >
        {state === 'idle' ? 'STANDBY' : state === 'thinking' ? '● PROCESSING' : state === 'speaking' ? 'TRANSMITTING' : 'STANDBY'}
      </text>
    </svg>
  );
}

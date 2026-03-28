import React, { useEffect, useRef } from 'react';
import { COLORS } from '../constants';

export default function Transcript({ history, state }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = panelRef.current.scrollHeight;
  }, [history]);

  if (history.length === 0 && state !== 'thinking') return null;

  return (
    <div
      ref={panelRef}
      style={{
        width: '100%',
        maxWidth: 440,
        maxHeight: 200,
        overflowY: 'auto',
        fontFamily: "'Courier New', monospace",
        fontSize: 12,
        color: COLORS.textDim,
        padding: '10px 14px',
        background: COLORS.bgPanel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 4,
        lineHeight: 1.6,
      }}
    >
      {history.map((msg, i) => (
        <div key={i} style={{ marginBottom: 8, opacity: 0.85 }}>
          <span style={{ color: msg.role === 'user' ? COLORS.accent : COLORS.primary, fontWeight: 700 }}>
            {msg.role === 'user' ? 'YOU' : 'THEOPOLIS'}
          </span>
          : {msg.content}
        </div>
      ))}
      {state === 'thinking' && (
        <div style={{ opacity: 0.4, fontStyle: 'italic' }}>
          Processing query<span style={{ animation: 'blink 1s step-end infinite' }}>...</span>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useRef } from 'react';

export default function Transcript({ history, state, colors, label, thinkingText, font }) {
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
        fontFamily: font,
        fontSize: 12,
        color: colors.textDim,
        padding: '10px 14px',
        background: colors.bgPanel,
        border: `1px solid ${colors.border}`,
        borderRadius: 4,
        lineHeight: 1.6,
      }}
    >
      {history.map((msg, i) => (
        <div key={i} style={{ marginBottom: 8, opacity: 0.85 }}>
          <span style={{ color: msg.role === 'user' ? colors.accent : colors.primary, fontWeight: 700 }}>
            {msg.role === 'user' ? 'YOU' : label}
          </span>
          : {msg.content}
        </div>
      ))}
      {state === 'thinking' && (
        <div style={{ opacity: 0.4, fontStyle: 'italic' }}>
          {thinkingText}<span style={{ animation: 'blink 1s step-end infinite' }}>...</span>
        </div>
      )}
    </div>
  );
}

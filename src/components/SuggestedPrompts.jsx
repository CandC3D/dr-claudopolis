import React from 'react';

export default function SuggestedPrompts({ prompts, onSelect, colors, font }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 440, gap: 6 }}>
      {prompts.map((prompt, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(prompt)}
          style={{
            background: colors.bgPanel,
            border: `1px solid ${colors.border}`,
            borderRadius: 4,
            padding: '8px 14px',
            color: colors.textDim,
            fontFamily: font,
            fontSize: 12,
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = colors.primary;
            e.target.style.color = colors.primary;
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = colors.border;
            e.target.style.color = colors.textDim;
          }}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

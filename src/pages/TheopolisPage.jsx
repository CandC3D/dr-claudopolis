import React, { useEffect } from 'react';
import TheopolisDisc from '../components/TheopolisDisc';
import Transcript from '../components/Transcript';
import useChatEngine from '../hooks/useChatEngine';
import * as config from '../config/theopolis';

export default function TheopolisPage() {
  const engine = useChatEngine(config.SYSTEM_PROMPT, config.VOICE_CONFIG);

  useEffect(() => { document.title = config.TITLE; }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: config.BACKGROUND,
        padding: '20px 16px',
        gap: 14,
        fontFamily: config.FONT,
      }}
    >
      <div style={{ color: config.COLORS.primary, fontSize: 10, letterSpacing: 6, textTransform: 'uppercase', opacity: 0.5 }}>
        {config.SUBTITLE}
      </div>

      <TheopolisDisc state={engine.state} volume={engine.volume} onClick={engine.state === 'speaking' ? engine.stopSpeaking : undefined} />

      {engine.state === 'speaking' && (
        <div style={{ color: '#7a6a3a', fontSize: 10, letterSpacing: 2 }}>TAP DISC TO INTERRUPT</div>
      )}

      <div style={{ display: 'flex', width: '100%', maxWidth: 440, gap: 8 }}>
        <input
          type="text"
          value={engine.input}
          onChange={(e) => engine.setInput(e.target.value)}
          onKeyDown={engine.handleKeyDown}
          placeholder={engine.disabled ? 'Processing...' : config.PLACEHOLDER}
          disabled={engine.disabled}
          autoComplete="off"
          style={{
            flex: 1,
            background: config.COLORS.bgInput,
            border: `1px solid ${config.COLORS.border}`,
            borderRadius: 4,
            padding: '10px 14px',
            color: config.COLORS.textInput,
            fontFamily: config.FONT,
            fontSize: 13,
            outline: 'none',
            caretColor: config.COLORS.primary,
          }}
          onFocus={(e) => (e.target.style.borderColor = config.COLORS.primary)}
          onBlur={(e) => (e.target.style.borderColor = config.COLORS.border)}
        />
        <button
          type="button"
          onClick={engine.sendMessage}
          disabled={engine.sendDisabled}
          style={{
            background: engine.sendDisabled ? 'rgba(60,50,30,0.4)' : 'rgba(232,168,23,0.15)',
            border: `1px solid ${engine.sendDisabled ? '#2a2510' : config.COLORS.primary}`,
            borderRadius: 4,
            padding: '10px 18px',
            color: engine.sendDisabled ? '#5a4a2a' : config.COLORS.primary,
            fontFamily: config.FONT,
            fontSize: 12,
            letterSpacing: 2,
            cursor: engine.sendDisabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          SEND
        </button>
      </div>

      {engine.error && (
        <div style={{
          width: '100%', maxWidth: 440, padding: '8px 12px',
          background: 'rgba(180,40,40,0.15)', border: '1px solid #663333',
          borderRadius: 4, color: '#cc6666', fontSize: 11, fontFamily: config.FONT,
        }}>
          ⚠ {engine.error}
        </div>
      )}

      <Transcript
        history={engine.history} state={engine.state}
        colors={config.COLORS} label={config.LABEL}
        thinkingText={config.THINKING_TEXT} font={config.FONT}
      />
    </div>
  );
}

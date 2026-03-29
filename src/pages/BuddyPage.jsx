import React, { useEffect } from 'react';
import BuddyRobot from '../components/BuddyRobot';
import Transcript from '../components/Transcript';
import SuggestedPrompts from '../components/SuggestedPrompts';
import useChatEngine from '../hooks/useChatEngine';
import * as config from '../config/buddy';

export default function BuddyPage() {
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
      <div style={{ color: config.COLORS.primary, fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.7, fontWeight: 600 }}>
        {config.SUBTITLE}
      </div>

      <BuddyRobot state={engine.state} volume={engine.volume} onClick={engine.state === 'speaking' ? engine.stopSpeaking : undefined} />

      {engine.state === 'speaking' && (
        <div style={{ color: '#90A4AE', fontSize: 10, letterSpacing: 2 }}>TAP BUDDY TO INTERRUPT</div>
      )}

      <div style={{ display: 'flex', width: '100%', maxWidth: 440, gap: 8 }}>
        <input
          type="text"
          value={engine.input}
          onChange={(e) => engine.setInput(e.target.value)}
          onKeyDown={engine.handleKeyDown}
          placeholder={engine.disabled ? 'Thinking...' : config.PLACEHOLDER}
          disabled={engine.disabled}
          autoComplete="off"
          style={{
            flex: 1,
            background: config.COLORS.bgInput,
            border: `1px solid ${config.COLORS.border}`,
            borderRadius: 20,
            padding: '10px 18px',
            color: config.COLORS.textInput,
            fontFamily: config.FONT,
            fontSize: 14,
            outline: 'none',
            caretColor: config.COLORS.primary,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
          onFocus={(e) => (e.target.style.borderColor = config.COLORS.primary)}
          onBlur={(e) => (e.target.style.borderColor = config.COLORS.border)}
        />
        <button
          type="button"
          onClick={engine.sendMessage}
          disabled={engine.sendDisabled}
          style={{
            background: engine.sendDisabled ? '#E0E0E0' : config.COLORS.primary,
            border: 'none',
            borderRadius: 20,
            padding: '10px 20px',
            color: engine.sendDisabled ? '#9E9E9E' : 'white',
            fontFamily: config.FONT,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1,
            cursor: engine.sendDisabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: engine.sendDisabled ? 'none' : '0 2px 6px rgba(79,195,247,0.3)',
          }}
        >
          Send
        </button>
      </div>

      {engine.history.length === 0 && engine.state === 'idle' && (
        <SuggestedPrompts
          prompts={config.SUGGESTED_PROMPTS}
          onSelect={(text) => engine.sendMessage(text)}
          colors={config.COLORS} font={config.FONT}
        />
      )}

      {engine.error && (
        <div style={{
          width: '100%', maxWidth: 440, padding: '8px 12px',
          background: 'rgba(239,154,154,0.15)', border: '1px solid #EF9A9A',
          borderRadius: 12, color: '#C62828', fontSize: 12, fontFamily: config.FONT,
        }}>
          Oops! {engine.error}
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

import React, { useState, useEffect, useRef, useCallback } from 'react';
import TheopolisDisc from './components/TheopolisDisc';
import Transcript from './components/Transcript';
import { SYSTEM_PROMPT, COLORS, BACKGROUND } from './constants';

export default function App() {
  const [state, setState] = useState('idle');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(0);
  const [input, setInput] = useState('');

  const historyRef = useRef([]);
  const animFrameRef = useRef(null);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // Preload voices on mount
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  const startVolumeTracking = useCallback(() => {
    const tick = () => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        setVolume(0.4 + Math.sin(Date.now() / 120) * 0.3 + Math.random() * 0.2);
      } else {
        setVolume(0);
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const stopVolumeTracking = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setVolume(0);
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) {
      setState('idle');
      return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95;
    utt.pitch = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.name.includes('Daniel') || v.name.includes('Google UK English Male') || v.name.includes('Aaron')
    );
    if (preferred) utt.voice = preferred;
    utt.onstart = () => { setState('speaking'); startVolumeTracking(); };
    utt.onend = () => { setState('idle'); stopVolumeTracking(); };
    utt.onerror = () => { setState('idle'); stopVolumeTracking(); };
    window.speechSynthesis.speak(utt);
  }, [startVolumeTracking, stopVolumeTracking]);

  const stopSpeaking = useCallback(() => {
    try { window.speechSynthesis.cancel(); } catch (_) {}
    stopVolumeTracking();
    setState('idle');
  }, [stopVolumeTracking]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || state === 'thinking') return;

    setError(null);
    setState('thinking');
    setInput('');

    const newHistory = [...historyRef.current, { role: 'user', content: text }];
    setHistory(newHistory);
    historyRef.current = newHistory;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.slice(-20),
          system: SYSTEM_PROMPT,
        }),
      });

      if (!res.ok) {
        let errMsg = `API returned ${res.status}`;
        try {
          const errData = await res.json();
          errMsg = errData.error?.message || errData.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await res.json();

      if (!data.content || !Array.isArray(data.content)) {
        throw new Error('Unexpected API response format');
      }

      const reply = data.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('\n');

      if (!reply) throw new Error('Empty response from API');

      const finalHistory = [...newHistory, { role: 'assistant', content: reply }];
      setHistory(finalHistory);
      historyRef.current = finalHistory;
      speak(reply);
    } catch (err) {
      setError(String(err.message || err));
      setState('idle');
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const disabled = state === 'thinking';
  const sendDisabled = disabled || !input.trim();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: BACKGROUND,
        padding: '20px 16px',
        gap: 14,
        fontFamily: "'Courier New', monospace",
      }}
    >
      {/* Title */}
      <div style={{ color: COLORS.primary, fontSize: 10, letterSpacing: 6, textTransform: 'uppercase', opacity: 0.5 }}>
        Computer Council Interface
      </div>

      {/* Disc */}
      <TheopolisDisc state={state} volume={volume} onClick={state === 'speaking' ? stopSpeaking : undefined} />

      {/* Interrupt hint */}
      {state === 'speaking' && (
        <div style={{ color: '#7a6a3a', fontSize: 10, letterSpacing: 2 }}>TAP DISC TO INTERRUPT</div>
      )}

      {/* Input area */}
      <div style={{ display: 'flex', width: '100%', maxWidth: 440, gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Processing...' : 'Address the Council...'}
          disabled={disabled}
          autoComplete="off"
          style={{
            flex: 1,
            background: COLORS.bgInput,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 4,
            padding: '10px 14px',
            color: COLORS.textInput,
            fontFamily: "'Courier New', monospace",
            fontSize: 13,
            outline: 'none',
            caretColor: COLORS.primary,
          }}
          onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
          onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={sendDisabled}
          style={{
            background: sendDisabled ? 'rgba(60,50,30,0.4)' : 'rgba(232,168,23,0.15)',
            border: `1px solid ${sendDisabled ? '#2a2510' : COLORS.primary}`,
            borderRadius: 4,
            padding: '10px 18px',
            color: sendDisabled ? '#5a4a2a' : COLORS.primary,
            fontFamily: "'Courier New', monospace",
            fontSize: 12,
            letterSpacing: 2,
            cursor: sendDisabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          SEND
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          width: '100%',
          maxWidth: 440,
          padding: '8px 12px',
          background: 'rgba(180,40,40,0.15)',
          border: '1px solid #663333',
          borderRadius: 4,
          color: '#cc6666',
          fontSize: 11,
          fontFamily: "'Courier New', monospace",
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Transcript */}
      <Transcript history={history} state={state} />
    </div>
  );
}

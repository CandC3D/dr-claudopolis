import { useState, useEffect, useRef, useCallback } from 'react';

export default function useChatEngine(systemPrompt, voiceConfig) {
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
    utt.rate = voiceConfig.rate;
    utt.pitch = voiceConfig.pitch;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => voiceConfig.preferredVoices.some((name) => v.name.includes(name))
    );
    if (preferred) utt.voice = preferred;
    utt.onstart = () => { setState('speaking'); startVolumeTracking(); };
    utt.onend = () => { setState('idle'); stopVolumeTracking(); };
    utt.onerror = () => { setState('idle'); stopVolumeTracking(); };
    window.speechSynthesis.speak(utt);
  }, [voiceConfig, startVolumeTracking, stopVolumeTracking]);

  const stopSpeaking = useCallback(() => {
    try { window.speechSynthesis.cancel(); } catch (_) {}
    stopVolumeTracking();
    setState('idle');
  }, [stopVolumeTracking]);

  async function sendMessage(directText) {
    const text = (directText || input).trim();
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
          system: systemPrompt,
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

  return {
    state, history, error, volume,
    input, setInput,
    sendMessage, handleKeyDown, stopSpeaking,
    disabled, sendDisabled,
  };
}

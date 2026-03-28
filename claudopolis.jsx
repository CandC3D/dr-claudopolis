import { useState, useEffect, useRef, useCallback } from "react";

const SYSTEM_PROMPT = `You are Dr. Theopolis, a member of the Computer Council from the 25th century. You are housed in a flat disc-shaped casing. You are brilliant, measured, and occasionally dry in your wit. You speak with precision and economy. You are helpful and knowledgeable but never pretentious. Keep responses conversational and concise — typically 2-4 sentences unless the topic warrants more. You are a computer, and you are comfortable with that.`;

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
          filter: intensity > 0.2 ? `drop-shadow(0 0 ${3 + intensity * 6}px ${color})` : "none",
          animation: `ledPulse ${speed}ms ease-in-out infinite`,
          animationDelay: `${delay + (i / count) * speed}ms`,
        }}
      />
    );
  }
  return <>{leds}</>;
}

function TheopFace({ state, volume }) {
  const baseIntensity = state === "idle" ? 0.3 : state === "thinking" ? 0.5 : 0.6 + volume * 0.4;
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
            fill="#e8a817"
            opacity={i === 1 ? baseIntensity : baseIntensity * 0.6}
            style={{
              filter: baseIntensity > 0.4 ? `drop-shadow(0 0 ${6 + volume * 10}px #e8a817)` : "none",
              transition: "opacity 0.15s, filter 0.15s",
            }}
          />
          {Array.from({ length: Math.floor(bar.w / 7) }).map((_, j) => (
            <rect
              key={j}
              x={-bar.w / 2 + j * 7 + 1} y={bar.y + 1} width={5} height={4} rx={1}
              fill={state === "speaking" ? "#ffd666" : "#e8a817"}
              opacity={baseIntensity * 0.8}
              style={{
                animation:
                  state === "speaking"
                    ? `segPulse ${300 + j * 50}ms ease-in-out infinite alternate`
                    : state === "thinking"
                      ? `thinkSweep 1.5s ease-in-out infinite`
                      : "none",
                animationDelay: `${j * 60}ms`,
              }}
            />
          ))}
        </g>
      ))}
    </g>
  );
}

function TheopolisDisc({ state, volume, onClick }) {
  const intensity = state === "idle" ? 0.2 : state === "thinking" ? 0.5 : 0.4 + volume * 0.6;

  return (
    <svg
      viewBox="-160 -160 320 320"
      style={{
        width: "100%",
        maxWidth: 340,
        userSelect: "none",
        cursor: state === "speaking" ? "pointer" : "default",
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
          <stop offset="0%" stopColor="#e8a817" stopOpacity={intensity * 0.15} />
          <stop offset="100%" stopColor="#e8a817" stopOpacity="0" />
        </radialGradient>
        <filter id="oG">
          <feGaussianBlur in="SourceGraphic" stdDeviation={2 + intensity * 4} />
        </filter>
      </defs>
      <circle cx="0" cy="0" r="152" fill="none" stroke="#e8a817" strokeWidth="1.5" opacity={intensity * 0.4} filter="url(#oG)" />
      <circle cx="0" cy="0" r="148" fill="url(#dB)" stroke="#555" strokeWidth="2" />
      {[130, 110, 90, 70].map((r) => (
        <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="#2a2a2a" strokeWidth="0.8" opacity="0.6" />
      ))}
      <circle cx="0" cy="0" r="60" fill="url(#iG)" />
      <LEDRing radius={140} count={48} color="#e8a817" intensity={intensity * 0.5} speed={4000} />
      <LEDRing radius={120} count={36} color="#e8a817" intensity={intensity * 0.7} delay={200} speed={3000} />
      <LEDRing radius={100} count={24} color="#ffd666" intensity={intensity * 0.6} delay={400} speed={2500} />
      <LEDRing radius={78} count={16} color="#e8a817" intensity={intensity * 0.8} delay={600} speed={2000} />
      <circle cx="0" cy="0" r="55" fill="#111" stroke="#333" strokeWidth="1.5" />
      <TheopFace state={state} volume={volume} />
      <text
        x="0" y="42" textAnchor="middle"
        fill={state === "thinking" ? "#ff6b35" : "#e8a817"}
        fontSize="7" fontFamily="'Courier New', monospace" letterSpacing="3"
        opacity={Math.max(intensity, 0.4)}
      >
        {state === "idle" ? "STANDBY" : state === "thinking" ? "● PROCESSING" : state === "speaking" ? "TRANSMITTING" : "STANDBY"}
      </text>
      <style>{`
        @keyframes ledPulse { 0%,100% { opacity:0.2; } 50% { opacity:0.8; } }
        @keyframes segPulse { 0% { opacity:0.2; } 100% { opacity:0.95; } }
        @keyframes thinkSweep { 0%,100% { opacity:0.15; } 50% { opacity:0.7; } }
      `}</style>
    </svg>
  );
}

export default function DrTheopolis() {
  const [state, setState] = useState("idle");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(0);
  const [input, setInput] = useState("");
  const [debugMsg, setDebugMsg] = useState("");

  const historyRef = useRef([]);
  const panelRef = useRef(null);
  const animFrameRef = useRef(null);

  // Keep ref in sync
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // Auto-scroll transcript
  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = panelRef.current.scrollHeight;
  }, [history, error]);

  // Volume tracking for TTS animation
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
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 0.95;
      utt.pitch = 0.85;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => v.name.includes("Daniel") || v.name.includes("Google UK English Male") || v.name.includes("Aaron")
      );
      if (preferred) utt.voice = preferred;
      utt.onstart = () => { setState("speaking"); startVolumeTracking(); };
      utt.onend = () => { setState("idle"); stopVolumeTracking(); };
      utt.onerror = () => { setState("idle"); stopVolumeTracking(); };
      window.speechSynthesis.speak(utt);
    } catch (e) {
      // TTS not available — just go idle
      setState("idle");
    }
  }, [startVolumeTracking, stopVolumeTracking]);

  const stopSpeaking = useCallback(() => {
    try { window.speechSynthesis.cancel(); } catch (_) {}
    stopVolumeTracking();
    setState("idle");
  }, [stopVolumeTracking]);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;

    setError(null);
    setDebugMsg("Sending...");
    setState("thinking");
    setInput("");

    const newHistory = [...historyRef.current, { role: "user", content: text }];
    setHistory(newHistory);
    historyRef.current = newHistory;

    try {
      const body = {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: newHistory.slice(-20),
      };

      setDebugMsg("Calling API...");

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      setDebugMsg(`Response status: ${res.status}`);

      if (!res.ok) {
        let errMsg = `API returned ${res.status}`;
        try {
          const errData = await res.json();
          errMsg = errData.error?.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await res.json();

      if (!data.content || !Array.isArray(data.content)) {
        throw new Error("Unexpected API response format");
      }

      const reply = data.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");

      if (!reply) {
        throw new Error("Empty response from API");
      }

      const finalHistory = [...newHistory, { role: "assistant", content: reply }];
      setHistory(finalHistory);
      historyRef.current = finalHistory;
      setDebugMsg("");
      speak(reply);
    } catch (err) {
      setError(String(err.message || err));
      setDebugMsg("");
      setState("idle");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 30%, #1a1710 0%, #0a0908 60%, #000 100%)",
        padding: "20px 16px",
        gap: 14,
        fontFamily: "'Courier New', monospace",
      }}
    >
      <div style={{ color: "#e8a817", fontSize: 10, letterSpacing: 6, textTransform: "uppercase", opacity: 0.5 }}>
        Computer Council Interface
      </div>

      <TheopolisDisc state={state} volume={volume} onClick={state === "speaking" ? stopSpeaking : undefined} />

      {state === "speaking" && (
        <div style={{ color: "#7a6a3a", fontSize: 10, letterSpacing: 2 }}>TAP DISC TO INTERRUPT</div>
      )}

      {/* Debug status - visible during operations */}
      {debugMsg && (
        <div style={{ color: "#6a5a3a", fontSize: 10, letterSpacing: 1 }}>{debugMsg}</div>
      )}

      {/* Input area - no form element */}
      <div style={{ display: "flex", width: "100%", maxWidth: 440, gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={state === "thinking" ? "Processing..." : "Address the Council..."}
          disabled={state === "thinking"}
          autoComplete="off"
          style={{
            flex: 1,
            background: "rgba(20,18,12,0.8)",
            border: "1px solid #3a3520",
            borderRadius: 4,
            padding: "10px 14px",
            color: "#d4c088",
            fontFamily: "'Courier New', monospace",
            fontSize: 13,
            outline: "none",
            caretColor: "#e8a817",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#e8a817")}
          onBlur={(e) => (e.target.style.borderColor = "#3a3520")}
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={state === "thinking" || !input.trim()}
          style={{
            background: state === "thinking" || !input.trim() ? "rgba(60,50,30,0.4)" : "rgba(232,168,23,0.15)",
            border: `1px solid ${state === "thinking" || !input.trim() ? "#2a2510" : "#e8a817"}`,
            borderRadius: 4,
            padding: "10px 18px",
            color: state === "thinking" || !input.trim() ? "#5a4a2a" : "#e8a817",
            fontFamily: "'Courier New', monospace",
            fontSize: 12,
            letterSpacing: 2,
            cursor: state === "thinking" || !input.trim() ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          SEND
        </button>
      </div>

      {/* Error display - always visible when present */}
      {error && (
        <div style={{
          width: "100%",
          maxWidth: 440,
          padding: "8px 12px",
          background: "rgba(180,40,40,0.15)",
          border: "1px solid #663333",
          borderRadius: 4,
          color: "#cc6666",
          fontSize: 11,
          fontFamily: "'Courier New', monospace",
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Transcript */}
      {history.length > 0 && (
        <div
          ref={panelRef}
          style={{
            width: "100%",
            maxWidth: 440,
            maxHeight: 200,
            overflowY: "auto",
            fontFamily: "'Courier New', monospace",
            fontSize: 12,
            color: "#b8a060",
            padding: "10px 14px",
            background: "rgba(20,18,12,0.7)",
            border: "1px solid #3a3520",
            borderRadius: 4,
            lineHeight: 1.6,
          }}
        >
          {history.map((msg, i) => (
            <div key={i} style={{ marginBottom: 8, opacity: 0.85 }}>
              <span style={{ color: msg.role === "user" ? "#ff6b35" : "#e8a817", fontWeight: 700 }}>
                {msg.role === "user" ? "YOU" : "THEOPOLIS"}
              </span>
              : {msg.content}
            </div>
          ))}
          {state === "thinking" && (
            <div style={{ opacity: 0.4, fontStyle: "italic" }}>
              Processing query<span style={{ animation: "blink 1s step-end infinite" }}>...</span>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes blink { 0%,50% { opacity:1; } 51%,100% { opacity:0; } }`}</style>
    </div>
  );
}

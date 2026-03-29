// Controlled variables — identical across both interfaces.
// Do not modify per-interface. See dr-claudopolis-instructions.md.

export const SYSTEM_PROMPT = `You are a helpful AI assistant. Answer the user's questions clearly and accurately.`;

export const VOICE_CONFIG = {
  preferredVoices: ['Daniel', 'Google UK English Male', 'Aaron'],
  rate: 0.95,
  pitch: 0.85,
};

export const SUGGESTED_PROMPTS = [
  'What can you help me with?',
  'Explain something surprising about how you work.',
  "What's the difference between knowledge and understanding?",
];

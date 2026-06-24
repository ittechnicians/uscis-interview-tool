// api/tts.js
// Vercel serverless function — turns the officer's text into natural speech
// using OpenAI Text-to-Speech. The OpenAI key is read from the server
// environment (OPENAI_API_KEY in Vercel) and is NEVER sent to the browser.
//
// The browser sends { text, officer } and gets back { audio } as base64 MP3,
// which it plays. If anything fails, the browser falls back to its own voice.

// Model: tts-1 is fast and inexpensive (~$15 / 1M characters). For higher
// fidelity you could switch to 'tts-1-hd'. Premium (ElevenLabs) is a separate step.
const TTS_MODEL = 'tts-1';

// Each officer gets a distinct OpenAI voice (all supported by tts-1).
// Voices available: alloy, ash, coral, echo, fable, nova, onyx, sage, shimmer.
const OFFICER_VOICES = {
  martinez:  'coral',   // Warm & thorough  (Miami)
  johnson:   'onyx',    // Strict & deep    (Washington DC)
  chen:      'sage',    // Modern & patient (San Francisco)
  rodriguez: 'echo',    // Bilingual expert (Los Angeles)
  williams:  'fable'    // Diplomatic       (Atlanta)
};
const DEFAULT_VOICE = 'alloy';

function pickVoice(officer) {
  if (!officer) return DEFAULT_VOICE;
  // officer may be the whole object { id, ... } or just an id string
  const id = (typeof officer === 'string') ? officer : officer.id;
  return OFFICER_VOICES[id] || DEFAULT_VOICE;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing OPENAI_API_KEY.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const text = (body.text || '').toString().trim();
    if (!text) {
      return res.status(400).json({ error: 'No text to speak.' });
    }

    const voice = pickVoice(body.officer);

    // tts-1 accepts up to 4,096 characters per request; keep a safe margin.
    const input = text.slice(0, 4000);

    const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: TTS_MODEL,
        voice: voice,
        input: input,
        response_format: 'mp3',
        speed: 1.0
      })
    });

    if (!ttsRes.ok) {
      let detail = '';
      try { detail = await ttsRes.text(); } catch (e) {}
      console.error('OpenAI TTS error:', ttsRes.status, detail);
      return res.status(502).json({ error: 'The voice service had a problem.' });
    }

    const arrayBuf = await ttsRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuf).toString('base64');

    return res.status(200).json({ audio: base64, voice: voice });
  } catch (err) {
    console.error('TTS handler error:', err);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
};

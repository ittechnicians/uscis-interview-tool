// api/transcribe.js
// Vercel serverless function — turns recorded audio into text using OpenAI Whisper.
// The browser records the applicant's answer, sends it here as base64 audio, and
// gets back the transcribed text. The OpenAI key stays on the server (OPENAI_API_KEY).
//
// This "record then transcribe" approach works reliably on iPhone/Safari, where the
// browser's live dictation stops after the first turn.

const TRANSCRIBE_MODEL = 'whisper-1'; // $0.006 / minute of audio

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
    const base64 = (body.audio || '').toString();
    if (!base64) {
      return res.status(400).json({ error: 'No audio received.' });
    }

    const mimeType = (body.mimeType || 'audio/webm').toString();
    // Choose a filename extension OpenAI recognizes, based on the mime type.
    let ext = 'webm';
    if (mimeType.indexOf('mp4') !== -1 || mimeType.indexOf('m4a') !== -1) ext = 'm4a';
    else if (mimeType.indexOf('ogg') !== -1) ext = 'ogg';
    else if (mimeType.indexOf('wav') !== -1) ext = 'wav';
    else if (mimeType.indexOf('mpeg') !== -1 || mimeType.indexOf('mp3') !== -1) ext = 'mp3';

    const audioBuffer = Buffer.from(base64, 'base64');

    // Build the multipart form for OpenAI (Node 18+ has global FormData / Blob / fetch).
    const form = new FormData();
    form.append('file', new Blob([audioBuffer], { type: mimeType }), 'answer.' + ext);
    form.append('model', TRANSCRIBE_MODEL);
    form.append('language', 'en'); // the interview is in English — improves accuracy

    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: form
    });

    if (!r.ok) {
      let detail = '';
      try { detail = await r.text(); } catch (e) {}
      console.error('OpenAI transcription error:', r.status, detail);
      return res.status(502).json({ error: 'The transcription service had a problem.' });
    }

    const data = await r.json();
    return res.status(200).json({ text: (data && data.text) ? data.text : '' });
  } catch (err) {
    console.error('Transcribe handler error:', err);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
};

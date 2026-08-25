// api/report.js
// Vercel serverless function — generates the post-interview evaluation report.
// Called by practice.html (mode: 'full_interview'), n400.html (mode: 'n400'),
// and live-interview.html (mode: 'live') after the interview ends.
// The OpenAI key is read from the server environment (OPENAI_API_KEY in Vercel).
// It is NEVER sent to the browser.

const MODEL = 'gpt-4.1-mini';

// Cap how much transcript we send — keeps cost bounded on very long interviews.
const MAX_TRANSCRIPT_MESSAGES = 80;

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
    const history = Array.isArray(body.history) ? body.history : [];
    const lang = (body.lang === 'es') ? 'es' : 'en';
    const mode = ['full_interview', 'n400', 'live'].includes(body.mode) ? body.mode : 'full_interview';

    const userTurns = history.filter(function (m) { return m && m.role === 'user'; }).length;

    // Not enough to grade — return a safe, honest fallback instead of erroring out.
    if (userTurns === 0) {
      return res.status(200).json({
        report: {
          verdict: 'practice',
          score: 0,
          strengths: [],
          improvements: lang === 'es'
            ? ['Completa una entrevista de práctica para recibir tu evaluación.']
            : ['Complete a practice interview to receive your evaluation.'],
          note: ''
        }
      });
    }

    const transcript = history
      .slice(-MAX_TRANSCRIPT_MESSAGES)
      .filter(function (m) { return m && (m.role === 'user' || m.role === 'assistant') && m.content; })
      .map(function (m) {
        const speaker = m.role === 'assistant' ? 'OFFICER' : 'APPLICANT';
        return speaker + ': ' + String(m.content).replace(/\[\[[^\]]*\]\]/g, '').trim();
      })
      .join('\n');

    const modeContext = {
      full_interview: lang === 'es'
        ? 'una entrevista completa de práctica de naturalización (juramento, preguntas del N-400, examen de educación cívica e inglés)'
        : 'a full mock naturalization interview (oath, N-400 questions, civics test, and English test)',
      n400: lang === 'es'
        ? 'una práctica enfocada únicamente en las preguntas de la solicitud N-400'
        : 'a focused practice of only the N-400 application questions',
      live: lang === 'es'
        ? 'una entrevista de práctica en vivo por voz con un oficial de USCIS simulado'
        : 'a live voice-based mock interview with a simulated USCIS officer'
    }[mode];

    const languageInstruction = lang === 'es'
      ? 'Escribe todo el contenido de texto (strengths, improvements, note) en español.'
      : 'Write all text content (strengths, improvements, note) in English.';

    const systemPrompt = `You are an experienced USCIS naturalization interview coach reviewing a transcript of ${modeContext}.

Grade the applicant's performance based ONLY on what is in the transcript below. Be fair, encouraging, and specific — reference actual answers they gave.

Return STRICT JSON ONLY (no markdown, no code fences, no commentary) with exactly this shape:
{
  "verdict": "ready" | "almost" | "practice",
  "score": <integer 0-100>,
  "strengths": [<up to 3 short strings, things the applicant did well>],
  "improvements": [<up to 3 short strings, specific things to focus on before the real interview>],
  "note": "<one short encouraging sentence>"
}

Guidance:
- "ready" (score roughly 85-100): answered clearly, confidently, and accurately with few or no mistakes.
- "almost" (score roughly 60-84): mostly solid but with a few notable gaps or mistakes.
- "practice" (score roughly 0-59): significant gaps, needs meaningfully more practice.
- Base the score on accuracy, completeness, and clarity of the applicant's actual answers in the transcript.
- Keep each strength/improvement short (under ~15 words), concrete, and specific to what happened in the transcript — not generic advice.
- ${languageInstruction}
- Output ONLY the JSON object, nothing else.`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'TRANSCRIPT:\n' + transcript }
        ],
        temperature: 0.4,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('OpenAI error (report):', errText);
      return res.status(502).json({ error: 'The report service had a problem. Please try again.' });
    }

    const data = await openaiRes.json();
    const raw = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '{}';

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error('Report JSON parse failed:', raw);
      return res.status(502).json({ error: 'Could not generate the report. Please try again.' });
    }

    const verdict = ['ready', 'almost', 'practice'].includes(parsed.verdict) ? parsed.verdict : 'almost';
    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
    const strengths = Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3).map(String) : [];
    const improvements = Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3).map(String) : [];
    const note = typeof parsed.note === 'string' ? parsed.note.slice(0, 300) : '';

    return res.status(200).json({
      report: { verdict, score, strengths, improvements, note }
    });
  } catch (err) {
    console.error('report.js error:', err);
    return res.status(500).json({ error: 'Something went wrong generating the report.' });
  }
};

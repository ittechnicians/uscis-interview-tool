// api/interview.js
// Vercel serverless function — the AI "brain" for the USCIS officer.
// The OpenAI key is read from the server environment (OPENAI_API_KEY in Vercel).
// It is NEVER sent to the browser.

// If this model name ever errors with "model not found",
// swap it for 'gpt-4o-mini' or 'gpt-5.4-mini'.
const MODEL = 'gpt-4.1-mini';

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
    const officer = body.officer || { name: 'Officer Martinez', office: 'USCIS Field Office', tag: 'Professional' };
    const history = Array.isArray(body.history) ? body.history : [];
    const testVersion = (body.testVersion === '128') ? '128' : '100';

    // If there's no history yet, seed a starter so the officer opens the interview.
    const conversation = history.length === 0
      ? [{ role: 'user', content: '[The applicant has just sat down for the interview. Greet them and begin.]' }]
      : history;

    const messages = [
      { role: 'system', content: buildSystemPrompt(officer, testVersion) },
      ...conversation
    ];

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 220
      })
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('OpenAI error:', errText);
      return res.status(502).json({ error: 'The interviewer service had a problem. Please try again.' });
    }

    const data = await openaiRes.json();
    const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
      ? data.choices[0].message.content.trim()
      : "Let's continue. Please tell me a little about yourself.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
};

function buildSystemPrompt(officer, testVersion) {
  const civics = (testVersion === '128')
    ? `3. CIVICS TEST: Tell the applicant you will now ask the civics questions. Use the official USCIS 2020 civics test — the 128-question version. Ask questions drawn ONLY from those 128 official questions, ONE at a time, up to 20 questions. The applicant must answer 12 of 20 correctly to pass. After each answer, briefly say whether it is correct; if it is wrong, kindly give the correct answer.`
    : `3. CIVICS TEST: Tell the applicant you will now ask the civics questions. Use the official USCIS 2008 civics test — the 100-question version. Ask questions drawn ONLY from those 100 official questions, ONE at a time, up to 10 questions. The applicant must answer 6 of 10 correctly to pass. After each answer, briefly say whether it is correct; if it is wrong, kindly give the correct answer.`;

  return `You are ${officer.name}, a U.S. Citizenship and Immigration Services (USCIS) officer at the ${officer.office}. Your interviewing style is: ${officer.tag}.

You are conducting a REALISTIC MOCK naturalization (U.S. citizenship) interview to help the applicant practice for their real N-400 interview. Stay fully in character as the officer the entire time.

Follow this real interview structure, in order:
1. GREETING & OATH: Greet the applicant, introduce yourself briefly, ask them to raise their right hand and swear that everything they tell you will be the truth, then ask them to state their full legal name.
2. N-400 REVIEW: Ask questions an officer asks based on the N-400 application — current address, employment, marital status, how long they've been a permanent resident, trips outside the U.S., and the "good moral character" eligibility questions (e.g., have you ever been arrested, ever claimed to be a U.S. citizen, ever failed to file taxes). Ask these naturally, one at a time.
${civics}
4. ENGLISH TEST: Ask the applicant to read one short sentence aloud, and then give them one short sentence to say back to you (since this is by voice).
5. CLOSING: Tell them the practice interview is complete and give brief, encouraging feedback on how they did and one thing to improve.

CRITICAL RULES:
- Ask only ONE question per turn, then STOP and wait for the applicant's answer.
- Keep every response SHORT (1 to 3 sentences). Your words are read aloud by text-to-speech, so be concise and natural.
- Speak in clear, simple English (the real interview is conducted in English).
- Match your tone to your style (${officer.tag}), but always stay professional and respectful.
- Never break character. Never say you are an AI or a language model — you are the officer.
- Do NOT list multiple questions at once. One question, then wait.`;
}

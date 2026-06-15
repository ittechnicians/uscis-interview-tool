// api/interview.js
// Vercel serverless function — the AI "brain" for the USCIS officer.
// The OpenAI key is read from the server environment (OPENAI_API_KEY in Vercel).
// It is NEVER sent to the browser.

// If this model name ever errors with "model not found",
// swap it for 'gpt-4o-mini' or 'gpt-5.4-mini'.
const MODEL = 'gpt-4.1-mini';

const { CIVICS_2008, CIVICS_2020 } = require('./civics.js');
const { selectN400 } = require('./n400.js');

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
    const n400Seed = Number(body.n400Seed) || 1;

    // If there's no history yet, seed a starter so the officer opens the interview.
    const conversation = history.length === 0
      ? [{ role: 'user', content: '[The applicant has just sat down for the interview. Greet them and begin.]' }]
      : history;

    const messages = [
      { role: 'system', content: buildSystemPrompt(officer, testVersion, n400Seed) },
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

function buildSystemPrompt(officer, testVersion, n400Seed) {
  const is128 = (testVersion === '128');
  const bank = is128 ? CIVICS_2020 : CIVICS_2008;
  const askCount = is128 ? 20 : 10;
  const passCount = is128 ? 12 : 6;
  const versionName = is128 ? 'official USCIS 2020 civics test (the 128-question version)'
                            : 'official USCIS 2008 civics test (the 100-question version)';

  let civics;
  if (bank && bank.length) {
    // Embed the official question bank as the officer's reference key.
    const list = bank.map(item => `Q${item.n}. ${item.q}\n   ACCEPTED ANSWER(S): ${item.a}`).join('\n');
    civics = `3. CIVICS TEST: Tell the applicant you will now begin the civics questions. Ask questions ONLY from the official list below — never invent a question that is not on this list, and never accept an answer that is not among the accepted answers shown. Ask ONE question at a time, up to ${askCount} questions; the applicant must answer ${passCount} correctly to pass. After each answer, briefly say whether it is correct; if it is wrong, kindly give the correct answer from the list, then continue.
- For any question whose accepted answer says it varies by the applicant's state, FIRST ask which U.S. state they live in, then judge their answer against the correct current answer for that state.

=== OFFICIAL CIVICS QUESTION BANK (${versionName}) — use ONLY these ===
${list}
=== END OF OFFICIAL QUESTION BANK ===`;
  } else {
    // Bank not yet embedded (fallback).
    civics = `3. CIVICS TEST: Tell the applicant you will now ask the civics questions. Use the ${versionName}. Ask questions ONLY from those official questions, ONE at a time, up to ${askCount} questions. The applicant must answer ${passCount} correctly to pass. After each answer, briefly say whether it is correct; if it is wrong, kindly give the correct answer. For the current President, Vice President, Speaker of the House, and Chief Justice, the correct answers are: President — Donald Trump; Vice President — JD Vance; party of the President — Republican; Speaker of the House — Mike Johnson; Chief Justice — John Roberts. For questions about the applicant's own state (their Senators, Representative, Governor, or state capital), first ask which state they live in.`;
  }

  // Build a varied-but-structured set of N-400 questions for this interview.
  const n400Plan = selectN400(n400Seed);
  const n400List = n400Plan.map(function (sec) {
    return `  ${sec.title}:\n` + sec.questions.map(function (q) { return `   - ${q}`; }).join('\n');
  }).join('\n');
  const n400 = `2. N-400 REVIEW: Now review the application. Ask the applicant the SPECIFIC questions listed below, going section by section in this order, ONE question at a time, and wait for each answer before the next. Ask them naturally and conversationally — you may briefly acknowledge an answer — but do not skip questions and do not invent unrelated ones. If the applicant answers "yes" to a good-moral-character question, ask one short follow-up, then move on. Keep it moving; this is a review, not an interrogation.

=== N-400 QUESTIONS FOR THIS INTERVIEW (ask in this order, one at a time) ===
${n400List}
=== END N-400 QUESTIONS ===`;

  return `You are ${officer.name}, a U.S. Citizenship and Immigration Services (USCIS) officer at the ${officer.office}. Your interviewing style is: ${officer.tag}.

You are conducting a REALISTIC MOCK naturalization (U.S. citizenship) interview to help the applicant practice for their real N-400 interview. Stay fully in character as the officer the entire time.

Follow this real interview structure, in order:
1. GREETING & OATH: Greet the applicant, introduce yourself briefly, ask them to raise their right hand and swear that everything they tell you will be the truth, then ask them to state their full legal name.
${n400}
${civics}
4. ENGLISH TEST: Ask the applicant to read one short sentence aloud, and then give them one short sentence to say back to you (since this is by voice).
5. CLOSING: Tell them the practice interview is complete and give brief, encouraging feedback on how they did and one thing to improve.

CRITICAL RULES:
- Ask only ONE question per turn, then STOP and wait for the applicant's answer.
- Keep every response SHORT (1 to 3 sentences). Your words are read aloud by text-to-speech, so be concise and natural.
- Speak in clear, simple English (the real interview is conducted in English).
- Match your tone to your style (${officer.tag}), but always stay professional and respectful.
- During the civics test, grade strictly against the official accepted answers — do not accept a wrong answer as correct.
- Never break character. Never say you are an AI or a language model — you are the officer.
- Do NOT list multiple questions at once. One question, then wait.`;
}

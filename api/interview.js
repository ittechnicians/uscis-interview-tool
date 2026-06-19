// api/interview.js
// Vercel serverless function — the AI "brain" for the USCIS officer.
// The OpenAI key is read from the server environment (OPENAI_API_KEY in Vercel).
// It is NEVER sent to the browser.

// If this model name ever errors with "model not found",
// swap it for 'gpt-4o-mini' or 'gpt-5.4-mini'.
const MODEL = 'gpt-4.1-mini';

const { CIVICS_2008, CIVICS_2020, STATE_INFO, STATE } = require('./civics.js');
const { selectN400, allN400, selectN400Random, selectDefinitions } = require('./n400.js');

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
    const mode = (body.mode === 'n400') ? 'n400' : 'full';
    const n400Mode = (body.n400Mode === 'full') ? 'full' : 'random';
    const profile = (body.profile && typeof body.profile === 'object') ? body.profile : null;

    // If there's no history yet, seed a starter so the officer opens the interview.
    const conversation = history.length === 0
      ? [{ role: 'user', content: '[The applicant has just sat down for the interview. Greet them and begin.]' }]
      : history;

    const messages = [
      { role: 'system', content: buildSystemPrompt(officer, testVersion, n400Seed, mode, n400Mode, profile) },
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

function buildSystemPrompt(officer, testVersion, n400Seed, mode, n400Mode, profile) {
  if (mode === 'n400') {
    return buildN400OnlyPrompt(officer, n400Seed, n400Mode, profile);
  }
  const is128 = (testVersion === '128');
  const bank = is128 ? CIVICS_2020 : CIVICS_2008;
  const askCount = is128 ? 20 : 10;
  const passCount = is128 ? 12 : 6;
  const versionName = is128 ? 'official USCIS 2020 civics test (the 128-question version)'
                            : 'official USCIS 2008 civics test (the 100-question version)';

  const civics = buildCivicsBlock(bank, n400Seed, askCount, passCount, versionName);

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

function planToList(plan) {
  return plan.map(function (sec) {
    return `  ${sec.title}:\n` + sec.questions.map(function (q) { return `   - ${q}`; }).join('\n');
  }).join('\n');
}

function buildProfileBlock(profile) {
  const map = {
    fullName: 'Full legal name',
    countryBirth: 'Country of birth',
    countryCit: 'Country of citizenship',
    otherNames: 'Other names used',
    address: 'Current home address',
    addressTime: 'Time at current address',
    marital: 'Marital status',
    spouseName: "Spouse's name",
    spouseCit: 'Spouse is a U.S. citizen',
    employer: 'Current employer',
    occupation: 'Occupation',
    basis: 'Basis for applying',
    tripsCount: 'Trips outside the U.S. (last 5 years)',
    longestTrip: 'Longest trip outside the U.S.'
  };
  const pretty = function (k, v) {
    if (k === 'marital') return { single: 'single', married: 'married', divorced: 'divorced', widowed: 'widowed' }[v] || v;
    if (k === 'spouseCit') return v === 'yes' ? 'yes' : 'no';
    if (k === 'basis') return v === '5yr' ? '5 years as a permanent resident' : (v === '3yr' ? '3 years married to a U.S. citizen' : v);
    return v;
  };
  const lines = Object.keys(map)
    .filter(function (k) { return profile[k]; })
    .map(function (k) { return `   - ${map[k]}: ${pretty(k, profile[k])}`; });
  return lines.join('\n');
}

function buildN400OnlyPrompt(officer, n400Seed, n400Mode, profile) {
  const personalized = !!(profile && Object.keys(profile).some(function (k) { return profile[k]; }));
  const isFull = personalized ? true : (n400Mode === 'full');
  const plan = isFull ? allN400() : selectN400Random(n400Seed, 10);
  const list = planToList(plan);
  const count = plan.reduce(function (n, s) { return n + s.questions.length; }, 0);

  let intro;
  if (personalized) {
    intro = `This is a PERSONALIZED full run-through of the N-400 application questions, top to bottom (${count} questions), based on the applicant's own answers.`;
  } else if (isFull) {
    intro = `This is a FULL run-through of the N-400 application questions, section by section from top to bottom (${count} questions in total).`;
  } else {
    intro = `This is a QUICK practice of about ${count} N-400 application questions, chosen at random, plus a short check of whether the applicant understands a couple of key words.`;
  }

  // Personalization block (their own application answers).
  let profileBlock = '';
  let personalizeRule = '';
  if (personalized) {
    profileBlock = `

=== THE APPLICANT'S OWN APPLICATION ANSWERS (use these to personalize and verify) ===
${buildProfileBlock(profile)}
=== END APPLICATION ANSWERS ===`;
    personalizeRule = `
- PERSONALIZE: When a question matches one of the applicant's answers above, ask it as a verification using their information — for example, "Your application says you live at [address] — is that still correct?" or "You listed your employer as [employer] — how long have you worked there?". Where you have no answer for a question, simply ask it normally. Ask ALL the questions in the list regardless.`;
  }

  // In random (non-personalized) mode, add a short "explain this word" check.
  let defsBlock = '';
  if (!isFull) {
    const defs = selectDefinitions(n400Seed, 2);
    const defsList = defs.map(function (d) {
      return `   - Ask the applicant to explain, in their own words, what "${d.term}" means. (Reference for you: ${d.ref}.) Accept any reasonable explanation that shows basic understanding; gently correct if they are far off.`;
    }).join('\n');
    defsBlock = `

After the application questions above, do a short UNDERSTANDING CHECK. Ask the applicant to explain the following word(s) in their own words, ONE at a time:
${defsList}`;
  }

  return `You are ${officer.name}, a U.S. Citizenship and Immigration Services (USCIS) officer at the ${officer.office}. Your interviewing style is: ${officer.tag}.

You are running a FOCUSED practice of ONLY the N-400 application questions — NOT the full interview. ${intro} Stay fully in character as the officer the whole time.${profileBlock}

Do this, in order:
1. Briefly greet the applicant in ONE sentence and tell them you will go through their application questions. Do NOT administer the oath, the civics test, or the English reading/writing test — those are not part of this practice.
2. Then ask the questions listed below, in this exact order, ONE at a time, waiting for each answer before moving to the next. Acknowledge each answer briefly and naturally. If the applicant answers "yes" to a good-moral-character question, ask one short follow-up, then continue.
3. After the LAST question, tell them the practice is complete and give a short, encouraging closing with one helpful tip.

=== N-400 QUESTIONS (ask in this exact order, one at a time) ===
${list}
=== END N-400 QUESTIONS ===${defsBlock}

CRITICAL RULES:
- Ask only ONE question per turn, then STOP and wait for the applicant's answer.
- Keep every response SHORT (1 to 2 sentences). Your words are read aloud by text-to-speech, so be concise and natural.
- Speak in clear, simple English (the real interview is conducted in English).
- Match your tone to your style (${officer.tag}), but always stay professional and respectful.
- Never break character. Never say you are an AI or a language model — you are the officer.
- Do NOT list multiple questions at once. One question, then wait.${personalizeRule}`;
}

// Seeded shuffle so the civics selection is random per interview but stable across turns.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededShuffle(arr, seed) {
  const rng = mulberry32((seed >>> 0) || 1);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildCivicsBlock(bank, seed, askCount, passCount, versionName) {
  if (!bank || !bank.length) {
    return `3. CIVICS TEST: Ask up to ${askCount} official civics questions from the ${versionName}, ONE at a time. The applicant needs ${passCount} correct to pass; stop as soon as they reach ${passCount} correct.`;
  }
  const selected = seededShuffle(bank, seed).slice(0, askCount);
  const list = selected.map(function (item) {
    const ans = (item.a === STATE)
      ? '(STATE-SPECIFIC — first ask which state the applicant lives in, then grade using the State Reference below)'
      : item.a;
    return `Q${item.n}. ${item.q}\n   ACCEPTED ANSWER(S): ${ans}`;
  }).join('\n');

  const stateRef = Object.keys(STATE_INFO).map(function (st) {
    const s = STATE_INFO[st];
    return `- ${st} — capital: ${s.capital}; Governor: ${s.governor}; U.S. Senators: ${s.senators.join(', ')}`;
  }).join('\n');

  return `3. CIVICS TEST: Tell the applicant you will now begin the civics questions. Ask ONLY the questions listed below, in the order given, ONE at a time. After each answer, briefly say whether it is correct; if it is wrong, kindly give the correct answer, then continue.
- STOPPING RULE (important): The applicant needs ${passCount} correct out of up to ${askCount}. As SOON as the applicant has answered ${passCount} correctly, STOP the civics questions and tell them they passed the civics portion. Never ask more than the ${askCount} questions listed below, and keep an accurate count of how many you have asked and how many are correct.
- For any STATE-SPECIFIC question, FIRST ask which U.S. state the applicant lives in, then grade using the State Reference below. For "Name your U.S. Representative," the answer depends on the applicant's specific district — accept the name they give and remind them to verify their own representative. If their state is not listed, accept a reasonable answer and tell them to verify it.

=== STATE REFERENCE (for state-specific questions) ===
${stateRef}
(Washington, D.C. is not a state — D.C. residents have no U.S. Senators, no voting Representative, and no Governor.)
=== END STATE REFERENCE ===

=== CIVICS QUESTIONS FOR THIS INTERVIEW (${versionName}) — ask ONLY these, in order, and stop at ${passCount} correct ===
${list}
=== END CIVICS QUESTIONS ===`;
}

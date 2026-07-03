// api/interview.js
// Vercel serverless function — the AI "brain" for the USCIS officer.
// The OpenAI key is read from the server environment (OPENAI_API_KEY in Vercel).
// It is NEVER sent to the browser.

// If this model name ever errors with "model not found",
// swap it for 'gpt-4o-mini' or 'gpt-5.4-mini'.
const MODEL = 'gpt-4.1-mini';

// Hard safety cap so a single interview can never loop forever (protects cost).
// A full mock (oath + N-400 + up to 20 civics + English + closing) fits well under this.
const MAX_USER_TURNS = 55;

// Shared rules that keep the applicant on task and let the officer end the session.
// (Prevents someone from chatting like a chatbot and burning tokens.)
const FOCUS_RULES = `
- STAY ON TASK: This is a citizenship interview, not a general chat. If the applicant goes off-topic, makes small talk, asks you unrelated questions, gives a nonsense answer, or will not answer, do NOT engage with the off-topic content. Redirect them to the current question, and VARY your wording every time — never repeat the exact same sentence twice. Each time you redirect for off-topic behavior, end that message with the marker [[OFFTRACK]] (this marker is hidden from the applicant).
- ESCALATION: You will be told the number of OFF-TOPIC STRIKES the applicant already has. If they are off-topic again: at strike 0 or 1, redirect politely; at strike 2, redirect and give a firm final warning that the interview will end if they keep going off-topic; at strike 3 or more, STOP the interview — give a short, encouraging closing and end your message with [[END]] (do not add [[OFFTRACK]] on that closing).
- COMPLETION: When the interview genuinely finishes (after your closing/feedback), end your final message with [[END]]. Only ever include [[END]] when the interview is actually over. Both [[OFFTRACK]] and [[END]] are hidden control markers — never mention them.`;

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

    // Hard safety cap: count how many times the applicant has spoken.
    const userTurns = conversation.filter(function (m) { return m && m.role === 'user'; }).length;
    const atLimit = userTurns >= MAX_USER_TURNS;

    // Count how many times the officer has already flagged the applicant as
    // off-topic (hidden [[OFFTRACK]] markers kept in the history).
    let priorStrikes = 0;
    conversation.forEach(function (m) {
      if (m && m.role === 'assistant' && typeof m.content === 'string') {
        priorStrikes += (m.content.match(/\[\[OFFTRACK\]\]/g) || []).length;
      }
    });

    const messages = [
      { role: 'system', content: buildSystemPrompt(officer, testVersion, n400Seed, mode, n400Mode, profile) },
      ...conversation
    ];

    // Tell the officer the current strike count so escalation is deterministic.
    messages.push({
      role: 'system',
      content: 'OFF-TOPIC STRIKES SO FAR: ' + priorStrikes + '. If the applicant is off-topic again, follow the ESCALATION rule for this strike level. If they answered on-topic, continue normally with no markers.'
    });

    // When the length limit is reached, instruct the officer to wrap up now.
    if (atLimit) {
      messages.push({
        role: 'system',
        content: 'The interview has reached its length limit. Give a brief, warm closing with one or two sentences of feedback now, and end your message with the token [[END]]. Do not ask any more questions.'
      });
    }

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
    const raw = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
      ? data.choices[0].message.content.trim()
      : "Let's continue. Please tell me a little about yourself.";

    // Three versions of the officer's message:
    //  - historyContent: kept for the next request (keeps [[OFFTRACK]] + dictation so the officer remembers)
    //  - speak: what text-to-speech reads (includes the dictation sentence, no control markers)
    //  - display: what the chat shows (dictation sentence hidden so the applicant must listen and write)
    const historyContent = raw.replace(/\[\[END\]\]/g, '').trim();

    const speak = raw
      .replace(/\[\[OFFTRACK\]\]/g, '')
      .replace(/\[\[END\]\]/g, '')
      .replace(/\[\[DICTATION\]\]/g, '')
      .replace(/\[\[\/DICTATION\]\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const display = raw
      .replace(/\[\[OFFTRACK\]\]/g, '')
      .replace(/\[\[END\]\]/g, '')
      .replace(/\[\[DICTATION\]\][\s\S]*?\[\[\/DICTATION\]\]/g, '🔊 (listen and write the sentence you hear)')
      .trim();

    // Decide whether the interview has ended.
    const thisOffTrack = raw.indexOf('[[OFFTRACK]]') !== -1 ? 1 : 0;
    const totalStrikes = priorStrikes + thisOffTrack;
    let ended = false;
    if (raw.indexOf('[[END]]') !== -1) ended = true;
    if (atLimit) ended = true;
    if (totalStrikes >= 4) ended = true;

    return res.status(200).json({
      reply: speak,          // for text-to-speech
      display: display,      // for the chat bubble
      history: historyContent, // to send back next turn
      ended: ended
    });
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
4. ENGLISH TEST — do it in two parts:
   a) READING: Give the applicant ONE short sentence to read aloud, and SHOW them the sentence in your message (this one they are allowed to see, because they must read it). Wait for them to read it.
   b) WRITING (dictation): Tell the applicant you will read a sentence and they must WRITE it. Use ONE official USCIS writing sentence. Put ONLY that sentence inside dictation markers like this: [[DICTATION]]The people vote for the President.[[/DICTATION]]. The applicant will HEAR this sentence but will NOT see it written, so do not repeat the sentence anywhere else in your message. After they write it, evaluate it: by USCIS rules, minor spelling, capitalization, or punctuation mistakes are fine as long as the meaning is clear — tell them if it is acceptable, then continue.
5. CLOSING: Tell them the practice interview is complete and give brief, encouraging feedback on how they did and one thing to improve.

CRITICAL RULES:
- Ask only ONE question per turn, then STOP and wait for the applicant's answer.
- Keep every response SHORT (1 to 3 sentences). Your words are read aloud by text-to-speech, so be concise and natural.
- Speak in clear, simple English (the real interview is conducted in English).
- Match your tone to your style (${officer.tag}), but always stay professional and respectful.
- During the civics test, grade strictly against the official accepted answers — do not accept a wrong answer as correct.
- Never break character. Never say you are an AI or a language model — you are the officer.
- Do NOT list multiple questions at once. One question, then wait.${FOCUS_RULES}`;
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
  let yesBlock = '';
  if (personalized) {
    let gmcBlock = '';
    if (Array.isArray(profile.gmc) && profile.gmc.length) {
      const gmcLines = profile.gmc.map(function (g) {
        return `   - "${g.q}" — applicant marked: ${g.a === 'yes' ? 'YES' : 'NO'}`;
      }).join('\n');
      gmcBlock = `

=== THE APPLICANT'S ANSWERS TO THE "HAVE YOU EVER" QUESTIONS (from their application) ===
${gmcLines}
=== END "HAVE YOU EVER" ANSWERS ===`;

      const yesItems = profile.gmc.filter(function (g) { return g.a === 'yes'; });
      if (yesItems.length) {
        const yesLines = yesItems.map(function (g) { return `   - "${g.q}"`; }).join('\n');
        yesBlock = `

=== IMPORTANT: THE APPLICANT ANSWERED "YES" TO THESE — you MUST ask about EACH ONE, one at a time, and have them explain it in their own words before continuing ===
${yesLines}
=== END "YES" ITEMS ===`;
      }
    }
    profileBlock = `

=== THE APPLICANT'S OWN APPLICATION ANSWERS (use these to personalize and verify) ===
${buildProfileBlock(profile)}
=== END APPLICATION ANSWERS ===${gmcBlock}`;
    personalizeRule = `
- PERSONALIZE: When a question matches one of the applicant's answers above, ask it as a verification using their information — for example, "Your application says you live at [address] — is that still correct?" or "You listed your employer as [employer] — how long have you worked there?". Where you have no answer for a question, simply ask it normally. Ask ALL the questions in the list regardless.
- HAVE-YOU-EVER ANSWERS: The blocks above show how the applicant marked each "Have you ever" question. Confirm each one against what they marked. For every question they marked YES, you MUST ask about it and have them explain it in detail — a real officer always follows up on a "yes." Do not skip any YES item.
- RESOLVE INCONSISTENCIES: If the applicant's spoken answer CONTRADICTS what their application says (a different number of years, a different employer, a different address, a different marital status, or a different yes/no on a "have you ever" question), do NOT just accept it and move on — a real officer must resolve this. Politely point out the discrepancy, state both versions clearly ("Your application says X, but you just told me Y"), and ask the applicant to clarify which one is correct and why. Stay on that point and do not move to the next question until they have clarified.`;
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
=== END N-400 QUESTIONS ===${defsBlock}${yesBlock}

CRITICAL RULES:
- Ask only ONE question per turn, then STOP and wait for the applicant's answer.
- Keep every response SHORT (1 to 2 sentences). Your words are read aloud by text-to-speech, so be concise and natural.
- Speak in clear, simple English (the real interview is conducted in English).
- Match your tone to your style (${officer.tag}), but always stay professional and respectful.
- Never break character. Never say you are an AI or a language model — you are the officer.
- Do NOT list multiple questions at once. One question, then wait.${FOCUS_RULES}${personalizeRule}`;
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

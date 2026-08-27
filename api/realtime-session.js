// api/realtime-session.js — GA endpoint: /v1/realtime/client_secrets
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vugvnqapdxyewxyfaayl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const VOICES  = { martinez:'coral', johnson:'ash', chen:'sage', rodriguez:'shimmer', williams:'echo' };
const NAMES   = { martinez:'Officer M. Martinez', johnson:'Officer R. Johnson', chen:'Officer L. Chen', rodriguez:'Officer C. Rodriguez', williams:'Officer S. Williams' };
const OFFICES = { martinez:'Miami Field Office', johnson:'Washington DC Office', chen:'San Francisco Office', rodriguez:'Los Angeles Office', williams:'Atlanta Field Office' };
const TAGS    = { martinez:'Warm & Thorough', johnson:'Strict & Professional', chen:'Modern & Patient', rodriguez:'Empathetic & Bilingual', williams:'Diplomatic' };

// Full N-400 Part 12 "Good Moral Character" screening bank — real USCIS interviews
// ask 40+ of these; we sample 8 at random per session so repeat practice eventually
// covers the whole range without making every single interview extremely long.
const GMC_BANK = [
  'Have you ever claimed to be a U.S. citizen?',
  'Have you ever registered to vote or voted in a federal, state, or local election in the United States?',
  'Do you currently owe any overdue federal, state, or local taxes?',
  'Have you ever called yourself a "non-resident alien" on a tax return, or not filed taxes because you considered yourself a non-resident?',
  'Do you file your taxes every year?',
  'Have you ever been a member of, or in any way associated with, any communist or totalitarian party?',
  'Have you ever advocated for, or been part of, a group that wanted to overthrow the U.S. government by force?',
  'Have you ever been part of a group involved in unlawfully assaulting or killing a government official?',
  'Have you ever provided support to a group that used weapons or explosives to harm people?',
  'Have you ever been involved in kidnapping, hijacking, or sabotage?',
  'Have you ever committed or helped commit torture or genocide?',
  'Have you ever tried to kill or seriously injure another person?',
  'Have you ever forced or threatened someone into any kind of sexual contact?',
  'Have you ever prevented someone from practicing their religion?',
  'Have you ever harmed someone because of their race, religion, or national origin?',
  'Have you ever served in or been part of any military or police unit?',
  'Have you ever served in or assisted any armed group, militia, or guerrilla group?',
  'Have you ever worked or served in a place where people were detained, such as a prison or labor camp?',
  'Were you ever part of a group that used weapons against people, or threatened to?',
  'Have you ever sold, provided, or transported weapons you believed would be used against someone?',
  'Have you ever received weapons training or other military-type training?',
  'Have you ever recruited or used a person under 15 years old to serve in an armed group?',
  'Have you ever been arrested, cited, or detained by any law enforcement or immigration official?',
  'Have you ever been charged with committing a crime?',
  'Have you ever pled guilty to, or been convicted of, a crime?',
  'Have you ever been placed on probation or parole?',
  'Have you ever committed a crime you were never arrested for?',
  'Have you ever engaged in prostitution or received money from it?',
  'Have you ever manufactured, sold, or distributed illegal drugs?',
  'Have you ever been married to more than one person at the same time?',
  'Have you ever married someone in order to obtain an immigration benefit?',
  'Have you ever helped anyone enter the United States illegally?',
  'Have you ever gambled illegally or received income from illegal gambling?',
  'Have you ever failed to support your dependents or pay court-ordered alimony?',
  'Have you ever made a false statement in order to obtain a public benefit?',
  'Have you ever given false or misleading information to a U.S. government official?',
  'Have you ever lied to a government official to gain entry into the U.S. or an immigration benefit?',
  'Have you ever been placed in removal or deportation proceedings, or been deported?',
  'Have you ever left the United States to avoid being drafted into the military?',
  'Have you ever applied for an exemption from military service because you are not a U.S. citizen?',
  'Do you have a hereditary title or an order of nobility in any foreign country?',
];

function pickRandomGMC(n) {
  const pool = GMC_BANK.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

function buildInstructions(id, civicsVer, userState, gmcQuestions) {
  const state = userState || 'Texas';
  const pronoun = (id === 'rodriguez' || id === 'martinez' || id === 'chen') ? 'She is' : 'He is';
  const gender = (id === 'rodriguez' || id === 'martinez' || id === 'chen') ? 'female' : 'male';

  // Randomization seed — different each call
  const seed = Date.now() % 9973;

  const readingSentences = [
    'The White House is in Washington, D.C.',
    'Congress meets in Washington, D.C.',
    'The President lives in the White House.',
    'Citizens have the right to vote.',
    'The flag has fifty stars.',
    'The United States is a free country.',
    'George Washington was the first President.',
    'Abraham Lincoln was the President during the Civil War.',
    'The American flag is red, white, and blue.',
    'We have freedom of speech in the United States.'
  ];

  const writingSentences = [
    'Citizens can vote.',
    'Thanksgiving is in November.',
    'California has the most people.',
    'The White House is in Washington, D.C.',
    'Congress has 100 Senators.',
    'Adams was the second President.',
    'Labor Day is in September.',
    'New York City was the first capital.',
    'Lincoln was the President during the Civil War.',
    'The American flag is red, white, and blue.',
    'We have 100 Senators.',
    'The capital of the United States is Washington, D.C.',
    'The people vote for the President.',
    'Congress meets in Washington, D.C.',
    'Freedom of speech is a right of all citizens.'
  ];

  const vocabDefs = [
    { term: 'naturalization', def: 'the process of becoming a U.S. citizen if you were not born in the United States' },
    { term: 'permanent resident', def: 'a person who has permission to live and work in the U.S. permanently; a green card holder' },
    { term: 'allegiance', def: 'loyalty and support given to a country or its government' },
    { term: 'the Oath of Allegiance', def: 'the promise of loyalty you make to the United States to become a citizen' },
    { term: 'good moral character', def: 'behaving honestly, obeying the law, and being responsible' },
    { term: 'continuous residence', def: 'living in the United States without long trips outside the country during the required period' },
    { term: 'physical presence', def: 'the total time you were physically inside the United States' },
    { term: 'the Constitution', def: 'the supreme law of the United States' },
    { term: 'an amendment', def: 'a change or addition to the Constitution' },
    { term: 'the Bill of Rights', def: 'the first 10 amendments to the Constitution' },
    { term: 'a dependent', def: 'a person, usually a child, who relies on you financially' },
    { term: 'a citation', def: 'an official written notice from law enforcement, such as a ticket' },
    { term: 'probation', def: 'a period of supervision ordered by a court instead of jail' },
    { term: 'a felony', def: 'a serious crime, more serious than a misdemeanor' },
    { term: 'deported', def: 'officially removed from the country by the government' },
    { term: 'Selective Service', def: 'the U.S. system that registers men in case they are needed for military service' },
    { term: 'a misdemeanor', def: 'a less serious crime, such as a minor traffic violation' },
    { term: 'affiliation', def: 'a formal connection or membership with a group or organization' }
  ];

  const readingSentence = readingSentences[seed % readingSentences.length];
  const writingSentence = writingSentences[(seed + 7) % writingSentences.length];
  const def1 = vocabDefs[seed % vocabDefs.length];
  const def2 = vocabDefs[(seed + 5) % vocabDefs.length];
  const def3 = vocabDefs[(seed + 11) % vocabDefs.length];

  const civicsNote = civicsVer === '128'
    ? 'Use the 128-question (2020 updated) civics test. Vary which questions you ask — start around question #' + (seed%20+1) + '.'
    : 'Use the 100-question (2008 standard) civics test. Do not always start with the same questions. This session start around question #' + (seed%20+1) + '.';
  const gmcList = (gmcQuestions || []).map((q, i) => (i + 1) + '. ' + q).join(' ');

  return 'You are ' + (NAMES[id]||'Officer Martinez') + ', a ' + gender + ' USCIS officer at the ' + (OFFICES[id]||'Field Office') + '. Style: ' + (TAGS[id]||'Professional') + '. Conduct a realistic mock U.S. naturalization interview in this EXACT order — never skip or reorder: 1) GREETING AND OATH: start with one brief, warm small-talk line (for example asking how their day is going or if the wait was long) — keep it to one line, then move on. Then administer the oath, then ask their full legal name. NAME CONFIRMATION: after they say their name, if you are not fully confident you heard the last name correctly (unusual spelling, unclear audio, or it does not sound like a real name), politely ask them to spell their last name before continuing — real USCIS officers do this routinely, it is normal and expected, not a mistake. GENERAL CLARITY RULE (applies for the whole interview): if what you heard does not make sense as an answer to the question you just asked, briefly and politely ask them to repeat it rather than guessing or moving on with a garbled answer. 2) N-400 REVIEW in order: a)personal info(name,DOB,address,other names) b)residence c)travel outside US d)marital & children e)employment f)taxes & Selective Service — do NOT ask about good moral character or attachment to the Constitution yet, those come later in steps 6 and 7. VOCABULARY CHECK: Naturally weave 2-3 vocabulary checks into the N-400 review. For each one, ASK the applicant what the term means and WAIT for their answer — never state the definition yourself first, never answer your own question. Only AFTER they answer: if they got it right, briefly confirm and move on; if they got it wrong or are unsure, THEN give them the correct definition and move on. These 3 terms are for THIS session — the definitions after each colon are a private reference for you to grade their answer, never say the definition out loud before they attempt it: (1) ' + def1.term + ': ' + def1.def + ' (2) ' + def2.term + ': ' + def2.def + ' (3) ' + def3.term + ': ' + def3.def + '. 3) CIVICS TEST: ' + civicsNote + ' Ask up to 10 questions one at a time, applicant needs 6 correct to pass, stop when 6 correct. For state questions use: ' + state + '. 4) ENGLISH TEST — BOTH parts are required, never skip either: a)READING — Read this exact sentence aloud: ' + readingSentence + '. Ask the applicant to repeat it. Minor pronunciation errors are acceptable. b)WRITING — Tell the applicant: For the writing test I will say a sentence, please listen and then say it back word by word exactly as you would write it. Then say: ' + writingSentence + '. Wait for them to repeat it back. Evaluate (minor errors acceptable). Do NOT ask them to write on paper. Do not move to step 5 until you have done BOTH the reading and the writing parts. 5) GOOD MORAL CHARACTER: Tell the applicant you now need to ask some yes-or-no questions required by law. Ask these ' + (gmcQuestions || []).length + ' questions ONE AT A TIME, in this exact wording and order, waiting for an answer each time: ' + gmcList + ' If they answer "yes" to something serious, ask ONE brief natural follow-up question, then move on — do not dwell or lecture. Most applicants answer "no" to all of these; that is expected and normal. 6) ATTACHMENT TO THE CONSTITUTION AND OATH: Ask if they support the Constitution and form of government of the United States, ask what the form of government is, ask if they understand the oath of allegiance, and ask if they are willing to take the full oath — including, if the law requires it, bearing arms on behalf of the United States, performing noncombatant service, or performing work of national importance under civilian direction. 7) CLOSING: give brief feedback — one strength and one thing to improve. Then ask ONE TIME: "Do you have any final questions for me before we finish?" 8) FINAL QUESTION AND END: If the applicant asks a question, answer it briefly in 1-2 sentences. If they say no or have nothing else, just acknowledge briefly. Either way, after that single exchange say one short warm closing line (for example wishing them good luck), and then call the end_interview tool in that SAME turn, right after speaking. CRITICAL RULE ABOUT end_interview: NEVER call end_interview silently. Every time you call it, that same response MUST also contain your spoken closing words — a response that calls end_interview with no spoken audio/text is INVALID and forbidden. Do NOT call end_interview before you have completed and SPOKEN steps 1-8 in full, including both parts of the English test and all ' + (gmcQuestions || []).length + ' good moral character questions. Never call it more than once. SAFETY LIMIT: if you receive a system message saying the interview has run long, finish the current step if unfinished, then go straight to steps 7 and 8 — but you must still SPEAK the closing before calling end_interview. OFF-TOPIC HANDLING: This is a formal citizenship interview, not a casual chat. If the applicant makes small talk, asks you a personal question, asks something unrelated, or will not answer the current question: do NOT engage with the off-topic content — briefly and politely redirect them back to the current question, varying your wording each time you do it. In that SAME turn, ALSO silently call the off_topic_strike tool (never mention this tool, never say anything about tracking strikes) — do this in addition to speaking your redirect, never instead of it. If you receive a system message telling you this is the applicant\'s 3rd off-topic instance, add a clear, firm, but polite warning to your redirect that the interview will end early if it keeps happening. CURRENT FACTS: President=Donald Trump Party=Republican VP=JD Vance Speaker=Mike Johnson Chief Justice=John Roberts. RULES: SHORT responses(1-3 sentences). ONE question per turn. Never break character. Never say you are AI.';
}
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!OPENAI_KEY) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
  if (!SUPABASE_SERVICE_KEY) return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const userId    = (body.userId    || '').toString().trim();
    const officerId = (body.officerId || 'martinez').toString().trim().toLowerCase();
    const civicsVer = (body.civicsVersion === '128') ? '128' : '100';
    const userState = (body.state || '').toString().trim();
    if (!userId) return res.status(400).json({ error: 'userId required' });

    // 1. Verify premium + credits
    const pr = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=plan,plan_expires_at,live_credits`,
      { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, Accept: 'application/json' } }
    );
    const profiles = await pr.json();
    const profile = profiles && profiles[0];
    if (!profile) return res.status(404).json({ error: 'User not found' });

    const notExpired = !profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date();
    if (profile.plan !== 'premium' || !notExpired) return res.status(403).json({ error: 'Premium plan required' });

    const credits = typeof profile.live_credits === 'number' ? profile.live_credits : 0;
    if (credits <= 0) return res.status(403).json({ error: 'no_credits' });

    // 2. Decrement credits
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
      { method: 'PATCH',
        headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ live_credits: credits - 1 }) });

    const voice        = VOICES[officerId] || 'coral';
    const gmcQuestions = pickRandomGMC(8);
    const instructions = buildInstructions(officerId, civicsVer, userState, gmcQuestions);

    // 3. Create ephemeral token — GA endpoint /v1/realtime/client_secrets
    // Exact format from OpenAI official docs (platform.openai.com/docs/guides/realtime-webrtc)
    const tokenRes = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Safety-Identifier': Buffer.from(userId).toString('base64').slice(0, 32)
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: 'gpt-realtime-2.1',
          instructions: instructions,
          tools: [
            {
              type: 'function',
              name: 'end_interview',
              description: 'Call this only after you have SPOKEN your closing feedback and the final-question exchange out loud in this same turn — a silent call with no spoken content is invalid. This ends the interview session.',
              parameters: { type: 'object', properties: {}, required: [] }
            },
            {
              type: 'function',
              name: 'off_topic_strike',
              description: 'Call this SILENTLY (never mention it to the applicant) every time the applicant goes off-topic, makes small talk, asks you a personal question, or asks something unrelated to the interview — in ADDITION to speaking your redirect back to the current question in that same turn. Never call this instead of redirecting, only alongside it.',
              parameters: { type: 'object', properties: {}, required: [] }
            }
          ],
          tool_choice: 'auto',
          audio: {
            input: {
              noise_reduction: { type: 'far_field' },
              transcription: {
                language: 'en',
                model: 'gpt-realtime-whisper'
              },
              turn_detection: {
                type: 'semantic_vad',
                eagerness: 'medium',
                create_response: false,
                interrupt_response: true
              }
            },
            output: { voice: voice }
          }
        }
      })
    });

    console.log('client_secrets status:', tokenRes.status);
    const tokenText = await tokenRes.text();
    console.log('client_secrets body:', tokenText.slice(0, 300));

    if (!tokenRes.ok) {
      // refund credit
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
        { method: 'PATCH',
          headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ live_credits: credits }) });
      return res.status(502).json({ error: 'Could not start live session. Credit refunded.' });
    }

    let tokenData;
    try { tokenData = JSON.parse(tokenText); } catch(e) {
      return res.status(502).json({ error: 'Invalid token response from OpenAI' });
    }

    // GA endpoint returns { value: 'ek_...', expires_at: ..., session: {...} } directly
    const ephemeralKey = tokenData.value
      || (tokenData.client_secret && tokenData.client_secret.value);
    if (!ephemeralKey) {
      console.error('Unexpected response structure:', Object.keys(tokenData));
      return res.status(502).json({ error: 'No ephemeral key in response' });
    }

    return res.status(200).json({
      client_secret: ephemeralKey,
      remaining_credits: credits - 1,
      officer: { id: officerId, name: NAMES[officerId], office: OFFICES[officerId], voice: voice }
    });

  } catch (err) {
    console.error('realtime-session error:', err);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
};

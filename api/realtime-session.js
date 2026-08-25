// api/realtime-session.js — GA endpoint: /v1/realtime/client_secrets
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vugvnqapdxyewxyfaayl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const VOICES  = { martinez:'coral', johnson:'ash', chen:'sage', rodriguez:'shimmer', williams:'echo' };
const NAMES   = { martinez:'Officer M. Martinez', johnson:'Officer R. Johnson', chen:'Officer L. Chen', rodriguez:'Officer C. Rodriguez', williams:'Officer S. Williams' };
const OFFICES = { martinez:'Miami Field Office', johnson:'Washington DC Office', chen:'San Francisco Office', rodriguez:'Los Angeles Office', williams:'Atlanta Field Office' };
const TAGS    = { martinez:'Warm & Thorough', johnson:'Strict & Professional', chen:'Modern & Patient', rodriguez:'Empathetic & Bilingual', williams:'Diplomatic' };

function buildInstructions(id, civicsVer, userState) {
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
  return 'You are ' + (NAMES[id]||'Officer Martinez') + ', a ' + gender + ' USCIS officer at the ' + (OFFICES[id]||'Field Office') + '. Style: ' + (TAGS[id]||'Professional') + '. Conduct a realistic mock U.S. naturalization interview in this EXACT order — never skip or reorder: 1) GREETING AND OATH: greet, oath, ask full legal name. 2) N-400 REVIEW in order: a)personal info(name,DOB,address,other names) b)residence c)travel outside US d)marital & children e)employment f)taxes & Selective Service g)good moral character — ask IN THIS ORDER: arrested/detained? claimed US citizen? failed child support? then 2-3 others h)attachment to Constitution(bear arms, support Constitution, oath) — ask ALL of these BEFORE civics. VOCABULARY CHECK: Naturally weave 2-3 vocabulary definitions into the N-400 review. Ask what terms mean and correct if wrong. Use these 3 for this session: (1) ' + def1.term + ': ' + def1.def + ' (2) ' + def2.term + ': ' + def2.def + ' (3) ' + def3.term + ': ' + def3.def + '. 3) CIVICS TEST: ' + civicsNote + ' Ask up to 10 questions one at a time, applicant needs 6 correct to pass, stop when 6 correct. For state questions use: ' + state + '. 4) ENGLISH TEST: a)READING — Read this exact sentence aloud: ' + readingSentence + '. Ask the applicant to repeat it. Minor pronunciation errors are acceptable. b)WRITING — Tell the applicant: For the writing test I will say a sentence, please listen and then say it back word by word exactly as you would write it. Then say: ' + writingSentence + '. Wait for them to repeat it back. Evaluate (minor errors acceptable). Do NOT ask them to write on paper. 5) CLOSING: give brief feedback — one strength and one thing to improve. Then ask ONE TIME: "Do you have any final questions for me before we finish?" 6) FINAL QUESTION AND END: If the applicant asks a question, answer it briefly in 1-2 sentences. If they say no or have nothing else, just acknowledge briefly. Either way, after that single exchange say one short warm closing line (for example wishing them good luck), and then IMMEDIATELY call the end_interview tool in the same turn — do not say anything else after it and do not keep the conversation going. Do NOT call end_interview before you have completed steps 1-5. Never call it more than once. SAFETY LIMIT: if you receive a system message saying the interview has run long, skip ahead and do steps 5 and 6 right away, even if earlier steps were incomplete. CURRENT FACTS: President=Donald Trump Party=Republican VP=JD Vance Speaker=Mike Johnson Chief Justice=John Roberts. RULES: SHORT responses(1-3 sentences). ONE question per turn. Never break character. Never say you are AI. Attachment to Constitution MUST come before civics.';
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
    const instructions = buildInstructions(officerId, civicsVer, userState);

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
              description: 'Call this exactly once, and only after you have given your closing feedback and asked/answered one final question, to end the interview session. Never call this before completing the closing step.',
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
                eagerness: 'low',
                create_response: true,
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

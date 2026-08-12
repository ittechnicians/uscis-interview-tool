// api/realtime-session.js — GA endpoint: /v1/realtime/client_secrets
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vugvnqapdxyewxyfaayl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const VOICES  = { martinez:'coral', johnson:'ash', chen:'sage', rodriguez:'shimmer', williams:'echo' };
const NAMES   = { martinez:'Officer M. Martinez', johnson:'Officer R. Johnson', chen:'Officer L. Chen', rodriguez:'Officer C. Rodriguez', williams:'Officer S. Williams' };
const OFFICES = { martinez:'Miami Field Office', johnson:'Washington DC Office', chen:'San Francisco Office', rodriguez:'Los Angeles Office', williams:'Atlanta Field Office' };
const TAGS    = { martinez:'Warm & Thorough', johnson:'Strict & Professional', chen:'Modern & Patient', rodriguez:'Empathetic & Bilingual', williams:'Diplomatic' };

function buildInstructions(id, civicsVer, userState) {
  const civicsNote = civicsVer === '128'
    ? 'Use the 128-question (2020 updated) civics test.'
    : 'Use the 100-question (2008 standard) civics test.';
  const state = userState || 'Texas';
  const pronoun = (id === 'rodriguez' || id === 'martinez' || id === 'chen') ? 'She is' : 'He is';
  const gender = (id === 'rodriguez' || id === 'martinez' || id === 'chen') ? 'female' : 'male';
  return 'You are ' + (NAMES[id]||'Officer Martinez') + ', a ' + gender + ' USCIS officer at the ' + (OFFICES[id]||'Field Office') + '. Style: ' + (TAGS[id]||'Professional') + '. Conduct a realistic mock U.S. naturalization interview in this EXACT order — never skip or reorder: 1) GREETING AND OATH: greet, oath, ask full legal name. 2) N-400 REVIEW in order: a)personal info(name,DOB,address,other names) b)residence c)travel outside US d)marital & children e)employment f)taxes & Selective Service g)good moral character — ask IN THIS ORDER: arrested/detained? claimed US citizen? failed child support? then 2-3 others h)attachment to Constitution(bear arms, support Constitution, oath) — ask ALL of these BEFORE civics. 3) CIVICS TEST: ' + civicsNote + ' Ask up to 10 questions one at a time, applicant needs 6 correct to pass, stop when 6 correct. For state questions use: ' + state + '. 4) ENGLISH TEST: a)READING — Say one short sentence and ask the applicant to read it aloud. Wait for them to read it, then confirm if it is correct. b)WRITING — This is a VOICE interview, so adapt: say the following to the applicant: For the writing portion, I will read a sentence. Please listen carefully and then repeat it back to me word by word. Then say the sentence clearly. Wait for them to repeat it. Evaluate whether they said it correctly (minor errors in spelling pronunciation are acceptable). Do NOT ask them to physically write anything or use paper. 5) CLOSING: brief feedback, one strength, one improvement. CURRENT FACTS: President=Donald Trump Party=Republican VP=JD Vance Speaker=Mike Johnson Chief Justice=John Roberts. RULES: SHORT responses(1-3 sentences). ONE question per turn. Never break character. Never say you are AI. Attachment to Constitution MUST come before civics.';
}
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!OPENAI_KEY) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
  if (!SUPABASE_SERVICE_KEY) return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const userId    = (body.userId    || '').toString().trim();
    const officerId = (body.officerId || 'martinez').toString().trim().toLowerCase();
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
    const instructions = buildInstructions(officerId);

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
          audio: {
            input: {
              turn_detection: {
                type: 'semantic_vad',
                eagerness: 'low',
                create_response: true,
                interrupt_response: false
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

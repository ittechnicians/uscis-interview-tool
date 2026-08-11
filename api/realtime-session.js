// api/realtime-session.js — GA endpoint: /v1/realtime/client_secrets
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vugvnqapdxyewxyfaayl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const VOICES  = { martinez:'coral', johnson:'onyx', chen:'sage', rodriguez:'nova', williams:'echo' };
const NAMES   = { martinez:'Officer M. Martinez', johnson:'Officer R. Johnson', chen:'Officer L. Chen', rodriguez:'Officer C. Rodriguez', williams:'Officer S. Williams' };
const OFFICES = { martinez:'Miami Field Office', johnson:'Washington DC Office', chen:'San Francisco Office', rodriguez:'Los Angeles Office', williams:'Atlanta Field Office' };
const TAGS    = { martinez:'Warm & Thorough', johnson:'Strict & Professional', chen:'Modern & Patient', rodriguez:'Bilingual Expert', williams:'Diplomatic' };

function buildInstructions(id) {
  return `You are ${NAMES[id]||'Officer Martinez'}, a USCIS officer at the ${OFFICES[id]||'Field Office'}. Style: ${TAGS[id]||'Professional'}. Conduct a realistic mock U.S. naturalization interview in this exact order: 1)Greeting and sworn oath 2)N-400 review (personal info, travel, marital, employment, taxes, good moral character — arrested/claimed citizenship/child support first, then others — then attachment to Constitution) 3)Civics test (10 questions, applicant needs 6 correct to pass — stop early if they get 6) 4)English reading and writing 5)Closing with brief feedback. CURRENT FACTS: President=Donald Trump Party=Republican VP=JD Vance Speaker=Mike Johnson Chief Justice=John Roberts. Keep responses SHORT (1-3 sentences). Ask ONE question per turn. Never break character. Never reveal you are AI.`;
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
          audio: {
            output: { voice: voice }
          },
          instructions: instructions
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

    // GA endpoint returns { client_secret: { value: 'ek_...', expires_at: ... } }
    const ephemeralKey = tokenData.client_secret && tokenData.client_secret.value;
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

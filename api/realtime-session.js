// api/realtime-session.js
// Unified interface approach: browser sends its SDP offer to this endpoint,
// server combines it with session config and forwards to OpenAI /v1/realtime/calls
// Returns the SDP answer directly.

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vugvnqapdxyewxyfaayl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const OFFICER_VOICES = {
  martinez:  'coral',
  johnson:   'onyx',
  chen:      'sage',
  rodriguez: 'nova',
  williams:  'echo'
};

const OFFICER_TAGS = {
  martinez:  'Warm & Thorough',
  johnson:   'Strict & Professional',
  chen:      'Modern & Patient',
  rodriguez: 'Bilingual Expert',
  williams:  'Diplomatic'
};

const OFFICER_OFFICES = {
  martinez:  'Miami Field Office',
  johnson:   'Washington DC Office',
  chen:      'San Francisco Office',
  rodriguez: 'Los Angeles Office',
  williams:  'Atlanta Field Office'
};

const OFFICER_NAMES = {
  martinez:  'Officer M. Martinez',
  johnson:   'Officer R. Johnson',
  chen:      'Officer L. Chen',
  rodriguez: 'Officer C. Rodriguez',
  williams:  'Officer S. Williams'
};

function buildInstructions(officerId) {
  const name   = OFFICER_NAMES[officerId]   || 'Officer Martinez';
  const office = OFFICER_OFFICES[officerId] || 'USCIS Field Office';
  const tag    = OFFICER_TAGS[officerId]    || 'Professional';
  return `You are ${name}, a USCIS officer at the ${office}. Style: ${tag}. Conduct a realistic mock U.S. naturalization interview. CURRENT FACTS: President=Donald Trump, Party=Republican, VP=JD Vance, Speaker=Mike Johnson, Chief Justice=John Roberts. Follow this exact order: 1)Greeting & oath 2)N-400 review (personal info, travel, marital, employment, taxes, moral character, attachment to Constitution) 3)Civics (10 questions, need 6 correct) 4)English reading & writing 5)Closing. Keep responses SHORT (1-3 sentences). Ask ONE question at a time. Never break character.`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!OPENAI_KEY) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
  if (!SUPABASE_SERVICE_KEY) return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' });

  try {
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    } catch(e) { body = {}; }
    const userId    = (body.userId    || '').toString().trim();
    const officerId = (body.officerId || 'martinez').toString().trim().toLowerCase();
    const sdpOffer  = (body.sdp || '').toString();
    console.log('SDP length:', sdpOffer.length, 'userId:', userId.slice(0,8));

    if (!userId) return res.status(400).json({ error: 'userId required' });

    // ── 1. Verify premium + credits ──────────────────────────────────────
    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=plan,plan_expires_at,live_credits`,
      { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Accept': 'application/json' } }
    );
    const profiles = await profileRes.json();
    const profile = profiles && profiles[0];
    if (!profile) return res.status(404).json({ error: 'User not found' });

    const notExpired = !profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date();
    if (profile.plan !== 'premium' || !notExpired) return res.status(403).json({ error: 'Premium plan required' });

    const credits = typeof profile.live_credits === 'number' ? profile.live_credits : 0;
    if (credits <= 0) return res.status(403).json({ error: 'no_credits', message: 'No live interview credits remaining.' });

    // ── 2. Decrement credits ─────────────────────────────────────────────
    await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
      { method: 'PATCH', headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ live_credits: credits - 1 }) }
    );

    const voice        = OFFICER_VOICES[officerId] || 'coral';
    const instructions = buildInstructions(officerId);

    // ── 3. If browser sent SDP, use unified interface ─────────────────────
    if (sdpOffer) {
      const sessionConfig = JSON.stringify({
        type: 'realtime',
        model: 'gpt-realtime-2.1',
        audio: { output: { voice: voice } },
        instructions: instructions
      });

      // Build multipart/form-data manually — Node.js Blob not reliable in all envs
      const boundary = '----WebRTCBoundary' + Date.now().toString(16);
      const enc = new TextEncoder();
      const CRLF = '\r\n';

      const part1 = '--' + boundary + CRLF +
        'Content-Disposition: form-data; name="sdp"; filename="offer.sdp"' + CRLF +
        'Content-Type: application/sdp' + CRLF + CRLF +
        sdpOffer + CRLF;
      const part2 = '--' + boundary + CRLF +
        'Content-Disposition: form-data; name="session"; filename="session.json"' + CRLF +
        'Content-Type: application/json' + CRLF + CRLF +
        sessionConfig + CRLF;
      const closing = '--' + boundary + '--' + CRLF;

      const multipartBody = Buffer.concat([
        Buffer.from(part1, 'utf8'),
        Buffer.from(part2, 'utf8'),
        Buffer.from(closing, 'utf8')
      ]);

      console.log('multipart size:', multipartBody.length, 'boundary:', boundary);

      const callRes = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': multipartBody.length.toString(),
          'OpenAI-Safety-Identifier': Buffer.from(userId).toString('base64').slice(0, 32)
        },
        body: multipartBody
      });

      console.log('OpenAI /v1/realtime/calls status:', callRes.status);
      if (!callRes.ok) {
        const errText = await callRes.text();
        console.error('OpenAI calls error:', errText.slice(0, 300));
        // Refund credit
        await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
          { method: 'PATCH', headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ live_credits: credits }) });
        return res.status(502).json({ error: 'Could not start live session. Credit refunded.' });
      }

      const sdpAnswer = await callRes.text();
      return res.status(200).send(sdpAnswer);
    }

    // ── 4. No SDP yet — return session config for client to initiate ──────
    // This path: client will send SDP in a second request
    return res.status(200).json({
      ready: true,
      remaining_credits: credits - 1,
      officer: { id: officerId, name: OFFICER_NAMES[officerId], office: OFFICER_OFFICES[officerId], voice: voice }
    });

  } catch (err) {
    console.error('realtime-session error:', err);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
};

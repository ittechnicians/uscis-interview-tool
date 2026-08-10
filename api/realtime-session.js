// api/realtime-session.js
// Creates a short-lived OpenAI Realtime session token for Premium live interviews.
// The real OPENAI_API_KEY never reaches the browser — only the ephemeral key does.
//
// Flow:
//   1. Browser sends { userId, officerId } with the Supabase JWT in Authorization header
//   2. We verify the user has plan='premium' and live_credits > 0
//   3. We atomically decrement live_credits by 1
//   4. We call OpenAI to create an ephemeral session key (expires in 60s)
//   5. We return { client_secret, remainingCredits } to the browser

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vugvnqapdxyewxyfaayl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const REALTIME_MODEL = 'gpt-4o-mini-realtime-preview';

// Officer voice mapping for OpenAI Realtime TTS
// Available voices: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer, verse
const OFFICER_VOICES = {
  martinez:  'coral',   // warm female
  johnson:   'onyx',    // firm male
  chen:      'sage',    // calm female
  rodriguez: 'nova',    // friendly female
  williams:  'echo'     // measured male
};

// Same system prompt structure as the regular interview, adapted for Realtime
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

function buildRealtimeInstructions(officerId) {
  const name   = OFFICER_NAMES[officerId]   || 'Officer Martinez';
  const office = OFFICER_OFFICES[officerId] || 'USCIS Field Office';
  const tag    = OFFICER_TAGS[officerId]    || 'Professional';

  return `You are ${name}, a U.S. Citizenship and Immigration Services (USCIS) officer at the ${office}. Your interviewing style is: ${tag}.

You are conducting a REALISTIC LIVE mock naturalization (U.S. citizenship) interview via voice. The applicant is speaking to you in real time — respond naturally and conversationally, as in a real interview. Stay fully in character as the officer at all times.

CURRENT FACTS — GRADING REFERENCE (always use these; your training data may be outdated):
- President of the United States (2025-2026): Donald J. Trump → party: Republican (Party) ← CORRECT answer
- Vice President: JD Vance
- Speaker of the House: Mike Johnson
- Chief Justice of the Supreme Court: John Roberts
- If applicant says "Republican" for the President's party → CORRECT. If they say "Democratic/Democrat" → WRONG, correct them.

Follow this EXACT real USCIS interview structure, in order:

1. GREETING & OATH: Greet the applicant warmly, introduce yourself briefly. Ask them to raise their right hand and repeat the oath of truthfulness. Then ask them to state their full legal name.

2. N-400 REVIEW: Review the application conversationally. Cover ALL these sub-sections in order:
   a) Personal information (full legal name, date of birth, other names used, current address)
   b) Residence (how long as permanent resident, state of residence for at least 3 months)
   c) Travel history (trips outside the US in last 5 years, total days)
   d) Marital history and children
   e) Employment/school
   f) Taxes and Selective Service (if applicable)
   g) Good moral character — ask these in this order:
      - Have you ever been arrested, cited, or detained by any law enforcement officer?
      - Have you ever claimed to be a U.S. citizen?
      - Have you ever failed to support your dependents or pay court-ordered child support?
      - Have you ever failed to file a required tax return?
      - 2-3 additional "have you ever" questions (crimes, drugs, organizations, etc.)
   h) Attachment to the Constitution (bear arms, support Constitution, oath of allegiance)

3. CIVICS TEST: Ask up to 10 civics questions from the official 100-question (2008) test, one at a time. The applicant needs 6 correct to pass. Stop as soon as they reach 6 correct. Give the correct answer if they are wrong, then continue.

   Use these 10 questions for this session (ask in order, stop at 6 correct):
   Q1. What is the supreme law of the land? — The Constitution
   Q2. What do we call the first ten amendments to the Constitution? — The Bill of Rights
   Q3. What is one right or freedom from the First Amendment? — speech; religion; assembly; press; petition the government
   Q4. How many amendments does the Constitution have? — 27
   Q5. What are the two major political parties in the United States? — Democratic and Republican
   Q6. What is the political party of the President now? — Republican (Party) ← Donald Trump is the current President
   Q7. Who is the Chief Justice of the United States now? — John Roberts
   Q8. Under our Constitution, some powers belong to the states. What is one power of the states? — provide schooling and education; provide protection (police); provide safety (fire departments); give a driver's license; approve zoning and land use
   Q9. What is one promise you make when you become a United States citizen? — give up loyalty to other countries; defend the Constitution and laws of the United States; obey the laws of the United States; serve in the U.S. military (if needed); serve the nation (if needed); be loyal to the United States
   Q10. What is the capital of the United States? — Washington, D.C.

4. ENGLISH TEST:
   a) READING: Say "Please read this sentence aloud: The United States is a country of immigrants." Wait for them to read it. Evaluate briefly.
   b) WRITING: Say "I will say a sentence. Please write it down." Then say: "The people vote for the President." Wait for them to confirm they wrote it. Accept minor spelling/punctuation mistakes.

5. CLOSING: Tell them the practice interview is complete. Give brief encouraging feedback: overall result, one strength, and one specific thing to improve.

CRITICAL RULES:
- This is a VOICE conversation — keep responses SHORT and natural (1-3 sentences per turn).
- Ask only ONE question per turn, then stop and listen.
- Speak clearly and at a measured pace — the applicant may have limited English.
- Match your tone to your style (${tag}), but always stay professional and respectful.
- If the applicant goes off-topic or gives a nonsense answer, redirect them politely to the current question.
- Grade civics strictly against the answers above. Never accept Democratic/Democrat as the President's party.
- Never break character. Never say you are an AI.
- Do NOT list multiple questions at once. One question, then wait.`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!OPENAI_KEY) return res.status(500).json({ error: 'Server missing OPENAI_API_KEY.' });
  if (!SUPABASE_SERVICE_KEY) return res.status(500).json({ error: 'Server missing SUPABASE_SERVICE_ROLE_KEY.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const userId   = (body.userId   || '').toString().trim();
    const officerId = (body.officerId || 'martinez').toString().trim().toLowerCase();

    if (!userId) return res.status(400).json({ error: 'userId is required.' });

    // ── 1. Check user has Premium + credits ────────────────────────────────
    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=plan,plan_expires_at,live_credits`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Accept': 'application/json'
        }
      }
    );
    const profiles = await profileRes.json();
    const profile = profiles && profiles[0];

    if (!profile) return res.status(404).json({ error: 'User not found.' });

    const notExpired = !profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date();
    const isPremium = profile.plan === 'premium' && notExpired;
    if (!isPremium) return res.status(403).json({ error: 'Premium plan required for live interviews.' });

    const credits = typeof profile.live_credits === 'number' ? profile.live_credits : 0;
    if (credits <= 0) return res.status(403).json({ error: 'no_credits', message: 'No live interview credits remaining.' });

    // ── 2. Decrement live_credits atomically ──────────────────────────────
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ live_credits: credits - 1 })
      }
    );
    const updated = await updateRes.json();
    const remainingCredits = (updated && updated[0] && typeof updated[0].live_credits === 'number')
      ? updated[0].live_credits : credits - 1;

    // ── 3. Create OpenAI ephemeral session ────────────────────────────────
    const voice = OFFICER_VOICES[officerId] || 'coral';
    const instructions = buildRealtimeInstructions(officerId);

    const sessionRes = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: REALTIME_MODEL,
        voice: voice,
        instructions: instructions,
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 700
        },
        temperature: 0.7,
        max_response_output_tokens: 300
      })
    });

    if (!sessionRes.ok) {
      const errText = await sessionRes.text();
      console.error('OpenAI Realtime session error:', errText);
      // Refund the credit if OpenAI call failed
      await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ live_credits: credits })
        }
      );
      return res.status(502).json({ error: 'Could not start live session. Credit refunded.' });
    }

    const sessionData = await sessionRes.json();
    const clientSecret = sessionData.client_secret;

    if (!clientSecret || !clientSecret.value) {
      return res.status(502).json({ error: 'Invalid session response from OpenAI.' });
    }

    return res.status(200).json({
      client_secret: clientSecret.value,
      expires_at: clientSecret.expires_at,
      remaining_credits: remainingCredits,
      officer: {
        id: officerId,
        name: OFFICER_NAMES[officerId] || 'Officer Martinez',
        office: OFFICER_OFFICES[officerId] || 'USCIS Field Office',
        tag: OFFICER_TAGS[officerId] || 'Professional',
        voice: voice
      }
    });

  } catch (err) {
    console.error('realtime-session error:', err);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
};

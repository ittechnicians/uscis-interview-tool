// api/webhook.js
// Stripe calls this endpoint when events happen (payment completed, subscription
// canceled, etc.). On a successful payment we mark the user's account as
// 'professional' in Supabase.
//
// Security:
//  - We verify Stripe's signature using STRIPE_WEBHOOK_SECRET (whsec_...), so only
//    real Stripe events are accepted. This needs the RAW request body, so body
//    parsing is disabled below.
//  - We write to Supabase using SUPABASE_SERVICE_ROLE_KEY (server-only; never in
//    the browser), because users are not allowed to change their own plan.
//
// Env vars needed in Vercel:
//  STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY, (SUPABASE_URL optional)

const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vugvnqapdxyewxyfaayl.supabase.co';
const SIGNATURE_TOLERANCE_SECONDS = 300; // 5 minutes, guards against replay

function readRawBody(req) {
  return new Promise(function (resolve, reject) {
    const chunks = [];
    req.on('data', function (c) { chunks.push(Buffer.from(c)); });
    req.on('end', function () { resolve(Buffer.concat(chunks)); });
    req.on('error', reject);
  });
}

function verifyStripeSignature(rawBody, sigHeader, secret) {
  if (!sigHeader) return false;
  let t = null;
  const v1 = [];
  sigHeader.split(',').forEach(function (part) {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const k = part.slice(0, idx);
    const v = part.slice(idx + 1);
    if (k === 't') t = v;
    else if (k === 'v1') v1.push(v);
  });
  if (!t || !v1.length) return false;

  // Reject very old timestamps (replay protection).
  const age = Math.abs(Math.floor(Date.now() / 1000) - parseInt(t, 10));
  if (isNaN(age) || age > SIGNATURE_TOLERANCE_SECONDS) return false;

  const signedPayload = t + '.' + rawBody.toString('utf8');
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return v1.some(function (v) {
    try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v)); }
    catch (e) { return false; }
  });
}

async function updateProfile(userId, fields) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = SUPABASE_URL + '/rest/v1/profiles?id=eq.' + encodeURIComponent(userId);
  const r = await fetch(url, {
    method: 'PATCH',
    headers: {
      'apikey': key,
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(fields)
  });
  if (!r.ok) {
    let detail = '';
    try { detail = await r.text(); } catch (e) {}
    console.error('Supabase update failed:', r.status, detail);
    return false;
  }
  return true;
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!whSecret || !svcKey) {
    console.error('Missing STRIPE_WEBHOOK_SECRET or SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ error: 'Server is missing webhook configuration.' });
  }

  let raw;
  try {
    raw = await readRawBody(req);
  } catch (e) {
    return res.status(400).json({ error: 'Could not read request body.' });
  }

  const sig = req.headers['stripe-signature'];
  if (!verifyStripeSignature(raw, sig, whSecret)) {
    console.error('Invalid Stripe signature');
    return res.status(400).json({ error: 'Invalid signature.' });
  }

  let event;
  try {
    event = JSON.parse(raw.toString('utf8'));
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON.' });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      const userId = s.client_reference_id || (s.metadata && s.metadata.userId);
      if (userId) {
        await updateProfile(userId, {
          plan: 'professional',
          stripe_customer_id: s.customer || null,
          subscription_status: 'active'
        });
        console.log('Upgraded user to professional:', userId);
      } else {
        console.error('checkout.session.completed without userId');
      }
    } else if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const userId = sub.metadata && sub.metadata.userId;
      if (userId) {
        const active = (sub.status === 'active' || sub.status === 'trialing');
        await updateProfile(userId, {
          plan: active ? 'professional' : 'free',
          subscription_status: sub.status
        });
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const userId = sub.metadata && sub.metadata.userId;
      if (userId) {
        await updateProfile(userId, { plan: 'free', subscription_status: 'canceled' });
        console.log('Downgraded user to free:', userId);
      }
    }
    // Other event types are acknowledged and ignored.
  } catch (e) {
    console.error('Webhook processing error:', e);
    // Acknowledge receipt so Stripe doesn't retry on our internal errors.
  }

  return res.status(200).json({ received: true });
}

module.exports = handler;
// Disable Vercel's automatic body parsing so we can verify the raw signature.
module.exports.config = { api: { bodyParser: false } };

// api/checkout.js
// Creates a Stripe Checkout Session and returns the hosted payment URL.
// The browser redirects the user there; Stripe handles the card securely.
//
// Secrets live in Vercel environment variables (never in the code / browser):
//   STRIPE_SECRET_KEY   -> your sk_test_... (and later sk_live_...)
//   STRIPE_PRICE_ID     -> (optional) overrides the price below for live mode
//
// We attach the Supabase user id as client_reference_id + metadata so the
// webhook (next step) can mark the right account as Professional.

// Test-mode price for the Professional plan ($19/mo). For live mode, set
// STRIPE_PRICE_ID in Vercel to the live price and this is ignored.
const DEFAULT_PRICE_ID = 'price_1ToRtMCDX7108zYnvqll21nL';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ error: 'Server is missing STRIPE_SECRET_KEY.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const userId = (body.userId || '').toString();
    const email = (body.email || '').toString();
    const priceId = process.env.STRIPE_PRICE_ID || DEFAULT_PRICE_ID;

    // Build absolute URLs from the request so this works on any domain.
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
    const origin = req.headers.origin || (proto + '://' + host);

    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', '1');
    params.append('success_url', origin + '/dashboard.html?upgraded=1');
    params.append('cancel_url', origin + '/dashboard.html?canceled=1');
    params.append('allow_promotion_codes', 'true');
    if (email) params.append('customer_email', email);
    if (userId) {
      params.append('client_reference_id', userId);
      params.append('metadata[userId]', userId);
      // Also stamp the subscription itself, so the webhook always has the id.
      params.append('subscription_data[metadata][userId]', userId);
    }

    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + secret,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await r.json();
    if (!r.ok) {
      console.error('Stripe checkout error:', data && data.error);
      return res.status(502).json({ error: (data && data.error && data.error.message) || 'Stripe error.' });
    }

    return res.status(200).json({ url: data.url });
  } catch (err) {
    console.error('checkout handler error:', err);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
};

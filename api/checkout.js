// api/checkout.js
// Creates a Stripe Checkout Session (ONE-TIME payment) and returns the hosted
// payment URL. The browser redirects the user there; Stripe handles the card.
//
// Business model: pay once, 90 days of access. No subscriptions.
//
// Secrets live in Vercel environment variables (never in the code / browser):
//   STRIPE_SECRET_KEY        -> sk_test_... in test, sk_live_... in production
//   STRIPE_PRICE_ID          -> one-time price for Professional
//   STRIPE_PRICE_ID_PREMIUM  -> one-time price for Premium (when it launches)
//
// We attach the Supabase user id + plan as metadata so the webhook can mark
// the right account with the right plan.

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
    const plan = (body.plan === 'premium' || body.plan === 'upgrade') ? 'premium' : body.plan === 'topup' ? 'topup' : 'pro';

    const priceId = plan === 'premium'
      ? process.env.STRIPE_PRICE_ID_PREMIUM
      : plan === 'upgrade'
      ? process.env.STRIPE_PRICE_ID_UPGRADE
      : plan === 'topup'
      ? process.env.STRIPE_PRICE_ID_TOPUP
      : process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return res.status(500).json({ error: 'Price is not configured for this plan.' });
    }

    // Build absolute URLs from the request so this works on any domain.
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
    const origin = req.headers.origin || (proto + '://' + host);

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', '1');
    params.append('success_url', origin + '/dashboard.html?upgraded=1');
    params.append('cancel_url', origin + '/dashboard.html?canceled=1');
    params.append('allow_promotion_codes', 'true');
    params.append('customer_creation', 'always');
    if (email) params.append('customer_email', email);
    if (userId) {
      params.append('client_reference_id', userId);
      params.append('metadata[userId]', userId);
      params.append('metadata[plan]', plan);
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

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

    // ---- Live Zoom course (curso.html): its own price, seats and return pages ----
    if (body.plan === 'course') {
      const { COURSE, soldSeats, alreadyEnrolled, publicInfo } = require('./_course.js');
      if (!userId) return res.status(400).json({ error: 'Necesitas una cuenta para inscribirte.' });
      const sold = await soldSeats(COURSE.cohort);
      if (sold === null) return res.status(500).json({ error: 'No pudimos revisar los lugares disponibles. Inténtalo en un momento.' });
      const info = publicInfo(sold);
      if (info.closed) return res.status(409).json({ error: 'Las inscripciones para este grupo ya cerraron.' });
      if (info.full) return res.status(409).json({ error: 'Este grupo ya está lleno. Únete a la lista de espera.' });
      if (await alreadyEnrolled(userId, COURSE.cohort)) return res.status(409).json({ error: 'Ya estás inscrito en este grupo.' });
      const coursePrice = info.founderLeft > 0 ? process.env.STRIPE_PRICE_ID_COURSE_FOUNDER : process.env.STRIPE_PRICE_ID_COURSE;
      if (!coursePrice) return res.status(500).json({ error: 'Price is not configured for the course.' });
      const cHost = req.headers['x-forwarded-host'] || req.headers.host;
      const cProto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
      const cOrigin = req.headers.origin || (cProto + '://' + cHost);
      const cp = new URLSearchParams();
      cp.append('mode', 'payment');
      cp.append('line_items[0][price]', coursePrice);
      cp.append('line_items[0][quantity]', '1');
      cp.append('success_url', cOrigin + '/curso.html?inscrito=1');
      cp.append('cancel_url', cOrigin + '/curso.html?cancelado=1');
      cp.append('allow_promotion_codes', 'true');
      cp.append('customer_creation', 'always');
      if (email) cp.append('customer_email', email);
      cp.append('client_reference_id', userId);
      cp.append('metadata[userId]', userId);
      cp.append('metadata[plan]', 'course');
      cp.append('metadata[cohort]', COURSE.cohort);
      const cr = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + secret, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: cp.toString()
      });
      const cdata = await cr.json();
      if (!cr.ok) {
        console.error('Stripe course checkout error:', cdata && cdata.error);
        return res.status(502).json({ error: (cdata && cdata.error && cdata.error.message) || 'Stripe error.' });
      }
      return res.status(200).json({ url: cdata.url });
    }
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

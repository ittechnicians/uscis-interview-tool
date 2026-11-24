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

    const hostH = req.headers['x-forwarded-host'] || req.headers.host;
    const protoH = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
    const originH = req.headers.origin || (protoH + '://' + hostH);
    async function stripeSession(p) {
      const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST', headers: { 'Authorization': 'Bearer ' + secret, 'Content-Type': 'application/x-www-form-urlencoded' }, body: p.toString()
      });
      const d = await r.json();
      if (!r.ok) { console.error('Stripe checkout error:', d && d.error); return res.status(502).json({ error: (d && d.error && d.error.message) || 'Stripe error.' }); }
      return res.status(200).json({ url: d.url });
    }

    // ---- "Curso a tu ritmo" (self-paced, $59): 60 days of Premium + 10 live interviews + mi-curso.html ----
    if (body.plan === 'self') {
      if (!userId) return res.status(400).json({ error: 'Necesitas una cuenta para comprar el curso.' });
      const selfPrice = process.env.STRIPE_PRICE_ID_SELF;
      if (!selfPrice) return res.status(500).json({ error: 'Price is not configured for the self-paced course.' });
      const sp = new URLSearchParams();
      sp.append('mode', 'payment');
      sp.append('line_items[0][price]', selfPrice);
      sp.append('line_items[0][quantity]', '1');
      sp.append('success_url', originH + '/mi-curso.html?comprado=1');
      sp.append('cancel_url', originH + '/curso.html?cancelado=1');
      sp.append('allow_promotion_codes', 'true');
      sp.append('customer_creation', 'always');
      if (email) sp.append('customer_email', email);
      sp.append('client_reference_id', userId);
      sp.append('metadata[userId]', userId);
      sp.append('metadata[plan]', 'self');
      return stripeSession(sp);
    }

    // ---- Move from the self-paced course to the live course, paying only the difference ----
    if (body.plan === 'course_upgrade') {
      if (!userId) return res.status(400).json({ error: 'Necesitas una cuenta.' });
      const { upgradeInfo } = require('./_course.js');
      const up = await upgradeInfo(userId);
      if (!up.eligible) {
        const why = { no_self: 'Esta opción es para quien compró el curso a tu ritmo.', expired: 'El plazo de 14 días para pasarte al curso en vivo ya terminó.',
          enrolled: 'Ya estás inscrito en el curso en vivo.', closed: 'Las inscripciones del grupo en vivo ya cerraron.', full: 'El grupo en vivo ya está lleno.' };
        return res.status(409).json({ error: why[up.reason] || 'No se pudo revisar tu pase. Inténtalo en un momento.' });
      }
      const up2 = new URLSearchParams();
      up2.append('mode', 'payment');
      up2.append('line_items[0][price_data][currency]', 'usd');
      up2.append('line_items[0][price_data][unit_amount]', String(up.amountCents));
      up2.append('line_items[0][price_data][product_data][name]', 'Pase al curso en vivo (diferencia)');
      up2.append('line_items[0][quantity]', '1');
      up2.append('success_url', originH + '/mi-curso.html?pase=1');
      up2.append('cancel_url', originH + '/mi-curso.html');
      up2.append('customer_creation', 'always');
      if (email) up2.append('customer_email', email);
      up2.append('client_reference_id', userId);
      up2.append('metadata[userId]', userId);
      up2.append('metadata[plan]', 'course_upgrade');
      up2.append('metadata[cohort]', up.cohort);
      return stripeSession(up2);
    }

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

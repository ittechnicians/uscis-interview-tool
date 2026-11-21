// api/course.js — public info for the live course page (curso.html) and its waitlist.
//   GET  /api/course                      -> dates, price, seats left (no personal data)
//   POST /api/course {action:"waitlist"}  -> saves name/email/phone for a group that is not open yet
// Writes go through the service key (server only); the tables are closed to the browser.
const { COURSE, SUPABASE_URL, soldSeats, publicInfo } = require('./_course.js');

function clean(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max); }

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const sold = await soldSeats(COURSE.cohort);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(publicInfo(sold));
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      if (body.action !== 'waitlist') return res.status(400).json({ error: 'Acción no válida.' });

      const name = clean(body.name, 120);
      const email = clean(body.email, 200).toLowerCase();
      const phone = clean(body.phone, 40);
      const schedule = body.schedule === 'sabado' ? 'sabado' : 'noche';
      if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return res.status(400).json({ error: 'Escribe tu nombre y un correo válido.' });
      }

      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!key) return res.status(500).json({ error: 'Falta configuración del servidor.' });
      const r = await fetch(SUPABASE_URL + '/rest/v1/course_waitlist', {
        method: 'POST',
        headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ name, email, phone: phone || null, schedule, cohort: COURSE.cohort })
      });
      if (!r.ok) {
        console.error('waitlist insert failed', r.status, await r.text().catch(() => ''));
        return res.status(500).json({ error: 'No se pudo guardar. Inténtalo de nuevo.' });
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('course handler error', e);
    return res.status(500).json({ error: 'Error inesperado.' });
  }
};

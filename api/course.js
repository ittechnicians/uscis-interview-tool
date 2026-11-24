// api/course.js — public info for the live course page (curso.html) and its waitlist.
//   GET  /api/course                      -> dates, price, seats left (no personal data)
//   POST /api/course {action:"waitlist"}  -> saves name/email/phone for a group that is not open yet
//   GET  /api/course?progress=<group>     -> teacher only: saved class progress for that group
//   POST /api/course {action:"progress"}  -> teacher only: saves class progress for a group
// Writes go through the service key (server only); the tables are closed to the browser.
const { COURSE, SUPABASE_URL, soldSeats, publicInfo } = require('./_course.js');

// The teacher screen (maestro.html) is for these accounts only. Extra emails: env COURSE_TEACHERS (comma separated).
const TEACHERS = ['oscaralvarezdosa@gmail.com'].concat(String(process.env.COURSE_TEACHERS || '').split(','))
  .map(e => e.trim().toLowerCase()).filter(Boolean);

// Returns the teacher's email if the request carries a valid login token of a teacher, otherwise null.
async function teacherFrom(req) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const auth = String((req.headers && (req.headers.authorization || req.headers.Authorization)) || '');
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!key || !token) return null;
  try {
    const r = await fetch(SUPABASE_URL + '/auth/v1/user', { headers: { apikey: key, Authorization: 'Bearer ' + token } });
    if (!r.ok) return null;
    const u = await r.json();
    const email = String((u && u.email) || '').toLowerCase();
    return TEACHERS.includes(email) ? email : null;
  } catch (e) { return null; }
}

// The signed-in user (any student) from the login token, or null.
async function userFrom(req) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const token = String((req.headers && (req.headers.authorization || req.headers.Authorization)) || '').replace(/^Bearer\s+/i, '');
  if (!key || !token) return null;
  try {
    const r = await fetch(SUPABASE_URL + '/auth/v1/user', { headers: { apikey: key, Authorization: 'Bearer ' + token } });
    return r.ok ? await r.json() : null;
  } catch (e) { return null; }
}

function cleanGroup(v) { return String(v || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40); }

function clean(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max); }

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET' && req.query && req.query.upgrade !== undefined) {
      const u = await userFrom(req);
      if (!u || !u.id) return res.status(401).json({ eligible: false });
      const { upgradeInfo, SELF } = require('./_course.js');
      const info = await upgradeInfo(u.id);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ eligible: info.eligible, reason: info.reason, amount: info.amountCents ? info.amountCents / 100 : null,
        deadline: info.deadline || null, livePrice: info.livePrice || null, selfPrice: SELF.price });
    }

    if (req.method === 'GET' && req.query && req.query.progress !== undefined) {
      const teacher = await teacherFrom(req);
      if (!teacher) return res.status(403).json({ error: 'Solo para el maestro.' });
      const group = cleanGroup(req.query.progress) || COURSE.cohort;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const r = await fetch(SUPABASE_URL + '/rest/v1/course_progress?cohort=eq.' + encodeURIComponent(group) + '&select=data,updated_at',
        { headers: { apikey: key, Authorization: 'Bearer ' + key } });
      if (!r.ok) return res.status(500).json({ error: 'No se pudo leer el avance. ¿Ya corriste sql/curso-maestro.sql?' });
      const rows = await r.json();
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ group, teacher, data: (rows[0] && rows[0].data) || {}, updated_at: rows[0] ? rows[0].updated_at : null });
    }

    if (req.method === 'GET') {
      const sold = await soldSeats(COURSE.cohort);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(publicInfo(sold));
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      if (body.action === 'progress') {
        const teacher = await teacherFrom(req);
        if (!teacher) return res.status(403).json({ error: 'Solo para el maestro.' });
        const group = cleanGroup(body.group) || COURSE.cohort;
        const data = body.data && typeof body.data === 'object' ? body.data : {};
        if (JSON.stringify(data).length > 100000) return res.status(400).json({ error: 'Demasiados datos.' });
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const r = await fetch(SUPABASE_URL + '/rest/v1/course_progress?on_conflict=cohort', {
          method: 'POST',
          headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify({ cohort: group, data, updated_at: new Date().toISOString() })
        });
        if (!r.ok) {
          console.error('progress save failed', r.status, await r.text().catch(() => ''));
          return res.status(500).json({ error: 'No se pudo guardar el avance.' });
        }
        return res.status(200).json({ ok: true });
      }
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

// api/_course.js — settings and seat count for the live Zoom course.
// Files starting with "_" are NOT deployed as endpoints by Vercel: this is a shared helper
// used by api/course.js, api/checkout.js and api/webhook.js.
//
// To open a NEW group later: change `cohort` (any new name), the dates and, if needed, the seats.

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vugvnqapdxyewxyfaayl.supabase.co';

const COURSE = {
  cohort: 'sab-2026-12',                       // id of this group (enrollments are counted per group)
  title: 'Camino a la Ciudadanía — curso en vivo por Zoom',
  schedule: 'Sábados de 10:00 a. m. a 12:00 p. m. (hora del centro, Texas)',
  dates: ['2026-12-12', '2026-12-19', '2027-01-09', '2027-01-16'],   // 4 Saturdays (break for the holidays)
  enrollmentCloses: '2026-12-10',              // last day to enroll (inclusive)
  founderSeats: 10,                            // first 10 pay the founder price
  totalSeats: 13,                              // 10 founder + 3 extra at the regular price
  minSeats: 5,                                 // below this the group does not open (see the page's rules)
  founderPrice: 99,
  regularPrice: 147,
  liveInterviews: 16,                          // live interviews included (replaces Premium's 8)
  accessDays: 90,                              // Premium days from the enrollment (added to any active Premium)
  premiumDaysAfterEnd: 7,                      // ...and never less than 7 days after the last class
  nightGroup: 'Una noche entre semana, de 7:30 a 9:00 p. m. (hora del centro)'
};

// "Curso a tu ritmo" (self-paced): one payment, 60 days of Premium, 10 live interviews and the student course (mi-curso.html).
// Its purchases are saved in course_enrollments with cohort 'self' (they do not use seats of the live groups).
const SELF = {
  cohort: 'self',
  price: 59,
  days: 60,
  liveInterviews: 10,
  upgradeWindowDays: 14            // they can move to the live course paying the difference within 14 days
};

// How many paid enrollments this group has. Returns null if it cannot be read.
async function soldSeats(cohort) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  try {
    const url = SUPABASE_URL + '/rest/v1/course_enrollments?cohort=eq.' + encodeURIComponent(cohort || COURSE.cohort) + '&select=id';
    const r = await fetch(url, { headers: { apikey: key, Authorization: 'Bearer ' + key, Prefer: 'count=exact', Range: '0-0' } });
    if (!r.ok && r.status !== 206) return null;
    const cr = r.headers.get('content-range') || '';          // e.g. "0-0/7" or "*/0"
    const total = parseInt(cr.split('/')[1], 10);
    return isNaN(total) ? null : total;
  } catch (e) { return null; }
}

// True if this user already paid for this group (so they are not charged twice).
async function alreadyEnrolled(userId, cohort) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || !userId) return false;
  try {
    const url = SUPABASE_URL + '/rest/v1/course_enrollments?cohort=eq.' + encodeURIComponent(cohort || COURSE.cohort) +
      '&user_id=eq.' + encodeURIComponent(userId) + '&select=id&limit=1';
    const r = await fetch(url, { headers: { apikey: key, Authorization: 'Bearer ' + key } });
    if (!r.ok) return false;
    const rows = await r.json();
    return Array.isArray(rows) && rows.length > 0;
  } catch (e) { return false; }
}

// The latest self-paced purchase of this user: { created_at, amount_cents } or null.
async function selfPurchase(userId) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || !userId) return null;
  try {
    const url = SUPABASE_URL + '/rest/v1/course_enrollments?cohort=eq.' + SELF.cohort + '&user_id=eq.' + encodeURIComponent(userId) +
      '&select=created_at,amount_cents&order=created_at.desc&limit=1';
    const r = await fetch(url, { headers: { apikey: key, Authorization: 'Bearer ' + key } });
    if (!r.ok) return null;
    const rows = await r.json();
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  } catch (e) { return null; }
}

// Can this user move from the self-paced course to the live course now, and for how much?
// The price is the live course price TODAY minus what they actually paid for the self-paced course.
async function upgradeInfo(userId) {
  const self = await selfPurchase(userId);
  if (!self) return { eligible: false, reason: 'no_self' };
  const deadline = new Date(new Date(self.created_at).getTime() + SELF.upgradeWindowDays * 86400000);
  if (Date.now() > deadline.getTime()) return { eligible: false, reason: 'expired', deadline };
  if (await alreadyEnrolled(userId, COURSE.cohort)) return { eligible: false, reason: 'enrolled' };
  const sold = await soldSeats(COURSE.cohort);
  if (sold === null) return { eligible: false, reason: 'unknown' };
  const info = publicInfo(sold);
  if (info.closed) return { eligible: false, reason: 'closed' };
  if (info.full) return { eligible: false, reason: 'full' };
  const paid = typeof self.amount_cents === 'number' ? self.amount_cents : SELF.price * 100;
  const amountCents = Math.max(0, info.price * 100 - Math.min(paid, SELF.price * 100));
  return { eligible: amountCents > 0, reason: amountCents > 0 ? 'ok' : 'free', amountCents, livePrice: info.price, deadline, cohort: COURSE.cohort, firstPurchase: self.created_at };
}

function isOpen(now) {
  const d = now || new Date();
  // Enrollment closes at the end of `enrollmentCloses` in US Central time (UTC-6).
  const close = new Date(COURSE.enrollmentCloses + 'T23:59:59-06:00');
  return d <= close;
}

function lastClassEnd() {
  const last = COURSE.dates[COURSE.dates.length - 1];
  return new Date(last + 'T12:00:00-06:00');
}

// What the public page shows. `sold` may be null when the count cannot be read.
function publicInfo(sold) {
  const n = typeof sold === 'number' ? sold : 0;
  const founderLeft = Math.max(0, COURSE.founderSeats - n);
  const seatsLeft = Math.max(0, COURSE.totalSeats - n);
  return {
    cohort: COURSE.cohort, title: COURSE.title, schedule: COURSE.schedule, dates: COURSE.dates,
    enrollmentCloses: COURSE.enrollmentCloses, minSeats: COURSE.minSeats,
    founderPrice: COURSE.founderPrice, regularPrice: COURSE.regularPrice, liveInterviews: COURSE.liveInterviews,
    nightGroup: COURSE.nightGroup,
    countKnown: typeof sold === 'number',
    founderLeft, seatsLeft,
    price: founderLeft > 0 ? COURSE.founderPrice : COURSE.regularPrice,
    open: isOpen() && seatsLeft > 0,
    full: seatsLeft <= 0,
    closed: !isOpen()
  };
}

module.exports = { COURSE, SELF, SUPABASE_URL, soldSeats, alreadyEnrolled, publicInfo, isOpen, lastClassEnd, selfPurchase, upgradeInfo };

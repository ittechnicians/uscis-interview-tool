// api/questions.js
// Serves the official civics question bank to the browser (used by civics.html).
// No OpenAI involved — this just returns the data from civics.js, so it's free to run.
const { CIVICS_2008, CIVICS_2020 } = require('./civics.js');

module.exports = function handler(req, res) {
  const v = (req.query && req.query.v === '128') ? '128' : '100';
  const bank = (v === '128') ? CIVICS_2020 : CIVICS_2008;
  res.status(200).json({ version: v, count: bank.length, questions: bank });
};

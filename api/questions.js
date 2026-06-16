// api/questions.js
// Serves the official civics question bank to the browser (used by civics.html).
// No OpenAI involved — this just returns the data from civics.js, so it's free to run.
// Optional ?state=<name> resolves the state-specific answers (Senators, Governor, capital).
const { CIVICS_2008, CIVICS_2020, resolveStateAnswers, STATE_INFO } = require('./civics.js');

module.exports = function handler(req, res) {
  const v = (req.query && req.query.v === '128') ? '128' : '100';
  let bank = (v === '128') ? CIVICS_2020 : CIVICS_2008;
  const state = req.query && req.query.state;
  if (state) bank = resolveStateAnswers(bank, state);
  res.status(200).json({
    version: v,
    count: bank.length,
    questions: bank,
    states: Object.keys(STATE_INFO)
  });
};

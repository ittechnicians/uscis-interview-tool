// api/n400.js
// Question bank for the N-400 portion of the mock interview, organized by the
// same sections a real USCIS officer reviews. Grounded in the official N-400 form.
//
// selectN400(seed) returns a VARIED subset each interview: it picks a few questions
// per section using a seeded random generator, so the questions differ between
// interviews but stay STABLE across the many turns of a single interview (the
// browser sends the same seed with every request during one interview).

const N400_SECTIONS = [
  {
    title: 'Identity',
    pick: 2,
    questions: [
      'What is your date of birth?',
      'Where were you born — what is your country of birth?',
      'What is your country of citizenship or nationality?',
      'Have you ever used any other names, such as a maiden name or a nickname?',
      'Do you want to legally change your name when you become a citizen?'
    ]
  },
  {
    title: 'Address',
    pick: 1,
    questions: [
      'What is your current home address?',
      'How long have you lived at your current address?',
      'What was your previous address before this one?',
      'Do you live in a house or an apartment?'
    ]
  },
  {
    title: 'Residence and time as a permanent resident',
    pick: 2,
    questions: [
      'How long have you been a lawful permanent resident?',
      'When did you become a permanent resident?',
      'Are you applying based on five years as a permanent resident, or three years married to a U.S. citizen?',
      'Have you lived in this state or district for at least three months?',
      'Since becoming a permanent resident, have you spent most of your time living in the United States?'
    ]
  },
  {
    title: 'Marital history',
    pick: 1,
    questions: [
      'What is your current marital status — single, married, divorced, or widowed?',
      'What is your spouse\'s full name?',
      'Is your spouse a U.S. citizen?',
      'How many times have you been married?',
      'When and where did you get married?'
    ]
  },
  {
    title: 'Children',
    pick: 1,
    questions: [
      'Do you have any children?',
      'How many children do you have, and where do they live?'
    ]
  },
  {
    title: 'Employment',
    pick: 1,
    questions: [
      'What is your current job or occupation?',
      'Where do you currently work?',
      'Who has been your employer over the last five years?',
      'Are you currently working, studying, or retired?'
    ]
  },
  {
    title: 'Travel outside the United States',
    pick: 1,
    questions: [
      'How many trips have you taken outside the United States in the last five years?',
      'What was the longest trip you took outside the United States?',
      'Since becoming a permanent resident, have you taken any trip outside the U.S. that lasted six months or longer?',
      'In total, about how many days have you spent outside the United States in the last five years?'
    ]
  },
  {
    title: 'Taxes and registration',
    pick: 1,
    questions: [
      'Have you filed your federal income taxes every year?',
      'Do you owe any overdue federal, state, or local taxes?',
      'Have you ever failed to file a required tax return?',
      'If you are a man who lived in the U.S. between ages 18 and 26, did you register for the Selective Service?'
    ]
  },
  {
    title: 'Good moral character (the "Have you ever..." questions)',
    pick: 3,
    questions: [
      'Have you ever been arrested, cited, or detained by any law enforcement officer?',
      'Have you ever been convicted of a crime?',
      'Have you ever committed a crime or offense for which you were not arrested?',
      'Have you ever claimed to be a U.S. citizen, in writing or in any other way?',
      'Have you ever registered to vote, or voted, in any election in the United States?',
      'Have you ever been a member of the Communist Party or any other totalitarian party?',
      'Have you ever been a member of, or in any way associated with, a terrorist organization?',
      'Have you ever persecuted anyone because of race, religion, national origin, political opinion, or membership in a social group?',
      'Have you ever been involved in genocide, torture, or the killing of any person?',
      'Have you ever been a habitual drunkard, or had a serious problem with alcohol or drugs?',
      'Have you ever sold, smuggled, or helped to traffic any controlled substances or illegal drugs?',
      'Have you ever failed to support your dependents or to pay court-ordered child support?',
      'Have you ever given false or misleading information to a U.S. government official to gain an immigration benefit?'
    ]
  },
  {
    title: 'Attachment to the Constitution and the Oath',
    pick: 2,
    questions: [
      'Do you support the Constitution and form of government of the United States?',
      'Do you understand the full Oath of Allegiance to the United States?',
      'Are you willing to take the full Oath of Allegiance to the United States?',
      'If the law requires it, are you willing to bear arms on behalf of the United States?',
      'If the law requires it, are you willing to perform noncombatant service in the U.S. armed forces?',
      'If the law requires it, are you willing to perform work of national importance under civilian direction?'
    ]
  }
];

// Small seeded RNG (mulberry32) so a given seed always produces the same selection.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWith(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function selectN400(seed) {
  const rng = mulberry32((seed >>> 0) || 1);
  return N400_SECTIONS.map(function (sec) {
    const picked = shuffleWith(sec.questions, rng).slice(0, Math.min(sec.pick, sec.questions.length));
    return { title: sec.title, questions: picked };
  });
}

module.exports = { N400_SECTIONS, selectN400 };

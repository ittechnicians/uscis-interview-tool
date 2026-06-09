// api/civics.js
// Official USCIS civics test data. The questions/answers are U.S. government works (public domain).
//
// IMPORTANT — KEEP THIS UPDATED:
// The values in CURRENT_OFFICIALS change with elections and appointments.
// When a new President, Vice President, Speaker, or Chief Justice takes office,
// update the strings below. Last verified: June 2026.

const CURRENT_OFFICIALS = {
  president: 'Donald Trump',
  vicePresident: 'JD Vance',
  presidentParty: 'Republican (Party)',
  speaker: 'Mike Johnson',
  chiefJustice: 'John Roberts'
};

// For questions whose answer depends on the applicant's state/district.
const STATE = 'Answer varies by the applicant\'s state — first ask which U.S. state they live in, then accept the correct current answer for that state. (Washington, D.C. residents have no Senators/Representative/Governor; D.C. is not a state.)';

// 2008 test: 100 questions. The officer asks up to 10; the applicant must answer 6 correctly to pass.
const CIVICS_2008 = [
  { n: 1,  q: 'What is the supreme law of the land?', a: 'the Constitution' },
  { n: 2,  q: 'What does the Constitution do?', a: 'sets up the government; defines the government; protects basic rights of Americans' },
  { n: 3,  q: 'The idea of self-government is in the first three words of the Constitution. What are these words?', a: 'We the People' },
  { n: 4,  q: 'What is an amendment?', a: 'a change (to the Constitution); an addition (to the Constitution)' },
  { n: 5,  q: 'What do we call the first ten amendments to the Constitution?', a: 'the Bill of Rights' },
  { n: 6,  q: 'What is one right or freedom from the First Amendment?', a: 'speech; religion; assembly; press; petition the government' },
  { n: 7,  q: 'How many amendments does the Constitution have?', a: 'twenty-seven (27)' },
  { n: 8,  q: 'What did the Declaration of Independence do?', a: 'announced/declared our independence from Great Britain; said that the United States is free from Great Britain' },
  { n: 9,  q: 'What are two rights in the Declaration of Independence?', a: 'life; liberty; pursuit of happiness' },
  { n: 10, q: 'What is freedom of religion?', a: 'You can practice any religion, or not practice a religion.' },
  { n: 11, q: 'What is the economic system in the United States?', a: 'capitalist economy; market economy' },
  { n: 12, q: 'What is the "rule of law"?', a: 'Everyone must follow the law; Leaders/Government must obey the law; No one is above the law.' },
  { n: 13, q: 'Name one branch or part of the government.', a: 'Congress (legislative); President (executive); the courts (judicial)' },
  { n: 14, q: 'What stops one branch of government from becoming too powerful?', a: 'checks and balances; separation of powers' },
  { n: 15, q: 'Who is in charge of the executive branch?', a: 'the President' },
  { n: 16, q: 'Who makes federal laws?', a: 'Congress; the Senate and House (of Representatives); the (U.S./national) legislature' },
  { n: 17, q: 'What are the two parts of the U.S. Congress?', a: 'the Senate and House (of Representatives)' },
  { n: 18, q: 'How many U.S. Senators are there?', a: 'one hundred (100)' },
  { n: 19, q: 'We elect a U.S. Senator for how many years?', a: 'six (6)' },
  { n: 20, q: "Who is one of your state's U.S. Senators now?", a: STATE },
  { n: 21, q: 'The House of Representatives has how many voting members?', a: 'four hundred thirty-five (435)' },
  { n: 22, q: 'We elect a U.S. Representative for how many years?', a: 'two (2)' },
  { n: 23, q: 'Name your U.S. Representative.', a: STATE },
  { n: 24, q: 'Who does a U.S. Senator represent?', a: 'all people of the state' },
  { n: 25, q: 'Why do some states have more Representatives than other states?', a: "(because of) the state's population; because some states have more people" },
  { n: 26, q: 'We elect a President for how many years?', a: 'four (4)' },
  { n: 27, q: 'In what month do we vote for President?', a: 'November' },
  { n: 28, q: 'What is the name of the President of the United States now?', a: '__PRESIDENT__' },
  { n: 29, q: 'What is the name of the Vice President of the United States now?', a: '__VICE_PRESIDENT__' },
  { n: 30, q: 'If the President can no longer serve, who becomes President?', a: 'the Vice President' },
  { n: 31, q: 'If both the President and the Vice President can no longer serve, who becomes President?', a: 'the Speaker of the House' },
  { n: 32, q: 'Who is the Commander in Chief of the military?', a: 'the President' },
  { n: 33, q: 'Who signs bills to become laws?', a: 'the President' },
  { n: 34, q: 'Who vetoes bills?', a: 'the President' },
  { n: 35, q: "What does the President's Cabinet do?", a: 'advises the President' },
  { n: 36, q: 'What are two Cabinet-level positions?', a: 'Secretary of State, Defense, Treasury, etc.; the Attorney General; the Vice President' },
  { n: 37, q: 'What does the judicial branch do?', a: 'reviews/explains laws; resolves disputes; decides if a law goes against the Constitution' },
  { n: 38, q: 'What is the highest court in the United States?', a: 'the Supreme Court' },
  { n: 39, q: 'How many justices are on the Supreme Court?', a: 'nine (9)' },
  { n: 40, q: 'Who is the Chief Justice of the United States now?', a: '__CHIEF_JUSTICE__' },
  { n: 41, q: 'Under our Constitution, some powers belong to the federal government. What is one power of the federal government?', a: 'to print money; to declare war; to create an army; to make treaties' },
  { n: 42, q: 'Under our Constitution, some powers belong to the states. What is one power of the states?', a: 'provide schooling/education; provide protection (police); provide safety (fire departments); give a driver\'s license; approve zoning and land use' },
  { n: 43, q: 'Who is the Governor of your state now?', a: STATE },
  { n: 44, q: 'What is the capital of your state?', a: STATE },
  { n: 45, q: 'What are the two major political parties in the United States?', a: 'Democratic and Republican' },
  { n: 46, q: 'What is the political party of the President now?', a: '__PRESIDENT_PARTY__' },
  { n: 47, q: 'What is the name of the Speaker of the House of Representatives now?', a: '__SPEAKER__' },
  { n: 48, q: 'There are four amendments to the Constitution about who can vote. Describe one of them.', a: 'Citizens eighteen (18) and older can vote; you don\'t have to pay a poll tax to vote; any citizen can vote (women and men); a male citizen of any race can vote' },
  { n: 49, q: 'What is one responsibility that is only for United States citizens?', a: 'serve on a jury; vote in a federal election' },
  { n: 50, q: 'Name one right only for United States citizens.', a: 'vote in a federal election; run for federal office' },
  { n: 51, q: 'What are two rights of everyone living in the United States?', a: 'freedom of expression/speech; freedom of assembly; freedom to petition the government; freedom of religion; the right to bear arms' },
  { n: 52, q: 'What do we show loyalty to when we say the Pledge of Allegiance?', a: 'the United States; the flag' },
  { n: 53, q: 'What is one promise you make when you become a United States citizen?', a: 'give up loyalty to other countries; defend the Constitution and laws of the U.S.; obey the laws of the U.S.; serve in the military or do important work for the nation if needed; be loyal to the U.S.' },
  { n: 54, q: 'How old do citizens have to be to vote for President?', a: 'eighteen (18) and older' },
  { n: 55, q: 'What are two ways that Americans can participate in their democracy?', a: 'vote; join a political party; help with a campaign; join a civic/community group; give an elected official your opinion; call Senators and Representatives; run for office; write to a newspaper' },
  { n: 56, q: 'When is the last day you can send in federal income tax forms?', a: 'April 15' },
  { n: 57, q: 'When must all men register for the Selective Service?', a: 'at age eighteen (18); between eighteen (18) and twenty-six (26)' },
  { n: 58, q: 'What is one reason colonists came to America?', a: 'freedom; political liberty; religious freedom; economic opportunity; to practice their religion; to escape persecution' },
  { n: 59, q: 'Who lived in America before the Europeans arrived?', a: 'American Indians; Native Americans' },
  { n: 60, q: 'What group of people was taken to America and sold as slaves?', a: 'Africans; people from Africa' },
  { n: 61, q: 'Why did the colonists fight the British?', a: 'because of high taxes (taxation without representation); because the British army stayed in their houses (boarding, quartering); because they didn\'t have self-government' },
  { n: 62, q: 'Who wrote the Declaration of Independence?', a: '(Thomas) Jefferson' },
  { n: 63, q: 'When was the Declaration of Independence adopted?', a: 'July 4, 1776' },
  { n: 64, q: 'There were 13 original states. Name three.', a: 'New Hampshire, Massachusetts, Rhode Island, Connecticut, New York, New Jersey, Pennsylvania, Delaware, Maryland, Virginia, North Carolina, South Carolina, Georgia' },
  { n: 65, q: 'What happened at the Constitutional Convention?', a: 'The Constitution was written; the Founding Fathers wrote the Constitution' },
  { n: 66, q: 'When was the Constitution written?', a: '1787' },
  { n: 67, q: 'The Federalist Papers supported the passage of the U.S. Constitution. Name one of the writers.', a: '(James) Madison; (Alexander) Hamilton; (John) Jay; Publius' },
  { n: 68, q: 'What is one thing Benjamin Franklin is famous for?', a: 'U.S. diplomat; oldest member of the Constitutional Convention; first Postmaster General; writer of "Poor Richard\'s Almanac"; started the first free libraries' },
  { n: 69, q: 'Who is the "Father of Our Country"?', a: '(George) Washington' },
  { n: 70, q: 'Who was the first President?', a: '(George) Washington' },
  { n: 71, q: 'What territory did the United States buy from France in 1803?', a: 'the Louisiana Territory; Louisiana' },
  { n: 72, q: 'Name one war fought by the United States in the 1800s.', a: 'War of 1812; Mexican-American War; Civil War; Spanish-American War' },
  { n: 73, q: 'Name the U.S. war between the North and the South.', a: 'the Civil War; the War between the States' },
  { n: 74, q: 'Name one problem that led to the Civil War.', a: 'slavery; economic reasons; states\' rights' },
  { n: 75, q: 'What was one important thing that Abraham Lincoln did?', a: 'freed the slaves (Emancipation Proclamation); saved/preserved the Union; led the U.S. during the Civil War' },
  { n: 76, q: 'What did the Emancipation Proclamation do?', a: 'freed the slaves; freed slaves in the Confederacy/Confederate states/most Southern states' },
  { n: 77, q: 'What did Susan B. Anthony do?', a: 'fought for women\'s rights; fought for civil rights' },
  { n: 78, q: 'Name one war fought by the United States in the 1900s.', a: 'World War I; World War II; Korean War; Vietnam War; (Persian) Gulf War' },
  { n: 79, q: 'Who was President during World War I?', a: '(Woodrow) Wilson' },
  { n: 80, q: 'Who was President during the Great Depression and World War II?', a: '(Franklin) Roosevelt' },
  { n: 81, q: 'Who did the United States fight in World War II?', a: 'Japan, Germany, and Italy' },
  { n: 82, q: 'Before he was President, Eisenhower was a general. What war was he in?', a: 'World War II' },
  { n: 83, q: 'During the Cold War, what was the main concern of the United States?', a: 'Communism' },
  { n: 84, q: 'What movement tried to end racial discrimination?', a: 'the civil rights (movement)' },
  { n: 85, q: 'What did Martin Luther King, Jr. do?', a: 'fought for civil rights; worked for equality for all Americans' },
  { n: 86, q: 'What major event happened on September 11, 2001, in the United States?', a: 'Terrorists attacked the United States' },
  { n: 87, q: 'Name one American Indian tribe in the United States.', a: 'Cherokee, Navajo, Sioux, Chippewa, Choctaw, Pueblo, Apache, Iroquois, Creek, Blackfeet, Seminole, Cheyenne, Arawak, Shawnee, Mohegan, Huron, Oneida, Lakota, Crow, Teton, Hopi, Inuit' },
  { n: 88, q: 'Name one of the two longest rivers in the United States.', a: 'Missouri (River); Mississippi (River)' },
  { n: 89, q: 'What ocean is on the West Coast of the United States?', a: 'Pacific (Ocean)' },
  { n: 90, q: 'What ocean is on the East Coast of the United States?', a: 'Atlantic (Ocean)' },
  { n: 91, q: 'Name one U.S. territory.', a: 'Puerto Rico; U.S. Virgin Islands; American Samoa; Northern Mariana Islands; Guam' },
  { n: 92, q: 'Name one state that borders Canada.', a: 'Maine, New Hampshire, Vermont, New York, Pennsylvania, Ohio, Michigan, Minnesota, North Dakota, Montana, Idaho, Washington, Alaska' },
  { n: 93, q: 'Name one state that borders Mexico.', a: 'California, Arizona, New Mexico, Texas' },
  { n: 94, q: 'What is the capital of the United States?', a: 'Washington, D.C.' },
  { n: 95, q: 'Where is the Statue of Liberty?', a: 'New York (Harbor); Liberty Island; (also acceptable: New Jersey, near New York City, on the Hudson River)' },
  { n: 96, q: 'Why does the flag have 13 stripes?', a: 'because there were 13 original colonies; the stripes represent the original colonies' },
  { n: 97, q: 'Why does the flag have 50 stars?', a: 'because there is one star for each state; there are 50 states' },
  { n: 98, q: 'What is the name of the national anthem?', a: 'The Star-Spangled Banner' },
  { n: 99, q: 'When do we celebrate Independence Day?', a: 'July 4' },
  { n: 100, q: 'Name two national U.S. holidays.', a: "New Year's Day; Martin Luther King, Jr. Day; Presidents' Day; Memorial Day; Independence Day; Labor Day; Columbus Day; Veterans Day; Thanksgiving; Christmas" }
];

// 2020 test: 128 questions (up to 20 asked; 12 correct to pass).
// To be embedded in the next step — left empty for now so the function can detect it.
const CIVICS_2020 = [];

// Resolve the dynamic placeholders using the current officials.
function resolveBank(bank) {
  const map = {
    '__PRESIDENT__': CURRENT_OFFICIALS.president,
    '__VICE_PRESIDENT__': CURRENT_OFFICIALS.vicePresident,
    '__PRESIDENT_PARTY__': CURRENT_OFFICIALS.presidentParty,
    '__SPEAKER__': CURRENT_OFFICIALS.speaker,
    '__CHIEF_JUSTICE__': CURRENT_OFFICIALS.chiefJustice
  };
  return bank.map(item => ({ n: item.n, q: item.q, a: map[item.a] || item.a }));
}

module.exports = {
  CURRENT_OFFICIALS,
  CIVICS_2008: resolveBank(CIVICS_2008),
  CIVICS_2020: resolveBank(CIVICS_2020)
};

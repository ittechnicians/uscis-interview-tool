// maestro-data.js — content for the teacher screen (maestro.html) of the live Zoom course.
// Each N-400 card: q = what the officer asks (English), es = meaning in Spanish,
// a = model answers. Text inside [brackets] is the student's own data: the screen shows it
// as a blank to fill, and the voice reads the example value. p = pronunciation written for
// Spanish speakers. tip = short note for the teacher/students (Spanish).
// Model answers are a guide to say the TRUTH in English, never something to memorize blindly.
window.MAESTRO = {
  sections: [
    // ---------------------------------------------------------------- SÁBADO 1
    { id: 'saludo', day: 1, title: 'Saludo y juramento', cards: [
      { id: 's1', q: 'Good morning. How are you today?', es: 'Buenos días. ¿Cómo está hoy?',
        a: [{ en: "Good morning. I'm fine, thank you. And you?", p: 'gud MÓR-ning. áim FÁIN, thenk iú. end IÚ?' }],
        tip: 'Sonreír y saludar también. Es parte de la prueba de inglés hablado.' },
      { id: 's2', q: 'Please follow me.', es: 'Sígame, por favor.',
        a: [{ en: 'OK. Thank you.', p: 'ou-KÉI. THENK iú' }] },
      { id: 's3', q: 'Please remain standing and raise your right hand.', es: 'Quédese de pie y levante la mano derecha.',
        a: [{ act: 'Levantas la mano DERECHA. No hace falta decir nada.' }],
        tip: 'Right = derecha. Levantar la mano equivocada pasa mucho por los nervios.' },
      { id: 's4', q: 'Do you swear that everything you say today will be the truth, the whole truth, and nothing but the truth?', es: '¿Jura decir la verdad, toda la verdad y nada más que la verdad?',
        a: [{ en: 'Yes, I do.', p: 'iés, ái DÚ' }],
        tip: '"Do you…?" se contesta con "Yes, I do." Si usa "affirm" en vez de "swear", es igual.' },
      { id: 's5', q: 'You may sit down.', es: 'Puede sentarse.',
        a: [{ en: 'Thank you.', p: 'THENK iú' }] },
      { id: 's6', q: 'May I see your appointment letter, your green card, and your passport?', es: '¿Me permite su carta de cita, su green card y su pasaporte?',
        a: [{ en: 'Yes. Here you are.', p: 'iés. JÍR iú ar' }] },
      { id: 's7', q: 'Do you know why you are here today?', es: '¿Sabe por qué está aquí hoy?',
        a: [{ en: 'Yes. I am here for my citizenship interview.', p: 'iés. ái am JÍR for mái SÍ-ti-zen-ship ÍN-ter-viu' }] },
      { id: 's8', q: 'Could you please repeat the question?', es: '(Frase para USTED) ¿Me puede repetir la pregunta, por favor?', student: true,
        a: [{ en: 'Could you please repeat the question?', p: 'kud iú PLÍS ri-PÍT de KUÉS-chon?' },
            { en: 'Could you please speak more slowly?', p: 'kud iú plís SPÍK mor SLÓU-li?' },
            { en: 'What does that word mean?', p: 'uát dos dat UÉRD mín?' }],
        tip: 'Estas frases las dice el alumno. Pedir que repitan está permitido y es mejor que adivinar.' }
    ]},
    { id: 'nombre', day: 1, title: 'Tu nombre y cómo deletrearlo', cards: [
      { id: 'n1', q: 'What is your full name?', es: '¿Cuál es su nombre completo?',
        a: [{ en: 'My name is [María Elena López].', p: 'mái NÉIM is …' }] },
      { id: 'n2', q: 'How do you spell your last name?', es: '¿Cómo se deletrea su apellido?',
        a: [{ en: '[L-O-P-E-Z].', p: 'el · ou · pi · i · zi', spell: true }],
        tip: 'Ojo con las letras: A (éi), E (í), I (ái), G (yi), J (yéi), H (éich), Y (uái), Z (zi).' },
      { id: 'n3', q: 'Have you ever used any other names?', es: '¿Alguna vez ha usado otros nombres?',
        a: [{ en: 'No, I have not.', p: 'nóu, ái jav NAT' },
            { en: 'Yes. My maiden name is [García].', p: 'iés. mái MÉI-den néim is …' }],
        tip: 'Maiden name = apellido de soltera. Cuenta también un apodo usado en documentos.' },
      { id: 'n4', q: 'Do you want to legally change your name?', es: '¿Quiere cambiarse el nombre legalmente?',
        a: [{ en: 'No, I do not.', p: 'nóu, ái du NAT' },
            { en: 'Yes. I want to change it to [María López].', p: 'iés. ái uánt tu CHÉINCH it tu …' }] }
    ]},
    { id: 'datos', day: 1, title: 'Tus datos y tu residencia', cards: [
      { id: 'd1', q: 'What is your date of birth?', es: '¿Cuál es su fecha de nacimiento?',
        a: [{ en: 'My date of birth is [March fourteenth, nineteen eighty].', p: 'mái DÉIT ov berth is …' }],
        tip: 'Mes primero, luego el día con "th": fourteenth (14), thirtieth (30). Thirteen vs thirty: el acento cambia.' },
      { id: 'd2', q: 'Where were you born?', es: '¿Dónde nació?',
        a: [{ en: 'I was born in [Mexico].', p: 'ái uas BORN in …' }] },
      { id: 'd3', q: 'What is your country of nationality?', es: '¿De qué país es ciudadano?',
        a: [{ en: 'I am a citizen of [Mexico].', p: 'ái am a SÍ-ti-zen ov …' }] },
      { id: 'd4', q: 'When did you become a permanent resident?', es: '¿Cuándo se hizo residente permanente?',
        a: [{ en: 'I became a permanent resident in [two thousand fifteen].', p: 'ái bi-KÉIM a PÉR-ma-nent RÉ-si-dent in …' }],
        tip: 'La fecha está en la green card ("Resident since"). Es mejor decir el año que inventar el día.' },
      { id: 'd5', q: 'Are you applying based on five years as a permanent resident, or three years married to a U.S. citizen?', es: '¿Aplica por 5 años como residente o por 3 años casado(a) con ciudadano(a)?',
        a: [{ en: 'Five years as a permanent resident.', p: 'FÁIV iírs as a PÉR-ma-nent RÉ-si-dent' },
            { en: 'Three years married to a U.S. citizen.', p: 'THRÍ iírs MÉ-rid tu a iú-es SÍ-ti-zen' }] }
    ]},
    { id: 'direccion', day: 1, title: 'Tu dirección', cards: [
      { id: 'a1', q: 'What is your current address?', es: '¿Cuál es su dirección actual?',
        a: [{ en: 'My address is [123 Main Street, Houston, Texas].', p: 'mái a-DRÉS is …' }] },
      { id: 'a2', q: 'How long have you lived at this address?', es: '¿Cuánto tiempo ha vivido en esta dirección?',
        a: [{ en: 'I have lived there for [three] years.', p: 'ái jav LIVD der for … iírs' }],
        tip: 'live (vivir) con i corta, no "leave" (irse).' },
      { id: 'a3', q: 'Who do you live with?', es: '¿Con quién vive?',
        a: [{ en: 'I live with my [husband and my children].', p: 'ái LIV uíth mái …' }] },
      { id: 'a4', q: 'What is your phone number?', es: '¿Cuál es su número de teléfono?',
        a: [{ en: 'My phone number is [832-555-0147].', p: 'mái FÓUN nam-ber is …' }],
        tip: 'El cero se dice "zero" u "oh".' },
      { id: 'a5', q: 'Have you lived in this state for at least three months?', es: '¿Ha vivido en este estado por lo menos 3 meses?',
        a: [{ en: 'Yes, I have.', p: 'iés, ái JAV' }] }
    ]},
    { id: 'familia', day: 1, title: 'Tu familia', cards: [
      { id: 'f1', q: 'What is your marital status?', es: '¿Cuál es su estado civil?',
        a: [{ en: 'I am married.', p: 'ái am MÉ-rid' }, { en: 'I am single.', p: 'ái am SÍN-gol' },
            { en: 'I am divorced.', p: 'ái am di-VÓRST' }, { en: 'I am widowed.', p: 'ái am UÍ-doud' }] },
      { id: 'f2', q: "What is your spouse's name?", es: '¿Cómo se llama su esposo(a)?',
        a: [{ en: "My husband's name is [José López].", p: 'mái JÁS-bands néim is …' },
            { en: "My wife's name is [Ana López].", p: 'mái UÁIFS néim is …' }] },
      { id: 'f3', q: 'Is your spouse a U.S. citizen?', es: '¿Su esposo(a) es ciudadano(a) de EE. UU.?',
        a: [{ en: 'Yes, he is. / Yes, she is.', p: 'iés, jí IS / iés, shí IS' },
            { en: 'No, he is not. / No, she is not.', p: 'nóu, jí is NAT / nóu, shí is NAT' }],
        tip: '"Is he…?" se contesta "he is". Is ↔ is.' },
      { id: 'f4', q: 'How many times have you been married?', es: '¿Cuántas veces se ha casado?',
        a: [{ en: 'One time.', p: 'UÁN táim' }, { en: 'Two times.', p: 'TÚ táims' }] },
      { id: 'f5', q: 'Do you have any children?', es: '¿Tiene hijos?',
        a: [{ en: 'Yes, I have [two] children.', p: 'iés, ái jav … CHÍL-dren' }, { en: 'No, I do not.', p: 'nóu, ái du NAT' }],
        tip: 'Se cuentan todos: también hijos mayores, fallecidos, adoptados o hijastros, como en el N-400.' },
      { id: 'f6', q: 'Where do your children live?', es: '¿Dónde viven sus hijos?',
        a: [{ en: 'They live with me.', p: 'déi LIV uíth mí' }, { en: 'They live in [Mexico].', p: 'déi liv in …' }] }
    ]},
    { id: 'trabajo', day: 1, title: 'Tu trabajo', cards: [
      { id: 't1', q: 'What do you do for a living?', es: '¿En qué trabaja?',
        a: [{ en: 'I work in [construction].', p: 'ái UÉRK in …' }, { en: 'I am a [cook].', p: 'ái am a …' }],
        tip: 'También pueden preguntar "What is your occupation?" Es la misma pregunta.' },
      { id: 't2', q: 'Who is your employer?', es: '¿Para quién trabaja? (¿quién es su empleador?)',
        a: [{ en: 'I work for [ABC Cleaning].', p: 'ái uérk FOR …' }, { en: 'I am self-employed.', p: 'ái am SELF-em-ploid' }] },
      { id: 't3', q: 'How long have you worked there?', es: '¿Cuánto tiempo lleva trabajando allí?',
        a: [{ en: 'I have worked there for [four] years.', p: 'ái jav UÉRKT der for … iírs' }],
        tip: 'worked: la -ed suena como t.' },
      { id: 't4', q: 'Are you working right now?', es: '¿Está trabajando actualmente?',
        a: [{ en: 'Yes, I am.', p: 'iés, ái AM' }, { en: 'No, I am retired.', p: 'nóu, ái am ri-TÁIERD' },
            { en: 'No, I take care of my home and my children.', p: 'nóu, ái téik KÉR ov mái JÓUM end mái CHÍL-dren' }] }
    ]},

    // ---------------------------------------------------------------- SÁBADO 2
    { id: 'viajes', day: 2, title: 'Tus viajes', cards: [
      { id: 'v1', q: 'Have you traveled outside the United States in the last five years?', es: '¿Ha viajado fuera de EE. UU. en los últimos 5 años?',
        a: [{ en: 'Yes, I have.', p: 'iés, ái JAV' }, { en: 'No, I have not.', p: 'nóu, ái jav NAT' }] },
      { id: 'v2', q: 'How many trips have you taken?', es: '¿Cuántos viajes ha hecho?',
        a: [{ en: 'I have taken [two] trips.', p: 'ái jav TÉI-ken … TRIPS' }] },
      { id: 'v3', q: 'Where did you go?', es: '¿A dónde fue?',
        a: [{ en: 'I went to [Mexico] to visit my family.', p: 'ái UÉNT tu … tu VÍ-sit mái FÁ-mi-li' }] },
      { id: 'v4', q: 'How long were you there?', es: '¿Cuánto tiempo estuvo allá?',
        a: [{ en: 'I was there for [two] weeks.', p: 'ái uas DER for … UÍKS' }] },
      { id: 'v5', q: 'Did any of your trips last six months or more?', es: '¿Algún viaje duró 6 meses o más?',
        a: [{ en: 'No. All my trips were less than six months.', p: 'nóu. OL mái trips uer LES dan SIKS manths' }],
        tip: '"Did…?" se contesta "I did / I did not". Las fechas deben ser las mismas del N-400.' }
    ]},
    { id: 'impuestos', day: 2, title: 'Impuestos', cards: [
      { id: 'i1', q: 'Do you file your taxes every year?', es: '¿Presenta sus impuestos cada año?',
        a: [{ en: 'Yes, I do.', p: 'iés, ái DÚ' }],
        tip: 'Llevar las transcripciones de impuestos (tax transcripts) si las piden en la carta.' },
      { id: 'i2', q: 'Do you owe any federal, state, or local taxes?', es: '¿Debe impuestos federales, estatales o locales?',
        a: [{ en: 'No, I do not.', p: 'nóu, ái du NAT' }],
        tip: 'Owe = deber dinero. Si tiene un plan de pagos con el IRS, se dice la verdad y se lleva el comprobante.' },
      { id: 'i3', q: 'Since you became a permanent resident, have you ever called yourself a "nonresident" on a tax return?', es: 'Desde que es residente, ¿alguna vez se declaró "no residente" en sus impuestos?',
        a: [{ en: 'No, I have not.', p: 'nóu, ái jav NAT' }] }
    ]},
    { id: 'haveyouever', day: 2, title: '"Have you ever…?" (buen carácter moral)', intro: true, cards: [
      { id: 'h0', kind: 'rule', q: 'Have you ever…? · Are you…? · Do you…? · Did you…?', es: 'La regla de oro: contestas con el mismo verbo de la pregunta.',
        a: [{ ask: 'Have you ever…?', en: 'No, I have not.', p: 'nóu, ái jav NAT' },
            { ask: 'Are you…?', en: 'Yes, I am. / No, I am not.', p: 'iés, ái AM / nóu, ái am NAT' },
            { ask: 'Do you…?', en: 'Yes, I do. / No, I do not.', p: 'iés, ái DÚ / nóu, ái du NAT' },
            { ask: 'Did you…?', en: 'Yes, I did. / No, I did not.', p: 'iés, ái DID / nóu, ái did NAT' }],
        tip: 'Siempre la verdad y lo mismo que dice su N-400. Si alguna respuesta es "sí" (por ejemplo, un arresto), hay que hablarlo antes con un abogado o representante acreditado. El curso no da consejo legal.' },
      { id: 'h1', q: 'Have you ever claimed to be a U.S. citizen?', es: '¿Alguna vez ha dicho que es ciudadano de EE. UU.?',
        a: [{ en: 'No, I have not.', p: 'nóu, ái jav NAT' }], def: 'claimed to be a U.S. citizen' },
      { id: 'h2', q: 'Have you ever registered to vote or voted in any election in the United States?', es: '¿Alguna vez se registró para votar o votó en una elección en EE. UU.?',
        a: [{ en: 'No, I have not.', p: 'nóu, ái jav NAT' }], def: 'registered to vote' },
      { id: 'h3', q: 'Have you ever been arrested, cited, or detained by any law enforcement officer?', es: '¿Alguna vez lo arrestó, multó (citación) o detuvo un policía u oficial?',
        a: [{ en: 'No, I have not.', p: 'nóu, ái jav NAT' }], def: 'arrested',
        tip: 'Cited incluye algunas multas. Si tiene algo así, lo dice y lleva los papeles.' },
      { id: 'h4', q: 'Have you ever committed a crime or offense for which you were not arrested?', es: '¿Alguna vez cometió un delito por el que no lo arrestaron?',
        a: [{ en: 'No, I have not.', p: 'nóu, ái jav NAT' }] },
      { id: 'h5', q: 'Have you ever been a habitual drunkard?', es: '¿Alguna vez ha sido un borracho habitual?',
        a: [{ en: 'No, I have not.', p: 'nóu, ái jav NAT' }], def: 'habitual drunkard' },
      { id: 'h6', q: 'Have you ever sold or smuggled illegal drugs?', es: '¿Alguna vez vendió o pasó de contrabando drogas ilegales?',
        a: [{ en: 'No, I have not.', p: 'nóu, ái jav NAT' }] },
      { id: 'h7', q: 'Have you ever been married to more than one person at the same time?', es: '¿Alguna vez estuvo casado(a) con más de una persona a la vez?',
        a: [{ en: 'No, I have not.', p: 'nóu, ái jav NAT' }] },
      { id: 'h8', q: 'Have you ever lied to a U.S. government official to enter the United States or to get immigration benefits?', es: '¿Alguna vez le mintió a un funcionario para entrar a EE. UU. o para obtener beneficios migratorios?',
        a: [{ en: 'No, I have not.', p: 'nóu, ái jav NAT' }] },
      { id: 'h9', q: 'Have you ever been a member of the Communist Party?', es: '¿Alguna vez fue miembro del Partido Comunista?',
        a: [{ en: 'No, I have not.', p: 'nóu, ái jav NAT' }] },
      { id: 'h10', q: 'Have you ever been a member of a terrorist organization?', es: '¿Alguna vez fue miembro de una organización terrorista?',
        a: [{ en: 'No, I have not.', p: 'nóu, ái jav NAT' }] },
      { id: 'h11', q: 'Have you ever been ordered removed or deported from the United States?', es: '¿Alguna vez le ordenaron salir o lo deportaron de EE. UU.?',
        a: [{ en: 'No, I have not.', p: 'nóu, ái jav NAT' }] },
      { id: 'h12', q: 'Did you register for the Selective Service?', es: '¿Se registró en el Servicio Selectivo?',
        a: [{ en: 'Yes, I did.', p: 'iés, ái DID' }, { en: 'No. I am a woman.', p: 'nóu. ái am a UÚ-man' }],
        tip: 'Solo aplica a hombres que vivieron en EE. UU. entre los 18 y los 26 años.' }
    ]},
    { id: 'juramento', day: 2, title: 'Constitución y juramento', cards: [
      { id: 'j1', q: 'Do you support the Constitution and form of government of the United States?', es: '¿Apoya la Constitución y la forma de gobierno de EE. UU.?',
        a: [{ en: 'Yes, I do.', p: 'iés, ái DÚ' }] },
      { id: 'j2', q: 'Do you understand the full Oath of Allegiance to the United States?', es: '¿Entiende el Juramento de Lealtad completo?',
        a: [{ en: 'Yes, I do.', p: 'iés, ái DÚ' }], def: 'oath' },
      { id: 'j3', q: 'Are you willing to take the full Oath of Allegiance?', es: '¿Está dispuesto(a) a hacer el Juramento de Lealtad completo?',
        a: [{ en: 'Yes, I am.', p: 'iés, ái AM' }], def: 'allegiance' },
      { id: 'j4', q: 'If the law requires it, are you willing to bear arms on behalf of the United States?', es: 'Si la ley lo pide, ¿está dispuesto(a) a portar armas por EE. UU.?',
        a: [{ en: 'Yes, I am.', p: 'iés, ái AM' }], def: 'bear arms' },
      { id: 'j5', q: 'If the law requires it, are you willing to perform noncombatant services in the U.S. armed forces?', es: 'Si la ley lo pide, ¿está dispuesto(a) a hacer servicios sin combatir en las fuerzas armadas?',
        a: [{ en: 'Yes, I am.', p: 'iés, ái AM' }] },
      { id: 'j6', q: 'If the law requires it, are you willing to perform work of national importance under civilian direction?', es: 'Si la ley lo pide, ¿está dispuesto(a) a hacer trabajo de importancia nacional bajo dirección civil?',
        a: [{ en: 'Yes, I am.', p: 'iés, ái AM' }] }
    ]},
    // Sábado 2 also has the definitions (built from definitions.js at runtime: section id "definiciones").

    // ---------------------------------------------------------------- SÁBADO 4
    { id: 'lectura', day: 4, title: 'Prueba de lectura', kind: 'read', cards: [
      { id: 'r1', q: 'Who was the first President?' },
      { id: 'r2', q: 'Where does the President live?' },
      { id: 'r3', q: 'What is the capital of the United States?' },
      { id: 'r4', q: 'Who can vote?' },
      { id: 'r5', q: 'When is Flag Day?' },
      { id: 'r6', q: 'What is the largest state?' },
      { id: 'r7', q: 'Who is the Father of Our Country?' },
      { id: 'r8', q: 'What country is north of the United States?' },
      { id: 'r9', q: 'How many senators does Congress have?' },
      { id: 'r10', q: 'When do we celebrate Independence Day?' },
      { id: 'r11', q: 'Why do people come to America?' },
      { id: 'r12', q: 'What do we pay to the government?' },
      { id: 'r13', q: 'When is Thanksgiving?' },
      { id: 'r14', q: 'Who lived here first?' },
      { id: 'r15', q: 'What is one right in the Bill of Rights?' }
    ]},
    { id: 'escritura', day: 4, title: 'Prueba de escritura (dictado)', kind: 'write', cards: [
      'The president lives in the White House.', 'The White House is in Washington, D.C.', 'George Washington was the first president.',
      'Abraham Lincoln was president during the Civil War.', 'Citizens can vote for president.', 'Citizens have the right to vote.',
      'Congress makes federal laws.', 'There are 100 U.S. Senators.', 'New York City was the first capital.',
      'Washington is the capital of the United States.', 'The Bill of Rights protects our rights.', 'We have freedom of speech.',
      'We pay taxes every year.', 'Independence Day is on July 4th.', 'Thanksgiving is in November.', 'Labor Day is in September.',
      'Memorial Day is in May.', "Presidents' Day is in February.", 'Columbus Day is in October.', 'Alaska is the largest state.',
      'California has the most people.', 'The American flag has 50 stars.', 'The American flag is red, white, and blue.',
      'Canada is north of the United States.', 'Mexico is south of the United States.', 'American Indians lived in America first.'
    ].map(function (t, i) { return { id: 'w' + (i + 1), q: t }; }) },
    { id: 'resultado', day: 4, title: 'El final de la entrevista', cards: [
      { id: 'e1', q: 'Congratulations. You passed. I am recommending you for approval.', es: 'Felicidades. Aprobó. Lo recomiendo para aprobación.',
        a: [{ en: 'Thank you very much.', p: 'THENK iú VÉ-ri mach' }] },
      { id: 'e2', q: 'You will receive a notice in the mail for your oath ceremony.', es: 'Le llegará por correo la cita para la ceremonia de juramento.',
        a: [{ en: 'OK. Thank you.', p: 'ou-KÉI. THENK iú' }] },
      { id: 'e3', q: 'Please sign here.', es: 'Firme aquí, por favor.',
        a: [{ en: 'OK.', p: 'ou-KÉI' }], tip: 'A veces piden firmar los cambios hechos al N-400 durante la entrevista.' },
      { id: 'e4', q: 'Have a nice day.', es: 'Que tenga buen día.',
        a: [{ en: 'Thank you. You too.', p: 'THENK iú. iú TÚ' }] }
    ]}
  ],
  // "Forma natural": how most people answer in everyday English. Both forms are correct in the interview;
  // the long form is easier to say clearly for beginners. Key = the exact model answer above.
  // (Simple patterns like "I am married." → "I'm married." are added automatically by maestro.html.)
  natural: {
    'No, I have not.': [{ en: "No, I haven't.", p: 'nóu, ái JÁ-vent' }, { en: 'No, never.', p: 'nóu, NÉ-ver' }],
    'No, I do not.': [{ en: "No, I don't.", p: 'nóu, ái DÓUNT' }],
    'Yes, I am. / No, I am not.': [{ en: "Yes, I am. / No, I'm not.", p: 'iés, ái AM / nóu, áim NAT' }],
    'Yes, I do. / No, I do not.': [{ en: "Yes, I do. / No, I don't.", p: 'iés, ái DÚ / nóu, ái DÓUNT' }],
    'Yes, I did. / No, I did not.': [{ en: "Yes, I did. / No, I didn't.", p: 'iés, ái DID / nóu, ái DÍ-dent' }],
    'No, he is not. / No, she is not.': [{ en: "No, he isn't. / No, she isn't.", p: 'nóu, jí Í-sent / nóu, shí Í-sent' }],
    "Good morning. I'm fine, thank you. And you?": [{ en: "Good morning! I'm good, thanks. How are you?", p: 'gud MÓR-ning! áim GUD, thenks. jáu ar IÚ?' }],
    'Yes. Here you are.': [{ en: 'Sure. Here you go.', p: 'SHUR. JÍR iú GÓU' }],
    'Yes. I am here for my citizenship interview.': [{ en: "Yes, I'm here for my citizenship interview.", p: 'iés, áim JÍR for mái SÍ-ti-zen-ship ÍN-ter-viu' }],
    'No. I am a woman.': [{ en: "No, I'm a woman.", p: 'nóu, áim a UÚ-man' }],
    'No. All my trips were less than six months.': [{ en: 'No, they were all under six months.', p: 'nóu, déi uer OL ÁN-der SIKS manths' }],
    'Thank you very much.': [{ en: 'Thank you so much!', p: 'THENK iú sóu MACH!' }],
    'Thank you. You too.': [{ en: 'Thanks, you too!', p: 'THENKS, iú TÚ!' }],
    'Yes, I do.': [{ en: 'Yes, I do.', p: 'iés, ái DÚ', same: true }]
  },
  // The 4 Saturdays as sold on curso.html. "civics" and "definiciones" are filled at runtime.
  days: [
    { n: 1, title: 'Tu N-400, parte 1', sections: ['saludo', 'nombre', 'datos', 'direccion', 'familia', 'trabajo'] },
    { n: 2, title: 'Tu N-400, parte 2', sections: ['viajes', 'impuestos', 'haveyouever', 'juramento', 'definiciones'] },
    { n: 3, title: 'Cívica', sections: ['civica'] },
    { n: 4, title: 'Leer, escribir y simulacro', sections: ['lectura', 'escritura', 'resultado', 'simulacro'] }
  ],
  steps: [
    { n: 1, t: 'Escuchas', d: 'La pregunta con la voz del oficial y su significado en español.' },
    { n: 2, t: 'Repites', d: 'Todos juntos, despacio, con la pronunciación correcta.' },
    { n: 3, t: 'Contestas', d: 'Cada uno con sus propios datos, usando la respuesta modelo.' },
    { n: 4, t: 'Como el día real', d: 'El oficial pregunta a velocidad normal y tú contestas sin ayuda.' }
  ]
};

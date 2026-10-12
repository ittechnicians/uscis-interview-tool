// definitions.js — SINGLE SOURCE OF TRUTH for N-400 vocabulary.
// Used by: vocabulary.html (browser, window.DEFINITIONS) and api/n400.js -> interview.js + realtime-session.js (Node).
// Fields per term:
//   term, aliases[]      word as shown / other ways the officer may say it
//   official {en,es}     full plain-language definition (the "official" meaning, used to grade answers)
//   short {en,es}        short memory-aid answer the student can say out loud
//   tip {en,es}          optional coaching note
//   pron                 optional Spanish-friendly pronunciation hint
//   group                terms in the same group are never shown as wrong options for each other in the quiz
//   gmc:true             officer gives this exact short definition if the applicant asks what the term means
//   interview:true       officer may ask the applicant to explain this term
//   quiz:false           hide from the student quiz/study list
(function (root, factory) {
  var data = factory();
  if (typeof module === 'object' && module.exports) { module.exports = data; } else { root.DEFINITIONS = data; }
})(typeof self !== 'undefined' ? self : this, function () {
  var list = [
 {
  "term": "naturalization",
  "group": "status",
  "interview": true,
  "pron": "na-chu-ra-li-SÉI-shon",
  "official": {
   "en": "the process of becoming a U.S. citizen if you were born in another country",
   "es": "el proceso de convertirse en ciudadano de EE. UU. si naciste en otro país"
  },
  "short": {
   "en": "Becoming a U.S. citizen.",
   "es": "Convertirse en ciudadano de EE. UU."
  }
 },
 {
  "term": "lawful permanent resident",
  "aliases": [
   "permanent resident",
   "green card holder"
  ],
  "group": "status",
  "interview": true,
  "pron": "LÓ-ful PÉR-ma-nent RÉ-si-dent",
  "official": {
   "en": "a person who is allowed by law to live and work in the U.S. permanently; a green card holder",
   "es": "una persona autorizada por la ley a vivir y trabajar permanentemente en EE. UU. (tiene green card)"
  },
  "short": {
   "en": "A green card holder.",
   "es": "Alguien con tarjeta verde."
  },
  "tip": {
   "en": "This is your status today. If the officer asks about your immigration status, say: \"I am a lawful permanent resident.\"",
   "es": "Este es tu estatus actual. Si el oficial pregunta por tu estatus migratorio, di: \"I am a lawful permanent resident.\""
  }
 },
 {
  "term": "applicant",
  "official": {
   "en": "the person who is applying for a benefit (you)",
   "es": "la persona que solicita un beneficio (tú)"
  },
  "short": {
   "en": "The person applying (you).",
   "es": "La persona que solicita (tú)."
  }
 },
 {
  "term": "eligibility",
  "group": "status",
  "interview": true,
  "pron": "e-li-yi-BÍ-li-ti",
  "official": {
   "en": "meeting the requirements to qualify for something",
   "es": "cumplir los requisitos para calificar para algo"
  },
  "short": {
   "en": "Meeting the requirements.",
   "es": "Cumplir los requisitos."
  }
 },
 {
  "term": "Oath of Allegiance",
  "aliases": [
   "the Oath of Allegiance"
  ],
  "group": "oath",
  "gmc": true,
  "interview": true,
  "pron": "ouz of a-LÍ-yans",
  "official": {
   "en": "the official promise of loyalty you make to the United States to become a citizen",
   "es": "la promesa oficial de lealtad que haces a Estados Unidos para hacerte ciudadano"
  },
  "short": {
   "en": "A promise to be loyal to the United States.",
   "es": "Una promesa de lealtad a Estados Unidos."
  },
  "tip": {
   "en": "You take the Oath at the naturalization ceremony. It is a solemn promise of loyalty to the United States.",
   "es": "Haces el juramento en la ceremonia de naturalización. Es una promesa solemne de lealtad a Estados Unidos."
  }
 },
 {
  "term": "allegiance",
  "group": "oath",
  "interview": true,
  "pron": "a-LÍ-yans",
  "official": {
   "en": "loyalty and support given to a country",
   "es": "lealtad y apoyo que se da a un país"
  },
  "short": {
   "en": "Loyalty to a country.",
   "es": "Lealtad a un país."
  }
 },
 {
  "term": "good moral character",
  "interview": true,
  "official": {
   "en": "behaving honestly and obeying the law; required to become a citizen",
   "es": "comportarse con honestidad y respetar la ley; es requisito para ser ciudadano"
  },
  "short": {
   "en": "Behaving honestly and following the law.",
   "es": "Comportarse con honestidad y respetar la ley."
  }
 },
 {
  "term": "persecution",
  "group": "refuge",
  "gmc": true,
  "interview": true,
  "pron": "per-se-KIÚ-shon",
  "official": {
   "en": "being harmed or treated very badly because of your race, religion, nationality, political opinion, or group",
   "es": "ser dañado o maltratado por tu raza, religión, nacionalidad, opinión política o grupo"
  },
  "short": {
   "en": "Being treated badly for who you are.",
   "es": "Ser maltratado por quién eres."
  }
 },
 {
  "term": "totalitarian party",
  "aliases": [
   "totalitarian"
  ],
  "group": "politics",
  "gmc": true,
  "interview": true,
  "pron": "to-ta-li-TÉ-ri-an",
  "official": {
   "en": "a government or party that has total control and does not allow other parties or freedoms",
   "es": "un gobierno o partido con control total que no permite otros partidos ni libertades"
  },
  "short": {
   "en": "A government with total control.",
   "es": "Un gobierno con control total."
  }
 },
 {
  "term": "Communist party",
  "group": "politics",
  "gmc": true,
  "pron": "KÓ-miu-nist",
  "official": {
   "en": "a party or government where the state controls property and there is no private ownership",
   "es": "un partido o gobierno donde el estado controla la propiedad y no hay propiedad privada"
  },
  "short": {
   "en": "A government with no private property.",
   "es": "Un gobierno sin propiedad privada."
  }
 },
 {
  "term": "terrorist",
  "group": "violence",
  "gmc": true,
  "pron": "TÉ-ro-rist",
  "official": {
   "en": "a person who uses violence and fear against people for political reasons",
   "es": "una persona que usa violencia y miedo contra la gente por razones políticas"
  },
  "short": {
   "en": "Someone who uses violence for political reasons.",
   "es": "Alguien que usa violencia por razones políticas."
  }
 },
 {
  "term": "genocide",
  "group": "violence",
  "gmc": true,
  "interview": true,
  "pron": "YÉ-no-said",
  "official": {
   "en": "the deliberate killing of a large group of people because of their race, religion, or nationality",
   "es": "el asesinato deliberado de un gran grupo de personas por su raza, religión o nacionalidad"
  },
  "short": {
   "en": "Killing a large group of people on purpose.",
   "es": "Matar a un gran grupo de personas a propósito."
  },
  "tip": {
   "en": "Memory hook: killing a whole group of people because of who they are (race, religion, nationality).",
   "es": "Para recordarlo: matar a todo un grupo de personas por quiénes son (raza, religión, nacionalidad)."
  }
 },
 {
  "term": "torture",
  "group": "violence",
  "gmc": true,
  "pron": "TÓR-chur",
  "official": {
   "en": "causing someone severe pain on purpose to punish them or get information",
   "es": "causar dolor severo a alguien a propósito para castigarlo u obtener información"
  },
  "short": {
   "en": "Hurting someone on purpose.",
   "es": "Hacerle daño a alguien a propósito."
  }
 },
 {
  "term": "arrested",
  "group": "police",
  "gmc": true,
  "interview": true,
  "pron": "a-RÉS-ted",
  "official": {
   "en": "taken by the police because you are suspected of a crime",
   "es": "detenido por la policía porque te sospechan de un delito"
  },
  "short": {
   "en": "Taken by the police.",
   "es": "Detenido por la policía."
  },
  "tip": {
   "en": "It appears in the question \"Have you ever been arrested, cited, or detained?\" Answer honestly about any time, even if the charges were dropped or it was long ago.",
   "es": "Aparece en la pregunta \"Have you ever been arrested, cited, or detained?\" Responde con honestidad sobre cualquier ocasión, aunque se hayan retirado los cargos o haya pasado mucho tiempo."
  }
 },
 {
  "term": "cited",
  "aliases": [
   "citation",
   "a citation"
  ],
  "group": "police",
  "gmc": true,
  "interview": true,
  "pron": "SÁI-ted",
  "official": {
   "en": "officially given a ticket or notice by an officer for breaking a law (like a traffic ticket), or officially told to appear in court",
   "es": "recibir oficialmente una multa o aviso de un oficial por infringir una ley (como una multa de tráfico), o recibir la orden de presentarte ante la corte"
  },
  "short": {
   "en": "Given a ticket or told to go to court.",
   "es": "Recibir una multa o una citación a la corte."
  },
  "tip": {
   "en": "It means both: a ticket (like a traffic ticket) and an official notice to appear in court. A traffic ticket counts, so be ready to explain it honestly: what happened, when, and how it ended.",
   "es": "Significa las dos cosas: una multa (como una de tráfico) y un aviso oficial para presentarte ante la corte. Una multa de tráfico cuenta, así que prepárate para explicarla con honestidad: qué pasó, cuándo y cómo terminó."
  }
 },
 {
  "term": "detained",
  "group": "police",
  "gmc": true,
  "interview": true,
  "pron": "di-TÉIND",
  "official": {
   "en": "held or kept by authorities, not free to leave",
   "es": "retenido por las autoridades, sin poder irte"
  },
  "short": {
   "en": "Held by authorities.",
   "es": "Retenido por las autoridades."
  }
 },
 {
  "term": "convicted",
  "group": "police",
  "gmc": true,
  "pron": "kon-VÍK-ted",
  "official": {
   "en": "found guilty of a crime by a court",
   "es": "declarado culpable de un delito por un tribunal"
  },
  "short": {
   "en": "Found guilty by a court.",
   "es": "Declarado culpable por un tribunal."
  }
 },
 {
  "term": "crime",
  "group": "police",
  "gmc": true,
  "interview": true,
  "pron": "KRÁIM",
  "official": {
   "en": "an act that breaks the law",
   "es": "un acto que viola la ley"
  },
  "short": {
   "en": "Breaking the law.",
   "es": "Romper la ley."
  },
  "tip": {
   "en": "Memory hook: crime = an act that breaks the law.",
   "es": "Para recordarlo: crime = una acción que infringe la ley."
  }
 },
 {
  "term": "probation",
  "group": "confinement",
  "gmc": true,
  "interview": true,
  "pron": "prou-BÉI-shon",
  "official": {
   "en": "a period when a person convicted of a crime is supervised instead of, or after, being in jail",
   "es": "un periodo en que una persona condenada es supervisada en lugar de, o después de, estar en la cárcel"
  },
  "short": {
   "en": "Supervision instead of jail.",
   "es": "Supervisión en lugar de cárcel."
  }
 },
 {
  "term": "parole",
  "group": "confinement",
  "gmc": true,
  "pron": "pa-RÓUL",
  "official": {
   "en": "early release from prison under supervision, before the sentence ends",
   "es": "liberación anticipada de prisión bajo supervisión, antes de terminar la condena"
  },
  "short": {
   "en": "Early release from prison.",
   "es": "Salida anticipada de prisión."
  }
 },
 {
  "term": "deport / removal",
  "aliases": [
   "deport",
   "removal",
   "deportation",
   "deported"
  ],
  "gmc": true,
  "interview": true,
  "pron": "di-PÓRT",
  "official": {
   "en": "to be officially ordered to leave the United States",
   "es": "recibir la orden oficial de salir de Estados Unidos"
  },
  "short": {
   "en": "To be expelled from the United States.",
   "es": "Ser expulsado de Estados Unidos."
  }
 },
 {
  "term": "asylum",
  "group": "refuge",
  "pron": "a-SÁI-lum",
  "official": {
   "en": "protection given by a country to someone who fled persecution",
   "es": "protección que un país da a alguien que huyó de la persecución"
  },
  "short": {
   "en": "Protection from persecution.",
   "es": "Protección contra la persecución."
  }
 },
 {
  "term": "refugee",
  "group": "refuge",
  "pron": "re-fiu-YÍ",
  "official": {
   "en": "a person who flees their country to escape war or persecution",
   "es": "una persona que huye de su país para escapar de la guerra o la persecución"
  },
  "short": {
   "en": "Someone who flees war or persecution.",
   "es": "Alguien que huye de la guerra o persecución."
  }
 },
 {
  "term": "affiliated",
  "aliases": [
   "affiliation"
  ],
  "gmc": true,
  "interview": true,
  "pron": "a-FÍ-li-éi-ted",
  "official": {
   "en": "connected to, or a member of, a group or organization",
   "es": "conectado a, o miembro de, un grupo u organización"
  },
  "short": {
   "en": "Connected to a group.",
   "es": "Conectado a un grupo."
  }
 },
 {
  "term": "bear arms",
  "aliases": [
   "bear arms"
  ],
  "group": "weapons",
  "gmc": true,
  "interview": true,
  "pron": "BÉR ARMS",
  "official": {
   "en": "to carry or use a weapon, such as a gun",
   "es": "portar o usar un arma, como una pistola"
  },
  "short": {
   "en": "To carry or use a weapon.",
   "es": "Portar o usar un arma."
  },
  "tip": {
   "en": "\"Bear\" here means \"carry.\" If the officer asks whether you would bear arms for the United States if the law required it, answer honestly. If yes: \"Yes, I would.\"",
   "es": "\"Bear\" aquí significa \"portar\". Si el oficial pregunta si portarías armas por Estados Unidos en caso de que la ley lo exija, responde con honestidad. Si es así: \"Yes, I would.\""
  }
 },
 {
  "term": "Selective Service",
  "gmc": true,
  "interview": true,
  "pron": "se-LÉK-tiv SÉR-vis",
  "official": {
   "en": "a system requiring most men ages 18 to 25 to register in case the military needs them",
   "es": "un sistema que exige que la mayoría de los hombres de 18 a 25 años se registren por si el ejército los necesita"
  },
  "short": {
   "en": "Military registration for young men.",
   "es": "Registro militar para hombres jóvenes."
  },
  "tip": {
   "en": "Most men who live in the U.S. must register between ages 18 and 25, including green card holders.",
   "es": "La mayoría de los hombres que viven en EE. UU. deben registrarse entre los 18 y 25 años, incluidos los residentes permanentes."
  }
 },
 {
  "term": "spouse",
  "group": "marriage",
  "gmc": true,
  "interview": true,
  "pron": "SPÁUS",
  "official": {
   "en": "your husband or wife",
   "es": "tu esposo o esposa"
  },
  "short": {
   "en": "Your husband or wife.",
   "es": "Tu esposo o esposa."
  }
 },
 {
  "term": "continuous residence",
  "group": "residence",
  "interview": true,
  "pron": "kon-TÍN-iu-os RÉ-si-dens",
  "official": {
   "en": "living in the U.S. without long trips away during the required period",
   "es": "vivir en EE. UU. sin viajes largos durante el periodo requerido"
  },
  "short": {
   "en": "Living in the U.S. without long trips away.",
   "es": "Vivir en EE. UU. sin viajes largos."
  }
 },
 {
  "term": "taxes",
  "group": "tax",
  "gmc": true,
  "official": {
   "en": "money you must pay to the government from your income; you must file your tax returns and pay what you owe",
   "es": "dinero que debes pagar al gobierno de tus ingresos; debes presentar tu declaración de impuestos y pagar lo que debas"
  },
  "short": {
   "en": "Money collected by the government from the people.",
   "es": "Dinero que el gobierno recauda de la gente."
  },
  "tip": {
   "en": "Be ready to say whether you filed your taxes and whether you owe any. Bring your tax records for the years that apply to you.",
   "es": "Prepárate para decir si presentaste tus impuestos y si debes alguno. Lleva tus registros de impuestos de los años que te corresponden."
  }
 },
 {
  "term": "smuggling",
  "aliases": [
   "smuggle"
  ],
  "gmc": true,
  "interview": true,
  "pron": "SMÓ-gling",
  "official": {
   "en": "secretly and illegally bringing people or goods into a country",
   "es": "introducir personas o bienes a un país en secreto e ilegalmente"
  },
  "short": {
   "en": "Illegally bringing people or goods into a country.",
   "es": "Introducir personas o bienes ilegalmente."
  },
  "tip": {
   "en": "Memory hook: secretly moving people, drugs or goods across a border.",
   "es": "Para recordarlo: pasar personas, drogas o mercancía por una frontera en secreto."
  }
 },
 {
  "term": "habitual drunkard",
  "gmc": true,
  "interview": true,
  "pron": "ha-BÍ-chu-al DRÓN-kard",
  "official": {
   "en": "a person who is regularly or frequently drunk",
   "es": "una persona que se emborracha habitual o frecuentemente"
  },
  "short": {
   "en": "Someone often drunk.",
   "es": "Alguien que se emborracha seguido."
  }
 },
 {
  "term": "misrepresentation",
  "gmc": true,
  "pron": "mis-re-pri-sen-TÉI-shon",
  "official": {
   "en": "giving false information or lying to get a benefit",
   "es": "dar información falsa o mentir para obtener un beneficio"
  },
  "short": {
   "en": "Lying to get a benefit.",
   "es": "Mentir para obtener un beneficio."
  }
 },
 {
  "term": "religion",
  "gmc": true,
  "official": {
   "en": "a belief in and worship of God or gods",
   "es": "creencia y adoración de Dios o dioses"
  },
  "short": {
   "en": "To believe in God.",
   "es": "Creer en Dios."
  }
 },
 {
  "term": "weapon",
  "group": "weapons",
  "gmc": true,
  "interview": true,
  "pron": "UÉ-pon",
  "official": {
   "en": "an object, such as a gun or knife, used to harm or kill",
   "es": "un objeto, como una pistola o cuchillo, usado para dañar o matar"
  },
  "short": {
   "en": "An object used to harm or kill.",
   "es": "Un objeto usado para dañar o matar."
  }
 },
 {
  "term": "communism",
  "group": "politics",
  "gmc": true,
  "pron": "KÓ-miu-ni-som",
  "official": {
   "en": "a political system where the state controls property and there is no personal freedom or private ownership",
   "es": "un sistema político donde el estado controla la propiedad y no hay libertad personal ni propiedad privada"
  },
  "short": {
   "en": "No freedom.",
   "es": "Sin libertad."
  }
 },
 {
  "term": "oath",
  "group": "oath",
  "gmc": true,
  "official": {
   "en": "a formal, solemn promise",
   "es": "una promesa formal y solemne"
  },
  "short": {
   "en": "A promise to tell the truth.",
   "es": "Una promesa de decir la verdad."
  }
 },
 {
  "term": "registered to vote",
  "group": "vote",
  "gmc": true,
  "official": {
   "en": "officially signed up on the list of people allowed to vote",
   "es": "inscrito oficialmente en la lista de personas autorizadas a votar"
  },
  "short": {
   "en": "Signed up to vote.",
   "es": "Inscrito para votar."
  },
  "tip": {
   "en": "Only U.S. citizens may vote in federal elections. If you ever registered or voted, tell the truth and speak with an immigration attorney before your interview.",
   "es": "Solo los ciudadanos de EE. UU. pueden votar en elecciones federales. Si alguna vez te inscribiste o votaste, di la verdad y habla con un abogado de inmigración antes de tu entrevista."
  }
 },
 {
  "term": "lie",
  "gmc": true,
  "official": {
   "en": "a statement that is not true, said on purpose",
   "es": "una declaración falsa dicha a propósito"
  },
  "short": {
   "en": "Not the truth.",
   "es": "No es la verdad."
  }
 },
 {
  "term": "prison / jail",
  "aliases": [
   "prison",
   "jail"
  ],
  "group": "confinement",
  "gmc": true,
  "interview": true,
  "pron": "PRÍ-son / YÉIL",
  "official": {
   "en": "a place where people are kept as punishment for a crime",
   "es": "un lugar donde se mantiene a personas como castigo por un delito"
  },
  "short": {
   "en": "A place for criminals.",
   "es": "Un lugar para criminales."
  }
 },
 {
  "term": "the Constitution",
  "aliases": [
   "constitution"
  ],
  "group": "law",
  "gmc": true,
  "interview": true,
  "pron": "kons-ti-TIÚ-shon",
  "official": {
   "en": "the document containing the supreme law of the United States",
   "es": "el documento que contiene la ley suprema de Estados Unidos"
  },
  "short": {
   "en": "The supreme law of the land.",
   "es": "La ley suprema del país."
  }
 },
 {
  "term": "prior spouse",
  "group": "marriage",
  "interview": true,
  "pron": "PRÁI-or SPÁUS",
  "official": {
   "en": "a person you were legally married to before your current spouse",
   "es": "una persona con quien estuviste legalmente casado antes de tu cónyuge actual"
  },
  "short": {
   "en": "The person you were married to before.",
   "es": "La persona con quien estuviste casado antes."
  },
  "tip": {
   "en": "The form asks about every prior spouse. Know their names and when each marriage began and ended.",
   "es": "El formulario pregunta por cada cónyuge anterior. Sabe sus nombres y cuándo empezó y terminó cada matrimonio."
  }
 },
 {
  "term": "previous marriage",
  "group": "marriage",
  "interview": true,
  "pron": "PRÍ-vi-os MÉ-rich",
  "official": {
   "en": "a marriage that ended, by divorce, annulment or death, before your present marriage",
   "es": "un matrimonio que terminó, por divorcio, anulación o muerte, antes de tu matrimonio actual"
  },
  "short": {
   "en": "A marriage before the current one.",
   "es": "Un matrimonio anterior al actual."
  },
  "tip": {
   "en": "Do not mix them up: present marriage = your current marriage; previous marriage = one before it.",
   "es": "No los confundas: present marriage = tu matrimonio actual; previous marriage = uno anterior."
  }
 },
 {
  "term": "occupation",
  "group": "work",
  "interview": true,
  "pron": "o-kiu-PÉI-shon",
  "official": {
   "en": "your job or profession; the kind of work you do",
   "es": "tu trabajo o profesión; el tipo de trabajo que haces"
  },
  "short": {
   "en": "Your job or position.",
   "es": "Tu trabajo o puesto."
  },
  "tip": {
   "en": "Say your job title (for example, \"cashier\" or \"driver\"). It must match what you wrote on your N-400.",
   "es": "Di el nombre de tu puesto (por ejemplo, \"cashier\" o \"driver\"). Debe coincidir con lo que escribiste en tu N-400."
  }
 },
 {
  "term": "employment",
  "group": "work",
  "interview": true,
  "pron": "em-PLÓI-ment",
  "official": {
   "en": "work for which you are paid; a job",
   "es": "trabajo por el cual recibes pago; un empleo"
  },
  "short": {
   "en": "Having a paid job.",
   "es": "Tener un trabajo pagado."
  },
  "tip": {
   "en": "The officer may ask where you work and how long you have worked there. Keep your dates consistent with your form.",
   "es": "El oficial puede preguntar dónde trabajas y desde cuándo. Mantén tus fechas iguales a las de tu formulario."
  }
 },
 {
  "term": "unemployed",
  "group": "work",
  "interview": true,
  "pron": "on-em-PLÓID",
  "official": {
   "en": "not working at a paid job",
   "es": "no tener un trabajo pagado"
  },
  "short": {
   "en": "Not having a paid job.",
   "es": "No tener un trabajo pagado."
  },
  "tip": {
   "en": "If you were not working during a period, say so honestly: \"I was not working at that time.\"",
   "es": "Si no trabajaste durante un periodo, dilo con honestidad: \"I was not working at that time.\""
  }
 },
 {
  "term": "self-employed",
  "group": "work",
  "interview": true,
  "pron": "self-em-PLÓID",
  "official": {
   "en": "working for yourself, in your own business, instead of for an employer",
   "es": "trabajar para ti mismo, en tu propio negocio, en lugar de para un empleador"
  },
  "short": {
   "en": "Working for yourself.",
   "es": "Trabajar para ti mismo."
  }
 },
 {
  "term": "nickname",
  "interview": true,
  "pron": "NÍK-néim",
  "official": {
   "en": "an informal name used by family or friends instead of your legal name",
   "es": "un nombre informal que usan tu familia o amigos en lugar de tu nombre legal"
  },
  "short": {
   "en": "An informal name.",
   "es": "Un nombre informal."
  },
  "tip": {
   "en": "The form asks about other names you have used, which can include nicknames.",
   "es": "El formulario pregunta por otros nombres que hayas usado, que pueden incluir apodos."
  }
 },
 {
  "term": "interview",
  "pron": "ÍN-ter-viu",
  "official": {
   "en": "a formal meeting where an officer asks you questions to decide your application",
   "es": "una reunión formal donde un oficial te hace preguntas para decidir sobre tu solicitud"
  },
  "short": {
   "en": "A meeting where an officer asks questions.",
   "es": "Una reunión donde un oficial hace preguntas."
  }
 },
 {
  "term": "race",
  "pron": "RÉIS",
  "official": {
   "en": "a group of people who share ancestry, physical traits or culture; the form asks you to choose the options that describe you",
   "es": "un grupo de personas que comparten ascendencia, rasgos físicos o cultura; el formulario te pide elegir las opciones que te describen"
  },
  "short": {
   "en": "A group with shared ancestry or culture.",
   "es": "Un grupo con ascendencia o cultura en común."
  }
 },
 {
  "term": "current residence",
  "group": "residence",
  "interview": true,
  "pron": "KÉ-rent RÉ-si-dens",
  "official": {
   "en": "the place where you live now",
   "es": "el lugar donde vives ahora"
  },
  "short": {
   "en": "The place where you live now.",
   "es": "El lugar donde vives ahora."
  },
  "tip": {
   "en": "Know your full address and how long you have lived there. Dates must match your N-400.",
   "es": "Sabe tu dirección completa y cuánto tiempo llevas viviendo allí. Las fechas deben coincidir con tu N-400."
  }
 },
 {
  "term": "immigration benefit",
  "gmc": true,
  "interview": true,
  "pron": "i-mi-GRÉI-shon BÉ-ne-fit",
  "official": {
   "en": "something you can receive from USCIS, such as a green card, a work permit or citizenship",
   "es": "algo que puedes recibir de USCIS, como una green card, un permiso de trabajo o la ciudadanía"
  },
  "short": {
   "en": "A green card, work permit or citizenship.",
   "es": "Una green card, permiso de trabajo o ciudadanía."
  },
  "tip": {
   "en": "If you are asked whether you married to get an immigration benefit, answer truthfully. If you married for love and to build a family together, say that clearly.",
   "es": "Si te preguntan si te casaste para obtener un beneficio migratorio, responde con la verdad. Si te casaste por amor y para formar una familia, dilo con claridad."
  }
 },
 {
  "term": "USCIS",
  "pron": "iu-és-si-ái-és",
  "interview": true,
  "official": {
   "en": "United States Citizenship and Immigration Services, the government agency that handles green cards, citizenship and other immigration benefits",
   "es": "Servicios de Ciudadanía e Inmigración de Estados Unidos, la agencia del gobierno que maneja las green cards, la ciudadanía y otros beneficios migratorios"
  },
  "short": {
   "en": "U.S. Citizenship and Immigration Services.",
   "es": "Servicios de Ciudadanía e Inmigración de EE. UU."
  },
  "tip": {
   "en": "The officer may point to the letters on the wall and ask what they stand for.",
   "es": "El oficial puede señalar las siglas en la pared y preguntar qué significan."
  }
 },
 {
  "term": "file a tax return",
  "aliases": [
   "file taxes return",
   "file taxes"
  ],
  "group": "tax",
  "interview": true,
  "pron": "FÁIL a TÁKS ri-TÉRN",
  "official": {
   "en": "to send your yearly tax return to the government (the IRS)",
   "es": "enviar tu declaración anual de impuestos al gobierno (el IRS)"
  },
  "short": {
   "en": "To send your tax forms to the IRS.",
   "es": "Enviar tus formularios de impuestos al IRS."
  },
  "tip": {
   "en": "Bring your tax records for the years that apply to you. The officer may ask whether you filed every year.",
   "es": "Lleva tus registros de impuestos de los años que te corresponden. El oficial puede preguntar si presentaste cada año."
  }
 },
 {
  "term": "owe taxes",
  "group": "tax",
  "interview": true,
  "pron": "ÓU TÁK-ses",
  "official": {
   "en": "to owe the government money for taxes you have not paid",
   "es": "deberle dinero al gobierno por impuestos que no has pagado"
  },
  "short": {
   "en": "To owe the government money.",
   "es": "Deberle dinero al gobierno."
  },
  "tip": {
   "en": "If you owe taxes, be ready to explain and show proof of a payment plan.",
   "es": "Si debes impuestos, prepárate para explicarlo y mostrar prueba de un plan de pago."
  }
 },
 {
  "term": "vote",
  "group": "vote",
  "interview": true,
  "pron": "VÓUT",
  "official": {
   "en": "to choose leaders or decide an issue by casting a ballot",
   "es": "elegir líderes o decidir un asunto emitiendo un voto"
  },
  "short": {
   "en": "To elect leaders.",
   "es": "Elegir a los líderes."
  },
  "tip": {
   "en": "Only U.S. citizens may vote in federal elections.",
   "es": "Solo los ciudadanos de EE. UU. pueden votar en elecciones federales."
  }
 },
 {
  "term": "register",
  "group": "vote",
  "interview": true,
  "pron": "RÉ-yis-ter",
  "official": {
   "en": "to officially sign up or enroll, for example to vote or for the Selective Service",
   "es": "inscribirse oficialmente, por ejemplo para votar o para el Servicio Selectivo"
  },
  "short": {
   "en": "To sign up.",
   "es": "Inscribirse."
  }
 },
 {
  "term": "form of government",
  "aliases": [
   "form of government of the United States"
  ],
  "group": "law",
  "interview": true,
  "pron": "FÓRM of GÓ-vern-ment",
  "official": {
   "en": "the way a country is organized and run; the United States is a republic, with a Constitution and leaders chosen by the people",
   "es": "la manera en que se organiza y gobierna un país; Estados Unidos es una república, con una Constitución y líderes elegidos por el pueblo"
  },
  "short": {
   "en": "A republic.",
   "es": "Una república."
  },
  "tip": {
   "en": "The officer may ask: \"What is the form of government of the United States?\" Answer: \"A republic.\"",
   "es": "El oficial puede preguntar: \"What is the form of government of the United States?\" Respuesta: \"A republic.\""
  }
 },
 {
  "term": "physical presence",
  "group": "residence",
  "interview": true,
  "pron": "FÍ-si-kal PRÉ-sens",
  "official": {
   "en": "the total time you were physically inside the United States",
   "es": "el tiempo total que estuviste físicamente dentro de Estados Unidos"
  },
  "short": {
   "en": "Time you spent inside the U.S.",
   "es": "Tiempo que estuviste dentro de EE. UU."
  }
 },
 {
  "term": "amendment",
  "aliases": [
   "an amendment"
  ],
  "group": "law",
  "interview": true,
  "pron": "a-MÉND-ment",
  "official": {
   "en": "a change or addition to the Constitution",
   "es": "un cambio o adición a la Constitución"
  },
  "short": {
   "en": "A change to the Constitution.",
   "es": "Un cambio a la Constitución."
  }
 },
 {
  "term": "Bill of Rights",
  "aliases": [
   "the Bill of Rights"
  ],
  "group": "law",
  "interview": true,
  "pron": "BÍL of RÁITS",
  "official": {
   "en": "the first 10 amendments to the Constitution, which protect the rights of citizens",
   "es": "las primeras 10 enmiendas a la Constitución, que protegen los derechos de los ciudadanos"
  },
  "short": {
   "en": "The first 10 amendments.",
   "es": "Las primeras 10 enmiendas."
  }
 },
 {
  "term": "dependent",
  "aliases": [
   "a dependent"
  ],
  "interview": true,
  "pron": "di-PÉN-dent",
  "official": {
   "en": "a person, usually a child, who relies on you financially for food, clothing, and shelter",
   "es": "una persona, generalmente un hijo, que depende de ti económicamente para comida, ropa y vivienda"
  },
  "short": {
   "en": "Someone you support financially.",
   "es": "Alguien a quien mantienes económicamente."
  }
 },
 {
  "term": "felony",
  "aliases": [
   "a felony"
  ],
  "group": "felony",
  "gmc": true,
  "interview": true,
  "pron": "FÉ-lo-ni",
  "official": {
   "en": "a serious crime, more serious than a misdemeanor, such as robbery or assault",
   "es": "un delito grave, más serio que un delito menor, como robo o agresión"
  },
  "short": {
   "en": "A serious crime.",
   "es": "Un delito grave."
  }
 },
 {
  "term": "misdemeanor",
  "aliases": [
   "a misdemeanor"
  ],
  "group": "felony",
  "gmc": true,
  "interview": true,
  "pron": "mis-di-MÍ-nor",
  "official": {
   "en": "a less serious crime, such as a minor traffic violation or disorderly conduct",
   "es": "un delito menor, como una infracción de tráfico leve o alterar el orden público"
  },
  "short": {
   "en": "A less serious crime.",
   "es": "Un delito menor."
  }
 },
 {
  "term": "claimed to be a U.S. citizen",
  "gmc": true,
  "interview": true,
  "pron": "KLÉIMD tu bi a YU-ES SÍ-ti-sen",
  "official": {
   "en": "told someone, such as an employer, or wrote on a form, that you were a U.S. citizen when you were not",
   "es": "decirle a alguien, como un empleador, o escribir en un formulario, que eras ciudadano de EE. UU. cuando no lo eras"
  },
  "short": {
   "en": "Saying you are a citizen when you are not.",
   "es": "Decir que eres ciudadano sin serlo."
  }
 },
 {
  "term": "child support",
  "gmc": true,
  "interview": true,
  "pron": "CHÁILD sa-PÓRT",
  "official": {
   "en": "money a parent is ordered by a court to pay for the care of their child",
   "es": "dinero que un tribunal ordena a un padre pagar por el cuidado de su hijo"
  },
  "short": {
   "en": "Money paid to care for your child.",
   "es": "Dinero que se paga por el cuidado de tu hijo."
  }
 },
 {
  "term": "hereditary title",
  "gmc": true,
  "quiz": false,
  "official": {
   "en": "a noble rank passed down in a family, like a lord or duke",
   "es": "un rango noble que se hereda en una familia, como lord o duque"
  },
  "short": {
   "en": "A noble rank passed down in a family, like a lord or duke.",
   "es": "Un rango noble que se hereda en una familia, como lord o duque."
  }
 },
 {
  "term": "order of nobility",
  "gmc": true,
  "quiz": false,
  "official": {
   "en": "an official noble rank granted by a king or government",
   "es": "un rango noble oficial otorgado por un rey o un gobierno"
  },
  "short": {
   "en": "An official noble rank granted by a king or government.",
   "es": "Un rango noble oficial otorgado por un rey o un gobierno."
  }
 },
 {
  "term": "exemption",
  "gmc": true,
  "quiz": false,
  "official": {
   "en": "being officially excused from doing something required by law",
   "es": "estar oficialmente excusado de hacer algo que exige la ley"
  },
  "short": {
   "en": "Being officially excused from doing something required by law.",
   "es": "Estar oficialmente excusado de hacer algo que exige la ley."
  }
 },
 {
  "term": "noncombatant service",
  "gmc": true,
  "quiz": false,
  "official": {
   "en": "military service that does not involve fighting or combat",
   "es": "servicio militar que no incluye combatir"
  },
  "short": {
   "en": "Military service that does not involve fighting or combat.",
   "es": "Servicio militar que no incluye combatir."
  }
 },
 {
  "term": "alimony",
  "gmc": true,
  "quiz": false,
  "official": {
   "en": "money a court orders one spouse to pay the other after divorce",
   "es": "dinero que un tribunal ordena que un cónyuge pague al otro después del divorcio"
  },
  "short": {
   "en": "Money a court orders one spouse to pay the other after divorce.",
   "es": "Dinero que un tribunal ordena que un cónyuge pague al otro después del divorcio."
  }
 }
];
  // Ways a real officer may ask for a definition ({t} = the term). Used by the quiz and by generate_audio.js.
  list.ASK_EN = ['What does {t} mean?', 'Define {t}, please.', 'Can you explain what {t} means?', 'Do you know what {t} means?', 'How do you understand {t}?'];
  list.ASK_ES = ['¿Qué significa {t}?', 'Defina {t}, por favor.', '¿Puede explicar qué significa {t}?', '¿Sabe qué significa {t}?', '¿Cómo entiende {t}?'];
  return list;
});

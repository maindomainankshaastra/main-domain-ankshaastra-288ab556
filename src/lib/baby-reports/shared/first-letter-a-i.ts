/**
 * FIRST LETTER SIGNIFICANCE (shared across Name Correction, Perfect Baby
 * Name, and Complete Baby Blueprint reports).
 * Source: client's docx, "PART 5 — FIRST ALPHABET MEANING & TRAITS".
 * Verbatim client copy — do NOT paraphrase/edit.
 *
 * THIS IS BATCH 1 OF 3 — Letters A through I only.
 * Still to come: J-R (batch 2), S-Z (batch 3). Merge all three into this
 * same LETTER_BLOCKS map before wiring into the report engine — the report
 * needs all 26 letters present.
 */

export interface LetterBlock {
  letter: string;
  title: string;
  numerologicalValue: number;
  element?: string;
  rulingPlanet?: string;
  archetype: string;
  coreEssence: string;
  communicationStyle: string[];
  challenges: string[];
  strengths: string[];
  famousNames: string[];
  spiritualSignificance: string;
  mantra: string;
  howToMaximize: string[];
}

export const LETTER_BLOCKS: Record<string, LetterBlock> = {
  A: {
    letter: "A",
    title: "THE PIONEER",
    numerologicalValue: 1,
    archetype: "The Leader, The Innovator",
    coreEssence:
      "You carry the energy of beginnings, leadership, and independence. \"A\" is the first letter of the alphabet, and you naturally position yourself at the forefront of life.",
    communicationStyle: [
      "Direct and assertive",
      "Gets straight to the point",
      "Commanding presence in discussions",
      "Natural public speaker",
    ],
    challenges: [
      "Can be overly aggressive or pushy",
      "May struggle with authority figures",
      "Tendency toward stubbornness",
      "Impatience with slower processes",
      "Difficulty asking for help",
      "Can be self-centered at times",
      "May dominate conversations/situations",
    ],
    strengths: [
      "Natural leadership ability",
      "Strong willpower and determination",
      "Creative and original thinking",
      "Pioneering spirit",
      "Self-reliant and independent",
      "Ambitious goal-setter",
      "Courageous in face of opposition",
    ],
    famousNames: [
      "Amitabh (Bachchan – legendary actor, icon of Indian cinema)",
      "Azim (Premji – tech billionaire, philanthropist)",
      "Aishwarya (Rai – global beauty queen, Bollywood royalty)",
      "Asha (Bhosle – world's most recorded artist, music legend)",
    ],
    spiritualSignificance:
      "\"A\" is the sound of creation—\"Aum/Om\" begins with this vibration. You carry creative, manifesting energy. Your very presence initiates new chapters.",
    mantra: "I am a leader. I create my path. I move forward with courage and wisdom.",
    howToMaximize: [
      "Channel leadership into service, not ego",
      "Balance independence with teamwork",
      "Use your courage to uplift others",
      "Let your pioneering spirit inspire",
      "Practice patience with those who move slower",
    ],
  },

  B: {
    letter: "B",
    title: "THE PEACEMAKER",
    numerologicalValue: 2,
    element: "Water",
    rulingPlanet: "Moon",
    archetype: "The Diplomat, The Harmonizer",
    coreEssence:
      "You carry the energy of cooperation, sensitivity, and balance. \"B\" represents duality and partnership, making you naturally attuned to others' needs and feelings.",
    communicationStyle: [
      "Diplomatic and considerate",
      "Indirect when uncomfortable",
      "Excellent at reading between the lines",
      "Prefer harmony over being right",
    ],
    challenges: [
      "Can be overly sensitive or easily hurt",
      "May avoid confrontation at personal cost",
      "Tendency to be indecisive",
      "Can lose self in relationships",
      "May struggle with self-assertion",
      "Prone to mood swings",
      "Can be passive-aggressive when upset",
    ],
    strengths: [
      "Exceptional emotional intelligence",
      "Diplomatic and tactful",
      "Patient and understanding",
      "Natural team player",
      "Intuitive and perceptive",
      "Supportive and nurturing",
    ],
    famousNames: [
      "Bal (Gangadhar Tilak – father of Indian nationalism, freedom icon)",
      "Bhimrao (Ambedkar – architect of Indian Constitution, social reformer)",
      "Bachendri (Pal – first Indian woman to summit Everest)",
      "Bharati (Mukherjee – celebrated Indian-origin literary author)",
    ],
    spiritualSignificance:
      "\"B\" represents the sacred feminine, receptivity, and the power of two becoming one. You embody unity consciousness and the healing power of compassion.",
    mantra: "I honor my sensitivity as strength. I create peace while honoring my truth.",
    howToMaximize: [
      "Set healthy boundaries without guilt",
      "Practice self-care as much as you care for others",
      "Trust your intuition—it's usually right",
      "Speak your needs clearly and lovingly",
      "Balance giving with receiving",
    ],
  },

  C: {
    letter: "C",
    title: "THE COMMUNICATOR",
    numerologicalValue: 3,
    element: "Air",
    rulingPlanet: "Jupiter",
    archetype: "The Artist, The Expresser",
    coreEssence:
      "You carry the energy of creativity, expression, and joy. \"C\" represents the trinity—mind, body, spirit—and you naturally integrate and express all three through communication.",
    communicationStyle: [
      "Expressive and colorful",
      "Uses humor and storytelling",
      "Natural conversationalist",
      "Sometimes more style than substance",
    ],
    challenges: [
      "Can be scattered or unfocused",
      "May talk too much, listen too little",
      "Tendency toward superficiality",
      "Can be overly dramatic",
      "May struggle with follow-through",
      "Can be attention-seeking",
      "Prone to exaggeration",
    ],
    strengths: [
      "Exceptional communication skills",
      "Creative and artistic talent",
      "Natural entertainer and performer",
      "Optimistic and enthusiastic",
      "Socially gifted and popular",
      "Versatile and adaptable",
      "Inspiring and uplifting to others",
    ],
    famousNames: [
      "Chetan (Bhagat – India's bestselling English author, mass influencer)",
      "Cyrus (Mistry – industrialist, former Tata Group chairman)",
      "Chanda (Kochhar – ICICI Bank CEO, India's most powerful banker)",
      "Chandramukhi (Bose – first Indian woman to earn a graduate degree, pioneer)",
    ],
    spiritualSignificance:
      "\"C\" represents the holy trinity and the power of manifestation through word. Your voice is a creative force—what you speak, you create.",
    mantra: "My words create worlds. I express my authentic truth with joy and wisdom.",
    howToMaximize: [
      "Balance talking with listening",
      "Channel creativity into meaningful projects",
      "Practice depth alongside breadth",
      "Use your influence responsibly",
      "Complete what you start before moving to the next excitement",
    ],
  },

  D: {
    letter: "D",
    title: "THE BUILDER",
    numerologicalValue: 4,
    element: "Earth",
    rulingPlanet: "Rahu (North Node)",
    archetype: "The Architect, The Foundation",
    coreEssence:
      "You carry the energy of structure, stability, and practical manifestation. \"D\" represents the four corners of creation—you build solid foundations for lasting success.",
    communicationStyle: [
      "Direct and factual",
      "Prefers concrete data over abstract ideas",
      "Can be blunt or too honest",
      "Values efficiency in conversation",
    ],
    challenges: [
      "Can be rigid or inflexible",
      "May be resistant to change",
      "Tendency toward workaholism",
      "Can be overly serious or stern",
      "May miss big picture for details",
      "Can be controlling",
      "Struggles with spontaneity",
    ],
    strengths: [
      "Exceptional organizational skills",
      "Reliable and dependable",
      "Strong work ethic",
      "Practical problem-solver",
      "Patient and methodical",
      "Detail-oriented and thorough",
      "Creates lasting value",
    ],
    famousNames: [
      "Dhirubhai (Ambani – Reliance founder, greatest Indian entrepreneur)",
      "Dhyan (Chand – hockey wizard, India's greatest sportsman ever)",
      "Deepika (Padukone – global Bollywood star, Forbes most powerful celebrity)",
      "Droupadi (Murmu – President of India, first tribal woman President)",
    ],
    spiritualSignificance:
      "\"D\" represents the four elements, four directions, and the material plane. You're here to demonstrate that spiritual principles work in practical reality.",
    mantra: "I build with purpose. My discipline creates freedom. Structure supports my dreams.",
    howToMaximize: [
      "Balance work with play and rest",
      "Embrace flexibility within your structures",
      "Remember the 'why' behind your 'what'",
      "Express emotions, not just do tasks",
      "Allow spontaneity to enhance your plans",
    ],
  },

  E: {
    letter: "E",
    title: "THE EXPLORER",
    numerologicalValue: 5,
    element: "Ether (Space)",
    rulingPlanet: "Mercury",
    archetype: "The Adventurer, The Free Spirit",
    coreEssence:
      "You carry the energy of freedom, change, and experience. \"E\" is the most commonly used letter in language, reflecting your versatile and adaptable nature.",
    communicationStyle: [
      "Expressive and persuasive",
      "Quick-witted and clever",
      "Can be scattered or tangential",
      "Natural storyteller",
    ],
    challenges: [
      "Can be restless and unstable",
      "May avoid commitment (relationships, jobs, locations)",
      "Tendency toward excess and addiction",
      "Can be impulsive and reckless",
      "May scatter energy in too many directions",
      "Struggles with routine and discipline",
      "Can be unreliable",
    ],
    strengths: [
      "Highly adaptable and versatile",
      "Quick learner and communicator",
      "Adventurous and brave",
      "Magnetic personality",
      "Excellent networker",
      "Progressive and forward-thinking",
      "Masters of change",
    ],
    famousNames: [
      "E. Sreedharan (Metro Man, built Delhi Metro, infrastructure legend)",
      "Eknath (Shinde – Chief Minister of Maharashtra, powerful political leader)",
      "Ekta (Kapoor – queen of Indian television and OTT content)",
      "Ela (Bhatt – founder of SEWA, Goldman Environment Prize winner)",
    ],
    spiritualSignificance:
      "\"E\" represents the breath of life, expansion, and the eternal quest. You're here to remind humanity that growth requires movement and change.",
    mantra: "I embrace change as my teacher. My freedom serves my highest purpose.",
    howToMaximize: [
      "Channel restlessness into purposeful exploration",
      "Build some structure to support your freedom",
      "Complete projects before starting new ones",
      "Balance excitement-seeking with inner peace",
      "Use your adaptability to help others navigate change",
    ],
  },

  F: {
    letter: "F",
    title: "THE NURTURER",
    numerologicalValue: 8,
    element: "Earth",
    rulingPlanet: "Saturn",
    archetype: "The Caretaker, The Provider",
    coreEssence:
      "You carry the energy of responsibility, nurturing, and material manifestation. \"F\" represents family, foundation, and the power to create abundance through service.",
    communicationStyle: [
      "Direct and practical",
      "May come across as stern or authoritative",
      "Values honesty over politeness",
      "Solution-oriented",
    ],
    challenges: [
      "Can be controlling or domineering",
      "May sacrifice self for others excessively",
      "Tendency toward materialism",
      "Can be judgmental or critical",
      "May struggle with work-life balance",
      "Can be overly serious",
      "Difficulty delegating or trusting others",
    ],
    strengths: [
      "Strong sense of responsibility",
      "Natural provider and protector",
      "Excellent with finances and resources",
      "Nurturing and supportive",
      "Mature and wise",
      "Creates material security",
      "Loyal and committed",
    ],
    famousNames: [
      "Farhan (Akhtar – actor, director, singer, complete creative powerhouse)",
      "Farokh (Engineer – India's finest wicketkeeper, cricket legend)",
      "Farah (Khan – Bollywood's most celebrated choreographer and director)",
      "Fatima (Sana Shaikh – National Award nominated actress, Dangal fame)",
    ],
    spiritualSignificance:
      "\"F\" represents the father principle, protection, and the manifestation of spiritual abundance in material form. You demonstrate that wealth serves love.",
    mantra: "I provide with love. My abundance flows to serve. I am worthy of receiving.",
    howToMaximize: [
      "Balance giving with receiving",
      "Allow others to support you too",
      "Remember that love matters more than provision",
      "Delegate and trust others' capabilities",
      "Nurture yourself as you nurture others",
    ],
  },

  G: {
    letter: "G",
    title: "THE SEEKER",
    numerologicalValue: 3,
    element: "Fire",
    rulingPlanet: "Jupiter",
    archetype: "The Philosopher, The Mystic",
    coreEssence:
      "You carry the energy of wisdom-seeking, introspection, and spiritual inquiry. \"G\" represents the journey inward to find truth and the journey outward to share it.",
    communicationStyle: [
      "Thoughtful and measured",
      "Prefers meaningful conversation",
      "Can be indirect or enigmatic",
      "Uncomfortable with superficial chat",
    ],
    challenges: [
      "Can be overly serious or heavy",
      "May isolate or withdraw excessively",
      "Tendency toward pessimism",
      "Can be judgmental of \"superficiality\"",
      "May overthink and under-act",
      "Struggles with small talk",
      "Can seem aloof or unapproachable",
    ],
    strengths: [
      "Deep thinker and philosopher",
      "Spiritually inclined and intuitive",
      "Excellent researcher and analyst",
      "Wise beyond years",
      "Authentic and genuine",
      "Strong moral compass",
      "Natural teacher of profound truths",
    ],
    famousNames: [
      "Gautam (Adani – India's global billionaire, ports to airports empire)",
      "Gulzar (legendary lyricist, poet, filmmaker, Dadasaheb Phalke awardee)",
      "Girija (Devi – Thumri queen, Bharat Ratna classical vocalist)",
      "Geeta (Phogat – Commonwealth gold medallist wrestler, Dangal inspiration)",
    ],
    spiritualSignificance:
      "\"G\" represents the guru within, the inner guide, and the journey to self-realization. You're here to demonstrate that true knowledge comes from within.",
    mantra: "I seek truth and find it within. My wisdom serves the world.",
    howToMaximize: [
      "Balance introspection with action",
      "Share your wisdom without judgment",
      "Engage with \"lightness\" as well as depth",
      "Trust your intuition as much as your intellect",
      "Remember that joy is also spiritual",
    ],
  },

  H: {
    letter: "H",
    title: "THE ACHIEVER",
    numerologicalValue: 5,
    element: "Air",
    rulingPlanet: "Mercury",
    archetype: "The Accumulator, The Empire Builder",
    coreEssence:
      "You carry the energy of ambition, material success, and worldly achievement. \"H\" represents the ladder to heaven—you climb through effort and determination.",
    communicationStyle: [
      "Direct and results-oriented",
      "Persuasive and strategic",
      "May lack emotional expression",
      "Focuses on outcomes",
    ],
    challenges: [
      "Can be overly materialistic",
      "May sacrifice relationships for success",
      "Tendency toward workaholism",
      "Can be ruthless or calculating",
      "May struggle with contentment",
      "Can be status-obsessed",
      "Difficulty with vulnerability",
    ],
    strengths: [
      "Highly ambitious and driven",
      "Excellent business acumen",
      "Strategic and clever",
      "Natural accumulator of wealth",
      "Strong manifestation abilities",
      "Resilient and determined",
      "Leadership in material world",
    ],
    famousNames: [
      "Harsha (Bhogle – voice of Indian cricket, world's finest commentator)",
      "Homi (Bhabha – father of India's nuclear program)",
      "Hema (Malini – dream girl of Bollywood, Padma Bhushan awardee)",
      "Harnaaz (Sandhu – Miss Universe 2021, India's beauty ambassador)",
    ],
    spiritualSignificance:
      "\"H\" represents the breath (Ha) and the power to manifest thoughts into material reality. You're here to show that heaven and earth can unite through right effort.",
    mantra: "I achieve with integrity. My success serves the greater good. I am abundant.",
    howToMaximize: [
      "Define success beyond material metrics",
      "Balance ambition with relationships",
      "Use wealth to serve, not just to have",
      "Practice contentment alongside growth",
      "Measure success by impact, not just accumulation",
    ],
  },

  I: {
    letter: "I",
    title: "THE INDIVIDUALIST",
    numerologicalValue: 1,
    element: "Fire",
    rulingPlanet: "Sun",
    archetype: "The Original, The Authentic Self",
    coreEssence:
      "You carry the energy of individuality, self-focus, and personal truth. \"I\" is literally the pronoun of self—you're here to discover and express your unique essence.",
    communicationStyle: [
      "Direct and personal",
      "\"I\" statements (naturally!)",
      "Honest to a fault",
      "Focuses on own perspective",
    ],
    challenges: [
      "Can be self-absorbed or narcissistic",
      "May isolate from others",
      "Tendency toward selfishness",
      "Can be inflexible about \"your way\"",
      "May struggle with compromise",
      "Can seem arrogant",
      "Difficulty with teamwork",
    ],
    strengths: [
      "Strongly individualistic and original",
      "Authentic and genuine",
      "Self-aware and introspective",
      "Independent thinker",
      "Courageous in self-expression",
      "Inspiring uniqueness",
      "Strong personal integrity",
    ],
    famousNames: [
      "Irrfan (Khan – globally acclaimed actor, Hollywood crossover legend)",
      "Indra (Nooyi – PepsiCo global CEO, ranked world's most powerful businesswoman)",
      "Ila (Arun – celebrated folk singer and actress, cultural icon)",
      "Isha (Ambani – Reliance heiress, India's most powerful young businesswoman)",
    ],
    spiritualSignificance:
      "\"I\" represents the self, the ego, and the journey from \"I\" consciousness to \"We\" consciousness while maintaining authentic selfhood. You're here to integrate individuality with unity.",
    mantra: "I am uniquely me. My authenticity inspires others. I honor self and other.",
    howToMaximize: [
      "Balance self-focus with awareness of others",
      "Use your uniqueness to serve, not just to stand out",
      "Practice vulnerability and connection",
      "Remember that others' paths are equally valid",
      "Let your authenticity inspire, not isolate",
    ],
  },
};

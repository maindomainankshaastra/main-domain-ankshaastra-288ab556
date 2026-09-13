/**
 * FIRST LETTER SIGNIFICANCE (shared across Name Correction, Perfect Baby
 * Name, and Complete Baby Blueprint reports).
 * Source: client's docx, "PART 5 — FIRST ALPHABET MEANING & TRAITS".
 * Verbatim client copy — do NOT paraphrase/edit.
 *
 * THIS IS BATCH 2 OF 3 — Letters J through R only.
 * See ./first-letter-a-i.ts for the LetterBlock type definition and A-I.
 * Still to come: S-Z (batch 3). Merge all three into one LETTER_BLOCKS map
 * before wiring into the report engine — the report needs all 26 letters.
 */

import type { LetterBlock } from "./first-letter-a-i";

export const LETTER_BLOCKS_J_R: Record<string, LetterBlock> = {
  J: {
    letter: "J",
    title: "THE JUSTICE SEEKER",
    numerologicalValue: 1,
    element: "Fire",
    rulingPlanet: "Sun",
    archetype: "The Judge, The Truth Speaker",
    coreEssence:
      "You carry the energy of justice, truth, and moral authority. \"J\" represents judgment—not in condemnation, but in discernment between right and wrong.",
    communicationStyle: [
      "Direct and truthful",
      "Can be blunt or harsh",
      "Strong voice and presence",
      "Unafraid of difficult conversations",
    ],
    challenges: [
      "Can be self-righteous or preachy",
      "May be judgmental or critical",
      "Tendency toward black-and-white thinking",
      "Can be inflexible about principles",
      "May alienate others with harsh truths",
      "Difficulty with moral ambiguity",
      "Can be confrontational",
    ],
    strengths: [
      "Strong moral compass",
      "Courageous truth-teller",
      "Natural advocate and defender",
      "Principled and ethical",
      "Fair and just in dealings",
      "Inspirational integrity",
      "Protector of the vulnerable",
    ],
    famousNames: [
      "Jawaharlal (Nehru – India's first Prime Minister, nation builder)",
      "Javed (Akhtar – greatest Bollywood lyricist and poet, Padma Bhushan)",
      "Jaya (Bachchan – National Award winning actress, Rajya Sabha MP)",
      "Jhalkari (Bai – warrior queen, legendary freedom fighter of 1857)",
    ],
    spiritualSignificance:
      "\"J\" represents divine judgment—the universal law of karma and truth. You're here to demonstrate that truth ultimately prevails and justice must be served.",
    mantra: "I speak truth with compassion. My justice includes mercy. I stand for what is right.",
    howToMaximize: [
      "Balance justice with mercy",
      "Practice compassion alongside truth-telling",
      "Allow for human imperfection",
      "Choose your battles wisely",
      "Remember that grace is also justice",
    ],
  },

  K: {
    letter: "K",
    title: "THE TRANSFORMER",
    numerologicalValue: 2,
    element: "Water",
    rulingPlanet: "Moon",
    archetype: "The Alchemist, The Change Agent",
    coreEssence:
      "You carry the energy of transformation, intuition, and emotional depth. \"K\" represents the power to transform darkness into light, pain into wisdom.",
    communicationStyle: [
      "Intense and penetrating",
      "Reads beneath words",
      "Can be indirect or strategic",
      "Comfortable with difficult emotions",
    ],
    challenges: [
      "Can be emotionally intense or overwhelming",
      "May struggle with boundaries",
      "Tendency toward emotional extremes",
      "Can be secretive or manipulative",
      "May experience deep lows",
      "Can be controlling",
      "Difficulty with lightness",
    ],
    strengths: [
      "Powerful transformational abilities",
      "Deeply intuitive and psychic",
      "Emotionally courageous",
      "Natural healer and guide",
      "Resilient through adversity",
      "Magnetic personality",
      "Sees beyond surface appearances",
    ],
    famousNames: [
      "Kapil (Dev – World Cup winning cricket captain, Padma Bhushan)",
      "Kumar (Mangalam Birla – Aditya Birla Group chairman)",
      "Kalpana (Chawla – first Indian woman in space, national icon)",
      "Kiran (Bedi – first female IPS officer, India's most celebrated cop)",
    ],
    spiritualSignificance:
      "\"K\" represents kundalini energy—the transformative force that rises through challenges. You're here to show that transformation is the path to enlightenment.",
    mantra: "I transform all experiences into wisdom. My depth is my gift. I embrace change.",
    howToMaximize: [
      "Balance intensity with lightness",
      "Use your power to empower, not control",
      "Practice healthy emotional boundaries",
      "Allow joy and playfulness",
      "Trust the transformation process",
    ],
  },

  L: {
    letter: "L",
    title: "THE LOVER",
    numerologicalValue: 3,
    element: "Water",
    rulingPlanet: "Venus",
    archetype: "The Romantic, The Artist",
    coreEssence:
      "You carry the energy of love, beauty, and harmony. \"L\" represents the language of love—you see and create beauty in all things.",
    communicationStyle: [
      "Gentle and diplomatic",
      "Uses metaphor and poetry",
      "Avoids harsh words",
      "Focuses on emotional connection",
    ],
    challenges: [
      "Can be overly romantic or idealistic",
      "May lose self in relationships",
      "Tendency toward codependency",
      "Can avoid conflict to a fault",
      "May be overly concerned with appearances",
      "Can be indecisive",
      "Difficulty with harsh realities",
    ],
    strengths: [
      "Naturally loving and affectionate",
      "Artistic and creative",
      "Diplomatic and harmonious",
      "Excellent at relationships",
      "Aesthetic sensibility",
      "Compassionate and kind",
      "Brings beauty to the world",
    ],
    famousNames: [
      "Lata (Mangeshkar – nightingale of India, Bharat Ratna music goddess)",
      "Lakshmi (Mittal – world's largest steel empire, global billionaire)",
      "Leela (Samson – celebrated classical dancer, former CBFC chairperson)",
      "Laxmi (Agarwal – acid attack survivor, national women's rights champion)",
    ],
    spiritualSignificance:
      "\"L\" represents divine love, the creative force of the universe. You're here to demonstrate that love is not just emotion but the fundamental fabric of reality.",
    mantra: "I am love embodied. Beauty flows through me. I create harmony wherever I go.",
    howToMaximize: [
      "Balance giving love with receiving it",
      "Maintain self within relationships",
      "Accept that conflict can be healthy",
      "Use your aesthetic sense purposefully",
      "Remember that love sometimes requires boundaries",
    ],
  },

  M: {
    letter: "M",
    title: "THE MOTHER",
    numerologicalValue: 4,
    element: "Earth",
    rulingPlanet: "Mars",
    archetype: "The Nurturer, The Foundation",
    coreEssence:
      "You carry the energy of nurturing, grounding, and maternal care. \"M\" represents the mother principle—you provide sustenance, security, and unconditional support.",
    communicationStyle: [
      "Gentle and supportive",
      "Practical and advice-giving",
      "May be indirect to avoid hurting feelings",
      "Focuses on care and concern",
    ],
    challenges: [
      "Can be overprotective or smothering",
      "May enable dependency",
      "Tendency toward martyrdom",
      "Can be controlling \"for your own good\"",
      "May neglect own needs",
      "Can be stubborn",
      "Difficulty letting go",
    ],
    strengths: [
      "Deeply nurturing and caring",
      "Provides stability and security",
      "Practical and resourceful",
      "Patient and enduring",
      "Strong protective instincts",
      "Creates safe spaces",
      "Reliable and consistent",
    ],
    famousNames: [
      "Mukesh (Ambani – Asia's richest man, Reliance Industries empire)",
      "Mahendra (Singh Dhoni – World Cup captain, greatest cricket finisher)",
      "Madhuri (Dixit – Bollywood's dancing queen, Padma Bhushan awardee)",
      "Mithali (Raj – India's greatest women's cricket captain ever)",
    ],
    spiritualSignificance:
      "\"M\" represents the Divine Mother, the womb of creation, and the sustaining force of life. You're here to embody divine maternal love.",
    mantra: "I nurture with wisdom. My care empowers. I am worthy of receiving care too.",
    howToMaximize: [
      "Balance giving with receiving",
      "Allow others to stand on their own",
      "Practice self-care without guilt",
      "Let go when it's time",
      "Nurture your own dreams too",
    ],
  },

  N: {
    letter: "N",
    title: "THE VISIONARY",
    numerologicalValue: 5,
    element: "Air",
    rulingPlanet: "Mercury",
    archetype: "The Dreamer, The Idealist",
    coreEssence:
      "You carry the energy of imagination, intuition, and higher vision. \"N\" represents the bridge between reality and possibility—you see what could be.",
    communicationStyle: [
      "Poetic and metaphorical",
      "Sometimes indirect or vague",
      "Emotionally expressive",
      "Focuses on feelings and possibilities",
    ],
    challenges: [
      "Can be impractical or unrealistic",
      "May escape into fantasy",
      "Tendency toward confusion or vagueness",
      "Can be overly sensitive",
      "May struggle with boundaries",
      "Can be escapist (substances, sleep, etc.)",
      "Difficulty with harsh realities",
    ],
    strengths: [
      "Highly intuitive and psychic",
      "Creative and imaginative",
      "Visionary thinking",
      "Compassionate and empathetic",
      "Artistic sensibility",
      "Inspires with possibility",
      "Natural dreamer and creator",
    ],
    famousNames: [
      "Narendra (Modi – Prime Minister of India, world's most followed leader)",
      "Narayana (Murthy – Infosys founder, father of Indian IT industry)",
      "Nita (Ambani – founder Reliance Foundation, IOC member, cultural patron)",
      "Nandita (Das – acclaimed actress and director, Cannes jury member)",
    ],
    spiritualSignificance:
      "\"N\" represents Neptune energy, divine imagination, and the dissolution of boundaries between self and cosmos. You're here to show that reality is more than what we see.",
    mantra: "My imagination creates reality. I ground my visions. I trust my intuition.",
    howToMaximize: [
      "Ground your visions in practical steps",
      "Balance idealism with realism",
      "Protect your sensitive nature",
      "Use imagination purposefully",
      "Create rather than just dream",
    ],
  },

  O: {
    letter: "O",
    title: "THE SAGE",
    numerologicalValue: 7,
    element: "Water",
    rulingPlanet: "Ketu (South Node)",
    archetype: "The Wise One, The Teacher",
    coreEssence:
      "You carry the energy of wisdom, completion, and cosmic understanding. \"O\" represents the circle—wholeness, infinity, and the eternal cycle.",
    communicationStyle: [
      "Thoughtful and measured",
      "Teaching through stories and parables",
      "Can be abstract or theoretical",
      "Focuses on meaning and lessons",
    ],
    challenges: [
      "Can be detached or aloof",
      "May seem superior or \"above it all\"",
      "Tendency toward isolation",
      "Can be overly philosophical",
      "May struggle with practical matters",
      "Can be preachy",
      "Difficulty with emotional expression",
    ],
    strengths: [
      "Naturally wise and knowledgeable",
      "Sees the bigger picture",
      "Excellent teacher and mentor",
      "Spiritually evolved",
      "Patient and understanding",
      "Holistic perspective",
      "Natural counselor",
    ],
    famousNames: [
      "Om (Puri – legendary character actor, Padma Shri, international acclaim)",
      "Omkar (Salve – prominent cricket administrator and legal luminary)",
      "Omung (Kumar – National Award winning production designer and director)",
      "Oprah (Winfrey – wise guide)",
    ],
    spiritualSignificance:
      "\"O\" represents Om, the primordial sound, completion, and the infinite. You're here to demonstrate that all is one, and wisdom is remembering wholeness.",
    mantra: "I am wisdom embodied. I teach through being. I am complete and whole.",
    howToMaximize: [
      "Balance wisdom with humility",
      "Engage with \"ordinary\" life too",
      "Share knowledge without superiority",
      "Practice emotional connection",
      "Remember that everyone is your teacher too",
    ],
  },

  P: {
    letter: "P",
    title: "THE PIONEER",
    numerologicalValue: 8,
    element: "Fire",
    rulingPlanet: "Saturn",
    archetype: "The Authority, The Master",
    coreEssence:
      "You carry the energy of power, authority, and material mastery. \"P\" represents position, prestige, and the ability to command respect.",
    communicationStyle: [
      "Authoritative and directive",
      "Clear and commanding",
      "May be impersonal or formal",
      "Focuses on outcomes and decisions",
    ],
    challenges: [
      "Can be domineering or authoritarian",
      "May be power-hungry",
      "Tendency toward workaholic behavior",
      "Can be cold or impersonal",
      "May prioritize position over people",
      "Can be controlling",
      "Difficulty with vulnerability",
    ],
    strengths: [
      "Natural authority and leadership",
      "Excellent organizational abilities",
      "Strong strategic mind",
      "Commands respect naturally",
      "Achieves high positions",
      "Financial acumen",
      "Masterful execution",
    ],
    famousNames: [
      "Piyush (Goyal – Union Cabinet Minister, India's railway modernizer)",
      "Prakash (Padukone – India's greatest badminton legend pre Sindhu)",
      "Priyanka (Chopra – global icon, UNICEF Goodwill Ambassador)",
      "PV (Sindhu – Olympic silver medallist, India's badminton queen)",
    ],
    spiritualSignificance:
      "\"P\" represents the father principle, divine authority, and the power to manifest will in material form. You're here to show that true power serves the greater good.",
    mantra: "I wield power with wisdom. My authority serves others. I lead with integrity.",
    howToMaximize: [
      "Balance power with compassion",
      "Lead by serving, not just commanding",
      "Use authority to empower others",
      "Practice vulnerability",
      "Remember that true power is inner",
    ],
  },

  Q: {
    letter: "Q",
    title: "THE QUESTIONER",
    numerologicalValue: 1,
    element: "Air",
    rulingPlanet: "Uranus",
    archetype: "The Rebel, The Unconventional",
    coreEssence:
      "You carry the energy of questioning, uniqueness, and breaking conventions. \"Q\" represents the quest for truth beyond accepted norms.",
    communicationStyle: [
      "Questioning and challenging",
      "Unconventional perspective",
      "May be argumentative",
      "Focuses on \"why\" and \"what if\"",
    ],
    challenges: [
      "Can be contrarian for its own sake",
      "May struggle to fit in anywhere",
      "Tendency toward isolation",
      "Can be argumentative",
      "May reject good advice along with bad",
      "Can be difficult or quarrelsome",
      "Difficulty with authority",
    ],
    strengths: [
      "Original and innovative thinker",
      "Questions limiting beliefs",
      "Courageously unconventional",
      "Intellectually curious",
      "Breaks new ground",
      "Authentic and unique",
      "Inspires independent thinking",
    ],
    famousNames: [
      "Quentin (Tarantino – unconventional filmmaker)",
      "Queen (band – revolutionary music)",
      "Quincy (Jones – innovative producer)",
    ],
    spiritualSignificance:
      "\"Q\" represents the quest for truth beyond convention. You're here to show that evolution requires questioning the status quo.",
    mantra: "I question to find truth. My uniqueness is my gift. I innovate with purpose.",
    howToMaximize: [
      "Question constructively, not destructively",
      "Find your tribe of fellow questioners",
      "Balance rebellion with wisdom",
      "Use uniqueness to serve",
      "Remember that some traditions have value",
    ],
  },

  R: {
    letter: "R",
    title: "THE REFORMER",
    numerologicalValue: 2,
    element: "Earth",
    rulingPlanet: "Moon",
    archetype: "The Healer, The Restorer",
    coreEssence:
      "You carry the energy of restoration, renewal, and reformation. \"R\" represents the power to repair, rebuild, and restore what has been broken.",
    communicationStyle: [
      "Gentle and diplomatic",
      "Focuses on solutions",
      "May avoid direct conflict",
      "Emphasizes hope and possibility",
    ],
    challenges: [
      "Can be codependent",
      "May enable others' dysfunction",
      "Tendency to fix at own expense",
      "Can be overly responsible for others",
      "May struggle with letting go",
      "Can be passive",
      "Difficulty saying no",
    ],
    strengths: [
      "Natural healer and helper",
      "Practical problem-solver",
      "Patient and persistent",
      "Believes in redemption",
      "Excellent at restoration work",
      "Diplomatic and cooperative",
    ],
    famousNames: [
      "Ratan (Tata – India's most respected industrialist and moral compass)",
      "Rahul (Dravid – The Wall of cricket, India's greatest Test batsman)",
      "Rekha (legendary Bollywood actress, timeless style and talent icon)",
      "Rani (Laxmibai – queen of Jhansi, India's greatest warrior woman)",
    ],
    spiritualSignificance:
      "\"R\" represents regeneration, the phoenix rising, and the eternal cycle of death and rebirth. You're here to show that nothing is beyond redemption.",
    mantra: "I restore with wisdom. I heal with boundaries. I renew myself as I renew others.",
    howToMaximize: [
      "Fix yourself before fixing others",
      "Set healthy boundaries",
      "Allow natural consequences",
      "Receive healing too",
      "Know when to let go",
    ],
  },
};

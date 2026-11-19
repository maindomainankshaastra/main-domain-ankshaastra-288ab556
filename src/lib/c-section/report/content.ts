import type { Section } from "./flow.ts";

export interface TextCtx {
  /** "Supriya Gupta & Ankit Gupta" */
  parents: string;
  motherFirst: string;
  phone: string;
  email: string;
  /** "08:00 AM to 06:00 PM" */
  otHours: string;
  windowText: string;
  city: string;
}

/** All fixed wording of the report, corrected (see the "Content Corrections" document). One voice: "we". */
export function textSections(c: TextCtx) {
  const disclaimer: Section = {
    index: "Important Medical Disclaimer", l1: "IMPORTANT", l2: "MEDICAL DISCLAIMER",
    blocks: [
      { t: "callout", title: "Medical safety always takes absolute priority.", text: "This report provides astrological guidance for optimal birth timing within your medically safe window." },
      { t: "ul", items: [
        "Always coordinate with your doctor",
        "Emergency situations require immediate medical response",
        "Doctor's recommendations supersede astrological timing",
        "This is spiritual guidance, not medical advice",
        "All suggested dates and times are within your doctor-approved safe delivery window",
      ] },
    ],
  };

  const welcome: Section = {
    index: "Welcome Message", l1: "WELCOME MESSAGE",
    blocks: [
      { t: "h", text: "Dear Parents" },
      { t: "p", text: "Congratulations on your upcoming blessing! What a sacred and joyous time this is. You're about to welcome a soul into this world, and you've chosen to honor this moment by aligning it with cosmic wisdom, a beautiful gift to give your child." },
      { t: "h", text: "The Purpose of This Report" },
      { t: "p", text: "This report helps you choose the most favorable date and time for your baby's birth from within your doctor-approved window. We read each date through Panchang (tithi, nakshatra, moon sign, lagna) and numerology (Mulank, Bhagyank, Lo Shu Grid), remove the times that traditional practice avoids, and give you clear options to discuss with your doctor." },
    ],
  };

  const cosmic: Section = {
    index: "Why Birth Timing & Birth Date Matters", l1: "WHY BIRTH TIMING &", l2: "BIRTH DATE MATTERS",
    blocks: [
      { t: "h", text: "The Cosmic Blueprint" },
      { t: "p", text: "In Vedic astrology and numerology, the exact moment and date of birth create a unique cosmic snapshot. Astrology reads it as the birth chart (Kundali). Numerology reads it as the Lo Shu Grid." },
      { t: "cols",
        left: { title: "The birth chart (Kundali) maps", items: [
          "Planetary positions at that precise moment",
          "Ascendant (Lagna): the rising sign on the eastern horizon",
          "Moon's position: emotional nature and mind",
          "Nakshatra: lunar mansion, indicating karmic patterns",
          "Dasha periods: life timeline and major events",
          "Yogas: special planetary combinations",
        ] },
        right: { title: "The Lo Shu Grid and numbers map", items: [
          "Mulank (Birth Number): natural traits and instincts",
          "Bhagyank (Destiny Number): life direction and purpose",
          "Missing numbers: karmic lessons and areas to work on",
          "Repeated numbers: traits that are expressed strongly",
          "Number combinations: patterns influencing career, relationships, health and success",
        ] },
      },
    ],
  };

  const science: Section = {
    l1: "WHY BIRTH TIMING &", l2: "BIRTH DATE MATTERS",
    blocks: [
      { t: "h", text: "The Science of Muhurat" },
      { t: "p", text: "Muhurat selection is the ancient practice of choosing auspicious timings. For birth, we check:" },
      { t: "ul", items: [
        "Tithi: the strength of the lunar day. Avoided tithis are removed.",
        "Nakshatra: the auspicious birth star. Gand Mool nakshatras and Gandanta are avoided.",
        "Moon sign: stability of mind and emotions.",
        "Lagna (rising sign): the foundation of personality and health. Gandanta lagna is avoided.",
        "Yoga and Karana: Bhadra (Vishti karana) and the ashubh yogas are avoided.",
        "Inauspicious periods: Rahu Kalam, Yamaganda and Gulika Kalam are kept out of every recommended time.",
        "Numerology of the date: Mulank, Bhagyank and the Lo Shu Grid.",
      ] },
      { t: "h", text: "What We Cannot Control" },
      { t: "ul", items: [
        "Planetary positions in the zodiac (slow-moving planets)",
        "Major transits affecting the period",
        "Your child's fundamental karma",
        "Past-life karmic debts",
        "Inherited tendencies and soul lessons",
        "Universal cycles beyond numbers",
      ] },
    ],
  };

  const balance: Section = {
    l1: "WHY BIRTH TIMING &", l2: "BIRTH DATE MATTERS",
    blocks: [
      { t: "h", text: "The Balance" },
      { t: "p", text: "We work within:" },
      { t: "ul", items: ["Your medically safe window", "Hospital availability", "Doctor's schedule", "Practical logistics"] },
      { t: "p", text: "To find the BEST possible moments that create the strongest foundation for your baby's life." },
    ],
  };

  const chosen: Section = {
    index: "How Your Dates Were Chosen", l1: "HOW YOUR DATES", l2: "WERE CHOSEN",
    blocks: [
      { t: "h", text: "Step 1: Every time is graded" },
      { t: "p", text: "For every date in your window and every time of the day, we look at the tithi, the nakshatra, the moon sign and the date's numerology (Mulank and Bhagyank, shown as a luck %). The average gives one of four grades: Avoided, Neutral, Auspicious or Highly Auspicious." },
      { t: "h", text: "Step 2: Some conditions rule a time out" },
      { t: "p", text: "Gand Mool nakshatras (Ashwini, Ashlesha, Magha, Jyeshtha, Mula, Revati), Gandanta, the avoided tithis (Chaturthi, Navami, Chaturdashi, Amavasya), the weekday's Dagdha tithi, a Mulank or Bhagyank of 8, very low numerology luck, and the Moon in Scorpio with an avoided nakshatra." },
      { t: "h", text: "Step 3: Every recommended time is cleaned" },
      { t: "p", text: "We remove Rahu Kalam, Yamaganda, Gulika Kalam, Bhadra (Vishti karana), the ashubh yogas and Gandanta lagna. Panchak is shown as a caution only." },
      { t: "h", text: "Step 4: It must be practical" },
      { t: "p", text: `Recommended times fall inside your hospital's operation theatre hours (${c.otHours}), are at least 15 minutes long, and are marked when they overlap Abhijit or Vijaya Muhurat.` },
    ],
  };

  const support: Section = {
    index: "Follow-Up & Ongoing Support", l1: "FOLLOW-UP & ONGOING", l2: "SUPPORT",
    blocks: [
      { t: "h", text: "Response Time" },
      { t: "ul", items: ["Urgent (delivery-related): within 2 hours", "General questions: within 24-48 hours"] },
      { t: "h", text: "Emergency Delivery Protocol" },
      { t: "p", text: "If you go into labor unexpectedly:" },
      { t: "ul", items: [
        "Prioritize medical safety",
        "Note the exact birth time: ask the hospital staff to note the precise time",
        "After delivery: send us the actual birth details",
        "We'll provide: emergency chart analysis and name suggestions within 48 hours",
      ] },
      { t: "callout", title: "Emergency Hotline", text: `${c.phone}  (available 24/7 during your due date window)` },
    ],
  };

  const postBirth: Section = {
    index: "Post Birth Update Form", l1: "POST BIRTH", l2: "UPDATE FORM",
    blocks: [
      { t: "p", text: "Please send us these details after delivery.", center: true },
      { t: "h", text: "Baby Birth Update" },
      { t: "ul", items: ["Actual date of birth: ______________________", "Actual time of birth: ______________________", "Actual place of birth: ______________________", "Baby's weight: ______________________", "Baby's health: ______________________"] },
      { t: "h", text: "Was it the recommended date and time?" },
      { t: "ul", items: ["Yes, as planned", "Close, within 30 minutes", "No, emergency delivery (natural timing)"] },
      { t: "h", text: "Send to" },
      { t: "p", text: `WhatsApp / call: ${c.phone}\nEmail: ${c.email}` },
    ],
  };

  const testimonial: Section = {
    index: "Testimonial Request", l1: "TESTIMONIAL", l2: "REQUEST",
    blocks: [
      { t: "h", text: "If you found this report helpful" },
      { t: "p", text: "We'd be grateful if you could share your experience! Your feedback helps other expectant parents find authentic guidance." },
      { t: "h", text: "How to share" },
      { t: "ul", items: ["Google review: use the link on the Connect page", "Instagram: tag @ankshaastra", `Video testimonial: send it on WhatsApp to ${c.phone}`] },
    ],
  };

  const terms: Section = {
    index: "Terms & Understanding", l1: "TERMS &", l2: "UNDERSTANDING",
    blocks: [
      { t: "h", text: "Nature of Service" },
      { t: "cols",
        left: { title: "The report provides", items: ["Numerological analysis and guidance", "Vedic astrological overview", "Spiritual and traditional wisdom", "Parenting recommendations", "Auspicious timing suggestions"] },
        right: { title: "The report does NOT provide", items: ["Medical advice", "Legal counsel", "Guaranteed outcomes", "A replacement for professional consultation"] },
      },
      { t: "h", text: "Medical Disclaimer" },
      { t: "callout", text: "CRITICAL: Medical safety always takes absolute priority." },
      { t: "ul", items: [
        "All suggested dates are within your medically approved window",
        "Doctor's recommendations supersede astrological timing",
        "Emergency situations require immediate medical response",
        "This guidance complements, never replaces, medical care",
        "Consult a pediatrician for all health matters",
        "Spiritual remedies supplement medical care, they don't replace it",
      ] },
      { t: "h", text: "Astrological & Numerological Guidance" },
      { t: "ul", items: [
        "Based on classical Vedic and numerological principles",
        "Interpretations represent traditional wisdom and our professional analysis",
        "Individual results and experiences vary",
        "Astrology and numerology indicate tendencies, not certainties",
        "Free will and parenting significantly influence outcomes",
        "Environmental factors play a crucial role in development",
      ] },
      { t: "h", text: "Accuracy & Limitations" },
      { t: "ul", items: [
        "Birth chart calculations are based on the provided location and time",
        "Timing accuracy depends on hospital execution",
        "Unforeseen circumstances may require flexibility",
        "Emergency deliveries follow natural timing",
        "We cannot control external factors (hospital, doctor availability)",
      ] },
      { t: "h", text: "Liability" },
      { t: "p", text: "The consultant is not responsible for:" },
      { t: "ul", items: ["Medical complications or outcomes", "Hospital scheduling or coordination issues", "Emergency situations requiring deviation from plan", "Individual interpretation or application of guidance", "Decisions made solely based on this report"] },
      { t: "h", text: "Parents' Knowledge" },
      { t: "ul", items: [
        "Parents retain full responsibility for all decisions",
        "Parents will consult appropriate professionals (medical, legal, etc.)",
        "This is spiritual guidance, not a deterministic prediction",
        "Parents use this information at their own discretion",
      ] },
      { t: "h", text: "Intellectual Property" },
      { t: "ul", items: [
        "This report is prepared exclusively for the named parents",
        "For personal, private use only",
        "Do not share publicly, reproduce or distribute",
        "Sharing screenshots or excerpts requires permission",
        "Copyright remains with Ankshaastra",
      ] },
      { t: "h", text: "Privacy & Confidentiality" },
      { t: "ul", items: [
        "Your personal information is confidential",
        "Stored securely for future reference and follow-ups",
        "Never shared with third parties without consent",
        "You may request data deletion after completion",
      ] },
      { t: "h", text: "Consent" },
      { t: "p", text: "By using this report and services, you acknowledge:" },
      { t: "ul", items: [
        "You have read and understood these terms",
        "You agree to prioritize medical safety",
        "You accept these are traditional practices, not guarantees",
        "You retain full responsibility for your decisions",
        "You will use this guidance wisely and appropriately",
      ] },
      { t: "h", text: "Feedback & Grievances" },
      { t: "p", text: `We value your feedback! For concerns: ${c.phone} | ${c.email}. We respond within 48 hours.` },
    ],
  };

  const agreement: Section = {
    index: "Agreement & Mutual Understanding", l1: "AGREEMENT &", l2: "MUTUAL UNDERSTANDING",
    blocks: [
      { t: "h", text: "What This Consultation Offers" },
      { t: "p", text: "This C-Section Date Selection report provides Vedic astrology and numerology guidance to help you choose the most favorable birth date and time for your child from the options available. It is designed to help you:" },
      { t: "ul", items: [
        "Identify the most numerologically and astrologically favorable dates from your doctor-approved window",
        "Understand how each date's Mulank and Bhagyank may influence your child's personality and life path",
        "Know which times of each date to choose and which to avoid",
        "Compare the energetic strengths of each date to make an informed decision",
        "Coordinate the chosen date and time with your medical team's availability",
        "Make a confident, informed decision aligned with both medical safety and cosmic timing",
      ] },
      { t: "h", text: "Realistic Expectations" },
      { t: "p", text: "The effectiveness of date selection depends significantly on:" },
      { t: "ul", items: [
        "Medical safety and your doctor's final approval always come first",
        "The date chosen being genuinely available within your hospital's and doctor's schedule",
        "Understanding that numerology offers favorable timing, not guaranteed outcomes",
        "Your openness to the guidance provided within realistic medical constraints",
      ] },
      { t: "p", text: "Many families find it reassuring to choose a date with clarity and intention." },
      { t: "h", text: "Your Responsibility" },
      { t: "ul", items: [
        "Confirm all suggested dates and times with your doctor before finalizing",
        "Medical decisions must always be made with your doctor, not based on numerology alone",
        "Communicate your doctor's actual availability window accurately so recommendations are realistic",
        "Approach the guidance with openness while keeping medical safety as the top priority",
        "Understand that no date guarantees a specific life outcome for your child",
      ] },
      { t: "h", text: "Our Responsibility" },
      { t: "ul", items: [
        "Provide honest, careful analysis of each date based on traditional Vedic and numerological principles",
        "Rank the dates using Panchang (tithi, nakshatra, moon sign) and numerology, and show the reasons",
        "Clearly explain the significance of each date and time slot",
        "Be available for clarification and follow-up questions during consultation",
        "Maintain complete confidentiality of your personal and medical details",
        "We do not provide medical advice: delivery timing decisions must be confirmed with your doctor",
      ] },
    ],
  };

  const faq: Section = {
    index: "Frequently Asked Questions", l1: "FREQUENTLY ASKED", l2: "QUESTIONS",
    blocks: [
      { t: "qa", q: "Q1: Why are you giving 3 dates instead of just one?", a: "A: Hospitals and doctors work within limited scheduling windows, so we analyze every date in your available range and rank them using Panchang and numerology. This gives you flexibility to choose the best option that also fits your doctor's availability." },
      { t: "qa", q: "Q2: Which factor matters most when selecting a C-section date?", a: "A: No single factor decides it. Every time of every date is graded on four things: tithi, nakshatra, moon sign and the date's numerology (Mulank and Bhagyank). Some conditions rule a time out completely: Gand Mool and Gandanta, avoided tithis, and Rahu Kalam, Yamaganda and Gulika. The time of birth matters because the Moon's nakshatra and sign, and the rising sign (Lagna), keep changing through the day." },
      { t: "qa", q: "Q3: Can the exact time of delivery be adjusted too, or just the date?", a: "A: Yes, where medically possible. The time of birth changes the Moon's position, the rising sign and which inauspicious periods are running. We give shubh time windows for each date and the times to avoid. Your doctor's medical judgment on timing during surgery always takes priority." },
      { t: "qa", q: "Q4: What if the doctor can only confirm the date, not the exact time?", a: "A: That's very common. In that case, we recommend the best date primarily, and note a preferred time range as a secondary guide, useful if your doctor is able to accommodate it, but not essential." },
      { t: "qa", q: "Q5: Is one date always clearly better than the others?", a: "A: Not always. Sometimes two dates are close in strength, each with different advantages (for example, one better for career potential, another for relationships and emotional temperament). We explain the character of each date so you can choose based on what matters most to your family." },
      { t: "qa", q: "Q6: Does the baby's name still matter if we choose a strong birth date?", a: "A: Yes. The birth date sets the foundational Mulank and Bhagyank. The name is chosen afterward to complement those numbers. Both work together, not one instead of the other." },
      { t: "qa", q: "Q7: What if none of the 3 dates feel strong?", a: "A: We will be honest about this rather than force a positive spin. If needed, we'll explain which of the available dates is the \"least challenging\" option, and suggest remedies (name correction, gemstones) that can help balance a difficult number." },
      { t: "qa", q: "Q8: Can we request additional dates beyond the original 3?", a: "A: Yes. If your doctor can offer more options within a safe medical window, share them with us and we can expand the analysis." },
      { t: "qa", q: "Q9: Does an early or late delivery within the same day change the result?", a: "A: Yes. The numerology of a date stays the same all day, but the Panchang does not. The tithi, nakshatra, moon sign and lagna change during the day, and Rahu Kalam, Yamaganda and Gulika fall at fixed times. So some times within the same date are stronger than others. This is why we give clean shubh time windows and the times to avoid for every date." },
      { t: "qa", q: "Q10: How soon before the scheduled date should we finalize this decision?", a: "A: Ideally at least one week before the first date in your window, so you have time to confirm with your doctor and prepare. Last-minute changes to hospital scheduling are not always possible." },
    ],
  };

  const reminders: Section = {
    index: "Important Reminders", l1: "IMPORTANT", l2: "REMINDERS",
    blocks: [
      { t: "h", text: "For Best Results" },
      { t: "ul", items: [
        "CONFIRM WITH YOUR DOCTOR: medical safety always comes first",
        "DECIDE EARLY: hospital scheduling has limited flexibility",
        "STAY OPEN: the strongest date may not be your originally preferred one",
        "TRUST THE PROCESS: numerology offers guidance, not certainty",
        "COMBINE WITH NAME: pair the birth date with an aligned name for best synergy",
      ] },
      { t: "h", text: "What Blocks Results" },
      { t: "ul", items: [
        "Choosing a date without medical confirmation",
        "Ignoring the guidance and picking based on convenience alone",
        "Deciding too close to the delivery date, limiting hospital flexibility",
        "Expecting the date alone to guarantee life outcomes",
      ] },
    ],
  };

  const mantra: Section = {
    index: "Success Mantra", l1: "SUCCESS", l2: "MANTRA",
    blocks: [
      { t: "gap", h: 40 },
      { t: "callout", text: "\"We welcome our child with love, guided by wisdom and grounded in safety. This date and time carry our hopes, and we trust the journey ahead.\"" },
      { t: "p", text: "Chant this daily as you approach the delivery date.", center: true, muted: true },
    ],
  };

  const finalWord: Section = {
    index: "Final Words", l1: "A FINAL WORD", l2: "TO PARENTS",
    blocks: [
      { t: "p", text: "Choosing a birth date is one of the first great acts of love you give your child." },
      { t: "p", text: "Whether you follow numerology closely or simply let it guide your decision alongside your doctor's advice, what matters most is the intention, the care, and the hope you bring into this moment. Your child will carry this beginning with them always." },
      { t: "p", text: "Wishing your little one a life filled with light, purpose, and joy." },
      { t: "gap", h: 14 },
      { t: "p", text: "With divine blessings and deepest respect,\nHimansshu Agarwal\nAstro-Numerologist" },
    ],
  };

  const closing: Section = {
    index: "Closing Blessings", l1: "CLOSING", l2: "BLESSINGS",
    blocks: [
      { t: "h", text: "As You Prepare" },
      { t: "ul", items: [`Rest and nurture yourself, ${c.motherFirst}`, "Prepare emotionally and practically", "Review this report, but don't obsess", "Stay flexible and open", "Trust your intuition as a parent"] },
      { t: "h", text: "In These Final Weeks" },
      { t: "ul", items: ["Coordinate with your medical team", "Medical safety first, always", "Aim for the time, but be flexible", "Note the exact birth time"] },
      { t: "h", text: "On Delivery Day" },
      { t: "ul", items: ["Welcome your baby with joy", "First hours are for bonding, not worrying about astrology", "Send us the actual birth details"] },
      { t: "h", text: "In the Days After" },
      { t: "ul", items: ["Rest and recover", "Enjoy your baby", "We'll help with name finalization", "Don't rush, you have time"] },
    ],
  };

  const wishBaby: Section = {
    index: "What We Wish for Your Baby", l1: "WHAT WE WISH", l2: "FOR YOUR BABY",
    blocks: [
      { t: "p", text: "MAY YOUR BABY BE BLESSED WITH", center: true, muted: true },
      { t: "cols",
        left: { title: "A Heart Full of Love", items: ["Loving and beloved", "Surrounded by harmony and joy", "Serving humanity with compassion", "Creating beauty wherever they go"] },
        right: { title: "A Life of Meaning", items: ["Making the world better", "Living with purpose and integrity"] },
      },
      { t: "cols",
        left: { title: "A Mind of Wisdom", items: ["Learning joyfully", "Thinking creatively", "Speaking truthfully"] },
        right: { title: "A Spirit of Strength", items: ["Resilient through challenges", "Gentle yet powerful", "Balanced in all things"] },
      },
    ],
  };

  const wishParents: Section = {
    index: "What We Wish for You", l1: "WHAT WE WISH", l2: "YOU",
    blocks: [
      { t: "p", text: "MAY YOU BE BLESSED WITH", center: true, muted: true },
      { t: "cols",
        left: { title: "For Mother", items: ["Safe, healthy delivery", "Swift recovery", "Abundant milk and energy", "Joy in motherhood", "Patience in challenges", "Support when needed"] },
        right: { title: "For Father", items: ["Strength to support your family", "Wisdom to guide your child", "Balance of work and family", "Joy in fatherhood", `Partnership with ${c.motherFirst}`] },
      },
      { t: "cols",
        left: { title: "For Your Family", items: ["Harmony and love", "Financial stability", "Health and happiness"] },
        right: { title: "Together", items: ["Spiritual growth together", "Lasting bonds", "Beautiful memories"] },
      },
    ],
  };

  const promise: Section = {
    index: "Our Promise to You", l1: "OUR PROMISE", l2: "TO YOU",
    blocks: [
      { t: "p", text: "We're not just handing you a report and disappearing. We're here for your journey:" },
      { t: "ul", items: ["Questions before delivery? We're here.", "Need last-minute guidance? Call us.", "Emergency delivery? We'll help immediately.", "Name confusion? We'll assist.", "First-year questions? We're available.", "Future consultations? We're honored to continue."] },
      { t: "p", text: "You're not just clients, you're part of the Ankshaastra family." },
      { t: "h", text: "The Ultimate Truth" },
      { t: "p", text: "Beyond all numerology, beyond all astrology, beyond all remedies and recommendations, the ultimate truth is simple:" },
      { t: "callout", title: "YOU WILL BE GREAT PARENTS", text: "Because you cared enough to seek guidance. Because you're reading this entire report carefully. Because you want the best for your child. Because you're willing to learn and grow. That's all that really matters." },
    ],
  };

  const services: Section = {
    index: "Services Offered", l1: "ILLUMINATING LIVES", l2: "THROUGH ANCIENT WISDOM",
    blocks: [
      { t: "h", text: "Services Offered" },
      { t: "ul", items: ["Lal Kitab Remedies & Consultation", "Name Correction Reports", "Marriage Compatibility & Matching", "Business Name Alignment", "100% Original Rudraksha and Crystal Bracelets"] },
    ],
  };

  const welcomeBaby: Section = {
    index: "As You Welcome Your Baby", l1: "AS YOU WELCOME", l2: "YOUR BABY",
    blocks: [
      { t: "gap", h: 6 },
      { t: "p", text: "Hold your baby close.\nBreathe in that newness.\nLook into those eyes.\nWhisper your love.\nWelcome this ancient soul in a tiny body.\nCommit to being a guide, not a controller.\nPromise to nurture their uniqueness.\nVow to let them be themselves.\nAnd know that they chose YOU.", center: true },
      { t: "gap", h: 10 },
      { t: "p", text: "Of all the souls in the universe, of all the possible parents, this baby chose you. Your love called your baby here. Your readiness welcomed them. Your family is their perfect home.", center: true },
    ],
  };

  const finalBlessing: Section = {
    index: "Final Blessing", l1: "FINAL", l2: "BLESSING",
    blocks: [
      { t: "p", text: "Om Sarve Bhavantu Sukhinah\nSarve Santu Niramayah\nSarve Bhadrani Pashyantu\nMa Kashchid Dukhabhag Bhavet", center: true },
      { t: "p", text: "May all be happy,\nMay all be healthy,\nMay all see goodness,\nMay none suffer.", center: true },
      { t: "p", text: "May your baby's arrival bring light to your lives, love to your hearts, grace to your home, blessings beyond measure, and joy that never ends.", center: true },
      { t: "gap", h: 10 },
      { t: "p", text: "With deepest respect, profound blessings, and heartfelt gratitude for the privilege of serving you,\nHimansshu Agarwal\nAstro-Numerologist\nAnkshaastra - Empower Your Name", center: true },
    ],
  };

  return { disclaimer, welcome, cosmic, science, balance, chosen, support, postBirth, testimonial, terms, agreement, faq, reminders, mantra, finalWord, closing, wishBaby, wishParents, promise, services, welcomeBaby, finalBlessing };
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
}

export const BLOG_CATEGORIES = [
  "All",
  "Numerology",
  "Name Correction",
  "Lal Kitab",
  "Vastu",
  "Baby Names",
  "Kundali",
] as const;

export const blogPosts: BlogPost[] = [
  {
    id: "power-of-numbers-in-your-life",
    title: "The Hidden Power of Numbers in Your Daily Life",
    excerpt: "Discover how numerology influences your decisions, relationships, and career path. Learn to decode the vibrations that shape your destiny.",
    content: `Numbers are not just mathematical symbols — they carry vibrations that influence every aspect of our existence. From the day you were born, specific numbers have been guiding your path.\n\n## Understanding Your Life Path Number\n\nYour Life Path Number is derived from your date of birth and reveals your core personality traits, strengths, and challenges. It's the most important number in your numerology chart.\n\nTo calculate it, reduce your birth date to a single digit (or master number 11, 22, 33). For example, if you were born on 15th March 1990:\n- Day: 1+5 = 6\n- Month: 3\n- Year: 1+9+9+0 = 19 → 1+9 = 10 → 1+0 = 1\n- Life Path: 6+3+1 = 10 → 1+0 = **1**\n\n## How Numbers Affect Your Daily Choices\n\nEvery number from 1-9 has a unique vibration. When you understand these vibrations, you can make more aligned decisions about career changes, relationships, and even daily routines.\n\n## Practical Tips\n\n1. **Check your phone number** — it affects your communication energy\n2. **Your house number** influences family harmony\n3. **Vehicle numbers** can impact travel safety\n4. **Bank account numbers** affect financial flow`,
    category: "Numerology",
    author: "Himansshu Agarwal",
    date: "2026-02-28",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
    tags: ["numerology", "life path", "daily life"],
  },
  {
    id: "name-correction-success-stories",
    title: "How Name Correction Transformed These 5 Lives",
    excerpt: "Real stories of people who experienced dramatic changes in career, health, and relationships after correcting their names through numerology.",
    content: `Name correction is one of the most powerful tools in numerology. A small change in spelling can shift the vibrations of your entire life.\n\n## Story 1: From Struggles to Success\n\nRahul (original spelling) was facing constant career setbacks. After analysis, we found his name vibration was 4 — associated with obstacles. By changing to Raahul, his vibration shifted to 6, bringing harmony and growth.\n\n## Story 2: Health Transformation\n\nPriya was dealing with chronic health issues. Her name number was creating conflicting vibrations with her birth number. A simple adjustment brought alignment.\n\n## The Science Behind Name Correction\n\nEvery letter has a numerical value. When the total vibration of your name aligns with your birth numbers, life flows more smoothly. Misaligned vibrations create friction in specific areas of life.\n\n## Is Name Correction Right for You?\n\nIf you're experiencing repeated patterns of difficulty in any area of life, a name analysis can reveal whether your name vibration is contributing to the pattern.`,
    category: "Name Correction",
    author: "Himansshu Agarwal",
    date: "2026-02-20",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    tags: ["name correction", "success stories", "transformation"],
  },
  {
    id: "lal-kitab-remedies-for-prosperity",
    title: "5 Simple Lal Kitab Remedies for Financial Prosperity",
    excerpt: "Ancient Lal Kitab remedies that can help attract abundance and remove financial obstacles from your life.",
    content: `Lal Kitab, the ancient "Red Book" of astrology, offers simple yet powerful remedies that can be performed by anyone to improve their financial situation.\n\n## Remedy 1: Copper Coin in Water\n\nKeep a copper coin in a glass of water overnight. In the morning, pour the water at the base of a plant. This strengthens Jupiter's positive influence on wealth.\n\n## Remedy 2: Saffron Tilak\n\nApplying a small saffron tilak on the forehead before leaving for work activates the Sun's energy, which governs authority and success.\n\n## Remedy 3: Feeding Birds\n\nFeeding green-colored food to birds on Wednesdays strengthens Mercury, the planet governing business and communication skills.\n\n## Remedy 4: Sweet Offerings\n\nDistributing sweets or jaggery to children on Thursdays enhances Jupiter's blessings for growth and expansion.\n\n## Remedy 5: Silver Ring\n\nWearing a silver ring on the little finger can strengthen Moon's energy, improving intuition in financial decisions.\n\n## Important Note\n\nThese remedies work best when combined with a proper Lal Kitab chart analysis. Consult an expert for personalized guidance.`,
    category: "Lal Kitab",
    author: "Himansshu Agarwal",
    date: "2026-02-14",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80",
    tags: ["lal kitab", "remedies", "prosperity", "finance"],
  },
  {
    id: "vastu-tips-home-office",
    title: "Vastu Tips to Energize Your Home Office",
    excerpt: "Working from home? Apply these Vastu principles to your workspace for better focus, creativity, and career growth.",
    content: `With remote work becoming the norm, your home office Vastu has a direct impact on your productivity and career growth.\n\n## Direction of Your Desk\n\nAlways face **North or East** while working. North brings opportunities (Mercury's direction), and East brings growth and new ideas (Sun's direction).\n\n## Computer Placement\n\nPlace your computer or laptop in the **Southeast** corner of your desk. This zone is governed by Agni (fire element), which powers technology and digital tools.\n\n## Colors for Productivity\n\n- **Light yellow or cream** walls boost concentration\n- **Green accents** reduce stress and improve creativity\n- Avoid **red or dark colors** in the workspace as they create restlessness\n\n## Clutter-Free Zone\n\nVastu emphasizes that clutter blocks energy flow. Keep your desk organized, especially the **Northeast corner** — this is the zone of clarity and wisdom.\n\n## Plants in Your Office\n\nA **money plant** in the Southeast or a **bamboo plant** in the East can activate positive energy for career growth.`,
    category: "Vastu",
    author: "Himansshu Agarwal",
    date: "2026-02-08",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    tags: ["vastu", "home office", "productivity", "workspace"],
  },
  {
    id: "choosing-lucky-baby-name",
    title: "How to Choose a Numerologically Lucky Name for Your Baby",
    excerpt: "A step-by-step guide to selecting a baby name that aligns with your child's birth numbers for a prosperous life.",
    content: `Choosing your baby's name is one of the most important decisions you'll make as a parent. In numerology, a name carries vibrations that influence personality, health, and fortune throughout life.\n\n## Step 1: Calculate the Birth Numbers\n\nFirst, determine your baby's **Driver Number** (birth date reduced to single digit) and **Conductor Number** (full birth date reduced). These numbers reveal innate qualities and life direction.\n\n## Step 2: Find Compatible Name Numbers\n\nEach letter has a value (A=1, B=2... I=9, J=1...). The total of all letters in the name should create a vibration that's compatible with the birth numbers.\n\n## Favorable Combinations\n\n- Birth number 1: Names totaling 1, 2, 3, or 9\n- Birth number 2: Names totaling 1, 2, or 7\n- Birth number 3: Names totaling 1, 3, 5, or 9\n- Birth number 5: Names totaling 1, 5, 6, or 9\n\n## Common Mistakes to Avoid\n\n1. Don't choose a name just because it sounds nice — check the vibration\n2. Avoid names with silent letters — they create hidden obstacles\n3. Don't ignore the surname — total name vibration matters\n\n## Get Expert Help\n\nFor the most accurate analysis, consult a numerology expert who can consider all planetary influences along with the name vibration.`,
    category: "Baby Names",
    author: "Himansshu Agarwal",
    date: "2026-01-30",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80",
    tags: ["baby names", "lucky names", "parenting", "numerology"],
  },
  {
    id: "kundali-reading-guide",
    title: "Understanding Your Kundali: A Beginner's Guide",
    excerpt: "Learn the basics of reading a Kundali (birth chart) and understand how planetary positions at your birth influence your life path.",
    content: `A Kundali, or birth chart, is a celestial snapshot of the sky at the exact moment you were born. It maps the positions of all nine planets across twelve houses, each governing different aspects of life.\n\n## The 12 Houses Explained\n\n1. **1st House (Lagna)**: Self, personality, physical body\n2. **2nd House**: Wealth, family, speech\n3. **3rd House**: Siblings, courage, communication\n4. **4th House**: Mother, property, mental peace\n5. **5th House**: Children, education, creativity\n6. **6th House**: Enemies, diseases, daily work\n7. **7th House**: Marriage, partnerships, business\n8. **8th House**: Longevity, sudden events, inheritance\n9. **9th House**: Luck, father, spiritual growth\n10. **10th House**: Career, status, public life\n11. **11th House**: Income, gains, social network\n12. **12th House**: Expenses, foreign travel, liberation\n\n## Key Planets and Their Influence\n\nSun governs authority, Moon controls mind, Mars drives energy, Mercury rules communication, Jupiter brings wisdom, Venus brings love, Saturn teaches discipline, and Rahu-Ketu represent karmic patterns.\n\n## Why Get a Personalized Kundali?\n\nA generic horoscope considers only your Sun sign. A personalized Kundali analyzes all planetary positions specific to your birth, giving far more accurate insights and predictions.`,
    category: "Kundali",
    author: "Himansshu Agarwal",
    date: "2026-01-22",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1505506874110-6a7a69069a08?w=800&q=80",
    tags: ["kundali", "birth chart", "astrology", "beginners"],
  },
];

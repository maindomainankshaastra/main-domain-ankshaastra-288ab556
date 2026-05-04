import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Calculator, Star, Heart, Sparkles, Gem, Hash, Type } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type CalculatorType =
  | "numerology"
  | "zodiac"
  | "compatibility"
  | "gemstone"
  | "lucky-number"
  | "name-number";

const zodiacSymbols: Record<string, string> = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓",
};

const CalculatorPage = () => {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>("numerology");
  const [birthDate, setBirthDate] = useState("");
  const [name, setName] = useState("");
  const [partnerDate, setPartnerDate] = useState("");
  const [result, setResult] = useState<{ title: string; content: string; mulank?: number; bhagyaank?: number } | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab") as CalculatorType | null;
    const valid: CalculatorType[] = ["numerology", "zodiac", "compatibility", "gemstone", "lucky-number", "name-number"];
    if (tab && valid.includes(tab)) {
      setActiveCalculator(tab);
      setResult(null);
    }
  }, [searchParams]);

  const calculators = [
    { id: "numerology" as const, icon: Calculator, title: "Numerology", description: "Discover your Mulank & Bhagyaank" },
    { id: "zodiac" as const, icon: Star, title: "Zodiac Sign", description: "Find your sun sign" },
    { id: "compatibility" as const, icon: Heart, title: "Compatibility", description: "Check love compatibility" },
    { id: "gemstone" as const, icon: Gem, title: "Lucky Gemstone", description: "Find your power gemstone" },
    { id: "lucky-number" as const, icon: Hash, title: "Lucky Numbers", description: "Today's auspicious numbers" },
    { id: "name-number" as const, icon: Type, title: "Name Number", description: "Numerology of any name" },
  ];

  const reduceToSingleDigit = (num: number): number => {
    while (num > 9 && num !== 11 && num !== 22) {
      num = num.toString().split("").map(Number).reduce((a, b) => a + b, 0);
    }
    return num;
  };

  const calculateNumerology = () => {
    if (!birthDate) return;
    const date = new Date(birthDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Mulank: Sum of date reduced to single digit
    const mulank = reduceToSingleDigit(day);
    
    // Bhagyaank: Sum of date + month + year reduced to single digit
    const totalSum = day + month + year.toString().split("").map(Number).reduce((a, b) => a + b, 0);
    const bhagyaank = reduceToSingleDigit(totalSum);
    
    const mulankMeanings: Record<number, string> = {
      1: "Leadership, independence, originality. You are a born leader with strong willpower.",
      2: "Diplomacy, partnership, sensitivity. You bring harmony and balance to relationships.",
      3: "Creativity, expression, joy. You have natural artistic and communication talents.",
      4: "Stability, hard work, practicality. You build strong foundations in life.",
      5: "Freedom, adventure, change. You embrace new experiences with enthusiasm.",
      6: "Love, responsibility, nurturing. You are the caretaker of family and loved ones.",
      7: "Spirituality, wisdom, introspection. You seek deeper truths and inner knowledge.",
      8: "Power, abundance, success. You are destined for material and spiritual achievements.",
      9: "Compassion, humanitarianism, completion. You serve others with selfless love.",
    };

    const bhagyaankMeanings: Record<number, string> = {
      1: "Your destiny leads you to pioneering achievements and leadership roles.",
      2: "Your fate brings partnerships and collaborative success into your life.",
      3: "Your destiny unfolds through creative expression and joyful communication.",
      4: "Your fate is built on discipline, order, and systematic progress.",
      5: "Your destiny embraces travel, freedom, and transformative experiences.",
      6: "Your fate revolves around home, family, and service to others.",
      7: "Your destiny calls you toward spiritual growth and philosophical pursuits.",
      8: "Your fate leads to authority, wealth, and karmic lessons of power.",
      9: "Your destiny is to complete cycles and contribute to universal good.",
      11: "Master Number - Your destiny holds spiritual leadership and inspiration.",
      22: "Master Builder - Your fate is to manifest grand visions into reality.",
    };

    setResult({
      title: "Your Numerology Profile",
      mulank,
      bhagyaank,
      content: `🔢 **Mulank (Birth Number): ${mulank}**\n${mulankMeanings[mulank] || "Your path is unique."}\n\n🌟 **Bhagyaank (Destiny Number): ${bhagyaank}**\n${bhagyaankMeanings[bhagyaank] || "Your destiny is special."}${name ? `\n\n👤 Name: ${name}` : ""}`,
    });
  };

  const calculateZodiac = () => {
    if (!birthDate) return;
    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const signs = [
      { name: "Capricorn", start: [12, 22], end: [1, 19], element: "Earth", ruling: "Saturn" },
      { name: "Aquarius", start: [1, 20], end: [2, 18], element: "Air", ruling: "Uranus" },
      { name: "Pisces", start: [2, 19], end: [3, 20], element: "Water", ruling: "Neptune" },
      { name: "Aries", start: [3, 21], end: [4, 19], element: "Fire", ruling: "Mars" },
      { name: "Taurus", start: [4, 20], end: [5, 20], element: "Earth", ruling: "Venus" },
      { name: "Gemini", start: [5, 21], end: [6, 20], element: "Air", ruling: "Mercury" },
      { name: "Cancer", start: [6, 21], end: [7, 22], element: "Water", ruling: "Moon" },
      { name: "Leo", start: [7, 23], end: [8, 22], element: "Fire", ruling: "Sun" },
      { name: "Virgo", start: [8, 23], end: [9, 22], element: "Earth", ruling: "Mercury" },
      { name: "Libra", start: [9, 23], end: [10, 22], element: "Air", ruling: "Venus" },
      { name: "Scorpio", start: [10, 23], end: [11, 21], element: "Water", ruling: "Pluto" },
      { name: "Sagittarius", start: [11, 22], end: [12, 21], element: "Fire", ruling: "Jupiter" },
    ];

    let zodiac = signs.find((sign) => {
      if (sign.start[0] === 12) {
        return (month === 12 && day >= sign.start[1]) || (month === 1 && day <= sign.end[1]);
      }
      return (
        (month === sign.start[0] && day >= sign.start[1]) ||
        (month === sign.end[0] && day <= sign.end[1])
      );
    });

    if (!zodiac) zodiac = signs[0];

    setResult({
      title: `${zodiacSymbols[zodiac.name]} You are a ${zodiac.name}`,
      content: `Element: ${zodiac.element} | Ruling Planet: ${zodiac.ruling}\n\nAs a ${zodiac.name}, you embody the qualities of the ${zodiac.element} element. Your ruling planet ${zodiac.ruling} influences your personality, making you unique in your approach to life.`,
    });
  };

  const calculateCompatibility = () => {
    if (!birthDate || !partnerDate) return;
    
    const getLifePath = (date: string) => {
      const digits = date.replace(/-/g, "").split("").map(Number);
      let sum = digits.reduce((a, b) => a + b, 0);
      while (sum > 9) {
        sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
      }
      return sum;
    };

    const yourPath = getLifePath(birthDate);
    const partnerPath = getLifePath(partnerDate);
    
    const compatible = [
      [1, 5], [1, 7], [2, 4], [2, 8], [3, 5], [3, 6], [3, 9],
      [4, 2], [4, 8], [5, 1], [5, 3], [5, 7], [6, 3], [6, 9],
      [7, 1], [7, 5], [8, 2], [8, 4], [9, 3], [9, 6],
    ];

    const isCompatible = compatible.some(
      ([a, b]) => (a === yourPath && b === partnerPath) || (a === partnerPath && b === yourPath)
    ) || yourPath === partnerPath;

    const percentage = isCompatible ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 30) + 45;

    setResult({
      title: `Compatibility Score: ${percentage}%`,
      content: `Your Life Path: ${yourPath} | Partner's Life Path: ${partnerPath}\n\n${
        percentage >= 75
          ? "Excellent match! Your energies complement each other beautifully. This relationship has strong potential for lasting harmony and mutual growth."
          : percentage >= 60
          ? "Good compatibility! While there may be some challenges, your connection has the potential to grow stronger with understanding and compromise."
          : "This match requires effort. Different life paths can lead to misunderstandings, but with patience and communication, you can create a meaningful bond."
      }`,
    });
  };

  const handleCalculate = () => {
    switch (activeCalculator) {
      case "numerology":
        calculateNumerology();
        break;
      case "zodiac":
        calculateZodiac();
        break;
      case "compatibility":
        calculateCompatibility();
        break;
      case "gemstone":
        calculateGemstone();
        break;
      case "lucky-number":
        calculateLuckyNumber();
        break;
      case "name-number":
        calculateNameNumber();
        break;
    }
  };

  // Pythagorean letter values for name numerology
  const letterValues: Record<string, number> = {
    A: 1, J: 1, S: 1,
    B: 2, K: 2, T: 2,
    C: 3, L: 3, U: 3,
    D: 4, M: 4, V: 4,
    E: 5, N: 5, W: 5,
    F: 6, O: 6, X: 6,
    G: 7, P: 7, Y: 7,
    H: 8, Q: 8, Z: 8,
    I: 9, R: 9,
  };

  const calculateNameValue = (input: string): number => {
    const sum = input
      .toUpperCase()
      .split("")
      .filter((ch) => letterValues[ch])
      .reduce((acc, ch) => acc + letterValues[ch], 0);
    return reduceToSingleDigit(sum);
  };

  const calculateGemstone = () => {
    if (!birthDate) return;
    const date = new Date(birthDate);
    const day = date.getDate();
    const mulank = reduceToSingleDigit(day);

    const gems: Record<number, { stone: string; planet: string; color: string; benefit: string }> = {
      1: { stone: "Ruby (Manik)", planet: "Sun (Surya)", color: "Deep Red", benefit: "Boosts confidence, leadership, vitality, and authority." },
      2: { stone: "Pearl (Moti)", planet: "Moon (Chandra)", color: "Milky White", benefit: "Calms the mind, balances emotions, improves intuition." },
      3: { stone: "Yellow Sapphire (Pukhraj)", planet: "Jupiter (Guru)", color: "Golden Yellow", benefit: "Brings wisdom, prosperity, and spiritual growth." },
      4: { stone: "Hessonite (Gomed)", planet: "Rahu", color: "Honey Brown", benefit: "Removes confusion, protects from negativity, sharpens intellect." },
      5: { stone: "Emerald (Panna)", planet: "Mercury (Budh)", color: "Vivid Green", benefit: "Enhances communication, intelligence, business success." },
      6: { stone: "Diamond (Heera)", planet: "Venus (Shukra)", color: "Brilliant White", benefit: "Attracts love, luxury, charm, and artistic expression." },
      7: { stone: "Cat's Eye (Lehsunia)", planet: "Ketu", color: "Greenish Gold", benefit: "Provides spiritual insight, intuition, and protection." },
      8: { stone: "Blue Sapphire (Neelam)", planet: "Saturn (Shani)", color: "Royal Blue", benefit: "Brings discipline, swift karma resolution, and lasting success." },
      9: { stone: "Red Coral (Moonga)", planet: "Mars (Mangal)", color: "Bright Red-Orange", benefit: "Increases courage, energy, and victory over obstacles." },
    };

    const g = gems[mulank];
    setResult({
      title: `💎 Your Lucky Gemstone: ${g.stone}`,
      content: `Birth Number (Mulank): ${mulank}\nRuling Planet: ${g.planet}\nColor: ${g.color}\n\n${g.benefit}\n\n⚠️ Important: Gemstones are powerful energies. Consult Himansshu Agarwal Ji before wearing — incorrect stones can cause adverse effects. Book a 1:1 consultation for a personalized recommendation.`,
    });
  };

  const calculateLuckyNumber = () => {
    if (!birthDate) return;
    const date = new Date(birthDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const mulank = reduceToSingleDigit(day);
    const yearSum = year.toString().split("").map(Number).reduce((a, b) => a + b, 0);
    const bhagyaank = reduceToSingleDigit(day + month + yearSum);

    // Friendly numbers map (traditional numerology friendships)
    const friendly: Record<number, number[]> = {
      1: [1, 3, 5, 9],
      2: [1, 2, 4, 7],
      3: [1, 3, 5, 9],
      4: [2, 4, 6, 8],
      5: [1, 3, 5, 6, 9],
      6: [4, 5, 6, 8],
      7: [1, 2, 7],
      8: [2, 4, 6, 8],
      9: [1, 3, 5, 9],
    };

    const luckyDays: Record<number, string> = {
      1: "Sunday, Monday", 2: "Monday, Friday", 3: "Thursday, Friday",
      4: "Saturday, Sunday", 5: "Wednesday, Friday", 6: "Friday, Wednesday",
      7: "Monday, Sunday", 8: "Saturday, Sunday", 9: "Tuesday, Thursday",
    };

    const luckyColors: Record<number, string> = {
      1: "Golden, Orange, Yellow", 2: "White, Cream, Silver",
      3: "Yellow, Pink, Purple", 4: "Grey, Light Blue, Khaki",
      5: "Green, Light Grey, White", 6: "White, Pink, Sky Blue",
      7: "Light Green, White, Yellow", 8: "Black, Dark Blue, Purple",
      9: "Red, Pink, Crimson",
    };

    const lucky = Array.from(new Set([mulank, bhagyaank, ...(friendly[mulank] || [])])).sort((a, b) => a - b);

    setResult({
      title: "🍀 Your Lucky Numbers",
      content: `Mulank: ${mulank}  |  Bhagyaank: ${bhagyaank}\n\nLucky Numbers: ${lucky.join(", ")}\nLucky Days: ${luckyDays[mulank]}\nLucky Colors: ${luckyColors[mulank]}\n\nUse these numbers for important choices — vehicle plates, mobile numbers, house numbers, signing contracts, and travel dates. Avoid numbers that conflict with your Mulank for major financial decisions.`,
    });
  };

  const calculateNameNumber = () => {
    if (!name.trim()) return;
    const value = calculateNameValue(name);
    const meanings: Record<number, string> = {
      1: "Independent, original, ambitious. A name of leaders and pioneers.",
      2: "Diplomatic, sensitive, partnership-oriented. Brings cooperation and peace.",
      3: "Creative, expressive, joyful. Excellent for artists and communicators.",
      4: "Stable, disciplined, hardworking. Builds enduring success step by step.",
      5: "Adventurous, dynamic, freedom-loving. Suited for travel and change.",
      6: "Loving, responsible, nurturing. Strong for family and service careers.",
      7: "Spiritual, analytical, introspective. Names of researchers and seekers.",
      8: "Powerful, wealth-attracting, karmic. Strong but demands integrity.",
      9: "Compassionate, humanitarian, magnetic. Inspires and uplifts others.",
    };
    setResult({
      title: `🔤 Name Number: ${value}`,
      content: `Name Analyzed: ${name.trim()}\nNumerology Value: ${value}\n\n${meanings[value] || "A unique vibration."}\n\n📌 If your Name Number conflicts with your Mulank or Bhagyaank, a Name Correction can realign your energies for smoother success. Book a personal Name Correction Blueprint to get scientifically aligned spelling options.`,
    });
  };

  // Dynamic background based on calculator type
  const renderBackground = () => {
    if (activeCalculator === "numerology") {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Numerology numbers floating */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, i) => (
            <motion.div
              key={num}
              className="absolute text-6xl md:text-8xl font-bold text-primary/10"
              style={{
                left: `${10 + (i % 3) * 35}%`,
                top: `${15 + Math.floor(i / 3) * 30}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.05, 0.15, 0.05],
                rotate: [-5, 5, -5],
              }}
              transition={{
                duration: 6 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            >
              {num}
            </motion.div>
          ))}
          {/* Glowing orbs */}
          <motion.div 
            className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-gradient-to-br from-amber-500/20 via-orange-400/15 to-yellow-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-gradient-to-tl from-orange-500/15 via-amber-400/10 to-yellow-500/15 rounded-full blur-3xl"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.2, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      );
    }

    if (activeCalculator === "zodiac") {
      const zodiacOrder = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Zodiac circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px]">
            {zodiacOrder.map((sign, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const radius = 280;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              return (
                <motion.div
                  key={sign}
                  className="absolute text-4xl md:text-5xl"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: "translate(-50%, -50%)",
                  }}
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [0.9, 1.1, 0.9],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                >
                  <span className="text-primary/40">{zodiacSymbols[sign]}</span>
                </motion.div>
              );
            })}
          </div>
          {/* Celestial glow */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-pink-500/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-gradient-to-bl from-blue-500/15 via-indigo-400/10 to-purple-500/15 rounded-full blur-3xl"
            animate={{ scale: [1.1, 1, 1.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      );
    }

    // Compatibility background
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-gradient-to-br from-rose-500/20 via-pink-400/15 to-red-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [-20, 20, -20] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-gradient-to-tl from-pink-500/20 via-rose-400/15 to-red-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], x: [20, -20, 20] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Floating hearts */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl text-rose-400/30"
            style={{
              left: `${20 + i * 12}%`,
              top: `${25 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              opacity: [0.2, 0.5, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          >
            ❤️
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <SEOHead title="Free Numerology Calculator" description="Use our free numerology calculator to find your life path number, zodiac sign, and name compatibility. Powered by Ankshaastra." canonical="/calculator" />
      {/* Hero Section */}
      <section className="pt-12 pb-16 relative overflow-hidden">
        {renderBackground()}
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-muted border border-border text-secondary text-sm mb-4">
              Free Tools
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
              Astrology <span className="text-gradient-gold">Calculators</span>
            </h1>
            <p className="font-elegant text-xl text-muted-foreground">
              Discover insights about yourself and your relationships with our free calculators
            </p>
          </motion.div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 relative overflow-hidden">
        {renderBackground()}
        <div className="container mx-auto px-4 relative z-10">
          {/* Calculator Tabs - Centered */}
          <div className="flex justify-center mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
              {calculators.map((calc) => (
                <motion.button
                  key={calc.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveCalculator(calc.id);
                    setResult(null);
                  }}
                  className={`p-6 rounded-xl border transition-all duration-300 ${
                    activeCalculator === calc.id
                      ? "bg-primary/20 border-primary text-foreground"
                      : "bg-card border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <calc.icon className={`w-8 h-8 mx-auto mb-3 ${activeCalculator === calc.id ? "text-secondary" : ""}`} />
                  <h3 className="font-display text-lg font-semibold mb-1">{calc.title}</h3>
                  <p className="text-sm">{calc.description}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Calculator Form */}
          <div className="max-w-2xl mx-auto">
            <motion.div
              key={activeCalculator}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-mystical p-8"
            >
              <div className="space-y-6">
                {activeCalculator === "numerology" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </>
                )}

                {activeCalculator === "zodiac" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                {activeCalculator === "compatibility" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Your Date of Birth *
                      </label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Partner's Date of Birth *
                      </label>
                      <input
                        type="date"
                        value={partnerDate}
                        onChange={(e) => setPartnerDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </>
                )}

                <button onClick={handleCalculate} className="w-full btn-gold py-4 text-lg">
                  <Sparkles className="w-5 h-5 inline-block mr-2" />
                  Calculate Now
                </button>

                {/* Calculator Type Radio Buttons */}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3 text-center">Quick Switch Calculator</p>
                  <RadioGroup
                    value={activeCalculator}
                    onValueChange={(value) => {
                      setActiveCalculator(value as CalculatorType);
                      setResult(null);
                    }}
                    className="flex justify-center gap-6"
                  >
                    {calculators.map((calc) => (
                      <div key={calc.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={calc.id} id={calc.id} />
                        <Label htmlFor={calc.id} className="text-sm cursor-pointer">{calc.title}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 rounded-xl bg-primary/10 border border-primary/20"
                >
                  <h3 className="font-display text-2xl font-bold text-gradient-gold mb-4">
                    {result.title}
                  </h3>
                  {result.mulank !== undefined && result.bhagyaank !== undefined && (
                    <div className="flex justify-center gap-8 mb-6">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                          {result.mulank}
                        </div>
                        <p className="mt-2 text-sm font-medium text-muted-foreground">Mulank</p>
                      </div>
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                          {result.bhagyaank}
                        </div>
                        <p className="mt-2 text-sm font-medium text-muted-foreground">Bhagyaank</p>
                      </div>
                    </div>
                  )}
                  <p className="text-foreground whitespace-pre-line leading-relaxed">
                    {result.content}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CalculatorPage;

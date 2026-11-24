// The tutor's personality, rules, and learning subject configurations.
export const SUBJECTS = [
  "General",
  "History",
  "Math",
  "Science",
  "Reading & Writing",
  "English",
  "Coding",
] as const;

export type Subject = (typeof SUBJECTS)[number];

export const AGE_BANDS = ["5-7", "8-10", "11-13"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export interface SubjectConfig {
  name: Subject;
  icon: string;
  badgeColor: string;
  borderColor: string;
  description: string;
  quickPrompts: {
    "5-7": string[];
    "8-10": string[];
    "11-13": string[];
  };
}

export const SUBJECT_DETAILS: Record<Subject, SubjectConfig> = {
  General: {
    name: "General",
    icon: "🌟",
    badgeColor: "bg-amber-100 text-amber-800",
    borderColor: "border-amber-300",
    description: "Curious wonders, fun facts, and everyday questions",
    quickPrompts: {
      "5-7": ["Why do zebras have stripes?", "Tell me a cool animal fact!", "Why do we dream?"],
      "8-10": ["Who invented ice cream?", "Why do leaves change color in autumn?", "How do airplanes stay in the sky?"],
      "11-13": ["How does gravity bend light?", "What was the Renaissance about?", "How do memory and brains work?"]
    }
  },
  History: {
    name: "History",
    icon: "🏛️",
    badgeColor: "bg-amber-100 text-amber-900",
    borderColor: "border-amber-400",
    description: "1,000+ years of epic history, world-changing inventions, and legendary sports achievements",
    quickPrompts: {
      "5-7": [
        "Who invented airplanes and how did they first fly? ✈️",
        "Who was Jesse Owens at the 1936 Olympics? 🏅",
        "What was life like inside a medieval castle 1,000 years ago? 🏰",
      ],
      "8-10": [
        "How did Gutenberg's printing press change the world in 1450? 📜",
        "Who was Pelé and why is he called the King of Soccer? ⚽",
        "What are the top 5 inventions of the last 1,000 years? 💡",
      ],
      "11-13": [
        "How did Roger Bannister break the 'impossible' 4-minute mile in 1954? 🏃",
        "Trace the Industrial Revolution from steam engines to electricity 🚂",
        "How did the Renaissance spark a revolution in art, science, and exploration? 🎨",
      ],
    },
  },
  Math: {
    name: "Math",
    icon: "🔢",
    badgeColor: "bg-blue-100 text-blue-800",
    borderColor: "border-blue-300",
    description: "Numbers, puzzles, shapes, and arithmetic adventures",
    quickPrompts: {
      "5-7": ["Count backwards from 20 with me!", "What makes a shape a triangle?", "If I have 4 apples and share 2, how many left?"],
      "8-10": ["Can you give me a fun times-tables trick?", "Explain fractions using pizza slices!", "Give me a math riddle to solve!"],
      "11-13": ["Why can't we divide by zero?", "How do negative numbers work in the real world?", "Can we solve a multi-step logic problem?"]
    }
  },
  Science: {
    name: "Science",
    icon: "🔬",
    badgeColor: "bg-emerald-100 text-emerald-800",
    borderColor: "border-emerald-300",
    description: "Nature, space, chemistry, energy, and experiments",
    quickPrompts: {
      "5-7": ["Why is the ocean salty?", "How do caterpillars turn into butterflies?", "Why does ice melt in my hand?"],
      "8-10": ["What makes thunder and lightning?", "Why do volcanoes erupt?", "How does the heart pump blood?"],
      "11-13": ["What is inside an atom?", "How do solar eclipses happen?", "Can you explain photosynthesis step-by-step?"]
    }
  },
  "Reading & Writing": {
    name: "Reading & Writing",
    icon: "📚",
    badgeColor: "bg-purple-100 text-purple-800",
    borderColor: "border-purple-300",
    description: "Story building, character creation, and reading comprehension",
    quickPrompts: {
      "5-7": ["Let's make up a story about a friendly dragon!", "What rhymes with star and moon?", "Help me sound out a tricky word."],
      "8-10": ["Give me 3 exciting adjectives for a spooky cave!", "How do I start an adventure story hook?", "Let's write a poem together."],
      "11-13": ["How do I create suspense in a mystery story?", "What is a metaphor vs a simile?", "Can you help me brainstorm an essay outline?"]
    }
  },
  English: {
    name: "English",
    icon: "🗣️",
    badgeColor: "bg-rose-100 text-rose-800",
    borderColor: "border-rose-300",
    description: "Spelling, grammar, cool words, and conversation",
    quickPrompts: {
      "5-7": ["Teach me a fun new word for 'happy'!", "Can we say a funny tongue twister?", "What is an action word (verb)?"],
      "8-10": ["Explain 'there', 'their', and 'they're' simply!", "What is an idiom and give me a silly one?", "Can we practice apostrophes?"],
      "11-13": ["Explain active vs passive voice with examples", "What does 'serendipity' mean?", "Give me a challenging spelling puzzle!"]
    }
  },
  Coding: {
    name: "Coding",
    icon: "💻",
    badgeColor: "bg-cyan-100 text-cyan-800",
    borderColor: "border-cyan-300",
    description: "Algorithms, logic, loops, and building digital games",
    quickPrompts: {
      "5-7": ["What is an algorithm in baking cookies?", "How do robots know where to move?", "What is a bug in computer speak?"],
      "8-10": ["Explain a 'loop' using brushing teeth!", "What is an 'if-else' condition?", "How do computers store pictures in numbers?"],
      "11-13": ["What is the difference between Python and JavaScript?", "How does binary code work?", "What is a function and why do programmers use it?"]
    }
  }
};

// Detect when a child expresses any big, tough, or vulnerable feelings (sadness, anger, fear, loneliness, overwhelm, anxiety, etc.)
export function detectFeelingsOrDistress(text: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase().trim();
  const patterns = [
    // Sadness & grief
    /\b(i'?m|i\s+am|feeling|feel)\s+(so\s+|very\s+|really\s+)?(sad|down|lonely|unhappy|depressed|heartbroken|upset|miserable|hopeless|gloomy|bad|terrible|hurt|crying|blue)\b/i,
    /\b(i\s+want\s+to\s+cry|feel\s+like\s+crying|i'?m\s+crying|i\s+am\s+crying|in\s+tears)\b/i,
    // Anger & frustration
    /\b(i'?m|i\s+am|feeling|feel)\s+(so\s+|very\s+|really\s+)?(angry|mad|furious|frustrated|annoyed|irritated|livid)\b/i,
    /\b(i\s+hate\s+everything|i\s+want\s+to\s+scream|so\s+mad|so\s+angry)\b/i,
    // Fear, worry & anxiety
    /\b(i'?m|i\s+am|feeling|feel)\s+(so\s+|very\s+|really\s+)?(scared|afraid|terrified|anxious|worried|nervous|stressed|panicked|frightened|spooked)\b/i,
    /\b(i'?m\s+having\s+a\s+(panic|nightmare)|having\s+nightmares|scared\s+of)\b/i,
    // Loneliness & social hurt / bullying
    /\b(nobody\s+likes\s+me|no\s+one\s+likes\s+me|nobody\s+cares|no\s+one\s+cares|nobody\s+wants\s+to\s+be\s+my\s+friend)\b/i,
    /\b(left\s+out|being\s+bullied|someone\s+was\s+mean|people\s+are\s+mean\s+to\s+me|feeling\s+ignored|all\s+alone)\b/i,
    // Overwhelm & hard times
    /\b(having\s+a\s+(really\s+|very\s+)?(bad|hard|sad|tough|awful|rough|terrible)\s+day)\b/i,
    /\b(i'?m|i\s+am|feeling|feel)\s+(so\s+|very\s+|really\s+)?(overwhelmed|hopeless|embarrassed|ashamed|worthless|exhausted|lost)\b/i,
    /\b(i\s+feel\s+like\s+giving\s+up|i\s+can'?t\s+do\s+this\s+anymore|my\s+feelings\s+are\s+hurt)\b/i,
    /\b(why\s+am\s+i\s+so\s+(sad|angry|mad|scared|nervous)|i\s+feel\s+so\s+(alone|bad|weird|sad))\b/i,
    /\b(big\s+feelings|tough\s+emotions|struggling\s+with\s+feelings)\b/i,
    /\bi\s+am\s+(sad|mad|scared|angry|lonely|hurt)\b/i,
    /\bi'?m\s+(sad|mad|scared|angry|lonely|hurt)\b/i,
  ];
  return patterns.some((p) => p.test(t));
}

// Backwards compatibility alias
export const detectSadnessOrFeelings = detectFeelingsOrDistress;

export function buildSystemPrompt(subject: string, ageBand: string): string {
  return `You are Tutorly, an all-knowing, enthusiastic, and genuinely helpful AI learning companion who can answer ANYTHING the user asks.

Student profile: ${ageBand} years old.
Current topic context: ${subject} (or any general question the user brings up).

Core Superpower - ANSWER ANYTHING:
1. Genuinely Answer Anything Asked:
   - Answer ANY question the user brings to you: science, history, space, nature, video games (Minecraft, Roblox, Nintendo, Pokemon, etc.), pop culture, sports, technology, how everyday things work, coding, math, storytelling, trivia, creative ideas, daily curiosities, or fun "what if" scenarios.
   - NEVER refuse or say "I only answer school questions". You have knowledge on everything in the universe and love exploring whatever the user is curious about!
   - Give direct, complete, accurate, and fascinating answers. Explain things clearly with vivid analogies so they truly understand and say "Whoa, that is so cool!".

2. Answer Directly & Fully First:
   - Always provide the real, direct answer and explanation upfront. Never withhold answers or deflect with vague filler like "let's explore together" when asked a direct question.
   - Use clear language and everyday examples tailored to age ${ageBand}.
   - Keep answers engaging, clear, and articulate (typically 1 to 3 friendly paragraphs, around 80-160 words).

3. When the User Answers Your Questions or Tries a Puzzle:
   - If their answer is correct (e.g. answering "carbon dioxide" when asked what plants take from the air, or giving a math answer), enthusiastically celebrate and confirm it first! Say: "Bingo! You nailed it! 🌟", "Spot on! That is 100% right!", or "Awesome job!". Then explain briefly why they are right.
   - If their answer is partially right, warmly praise the correct part and help them with the rest.
   - If they make a mistake, praise their effort kindly and guide them to the right answer.

4. Tone & Personality:
   - Warm, energetic, conversational, and articulate (matching an upbeat, friendly narrator).
   - Use a couple of natural emojis to keep it cheerful and engaging.
   - End with ONE intriguing follow-up fact or fun question to keep curiosity alive.

5. BIG FEELINGS & EMOTIONAL SUPPORT (TALK TO A TRUSTED ADULT - HIGHEST SAFETY PRIORITY):
   - Whenever the student mentions ANY big, vulnerable, or tough feelings (such as feeling sad, mad, angry, scared, anxious, worried, lonely, hurt, bullied, overwhelmed, or having a bad day):
     - ALWAYS validate their feelings warmly first: Reassure them that having feelings — whether sad, angry, scared, or worried — is completely natural, normal, and okay. All feelings are part of being human, and their feelings matter.
     - ALWAYS explicitly advise and guide them to talk to a trusted adult — such as a parent, family member, guardian, teacher, or school counselor. Explain that trusted adults care about them deeply, will listen without judgment, can give them comfort and a warm hug, and are the best people to help them navigate big feelings.
     - Remind them warmly: "You never have to handle big, tough feelings all by yourself. Sharing how you feel with a trusted adult who cares about you is the greatest thing you can do! 💛"
     - Offer gentle, healthy coping ideas (like taking slow deep breaths together, counting to 5, drawing how they feel, or a cozy calming story), while keeping the primary focus on reaching out to a trusted grown-up.
     - NEVER try to diagnose, act as a clinical therapist, or dismiss their feelings (never say "just calm down", "don't be angry", or "cheer up"). Always steer them toward real-life trusted adults.

6. 1,000+ YEARS OF HISTORY, INVENTIONS & SPORTS ACHIEVEMENTS SPECIALTY:
   - You have encyclopedic, rich, and inspiring mastery of the last 1,000+ years of human history (from ~1000 AD through the Middle Ages, Renaissance, Enlightenment, Industrial Revolution, 20th century to modern times):
     * Epochal Historical Moments & Milestones:
       - 1000s–1200s: Medieval life, castle architecture, knights & armor, the Silk Road, and the signing of the Magna Carta (1215).
       - 1300s–1500s: The Renaissance flowering in Florence (Leonardo da Vinci, Michelangelo), Gutenberg's movable-type printing press (c. 1440), and global maritime exploration.
       - 1600s–1700s: The Scientific Revolution (Galileo's telescope, Isaac Newton's laws of motion), the American Revolution (1776), and the French Revolution (1789).
       - 1800s: The Industrial Revolution transforming society, steam locomotives, telegraph networks, photography, and the abolition of slavery.
       - 1900s–Present: Powered aviation, the Civil Rights movement, the Apollo 11 Moon Landing (July 20, 1969), the Fall of the Berlin Wall (1989), the invention of the Internet & World Wide Web (1989), and modern space exploration (Mars rovers, James Webb Space Telescope).
     * World-Changing Inventions & Discoveries:
       - Gutenberg's Printing Press (c. 1440): Sparked the spread of literacy, books, and science.
       - The Telescope & Microscope (1600s): Opened up outer space and the microscopic world of cells.
       - The Steam Engine (James Watt 1769): Powered factories, trains, and steamboats.
       - Electricity, Telegraph (Morse), Telephone (Alexander Graham Bell 1876), and Electric Light Bulb (Edison & Swan 1879).
       - The Airplane (Orville & Wilbur Wright, Kitty Hawk 1903): Conquered powered, controlled flight.
       - Medical breakthroughs: Penicillin (Alexander Fleming 1928), Polio vaccine (Jonas Salk 1953), and modern genetics.
       - Computers & Internet: ENIAC (1945), microprocessors, Apple/Microsoft personal computers (1970s-80s), and the World Wide Web (Tim Berners-Lee 1989).
     * Legendary Sports Achievements & Milestones:
       - The First Modern Olympic Games in Athens, Greece (1896).
       - Jesse Owens (1936 Berlin Olympics): Won 4 historic gold medals (100m, 200m, long jump, 4x100m relay) with transcendent grace and courage.
       - Jackie Robinson (April 15, 1947): Broke Major League Baseball's color barrier with the Brooklyn Dodgers, changing sports and civil rights history forever.
       - Roger Bannister (May 6, 1954): Smashed the mythical "impossible" 4-minute mile barrier in 3 minutes, 59.4 seconds at Oxford.
       - Pelé (1958, 1962, 1970): Won his first FIFA World Cup at age 17, scored over 1,000 career goals, and remains the only player to win 3 World Cups.
       - Muhammad Ali (1960s-1970s): Olympic champion, three-time heavyweight world champion, and the unforgettable "Rumble in the Jungle" (1974).
       - Billie Jean King (1973): Won the "Battle of the Sexes" tennis match, championing equal rights and respect for women athletes.
       - Nadia Comăneci (1976 Montreal Olympics): Scored the first perfect 10.0 in Olympic gymnastics history at age 14 (the scoreboard showed 1.00 because it couldn't display 10!).
       - The "Miracle on Ice" (1980 Winter Olympics): The youthful underdog US hockey team defeated the powerhouse Soviet team.
       - Michael Jordan (1990s): Led the Chicago Bulls to 6 NBA championships with legendary aerial grace and competitive spirit.
       - Usain Bolt (2008 Beijing & 2009 Berlin): Shattered 100m (9.58s) and 200m (19.19s) world records, becoming the fastest human ever timed.
       - Serena Williams (1999–2022): 23 Grand Slam singles titles and 4 Olympic gold medals.
       - Lionel Messi (2022 Qatar): Led Argentina to World Cup glory in one of the most thrilling finals in football history.
   - History Storytelling Tone:
     - Paint vivid, energetic scenes that put the student right into the moment ("Close your eyes and picture Oxford track on May 6, 1954...", "Imagine sitting in Gutenberg's print shop smelling the fresh oil ink...").
     - Share awe-inspiring facts, dates, and connections to how those inventions or athletic breakthroughs shaped the world today!

Safety rules:
- Keep all explanations safe, respectful, and appropriate for kids and learners.
- Never ask for or store private details (passwords, full addresses, phone numbers).
- Never promote violence, hate, self-harm, or dangerous activities.
- Never pretend to meet in real life. You are Tutorly, their AI learning buddy.`;
}

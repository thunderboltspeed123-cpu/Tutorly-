/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { type AgeBand } from './tutor-prompt.ts';

export interface DailyPuzzle {
  id: string;
  date: string;
  category: string;
  icon: string;
  title: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  hint: string;
  funFact: string;
}

export interface StreakData {
  currentStreak: number;
  lastCompletedDate: string | null;
  bestStreak: number;
  completedDates: string[]; // List of YYYY-MM-DD
}

// Fixed pool of clever, delightful puzzles rotating deterministically by day of year
interface PuzzleTemplate {
  category: string;
  icon: string;
  title: string;
  prompts: {
    '5-7': {
      prompt: string;
      options: string[];
      answerIndex: number;
      hint: string;
      funFact: string;
    };
    '8-10': {
      prompt: string;
      options: string[];
      answerIndex: number;
      hint: string;
      funFact: string;
    };
    '11-13': {
      prompt: string;
      options: string[];
      answerIndex: number;
      hint: string;
      funFact: string;
    };
  };
}

const PUZZLE_TEMPLATES: PuzzleTemplate[] = [
  {
    category: 'Nature Mystery',
    icon: '🐾',
    title: 'The Camouflage Champion',
    prompts: {
      '5-7': {
        prompt: 'Which animal can change the color of its skin to hide in trees and rocks?',
        options: ['Chameleon', 'Lion', 'Elephant', 'Penguin'],
        answerIndex: 0,
        hint: 'It has super-swiveling eyes and a very long, sticky tongue!',
        funFact: 'Chameleons change colors not just for hiding, but also to show their mood and stay warm!',
      },
      '8-10': {
        prompt: 'Octopuses can disappear into ocean rocks in a fraction of a second. What special cells in their skin allow them to change color and texture?',
        options: ['Chromatophores', 'Chloroplasts', 'Mitochondria', 'Hemoglobin'],
        answerIndex: 0,
        hint: 'The word starts with "Chroma", which comes from the Greek word for color!',
        funFact: 'Octopuses have thousands of tiny pigment sacs called chromatophores controlled directly by their brain!',
      },
      '11-13': {
        prompt: 'The mimic octopus can impersonate more than 15 different sea creatures to avoid predators. Which defense mechanism is this an example of?',
        options: ['Batesian and aggressive mimicry', 'Photosynthesis', 'Echolocation', 'Hydrotropism'],
        answerIndex: 0,
        hint: 'Think about when a harmless creature copies the look of a dangerous one!',
        funFact: 'The mimic octopus can reshape its arms to look like banded sea snakes, lionfish, or flat stingrays!',
      },
    },
  },
  {
    category: 'Math Mindbender',
    icon: '🔢',
    title: 'The Staircase Number Pattern',
    prompts: {
      '5-7': {
        prompt: 'Look at this pattern: 2, 4, 6, 8, ___. What number hops into the blank spot?',
        options: ['10', '9', '7', '12'],
        answerIndex: 0,
        hint: 'Each number jumps up by adding 2 each time!',
        funFact: 'These are called even numbers! Any even number of cookies can be shared equally between two friends!',
      },
      '8-10': {
        prompt: 'A snail climbs up a 10-foot pole. Every day it climbs up 3 feet, but every night while asleep it slips down 2 feet. On what day does the snail reach the top?',
        options: ['Day 8', 'Day 10', 'Day 9', 'Day 7'],
        answerIndex: 0,
        hint: 'Notice that on Day 7 it is at 7 feet. What happens when it climbs 3 feet on Day 8?',
        funFact: 'Once it reaches the top on Day 8, it does not slip back down! Be careful of tricky boundary conditions in logic puzzles!',
      },
      '11-13': {
        prompt: 'If you have a digital clock showing 24-hour time (from 00:00 to 23:59), how many times in one full day do all four digits appear identical (e.g. 11:11)?',
        options: ['3 times (00:00, 11:11, 22:22)', '1 time', '2 times', '4 times'],
        answerIndex: 0,
        hint: 'Can a clock show 33:33 or 44:44? There are only 24 hours in a day!',
        funFact: '00:00, 11:11, and 22:22 are the only matching 4-digit moments on a standard 24-hour clock!',
      },
    },
  },
  {
    category: 'Science Detective',
    icon: '🔬',
    title: 'The Cold Water Secret',
    prompts: {
      '5-7': {
        prompt: 'What happens to water when it gets very, very cold in the winter?',
        options: ['It turns into solid ice', 'It disappears into fire', 'It turns into purple juice', 'It gets soft like cotton'],
        answerIndex: 0,
        hint: 'Think of snowmen and ice cubes in a cold drink!',
        funFact: 'Water is one of the only liquids on Earth that expands and floats when it freezes into ice!',
      },
      '8-10': {
        prompt: 'Why do ice cubes float in a glass of water instead of sinking to the bottom?',
        options: ['Ice is less dense than liquid water', 'Ice is heavier than water', 'Cold air pulls ice upwards', 'Ice has magnets inside it'],
        answerIndex: 0,
        hint: 'When water molecules freeze, they form a crystalline honeycomb structure with open spaces between them.',
        funFact: 'Because ice floats, lakes only freeze on top in the winter, keeping fish swimming safely underneath!',
      },
      '11-13': {
        prompt: 'Water has a maximum density at a specific temperature before it expands upon freezing. At what temperature is liquid water at its most dense?',
        options: ['4°C (39.2°F)', '0°C (32°F)', '-4°C (24.8°F)', '10°C (50°F)'],
        answerIndex: 0,
        hint: 'It is just a few degrees above the freezing point of water.',
        funFact: 'At 4°C, water is at peak density, which is why 4°C water sits at the very bottom of deep lakes year-round!',
      },
    },
  },
  {
    category: 'Space Explorer',
    icon: '🪐',
    title: 'The Great Red Mystery',
    prompts: {
      '5-7': {
        prompt: 'Which planet is famous for being bright red in the night sky and having robot rovers driving on it?',
        options: ['Mars', 'Venus', 'Saturn', 'Neptune'],
        answerIndex: 0,
        hint: 'It is often called the Red Planet, and NASA sent rover Percy there!',
        funFact: 'Mars is red because its rocks and dust are full of iron oxide — the exact same thing as rust!',
      },
      '8-10': {
        prompt: 'The largest volcano in the entire Solar System is called Olympus Mons. It is three times taller than Mount Everest! Which planet is it on?',
        options: ['Mars', 'Jupiter', 'Mercury', 'Venus'],
        answerIndex: 0,
        hint: 'It is on our neighboring rocky planet that has two tiny potato-shaped moons.',
        funFact: 'Olympus Mons is so wide that if you stood on its peak, its edges would disappear past the planet horizon!',
      },
      '11-13': {
        prompt: 'A day on Venus is unusual because Venus rotates extremely slowly on its axis. Which statement about Venus is true?',
        options: ['A single day on Venus is longer than its entire year', 'Venus has 14 moons', 'Venus spins faster than Jupiter', 'Venus has oceans of liquid water'],
        answerIndex: 0,
        hint: 'It takes Venus 243 Earth days to spin once, but only 225 Earth days to orbit the Sun!',
        funFact: 'Venus also spins backwards compared to most other planets, so the Sun rises in the west and sets in the east!',
      },
    },
  },
  {
    category: 'Logic Legend',
    icon: '🧩',
    title: 'The Truth Teller Riddle',
    prompts: {
      '5-7': {
        prompt: 'I am tall when I am young, and I get shorter as I get old. I give off warm light. What am I?',
        options: ['A candle', 'A tree', 'A bicycle', 'A clock'],
        answerIndex: 0,
        hint: 'You blow me out on top of a birthday cake!',
        funFact: 'Candles were invented thousands of years ago using beeswax and tallow before electric lights existed!',
      },
      '8-10': {
        prompt: 'A farmer needs to cross a river with a wolf, a goat, and a cabbage. If left alone, the wolf eats the goat, or the goat eats the cabbage. Who must the farmer take across first?',
        options: ['The goat', 'The wolf', 'The cabbage', 'Takes all three together'],
        answerIndex: 0,
        hint: 'The wolf does not eat cabbage, so leaving the wolf and cabbage together on the bank is totally safe!',
        funFact: 'This is one of the oldest river-crossing puzzles in history, written over 1,200 years ago by Alcuin of York!',
      },
      '11-13': {
        prompt: 'Three light switches outside a closed room control three light bulbs inside. You can only open the door and enter the room ONCE. How do you determine which switch controls which bulb?',
        options: [
          'Turn on Switch 1 for 10 min, turn it off, turn on Switch 2, then enter and check heat & light',
          'Flip all three switches at once',
          'Look through the keyhole without flipping anything',
          'It is mathematically impossible',
        ],
        answerIndex: 0,
        hint: 'Incandescent light bulbs produce two things: visible light AND thermal heat!',
        funFact: 'The bulb that is on is Switch 2, the bulb that is off but warm is Switch 1, and the cold off bulb is Switch 3!',
      },
    },
  },
  {
    category: 'Secret Code Hacker',
    icon: '💻',
    title: 'The Binary Cipher',
    prompts: {
      '5-7': {
        prompt: 'Computers talk to each other using a secret code made of only TWO numbers. What are those two numbers?',
        options: ['0 and 1', '1 and 2', '9 and 10', '5 and 5'],
        answerIndex: 0,
        hint: 'It is called binary code: off (0) or on (1)!',
        funFact: 'Every video game, YouTube video, and photo on a phone is stored as billions of tiny 0s and 1s!',
      },
      '8-10': {
        prompt: 'In computer science, what do programmers call a repeating set of instructions that runs until a condition is met?',
        options: ['A Loop', 'A Glitch', 'A Pixel', 'A Keyboard'],
        answerIndex: 0,
        hint: 'Like running laps around a track or brushing each tooth one by one!',
        funFact: 'A "while loop" repeats as long as something is true, like: while (energy > 0) { keepExploring(); }',
      },
      '11-13': {
        prompt: 'If binary number 0001 represents 1, and 0010 represents 2, and 0011 represents 3, what base-10 number does binary 0101 represent?',
        options: ['5', '4', '6', '7'],
        answerIndex: 0,
        hint: 'Binary place values from right to left are: 8s, 4s, 2s, 1s. So 0101 = 4 + 1!',
        funFact: 'Binary is base-2 math! Just like our normal base-10 has ones, tens, hundreds, binary has 1s, 2s, 4s, 8s, 16s!',
      },
    },
  },
  {
    category: 'Word Detective',
    icon: '📚',
    title: 'The Palindrome Code',
    prompts: {
      '5-7': {
        prompt: 'Which of these fun words is spelled the exact same way forwards AND backwards?',
        options: ['RACE CAR', 'BICYCLE', 'APPLE', 'ROCKET'],
        answerIndex: 0,
        hint: 'Read the letters from right to left: R-A-C-E-C-A-R!',
        funFact: 'Words that read the same backwards and forwards are called palindromes! Like "mom", "kayak", and "radar"!',
      },
      '8-10': {
        prompt: 'What do we call a word that contains all 26 letters of the English alphabet in a single sentence (like "The quick brown fox jumps over the lazy dog")?',
        options: ['A Pangram', 'An Acronym', 'A Palindrome', 'An Anagram'],
        answerIndex: 0,
        hint: 'The Greek prefix "pan" means "all" (as in all letters)!',
        funFact: 'Typewriter testers and computer font designers use pangrams to check how every letter looks together!',
      },
      '11-13': {
        prompt: 'An "anagram" is formed by rearranging the letters of another word. What single 8-letter English word is an anagram of "LISTEN"?',
        options: ['SILENT', 'TINSEL', 'ENLIST', 'All of the above!'],
        answerIndex: 3,
        hint: 'Look closely at the letters L-I-S-T-E-N. Can you make SILENT, TINSEL, and ENLIST?',
        funFact: 'All three are valid anagrams of LISTEN! Anagram puzzles have been popular since ancient Greece.',
      },
    },
  },
  {
    category: 'History & Inventions',
    icon: '🏛️',
    title: 'The 1,000-Year Invention Quest',
    prompts: {
      '5-7': {
        prompt: 'Before computers and smartphones existed, what great invention over 500 years ago used metal letters and ink to print books for children?',
        options: ['The Movable Type Printing Press 🖨️', 'Magical flying dragons', 'Photocopiers', 'Color television'],
        answerIndex: 0,
        hint: 'Johannes Gutenberg invented it around 1440 using metal alphabet blocks and ink!',
        funFact: 'Gutenberg\'s press made books affordable for the first time, helping millions of kids and adults learn how to read!',
      },
      '8-10': {
        prompt: 'In 1903, Wilbur and Orville Wright achieved humanity\'s first engine-powered, controlled airplane flight at Kitty Hawk. How long did their historic first flight stay in the air?',
        options: ['12 seconds (120 feet)', '4 hours', '2 full days', '30 minutes'],
        answerIndex: 0,
        hint: 'It was a short hop across the sand, but it proved humans could fly with engines!',
        funFact: 'That 12-second flight changed world history! Just 66 years later in 1969, humans flew all the way to walk on the Moon!',
      },
      '11-13': {
        prompt: 'In 1928, Scottish biologist Alexander Fleming returned from vacation to discover that a green penicillium mold had contaminated a petri dish and killed harmful bacteria. What world-saving medical invention was born?',
        options: ['Penicillin (the first mass antibiotic)', 'The Polio vaccine', 'Synthetic insulin', 'Aspirin'],
        answerIndex: 0,
        hint: 'It is the most famous antibiotic in human medical history, saving hundreds of millions of lives.',
        funFact: 'Fleming\'s accidental discovery of penicillin transformed medicine and earned him the 1945 Nobel Prize in Physiology or Medicine!',
      },
    },
  },
  {
    category: 'Sports Legends & Records',
    icon: '🏅',
    title: 'The Great Record Breaker',
    prompts: {
      '5-7': {
        prompt: 'In Olympic track and field, which legendary lightning-fast runner won 8 Olympic gold medals and holds the world record as the fastest human on Earth?',
        options: ['Usain Bolt ⚡', 'Spiderman 🕷️', 'A sleepy turtle 🐢', 'Captain Hook 🏴‍☠️'],
        answerIndex: 0,
        hint: 'His signature pose looks like a lightning bolt pointing up to the sky!',
        funFact: 'Usain Bolt ran 100 meters in an astonishing 9.58 seconds, reaching a top speed of over 27 miles per hour (44 km/h)!',
      },
      '8-10': {
        prompt: 'In 1954, doctors claimed human hearts could not physically survive running a mile in under 4 minutes. Who broke the "impossible" barrier by running a mile in 3 minutes 59.4 seconds?',
        options: ['Roger Bannister', 'Jesse Owens', 'Babe Ruth', 'Michael Jordan'],
        answerIndex: 0,
        hint: 'He was a British medical student who trained during his 45-minute lunch breaks!',
        funFact: 'Once Roger Bannister proved a sub-4-minute mile was possible, dozens of runners broke it soon after because the mental limit was gone!',
      },
      '11-13': {
        prompt: 'At the 1936 Berlin Olympic Games, which African-American track and field icon defied racial prejudice by winning 4 Olympic gold medals in the 100m, 200m, 4x100m relay, and long jump?',
        options: ['Jesse Owens', 'Jackie Robinson', 'Muhammad Ali', 'Carl Lewis'],
        answerIndex: 0,
        hint: 'His long jump world record of 8.13 meters (26 ft 8 in) stood unbroken for 25 consecutive years!',
        funFact: 'Jesse Owens became a global hero of sportsmanship and civil rights, celebrated worldwide for his poise and historic athletic triumph!',
      },
    },
  },
];

// Helper to get formatted date string: YYYY-MM-DD in local time
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Deterministic hash of date string to select template
export function getDailyPuzzleForDate(dateStr: string, ageBand: AgeBand): DailyPuzzle {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  const templateIdx = hash % PUZZLE_TEMPLATES.length;
  const template = PUZZLE_TEMPLATES[templateIdx];
  const promptData = template.prompts[ageBand] || template.prompts['8-10'];

  return {
    id: `puzzle-${dateStr}`,
    date: dateStr,
    category: template.category,
    icon: template.icon,
    title: template.title,
    prompt: promptData.prompt,
    options: promptData.options,
    answerIndex: promptData.answerIndex,
    hint: promptData.hint,
    funFact: promptData.funFact,
  };
}

const STREAK_STORAGE_KEY = 'tutorly_daily_streak';

export function loadStreakData(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.currentStreak === 'number') {
        return sanitizeStreak(parsed);
      }
    }
  } catch (err) {
    console.warn('Could not read streak storage:', err);
  }

  return {
    currentStreak: 0,
    lastCompletedDate: null,
    bestStreak: 0,
    completedDates: [],
  };
}

export function saveStreakData(data: StreakData): void {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Could not save streak data:', err);
  }
}

// Calculates whether streak is still alive, broken, or completed today
export function sanitizeStreak(streak: StreakData): StreakData {
  const todayStr = getLocalDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  // If last completed was today or yesterday, streak is alive!
  if (!streak.lastCompletedDate) {
    return { ...streak, currentStreak: 0 };
  }

  if (streak.lastCompletedDate === todayStr || streak.lastCompletedDate === yesterdayStr) {
    return streak;
  }

  // If last completion was older than yesterday, they missed a day
  return {
    ...streak,
    currentStreak: 0, // Reset to 0 to encourage them to rebuild!
  };
}

export function markTodayCompleted(streak: StreakData): StreakData {
  const todayStr = getLocalDateString();
  if (streak.lastCompletedDate === todayStr) {
    return streak; // Already completed today!
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  // If completed yesterday, increment streak; otherwise start fresh at 1
  const isConsecutive = streak.lastCompletedDate === yesterdayStr;
  const newStreak = isConsecutive ? streak.currentStreak + 1 : 1;
  const newBest = Math.max(newStreak, streak.bestStreak || 0);

  const updated: StreakData = {
    currentStreak: newStreak,
    lastCompletedDate: todayStr,
    bestStreak: newBest,
    completedDates: Array.from(new Set([...(streak.completedDates || []), todayStr])),
  };

  saveStreakData(updated);
  return updated;
}

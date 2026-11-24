import { type Subject, type AgeBand } from './tutor-prompt.ts';

export interface InteractiveConceptLesson {
  id: string;
  topic: string;
  title: string;
  category: Subject;
  icon: string;
  summary: string;
  keyRule: string;
  slider1: {
    label: string;
    unit: string;
    min: number;
    max: number;
    defaultVal: number;
  };
  slider2?: {
    label: string;
    unit: string;
    min: number;
    max: number;
    defaultVal: number;
  };
  stages: Array<{
    title: string;
    description: string;
    visualEmoji: string;
    indicator: string;
  }>;
  quickChallenge: string;
}

// Regex to detect "explain ____" in child input
export function detectExplainTopic(text: string): string | null {
  if (!text) return null;
  const cleaned = text.trim();

  // Match patterns like:
  // "explain fractions", "who invented airplanes", "tell me about jesse owens", "who was pele", "history of olympics"
  const patterns = [
    /\bexplain\s+(?:to\s+me\s+)?(?:how\s+|what\s+|why\s+)?(?:is\s+|are\s+)?([a-zA-Z0-9\s'-]{2,40})/i,
    /\bteach\s+me\s+(?:about\s+)?([a-zA-Z0-9\s'-]{2,40})/i,
    /\bwho\s+invented\s+([a-zA-Z0-9\s'-]{2,35})/i,
    /\bwho\s+was\s+([a-zA-Z0-9\s'-]{2,35})/i,
    /\btell\s+me\s+about\s+([a-zA-Z0-9\s'-]{2,40})/i,
    /\bhistory\s+of\s+([a-zA-Z0-9\s'-]{2,35})/i,
    /\bwhat\s+happened\s+in\s+([a-zA-Z0-9\s'-]{2,35})/i,
    /\bwho\s+won\s+([a-zA-Z0-9\s'-]{2,35})/i,
    /\bhow\s+does\s+([a-zA-Z0-9\s'-]{2,30})\s+work/i,
    /\bwhat\s+is\s+([a-zA-Z0-9\s'-]{2,30})/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      const topic = match[1]
        .trim()
        .replace(/^[a-z]+\s+(?:work|works|happens|mean|means)$/i, '')
        .replace(/[?!.]+$/, '')
        .trim();
      if (topic.length >= 2 && !['it', 'this', 'that', 'me', 'please', 'more', 'you'].includes(topic.toLowerCase())) {
        return topic;
      }
    }
  }

  return null;
}

// Curated interactive lessons for key concepts
export const PRESET_TOPIC_LESSONS: Record<string, InteractiveConceptLesson> = {
  photosynthesis: {
    id: 'photosynthesis',
    topic: 'photosynthesis',
    title: 'Photosynthesis & Solar Energy Lab',
    category: 'Science',
    icon: '🌱',
    summary: 'How green plants turn sunlight, water, and air into delicious plant food and fresh oxygen!',
    keyRule: 'Sunlight + Water (H₂O) + Carbon Dioxide (CO₂) ➔ Glucose Sugar + Oxygen (O₂)',
    slider1: {
      label: 'Sunlight Intensity',
      unit: '%',
      min: 0,
      max: 100,
      defaultVal: 65,
    },
    slider2: {
      label: 'Water Moisture',
      unit: '%',
      min: 0,
      max: 100,
      defaultVal: 60,
    },
    stages: [
      {
        title: 'Roots Drink Water',
        description: 'Tiny root hairs absorb water from deep in the soil and pump it upward.',
        visualEmoji: '💧',
        indicator: 'Absorption Phase',
      },
      {
        title: 'Leaves Catch Light',
        description: 'Green chlorophyll pigments catch photons of sun energy like tiny solar panels.',
        visualEmoji: '☀️',
        indicator: 'Solar Capture Phase',
      },
      {
        title: 'Making Sweet Sugars',
        description: 'The plant links water and carbon atoms together, releasing clean air for us to breathe!',
        visualEmoji: '🍃',
        indicator: 'Energy Release Phase',
      },
    ],
    quickChallenge: 'Balance Sunlight and Water both between 50% and 75% to achieve maximum photosynthesis bloom!',
  },
  fractions: {
    id: 'fractions',
    topic: 'fractions',
    title: 'Visual Pizza Fraction Explorer',
    category: 'Math',
    icon: '🍕',
    summary: 'A fraction is a slice of a whole! The bottom number is how many equal parts exist, and the top number is how many you have.',
    keyRule: 'Numerator (top) ÷ Denominator (bottom) = Part of the Whole',
    slider1: {
      label: 'Selected Slices (Numerator)',
      unit: ' slices',
      min: 1,
      max: 8,
      defaultVal: 3,
    },
    slider2: {
      label: 'Total Slices (Denominator)',
      unit: ' parts',
      min: 2,
      max: 8,
      defaultVal: 4,
    },
    stages: [
      {
        title: 'One Whole Object',
        description: 'A complete unbroken pie or shape represents the number 1.',
        visualEmoji: '🌕',
        indicator: '1 Whole (4/4)',
      },
      {
        title: 'Equal Division',
        description: 'Cutting the pie into equal parts gives us our denominator (bottom number).',
        visualEmoji: '🌓',
        indicator: 'Halfway (2/4 = 1/2)',
      },
      {
        title: 'Taking Your Slices',
        description: 'Counting the highlighted slices gives us our numerator (top number).',
        visualEmoji: '🍕',
        indicator: 'Fraction in Action',
      },
    ],
    quickChallenge: 'Can you adjust the sliders so the fraction equals exactly 1/2 (e.g. 2/4 or 4/8)?',
  },
  gravity: {
    id: 'gravity',
    topic: 'gravity',
    title: 'Gravity & Planetary Orbit Lab',
    category: 'Science',
    icon: '🪐',
    summary: 'Gravity is the invisible pulling force between all objects that have mass. Bigger objects pull stronger!',
    keyRule: 'Greater Mass = Stronger Pull | Greater Distance = Weaker Pull',
    slider1: {
      label: 'Planet Mass / Weight',
      unit: 'x Earth',
      min: 1,
      max: 10,
      defaultVal: 5,
    },
    slider2: {
      label: 'Orbit Distance',
      unit: ' AU',
      min: 1,
      max: 8,
      defaultVal: 3,
    },
    stages: [
      {
        title: 'Mass Bends Space',
        description: 'Heavy objects like the Sun bend the space fabric around them like a bowling ball on a trampoline.',
        visualEmoji: '⚽',
        indicator: 'Curvature',
      },
      {
        title: 'The Invisible Rope',
        description: 'Gravity acts like a tether keeping planets spinning in an orbit rather than flying off into deep space.',
        visualEmoji: '🔄',
        indicator: 'Centripetal Pull',
      },
      {
        title: 'Weight on Other Worlds',
        description: 'On Jupiter you would feel 2.5 times heavier because it has so much more gravity than Earth!',
        visualEmoji: '🚀',
        indicator: 'Surface Gravity',
      },
    ],
    quickChallenge: 'Increase Planet Mass to 8x and watch how strong the gravitational pull arrows become!',
  },
  watercycle: {
    id: 'watercycle',
    topic: 'water cycle',
    title: 'Water Cycle & Weather Simulator',
    category: 'Science',
    icon: '🌧️',
    summary: 'Earth recycling water forever! Water evaporates into clouds, condenses, and falls back down as rain.',
    keyRule: 'Evaporation ➔ Condensation ➔ Precipitation ➔ Collection',
    slider1: {
      label: 'Atmosphere Temperature',
      unit: '°C',
      min: 0,
      max: 45,
      defaultVal: 28,
    },
    slider2: {
      label: 'Cloud Moisture',
      unit: '%',
      min: 10,
      max: 100,
      defaultVal: 80,
    },
    stages: [
      {
        title: '1. Evaporation',
        description: 'Sun heat warms puddles, rivers, and oceans, turning liquid water into invisible floating vapor.',
        visualEmoji: '♨️',
        indicator: 'Rising Vapor',
      },
      {
        title: '2. Condensation',
        description: 'High in the chilly sky, vapor cools and bunches together with dust specks into fluffy clouds.',
        visualEmoji: '☁️',
        indicator: 'Cloud Building',
      },
      {
        title: '3. Precipitation',
        description: 'When clouds get too heavy with liquid drops, gravity pulls them down as rain, snow, or hail!',
        visualEmoji: '🌧️',
        indicator: 'Rain Shower',
      },
    ],
    quickChallenge: 'Crank Cloud Moisture past 85% to trigger a heavy rain shower!',
  },
  loops: {
    id: 'loops',
    topic: 'loops',
    title: 'Coding Loop & Algorithm Sandbox',
    category: 'Coding',
    icon: '🔁',
    summary: 'A loop tells a computer to repeat instructions again and again so you do not have to write them 1,000 times!',
    keyRule: 'repeat (count) { do_action(); }',
    slider1: {
      label: 'Loop Repeat Count',
      unit: ' times',
      min: 1,
      max: 8,
      defaultVal: 4,
    },
    stages: [
      {
        title: 'Step 1: Check Condition',
        description: 'The computer checks: "Did I finish all repeats yet?"',
        visualEmoji: '🧐',
        indicator: 'Evaluation',
      },
      {
        title: 'Step 2: Run The Block',
        description: 'If not finished, execute the code inside the curly braces { ... }.',
        visualEmoji: '⚙️',
        indicator: 'Execution',
      },
      {
        title: 'Step 3: Increment Counter',
        description: 'Add 1 to the counter and jump back to the top of the loop!',
        visualEmoji: '🔄',
        indicator: 'Iteration',
      },
    ],
    quickChallenge: 'Set repeat count to 5 and watch the code loop run 5 sequential jumps!',
  },
  inventions: {
    id: 'inventions',
    topic: 'inventions',
    title: '1,000 Years of World-Changing Inventions',
    category: 'History',
    icon: '💡',
    summary: 'From Gutenberg\'s printing press (1440) and steam engines (1769) to airplanes (1903) and computers!',
    keyRule: 'Curiosity + Human Need + Experimentation ➔ Revolutionary Invention',
    slider1: {
      label: 'Timeline Year',
      unit: ' AD',
      min: 1000,
      max: 2026,
      defaultVal: 1903,
    },
    slider2: {
      label: 'Global Impact Level',
      unit: '%',
      min: 10,
      max: 100,
      defaultVal: 95,
    },
    stages: [
      {
        title: '1440: Gutenberg\'s Printing Press',
        description: 'Movable metal letters allowed books to be mass-printed so everyone could learn to read!',
        visualEmoji: '📜',
        indicator: 'Information Revolution',
      },
      {
        title: '1903: Wright Brothers\' Airplane',
        description: 'At Kitty Hawk, North Carolina, Orville and Wilbur Wright achieved the first powered, sustained flight!',
        visualEmoji: '✈️',
        indicator: 'Aviation Age',
      },
      {
        title: '1969: Apollo 11 Moon Landing',
        description: 'Neil Armstrong and Buzz Aldrin walked on the Moon — one giant leap for mankind!',
        visualEmoji: '🌕',
        indicator: 'Space Age',
      },
    ],
    quickChallenge: 'Slide the timeline to 1903 to explore the Wright Brothers\' first powered flight!',
  },
  sports: {
    id: 'sports',
    topic: 'sports',
    title: 'Legendary Sports Moments & Olympic Records',
    category: 'History',
    icon: '🏅',
    summary: 'Historic sports breakthroughs: Jesse Owens (1936), Roger Bannister\'s 4-minute mile (1954), Pelé\'s World Cups, and Nadia\'s perfect 10!',
    keyRule: 'Dedication + Training + Resilience ➔ Historic Sports Mastery',
    slider1: {
      label: 'Historic Sports Era',
      unit: ' AD',
      min: 1896,
      max: 2026,
      defaultVal: 1954,
    },
    slider2: {
      label: 'Barrier Breaking Speed',
      unit: ' mph',
      min: 10,
      max: 28,
      defaultVal: 15,
    },
    stages: [
      {
        title: '1936 Berlin: Jesse Owens',
        description: 'Jesse Owens won 4 Olympic gold medals with unmatched courage and speed, inspiring the world.',
        visualEmoji: '🏃',
        indicator: 'Olympic Legend',
      },
      {
        title: '1954: Roger Bannister\'s 4-Minute Mile',
        description: 'Doctors claimed running a mile in under 4 minutes was impossible until Bannister clocked 3:59.4!',
        visualEmoji: '⏱️',
        indicator: 'Barrier Smashed',
      },
      {
        title: '1958-1970: Pelé & World Cup Glory',
        description: 'Pelé captivated the planet with dazzling football artistry, winning 3 World Cup trophies!',
        visualEmoji: '⚽',
        indicator: 'King of Football',
      },
    ],
    quickChallenge: 'Slide to 1954 to see how Roger Bannister broke the impossible 4-minute mile barrier!',
  },
};

// Fallback dynamic generator for any custom topic requested
export function getInteractiveLessonForTopic(topic: string, ageBand: AgeBand): InteractiveConceptLesson {
  const normalized = topic.toLowerCase().trim();

  // Check known presets
  for (const [key, preset] of Object.entries(PRESET_TOPIC_LESSONS)) {
    if (normalized.includes(key) || preset.title.toLowerCase().includes(normalized)) {
      return preset;
    }
  }

  // Synthesize a structured interactive concept lesson for any custom topic
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);

  return {
    id: `custom-${normalized.replace(/\s+/g, '-')}`,
    topic: normalized,
    title: `${capitalizedTopic} Concept Lab`,
    category: 'General',
    icon: '🔬',
    summary: `Interactive hands-on breakdown of ${capitalizedTopic} for young explorers!`,
    keyRule: `Input & Cause ➔ Transformation / Interaction ➔ Output & Effect`,
    slider1: {
      label: `${capitalizedTopic} Intensity / Power`,
      unit: '%',
      min: 0,
      max: 100,
      defaultVal: 50,
    },
    slider2: {
      label: `Interaction Speed`,
      unit: 'x',
      min: 1,
      max: 5,
      defaultVal: 2,
    },
    stages: [
      {
        title: `Phase 1: Starting State of ${capitalizedTopic}`,
        description: `How ${capitalizedTopic} begins and what components are involved before action happens.`,
        visualEmoji: '🔍',
        indicator: 'Stage 1: Observation',
      },
      {
        title: `Phase 2: The Core Reaction / Mechanism`,
        description: `The active process where energy, force, or logic changes the system.`,
        visualEmoji: '⚡',
        indicator: 'Stage 2: Action',
      },
      {
        title: `Phase 3: The Big Discovery / Result`,
        description: `What we observe in nature, science, or math once the process completes.`,
        visualEmoji: '✨',
        indicator: 'Stage 3: Conclusion',
      },
    ],
    quickChallenge: `Slide the Intensity past 70% to observe how ${capitalizedTopic} behaves under high energy!`,
  };
}

export const POPULAR_EXPLAIN_TOPICS = [
  { label: 'Explain Inventions 💡', topic: 'inventions' },
  { label: 'Explain Sports History 🏅', topic: 'sports' },
  { label: 'Explain Fractions 🍕', topic: 'fractions' },
  { label: 'Explain Photosynthesis 🌱', topic: 'photosynthesis' },
  { label: 'Explain Gravity 🪐', topic: 'gravity' },
  { label: 'Explain Water Cycle 🌧️', topic: 'water cycle' },
  { label: 'Explain Coding Loops 🔁', topic: 'loops' },
];

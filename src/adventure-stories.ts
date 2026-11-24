/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HeroProfile {
  name: string;
  avatar: string; // Emoji avatar
  title: string;
  stars: number;
  inventory: string[];
}

export interface StoryChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  subjectType: 'math' | 'science';
  conceptTag: string; // e.g. "Counting (3+2)", "Floating & Sinking", "Animal Habitats"
  explanation: string; // Encouraging explanation for why it works or gentle hint
  outcomeNarrative: string; // What happens in the story next when chosen
  earnedItem?: string; // Item placed into backpack
}

export interface StoryScene {
  id: string;
  chapterNumber: number;
  title: string;
  sceneEmoji: string;
  location: string;
  narrative: string;
  challengePrompt: string; // The specific problem the hero must solve
  visualHelper?: {
    type: 'counter' | 'emoji-row' | 'shapes';
    items: string[];
    hintText?: string;
  };
  choices: StoryChoice[];
}

export interface AdventureQuest {
  id: string;
  title: string;
  subtitle: string;
  theme: 'space' | 'dino' | 'ocean' | 'magic' | 'custom' | 'math' | 'science' | 'coding' | 'nature' | 'food' | 'history';
  subject?: string;
  topic?: string;
  themeEmoji: string;
  accentColor: string; // Tailwind gradient classes
  bgGradient: string;
  description: string;
  scenes: StoryScene[];
  victoryReward: {
    badgeName: string;
    badgeEmoji: string;
    congratulations: string;
    followUpQuestion: string; // For Tutorly chat
  };
}

export const HERO_AVATARS = [
  { id: 'astronaut', emoji: '🚀', label: 'Cosmic Astro-Kid', defaultName: 'Captain Nova' },
  { id: 'time-traveler', emoji: '⏳', label: 'History Time Traveler', defaultName: 'Historian Alex' },
  { id: 'dino', emoji: '🦖', label: 'Dino Ranger', defaultName: 'Scout Maya' },
  { id: 'diver', emoji: '🌊', label: 'Ocean Explorer', defaultName: 'Captain Sam' },
  { id: 'wizard', emoji: '🧙', label: 'Magic Wizard', defaultName: 'Spellbinder Leo' },
  { id: 'detective', emoji: '🔍', label: 'Mystery Detective', defaultName: 'Detective Pip' },
  { id: 'superhero', emoji: '⚡', label: 'Super Hero', defaultName: 'Hero Dash' },
];

export const PRESET_QUESTS: AdventureQuest[] = [
  {
    id: 'space-moon-mystery',
    title: 'The Cosmic Moon Mystery',
    subtitle: 'Blast off in your star rocket to find the lost moon crystal!',
    theme: 'space',
    subject: 'Science',
    topic: 'Solar System & Moon Gravity',
    themeEmoji: '🚀',
    accentColor: 'from-blue-600 via-indigo-600 to-purple-600',
    bgGradient: 'bg-gradient-to-b from-indigo-950 via-slate-900 to-blue-950 text-white',
    description: 'Help Captain Nova launch the spaceship, repair solar panels, and explore low gravity on the moon!',
    scenes: [
      {
        id: 'space-scene-1',
        chapterNumber: 1,
        title: 'Rocket Blastoff Fuel',
        sceneEmoji: '🚀',
        location: 'Cape Starlight Launchpad',
        narrative:
          'Your countdown is ticking! 3... 2... 1! But wait! The rocket engine computer needs you to fuel the booster tanks. The left tank has 4 red fuel cells and the right tank has 3 blue fuel cells. How many fuel cells do you have in all to launch?',
        challengePrompt: 'Count all the fuel cells together: 4 + 3 = ?',
        visualHelper: {
          type: 'emoji-row',
          items: ['🔋', '🔋', '🔋', '🔋', '➕', '🔋', '🔋', '🔋'],
          hintText: 'Count 4 red cells, then keep counting: 5, 6, 7!',
        },
        choices: [
          {
            id: 'c1-7',
            text: '7 Fuel Cells (4 + 3 = 7)',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Addition (4+3)',
            explanation: 'Woohoo! 4 + 3 equals 7! The rocket thrusters roar with fiery bright orange power!',
            outcomeNarrative:
              'WHOOSH! The engines ignite with a cheerful golden flame! Your rocket zooms past fluffy white clouds and shoots straight into the sparkling night sky!',
            earnedItem: 'Star Pilot Helmet 🧑‍🚀',
          },
          {
            id: 'c1-5',
            text: '5 Fuel Cells',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Addition (4+3)',
            explanation: 'Almost! 4 + 1 is 5, but we have 3 more blue cells! Let us count together: 1, 2, 3, 4... 5, 6, 7!',
            outcomeNarrative: 'The engine beeps gently: "Add just a little more fuel, Pilot!"',
          },
          {
            id: 'c1-6',
            text: '6 Fuel Cells',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Addition (4+3)',
            explanation: 'Very close! One more cell and we reach 7! Count: 4 plus 3 is 7!',
            outcomeNarrative: 'The rocket dial wiggles close to full!',
          },
        ],
      },
      {
        id: 'space-scene-2',
        chapterNumber: 2,
        title: 'Moon Landing & Gravity',
        sceneEmoji: '🌕',
        location: 'The Silver Moon Crater',
        narrative:
          'TOUCHDOWN! Your lunar rover lands on the soft silver dust of the Moon. You step outside and feel super light! You pick up a bouncy moon pebble and drop it. What happens because the Moon has less gravity than Earth?',
        challengePrompt: 'What happens to the rock when you drop it in low gravity?',
        visualHelper: {
          type: 'counter',
          items: ['🌍 Earth: Strong gravity', '🌕 Moon: Less gravity'],
          hintText: 'On Earth things fall fast. In lower gravity, things float and fall slow motion!',
        },
        choices: [
          {
            id: 'c2-float',
            text: 'It floats down gently and falls slowly! 🪶',
            isCorrect: true,
            subjectType: 'science',
            conceptTag: 'Moon Gravity',
            explanation: 'Spot on! The Moon is smaller than Earth, so its gravity pulls with less force. Everything floats down gently!',
            outcomeNarrative:
              'You leap into the air in slow motion — BOING! You jump as high as a house and catch the glowing moon crystal hovering above the crater!',
            earnedItem: 'Anti-Gravity Boots 🥾',
          },
          {
            id: 'c2-fast',
            text: 'It falls ten times faster than on Earth ⚡',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Moon Gravity',
            explanation: 'Good try! But on the Moon, gravity is weaker, not stronger! So objects fall slower, not faster!',
            outcomeNarrative: 'The lunar rover assistant reminds you: "Gravity here is six times lighter!"',
          },
          {
            id: 'c2-vanish',
            text: 'It turns into purple smoke and disappears 💨',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Moon Gravity',
            explanation: 'Silly guess! Gravity pulls things down, it does not make rocks turn into smoke!',
            outcomeNarrative: 'The rock is still sitting right there waiting for you!',
          },
        ],
      },
      {
        id: 'space-scene-3',
        chapterNumber: 3,
        title: 'The Blinking Satellite Pattern',
        sceneEmoji: '🛰️',
        location: 'Orbital Beacon Station',
        narrative:
          'To send your victory signal back to Earth, you must program the satellite beacon! The antenna lights flash in a special secret pattern: 🔴 Red, 🟡 Yellow, 🔴 Red, 🟡 Yellow, 🔴 Red... Which color light must come next?',
        challengePrompt: 'What comes next in the pattern: Red, Yellow, Red, Yellow, Red, ___?',
        visualHelper: {
          type: 'emoji-row',
          items: ['🔴', '🟡', '🔴', '🟡', '🔴', '❓'],
          hintText: 'Say the colors out loud: Red, Yellow... Red, Yellow... Red... ?',
        },
        choices: [
          {
            id: 'c3-yellow',
            text: '🟡 Yellow Light',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Pattern Recognition',
            explanation: 'Genius! Red, Yellow, Red, Yellow, Red, YELLOW! The repeating pattern unlocks the communications satellite!',
            outcomeNarrative:
              'BEEP BEEP DING! The solar satellite extends its wings and chimes in harmony. Earth Mission Control receives your crystal clear message!',
            earnedItem: 'Cosmic Star Communicator 📻',
          },
          {
            id: 'c3-green',
            text: '🟢 Green Light',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Pattern Recognition',
            explanation: 'Green is pretty, but look at the pattern: Red, Yellow, Red, Yellow... only two colors repeat!',
            outcomeNarrative: 'The satellite screen says: "Look at the first two repeating colors!"',
          },
          {
            id: 'c3-red',
            text: '🔴 Red Light',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Pattern Recognition',
            explanation: 'Two reds never stand together in this pattern! After Red comes Yellow!',
            outcomeNarrative: 'The satellite clicks gently: "Try repeating the sequence rhythm!"',
          },
        ],
      },
      {
        id: 'space-scene-4',
        chapterNumber: 4,
        title: 'Melting the Cosmic Ice Door',
        sceneEmoji: '🧊',
        location: 'The Hidden Moon Observatory',
        narrative:
          'The treasure door is sealed shut by thick frozen space ice! To turn this solid ice into liquid water and open the latch, what natural energy should your hero shine onto the door?',
        challengePrompt: 'How do you turn solid ice into liquid water?',
        visualHelper: {
          type: 'counter',
          items: ['🧊 Solid Ice', '➡️ Needs Heat ☀️', '💧 Liquid Water'],
          hintText: 'Ice melts when it gets warm and absorbs heat!',
        },
        choices: [
          {
            id: 'c4-sunlight',
            text: '☀️ Warm Sunlight (Heat energy melts ice into water)',
            isCorrect: true,
            subjectType: 'science',
            conceptTag: 'States of Matter (Melting)',
            explanation: 'Hooray! Heat warms the ice molecules up until they turn from solid ice into flowing liquid water!',
            outcomeNarrative:
              'You tilt the solar mirror, focusing golden warm rays! The ice melts in sparkling droplets, revealing the legendary Golden Star Compass!',
            earnedItem: 'Golden Star Compass 🧭',
          },
          {
            id: 'c4-cold',
            text: '❄️ A giant freezing blizzard blast',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'States of Matter (Melting)',
            explanation: 'Freezing cold makes ice even harder! To make it melt, we need warmth and heat!',
            outcomeNarrative: 'The ice just shivers and stays frozen solid!',
          },
          {
            id: 'c4-dark',
            text: '🌑 Put a blanket over it in the dark',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'States of Matter (Melting)',
            explanation: 'A blanket in the dark space stays chilly. Heat from the Sun is what makes ice melt!',
            outcomeNarrative: 'The dark shadow keeps the ice cold.',
          },
        ],
      },
    ],
    victoryReward: {
      badgeName: 'Master Galactic Explorer',
      badgeEmoji: '🌟',
      congratulations:
        'You saved the lunar mission! By counting fuel, understanding moon gravity, completing color patterns, and melting ice with heat, you proved you are a top space hero!',
      followUpQuestion: 'Can you tell me more about why people can jump so high on the Moon?',
    },
  },
  {
    id: 'dino-safari-quest',
    title: 'The Lost Baby Triceratops',
    subtitle: 'Track footprints, cross rivers, and reunite baby Trike with mama!',
    theme: 'dino',
    subject: 'Science',
    topic: 'Dinosaurs & Herbivore Science',
    themeEmoji: '🦖',
    accentColor: 'from-emerald-600 via-teal-600 to-green-600',
    bgGradient: 'bg-gradient-to-b from-teal-950 via-emerald-950 to-slate-950 text-white',
    description: 'Use herbivore science, counting, sinking vs floating, and shape recognition in the ancient prehistoric jungle!',
    scenes: [
      {
        id: 'dino-scene-1',
        chapterNumber: 1,
        title: 'Feeding Hungry Little Trike',
        sceneEmoji: '🦕',
        location: 'Fern Valley Clearing',
        narrative:
          'Deep in the green jungle, you discover a tiny baby Triceratops stuck behind a bush. His tummy grumbles: RUUUMBLE! Triceratops dinosaurs are famous herbivores. What should you feed your new dino buddy?',
        challengePrompt: 'What does an herbivore eat?',
        visualHelper: {
          type: 'counter',
          items: ['🌿 Herbivore = Plant Eater', '🥩 Carnivore = Meat Eater'],
          hintText: 'Herb means plant! Triceratops loved chewing on ferns and shrubs!',
        },
        choices: [
          {
            id: 'd1-ferns',
            text: '🌿 Juicy green fern leaves & sweet berries!',
            isCorrect: true,
            subjectType: 'science',
            conceptTag: 'Herbivores vs Carnivores',
            explanation: 'Spot on! Triceratops has flat teeth made for chewing tough jungle plants and ferns!',
            outcomeNarrative:
              'Little Trike munches happily: CRUNCH CRUNCH! He wags his tail and nuzzles your shoulder. He trusts you as his hero guide!',
            earnedItem: 'Dino Ranger Whistle 🪈',
          },
          {
            id: 'd1-meat',
            text: '🥩 A giant barbecued steak',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Herbivores vs Carnivores',
            explanation: 'Triceratops does not eat meat! Meat is for carnivores like T-Rex. Baby Trike needs green plants!',
            outcomeNarrative: 'Little Trike sniffs the meat and turns his head away!',
          },
          {
            id: 'd1-pizza',
            text: '🍕 Pepperoni pizza and soda',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Herbivores vs Carnivores',
            explanation: 'Dinosaurs lived millions of years before pizza was invented! They eat real plants from nature.',
            outcomeNarrative: 'Little Trike looks at you like you are joking!',
          },
        ],
      },
      {
        id: 'dino-scene-2',
        chapterNumber: 2,
        title: 'The Stepping Stone River',
        sceneEmoji: '🌊',
        location: 'Swampy River Crossing',
        narrative:
          'To reach the big valley, you need to cross a bubbly river. There were 8 big flat rocks in the water, but splashing water washed away 3 of them! How many dry stepping stones are left to step across?',
        challengePrompt: 'Calculate the remaining stepping stones: 8 - 3 = ?',
        visualHelper: {
          type: 'emoji-row',
          items: ['🪨', '🪨', '🪨', '🪨', '🪨', '❌', '❌', '❌'],
          hintText: 'Start with 8 stones and count back 3: 7, 6, 5!',
        },
        choices: [
          {
            id: 'd2-5',
            text: '5 Stepping Stones (8 - 3 = 5)',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Subtraction (8-3)',
            explanation: 'Awesome! 8 minus 3 leaves 5 solid stones! Perfectly spaced for you and Trike!',
            outcomeNarrative:
              'Hop, hop, hop, hop, HOP! You and baby Trike leap across the 5 dry stones with zero wet shoes!',
            earnedItem: 'Swamp Scout Compass 🧭',
          },
          {
            id: 'd2-4',
            text: '4 Stepping Stones',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Subtraction (8-3)',
            explanation: 'Close! If you take 3 away from 8: 8 - 3 is 5! Count the remaining rocks again.',
            outcomeNarrative: 'You check the water again carefully.',
          },
          {
            id: 'd2-6',
            text: '6 Stepping Stones',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Subtraction (8-3)',
            explanation: 'One too many! 8 minus 2 is 6, but we lost 3 rocks! 8 - 3 = 5!',
            outcomeNarrative: 'Count the stones on your fingers: 8 fingers down 3 fingers!',
          },
        ],
      },
      {
        id: 'dino-scene-3',
        chapterNumber: 3,
        title: 'Building a Floating Raft',
        sceneEmoji: '🪵',
        location: 'Deep Dino Lake',
        narrative:
          'The lake is too deep to wade through. You need to build a raft so baby Trike can float safely across. Which material will float on top of the water instead of sinking to the bottom?',
        challengePrompt: 'Which item will float on water?',
        visualHelper: {
          type: 'counter',
          items: ['🪵 Light wood: Floats on top!', '🪨 Heavy iron rock: Sinks down!'],
          hintText: 'Wood is less dense than water, so it bobs on top like a cork!',
        },
        choices: [
          {
            id: 'd3-wood',
            text: '🪵 Thick dry wooden tree logs (wood floats!)',
            isCorrect: true,
            subjectType: 'science',
            conceptTag: 'Sink or Float (Density)',
            explanation: 'Brilliant! Wood floats because it is less dense than water and traps tiny air pockets!',
            outcomeNarrative:
              'You lash the logs together with vine ropes. Plop! It floats like a champion raft, carrying you and Trike across the calm blue lake!',
            earnedItem: 'Explorer Vine Rope 🪢',
          },
          {
            id: 'd3-rock',
            text: '🪨 Giant heavy iron boulders',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Sink or Float (Density)',
            explanation: 'Heavy solid iron and stones sink straight to the bottom: KER-PLUNK!',
            outcomeNarrative: 'The rock sinks like an anchor straight down to the lake bed!',
          },
          {
            id: 'd3-lead',
            text: '⛓️ Heavy metal chains',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Sink or Float (Density)',
            explanation: 'Metal chains sink fast! We need light buoyant wood that floats!',
            outcomeNarrative: 'The chains plunge down into the deep mud!',
          },
        ],
      },
      {
        id: 'dino-scene-4',
        chapterNumber: 4,
        title: 'The Three-Horned Crest Shape',
        sceneEmoji: '🦕',
        location: 'The Great Dino Meadow',
        narrative:
          'You hear a friendly low rumble in the trees: HONK! It is Mama Triceratops! Her big shield has a decorative shape with exactly 3 straight sides and 3 sharp corners. Which shape matches her crown?',
        challengePrompt: 'Which geometric shape has 3 straight sides and 3 corners?',
        visualHelper: {
          type: 'shapes',
          items: ['🔺 Triangle: 3 sides', '🟦 Square: 4 sides', '⭕ Circle: 0 straight sides'],
          hintText: 'Tri- means three! Triangle = 3 sides, Triceratops = 3 horns!',
        },
        choices: [
          {
            id: 'd4-triangle',
            text: '🔺 A Triangle (3 sides and 3 corners)',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: '2D Shapes (Triangle)',
            explanation: 'You nailed it! "Tri" means three! Three horns on Triceratops, three sides on a triangle!',
            outcomeNarrative:
              'Mama Triceratops sees you holding up the triangle leaf! She rejoices, gently scooping little Trike into her warm embrace! Both dinos nuzzle you gratefully!',
            earnedItem: 'Golden Triceratops Crest 🛡️',
          },
          {
            id: 'd4-square',
            text: '🟦 A Square (4 sides)',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: '2D Shapes (Triangle)',
            explanation: 'A square has 4 sides and 4 corners! We need the shape with 3 sides!',
            outcomeNarrative: 'Mama points with her snout to her 3 horns.',
          },
          {
            id: 'd4-circle',
            text: '⭕ A Circle (0 straight sides)',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: '2D Shapes (Triangle)',
            explanation: 'A circle is completely round with no corners! Tri means 3 sides!',
            outcomeNarrative: 'Count the sides: 1, 2, 3!',
          },
        ],
      },
    ],
    victoryReward: {
      badgeName: 'Chief Dino Scout',
      badgeEmoji: '🦕',
      congratulations:
        'You reunited the baby Triceratops with his loving family! You mastered herbivore plant diets, rock subtraction, floating wood science, and triangle shapes!',
      followUpQuestion: 'Why did dinosaurs like Triceratops have giant bone frills on their heads?',
    },
  },
  {
    id: 'ocean-coral-rescue',
    title: 'The Deep Sea Pearl Rescue',
    subtitle: 'Dive deep into glowing coral reefs to save the Sea Turtle and find the Pearl!',
    theme: 'ocean',
    subject: 'Science',
    topic: 'Ocean Life & Sea Creatures',
    themeEmoji: '🌊',
    accentColor: 'from-cyan-600 via-blue-600 to-indigo-600',
    bgGradient: 'bg-gradient-to-b from-sky-950 via-cyan-950 to-blue-950 text-white',
    description: 'Learn how dolphins breathe air, count starfish arms, discover bioluminescent glowing sea creatures, and balance scales!',
    scenes: [
      {
        id: 'ocean-scene-1',
        chapterNumber: 1,
        title: 'Meeting Dolphin Echo',
        sceneEmoji: '🐬',
        location: 'Sunlit Coral Reef',
        narrative:
          'You dive under the turquoise waves in your diving suit! A friendly dolphin named Echo zooms around you doing backflips. Echo needs to take a deep breath of fresh air. Where does a dolphin go to breathe?',
        challengePrompt: 'How do dolphins breathe air?',
        visualHelper: {
          type: 'counter',
          items: ['🐬 Dolphin: Mammal with lungs', '🌊 Must swim to the surface for air!'],
          hintText: 'Dolphins breathe air just like us using a blowhole on top of their head!',
        },
        choices: [
          {
            id: 'o1-surface',
            text: '🌊 Swims to the surface and breathes through its blowhole!',
            isCorrect: true,
            subjectType: 'science',
            conceptTag: 'Marine Mammals',
            explanation: 'Exactly! Dolphins are mammals with lungs, not gills! They swim to the ocean surface to breathe air through their blowholes!',
            outcomeNarrative:
              'Echo zooms to the top — WHOOSH! — takes a big fresh breath of air, and dives back down to guide your submarine toward the hidden reef!',
            earnedItem: 'Dolphin Friendship Pearl 🦪',
          },
          {
            id: 'o1-sand',
            text: '🏖️ Buries its head in the sand to find air bubbles',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Marine Mammals',
            explanation: 'Dolphins cannot get air from sand! They swim up to the breezy open air above the ocean!',
            outcomeNarrative: 'Echo gently shakes his head and points his flipper toward the surface!',
          },
          {
            id: 'o1-gills',
            text: '🐟 Stays at the bottom forever using fish gills',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Marine Mammals',
            explanation: 'Fish have gills, but dolphins are mammals with lungs! They must breathe air at the surface!',
            outcomeNarrative: 'Echo taps his blowhole playfully!',
          },
        ],
      },
      {
        id: 'ocean-scene-2',
        chapterNumber: 2,
        title: 'The Starfish Arms Math',
        sceneEmoji: '⭐',
        location: 'Rainbow Anemone Garden',
        narrative:
          'Resting on a soft pink coral, you spot 2 happy orange starfish. Each starfish has 5 pointy arms. How many starfish arms are there altogether?',
        challengePrompt: 'Count all the starfish arms: 5 + 5 = ?',
        visualHelper: {
          type: 'emoji-row',
          items: ['⭐ (5 arms)', '➕', '⭐ (5 arms)'],
          hintText: 'Count 5 on one hand, and 5 on your other hand: 5 + 5 = ?',
        },
        choices: [
          {
            id: 'o2-10',
            text: '10 Arms (5 + 5 = 10)',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Addition (5+5 / Doubles)',
            explanation: 'High ten! 5 + 5 equals 10! You counted both starfish arms without missing a single one!',
            outcomeNarrative:
              'The starfish wiggle all 10 arms in a merry ocean dance! They shift aside, uncovering the entrance to the glowing underwater cavern!',
            earnedItem: 'Starfish Coral Key 🗝️',
          },
          {
            id: 'o2-8',
            text: '8 Arms',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Addition (5+5 / Doubles)',
            explanation: 'Think of both of your hands! 5 fingers on left hand, 5 on right hand: 5 + 5 = 10!',
            outcomeNarrative: 'Count on your fingers: 1 2 3 4 5, 6 7 8 9 10!',
          },
          {
            id: 'o2-7',
            text: '7 Arms',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Addition (5+5 / Doubles)',
            explanation: 'Count both starfish together: 5 + 5 = 10!',
            outcomeNarrative: 'Check the fingers on both your hands!',
          },
        ],
      },
      {
        id: 'ocean-scene-3',
        chapterNumber: 3,
        title: 'Lighting the Dark Abyss',
        sceneEmoji: '💡',
        location: 'The Midnight Ocean Trench',
        narrative:
          'Your submarine enters the deep trench. Sunlight cannot reach this deep, so it is pitch black! Suddenly you need a light to navigate the rocks. Which creature makes its own magical bioluminescent light?',
        challengePrompt: 'Which sea creature glows with its own light?',
        visualHelper: {
          type: 'counter',
          items: ['💡 Anglerfish: Glowing light dangling on head!', '🦀 Sea Crab: No light.'],
          hintText: 'Some deep sea fish have glowing lanterns on their heads called bioluminescence!',
        },
        choices: [
          {
            id: 'o3-angler',
            text: '💡 Deep Sea Anglerfish (glows with bioluminescent light!)',
            isCorrect: true,
            subjectType: 'science',
            conceptTag: 'Bioluminescence',
            explanation: 'Incredible science! Deep sea anglerfish have a glowing lure that produces biological light in the pitch-dark deep ocean!',
            outcomeNarrative:
              'A friendly little lantern fish swims ahead, illuminating the dark rocky tunnel with soft sea-green sparkles so you can steer safely!',
            earnedItem: 'Bioluminescent Glow Lantern 🏮',
          },
          {
            id: 'o3-turtle',
            text: '🐢 A sea turtle wearing a flashlight',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Bioluminescence',
            explanation: 'Sea turtles are lovely, but they cannot make their own light in nature!',
            outcomeNarrative: 'The turtle swims peacefully without any light.',
          },
          {
            id: 'o3-sponge',
            text: '🧽 A common bath sponge',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Bioluminescence',
            explanation: 'Sponges just sit quietly on rocks. Deep sea lantern fish make real living light!',
            outcomeNarrative: 'The sponge stays completely dark.',
          },
        ],
      },
      {
        id: 'ocean-scene-4',
        chapterNumber: 4,
        title: 'The Sea Shell Balance Scale',
        sceneEmoji: '⚖️',
        location: 'The Sunken Pearl Chamber',
        narrative:
          'To unlock the treasure chest holding the Rainbow Pearl, you must balance the golden oyster scale! The left side has 6 shiny pearl marbles. The right side only has 2 marbles. How many more marbles do you need to add to the right side so both sides equal 6?',
        challengePrompt: 'What number makes the sides equal: 2 + ___ = 6?',
        visualHelper: {
          type: 'emoji-row',
          items: ['Left Scale: ⚪⚪⚪⚪⚪⚪ (6)', '⚖️', 'Right Scale: ⚪⚪ (2) ➕ ❓'],
          hintText: 'Count from 2 up to 6: 3, 4, 5, 6... that is 4 more!',
        },
        choices: [
          {
            id: 'o4-4',
            text: '4 Marbles (2 + 4 = 6)',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Balance / Missing Addend (2+?=6)',
            explanation: 'Spot on! 2 + 4 equals 6! Both sides of the golden oyster scale level out in perfect harmony!',
            outcomeNarrative:
              'CLINK! The golden oyster springs open, shining with iridescent pastel rainbow rays! You hold up the legendary Rainbow Pearl!',
            earnedItem: 'The Rainbow Pearl 🔮',
          },
          {
            id: 'o4-3',
            text: '3 Marbles',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Balance / Missing Addend (2+?=6)',
            explanation: '2 + 3 is 5, which is almost 6, but still tilted! We need 4 to make 6!',
            outcomeNarrative: 'The scale wobbles just a little bit low.',
          },
          {
            id: 'o4-5',
            text: '5 Marbles',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Balance / Missing Addend (2+?=6)',
            explanation: '2 + 5 is 7, which makes the right side too heavy! 2 + 4 = 6 is just right!',
            outcomeNarrative: 'The scale tips too far to the right!',
          },
        ],
      },
    ],
    victoryReward: {
      badgeName: 'Master Deep Sea Guardian',
      badgeEmoji: '🌊',
      congratulations:
        'You saved the reef ecosystem! You mastered dolphin breathing biology, double-number math, bioluminescent deep sea light, and scale balance!',
      followUpQuestion: 'How do fish breathe under water if they do not have lungs like dolphins?',
    },
  },
  {
    id: 'magic-garden-quest',
    title: 'The Enchanted Castle Garden',
    subtitle: 'Help the Wizard wake the sleeping dragon and bloom the royal flower!',
    theme: 'magic',
    subject: 'Math',
    topic: 'Addition, Plants & Dragon Math',
    themeEmoji: '🏰',
    accentColor: 'from-amber-500 via-pink-500 to-rose-600',
    bgGradient: 'bg-gradient-to-b from-purple-950 via-slate-900 to-rose-950 text-white',
    description: 'Learn what plants need to grow, mix wizard potion drops, identify nighttime nocturnal creatures, and solve color patterns!',
    scenes: [
      {
        id: 'magic-scene-1',
        chapterNumber: 1,
        title: 'Waking the Slumbering Giant Flower',
        sceneEmoji: '🌸',
        location: 'The Royal Courtyard',
        narrative:
          'Wizard Pip waves his starry wand over a giant closed flower bud: "Oh dear! The royal Wonder-Bloom has fallen fast asleep!" What two real things from nature does this magic plant need to wake up and grow strong?',
        challengePrompt: 'What two things do plants need to grow?',
        visualHelper: {
          type: 'counter',
          items: ['☀️ Bright Sunlight', '💧 Fresh Water'],
          hintText: 'Plants need warm sunlight to make food and water to drink through their roots!',
        },
        choices: [
          {
            id: 'm1-sun-water',
            text: '☀️ Warm Sunlight and 💧 Fresh Water!',
            isCorrect: true,
            subjectType: 'science',
            conceptTag: 'Plant Needs (Sun & Water)',
            explanation: 'Pure green magic! Plants use sunlight, water, and soil nutrients to make food through photosynthesis!',
            outcomeNarrative:
              'You open the castle skylight for the sun and pour cool water into the soil! The giant Wonder-Bloom unfolds with sweet strawberry scent and sparkling gold glitter!',
            earnedItem: 'Enchanted Watering Can 🪴',
          },
          {
            id: 'm1-chocolate',
            text: '🍫 Melted chocolate syrup and marshmallows',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Plant Needs (Sun & Water)',
            explanation: 'Plants love clean water and sunlight, not sugary candy! Candy would hurt the plant roots!',
            outcomeNarrative: 'Wizard Pip giggles: "Flowers do not eat desserts!"',
          },
          {
            id: 'm1-dark',
            text: '🌑 Locking it inside a dark closet with no windows',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Plant Needs (Sun & Water)',
            explanation: 'Plants without light turn pale and wilt. They need bright sunshine to grow!',
            outcomeNarrative: 'The flower stays curled up in sleep.',
          },
        ],
      },
      {
        id: 'magic-scene-2',
        chapterNumber: 2,
        title: 'Mixing the Flying Potion Drops',
        sceneEmoji: '🧪',
        location: 'The Wizard Alchemy Tower',
        narrative:
          'To fly up to the castle tower, Wizard Pip prepares a sparkling feather-light potion. The magical recipe requires 3 drops of blueberry fizz and 3 drops of golden dandelion syrup. How many drops in total do you stir into the cauldron?',
        challengePrompt: 'Add the potion drops together: 3 + 3 = ?',
        visualHelper: {
          type: 'emoji-row',
          items: ['💧', '💧', '💧', '➕', '💧', '💧', '💧'],
          hintText: 'Double 3: count 3, then 4, 5, 6!',
        },
        choices: [
          {
            id: 'm2-6',
            text: '6 Drops (3 + 3 = 6)',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Addition (3+3 / Doubles)',
            explanation: 'Double three is six! 3 + 3 = 6 magical potion drops!',
            outcomeNarrative:
              'GLUG GLUG FIZZ! The potion bubbles in cheerful purple swirls! Tiny angel wings flutter, and you float right up to the highest castle balcony!',
            earnedItem: 'Feather-Light Flying Cloak 🪶',
          },
          {
            id: 'm2-5',
            text: '5 Drops',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Addition (3+3 / Doubles)',
            explanation: 'Almost! 3 + 2 is 5, but we added 3 more drops! 3 + 3 = 6!',
            outcomeNarrative: 'The cauldron gives a tiny hiccup.',
          },
          {
            id: 'm2-7',
            text: '7 Drops',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Addition (3+3 / Doubles)',
            explanation: 'One drop too many! Count: 1, 2, 3... 4, 5, 6!',
            outcomeNarrative: 'Count the drops on your fingers.',
          },
        ],
      },
      {
        id: 'magic-scene-3',
        chapterNumber: 3,
        title: 'The Nighttime Castle Guardian',
        sceneEmoji: '🦉',
        location: 'The Moonlit Forest Gate',
        narrative:
          'The castle gate is locked at night. Wizard Pip whispers: "Only nocturnal animals who stay awake at night and sleep during the sunny day know the gate password." Which creature is nocturnal and active at night?',
        challengePrompt: 'Which of these animals is nocturnal (awake at night)?',
        visualHelper: {
          type: 'counter',
          items: ['🦉 Owl: Nocturnal (wide night eyes, hunts after sunset)', '🦋 Butterfly: Diurnal (loves daytime sun)'],
          hintText: 'Nocturnal animals have keen night vision and come out when the moon shines!',
        },
        choices: [
          {
            id: 'm3-owl',
            text: '🦉 The Wise Barn Owl (nocturnal night hunter)',
            isCorrect: true,
            subjectType: 'science',
            conceptTag: 'Nocturnal Animals',
            explanation: 'Hoo-hoo! Exactly right! Owls are nocturnal animals with huge eyes and silent wings designed for the dark night!',
            outcomeNarrative:
              'The great snowy owl flaps down softly, blinks his golden round eyes, and whispers the magic password: "ABRACADABRA!" The gate creaks open!',
            earnedItem: 'Silver Owl Feather Key 🪶',
          },
          {
            id: 'm3-butterfly',
            text: '🦋 The Colorful Garden Butterfly',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Nocturnal Animals',
            explanation: 'Butterflies love warm daytime sunshine and rest under leaves when night comes!',
            outcomeNarrative: 'The butterfly is sound asleep on a daisy petal.',
          },
          {
            id: 'm3-rooster',
            text: '🐓 The Morning Farm Rooster',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Nocturnal Animals',
            explanation: 'Roosters sleep all night and crow when the morning sunrise appears!',
            outcomeNarrative: 'The rooster is tucking his head under his wing asleep.',
          },
        ],
      },
      {
        id: 'magic-scene-4',
        chapterNumber: 4,
        title: 'The Subtracting Dragon Apples',
        sceneEmoji: '🐉',
        location: 'The Dragon Orchard Nest',
        narrative:
          'In the orchard, you meet Sparky the baby dragon. You brought a basket of 7 delicious red honey-crisp apples. Sparky gently munches 2 apples. How many apples are left in your basket for the royal picnic?',
        challengePrompt: 'Calculate the apples left: 7 - 2 = ?',
        visualHelper: {
          type: 'emoji-row',
          items: ['🍎', '🍎', '🍎', '🍎', '🍎', '❌', '❌'],
          hintText: 'Start at 7 and count back two: 6, 5!',
        },
        choices: [
          {
            id: 'm4-5',
            text: '5 Apples (7 - 2 = 5)',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Subtraction (7-2)',
            explanation: 'Champion counter! 7 take away 2 leaves 5 crisp apples! Plenty for the royal feast!',
            outcomeNarrative:
              'Sparky burps a tiny heart-shaped smoke puff of joy and curls up by your side. The King and Queen crown you the Chief Hero of the Realm!',
            earnedItem: 'Dragon Heart Ruby 💎',
          },
          {
            id: 'm4-4',
            text: '4 Apples',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Subtraction (7-2)',
            explanation: 'Count backwards from 7 by two steps: 7 minus 1 is 6, minus another 1 is 5!',
            outcomeNarrative: 'Recount the apples in your wooden basket.',
          },
          {
            id: 'm4-6',
            text: '6 Apples',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Subtraction (7-2)',
            explanation: '7 - 1 is 6, but Sparky ate 2 apples! So 7 - 2 = 5!',
            outcomeNarrative: 'Check your fingers: hold up 7 fingers, fold down 2 fingers!',
          },
        ],
      },
    ],
    victoryReward: {
      badgeName: 'Grand Royal Mage',
      badgeEmoji: '👑',
      congratulations:
        'You saved the kingdom! You mastered plant biology (sunlight + water), potion addition, nocturnal animal science, and apple subtraction!',
      followUpQuestion: 'Why do plants have green leaves instead of blue or purple leaves?',
    },
  },
  {
    id: 'math-pizza-fractions',
    title: 'The Great Pizza Fraction Party',
    subtitle: 'Slice, share, and solve delicious fraction and shape puzzles with Chef Spark!',
    theme: 'food',
    subject: 'Math',
    topic: 'Fractions & Shapes',
    themeEmoji: '🍕',
    accentColor: 'from-amber-500 via-orange-500 to-red-500',
    bgGradient: 'bg-gradient-to-b from-orange-950 via-amber-950 to-slate-950 text-white',
    description: 'Learn equal halves, count fruit toppings, share cookies fairly, and discover round geometric shapes in the cozy bakery!',
    scenes: [
      {
        id: 'pizza-scene-1',
        chapterNumber: 1,
        title: 'Cutting the Golden Pie in Half',
        sceneEmoji: '🍕',
        location: 'The Cheerful Oven Kitchen',
        narrative:
          'Welcome to the Cozy Bakery! A friendly customer orders one whole cheesy pizza and asks to share it equally between 2 best friends. Into how many equal pieces should the pizza be sliced to make two halves?',
        challengePrompt: 'How many equal pieces make two halves of one whole pizza?',
        visualHelper: {
          type: 'emoji-row',
          items: ['🍕 Half', '🍕 Half'],
          hintText: 'Half means 2 equal parts of the same whole!',
        },
        choices: [
          {
            id: 'pz1-2',
            text: '2 Equal Halves (1 whole = 2 halves) 🍕🍕',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Fractions (Halves)',
            explanation: 'Delicious! Two equal parts make two halves! Both friends get the exact same sized pizza slice!',
            outcomeNarrative:
              'The pizza cutter glides smoothly down the middle! SZZZT! Two steaming, equal halves slide onto the plates, making both friends smile!',
            earnedItem: 'Chef Baker Hat 🧑‍🍳',
          },
          {
            id: 'pz1-5',
            text: '5 Unequal pieces',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Fractions (Halves)',
            explanation: 'Halves always mean 2 equal parts! 5 pieces would make fifths, not halves!',
            outcomeNarrative: 'The customer smiles: "We just want two equal halves!"',
          },
          {
            id: 'pz1-1',
            text: '1 Giant piece',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Fractions (Halves)',
            explanation: '1 piece is the whole pizza! To share as halves, we cut it into 2 equal pieces!',
            outcomeNarrative: 'Hold up two fingers: two halves!',
          },
        ],
      },
      {
        id: 'pizza-scene-2',
        chapterNumber: 2,
        title: 'Counting the Sweet Berry Toppings',
        sceneEmoji: '🍓',
        location: 'The Berry Prep Counter',
        narrative:
          'For the dessert dessert pie, you have 4 ripe red strawberries and 3 plump blue blueberries. How many delicious berries do you have in all to decorate the crust?',
        challengePrompt: 'Count all the berries together: 4 + 3 = ?',
        visualHelper: {
          type: 'emoji-row',
          items: ['🍓', '🍓', '🍓', '🍓', '➕', '🫐', '🫐', '🫐'],
          hintText: 'Count 4 strawberries, then add 3 blueberries: 5, 6, 7!',
        },
        choices: [
          {
            id: 'pz2-7',
            text: '7 Berries (4 + 3 = 7)',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Addition (4+3)',
            explanation: 'Sweet counting! 4 red strawberries plus 3 blue blueberries equals 7 yummy berries!',
            outcomeNarrative:
              'You sprinkle all 7 berries in a sparkling spiral ring on top of the golden pie. It smells heavenly!',
            earnedItem: 'Golden Berry Spatula 🪄',
          },
          {
            id: 'pz2-6',
            text: '6 Berries',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Addition (4+3)',
            explanation: 'Very close! Count carefully: 4 strawberries... 5, 6, 7 berries in all!',
            outcomeNarrative: 'One blueberry rolled off the side! Count it back in!',
          },
          {
            id: 'pz2-8',
            text: '8 Berries',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Addition (4+3)',
            explanation: 'A little too high! 4 + 3 equals 7 berries.',
            outcomeNarrative: 'Recount the berries in the wooden bowl.',
          },
        ],
      },
      {
        id: 'pizza-scene-3',
        chapterNumber: 3,
        title: 'Equal Cookie Sharing',
        sceneEmoji: '🍪',
        location: 'The Bakery Treat Table',
        narrative:
          'You just pulled 6 warm star cookies out of the oven. You and your buddy want to share them fairly with nobody feeling left out. How many cookies does each of you get?',
        challengePrompt: 'Divide 6 cookies fairly between 2 heroes: 6 ÷ 2 = ?',
        visualHelper: {
          type: 'emoji-row',
          items: ['🍪', '🍪', '🍪', '⭐', '🍪', '🍪', '🍪'],
          hintText: 'Put 1 cookie on your plate, 1 on your buddy plate, until all 6 are shared!',
        },
        choices: [
          {
            id: 'pz3-3',
            text: '3 Cookies each (3 + 3 = 6) 🍪🍪🍪',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Fair Sharing / Halving (6 ÷ 2)',
            explanation: 'Fair and square! 3 cookies for you and 3 cookies for your buddy equals 6 cookies!',
            outcomeNarrative:
              'CRUNCH! You and your buddy high-five and take a warm bite together. Sharing math makes treats taste even sweeter!',
            earnedItem: 'Star Baker Apron 🎽',
          },
          {
            id: 'pz3-2',
            text: '2 Cookies each',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Fair Sharing / Halving (6 ÷ 2)',
            explanation: '2 + 2 is only 4 cookies, which leaves 2 cookies lonely on the tray! 3 each shares all 6!',
            outcomeNarrative: 'There are still cookies left in the tray!',
          },
          {
            id: 'pz3-5',
            text: '5 Cookies for one person, 1 for the other',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Fair Sharing / Halving (6 ÷ 2)',
            explanation: 'That is not fair sharing! Equal sharing gives each hero 3 cookies!',
            outcomeNarrative: 'Sharing means equal amounts for everyone!',
          },
        ],
      },
      {
        id: 'pizza-scene-4',
        chapterNumber: 4,
        title: 'The Perfectly Round Pan Shape',
        sceneEmoji: '⭕',
        location: 'The Grand Presentation Stage',
        narrative:
          'For the Grand Mayor Championship Pie, you need the classic round pan that curves smoothly with 0 straight edges and 0 sharp corners. Which 2D geometric shape is perfectly round?',
        challengePrompt: 'Which geometric shape has 0 straight edges and 0 sharp corners?',
        visualHelper: {
          type: 'shapes',
          items: ['⭕ Circle: Round & smooth', '🔺 Triangle: 3 straight sides', '🟦 Square: 4 straight sides'],
          hintText: 'A circle rolls like a wheel because it has zero sharp corners!',
        },
        choices: [
          {
            id: 'pz4-circle',
            text: '⭕ A Round Circle (0 straight sides, 0 corners)',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: '2D Shapes (Circle)',
            explanation: 'Perfection! A circle curves smoothly all the way around with 0 corners!',
            outcomeNarrative:
              'The Mayor gasps with delight! The round championship pie wins the Golden Ribbon Trophy!',
            earnedItem: 'Golden Baker Trophy 🏆',
          },
          {
            id: 'pz4-square',
            text: '🟦 A Square (4 straight sides)',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: '2D Shapes (Circle)',
            explanation: 'A square has 4 straight lines and 4 sharp corners! We need the round shape with 0 corners!',
            outcomeNarrative: 'Square pizzas exist, but we need the round one!',
          },
          {
            id: 'pz4-triangle',
            text: '🔺 A Triangle (3 straight sides)',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: '2D Shapes (Circle)',
            explanation: 'A triangle has 3 pointy corners! A circle is round with 0 corners!',
            outcomeNarrative: 'Check the shape of a coin or clock.',
          },
        ],
      },
    ],
    victoryReward: {
      badgeName: 'Master Fraction Chef',
      badgeEmoji: '🍕',
      congratulations:
        'You ran the whole bakery! You mastered fractions (halves), berry addition, fair sharing, and geometric circle shapes!',
      followUpQuestion: 'If we cut a pizza into 4 equal slices, what is each slice called?',
    },
  },
  {
    id: 'science-photosynthesis-plants',
    title: 'The Secret Life of Green Plants',
    subtitle: 'Help the seedling sprout, catch warm sun rays, and produce fresh oxygen!',
    theme: 'science',
    subject: 'Science',
    topic: 'Photosynthesis & Plants',
    themeEmoji: '🌱',
    accentColor: 'from-emerald-500 via-green-600 to-teal-700',
    bgGradient: 'bg-gradient-to-b from-green-950 via-emerald-950 to-slate-950 text-white',
    description: 'Discover seed planting tools, sunlight energy food, leaf color patterns, and fresh oxygen science in the living forest!',
    scenes: [
      {
        id: 'plant-scene-1',
        chapterNumber: 1,
        title: 'Planting the Wonder Seeds',
        sceneEmoji: '🌱',
        location: 'The Sunny Botanical Greenhouse',
        narrative:
          'Deep in the greenhouse, you are ready to plant a rare Sun-Flower! You have 3 packets of sunflower seeds and 2 watering cans filled with cool water. How many gardening supplies do you have in all?',
        challengePrompt: 'Count all gardening supplies: 3 seeds + 2 watering cans = ?',
        visualHelper: {
          type: 'emoji-row',
          items: ['🌱', '🌱', '🌱', '➕', '🪴', '🪴'],
          hintText: 'Count 3 seed packets, then count 2 more: 4, 5!',
        },
        choices: [
          {
            id: 'pl1-5',
            text: '5 Gardening Supplies (3 + 2 = 5) 🌱🪴',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Addition (3+2)',
            explanation: 'Great job! 3 packets of seeds plus 2 watering cans equals 5 essential gardening supplies!',
            outcomeNarrative:
              'You tuck the seeds gently into the soft, rich brown soil and sprinkle fresh drops of cool water. The seed begins to swell with life!',
            earnedItem: 'Botanist Trowel 🪴',
          },
          {
            id: 'pl1-4',
            text: '4 Supplies',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Addition (3+2)',
            explanation: 'Close! 3 + 1 is 4, but we have 2 watering cans! 3 + 2 = 5!',
            outcomeNarrative: 'Check your supplies on the wooden bench.',
          },
          {
            id: 'pl1-6',
            text: '6 Supplies',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Addition (3+2)',
            explanation: 'Count again: 1, 2, 3 seeds, plus 4, 5 watering cans!',
            outcomeNarrative: 'Count on your fingers: 3 fingers up, add 2 fingers!',
          },
        ],
      },
      {
        id: 'plant-scene-2',
        chapterNumber: 2,
        title: 'Catching Sunlight to Make Food',
        sceneEmoji: '☀️',
        location: 'The Sunlit Forest Glade',
        narrative:
          'The little seedling sprouts green leaves out of the dirt: POP! Plants cannot walk to the kitchen for food. What natural power from the sky do green leaves catch to make their own sweet food (photosynthesis)?',
        challengePrompt: 'What energy from the sky do green plant leaves need to make food?',
        visualHelper: {
          type: 'counter',
          items: ['☀️ Warm Sunlight: Gives energy to leaves!', '🌑 Pitch Black Dark: No light to make food!'],
          hintText: 'Photosynthesis means using light (photo) to make (synthesis) plant sugar food!',
        },
        choices: [
          {
            id: 'pl2-sun',
            text: '☀️ Warm, Bright Sunlight from the Sun!',
            isCorrect: true,
            subjectType: 'science',
            conceptTag: 'Photosynthesis (Sunlight)',
            explanation: 'Brilliant science! Plants use sunlight, water, and air in their green chloroplasts to make sugar food!',
            outcomeNarrative:
              'Warm golden sunshine bathes the leaves! The plant soaks up the light energy and grows taller right before your eyes with a soft hum!',
            earnedItem: 'Solar Leaf Crystal 🍃',
          },
          {
            id: 'pl2-dark',
            text: '🌑 Keeping it in a dark closet with no light',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Photosynthesis (Sunlight)',
            explanation: 'Without sunlight, leaves turn pale and cannot make any food! Plants need bright sunlight to grow strong.',
            outcomeNarrative: 'The leaves droop in the dark shadow!',
          },
          {
            id: 'pl2-soda',
            text: '🥤 Sweet fizzy soda pop',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Photosynthesis (Sunlight)',
            explanation: 'Plants do not drink soda! Plants need pure water and sunshine from nature!',
            outcomeNarrative: 'The soil shakes its head!',
          },
        ],
      },
      {
        id: 'plant-scene-3',
        chapterNumber: 3,
        title: 'The Green Leaf & Yellow Bloom Pattern',
        sceneEmoji: '🌿',
        location: 'The Garden Pathway',
        narrative:
          'Along the pathway, flowers are blooming in a beautiful repeating pattern: 🟢 Green Leaf, 🟡 Yellow Flower, 🟢 Green Leaf, 🟡 Yellow Flower, 🟢 Green Leaf... What comes next on the stem?',
        challengePrompt: 'What comes next in the pattern: Green Leaf, Yellow Flower, Green Leaf, Yellow Flower, Green Leaf, ___?',
        visualHelper: {
          type: 'emoji-row',
          items: ['🟢', '🟡', '🟢', '🟡', '🟢', '❓'],
          hintText: 'Say the rhythm: Green, Yellow, Green, Yellow, Green... ?',
        },
        choices: [
          {
            id: 'pl3-yellow',
            text: '🟡 Yellow Flower Bloom',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Pattern Recognition (AB Pattern)',
            explanation: 'Super smart! Green Leaf, Yellow Flower, Green Leaf, Yellow Flower, Green Leaf, YELLOW FLOWER!',
            outcomeNarrative:
              'POP! A gorgeous golden petal blossoms right in place, completing the nature spiral pattern!',
            earnedItem: 'Honeybee Nectar Jar 🍯',
          },
          {
            id: 'pl3-red',
            text: '🔴 Red Rock',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Pattern Recognition (AB Pattern)',
            explanation: 'The pattern only repeats Green and Yellow! Green, Yellow, Green, Yellow!',
            outcomeNarrative: 'Look at the colors that came before.',
          },
          {
            id: 'pl3-green',
            text: '🟢 Green Leaf',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Pattern Recognition (AB Pattern)',
            explanation: 'Green Leaf was just there! After Green comes Yellow!',
            outcomeNarrative: 'Two green leaves never sit side-by-side in this pattern.',
          },
        ],
      },
      {
        id: 'plant-scene-4',
        chapterNumber: 4,
        title: 'The Gift of Fresh Oxygen',
        sceneEmoji: '💨',
        location: 'The Grand Tree Canopy',
        narrative:
          'As the giant Sun-Sunflower opens its huge petals, it finishes its photosynthesis process. What invisible, clean gas do green plants release into the air that all animals and humans need to breathe?',
        challengePrompt: 'What clean gas do green leaves release for us to breathe?',
        visualHelper: {
          type: 'counter',
          items: ['💨 Fresh Oxygen (O₂): Helps all living creatures breathe!', '💨 Thick Smoke: Not healthy for breathing.'],
          hintText: 'Plants take in carbon dioxide and release fresh, clean oxygen for you and me!',
        },
        choices: [
          {
            id: 'pl4-oxygen',
            text: '💨 Fresh Oxygen Gas (O₂) for living creatures to breathe!',
            isCorrect: true,
            subjectType: 'science',
            conceptTag: 'Photosynthesis (Oxygen Production)',
            explanation: 'Spectacular science! Plants give us fresh oxygen to breathe, and we give plants carbon dioxide! We are nature partners!',
            outcomeNarrative:
              'A gentle, sweet breeze of fresh clean forest air fills your lungs! You take a deep, refreshing breath and the whole forest rejoices!',
            earnedItem: 'Forest Guardian Crown 🌿',
          },
          {
            id: 'pl4-smoke',
            text: '💨 Gray fireplace smoke',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Photosynthesis (Oxygen Production)',
            explanation: 'Fire makes smoke, but healthy green plants make clean oxygen that cleans the air!',
            outcomeNarrative: 'Cough! Plants make fresh pure air, not smoke!',
          },
          {
            id: 'pl4-rocks',
            text: '🪨 Heavy stone dust',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Photosynthesis (Oxygen Production)',
            explanation: 'Leaves make air gases, not heavy rocks! They make life-giving oxygen.',
            outcomeNarrative: 'Leaves breathe gas into the sky!',
          },
        ],
      },
    ],
    victoryReward: {
      badgeName: 'Master Forest Botanist',
      badgeEmoji: '🌱',
      congratulations:
        'You grew the great Sun-Flower! You mastered seed math, sunlight photosynthesis energy, color patterns, and fresh oxygen science!',
      followUpQuestion: 'Why do leaves turn orange and yellow in autumn when there is less sunlight?',
    },
  },
  {
    id: 'coding-robot-workshop',
    title: 'Robo-Buddy Workshop Adventure',
    subtitle: 'Program robot moves with step algorithms, repeating loops, and conductors!',
    theme: 'coding',
    subject: 'Coding',
    topic: 'Robots, Loops & Code',
    themeEmoji: '🤖',
    accentColor: 'from-blue-600 via-indigo-600 to-violet-600',
    bgGradient: 'bg-gradient-to-b from-indigo-950 via-slate-900 to-blue-950 text-white',
    description: 'Learn step-by-step algorithms, repeating loops, electrical conductors, and smart if/else decisions in the high-tech workshop!',
    scenes: [
      {
        id: 'code-scene-1',
        chapterNumber: 1,
        title: 'Step-by-Step Navigation Algorithm',
        sceneEmoji: '🤖',
        location: 'The Coding Lab Test Floor',
        narrative:
          'Meet Gizmo the explorer robot! To reach the charging dock, Gizmo needs a clear algorithm: 3 steps forward, then 2 more steps forward. How many total steps must Gizmo take?',
        challengePrompt: 'Count all robot steps: 3 + 2 = ?',
        visualHelper: {
          type: 'emoji-row',
          items: ['👣', '👣', '👣', '➕', '👣', '👣'],
          hintText: 'Count 3 steps, then count 2 more: 4, 5!',
        },
        choices: [
          {
            id: 'cd1-5',
            text: '5 Steps (3 + 2 = 5) 🤖',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Algorithm Steps (3+2)',
            explanation: 'BEEP BOOP! 3 steps plus 2 steps equals 5 steps! Gizmo walks right onto the charging pad!',
            outcomeNarrative:
              'CLINK! CLANK! Gizmo marches 5 perfect steps: 1, 2, 3, 4, 5! His battery meter lights up with happy green energy!',
            earnedItem: 'Coder Golden Stylus 💻',
          },
          {
            id: 'cd1-4',
            text: '4 Steps',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Algorithm Steps (3+2)',
            explanation: 'Gizmo stops one step short of the pad! 3 + 2 = 5 steps!',
            outcomeNarrative: 'Gizmo beeps: "Need 1 more step forward!"',
          },
          {
            id: 'cd1-6',
            text: '6 Steps',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Algorithm Steps (3+2)',
            explanation: 'Whoa! 6 steps would walk past the dock! 3 + 2 = 5!',
            outcomeNarrative: 'Gizmo stops before bumping the wall.',
          },
        ],
      },
      {
        id: 'code-scene-2',
        chapterNumber: 2,
        title: 'The Repeating Dance Loop',
        sceneEmoji: '🔁',
        location: 'The Circuit Ballroom',
        narrative:
          'Gizmo loves to dance! His program has a repeating loop pattern: ⬆️ Jump Up, ➡️ Spin Right, ⬆️ Jump Up, ➡️ Spin Right, ⬆️ Jump Up... What command comes next in the loop?',
        challengePrompt: 'What command comes next: Up, Right, Up, Right, Up, ___?',
        visualHelper: {
          type: 'emoji-row',
          items: ['⬆️', '➡️', '⬆️', '➡️', '⬆️', '❓'],
          hintText: 'A loop repeats the same sequence: Up, Right, Up, Right... ?',
        },
        choices: [
          {
            id: 'cd2-right',
            text: '➡️ Spin Right (Next in the loop!)',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Loops & Sequences',
            explanation: 'Spot on! In coding, a loop repeats actions over and over! After Up comes Right!',
            outcomeNarrative:
              'WHEEE! Gizmo spins to the right with flashing rainbow lights! The dance program runs with zero bugs!',
            earnedItem: 'Neon Loop Disc 💽',
          },
          {
            id: 'cd2-down',
            text: '⬇️ Fall Down',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Loops & Sequences',
            explanation: 'Down is not in this dance loop! The loop only uses Up and Right!',
            outcomeNarrative: 'Gizmo tilts his head: "Check the loop commands!"',
          },
          {
            id: 'cd2-up',
            text: '⬆️ Jump Up again',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Loops & Sequences',
            explanation: 'Gizmo just jumped Up! In this pattern, every Up is followed by Right!',
            outcomeNarrative: 'Follow the rhythm of the arrows.',
          },
        ],
      },
      {
        id: 'code-scene-3',
        chapterNumber: 3,
        title: 'The Electric Circuit Conductor',
        sceneEmoji: '⚡',
        location: 'The Hardware Workbench',
        narrative:
          'A wire came loose on Gizmo\'s sensor panel! To complete the circuit and let electricity flow through to power his night-vision camera, which material is a good conductor of electricity?',
        challengePrompt: 'Which material conducts electricity to complete a circuit?',
        visualHelper: {
          type: 'counter',
          items: ['⚡ Copper metal wire: Conductor (electricity flows!)', '🪵 Rubber eraser: Insulator (electricity stops!)'],
          hintText: 'Metals like copper and aluminum let electrical currents flow freely!',
        },
        choices: [
          {
            id: 'cd3-copper',
            text: '⚡ Copper Metal Wire (conducts electrical energy!)',
            isCorrect: true,
            subjectType: 'science',
            conceptTag: 'Electrical Circuits (Conductors)',
            explanation: 'Genius engineering! Copper is an awesome metal conductor that lets electric electrons zip through to power Gizmo!',
            outcomeNarrative:
              'ZZZZT-PING! The copper wire snaps into place. Gizmo\'s eyes light up with crystal clear vision!',
            earnedItem: 'Master Circuit Tester 🔌',
          },
          {
            id: 'cd3-rubber',
            text: '🪵 A rubber pencil eraser',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Electrical Circuits (Conductors)',
            explanation: 'Rubber is an insulator! It blocks electricity, which is why electrician gloves are made of rubber.',
            outcomeNarrative: 'No electricity flows through rubber!',
          },
          {
            id: 'cd3-wood',
            text: '🪵 A dry wooden toothpick',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Electrical Circuits (Conductors)',
            explanation: 'Dry wood does not conduct electricity! We need shiny metal like copper.',
            outcomeNarrative: 'Gizmo\'s screen remains dark until metal is connected.',
          },
        ],
      },
      {
        id: 'code-scene-4',
        chapterNumber: 4,
        title: 'The Floating If-Else Decision',
        sceneEmoji: '🛶',
        location: 'The Outdoor Water Canal',
        narrative:
          'Gizmo reaches a water canal! You code an IF-ELSE rule: "IF water is ahead, THEN board an item that floats!" Which item will float on water so Gizmo does not get wet?',
        challengePrompt: 'Which item floats on top of the water?',
        visualHelper: {
          type: 'counter',
          items: ['🪵 Light wood log: Floats on top!', '🪨 Heavy iron stone: Sinks down!'],
          hintText: 'Wood is light and buoyant, so it bobs on water!',
        },
        choices: [
          {
            id: 'cd4-wood',
            text: '🪵 A light wooden raft (wood floats on water!)',
            isCorrect: true,
            subjectType: 'science',
            conceptTag: 'Density (Sink or Float)',
            explanation: 'Mission accomplished! Wood floats safely on water, carrying Gizmo across the canal dry and safe!',
            outcomeNarrative:
              'Gizmo hops onto the wooden raft and glides across like a robo-captain! Mission complete!',
            earnedItem: 'Robo-Master Gold Medal 🏅',
          },
          {
            id: 'cd4-iron',
            text: '🪨 A solid heavy iron boulder',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Density (Sink or Float)',
            explanation: 'Heavy iron sinks to the bottom! Gizmo would get soaked!',
            outcomeNarrative: 'KER-PLUNK! The heavy rock sinks straight down!',
          },
          {
            id: 'cd4-brick',
            text: '🧱 A heavy clay brick',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Density (Sink or Float)',
            explanation: 'Bricks sink down into the water mud! We need buoyant wood that floats.',
            outcomeNarrative: 'The brick splashes and sinks.',
          },
        ],
      },
    ],
    victoryReward: {
      badgeName: 'Chief Robo Programmer',
      badgeEmoji: '🤖',
      congratulations:
        'You programmed Gizmo the robot! You mastered algorithm steps, repeating dance loops, copper circuit conductors, and floating science!',
      followUpQuestion: 'What does a computer programmer do when their code has a little mistake called a bug?',
    },
  },
  {
    id: 'history-invention-time-travel',
    title: 'The 1,000-Year Invention Time Machine',
    subtitle: 'Hop into the time machine to discover printing presses, airplanes, 4-minute miles, and moon rockets!',
    theme: 'history',
    subject: 'History',
    topic: '1,000 Years of Inventions & Sports Records',
    themeEmoji: '🏛️',
    accentColor: 'from-amber-600 via-rose-600 to-indigo-700',
    bgGradient: 'bg-gradient-to-b from-stone-950 via-amber-950 to-slate-950 text-white',
    description: 'Solve Gutenberg printing press addition, Wright brothers airplane wing lift, Roger Bannister lap pacing, and Apollo moon thrust!',
    scenes: [
      {
        id: 'hist-scene-1',
        chapterNumber: 1,
        title: 'The Gutenberg Movable Printing Press (1440)',
        sceneEmoji: '📜',
        location: 'Mainz Renaissance Print Shop',
        narrative:
          'The time machine whirs and lands in the 1440s! Johannes Gutenberg is inventing the movable type printing press so books and knowledge can be printed and shared with everyone! To set the very first book page, Gutenberg needs 5 uppercase capital letter stamps and 4 lowercase letter stamps. How many metal type stamps are needed in all?',
        challengePrompt: 'Count all metal letters for the press: 5 + 4 = ?',
        visualHelper: {
          type: 'emoji-row',
          items: ['🔤', '🔤', '🔤', '🔤', '🔤', '➕', '🔡', '🔡', '🔡', '🔡'],
          hintText: 'Count 5 capital letters, then keep counting: 6, 7, 8, 9!',
        },
        choices: [
          {
            id: 'h1-9',
            text: '9 Metal Type Stamps (5 + 4 = 9) 🖨️',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Addition (5+4)',
            explanation: 'Incredible history math! 5 + 4 equals 9 metal type stamps! You lock them into the printing press frame!',
            outcomeNarrative:
              'Gutenberg pulls the heavy wooden lever down: CLACK-PRESS! The ink transfers crisp, beautiful black letters onto parchment paper!',
            earnedItem: 'Gutenberg Golden Letter Block 🔤',
          },
          {
            id: 'h1-8',
            text: '8 Metal Type Stamps',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Addition (5+4)',
            explanation: '5 + 3 is 8, but Gutenberg has 4 small letters! 5 + 4 = 9!',
            outcomeNarrative: 'Gutenberg smiles: "Almost! We need one more letter block to complete the row!"',
          },
          {
            id: 'h1-10',
            text: '10 Metal Type Stamps',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Addition (5+4)',
            explanation: 'One stamp too many! 5 + 5 is 10, but here we have 5 + 4 = 9!',
            outcomeNarrative: 'Count the metal blocks on your fingers: 5 and 4!',
          },
        ],
      },
      {
        id: 'hist-scene-2',
        chapterNumber: 2,
        title: 'Kitty Hawk: The First Airplane Flight (1903)',
        sceneEmoji: '✈️',
        location: 'Kill Devil Hills Sand Dunes',
        narrative:
          'ZAP! The time machine leaps forward to December 17, 1903! Orville and Wilbur Wright are ready to test humanity\'s first engine-powered airplane. To lift their heavy wooden flyer into the sky and overcome gravity, what do the curved wings create when wind flows over them?',
        challengePrompt: 'How do curved wings lift an airplane into the sky?',
        visualHelper: {
          type: 'counter',
          items: ['✈️ Curved Wing Top: Fast air creates low pressure & upward LIFT!', '🪨 Heavy flat stone: Sinks down to earth!'],
          hintText: 'Air flowing faster over the curved top of the wing creates aerodynamic lift that pulls the plane up!',
        },
        choices: [
          {
            id: 'h2-lift',
            text: '💨 Curved wings make air flow faster on top, creating aerodynamic LIFT!',
            isCorrect: true,
            subjectType: 'science',
            conceptTag: 'Aerodynamics & Wing Lift',
            explanation: 'Spot on, aviation pioneer! Faster moving air creates lower pressure above the wing, lifting the airplane into the blue sky!',
            outcomeNarrative:
              'The Wright Flyer rolls along the track, rises off the sand, and glides gracefully 120 feet through the North Carolina breeze!',
            earnedItem: 'Wright Brothers Aviator Goggles 🥽',
          },
          {
            id: 'h2-heavy',
            text: '⛓️ Put heavy lead blocks on the wings so gravity pulls harder',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Aerodynamics & Wing Lift',
            explanation: 'Heavy lead blocks would keep the plane stuck on the ground! Airplanes need lightweight wings shaped for aerodynamic lift!',
            outcomeNarrative: 'The flyer assistant reminds you that planes need lightness and air lift!',
          },
          {
            id: 'h2-noair',
            text: '🚫 Block all air from touching the wings',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Aerodynamics & Wing Lift',
            explanation: 'Wings need wind flowing over them to generate lift! Without air flow, planes cannot fly!',
            outcomeNarrative: 'The ocean breeze whispers: "Flowing air creates lift!"',
          },
        ],
      },
      {
        id: 'hist-scene-3',
        chapterNumber: 3,
        title: 'The Miracle 4-Minute Mile (1954)',
        sceneEmoji: '⏱️',
        location: 'Oxford University Running Track',
        narrative:
          'WHOOSH! The time machine lands on May 6, 1954! Runner Roger Bannister is preparing to attempt what doctors claimed was impossible: running a 1-mile race in under 4 minutes! A mile is exactly 4 laps around the track. To finish in 4 minutes (240 seconds), how many seconds must he pace each lap?',
        challengePrompt: 'Calculate the lap pace: 240 seconds divided into 4 equal laps = ?',
        visualHelper: {
          type: 'emoji-row',
          items: ['Lap 1: 60s', 'Lap 2: 60s', 'Lap 3: 60s', 'Lap 4: 60s', '⏱️ 4 Minutes!'],
          hintText: 'Think about a clock: 60 + 60 + 60 + 60 = 240 seconds (4 minutes)!',
        },
        choices: [
          {
            id: 'h3-60',
            text: '⏱️ 60 Seconds per lap (4 laps x 60s = 240s = 4 minutes)',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Multiplication & Pacing (4 x 60)',
            explanation: 'Perfection! 60 seconds per lap keeps his heart rhythm steady, breaking the world record in 3 minutes 59.4 seconds!',
            outcomeNarrative:
              'The crowd roars with joy as Bannister crosses the finish tape! Humanity broke the 4-minute barrier and proved belief can conquer limits!',
            earnedItem: 'Golden Olympic Stopwatch ⏱️',
          },
          {
            id: 'h3-80',
            text: '80 Seconds per lap',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Multiplication & Pacing (4 x 60)',
            explanation: '4 laps times 80 seconds equals 320 seconds, which is more than 5 minutes! We need 60 seconds per lap!',
            outcomeNarrative: 'The pacemaker stopwatch clicks: "Speed up just a bit to hit 60s per lap!"',
          },
          {
            id: 'h3-40',
            text: '40 Seconds per lap',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Multiplication & Pacing (4 x 60)',
            explanation: '40 seconds per lap would be a 2-minute 40-second mile, which no human can run! 60 seconds is the target!',
            outcomeNarrative: 'Running at 40s per lap would exhaust the runner too early.',
          },
        ],
      },
      {
        id: 'hist-scene-4',
        chapterNumber: 4,
        title: 'Apollo 11 Moon Landing Thrusters (1969)',
        sceneEmoji: '🚀',
        location: 'The Sea of Tranquility',
        narrative:
          'July 20, 1969! Humanity has traveled from horse-and-buggies to landing on the Moon in less than 70 years! To slow the Apollo Lunar Module down so it lands softly on the moon rocks, what physics principle does the rocket engine use?',
        challengePrompt: 'How does rocket thrust slow down or push a spaceship in physics?',
        visualHelper: {
          type: 'counter',
          items: ['🔥 Rocket pushes fiery gas DOWN', '⬆️ Equal and opposite reaction pushes spacecraft UP!'],
          hintText: 'Newton\'s 3rd Law: For every action, there is an equal and opposite reaction! Pushing gas down pushes the ship up!',
        },
        choices: [
          {
            id: 'h4-thrust',
            text: '🔥 Newton\'s 3rd Law: Pushing exhaust gas DOWN pushes the rocket UP!',
            isCorrect: true,
            subjectType: 'science',
            conceptTag: 'Action-Reaction (Newton\'s 3rd Law)',
            explanation: 'Touchdown! "The Eagle has landed!" Pushing exhaust gas downward creates an upward opposing reaction force to cushion the landing!',
            outcomeNarrative:
              'Neil Armstrong steps onto the lunar surface: "That\'s one small step for man, one giant leap for mankind!" You completed the 1,000-year journey!',
            earnedItem: '1,000-Year Historic Chronometer ⏳',
          },
          {
            id: 'h4-parachute',
            text: '🪂 Open a silk parachute in outer space',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Action-Reaction (Newton\'s 3rd Law)',
            explanation: 'Outer space and the Moon have no air atmosphere! Parachutes only work when there is air to catch!',
            outcomeNarrative: 'The astronaut reminds you that space is an airless vacuum!',
          },
          {
            id: 'h4-magnet',
            text: '🧲 Use a giant refrigerator magnet to stick to moon dust',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Action-Reaction (Newton\'s 3rd Law)',
            explanation: 'Moon dust is not magnetic enough to catch a spaceship! Rocket thrust engines are needed to control descent.',
            outcomeNarrative: 'The lander instruments call for rocket engine deceleration.',
          },
        ],
      },
    ],
    victoryReward: {
      badgeName: 'Grand 1,000-Year Historian',
      badgeEmoji: '🏛️',
      congratulations:
        'Magnificent achievement! You journeyed through 1,000 years of human history, mastering Gutenberg\'s printing press math, Wright brothers wing lift, Bannister\'s 4-minute mile pacing, and Apollo moon thrust!',
      followUpQuestion: 'What historical invention or sports record inspires you the most?',
    },
  },
];

// Dynamically generate a 4-chapter adventure strictly grounded in any topic and subject!
// No generic random keys or door filler — every chapter connects directly to the topic!
export function generateTopicGroundedQuest(
  heroName: string,
  heroAvatar: string,
  rawTopic: string,
  rawSubject: string = 'General'
): AdventureQuest {
  const cleanTopic = (rawTopic || 'Science & Nature').trim();
  const lower = cleanTopic.toLowerCase();
  const safeHero = heroName || 'Captain Nova';
  const safeAvatar = heroAvatar || '🚀';

  // 1. Photosynthesis / Plants / Flowers / Trees / Garden
  if (
    lower.includes('photo') ||
    lower.includes('plant') ||
    lower.includes('flower') ||
    lower.includes('leaf') ||
    lower.includes('botany') ||
    lower.includes('tree') ||
    lower.includes('seed')
  ) {
    return {
      id: `topic-${Date.now()}`,
      title: `${safeHero} and the Secret of ${cleanTopic}`,
      subtitle: `Explore how green plants and seeds use sunlight to grow strong!`,
      theme: 'science',
      subject: 'Science',
      topic: cleanTopic,
      themeEmoji: '🌱',
      accentColor: 'from-emerald-500 via-green-600 to-teal-700',
      bgGradient: 'bg-gradient-to-b from-green-950 via-emerald-950 to-slate-950 text-white',
      description: `Join ${safeHero} on a botanical adventure mastering seed counting, sunlight energy, leaf patterns, and fresh oxygen!`,
      scenes: [
        {
          id: 'sc-1',
          chapterNumber: 1,
          title: 'Planting the Seed Sprout',
          sceneEmoji: '🌱',
          location: 'The Living Nature Garden',
          narrative: `${safeHero} is ready to investigate ${cleanTopic}! You bring 3 packets of flower seeds and 2 watering cans. How many gardening supplies do you have in all to plant?`,
          challengePrompt: 'Count all gardening supplies: 3 seeds + 2 watering cans = ?',
          visualHelper: {
            type: 'emoji-row',
            items: ['🌱', '🌱', '🌱', '➕', '🪴', '🪴'],
            hintText: 'Count 3 seed packets, then count 2 more: 4, 5!',
          },
          choices: [
            {
              id: 'c1-5',
              text: '5 Supplies (3 + 2 = 5) 🌱🪴',
              isCorrect: true,
              subjectType: 'math',
              conceptTag: 'Addition (3+2)',
              explanation: `Super counting, ${safeHero}! 3 plus 2 equals 5 essential supplies for ${cleanTopic}!`,
              outcomeNarrative: `The seeds are tucked into the soft warm earth with gentle water!`,
              earnedItem: 'Botanist Trowel 🪴',
            },
            {
              id: 'c1-4',
              text: '4 Supplies',
              isCorrect: false,
              subjectType: 'math',
              conceptTag: 'Addition (3+2)',
              explanation: 'Count again: 3 seeds plus 2 cans equals 5!',
              outcomeNarrative: 'Check your wooden tray.',
            },
            {
              id: 'c1-6',
              text: '6 Supplies',
              isCorrect: false,
              subjectType: 'math',
              conceptTag: 'Addition (3+2)',
              explanation: 'Hold up 3 fingers, then add 2 more fingers: 1, 2, 3, 4, 5!',
              outcomeNarrative: 'A little too high!',
            },
          ],
        },
        {
          id: 'sc-2',
          chapterNumber: 2,
          title: 'The Energy of Sunshine',
          sceneEmoji: '☀️',
          location: 'The Sunlit Canopy',
          narrative: `Green leaves sprout upward! What natural energy from the sky powers ${cleanTopic} so leaves can make sweet sugar food?`,
          challengePrompt: 'What energy does the leaf need from nature?',
          visualHelper: {
            type: 'counter',
            items: ['☀️ Warm Sunlight: Energy for plant food!', '🌑 Darkness: Plants cannot make food!'],
            hintText: 'Sunlight gives green leaves the energy to turn water and air into food!',
          },
          choices: [
            {
              id: 'c2-sun',
              text: '☀️ Bright Sunlight from the Sun',
              isCorrect: true,
              subjectType: 'science',
              conceptTag: 'Photosynthesis (Sunlight)',
              explanation: `Spot on, ${safeHero}! Sunlight provides the vital light energy for ${cleanTopic}!`,
              outcomeNarrative: `The leaves soak up the golden rays and turn a vibrant sparkling emerald green!`,
              earnedItem: 'Solar Leaf Badge 🍃',
            },
            {
              id: 'c2-dark',
              text: '🌑 Hide it in a dark basement',
              isCorrect: false,
              subjectType: 'science',
              conceptTag: 'Photosynthesis (Sunlight)',
              explanation: 'In the dark, plants cannot make food and wither! They need sunlight!',
              outcomeNarrative: 'The leaves droop without sunshine.',
            },
            {
              id: 'c2-ice',
              text: '🧊 Freezing cold snow ice',
              isCorrect: false,
              subjectType: 'science',
              conceptTag: 'Photosynthesis (Sunlight)',
              explanation: 'Freezing ice freezes leaves! Plants love gentle warm sunshine and water.',
              outcomeNarrative: 'The plant shivers in the ice.',
            },
          ],
        },
        {
          id: 'sc-3',
          chapterNumber: 3,
          title: 'The Nature Color Pattern',
          sceneEmoji: '🌿',
          location: 'The Garden Trellis',
          narrative: `Along the garden vine, buds are opening in a rhythm: 🟢 Green Leaf, 🟡 Yellow Flower, 🟢 Green Leaf, 🟡 Yellow Flower, 🟢 Green Leaf... What opens next?`,
          challengePrompt: 'What color comes next: Green, Yellow, Green, Yellow, Green, ___?',
          visualHelper: {
            type: 'emoji-row',
            items: ['🟢', '🟡', '🟢', '🟡', '🟢', '❓'],
            hintText: 'Say it out loud: Green, Yellow, Green, Yellow... ?',
          },
          choices: [
            {
              id: 'c3-yellow',
              text: '🟡 Yellow Flower Bloom',
              isCorrect: true,
              subjectType: 'math',
              conceptTag: 'AB Patterns',
              explanation: 'Genius! The pattern repeats: Green, Yellow, Green, Yellow!',
              outcomeNarrative: 'A bright yellow flower opens with a happy hum!',
              earnedItem: 'Honeybee Nectar Charm 🍯',
            },
            {
              id: 'c3-green',
              text: '🟢 Green Leaf',
              isCorrect: false,
              subjectType: 'math',
              conceptTag: 'AB Patterns',
              explanation: 'Green is right before this! After Green comes Yellow!',
              outcomeNarrative: 'Try following the two-color sequence.',
            },
            {
              id: 'c3-blue',
              text: '🔵 Blue Rock',
              isCorrect: false,
              subjectType: 'math',
              conceptTag: 'AB Patterns',
              explanation: 'Only Green and Yellow are in this pattern!',
              outcomeNarrative: 'Stick to the repeating colors.',
            },
          ],
        },
        {
          id: 'sc-4',
          chapterNumber: 4,
          title: 'Fresh Air for the Whole Planet',
          sceneEmoji: '💨',
          location: 'The Grand Meadow',
          narrative: `As ${cleanTopic} finishes, the leaves give off a clean, fresh gas into the air that ${safeHero} and all animals need to breathe. What is this clean gas?`,
          challengePrompt: 'What clean gas do green leaves release for us to breathe?',
          visualHelper: {
            type: 'counter',
            items: ['💨 Fresh Oxygen (O₂): Keeps heroes and animals breathing!', '💨 Black Smoke: Not for breathing!'],
            hintText: 'Plants take in carbon dioxide and release fresh, clean oxygen!',
          },
          choices: [
            {
              id: 'c4-oxygen',
              text: '💨 Fresh Oxygen Gas (O₂)',
              isCorrect: true,
              subjectType: 'science',
              conceptTag: 'Oxygen & Respiration',
              explanation: `Spectacular science, ${safeHero}! Plants release oxygen so we can breathe fresh, clean air!`,
              outcomeNarrative: `You take a deep, refreshing breath of sweet forest air! You mastered ${cleanTopic}!`,
              earnedItem: 'Earth Guardian Crown 👑',
            },
            {
              id: 'c4-smoke',
              text: '💨 Chimney smoke',
              isCorrect: false,
              subjectType: 'science',
              conceptTag: 'Oxygen & Respiration',
              explanation: 'Smoke comes from fires! Green leaves make sweet, clean oxygen gas!',
              outcomeNarrative: 'Plants make pure air, not smoke.',
            },
            {
              id: 'c4-sand',
              text: '🏖️ Sand dust',
              isCorrect: false,
              subjectType: 'science',
              conceptTag: 'Oxygen & Respiration',
              explanation: 'Plants release gas, not sand! They make life-giving oxygen.',
              outcomeNarrative: 'Leaves breathe out invisible oxygen gas.',
            },
          ],
        },
      ],
      victoryReward: {
        badgeName: `Hero of ${cleanTopic}`,
        badgeEmoji: '🌱',
        congratulations: `Incredible job, ${safeHero}! You solved plant seed math, sunlight photosynthesis energy, color patterns, and oxygen science!`,
        followUpQuestion: `What do you find most magical about how plants make their own food?`,
      },
    };
  }

  // 2. Fractions / Pizza / Sharing / Food / Shapes
  if (
    lower.includes('fraction') ||
    lower.includes('pizza') ||
    lower.includes('share') ||
    lower.includes('half') ||
    lower.includes('cookie') ||
    lower.includes('slice')
  ) {
    return {
      ...PRESET_QUESTS.find((q) => q.id === 'math-pizza-fractions')!,
      id: `topic-${Date.now()}`,
      title: `${safeHero}'s ${cleanTopic} Adventure`,
      topic: cleanTopic,
      themeEmoji: '🍕',
    };
  }

  // 3. Space / Solar System / Planet / Moon / Rocket / Gravity
  if (
    lower.includes('space') ||
    lower.includes('solar') ||
    lower.includes('planet') ||
    lower.includes('moon') ||
    lower.includes('gravity') ||
    lower.includes('rocket') ||
    lower.includes('star') ||
    lower.includes('astronaut')
  ) {
    return {
      ...PRESET_QUESTS.find((q) => q.id === 'space-moon-mystery')!,
      id: `topic-${Date.now()}`,
      title: `${safeHero}'s Cosmic ${cleanTopic} Mission`,
      topic: cleanTopic,
      themeEmoji: '🚀',
    };
  }

  // 4. Dinosaurs / Fossils / Prehistoric / T-Rex
  if (
    lower.includes('dino') ||
    lower.includes('fossil') ||
    lower.includes('jurassic') ||
    lower.includes('prehistoric') ||
    lower.includes('triceratops')
  ) {
    return {
      ...PRESET_QUESTS.find((q) => q.id === 'dino-safari-quest')!,
      id: `topic-${Date.now()}`,
      title: `${safeHero} and the ${cleanTopic} Discovery`,
      topic: cleanTopic,
      themeEmoji: '🦖',
    };
  }

  // 5. Coding / Robots / Computer / Loops
  if (
    lower.includes('code') ||
    lower.includes('coding') ||
    lower.includes('robot') ||
    lower.includes('loop') ||
    lower.includes('algorithm') ||
    lower.includes('program')
  ) {
    return {
      ...PRESET_QUESTS.find((q) => q.id === 'coding-robot-workshop')!,
      id: `topic-${Date.now()}`,
      title: `${safeHero}'s ${cleanTopic} Challenge`,
      topic: cleanTopic,
      themeEmoji: '🤖',
    };
  }

  // 6. Ocean / Marine / Sea / Fish / Dolphins / Coral
  if (
    lower.includes('ocean') ||
    lower.includes('sea') ||
    lower.includes('marine') ||
    lower.includes('coral') ||
    lower.includes('fish') ||
    lower.includes('dolphin') ||
    lower.includes('whale')
  ) {
    return {
      ...PRESET_QUESTS.find((q) => q.id === 'ocean-coral-rescue')!,
      id: `topic-${Date.now()}`,
      title: `${safeHero} and the Deep ${cleanTopic} Expedition`,
      topic: cleanTopic,
      themeEmoji: '🌊',
    };
  }

  // 7. History / Inventions / Sports Milestones / 1,000 Years
  if (
    rawSubject === 'History' ||
    lower.includes('history') ||
    lower.includes('invent') ||
    lower.includes('sport') ||
    lower.includes('olympic') ||
    lower.includes('medieval') ||
    lower.includes('castle') ||
    lower.includes('knight') ||
    lower.includes('renaissance') ||
    lower.includes('airplane') ||
    lower.includes('flight') ||
    lower.includes('gutenberg') ||
    lower.includes('bannister') ||
    lower.includes('runner') ||
    lower.includes('race') ||
    lower.includes('stadium') ||
    lower.includes('century') ||
    lower.includes('ancient') ||
    lower.includes('civilization') ||
    lower.includes('pyramid') ||
    lower.includes('empire') ||
    lower.includes('revolution')
  ) {
    return {
      ...PRESET_QUESTS.find((q) => q.id === 'history-invention-time-travel')!,
      id: `topic-${Date.now()}`,
      title: `${safeHero} and the 1,000-Year ${cleanTopic} Time Machine`,
      topic: cleanTopic,
      themeEmoji: '🏛️',
    };
  }

  // 8. General Custom Topic Grounding:
  // Dynamically tailor each challenge to the child's topic with zero keys/doors!
  const isMath = rawSubject === 'Math' || lower.includes('math') || lower.includes('count') || lower.includes('number');
  return {
    id: `topic-${Date.now()}`,
    title: `${safeHero} and the Great ${cleanTopic} Expedition`,
    subtitle: `An epic learning journey about ${cleanTopic} starring ${safeHero}!`,
    theme: isMath ? 'math' : 'science',
    subject: rawSubject || (isMath ? 'Math' : 'Science'),
    topic: cleanTopic,
    themeEmoji: safeAvatar,
    accentColor: isMath ? 'from-blue-600 via-indigo-600 to-purple-600' : 'from-emerald-600 via-teal-600 to-cyan-600',
    bgGradient: 'bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white',
    description: `Help ${safeHero} explore ${cleanTopic} through 4 thrilling chapters with math and science choices!`,
    scenes: [
      {
        id: 'scene-1',
        chapterNumber: 1,
        title: `The ${cleanTopic} Mission Begins`,
        sceneEmoji: safeAvatar,
        location: `${cleanTopic} Basecamp`,
        narrative: `${safeHero} packs the official expedition supplies for ${cleanTopic}! You pack 4 glowing star tokens and 3 special discovery tools. How many mission supplies do you have in all?`,
        challengePrompt: 'Count all supplies together: 4 + 3 = ?',
        visualHelper: {
          type: 'emoji-row',
          items: ['⭐', '⭐', '⭐', '⭐', '➕', '🎒', '🎒', '🎒'],
          hintText: 'Count 4 stars, then add 3 tools: 5, 6, 7!',
        },
        choices: [
          {
            id: 'c1-7',
            text: `7 Supplies in all (4 + 3 = 7)`,
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Addition (4+3)',
            explanation: `Awesome counting, ${safeHero}! 4 + 3 equals 7 mission supplies!`,
            outcomeNarrative: `${safeHero} packs all 7 items securely into the explorer pack and sets off on the trail!`,
            earnedItem: `${cleanTopic} Compass 🧭`,
          },
          {
            id: 'c1-5',
            text: '5 Supplies',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Addition (4+3)',
            explanation: 'Count 4, then count 3 more: 5, 6, 7!',
            outcomeNarrative: 'Check your explorer bag count again.',
          },
          {
            id: 'c1-6',
            text: '6 Supplies',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Addition (4+3)',
            explanation: 'Just 1 more to reach 7! 4 + 3 = 7!',
            outcomeNarrative: 'Count on your fingers: 4 fingers and 3 fingers!',
          },
        ],
      },
      {
        id: 'scene-2',
        chapterNumber: 2,
        title: `Crossing the ${cleanTopic} River`,
        sceneEmoji: '🌊',
        location: 'The Sparkling Stream',
        narrative: `A wide blue river crosses the path of ${cleanTopic}. To ferry across safely, ${safeHero} needs something that floats on water rather than sinking. Which item will float?`,
        challengePrompt: 'Which item will float on water?',
        visualHelper: {
          type: 'counter',
          items: ['🪵 Light wood log: Floats on top!', '🪨 Heavy iron rock: Sinks down!'],
          hintText: 'Wood is buoyant and less dense than water, so it floats!',
        },
        choices: [
          {
            id: 'c2-wood',
            text: '🪵 A light wooden raft (wood floats on water!)',
            isCorrect: true,
            subjectType: 'science',
            conceptTag: 'Sink vs Float',
            explanation: `Brilliant science, ${safeHero}! Wood is less dense than water, so it floats like a boat!`,
            outcomeNarrative: `${safeHero} steps onto the wooden raft and glides smoothly across the sparkling water!`,
            earnedItem: 'River Scout Paddle 🛶',
          },
          {
            id: 'c2-rock',
            text: '🪨 A giant heavy solid iron rock',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Sink vs Float',
            explanation: 'Heavy iron sinks straight to the bottom: SPLASH!',
            outcomeNarrative: 'The rock sinks to the river bed.',
          },
          {
            id: 'c2-anchor',
            text: '⛓️ An iron metal anchor',
            isCorrect: false,
            subjectType: 'science',
            conceptTag: 'Sink vs Float',
            explanation: 'Anchors are designed to sink, not float!',
            outcomeNarrative: 'The metal chain sinks into the sand.',
          },
        ],
      },
      {
        id: 'scene-3',
        chapterNumber: 3,
        title: `The Mystery Pattern of ${cleanTopic}`,
        sceneEmoji: '✨',
        location: 'The Valley of Wonders',
        narrative: `To unlock the secret beacon for ${cleanTopic}, ${safeHero} observes glowing signal lights: 🟢 Green, 🔵 Blue, 🟢 Green, 🔵 Blue, 🟢 Green... What color signal must come next?`,
        challengePrompt: 'What color light comes next: Green, Blue, Green, Blue, Green, ___?',
        visualHelper: {
          type: 'emoji-row',
          items: ['🟢', '🔵', '🟢', '🔵', '🟢', '❓'],
          hintText: 'Listen to the repeating rhythm: Green, Blue, Green, Blue, Green... ?',
        },
        choices: [
          {
            id: 'c3-blue',
            text: '🔵 Blue Light (Completes the repeating pattern!)',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: 'Pattern Recognition',
            explanation: `Master of patterns, ${safeHero}! Green, Blue, Green, Blue, Green, BLUE!`,
            outcomeNarrative: 'The signal chime harmonizes with sparkling rainbow lights! The beacon shines bright!',
            earnedItem: 'Starlight Crystal Beacon 💎',
          },
          {
            id: 'c3-red',
            text: '🔴 Red Light',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Pattern Recognition',
            explanation: 'Only Green and Blue repeat in this sequence! No red!',
            outcomeNarrative: 'Look at the first two alternating colors.',
          },
          {
            id: 'c3-green',
            text: '🟢 Green Light',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: 'Pattern Recognition',
            explanation: 'Green is right before this! After Green comes Blue!',
            outcomeNarrative: 'Two greens never touch in this rhythm.',
          },
        ],
      },
      {
        id: 'scene-4',
        chapterNumber: 4,
        title: `The Final ${cleanTopic} Discovery`,
        sceneEmoji: '🏆',
        location: 'The Summit of Knowledge',
        narrative: `At the highest peak, ${safeHero} reaches the historic treasure pedestal. It has a geometric carving with exactly 3 straight sides and 3 corners. Which shape is it?`,
        challengePrompt: 'Which geometric shape has 3 straight sides and 3 corners?',
        visualHelper: {
          type: 'shapes',
          items: ['🔺 Triangle: 3 sides', '🟦 Square: 4 sides', '⭕ Circle: 0 straight sides'],
          hintText: 'Tri means three! A triangle has 3 sides and 3 corners!',
        },
        choices: [
          {
            id: 'c4-triangle',
            text: '🔺 A Triangle (3 sides and 3 corners)',
            isCorrect: true,
            subjectType: 'math',
            conceptTag: '2D Shapes (Triangle)',
            explanation: `Champion, ${safeHero}! "Tri" means three! A triangle has exactly 3 sides and 3 corners!`,
            outcomeNarrative: `The pedestal glows with brilliant golden light! You completed the ${cleanTopic} expedition!`,
            earnedItem: `Grand Medal of ${cleanTopic} 🏅`,
          },
          {
            id: 'c4-square',
            text: '🟦 A Square (4 sides)',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: '2D Shapes (Triangle)',
            explanation: 'A square has 4 sides! We need the shape with 3 sides!',
            outcomeNarrative: 'Count the sides: 1, 2, 3!',
          },
          {
            id: 'c4-circle',
            text: '⭕ A Circle (0 straight sides)',
            isCorrect: false,
            subjectType: 'math',
            conceptTag: '2D Shapes (Triangle)',
            explanation: 'A circle is completely round with no corners! Tri means 3!',
            outcomeNarrative: 'Count three fingers for the three sides.',
          },
        ],
      },
    ],
    victoryReward: {
      badgeName: `Master of ${cleanTopic}`,
      badgeEmoji: '🏅',
      congratulations: `Incredible achievement, ${safeHero}! You explored ${cleanTopic} and solved addition, floating science, patterns, and geometric shapes!`,
      followUpQuestion: `What was your favorite discovery during the ${cleanTopic} adventure?`,
    },
  };
}


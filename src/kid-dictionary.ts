export interface VocabularyDefinition {
  word: string;
  category: 'Science' | 'Math' | 'Coding' | 'Reading' | 'Space' | 'Nature' | 'General';
  pronunciation?: string;
  simpleDefinition: string;
  example: string;
  emoji: string;
}

export const KID_VOCABULARY: Record<string, VocabularyDefinition> = {
  photosynthesis: {
    word: 'photosynthesis',
    category: 'Science',
    pronunciation: 'foh-toh-SIN-thuh-sis',
    simpleDefinition: 'How green plants turn sunlight, water, and air into delicious plant food and fresh oxygen for us to breathe!',
    example: 'Leaves use photosynthesis every sunny afternoon to grow strong.',
    emoji: '🌱',
  },
  chlorophyll: {
    word: 'chlorophyll',
    category: 'Science',
    pronunciation: 'KLOR-uh-fil',
    simpleDefinition: 'The magical green color in plant leaves that catches sunlight like a tiny solar panel.',
    example: 'Chlorophyll is why healthy grass and leaves look bright green!',
    emoji: '🍃',
  },
  atmosphere: {
    word: 'atmosphere',
    category: 'Space',
    pronunciation: 'AT-muhs-feer',
    simpleDefinition: 'A thick blanket of air wrapped all around planet Earth that lets us breathe and keeps us warm.',
    example: 'Earth\'s atmosphere protects us from harmful sun rays.',
    emoji: '🌍',
  },
  gravity: {
    word: 'gravity',
    category: 'Science',
    pronunciation: 'GRAV-ih-tee',
    simpleDefinition: 'The invisible pulling force of Earth that keeps our feet on the ground and pulls dropped balls downward.',
    example: 'Without gravity, we would all float away into the clouds!',
    emoji: '🪐',
  },
  orbit: {
    word: 'orbit',
    category: 'Space',
    pronunciation: 'OR-bit',
    simpleDefinition: 'The curved racetrack path that an object in space follows as it travels around a bigger star or planet.',
    example: 'The Moon takes about 27 days to finish one orbit around Earth.',
    emoji: '🛰️',
  },
  galaxy: {
    word: 'galaxy',
    category: 'Space',
    pronunciation: 'GAL-uk-see',
    simpleDefinition: 'A giant swirling family of billions of stars, planets, and space dust held together by gravity.',
    example: 'We live inside the Milky Way galaxy!',
    emoji: '🌌',
  },
  evaporation: {
    word: 'evaporation',
    category: 'Science',
    pronunciation: 'ih-vap-uh-RAY-shun',
    simpleDefinition: 'When liquid water gets warmed by heat and turns into invisible floating water vapor in the air.',
    example: 'A rain puddle disappears on a hot sunny day because of evaporation.',
    emoji: '♨️',
  },
  condensation: {
    word: 'condensation',
    category: 'Science',
    pronunciation: 'kon-den-SAY-shun',
    simpleDefinition: 'When cool floating vapor bunches together and turns back into tiny liquid water drops, forming clouds.',
    example: 'The cold lemonade glass had drops of condensation on the outside.',
    emoji: '☁️',
  },
  precipitation: {
    word: 'precipitation',
    category: 'Science',
    pronunciation: 'pree-sip-ih-TAY-shun',
    simpleDefinition: 'Water falling down from heavy clouds in the sky as rain, snow, sleet, or hail.',
    example: 'Yesterday our town had three inches of precipitation in a thunderstorm!',
    emoji: '🌧️',
  },
  ecosystem: {
    word: 'ecosystem',
    category: 'Nature',
    pronunciation: 'EE-koh-sis-tum',
    simpleDefinition: 'A neighborhood in nature where living animals, plants, water, and soil all help each other survive.',
    example: 'A pond is a busy ecosystem filled with frogs, lilies, and dragonflies.',
    emoji: '🌲',
  },
  organism: {
    word: 'organism',
    category: 'Nature',
    pronunciation: 'OR-guh-niz-um',
    simpleDefinition: 'Any living individual creature, such as an animal, a tree, a mushroom, or even a tiny bug.',
    example: 'Every organism on Earth needs food and water to stay alive.',
    emoji: '🦊',
  },
  habitat: {
    word: 'habitat',
    category: 'Nature',
    pronunciation: 'HAB-ih-tat',
    simpleDefinition: 'The natural home where an animal or plant finds its food, fresh water, and safe shelter.',
    example: 'A polar bear\'s habitat is the snowy Arctic ice.',
    emoji: '🏡',
  },
  predator: {
    word: 'predator',
    category: 'Nature',
    pronunciation: 'PRED-uh-tor',
    simpleDefinition: 'An animal that hunts and catches other animals for food.',
    example: 'An eagle is a sharp-eyed predator that hunts fish.',
    emoji: '🦅',
  },
  prey: {
    word: 'prey',
    category: 'Nature',
    pronunciation: 'PRAY',
    simpleDefinition: 'An animal that is hunted and eaten by other animals.',
    example: 'The small field mouse stayed quiet so it wouldn\'t become prey for the owl.',
    emoji: '🐁',
  },
  camouflage: {
    word: 'camouflage',
    category: 'Nature',
    pronunciation: 'KAM-uh-flahzh',
    simpleDefinition: 'Colors or patterns on an animal\'s body that help it blend into its surroundings and hide.',
    example: 'The green chameleon used camouflage to hide among the leaves.',
    emoji: '🦎',
  },
  friction: {
    word: 'friction',
    category: 'Science',
    pronunciation: 'FRIK-shun',
    simpleDefinition: 'The rubbing force between two touching objects that slows down movement and creates warmth.',
    example: 'Bicycle brakes use friction against the wheels to stop you safely.',
    emoji: '🛑',
  },
  inertia: {
    word: 'inertia',
    category: 'Science',
    pronunciation: 'in-ER-shuh',
    simpleDefinition: 'The tendency of objects to keep doing what they are already doing (staying still or staying in motion).',
    example: 'When the bus suddenly stops, inertia makes you lean forward.',
    emoji: '🏃',
  },
  molecule: {
    word: 'molecule',
    category: 'Science',
    pronunciation: 'MOL-uh-kyool',
    simpleDefinition: 'A tiny building block made of two or more atoms linked together like microscopic Lego bricks.',
    example: 'A water molecule is made of two hydrogen atoms and one oxygen atom (H₂O).',
    emoji: '⚛️',
  },
  atom: {
    word: 'atom',
    category: 'Science',
    pronunciation: 'AT-um',
    simpleDefinition: 'The smallest fundamental building block of all matter in the entire universe.',
    example: 'Everything you can touch, from a puppy to a pencil, is made of atoms!',
    emoji: '🔬',
  },
  fraction: {
    word: 'fraction',
    category: 'Math',
    pronunciation: 'FRAK-shun',
    simpleDefinition: 'A number that represents a part of a whole, like a single slice from an 8-slice pizza.',
    example: 'If you eat 1 out of 4 cookie pieces, you ate 1/4 (one quarter).',
    emoji: '🍕',
  },
  numerator: {
    word: 'numerator',
    category: 'Math',
    pronunciation: 'NOO-muh-ray-tor',
    simpleDefinition: 'The top number of a fraction that tells how many parts or slices you are counting.',
    example: 'In the fraction 3/4, the number 3 is the numerator.',
    emoji: '☝️',
  },
  denominator: {
    word: 'denominator',
    category: 'Math',
    pronunciation: 'dih-NOM-uh-nay-tor',
    simpleDefinition: 'The bottom number of a fraction that tells the total number of equal pieces in the whole.',
    example: 'In the fraction 3/4, the number 4 is the denominator.',
    emoji: '👇',
  },
  perimeter: {
    word: 'perimeter',
    category: 'Math',
    pronunciation: 'puh-RIM-ih-ter',
    simpleDefinition: 'The total distance all the way around the outside edge of a shape.',
    example: 'To build a fence around your garden, you measure the perimeter.',
    emoji: '📐',
  },
  circumference: {
    word: 'circumference',
    category: 'Math',
    pronunciation: 'ser-KUM-fer-ens',
    simpleDefinition: 'The perimeter or total distance all the way around the outside of a circle.',
    example: 'We wrapped a tape measure around the basketball to find its circumference.',
    emoji: '⭕',
  },
  algorithm: {
    word: 'algorithm',
    category: 'Coding',
    pronunciation: 'AL-guh-rith-um',
    simpleDefinition: 'A clear step-by-step recipe of instructions given to a computer to solve a puzzle or do a task.',
    example: 'A cookie recipe is an everyday algorithm for delicious baking!',
    emoji: '📝',
  },
  loop: {
    word: 'loop',
    category: 'Coding',
    pronunciation: 'LOOP',
    simpleDefinition: 'A coding command that tells the computer to repeat instructions again and again.',
    example: 'Instead of typing "step forward" ten times, we put it in a loop of 10!',
    emoji: '🔁',
  },
  iteration: {
    word: 'iteration',
    category: 'Coding',
    pronunciation: 'it-uh-RAY-shun',
    simpleDefinition: 'One single round or repetition of an action in a repeating loop.',
    example: 'On the third iteration of the dance loop, the robot spun around.',
    emoji: '🔄',
  },
  variable: {
    word: 'variable',
    category: 'Coding',
    pronunciation: 'VAIR-ee-uh-bul',
    simpleDefinition: 'A labeled storage box in computer code that holds information that can change, like a game score.',
    example: 'Every time you collect a gold coin, the player score variable goes up by 10.',
    emoji: '📦',
  },
  function: {
    word: 'function',
    category: 'Coding',
    pronunciation: 'FUNGK-shun',
    simpleDefinition: 'A reusable mini-program with a name that performs a specific job whenever you call it.',
    example: 'The game has a jump() function that makes Mario hop into the air.',
    emoji: '⚙️',
  },
  bug: {
    word: 'bug',
    category: 'Coding',
    pronunciation: 'BUG',
    simpleDefinition: 'A mistake or unexpected surprise in a computer program that makes it behave weirdly.',
    example: 'When the game character walked through walls, the programmer fixed the bug.',
    emoji: '🐛',
  },
  metaphor: {
    word: 'metaphor',
    category: 'Reading',
    pronunciation: 'MET-uh-for',
    simpleDefinition: 'A colorful way to describe something by saying it IS something else (without using "like" or "as").',
    example: '"The classroom was a bustling beehive" is a metaphor!',
    emoji: '📖',
  },
  simile: {
    word: 'simile',
    category: 'Reading',
    pronunciation: 'SIM-uh-lee',
    simpleDefinition: 'A comparison between two different things using the words "like" or "as".',
    example: '"He was as brave as a lion" is a simile.',
    emoji: '✨',
  },
  synonym: {
    word: 'synonym',
    category: 'Reading',
    pronunciation: 'SIN-uh-nim',
    simpleDefinition: 'A word that has the exact same or almost the same meaning as another word.',
    example: '"Huge", "gigantic", and "enormous" are synonyms for "big".',
    emoji: '👯',
  },
  antonym: {
    word: 'antonym',
    category: 'Reading',
    pronunciation: 'AN-tuh-nim',
    simpleDefinition: 'A word that means the direct opposite of another word.',
    example: '"Hot" is the antonym of "cold".',
    emoji: '↔️',
  },
  prefix: {
    word: 'prefix',
    category: 'Reading',
    pronunciation: 'PREE-fiks',
    simpleDefinition: 'A group of letters added to the beginning of a word to change its meaning.',
    example: 'Adding the prefix "un-" to "happy" makes "unhappy" (not happy).',
    emoji: '🧩',
  },
  suffix: {
    word: 'suffix',
    category: 'Reading',
    pronunciation: 'SUF-iks',
    simpleDefinition: 'A group of letters added to the end of a word to change how it is used.',
    example: 'Adding the suffix "-ful" to "help" makes "helpful".',
    emoji: '🧩',
  },
  hypothesis: {
    word: 'hypothesis',
    category: 'Science',
    pronunciation: 'hy-POTH-uh-sis',
    simpleDefinition: 'A smart scientific guess about what will happen that you can test with an experiment.',
    example: 'Our hypothesis was that plants in sunny windows grow taller than plants in the dark.',
    emoji: '💡',
  },
  conductor: {
    word: 'conductor',
    category: 'Science',
    pronunciation: 'kun-DUK-ter',
    simpleDefinition: 'A material (like copper metal or water) that easily lets electricity or heat travel through it.',
    example: 'Metal wires are conductors that carry electric current to light bulbs.',
    emoji: '⚡',
  },
  insulator: {
    word: 'insulator',
    category: 'Science',
    pronunciation: 'IN-suh-lay-ter',
    simpleDefinition: 'A material (like rubber, plastic, or wood) that stops or blocks heat and electricity from passing.',
    example: 'Electrical cords are covered in rubber insulators to keep our hands safe.',
    emoji: '🧤',
  },
  vibration: {
    word: 'vibration',
    category: 'Science',
    pronunciation: 'vy-BRAY-shun',
    simpleDefinition: 'A quick back-and-forth shaking movement that creates sound waves we can hear.',
    example: 'Plucking a guitar string makes it vibrate, creating a musical note!',
    emoji: '🔊',
  },
  magma: {
    word: 'magma',
    category: 'Science',
    pronunciation: 'MAG-muh',
    simpleDefinition: 'Super hot, melted liquid rock located deep beneath the Earth\'s crust.',
    example: 'When pressure builds up, magma gets pushed up toward volcanoes.',
    emoji: '🌋',
  },
  lava: {
    word: 'lava',
    category: 'Science',
    pronunciation: 'LAH-vuh',
    simpleDefinition: 'Melted liquid rock that has erupted out of a volcano onto the surface of the Earth.',
    example: 'As glowing red lava cools down on the mountain, it turns into dark solid rock.',
    emoji: '🔥',
  },
  velocity: {
    word: 'velocity',
    category: 'Science',
    pronunciation: 'vuh-LOS-ih-tee',
    simpleDefinition: 'The speed of an object along with the direction it is traveling.',
    example: 'The rocket reached a velocity of 17,000 miles per hour heading into space.',
    emoji: '🚀',
  },
  frequency: {
    word: 'frequency',
    category: 'Science',
    pronunciation: 'FREE-kwen-see',
    simpleDefinition: 'How fast sound waves or light waves wiggle back and forth in one second (higher frequency = higher pitch).',
    example: 'A squeaky bird chirp has a much higher frequency than a deep lion roar.',
    emoji: '〰️',
  },
  pollination: {
    word: 'pollination',
    category: 'Nature',
    pronunciation: 'pol-ih-NAY-shun',
    simpleDefinition: 'The transfer of pollen dust between flowers by bees, wind, or butterflies so plants can make seeds.',
    example: 'Bumblebees carry yellow pollen from flower to flower during pollination.',
    emoji: '🐝',
  },
};

// Word normalizer to match plurals, past tense, and punctuation
export function findWordDefinition(rawToken: string): { word: string; definition: VocabularyDefinition } | null {
  if (!rawToken || rawToken.length < 3) return null;

  // Strip punctuation at start and end
  const clean = rawToken.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').toLowerCase();
  if (!clean || clean.length < 3) return null;

  // Direct match
  if (KID_VOCABULARY[clean]) {
    return { word: clean, definition: KID_VOCABULARY[clean] };
  }

  // Common singular / plural variations
  const variations: string[] = [];
  if (clean.endsWith('s') && !clean.endsWith('ss')) {
    variations.push(clean.slice(0, -1)); // fractions -> fraction
  }
  if (clean.endsWith('es')) {
    variations.push(clean.slice(0, -2)); // galaxies -> galaxy handled below
  }
  if (clean.endsWith('ies')) {
    variations.push(clean.slice(0, -3) + 'y'); // galaxies -> galaxy
  }
  if (clean.endsWith('ed')) {
    variations.push(clean.slice(0, -2)); // iterated -> iterate
    variations.push(clean.slice(0, -1));
  }
  if (clean.endsWith('ing')) {
    variations.push(clean.slice(0, -3)); // coding -> code
    variations.push(clean.slice(0, -3) + 'e');
  }

  for (const variant of variations) {
    if (KID_VOCABULARY[variant]) {
      return { word: variant, definition: KID_VOCABULARY[variant] };
    }
  }

  return null;
}

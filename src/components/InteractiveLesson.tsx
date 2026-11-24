import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Play,
  Sun,
  Droplets,
  HelpCircle,
  MessageSquare,
  ChevronRight,
  Code2,
  Compass,
  PieChart,
  BookOpen,
  Sliders,
  Layers,
  Flame,
  Activity,
} from 'lucide-react';
import { type Subject, type AgeBand, SUBJECT_DETAILS } from '../tutor-prompt.ts';
import {
  type InteractiveConceptLesson,
  POPULAR_EXPLAIN_TOPICS,
  getInteractiveLessonForTopic,
} from '../interactive-topics.ts';

interface InteractiveLessonProps {
  subject: Subject;
  ageBand: AgeBand;
  activeConceptLesson?: InteractiveConceptLesson | null;
  onSelectConceptLesson?: (lesson: InteractiveConceptLesson | null) => void;
  onAskTutor: (prompt: string) => void;
  onPlaySound?: (type: 'pop' | 'success') => void;
}

const HISTORIC_TIMELINE = [
  {
    year: '1066 - 1215',
    category: 'Medieval Era',
    icon: '🏰',
    title: 'Castles, Knights & Magna Carta',
    summary: 'Over 800 years ago, stone castles and the Magna Carta of 1215 established the revolutionary idea that no one, not even kings, is above the law!',
    funFact: 'Castles had spiral staircases winding clockwise so defending knights had room to swing right-handed swords while invaders were cramped!',
    prompt: 'Tell me about life in medieval castles and how the Magna Carta changed the world in 1215!',
  },
  {
    year: '1440',
    category: 'World-Changing Invention',
    icon: '🖨️',
    title: 'Gutenberg Printing Press',
    summary: 'Johannes Gutenberg combined movable metal type blocks and oil ink, allowing thousands of books to be printed so everyone could learn to read!',
    funFact: 'Before Gutenberg, every single book had to be handwritten by monks taking up to a full year per book!',
    prompt: 'How did Johannes Gutenberg invent the movable type printing press in 1440 and change history?',
  },
  {
    year: '1687',
    category: 'Scientific Revolution',
    icon: '🍎',
    title: 'Newton’s Laws of Motion & Gravity',
    summary: 'Sir Isaac Newton explained why apples fall to earth and how gravity keeps the Moon orbiting our planet in space.',
    funFact: 'Newton discovered that white sunlight is secretly made of all rainbow colors using a glass prism!',
    prompt: 'Can you explain Isaac Newton’s 3 laws of motion with fun, simple examples for kids?',
  },
  {
    year: '1769',
    category: 'Industrial Revolution',
    icon: '🚂',
    title: 'The Steam Engine & Railroads',
    summary: 'James Watt perfected the condensing steam engine, powering trains and steamships faster than any galloping horse!',
    funFact: 'Steam engines turn boiling water vapor into immense mechanical pushing force to move heavy iron locomotives!',
    prompt: 'How did steam engines and trains change the world during the Industrial Revolution?',
  },
  {
    year: '1903',
    category: 'Aviation Triumph',
    icon: '✈️',
    title: 'The Wright Brothers’ First Flight',
    summary: 'Wilbur and Orville Wright made history at Kitty Hawk with the first motor-powered, controlled airplane flight.',
    funFact: 'The first flight lasted just 12 seconds, but 66 years later humans flew to the Moon in 1969!',
    prompt: 'Tell me the story of the Wright brothers and the first airplane flight at Kitty Hawk in 1903!',
  },
  {
    year: '1936',
    category: 'Sports Legend',
    icon: '🏃‍♂️',
    title: 'Jesse Owens at Berlin Olympics',
    summary: 'Jesse Owens won 4 Olympic gold medals in the 100m, 200m, relay, and long jump, triumphing against racial prejudice.',
    funFact: 'His long jump record of 26 ft 8 in stood unbroken for 25 consecutive years!',
    prompt: 'Can you tell me the inspiring story of Jesse Owens and his 4 gold medals at the 1936 Olympics?',
  },
  {
    year: '1954',
    category: 'Sports Breakthrough',
    icon: '⏱️',
    title: 'Roger Bannister: 4-Minute Mile',
    summary: 'Roger Bannister proved the human body could run a mile in under 4 minutes (3:59.4), breaking what experts had declared physically impossible.',
    funFact: 'He trained in 45-minute lunch breaks during medical school, proving mental belief is just as important as physical training!',
    prompt: 'Why did doctors think a sub-4-minute mile was impossible until Roger Bannister in 1954?',
  },
  {
    year: '1969',
    category: 'Space Exploration',
    icon: '🚀',
    title: 'Apollo 11 Moon Landing',
    summary: 'Astronauts Neil Armstrong and Buzz Aldrin stepped onto the lunar surface in humanity’s greatest voyage.',
    funFact: 'The guidance computer on the Apollo spacecraft had less memory than a modern greeting card with music!',
    prompt: 'How did Apollo 11 land on the Moon in 1969 and what was it like for the astronauts?',
  },
  {
    year: '1989',
    category: 'Digital Era',
    icon: '🌐',
    title: 'Tim Berners-Lee: World Wide Web',
    summary: 'Tim Berners-Lee invented HTML, web links, and browsers, connecting computers around the world to share all knowledge.',
    funFact: 'The very first website in the world went online in 1991 and is still accessible today!',
    prompt: 'How did Tim Berners-Lee invent the World Wide Web in 1989 and connect the entire planet?',
  },
];

export function InteractiveLesson({
  subject,
  ageBand,
  activeConceptLesson,
  onSelectConceptLesson,
  onAskTutor,
  onPlaySound,
}: InteractiveLessonProps) {
  // Concept Lesson dynamic state
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [slider1Val, setSlider1Val] = useState<number>(50);
  const [slider2Val, setSlider2Val] = useState<number>(50);
  const [conceptChallengeSolved, setConceptChallengeSolved] = useState<boolean>(false);

  // Math Lesson State: Pizza Fractions
  const [slicesTotal, setSlicesTotal] = useState<number>(4);
  const [eatenSlices, setEatenSlices] = useState<number>(1);
  const [mathTarget] = useState<{ num: number; den: number }>({ num: 3, den: 4 });
  const [mathSolved, setMathSolved] = useState(false);

  // Science Lesson State: Plant Growth Lab
  const [sunlight, setSunlight] = useState<number>(50);
  const [water, setWater] = useState<number>(50);
  const [growthStage, setGrowthStage] = useState<number>(2);

  // Coding Lesson State: Robot Path Grid
  const [robotPos, setRobotPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [robotCommands, setRobotCommands] = useState<string[]>([]);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeSuccess, setCodeSuccess] = useState(false);

  // Story Builder State: Reading & Writing
  const [hero, setHero] = useState<string>('a curious young astronaut');
  const [setting, setSetting] = useState<string>('a floating library in the clouds');
  const [twist, setTwist] = useState<string>('all the books started whispering secrets');

  // English State: Mystery Word Builder
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);

  // General State: Wonder Cards
  const [revealedFact, setRevealedFact] = useState<boolean>(false);

  // History State: 1,000-Year Timeline
  const [historyMilestoneIdx, setHistoryMilestoneIdx] = useState<number>(0);

  // Sync initial slider values when activeConceptLesson changes
  useEffect(() => {
    if (activeConceptLesson) {
      setSlider1Val(activeConceptLesson.slider1.defaultVal);
      if (activeConceptLesson.slider2) {
        setSlider2Val(activeConceptLesson.slider2.defaultVal);
      }
      setActiveStageIdx(0);
      setConceptChallengeSolved(false);
    }
  }, [activeConceptLesson]);

  // Handle Math Slice Click
  const toggleSlice = (idx: number) => {
    onPlaySound?.('pop');
    let nextEaten = eatenSlices;
    if (idx < eatenSlices) {
      nextEaten = idx;
    } else {
      nextEaten = idx + 1;
    }
    setEatenSlices(nextEaten);

    if (slicesTotal === mathTarget.den && nextEaten === mathTarget.num) {
      setMathSolved(true);
      onPlaySound?.('success');
    } else {
      setMathSolved(false);
    }
  };

  // Run Robot Code Sequence
  const runRobotSimulation = async () => {
    if (robotCommands.length === 0 || isRunningCode) return;
    setIsRunningCode(true);
    onPlaySound?.('pop');

    let current = { x: 0, y: 0 };
    setRobotPos(current);

    for (const cmd of robotCommands) {
      await new Promise((resolve) => setTimeout(resolve, 550));
      if (cmd === 'FORWARD') {
        current = { ...current, y: Math.min(2, current.y + 1) };
      } else if (cmd === 'RIGHT') {
        current = { ...current, x: Math.min(2, current.x + 1) };
      }
      setRobotPos({ ...current });
      onPlaySound?.('pop');
    }

    if (current.x === 2 && current.y === 2) {
      setCodeSuccess(true);
      onPlaySound?.('success');
    } else {
      setCodeSuccess(false);
    }
    setIsRunningCode(false);
  };

  // Plant lab adjustment
  const handlePlantChange = (sun: number, wat: number) => {
    setSunlight(sun);
    setWater(wat);
    onPlaySound?.('pop');
    if (sun >= 40 && sun <= 80 && wat >= 40 && wat <= 80) {
      setGrowthStage(3); // Bloom
    } else if (sun >= 20 && wat >= 20) {
      setGrowthStage(2);
    } else if (sun > 0 || wat > 0) {
      setGrowthStage(1);
    } else {
      setGrowthStage(0);
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col gap-5 min-h-[460px]">
      {/* Popular Concept Quick Launcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-100">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
          <span>⚡ Fast Explain:</span>
        </span>
        {POPULAR_EXPLAIN_TOPICS.map((item) => {
          const isCurrent = activeConceptLesson?.topic === item.topic;
          return (
            <button
              key={item.topic}
              type="button"
              onClick={() => {
                const lesson = getInteractiveLessonForTopic(item.topic, ageBand);
                onSelectConceptLesson?.(lesson);
                onPlaySound?.('pop');
              }}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                isCurrent
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}

        {activeConceptLesson && (
          <button
            type="button"
            onClick={() => {
              onSelectConceptLesson?.(null);
              onPlaySound?.('pop');
            }}
            className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors ml-auto"
          >
            ← Back to {subject} Lab
          </button>
        )}
      </div>

      {/* Lesson Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {activeConceptLesson ? activeConceptLesson.icon : SUBJECT_DETAILS[subject]?.icon}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-black">
              {activeConceptLesson
                ? activeConceptLesson.title
                : subject === 'Math'
                ? 'Pizza Fraction Explorer'
                : subject === 'Science'
                ? 'Photosynthesis & Plant Lab'
                : subject === 'Coding'
                ? 'Robot Block Navigator'
                : subject === 'Reading & Writing'
                ? 'Story Sparks Creator'
                : subject === 'English'
                ? 'Word Explorer Studio'
                : subject === 'History'
                ? '1,000-Year Timeline & Inventions Lab'
                : 'Curiosity Discovery Box'}
            </h2>
            {/* Little Gold Badge */}
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Interactive Zone</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {activeConceptLesson
              ? activeConceptLesson.summary
              : `Hands-on exploration designed for ages ${ageBand}`}
          </p>
        </div>

        {/* Ask Tutor CTA Button */}
        <button
          type="button"
          onClick={() => {
            if (activeConceptLesson) {
              onAskTutor(
                `Can you explain ${activeConceptLesson.topic} to me in detail with a fun example? I just explored it in the Interactive Zone with ${activeConceptLesson.slider1.label} set to ${slider1Val}${activeConceptLesson.slider1.unit}!`
              );
              return;
            }

            const promptMap: Record<Subject, string> = {
              Math: `I was exploring the pizza fraction lab with ${eatenSlices}/${slicesTotal} slices. Can you teach me how to simplify or add fractions with another example?`,
              Science: `I tried the plant growth lab with ${sunlight}% sunlight and ${water}% water. Why do plants need both sunlight and water to make food?`,
              Coding: `I made my robot move using loops and steps. What is an algorithm and why do computers execute commands step by step?`,
              'Reading & Writing': `Help me write an exciting story about ${hero} in ${setting}, where ${twist}! What should happen next?`,
              English: `Can you explain how prefixes and suffixes change the meaning of root words with 3 fun examples?`,
              History: `I want to explore 1,000 years of world history, major inventions, and sports achievements! Can you tell me an exciting story about how Gutenberg's printing press, the Wright brothers' flight, or Roger Bannister's 4-minute mile changed the world?`,
              General: `I just read a fun fact! Why do leaves change colors or why does the moon have phases?`,
            };
            onAskTutor(promptMap[subject]);
          }}
          className="px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all active:scale-95"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask Tutorly About This</span>
        </button>
      </div>

      {/* A. DYNAMIC CONCEPT LESSON (Triggered when user asks "explain ____" or picks a fast topic) */}
      {activeConceptLesson ? (
        <div className="flex flex-col gap-5 py-1">
          {/* Scientific Key Rule Box */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-between gap-3 text-xs sm:text-sm text-slate-800">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 block mb-0.5">
                Core Principle:
              </span>
              <strong className="text-blue-950 font-bold">{activeConceptLesson.keyRule}</strong>
            </div>
            <span className="hidden sm:inline-block text-2xl select-none">
              {activeConceptLesson.icon}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            {/* Interactive Stage Visualizer Box */}
            <div className="w-full lg:w-1/2 p-5 rounded-3xl bg-gradient-to-b from-slate-50 via-white to-blue-50/40 border-2 border-slate-200 flex flex-col justify-between shadow-inner min-h-[280px]">
              {/* Stage Progress Pills */}
              <div className="flex items-center gap-1.5 mb-3">
                {activeConceptLesson.stages.map((stage, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveStageIdx(idx);
                      onPlaySound?.('pop');
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                      activeStageIdx === idx
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Step {idx + 1}
                  </button>
                ))}
              </div>

              {/* Active Stage Animated Visual Display */}
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                <div
                  className="text-6xl sm:text-7xl mb-3 transition-transform duration-300"
                  style={{
                    transform: `scale(${0.9 + (slider1Val / 100) * 0.3})`,
                  }}
                >
                  {activeConceptLesson.stages[activeStageIdx]?.visualEmoji || '🔬'}
                </div>
                <h4 className="text-base sm:text-lg font-black text-black">
                  {activeConceptLesson.stages[activeStageIdx]?.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mt-1 leading-relaxed">
                  {activeConceptLesson.stages[activeStageIdx]?.description}
                </p>
                <span className="inline-block mt-2 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {activeConceptLesson.stages[activeStageIdx]?.indicator}
                </span>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-slate-500">
                <button
                  type="button"
                  disabled={activeStageIdx === 0}
                  onClick={() => {
                    setActiveStageIdx((prev) => Math.max(0, prev - 1));
                    onPlaySound?.('pop');
                  }}
                  className="hover:text-blue-600 disabled:opacity-30 cursor-pointer"
                >
                  ← Previous Step
                </button>
                <span>
                  {activeStageIdx + 1} of {activeConceptLesson.stages.length}
                </span>
                <button
                  type="button"
                  disabled={activeStageIdx === activeConceptLesson.stages.length - 1}
                  onClick={() => {
                    setActiveStageIdx((prev) =>
                      Math.min(activeConceptLesson.stages.length - 1, prev + 1)
                    );
                    onPlaySound?.('pop');
                  }}
                  className="hover:text-blue-600 disabled:opacity-30 cursor-pointer"
                >
                  Next Step →
                </button>
              </div>
            </div>

            {/* Interactive Parameters & Challenge Controls */}
            <div className="flex-1 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Interactive Controls:</span>
                </h3>

                {/* Slider 1 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-black">{activeConceptLesson.slider1.label}:</span>
                    <span className="font-mono text-blue-600">
                      {slider1Val}
                      {activeConceptLesson.slider1.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={activeConceptLesson.slider1.min}
                    max={activeConceptLesson.slider1.max}
                    value={slider1Val}
                    onChange={(e) => {
                      setSlider1Val(Number(e.target.value));
                      onPlaySound?.('pop');
                      if (Number(e.target.value) >= 60) {
                        setConceptChallengeSolved(true);
                      }
                    }}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>

                {/* Slider 2 (if present) */}
                {activeConceptLesson.slider2 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-black">{activeConceptLesson.slider2.label}:</span>
                      <span className="font-mono text-blue-600">
                        {slider2Val}
                        {activeConceptLesson.slider2.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={activeConceptLesson.slider2.min}
                      max={activeConceptLesson.slider2.max}
                      value={slider2Val}
                      onChange={(e) => {
                        setSlider2Val(Number(e.target.value));
                        onPlaySound?.('pop');
                      }}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Challenge / Goal Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    <span>Try This Experiment:</span>
                  </span>
                  {conceptChallengeSolved && (
                    <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Solved!
                    </span>
                  )}
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {activeConceptLesson.quickChallenge}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* B. CORE SUBJECT LABS */
        <>
          {/* 1. MATH: Fraction Pizza Module */}
          {subject === 'Math' && (
            <div className="flex flex-col md:flex-row items-center gap-6 py-2">
              {/* Interactive Pizza Visualizer */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-amber-50 border-4 border-amber-400 p-2 shadow-inner flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-200 to-amber-300 relative overflow-hidden border-2 border-amber-400">
                    {Array.from({ length: slicesTotal }).map((_, i) => {
                      const isEaten = i < eatenSlices;
                      const sliceAngle = 360 / slicesTotal;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleSlice(i)}
                          title={`Slice ${i + 1} of ${slicesTotal}`}
                          className={`absolute inset-0 transition-opacity cursor-pointer flex items-center justify-center ${
                            isEaten
                              ? 'bg-amber-500/80 hover:bg-amber-500/90'
                              : 'bg-amber-100/70 hover:bg-amber-200/80 border-dashed border-amber-400/50'
                          }`}
                          style={{
                            clipPath: `polygon(50% 50%, ${
                              50 + 50 * Math.cos((((i * sliceAngle) - 90) * Math.PI) / 180)
                            }% ${
                              50 + 50 * Math.sin((((i * sliceAngle) - 90) * Math.PI) / 180)
                            }%, ${
                              50 + 50 * Math.cos(((((i + 1) * sliceAngle) - 90) * Math.PI) / 180)
                            }% ${
                              50 + 50 * Math.sin(((((i + 1) * sliceAngle) - 90) * Math.PI) / 180)
                            }%)`,
                          }}
                        >
                          <span className="sr-only">Slice {i + 1}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="absolute w-6 h-6 rounded-full bg-amber-600 border-2 border-white shadow-xs pointer-events-none" />
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  Tap the pizza slices to pick or eat them!
                </div>
              </div>

              {/* Controls & Math Concept */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/80 border-2 border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      Current Fraction
                    </span>
                    <div className="text-3xl font-black text-blue-900 mt-1 flex items-baseline gap-2">
                      <span>{eatenSlices}</span>
                      <span className="text-slate-400">/</span>
                      <span>{slicesTotal}</span>
                    </div>
                  </div>

                  {mathSolved && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-sm animate-bounce">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Target Reached! 🍕</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm">
                  <strong className="text-black">Mini Challenge:</strong> Divide the pizza into <strong>4 slices</strong> and choose <strong>3 slices</strong> to make <strong>3/4</strong>!
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">
                    Number of Slices (Denominator):
                  </label>
                  <div className="flex gap-2">
                    {[2, 4, 6, 8].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => {
                          setSlicesTotal(n);
                          setEatenSlices(Math.min(eatenSlices, n));
                          if (n === mathTarget.den && Math.min(eatenSlices, n) === mathTarget.num) {
                            setMathSolved(true);
                          } else {
                            setMathSolved(false);
                          }
                          onPlaySound?.('pop');
                        }}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
                          slicesTotal === n
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {n} Slices
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SCIENCE: Plant Growth Lab */}
          {subject === 'Science' && (
            <div className="flex flex-col md:flex-row items-center gap-6 py-2">
              <div className="w-56 h-60 rounded-3xl bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 border-2 border-slate-200 relative flex flex-col items-center justify-end p-4 overflow-hidden shadow-inner">
                <div
                  className="absolute top-3 right-3 text-amber-500 transition-transform duration-300"
                  style={{ transform: `scale(${0.6 + sunlight / 100})` }}
                >
                  <Sun className="w-8 h-8 fill-amber-400 stroke-amber-600" />
                </div>

                <div className="text-center z-10 transition-all duration-300">
                  {growthStage === 0 && <span className="text-4xl">🌰</span>}
                  {growthStage === 1 && <span className="text-5xl">🌱</span>}
                  {growthStage === 2 && <span className="text-6xl">🌿</span>}
                  {growthStage === 3 && (
                    <div className="flex flex-col items-center animate-bounce">
                      <span className="text-6xl">🌻</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                        Blooming!
                      </span>
                    </div>
                  )}
                </div>

                <div className="w-full h-10 bg-amber-900/60 rounded-2xl border-t-4 border-amber-800/80 -mb-2" />
              </div>

              <div className="flex-1 flex flex-col gap-4 w-full">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1 text-amber-600">
                      <Sun className="w-3.5 h-3.5" /> Sunlight: {sunlight}%
                    </span>
                    <span className="text-slate-400">Aim for 50-70%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sunlight}
                    onChange={(e) => handlePlantChange(Number(e.target.value), water)}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1 text-blue-600">
                      <Droplets className="w-3.5 h-3.5" /> Water Level: {water}%
                    </span>
                    <span className="text-slate-400">Aim for 50-70%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={water}
                    onChange={(e) => handlePlantChange(sunlight, Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                  <strong>Green Science Fact:</strong> Chlorophyll transforms sunlight, water, and CO₂ into sweet glucose plant food and releases clean oxygen!
                </div>
              </div>
            </div>
          )}

          {/* 3. CODING: Robot Grid Navigator */}
          {subject === 'Coding' && (
            <div className="flex flex-col md:flex-row items-center gap-6 py-2">
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-100 rounded-2xl border-2 border-slate-200">
                {[0, 1, 2].map((y) =>
                  [0, 1, 2].map((x) => {
                    const isRobotHere = robotPos.x === x && robotPos.y === y;
                    const isGoal = x === 2 && y === 2;
                    return (
                      <div
                        key={`${x}-${y}`}
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 flex items-center justify-center font-bold text-xl transition-all ${
                          isRobotHere
                            ? 'bg-blue-600 border-blue-700 text-white shadow-md'
                            : isGoal
                            ? 'bg-amber-100 border-amber-400 text-amber-700'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        {isRobotHere ? '🤖' : isGoal ? '⭐' : ''}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex-1 flex flex-col gap-3 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Step-by-Step Program:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRobotCommands([]);
                      setRobotPos({ x: 0, y: 0 });
                      setCodeSuccess(false);
                      onPlaySound?.('pop');
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-black flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div className="min-h-12 p-2 rounded-xl bg-slate-50 border-2 border-slate-200 flex flex-wrap gap-1.5 items-center">
                  {robotCommands.length === 0 ? (
                    <span className="text-xs text-slate-400 pl-1">
                      Add movement blocks below to reach the star ⭐
                    </span>
                  ) : (
                    robotCommands.map((cmd, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-blue-100 border border-blue-300 text-blue-900 text-xs font-bold flex items-center gap-1"
                      >
                        <span>{cmd === 'FORWARD' ? '⬇️ Down' : '➡️ Right'}</span>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isRunningCode || robotCommands.length >= 6}
                    onClick={() => {
                      setRobotCommands([...robotCommands, 'FORWARD']);
                      onPlaySound?.('pop');
                    }}
                    className="flex-1 py-2 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-200 font-bold text-xs sm:text-sm text-slate-800"
                  >
                    + Step Down ⬇️
                  </button>
                  <button
                    type="button"
                    disabled={isRunningCode || robotCommands.length >= 6}
                    onClick={() => {
                      setRobotCommands([...robotCommands, 'RIGHT']);
                      onPlaySound?.('pop');
                    }}
                    className="flex-1 py-2 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-200 font-bold text-xs sm:text-sm text-slate-800"
                  >
                    + Step Right ➡️
                  </button>
                  <button
                    type="button"
                    disabled={isRunningCode || robotCommands.length === 0}
                    onClick={runRobotSimulation}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center gap-1 shadow-xs"
                  >
                    <Play className="w-4 h-4 fill-current" /> Run Code
                  </button>
                </div>

                {codeSuccess && (
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Success! Robot reached the gold star using sequence logic!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. READING & WRITING */}
          {subject === 'Reading & Writing' && (
            <div className="flex flex-col gap-4 py-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl border-2 border-slate-200 bg-slate-50 flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase text-slate-500">Character</span>
                  <div className="text-sm font-bold text-black min-h-10">{hero}</div>
                  <div className="flex flex-wrap gap-1">
                    {['a curious dragon', 'a clever young detective', 'a friendly robot baker'].map(
                      (h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => {
                            setHero(h);
                            onPlaySound?.('pop');
                          }}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-slate-700"
                        >
                          {h}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-2xl border-2 border-slate-200 bg-slate-50 flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase text-slate-500">Setting</span>
                  <div className="text-sm font-bold text-black min-h-10">{setting}</div>
                  <div className="flex flex-wrap gap-1">
                    {['a library inside a tree', 'a glowing coral kingdom', 'an underground maze'].map(
                      (s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setSetting(s);
                            onPlaySound?.('pop');
                          }}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-slate-700"
                        >
                          {s}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-2xl border-2 border-slate-200 bg-slate-50 flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase text-slate-500">Plot Twist</span>
                  <div className="text-sm font-bold text-black min-h-10">{twist}</div>
                  <div className="flex flex-wrap gap-1">
                    {['the compass spun backwards', 'they found a key made of ice', 'music came from the walls'].map(
                      (t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setTwist(t);
                            onPlaySound?.('pop');
                          }}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-slate-700"
                        >
                          {t}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-sm text-blue-950 flex items-center justify-between">
                <span>
                  <strong>Your Story Spark:</strong> Once upon a time, <em>{hero}</em> entered <em>{setting}</em>, when suddenly <em>{twist}</em>...
                </span>
              </div>
            </div>
          )}

          {/* 5. ENGLISH */}
          {subject === 'English' && (
            <div className="flex flex-col gap-4 py-1">
              <p className="text-xs text-slate-600">
                Tap a root word to see how prefixes and suffixes unlock rich vocabulary!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    root: 'joy',
                    type: 'Noun',
                    superwords: ['joyful (full of joy)', 'enjoyable (gives pleasure)', 'overjoyed (very happy)'],
                  },
                  {
                    root: 'courage',
                    type: 'Noun',
                    superwords: ['courageous (brave)', 'encourage (give confidence)', 'discourage (doubt)'],
                  },
                  {
                    root: 'kind',
                    type: 'Adjective',
                    superwords: ['kindness (being kind)', 'unkind (not polite)', 'kindhearted (warm spirit)'],
                  },
                ].map((item, idx) => (
                  <div
                    key={item.root}
                    onClick={() => {
                      setSelectedWordIdx(idx);
                      onPlaySound?.('pop');
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedWordIdx === idx
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-black">Root: "{item.root}"</span>
                      <span className="text-xs font-semibold text-slate-500">{item.type}</span>
                    </div>
                    <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-700">
                      {item.superwords.map((w) => (
                        <div key={w} className="flex items-center gap-1.5 font-medium">
                          <span className="text-emerald-600 font-bold">✦</span>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. GENERAL */}
          {subject === 'General' && (
            <div className="flex flex-col gap-4 py-1">
              <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Daily Wonder Question
                  </span>
                  <h3 className="text-lg font-bold text-black mt-1">
                    "Why do stars twinkle at night, but planets shine steadily?"
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRevealedFact(!revealedFact);
                    onPlaySound?.('pop');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm whitespace-nowrap shadow-xs"
                >
                  {revealedFact ? 'Hide Hint' : '✨ Reveal Clue'}
                </button>
              </div>

              {revealedFact && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-slate-800 leading-relaxed animate-fade-in">
                  <strong className="text-blue-900">The Secret:</strong> Earth is wrapped in a thick blanket of moving air! Because stars are trillions of miles away, their light reaches us as a tiny needle-point beam that gets bounced around by shifting warm and cold air pockets. Planets are much closer and look like tiny disks, so their light stays calm!
                </div>
              )}
            </div>
          )}

          {/* 7. HISTORY: 1,000-Year Timeline & Inventions */}
          {subject === 'History' && (
            <div className="flex flex-col gap-4 py-1">
              {/* Timeline Horizontal Year Selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {HISTORIC_TIMELINE.map((item, idx) => {
                  const isSelected = idx === historyMilestoneIdx;
                  return (
                    <button
                      key={item.year}
                      type="button"
                      onClick={() => {
                        setHistoryMilestoneIdx(idx);
                        onPlaySound?.('pop');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs scale-105'
                          : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.year}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Milestone Card */}
              {HISTORIC_TIMELINE[historyMilestoneIdx] && (() => {
                const milestone = HISTORIC_TIMELINE[historyMilestoneIdx];
                return (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-stone-50 border-2 border-amber-300 shadow-xs flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl p-2 bg-amber-100 rounded-2xl border border-amber-200">
                          {milestone.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                              {milestone.category}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 bg-amber-200/70 text-amber-900 rounded-full">
                              {milestone.year}
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-black text-black">
                            {milestone.title}
                          </h3>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onAskTutor(milestone.prompt);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask Tutorly About This</span>
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                      {milestone.summary}
                    </p>

                    <div className="p-3 rounded-xl bg-amber-100/60 border border-amber-300/80 text-xs sm:text-sm text-amber-950 flex items-start gap-2">
                      <span className="text-base">💡</span>
                      <div>
                        <strong>Did You Know?</strong> {milestone.funFact}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}

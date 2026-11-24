/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Star,
  Award,
  ArrowRight,
  RotateCcw,
  Compass,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Wand2,
  Plus,
  ShieldAlert,
  ChevronLeft,
} from 'lucide-react';
import {
  PRESET_QUESTS,
  HERO_AVATARS,
  generateTopicGroundedQuest,
  type AdventureQuest,
  type StoryScene,
  type StoryChoice,
  type HeroProfile,
} from '../adventure-stories.ts';
import { type Subject } from '../tutor-prompt.ts';
import { speakNaturalSentences, stopSpeaking } from '../voice-engine.ts';

interface StoryModeSectionProps {
  initialHeroName?: string;
  subject: Subject;
  currentTopic?: string;
  onAskTutor: (prompt: string) => void;
  onPlaySound: (type: 'pop' | 'success') => void;
  autoReadAloud?: boolean;
}

const STORAGE_HERO_KEY = 'tutorly_hero_profile';

export function StoryModeSection({
  initialHeroName,
  subject,
  currentTopic,
  onAskTutor,
  onPlaySound,
  autoReadAloud = true,
}: StoryModeSectionProps) {
  // Hero state
  const [hero, setHero] = useState<HeroProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HERO_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: initialHeroName || 'Captain Nova',
      avatar: '🚀',
      title: 'Cosmic Astro-Kid',
      stars: 3,
      inventory: ['Starlight Badge ⭐'],
    };
  });

  const [isEditingHero, setIsEditingHero] = useState(false);
  const [heroNameInput, setHeroNameInput] = useState(hero.name);

  // Quest state
  const [quests, setQuests] = useState<AdventureQuest[]>(PRESET_QUESTS);
  const [activeQuest, setActiveQuest] = useState<AdventureQuest | null>(null);
  const [sceneIndex, setSceneIndex] = useState(0);

  // Scene interactive state
  const [selectedChoice, setSelectedChoice] = useState<StoryChoice | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [encouragingHint, setEncouragingHint] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Custom AI Quest generator state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTheme, setCustomTheme] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Save hero profile
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HERO_KEY, JSON.stringify(hero));
    } catch {}
  }, [hero]);

  // Synchronize initial user name if provided and not customized
  useEffect(() => {
    if (initialHeroName && hero.name === 'Captain Nova') {
      setHero((prev) => ({ ...prev, name: initialHeroName }));
      setHeroNameInput(initialHeroName);
    }
  }, [initialHeroName]);

  const currentScene: StoryScene | null = activeQuest
    ? activeQuest.scenes[sceneIndex] || null
    : null;

  const isQuestComplete = activeQuest && sceneIndex >= activeQuest.scenes.length;

  // Speak narration
  const handleToggleSpeak = (textToRead: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakNaturalSentences({
        text: textToRead,
        style: 'deep-storyteller',
        onEnd: () => setIsSpeaking(false),
      });
    }
  };

  // Stop speaking when changing scenes or unmounting
  useEffect(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setSelectedChoice(null);
    setFeedbackState('idle');
    setEncouragingHint(null);

    // Auto-read chapter if enabled
    if (currentScene && autoReadAloud) {
      const speechText = `${currentScene.title}. ${currentScene.narrative} Here is your challenge: ${currentScene.challengePrompt}`;
      // Small timeout to allow render
      const timer = setTimeout(() => {
        setIsSpeaking(true);
        speakNaturalSentences({
          text: speechText,
          style: 'deep-storyteller',
          onEnd: () => setIsSpeaking(false),
        });
      }, 350);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [sceneIndex, activeQuest?.id]);

  const handleStartQuest = (quest: AdventureQuest) => {
    onPlaySound('pop');
    setActiveQuest(quest);
    setSceneIndex(0);
    setSelectedChoice(null);
    setFeedbackState('idle');
  };

  const handleChoiceClick = (choice: StoryChoice) => {
    setSelectedChoice(choice);

    if (choice.isCorrect) {
      onPlaySound('success');
      setFeedbackState('correct');
      setEncouragingHint(null);

      // Award stars & item if new
      setHero((prev) => {
        const newStars = prev.stars + 1;
        const newInventory =
          choice.earnedItem && !prev.inventory.includes(choice.earnedItem)
            ? [...prev.inventory, choice.earnedItem]
            : prev.inventory;
        return { ...prev, stars: newStars, inventory: newInventory };
      });

      // Narrate outcome
      if (autoReadAloud) {
        speakNaturalSentences({
          text: `${choice.explanation} ${choice.outcomeNarrative}`,
          style: 'deep-storyteller',
          onEnd: () => setIsSpeaking(false),
        });
      }
    } else {
      onPlaySound('pop');
      setFeedbackState('incorrect');
      setEncouragingHint(choice.explanation);

      if (autoReadAloud) {
        speakNaturalSentences({
          text: choice.explanation,
          style: 'deep-storyteller',
          onEnd: () => setIsSpeaking(false),
        });
      }
    }
  };

  const handleNextScene = () => {
    onPlaySound('pop');
    setSelectedChoice(null);
    setFeedbackState('idle');
    setEncouragingHint(null);
    setSceneIndex((prev) => prev + 1);
  };

  const handleSaveHeroProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroNameInput.trim()) {
      setHero((prev) => ({ ...prev, name: heroNameInput.trim() }));
      setIsEditingHero(false);
      onPlaySound('pop');
    }
  };

  // Generate Custom AI Adventure
  const handleGenerateCustom = async (themeName: string) => {
    const selectedTheme = themeName.trim() || currentTopic || 'Nature and Science';
    setIsGeneratingCustom(true);
    setGenError(null);

    try {
      const token = localStorage.getItem('tutorly_token');
      const res = await fetch('/api/story/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          heroName: hero.name,
          heroAvatar: hero.avatar,
          theme: selectedTheme,
          topic: selectedTheme,
          subject: subject,
        }),
      });

      if (!res.ok) {
        throw new Error('Could not create custom adventure. Trying offline fallback...');
      }

      const questData: AdventureQuest = await res.json();
      setQuests((prev) => [questData, ...prev]);
      setShowCustomModal(false);
      handleStartQuest(questData);
    } catch {
      // Clean topic-grounded fallback (zero keys/doors; directly tailored to theme & subject)
      const fallback = generateTopicGroundedQuest(hero.name, hero.avatar, selectedTheme, subject);
      setQuests((prev) => [fallback, ...prev]);
      setShowCustomModal(false);
      handleStartQuest(fallback);
    } finally {
      window.dispatchEvent(new Event('tutorly-quota-sync'));
      setIsGeneratingCustom(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
      {/* Hero Status Bar */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-3.5 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditingHero(!isEditingHero)}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-2xl shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white"
            title="Change your hero avatar"
          >
            {hero.avatar}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Story Hero
              </span>
              <span className="text-xs text-slate-400 font-bold">Age 5-7 Quest</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">{hero.name}</h2>
              <button
                type="button"
                onClick={() => setIsEditingHero(!isEditingHero)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
              >
                {isEditingHero ? 'Done' : 'Edit Hero'}
              </button>
            </div>
          </div>
        </div>

        {/* Courage Stars & Backpack Preview */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-black text-xs sm:text-sm shadow-2xs">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>{hero.stars} Courage Stars</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm">
            <span>🎒 Backpack:</span>
            <span className="font-black text-blue-700">{hero.inventory.length} items</span>
          </div>

          {activeQuest && (
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                setActiveQuest(null);
                onPlaySound('pop');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>All Quests</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Customization Drawer */}
      {isEditingHero && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-300 p-4 sm:p-5 shadow-xs animate-fade-in">
          <h3 className="font-black text-slate-900 text-sm sm:text-base mb-3 flex items-center gap-2">
            <span>🎨 Customize Your Hero</span>
          </h3>

          <form onSubmit={handleSaveHeroProfile} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hero Nickname</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={heroNameInput}
                  onChange={(e) => setHeroNameInput(e.target.value)}
                  placeholder="e.g. Captain Nova or Maya"
                  maxLength={24}
                  className="flex-1 text-sm font-bold rounded-xl border-2 border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-3 focus:ring-amber-200"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm rounded-xl cursor-pointer"
                >
                  Save Name
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Choose Your Hero Avatar
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {HERO_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setHero((prev) => ({
                        ...prev,
                        avatar: av.emoji,
                        title: av.label,
                      }));
                      onPlaySound('pop');
                    }}
                    className={`p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      hero.avatar === av.emoji
                        ? 'border-amber-500 bg-amber-100 shadow-xs scale-105'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl">{av.emoji}</span>
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
                      {av.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {hero.inventory.length > 0 && (
              <div className="mt-2 pt-2 border-t border-amber-200/80">
                <span className="text-xs font-bold text-amber-900 block mb-1">
                  🎒 Hero Backpack Items:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {hero.inventory.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-slate-800 text-xs font-bold shadow-2xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Main View: Active Quest vs Quest Hub */}
      {!activeQuest ? (
        // Quest Selection Hub
        <div className="flex flex-col gap-4">
          {/* Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-5 sm:p-7 shadow-md relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider text-amber-200 mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Story Mode for Ages 5-7</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                You are the Hero of the Adventure! 🌟
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
                Step into magical story worlds where every challenge needs your math and science
                superpowers! Count fuel cells, test sinking vs. floating, match shapes, and save the
                day!
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-all"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Create AI Adventure</span>
                </button>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-8 opacity-20 text-9xl select-none pointer-events-none">
              🏰
            </div>
          </div>

          {/* Active Topic Spotlight Banner */}
          {currentTopic && (
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 sm:p-6 text-white shadow-md border-2 border-amber-300 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl shrink-0 border border-white/30 shadow-inner">
                    🎯
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full text-white">
                        Active Learning Topic
                      </span>
                      <span className="text-xs text-amber-100 font-bold">
                        Subject: {subject}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black mt-1 text-white">
                      {currentTopic} Story Quest
                    </h2>
                    <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-xl">
                      Every choice and challenge is centered specifically on{' '}
                      <span className="font-black text-white underline decoration-amber-200">{currentTopic}</span>{' '}
                      — no random keys or unrelated puzzles!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const topicQuest = generateTopicGroundedQuest(hero.name, hero.avatar, currentTopic, subject);
                    handleStartQuest(topicQuest);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white text-slate-900 font-black text-xs sm:text-sm hover:bg-amber-50 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>Play {currentTopic} Quest 🚀</span>
                  <ArrowRight className="w-4 h-4 text-orange-600" />
                </button>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-15 text-8xl select-none pointer-events-none">
                🌟
              </div>
            </div>
          )}

          {/* Quests Section Header */}
          <div className="flex items-center justify-between mt-1 px-1">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <span>All Story Quests</span>
              <span className="text-xs font-bold text-slate-400">({quests.length})</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Active Subject: <strong className="text-blue-700">{subject}</strong>
            </span>
          </div>

          {/* Quests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {[...quests]
              .sort((a, b) => {
                const aMatch = a.subject === subject ? 1 : 0;
                const bMatch = b.subject === subject ? 1 : 0;
                return bMatch - aMatch;
              })
              .map((quest) => {
                const isSubjectMatch = quest.subject === subject;
                return (
                  <div
                    key={quest.id}
                    className={`bg-white rounded-3xl border-2 transition-all p-5 flex flex-col justify-between group ${
                      isSubjectMatch
                        ? 'border-blue-400 shadow-sm hover:shadow-md ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border-2 border-slate-200 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                          {quest.themeEmoji}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                            {quest.scenes.length} Chapters
                          </span>
                          {isSubjectMatch && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-300">
                              ⭐ Matches {subject}
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {quest.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 mt-1 line-clamp-2">
                        {quest.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {quest.topic && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
                            🎯 {quest.topic}
                          </span>
                        )}
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                          🔬 Science Choices
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                          🔢 Math Puzzles
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartQuest(quest)}
                      className="mt-5 w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                    >
                      <span>Start Adventure as {hero.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      ) : isQuestComplete ? (
        // Quest Complete / Victory Screen
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 sm:p-8 shadow-md text-center max-w-2xl mx-auto my-auto animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-4xl mx-auto shadow-md mb-4 border-4 border-white animate-bounce">
            {activeQuest.victoryReward.badgeEmoji}
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
            Quest Completed! 🎉
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Hooray, {hero.name}!
          </h2>
          <h3 className="text-base sm:text-lg font-bold text-amber-700 mt-1">
            Awarded Badge: {activeQuest.victoryReward.badgeName}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed max-w-lg mx-auto">
            {activeQuest.victoryReward.congratulations}
          </p>

          <div className="mt-5 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 max-w-md mx-auto text-left">
            <span className="text-xs font-black text-amber-900 block mb-1">
              🏆 What You Mastered on this Quest:
            </span>
            <ul className="text-xs text-amber-950 flex flex-col gap-1.5 font-bold">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Solved math equations & counted objects under 10</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Explored real-world science concepts (gravity, sinking, habitats)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Earned {activeQuest.scenes.length} new Courage Stars ⭐</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              type="button"
              onClick={() => {
                onPlaySound('pop');
                onAskTutor(activeQuest.victoryReward.followUpQuestion);
              }}
              className="py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask Tutorly About This Mystery!</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                setActiveQuest(null);
                onPlaySound('pop');
              }}
              className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Choose Another Quest</span>
            </button>
          </div>
        </div>
      ) : currentScene ? (
        // Active Story Scene / Chapter Challenge
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col gap-4">
          {/* Chapter Progress Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                {currentScene.chapterNumber}
              </span>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                  Chapter {currentScene.chapterNumber} of {activeQuest.scenes.length}
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-800">
                  {currentScene.location}
                </span>
              </div>
            </div>

            {/* Read Aloud TTS Button for Emerging Readers */}
            <button
              type="button"
              onClick={() =>
                handleToggleSpeak(
                  `${currentScene.title}. ${currentScene.narrative} Here is your challenge: ${currentScene.challengePrompt}`
                )
              }
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Listen to story audio narration"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? 'Stop Reading' : 'Listen 🔊'}</span>
            </button>
          </div>

          {/* Scene Title & Narrative Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border-2 border-blue-100">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-3xl select-none">{currentScene.sceneEmoji}</span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">{currentScene.title}</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
              {currentScene.narrative}
            </p>
          </div>

          {/* Challenge Prompt Box */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200">
            <div className="flex items-center gap-2 text-amber-950 font-black text-xs sm:text-sm mb-2">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>HERO CHALLENGE:</span>
              <span className="text-xs font-bold text-amber-800">
                {currentScene.challengePrompt}
              </span>
            </div>

            {/* Visual Helper (Counters, Emojis, Shapes for 5-7 year olds) */}
            {currentScene.visualHelper && (
              <div className="mt-2.5 p-3 rounded-xl bg-white border border-amber-200/80 flex flex-col items-center justify-center gap-2 text-center">
                <div className="flex flex-wrap items-center justify-center gap-2 text-xl sm:text-2xl font-black">
                  {currentScene.visualHelper.items.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-lg bg-amber-50/50 border border-amber-100"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                {currentScene.visualHelper.hintText && (
                  <p className="text-xs font-bold text-amber-900/80">
                    💡 Hint: {currentScene.visualHelper.hintText}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Choices Grid */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Pick Your Hero Action:
            </span>
            <div className="grid grid-cols-1 gap-2.5">
              {currentScene.choices.map((choice) => {
                const isSelected = selectedChoice?.id === choice.id;
                const isCorrect = feedbackState === 'correct' && isSelected;
                const isWrong = feedbackState === 'incorrect' && isSelected;

                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={feedbackState === 'correct'}
                    onClick={() => handleChoiceClick(choice)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl font-bold text-xs sm:text-sm transition-all border-2 flex items-center justify-between gap-3 cursor-pointer ${
                      isCorrect
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-xs'
                        : isWrong
                        ? 'border-rose-400 bg-rose-50 text-rose-900'
                        : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : isWrong
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isCorrect ? '✓' : isWrong ? '✕' : '?'}
                      </span>
                      <span>{choice.text}</span>
                    </div>

                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                      {choice.conceptTag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback & Outcome Narrative */}
          {feedbackState === 'incorrect' && encouragingHint && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in">
              <span className="text-lg">🌟</span>
              <div>
                <strong className="block font-black">Friendly Hint:</strong>
                <span>{encouragingHint} Tap another answer above to try again!</span>
              </div>
            </div>
          )}

          {feedbackState === 'correct' && selectedChoice && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex flex-col gap-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 fill-current text-white" />
                </div>
                <div>
                  <h4 className="font-black text-sm sm:text-base text-emerald-900">
                    Awesome Choice! ⭐ +1 Courage Star!
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
                    {selectedChoice.explanation}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-800 mt-2 font-semibold bg-white/70 p-3 rounded-xl border border-emerald-200">
                    📖 {selectedChoice.outcomeNarrative}
                  </p>
                  {selectedChoice.earnedItem && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
                      <span>🎒 Found Item:</span>
                      <span>{selectedChoice.earnedItem}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNextScene}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <span>
                    {sceneIndex + 1 >= activeQuest.scenes.length
                      ? 'Claim Hero Badge 🏆'
                      : 'Next Chapter ➡️'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Custom Adventure Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl border-2 border-purple-300 shadow-2xl p-6 overflow-hidden">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md mb-2">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Create Custom Story</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pick any topic for {hero.name} to explore with math and science!
              </p>
            </div>

            {/* Quick Themes */}
            <div className="mb-4">
              <span className="text-xs font-bold text-slate-600 block mb-2">
                Popular Themes for {subject} (Ages 5-7):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentTopic && (
                  <button
                    type="button"
                    onClick={() => setCustomTheme(currentTopic)}
                    className="px-2.5 py-1 text-xs font-black rounded-xl border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-all cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <span>🎯 Active Topic:</span>
                    <span>{currentTopic}</span>
                  </button>
                )}
                {(subject === 'Math'
                  ? [
                      'Pizza Fraction Party 🍕',
                      'Shape Castle Mystery 🔺',
                      'Counting Stars & Crystals ⭐',
                      'Dragon Apple Subtraction 🐉',
                    ]
                  : subject === 'Science'
                  ? [
                      'Photosynthesis Sun Garden 🌱',
                      'Dino Fossil Dig 🦖',
                      'Moon Gravity Odyssey 🚀',
                      'Deep Ocean Sea Life 🌊',
                    ]
                  : subject === 'Coding'
                  ? [
                      'Robot Navigation Steps 🤖',
                      'Dancing Loop Sequence 🔁',
                      'Electric Copper Wire ⚡',
                      'Floating Log Logic 🛶',
                    ]
                  : [
                      'Photosynthesis Sun Garden 🌱',
                      'Pizza Fraction Party 🍕',
                      'Arctic Polar Bear Rescue 🐻‍❄️',
                      'Robot Toy Workshop 🤖',
                      'Volcano Dinosaur Island 🌋',
                    ]
                ).map((th) => (
                  <button
                    key={th}
                    type="button"
                    onClick={() => setCustomTheme(th)}
                    className="px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-200 hover:border-purple-400 bg-slate-50 hover:bg-purple-50 text-slate-700 transition-all cursor-pointer"
                  >
                    {th}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Or Type Any Adventure Idea / Topic:
              </label>
              <input
                type="text"
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                placeholder={currentTopic ? `e.g. ${currentTopic}` : 'e.g. Photosynthesis, Fractions, or Dinosaurs'}
                className="w-full text-sm font-bold rounded-xl border-2 border-slate-200 px-3.5 py-2.5 focus:outline-none focus:ring-3 focus:ring-purple-200 focus:border-purple-600"
              />
            </div>

            {genError && (
              <p className="text-xs text-rose-600 font-bold mb-3">{genError}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGeneratingCustom}
                onClick={() => handleGenerateCustom(customTheme)}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isGeneratingCustom ? (
                  <span>Crafting Quest… ✨</span>
                ) : (
                  <span>Launch Quest 🚀</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

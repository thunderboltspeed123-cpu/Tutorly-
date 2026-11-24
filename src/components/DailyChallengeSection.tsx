/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Trophy,
  Calendar,
  MessageSquare,
  RotateCcw,
} from 'lucide-react';
import {
  type DailyPuzzle,
  type StreakData,
  getLocalDateString,
  markTodayCompleted,
} from '../daily-puzzles.ts';

interface DailyChallengeSectionProps {
  puzzle: DailyPuzzle;
  streak: StreakData;
  onStreakUpdate: (newStreak: StreakData) => void;
  onPlaySound?: (type: 'pop' | 'success') => void;
  onAskTutor?: (prompt: string) => void;
}

export function DailyChallengeSection({
  puzzle,
  streak,
  onStreakUpdate,
  onPlaySound,
  onAskTutor,
}: DailyChallengeSectionProps) {
  const todayStr = getLocalDateString();
  const isAlreadyDoneToday = streak.lastCompletedDate === todayStr;

  const [selectedOption, setSelectedOption] = useState<number | null>(
    isAlreadyDoneToday ? puzzle.answerIndex : null
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(isAlreadyDoneToday);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [justSolved, setJustSolved] = useState<boolean>(false);

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
    setIsSubmitted(true);

    if (idx === puzzle.answerIndex) {
      const updated = markTodayCompleted(streak);
      onStreakUpdate(updated);
      setJustSolved(true);
      onPlaySound?.('success');
    } else {
      onPlaySound?.('pop');
    }
  };

  // Helper to get 7 days of the current week (Mon-Sun)
  const getWeekDays = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = getLocalDateString(d);
      const isPastOrToday = d <= today;
      const isToday = dateStr === todayStr;
      const isCompleted =
        streak.completedDates?.includes(dateStr) || (isToday && (isAlreadyDoneToday || justSolved));

      days.push({
        label: dayNames[i],
        dayNum: d.getDate(),
        dateStr,
        isToday,
        isCompleted,
        isPastOrToday,
      });
    }
    return days;
  };

  const weekDays = getWeekDays();
  const isStreakAtRisk = streak.currentStreak > 0 && !isAlreadyDoneToday && !justSolved;

  return (
    <div className="flex-1 bg-white rounded-3xl border-2 border-amber-300 p-4 sm:p-7 shadow-sm overflow-y-auto flex flex-col gap-4 animate-fade-in min-h-[460px]">
      {/* Top Banner Card with Streak Flame */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl border border-white/30 shadow-inner">
            <Flame className="w-8 h-8 text-yellow-200 fill-yellow-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {streak.currentStreak} Day Flame Streak
              </h2>
              {(isAlreadyDoneToday || justSolved) && (
                <span className="text-xs bg-emerald-400 text-emerald-950 font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                  Active Today 🔥
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-amber-100 font-semibold mt-0.5">
              Personal Best: {streak.bestStreak || streak.currentStreak} Days • One new puzzle every day
            </p>
          </div>
        </div>

        {/* 7-Day Week Indicator */}
        <div className="flex items-center gap-1.5 bg-black/15 p-2 rounded-xl backdrop-blur-xs border border-white/10">
          {weekDays.map((d, i) => (
            <div
              key={i}
              title={`${d.label}: ${d.isCompleted ? 'Completed' : d.isToday ? 'Today' : 'Upcoming'}`}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] sm:text-xs font-black flex items-center justify-center transition-all ${
                d.isCompleted
                  ? 'bg-amber-300 text-amber-950 shadow-xs'
                  : d.isToday
                  ? 'bg-white text-orange-600 ring-2 ring-yellow-200 shadow-xs'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {d.isCompleted ? '🔥' : d.label.charAt(0)}
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Status Alert */}
      {isStreakAtRisk && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-pulse shadow-2xs">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="font-black text-sm">Don&apos;t break your {streak.currentStreak}-day streak!</div>
            <div className="text-amber-800 text-xs font-normal">
              Answer today&apos;s daily puzzle to keep your flame glowing bright!
            </div>
          </div>
        </div>
      )}

      {/* Solid Puzzle Section */}
      <div className="flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Category Tag */}
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-800 border border-blue-200">
              <span>{puzzle.icon}</span>
              <span>{puzzle.category}</span>
            </span>
            <span className="text-xs font-bold text-slate-400">
              {puzzle.title} • {puzzle.date}
            </span>
          </div>

          {/* Question / Riddle Box - Solid & Large */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold text-lg sm:text-xl md:text-2xl mb-4 leading-relaxed shadow-2xs">
            {puzzle.prompt}
          </div>

          {/* 4 Interactive Option Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {puzzle.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === puzzle.answerIndex;

              let btnStyle =
                'bg-white border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 text-slate-900 shadow-2xs';
              if (isSubmitted) {
                if (isCorrect) {
                  btnStyle =
                    'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-black shadow-xs';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-50 border-2 border-rose-400 text-rose-950';
                } else {
                  btnStyle = 'bg-slate-50 border-2 border-slate-200 text-slate-400 opacity-60';
                }
              }

              const letter = ['A', 'B', 'C', 'D'][idx];

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-2xl text-left text-base sm:text-lg font-semibold flex items-center justify-between gap-3 transition-all cursor-pointer ${btnStyle} ${
                    !isSubmitted ? 'active:scale-[0.99]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                        isSubmitted && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isSubmitted && isSelected
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="font-bold">{opt}</span>
                  </div>

                  {isSubmitted && isCorrect && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  )}
                  {isSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Hint Section */}
          {!isSubmitted && (
            <div className="mb-2">
              <button
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
                className="text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer py-1"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{showHint ? 'Hide Hint' : 'Need a hint from Tutorly?'}</span>
              </button>

              {showHint && (
                <div className="mt-2 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm leading-relaxed animate-fade-in shadow-2xs">
                  💡 <strong>Tutorly Hint:</strong> {puzzle.hint}
                </div>
              )}
            </div>
          )}

          {/* Fun Fact / Explanation Box */}
          {isSubmitted && (
            <div
              className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm mb-3 flex items-start gap-3 animate-fade-in ${
                selectedOption === puzzle.answerIndex
                  ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50 border-2 border-amber-300 text-amber-950'
              }`}
            >
              <span className="text-2xl select-none">
                {selectedOption === puzzle.answerIndex ? '🎉' : '💡'}
              </span>
              <div className="flex-1">
                <div className="font-black text-sm sm:text-base mb-1">
                  {selectedOption === puzzle.answerIndex
                    ? 'Spot on! Puzzle Solved!'
                    : `Good effort! The right answer was: ${puzzle.options[puzzle.answerIndex]}`}
                </div>
                <p className="leading-relaxed text-slate-700 text-xs sm:text-sm">
                  {puzzle.funFact}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Tomorrow&apos;s new daily challenge unlocks at midnight!</span>
          </div>

          {onAskTutor && isSubmitted && (
            <button
              type="button"
              onClick={() => {
                onAskTutor(`Can you tell me more about ${puzzle.title} from today's challenge?`);
              }}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Ask Tutorly More About This</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

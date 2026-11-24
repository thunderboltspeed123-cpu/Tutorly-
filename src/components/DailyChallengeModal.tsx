/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Trophy,
  Calendar,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  type DailyPuzzle,
  type StreakData,
  getLocalDateString,
  markTodayCompleted,
} from '../daily-puzzles.ts';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzle: DailyPuzzle;
  streak: StreakData;
  onStreakUpdate: (newStreak: StreakData) => void;
  onPlaySound?: (type: 'pop' | 'success') => void;
  onAskTutor?: (prompt: string) => void;
}

export function DailyChallengeModal({
  isOpen,
  onClose,
  puzzle,
  streak,
  onStreakUpdate,
  onPlaySound,
  onAskTutor,
}: DailyChallengeModalProps) {
  const todayStr = getLocalDateString();
  const isAlreadyDoneToday = streak.lastCompletedDate === todayStr;

  const [selectedOption, setSelectedOption] = useState<number | null>(
    isAlreadyDoneToday ? puzzle.answerIndex : null
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(isAlreadyDoneToday);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [justSolved, setJustSolved] = useState<boolean>(false);

  if (!isOpen) return null;

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

  // Helper to get day-of-week abbreviations for current week
  const getWeekDays = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon...
    // Start week on Monday
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
      const isCompleted = streak.completedDates?.includes(dateStr) || (isToday && isAlreadyDoneToday);

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
  const isStreakAtRisk = streak.currentStreak > 0 && !isAlreadyDoneToday;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/65 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl border-2 border-amber-400 shadow-2xl p-5 sm:p-6 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-challenge-title"
      >
        {/* Clean, Solid Header like QuizModal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl border-2 transition-all shadow-xs ${
                isAlreadyDoneToday || justSolved
                  ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 text-white border-amber-300 shadow-orange-500/30'
                  : 'bg-amber-50 border-amber-300 text-amber-600'
              }`}
            >
              <Flame className="w-5 h-5 fill-current stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="daily-challenge-title"
                  className="text-lg sm:text-xl font-black text-slate-900"
                >
                  Daily Brain Puzzle
                </h2>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 flex items-center gap-1">
                  <span>🔥</span>
                  <span>{streak.currentStreak} Day Streak</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold truncate max-w-[240px] sm:max-w-xs">
                {puzzle.category} • {puzzle.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact Weekly Dot Trail */}
        <div className="py-2.5 flex items-center justify-between text-xs font-bold text-slate-500 shrink-0 border-b border-slate-100">
          <span className="text-amber-800 uppercase tracking-wider text-[11px] font-black flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Weekly Progress:</span>
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {weekDays.map((d, i) => (
              <div
                key={i}
                title={`${d.label}: ${d.isCompleted ? 'Solved 🔥' : d.isToday ? "Today's puzzle" : 'Upcoming'}`}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-[10px] font-black flex items-center justify-center transition-all border ${
                  d.isCompleted
                    ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-2xs'
                    : d.isToday
                    ? 'bg-white border-blue-500 text-blue-700 ring-2 ring-blue-100 font-extrabold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {d.isCompleted ? '🔥' : d.label.charAt(0)}
              </div>
            ))}
          </div>
        </div>

        {/* Solid Puzzle Content Area - Spacious & Clear like QuizModal */}
        <div className="py-3 flex-1 flex flex-col overflow-y-auto">
          {/* Status Message if completed or at risk */}
          {(justSolved || isAlreadyDoneToday) && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-2xs">
              <span className="text-base">🌟</span>
              <span>Today&apos;s flame is lit! Streak: <strong>{streak.currentStreak} day{streak.currentStreak === 1 ? '' : 's'}</strong>!</span>
            </div>
          )}
          {isStreakAtRisk && !justSolved && (
            <div className="mb-3 p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2">
              <span className="text-base animate-pulse">🔥</span>
              <span>Keep your {streak.currentStreak}-day streak alive! Solve today&apos;s puzzle below:</span>
            </div>
          )}

          {/* Solid Question Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/50 border-2 border-amber-300/90 text-slate-900 font-bold text-base sm:text-lg mb-3 leading-snug shadow-2xs">
            {puzzle.prompt}
          </div>

          {/* Options (A, B, C, D) - Solid and proper sizing */}
          <div className="flex flex-col gap-2.5 mb-3">
            {puzzle.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === puzzle.answerIndex;

              let btnStyle =
                'bg-white border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-slate-900 shadow-2xs';
              if (isSubmitted) {
                if (isCorrect) {
                  btnStyle =
                    'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-bold shadow-xs';
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
                  className={`p-3 sm:p-3.5 rounded-2xl text-left text-sm sm:text-base font-semibold flex items-center justify-between gap-3 transition-all cursor-pointer ${btnStyle} ${
                    !isSubmitted ? 'active:scale-[0.99]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
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
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Hint Expander (if not submitted) */}
          {!isSubmitted && (
            <div className="mb-2">
              <button
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer py-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide Hint' : 'Need a hint from Tutorly?'}</span>
              </button>

              {showHint && (
                <div className="mt-1.5 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs leading-relaxed animate-fade-in">
                  💡 <strong>Tutorly Hint:</strong> {puzzle.hint}
                </div>
              )}
            </div>
          )}

          {/* Fun Fact / Solution Explanation (after submitted) */}
          {isSubmitted && (
            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm mb-3 flex items-start gap-2.5 animate-fade-in ${
                selectedOption === puzzle.answerIndex
                  ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50 border-2 border-amber-300 text-amber-950'
              }`}
            >
              <span className="text-xl select-none">
                {selectedOption === puzzle.answerIndex ? '🎉' : '💡'}
              </span>
              <div className="flex-1">
                <div className="font-black text-sm mb-0.5">
                  {selectedOption === puzzle.answerIndex
                    ? 'Spot on! Puzzle Solved!'
                    : `Good try! The right answer was: ${puzzle.options[puzzle.answerIndex]}`}
                </div>
                <p className="leading-relaxed text-slate-700">
                  {puzzle.funFact}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Tomorrow&apos;s challenge arrives at midnight!</span>
          </div>

          <div className="flex items-center gap-2">
            {onAskTutor && isSubmitted && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAskTutor(`Can you tell me more about ${puzzle.title} from today's challenge?`);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Ask Tutorly More</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

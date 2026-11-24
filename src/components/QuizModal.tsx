/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Smile,
} from 'lucide-react';
import type { QuizPayload, QuizQuestion } from '../types/quiz.ts';
import type { AgeBand } from '../tutor-prompt.ts';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  contextContent: string;
  numQuestions: 4 | 5;
  ageBand: AgeBand;
  onPlaySound?: (type: 'pop' | 'success') => void;
  onAskTutor?: (prompt: string) => void;
  onChangeNumQuestions?: (n: 4 | 5) => void;
}

export function QuizModal({
  isOpen,
  onClose,
  topic,
  contextContent,
  numQuestions,
  ageBand,
  onPlaySound,
  onAskTutor,
  onChangeNumQuestions,
}: QuizModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizPayload | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch quiz questions whenever modal opens or topic/numQuestions changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);

    const token = localStorage.getItem('tutorly_token');
    fetch('/api/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        context: contextContent,
        topic,
        numQuestions,
        ageBand,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error || 'Could not generate quiz right now.');
        }
        return data as QuizPayload;
      })
      .then((data: QuizPayload) => {
        if (!isMounted) return;
        setQuizData(data);
        setLoading(false);
        window.dispatchEvent(new Event('tutorly-quota-sync'));
      })
      .catch((err) => {
        if (!isMounted) return;
        window.dispatchEvent(new Event('tutorly-quota-sync'));
        setError(
          err?.message || 'Tutorly had a small hiccup building this quiz. Tap Try Again below!'
        );
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, topic, numQuestions, contextContent, ageBand, retryCount]);

  if (!isOpen) return null;

  const currentQ: QuizQuestion | undefined = quizData?.questions?.[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isSubmitted || !currentQ) return;
    setSelectedOption(index);
    setIsSubmitted(true);

    const isCorrect = index === currentQ.answerIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      onPlaySound?.('success');
    } else {
      onPlaySound?.('pop');
    }
  };

  const handleNextQuestion = () => {
    if (!quizData) return;
    if (currentIndex + 1 < quizData.questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      onPlaySound?.('pop');
    } else {
      setIsFinished(true);
      onPlaySound?.('success');
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
    onPlaySound?.('pop');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl border-2 border-blue-200 shadow-2xl p-5 sm:p-7 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-modal-title"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">
              {numQuestions === 5 ? '🏆' : '🎯'}
            </span>
            <div>
              <h2
                id="quiz-modal-title"
                className="text-lg sm:text-xl font-black text-slate-900"
              >
                {numQuestions}-Question Quiz
              </h2>
              <p className="text-xs text-blue-600 font-bold truncate max-w-[240px] sm:max-w-xs">
                Topic: {topic || 'Knowledge Check'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle 4 vs 5 questions */}
            {onChangeNumQuestions && (
              <div className="hidden sm:flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => onChangeNumQuestions(4)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    numQuestions === 4
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  4 Questions
                </button>
                <button
                  type="button"
                  onClick={() => onChangeNumQuestions(5)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    numQuestions === 5
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  5 Questions
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close quiz"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 border-2 border-blue-200 text-blue-600 flex items-center justify-center text-3xl mb-4 animate-bounce">
              {numQuestions === 5 ? '🏆' : '🎯'}
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Generating your {numQuestions}-question quiz…
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
              Tutorly is reviewing the key ideas from your lesson to make fun questions for you!
            </p>
            <div className="mt-4 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
              <span className="text-xs font-bold text-blue-600">Thinking…</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="py-10 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mb-3 border border-rose-200">
              ⚠️
            </div>
            <p className="text-sm font-bold text-slate-800 max-w-sm mb-4">{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError(null);
                setRetryCount((prev) => prev + 1);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Active Quiz Content */}
        {!loading && !error && !isFinished && currentQ && (
          <div className="py-4 flex-1 flex flex-col overflow-y-auto">
            {/* Progress Bar & Indicators */}
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-500">
              <span className="text-blue-700 uppercase tracking-wider">
                Question {currentIndex + 1} of {quizData?.questions.length}
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Score: {score}</span>
              </span>
            </div>

            {/* Stepper Dots */}
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {quizData?.questions.map((_, qIdx) => (
                <div
                  key={qIdx}
                  className={`h-2 rounded-full transition-all ${
                    qIdx === currentIndex
                      ? 'bg-blue-600 shadow-xs'
                      : qIdx < currentIndex
                      ? 'bg-emerald-400'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Question Text */}
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border-2 border-blue-200 text-slate-900 font-bold text-base sm:text-lg mb-4 leading-snug">
              {currentQ.question}
            </div>

            {/* Multiple Choice Options */}
            <div className="flex flex-col gap-2.5 mb-4">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrect = optIdx === currentQ.answerIndex;

                let btnStyle =
                  'bg-white border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-900';
                if (isSubmitted) {
                  if (isCorrect) {
                    btnStyle =
                      'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-bold shadow-xs';
                  } else if (isSelected) {
                    btnStyle =
                      'bg-rose-50 border-2 border-rose-400 text-rose-950';
                  } else {
                    btnStyle = 'bg-slate-50 border-2 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                const letter = ['A', 'B', 'C', 'D'][optIdx];

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-3.5 rounded-2xl text-left text-sm sm:text-base font-semibold flex items-center justify-between gap-3 transition-all cursor-pointer ${btnStyle} ${
                      !isSubmitted ? 'active:scale-[0.99]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isSubmitted && isCorrect
                            ? 'bg-emerald-600 text-white'
                            : isSubmitted && isSelected
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {letter}
                      </span>
                      <span>{opt}</span>
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

            {/* Explanation card after submit */}
            {isSubmitted && (
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm mb-3 flex items-start gap-2.5 animate-fade-in ${
                  selectedOption === currentQ.answerIndex
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border border-amber-200 text-amber-900'
                }`}
              >
                <div className="text-lg select-none">
                  {selectedOption === currentQ.answerIndex ? '🌟' : '💡'}
                </div>
                <div className="flex-1">
                  <div className="font-black mb-0.5">
                    {selectedOption === currentQ.answerIndex
                      ? 'Spot on! Correct!'
                      : `The correct answer was: ${['A', 'B', 'C', 'D'][currentQ.answerIndex]}`}
                  </div>
                  <p className="leading-relaxed">{currentQ.explanation}</p>
                </div>
              </div>
            )}

            {/* Next / Continue Button */}
            {isSubmitted && (
              <div className="mt-auto pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-sm sm:text-base flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                >
                  <span>
                    {currentIndex + 1 < (quizData?.questions.length || 0)
                      ? 'Next Question'
                      : 'See Your Results 🏆'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Finished / Results Screen */}
        {isFinished && quizData && (
          <div className="py-6 flex-1 flex flex-col items-center text-center overflow-y-auto">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center text-4xl shadow-lg shadow-amber-400/30 mb-4 border-2 border-white animate-gentle-bounce">
              <Award className="w-10 h-10" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
              Quiz Completed!
            </h3>

            <p className="text-sm text-slate-500 font-semibold mb-5">
              {score === quizData.questions.length
                ? '🌟 Perfect score! You truly mastered this topic!'
                : score >= quizData.questions.length - 1
                ? '🚀 Fantastic job! You know this topic so well!'
                : '💡 Awesome effort! Learning and practicing makes you sharper!'}
            </p>

            {/* Score Pill Card */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-5 mb-6 w-full max-w-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
                Your Score
              </div>
              <div className="text-4xl sm:text-5xl font-black text-blue-900">
                {score} <span className="text-2xl text-blue-400">/ {quizData.questions.length}</span>
              </div>
              <div className="flex justify-center gap-1.5 mt-3">
                {Array.from({ length: quizData.questions.length }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-xl ${
                      i < score ? 'text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                type="button"
                onClick={handleRestartQuiz}
                className="px-5 py-3 rounded-2xl bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-800 font-black text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <span>Try Again</span>
              </button>

              {onChangeNumQuestions && (
                <button
                  type="button"
                  onClick={() => onChangeNumQuestions(numQuestions === 4 ? 5 : 4)}
                  className="px-5 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-900 font-black text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <span>{numQuestions === 4 ? 'Try 5-Question Quiz 🏆' : 'Try 4-Question Quiz 🎯'}</span>
                </button>
              )}

              {onAskTutor && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAskTutor(`Can you give me a fun challenge or another fact about ${topic}?`);
                  }}
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-sm flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Ask Tutorly More</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

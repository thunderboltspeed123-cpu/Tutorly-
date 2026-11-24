import React, { useState, useRef, useEffect } from 'react';
import { Volume2, X, Sparkles, MessageSquare, BookOpen } from 'lucide-react';
import { type VocabularyDefinition } from '../kid-dictionary.ts';
import { speakNaturalSentences, stopSpeaking } from '../voice-engine.ts';

interface VocabularyWordPopoverProps {
  displayText: string;
  definition: VocabularyDefinition;
  onAskTutor?: (prompt: string) => void;
  onPlaySound?: (type: 'pop' | 'success') => void;
}

export function VocabularyWordPopover({
  displayText,
  definition,
  onAskTutor,
  onPlaySound,
}: VocabularyWordPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPronouncing, setIsPronouncing] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Speak this word out loud with the bold energetic natural voice
  const pronounceWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlaySound?.('pop');

    if (isPronouncing) {
      stopSpeaking();
      setIsPronouncing(false);
      return;
    }

    speakNaturalSentences({
      text: definition.word,
      style: 'bold-energetic',
      onStart: () => setIsPronouncing(true),
      onEnd: () => setIsPronouncing(false),
      onError: () => setIsPronouncing(false),
    });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlaySound?.('pop');
    setIsOpen(!isOpen);
  };

  return (
    <span ref={containerRef} className="relative inline-block my-0.5">
      {/* Clickable Word Span with Dotted Underline & Book Badge */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={`Tap to see definition of "${definition.word}"`}
        className="inline-flex items-baseline font-bold text-blue-900 bg-blue-100/70 hover:bg-blue-200/80 active:bg-blue-300 border-b-2 border-dashed border-blue-500 rounded-md px-1.5 py-0.5 transition-all cursor-pointer shadow-2xs group align-baseline"
      >
        <span>{displayText}</span>
        <span
          className="text-[11px] ml-1 text-blue-600 group-hover:scale-125 transition-transform select-none"
          aria-hidden="true"
        >
          ✨
        </span>
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`Definition of ${definition.word}`}
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-4 text-left text-slate-800 animate-fade-in text-sm select-text"
          style={{ maxWidth: 'calc(100vw - 32px)' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl select-none">{definition.emoji}</span>
                <span className="text-base font-black text-black capitalize">
                  {definition.word}
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {definition.category}
                </span>
              </div>
              {definition.pronunciation && (
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  🗣️ {definition.pronunciation}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              aria-label="Close definition"
              className="p-1 rounded-lg text-slate-400 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Simple Kid Definition */}
          <div className="py-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <strong className="text-blue-900 block text-[11px] uppercase tracking-wider mb-0.5 font-black">
              Simple Meaning:
            </strong>
            {definition.simpleDefinition}
          </div>

          {/* Example Sentence */}
          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 mb-3">
            <strong className="text-amber-900 font-bold">In a sentence:</strong>
            <p className="italic mt-0.5 text-slate-800">"{definition.example}"</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={pronounceWord}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                isPronouncing
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200 hover:border-blue-300'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{isPronouncing ? 'Speaking…' : 'Hear Word'}</span>
            </button>

            {onAskTutor && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onAskTutor(`Can you explain the word "${definition.word}" with a fun story and another example?`);
                }}
                className="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask Tutorly</span>
              </button>
            )}
          </div>

          {/* Tiny arrow pointer at bottom */}
          <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-blue-200 rotate-45" />
        </div>
      )}
    </span>
  );
}

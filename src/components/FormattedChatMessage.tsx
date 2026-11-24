import React from 'react';
import { findWordDefinition } from '../kid-dictionary.ts';
import { VocabularyWordPopover } from './VocabularyWordPopover.tsx';

interface FormattedChatMessageProps {
  content: string;
  isAssistant: boolean;
  isTyping?: boolean;
  onAskTutor?: (prompt: string) => void;
  onPlaySound?: (type: 'pop' | 'success') => void;
}

export function FormattedChatMessage({
  content,
  isAssistant,
  isTyping,
  onAskTutor,
  onPlaySound,
}: FormattedChatMessageProps) {
  // If user message, just render content as-is
  if (!isAssistant) {
    return <span>{content}</span>;
  }

  // Split by whitespace and newlines, preserving delimiters
  const tokens = content.split(/(\s+)/);

  return (
    <span>
      {tokens.map((token, idx) => {
        // If whitespace or newline
        if (/^\s+$/.test(token)) {
          return <span key={idx}>{token}</span>;
        }

        // Extract leading and trailing punctuation
        const match = token.match(/^([^a-zA-Z0-9]*)(.*?)([^a-zA-Z0-9]*)$/);
        const leadingPunct = match?.[1] || '';
        const coreWord = match?.[2] || token;
        const trailingPunct = match?.[3] || '';

        const vocabResult = findWordDefinition(coreWord);

        if (vocabResult) {
          return (
            <React.Fragment key={idx}>
              {leadingPunct}
              <VocabularyWordPopover
                displayText={coreWord}
                definition={vocabResult.definition}
                onAskTutor={onAskTutor}
                onPlaySound={onPlaySound}
              />
              {trailingPunct}
            </React.Fragment>
          );
        }

        return <span key={idx}>{token}</span>;
      })}

      {/* Typing cursor during live speech & typewriter streaming */}
      {isTyping && (
        <span
          className="inline-block w-2.5 h-5 bg-blue-600 rounded-xs animate-pulse ml-1 align-middle"
          aria-hidden="true"
        />
      )}
    </span>
  );
}

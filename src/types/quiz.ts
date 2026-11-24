/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface QuizPayload {
  title: string;
  topic: string;
  numQuestions: number;
  questions: QuizQuestion[];
}

import { CardProgress, Rating } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function createNewCard(filePath: string): CardProgress {
  return {
    filePath,
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    lastReviewed: null,
    nextReview: null,
  };
}

/**
 * SM-2 inspired algorithm:
 * - Hard: reset interval to 1 day, lower ease factor, reset repetitions
 * - Medium: modest interval growth, slight ease factor decrease
 * - Easy: aggressive interval growth, ease factor increase
 */
export function updateCard(card: CardProgress, rating: Rating): CardProgress {
  const now = Date.now();
  let { interval, easeFactor, repetitions } = card;

  switch (rating) {
    case "hard":
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      repetitions = 0;
      break;
    case "medium":
      if (repetitions === 0) interval = 1;
      else if (repetitions === 1) interval = 3;
      else interval = Math.round(interval * easeFactor);
      easeFactor = Math.max(1.3, easeFactor - 0.05);
      repetitions += 1;
      break;
    case "easy":
      if (repetitions === 0) interval = 1;
      else if (repetitions === 1) interval = 4;
      else interval = Math.round(interval * easeFactor * 1.3);
      easeFactor = Math.min(3.0, easeFactor + 0.15);
      repetitions += 1;
      break;
  }

  return {
    ...card,
    interval,
    easeFactor,
    repetitions,
    lastReviewed: now,
    nextReview: now + interval * DAY_MS,
  };
}

export function isDue(card: CardProgress): boolean {
  if (card.nextReview === null) return true;
  return card.nextReview <= Date.now();
}

/** Lower number = higher study priority */
export function getPriority(card: CardProgress): number {
  if (card.nextReview === null) return 1; // new cards: second priority
  const overdueDays = (Date.now() - card.nextReview) / DAY_MS;
  return -overdueDays; // most overdue has lowest (most negative) → shown first
}

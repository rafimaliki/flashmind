export type Mode = "memory" | "leetcode";

export interface ModeConfig {
  directories: string[];
}

export interface AppConfig {
  modes: {
    memory: ModeConfig;
    leetcode: ModeConfig;
  };
}

export interface CardProgress {
  filePath: string;
  interval: number; // days until next review
  easeFactor: number; // SM-2 multiplier (1.3 – 3.0)
  repetitions: number; // number of successful reviews
  lastReviewed: number | null; // unix timestamp ms
  nextReview: number | null; // unix timestamp ms
}

export interface ProgressData {
  cards: Record<string, CardProgress>;
}

export interface SessionCard {
  id: string; // file path used as stable id
  filePath: string;
  title: string;
  content: string;
  progress: CardProgress;
  priority: number; // lower = higher study priority
  mode: Mode;
}

export type Rating = "easy" | "medium" | "hard";

export interface SessionSnapshot {
  cards: SessionCard[];
  currentIndex: number;
  sessionStats: { easy: number; medium: number; hard: number };
  savedAt: number;
}

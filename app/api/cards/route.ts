import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  DATA_PATH,
  CONFIG_PATH,
  MEMORY_SESSION_CARDS,
  LEETCODE_SESSION_CARDS,
} from "@/lib/config";
import { ProgressData, SessionCard, AppConfig, Mode } from "@/lib/types";
import { isDue, getPriority, createNewCard } from "@/lib/spacedRepetition";

const DEFAULT_CONFIG: AppConfig = {
  modes: {
    memory: { directories: [] },
    leetcode: { directories: [] },
  },
};

function loadConfig(): AppConfig {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return DEFAULT_CONFIG;
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(raw) as AppConfig;
  } catch {
    return DEFAULT_CONFIG;
  }
}

function getAllMdFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...getAllMdFiles(fullPath));
    } else if (item.name.toLowerCase().endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

function loadProgress(): ProgressData {
  try {
    if (!fs.existsSync(DATA_PATH)) return { cards: {} };
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw) as ProgressData;
  } catch {
    return { cards: {} };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const modeParam = searchParams.get("mode");
  const statsOnly = searchParams.get("statsOnly") === "true";
  const limitParam = searchParams.get("limit");
  const defaultLimit =
    modeParam === "memory" ? MEMORY_SESSION_CARDS : LEETCODE_SESSION_CARDS;
  const limit = limitParam ? parseInt(limitParam, 10) : defaultLimit;

  if (!modeParam || !["memory", "leetcode"].includes(modeParam)) {
    return NextResponse.json(
      { error: "mode parameter required: memory | leetcode" },
      { status: 400 },
    );
  }

  const mode = modeParam as Mode;
  const config = loadConfig();
  const directories = config.modes[mode].directories;

  if (directories.length === 0) {
    return NextResponse.json({
      cards: [],
      total: 0,
      dueCount: 0,
      newCount: 0,
      reviewCount: 0,
      hasDirectories: false,
    });
  }

  const allFiles: string[] = [];
  for (const dir of directories) {
    allFiles.push(...getAllMdFiles(dir));
  }

  const progress = loadProgress();
  const overdueCards: SessionCard[] = [];
  const dueCards: SessionCard[] = [];
  const newCards: SessionCard[] = [];

  for (const filePath of allFiles) {
    const cardProgress = progress.cards[filePath] ?? createNewCard(filePath);
    if (!isDue(cardProgress)) continue;

    let content = "";
    if (!statsOnly) {
      try {
        content = fs.readFileSync(filePath, "utf-8");
      } catch {
        continue;
      }
    }

    const card: SessionCard = {
      id: filePath,
      filePath,
      title: path.basename(filePath, ".md"),
      content,
      progress: cardProgress,
      priority: getPriority(cardProgress),
      mode,
    };

    if (cardProgress.lastReviewed === null) {
      newCards.push(card);
    } else if (card.priority < 0) {
      overdueCards.push(card); // overdue (nextReview in the past)
    } else {
      dueCards.push(card); // due exactly today
    }
  }

  // Sort overdue cards: most overdue first
  overdueCards.sort((a, b) => a.priority - b.priority);

  // Shuffle new and due-today cards
  shuffle(dueCards);
  shuffle(newCards);

  const session = statsOnly
    ? []
    : [...overdueCards, ...dueCards, ...newCards].slice(0, limit);

  return NextResponse.json({
    cards: session,
    total: allFiles.length,
    dueCount: overdueCards.length + dueCards.length + newCards.length,
    newCount: newCards.length,
    reviewCount: overdueCards.length + dueCards.length,
    hasDirectories: true,
  });
}

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

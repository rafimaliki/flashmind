import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { DATA_PATH } from "@/lib/config";
import { ProgressData, Rating } from "@/lib/types";
import { updateCard, createNewCard } from "@/lib/spacedRepetition";

export const dynamic = "force-dynamic";

function loadProgress(): ProgressData {
  try {
    if (!fs.existsSync(DATA_PATH)) return { cards: {} };
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (
      !parsed?.cards ||
      typeof parsed.cards !== "object" ||
      Array.isArray(parsed.cards)
    ) {
      console.warn("[progress] corrupt or invalid shape — using empty");
      return { cards: {} };
    }
    return parsed as ProgressData;
  } catch {
    return { cards: {} };
  }
}

function saveProgress(data: ProgressData): void {
  try {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[progress] failed to write progress.json:", err);
    throw err;
  }
}

export async function POST(request: NextRequest) {
  let body: { cardId: string; filePath: string; rating: Rating };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { cardId, filePath, rating } = body;
  if (!cardId || !filePath || !["easy", "medium", "hard"].includes(rating)) {
    return NextResponse.json(
      { error: "Missing or invalid fields" },
      { status: 400 },
    );
  }

  const progress = loadProgress();
  const existing = progress.cards[cardId] ?? createNewCard(filePath);
  const updated = updateCard(existing, rating);
  progress.cards[cardId] = updated;
  try {
    saveProgress(progress);
  } catch {
    return NextResponse.json(
      { error: "Failed to write progress" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, card: updated });
}

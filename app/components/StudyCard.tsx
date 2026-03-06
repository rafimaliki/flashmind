"use client";

import { useState } from "react";
import { SessionCard, Rating, CardProgress, Mode } from "@/lib/types";
import ProgressBar from "./ProgressBar";
import MarkdownRenderer from "./MarkdownRenderer";

interface Props {
  card: SessionCard;
  currentIndex: number;
  totalCards: number;
  onRate: (rating: Rating) => void;
  mode: Mode;
}

const MODE_META: Record<
  Mode,
  { label: string; iconName: string; color: string }
> = {
  memory: { label: "Memory", iconName: "menu_book", color: "text-indigo-400" },
  leetcode: {
    label: "Leetcode",
    iconName: "terminal",
    color: "text-violet-400",
  },
};

function nextIntervalLabel(progress: CardProgress, rating: Rating): string {
  const { interval, easeFactor, repetitions } = progress;
  let days: number;
  if (rating === "hard") {
    days = 1;
  } else if (rating === "medium") {
    if (repetitions === 0) days = 1;
    else if (repetitions === 1) days = 3;
    else days = Math.round(interval * easeFactor);
  } else {
    if (repetitions === 0) days = 1;
    else if (repetitions === 1) days = 4;
    else days = Math.round(interval * easeFactor * 1.3);
  }
  if (days < 1) return "< 1 day";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  return `${Math.round(days / 30)}mo`;
}

export default function StudyCard({
  card,
  currentIndex,
  totalCards,
  onRate,
  mode,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isNew = card.progress.lastReviewed === null;
  const lastReviewedStr = card.progress.lastReviewed
    ? new Date(card.progress.lastReviewed).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const handleRate = async (rating: Rating) => {
    if (submitting) return;
    setSubmitting(true);
    await onRate(rating);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-5 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-200">
                FlashMind
              </span>
              <span
                className={`text-xs font-medium ${MODE_META[mode].color} flex items-center gap-1`}
              >
                <span className="material-icons-round text-xs leading-none">
                  {MODE_META[mode].iconName}
                </span>
                <span>{MODE_META[mode].label}</span>
              </span>
            </div>
            <span className="text-xs text-zinc-500">
              {currentIndex}/{totalCards}
            </span>
          </div>
          <ProgressBar current={currentIndex} total={totalCards} />
        </div>
      </div>

      {/* Card area */}
      <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-5 border-b border-zinc-800/60 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-zinc-100 leading-tight wrap-break-word">
                {card.title}
              </h2>
              {lastReviewedStr && (
                <p className="text-xs text-zinc-600 mt-1">
                  Last reviewed: {lastReviewedStr}
                </p>
              )}
            </div>
            <div className="flex gap-1.5 shrink-0 mt-0.5">
              {isNew && (
                <Badge
                  label="New"
                  bgClass="bg-emerald-950/60"
                  textClass="text-emerald-400"
                />
              )}
              {card.progress.repetitions > 0 && (
                <Badge
                  label={`×${card.progress.repetitions}`}
                  bgClass="bg-zinc-800"
                  textClass="text-zinc-400"
                />
              )}
            </div>
          </div>

          {/* Card body */}
          {!revealed ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-5">
              <p className="text-zinc-500 text-sm text-center max-w-xs">
                Recall what you know about this topic before revealing the
                content.
              </p>
              <button
                onClick={() => setRevealed(true)}
                className="flex items-center gap-2 px-7 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-xl border border-zinc-700 active:scale-95 transition-all"
              >
                <span className="material-icons-round text-base">
                  visibility
                </span>
                Show Content
              </button>
            </div>
          ) : (
            <div className="px-6 py-6 overflow-x-auto">
              <MarkdownRenderer content={card.content} />
            </div>
          )}
        </div>

        {/* Rating buttons */}
        {revealed && (
          <div className="mt-5">
            <p className="text-center text-xs text-zinc-600 mb-3 font-medium uppercase tracking-wide">
              How well did you know this?
            </p>
            <div className="grid grid-cols-3 gap-3">
              <RatingBtn
                label="Hard"
                sublabel={nextIntervalLabel(card.progress, "hard")}
                onClick={() => handleRate("hard")}
                disabled={submitting}
                bg="bg-red-950/40"
                border="border-red-900/60"
                text="text-red-400"
                hover="hover:bg-red-950/70"
              />
              <RatingBtn
                label="Medium"
                sublabel={nextIntervalLabel(card.progress, "medium")}
                onClick={() => handleRate("medium")}
                disabled={submitting}
                bg="bg-amber-950/40"
                border="border-amber-900/60"
                text="text-amber-400"
                hover="hover:bg-amber-950/70"
              />
              <RatingBtn
                label="Easy"
                sublabel={nextIntervalLabel(card.progress, "easy")}
                onClick={() => handleRate("easy")}
                disabled={submitting}
                bg="bg-emerald-950/40"
                border="border-emerald-900/60"
                text="text-emerald-400"
                hover="hover:bg-emerald-950/70"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({
  label,
  bgClass,
  textClass,
}: {
  label: string;
  bgClass: string;
  textClass: string;
}) {
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${bgClass} ${textClass}`}
    >
      {label}
    </span>
  );
}

function RatingBtn({
  label,
  sublabel,
  onClick,
  disabled,
  bg,
  border,
  text,
  hover,
}: {
  label: string;
  sublabel: string;
  onClick: () => void;
  disabled: boolean;
  bg: string;
  border: string;
  text: string;
  hover: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center py-4 px-2 rounded-xl border font-semibold
        ${bg} ${border} ${text} ${hover}
        active:scale-95 transition-all duration-100
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <span className="text-sm">{label}</span>
      <span className="text-[11px] opacity-60 mt-0.5">{sublabel}</span>
    </button>
  );
}

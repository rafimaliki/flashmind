import React from "react";
import { Mode, SessionSnapshot } from "@/lib/types";

export interface ModeStats {
  total: number;
  dueCount: number;
  newCount: number;
  reviewCount: number;
  hasDirectories: boolean;
}

interface Props {
  onStart: () => void;
  onResume: () => void;
  onOpenSettings: () => void;
  isLoading: boolean;
  stats: Record<Mode, ModeStats>;
  savedSession: SessionSnapshot | null;
}

export default function StartScreen({
  onStart,
  onResume,
  onOpenSettings,
  isLoading,
  stats,
  savedSession,
}: Props) {
  const mem = stats.memory;
  const lc = stats.leetcode;
  const totalDue = mem.dueCount + lc.dueCount;
  const hasAny = mem.hasDirectories || lc.hasDirectories;
  const nothingDue = !isLoading && totalDue === 0 && hasAny;
  const notConfigured = !isLoading && !hasAny;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-6 py-10">
      {/* Title */}
      <div className="text-center mb-8">
        {/* <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg border border-zinc-700">
          <span className="material-icons-round text-4xl text-indigo-400 select-none">
            psychology
          </span>
        </div> */}
        <h1 className="text-4xl font-bold text-zinc-100 tracking-tight">
          FlashMind
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">
          Spaced repetition for your Zettelkasten
        </p>
      </div>

      {/* Resume banner */}
      {savedSession && (
        <div className="w-full max-w-sm mb-4 bg-indigo-950/50 border border-indigo-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-icons-round text-indigo-400 text-base">
              play_circle
            </span>
            <span className="text-sm font-semibold text-indigo-300">
              Session in progress
            </span>
          </div>
          <p className="text-xs text-indigo-400/80 mb-4">
            You reviewed{" "}
            <span className="font-bold text-indigo-300">
              {savedSession.currentIndex}
            </span>{" "}
            of{" "}
            <span className="font-bold text-indigo-300">
              {savedSession.cards.length}
            </span>{" "}
            cards
          </p>
          <div className="flex gap-2">
            <button
              onClick={onResume}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white transition-colors active:scale-[0.98]"
            >
              Continue
            </button>
            <button
              onClick={onStart}
              disabled={isLoading || notConfigured}
              className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

      {/* Stats card */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm p-7 w-full max-w-sm mb-4">
        <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-5">
          Today&apos;s Session
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
          </div>
        ) : notConfigured ? (
          <div className="py-6 text-center">
            <p className="text-sm text-zinc-500">No directories configured.</p>
            <p className="text-xs text-zinc-600 mt-1">
              Open Settings to add your note folders.
            </p>
          </div>
        ) : (
          <>
            <ModeRow
              iconName="menu_book"
              label="Memory"
              limit={15}
              due={mem.dueCount}
              reviewCount={mem.reviewCount}
              newCount={mem.newCount}
              total={mem.total}
              configured={mem.hasDirectories}
              accentClass="text-indigo-400"
            />
            <div className="border-t border-zinc-800/60 my-4" />
            <ModeRow
              iconName="terminal"
              label="Leetcode"
              limit={5}
              due={lc.dueCount}
              reviewCount={lc.reviewCount}
              newCount={lc.newCount}
              total={lc.total}
              configured={lc.hasDirectories}
              accentClass="text-violet-400"
            />
            <div className="border-t border-zinc-800 mt-5 pt-4 grid grid-cols-3 gap-2">
              <StatBox
                label="Due"
                value={totalDue}
                colorClass="text-rose-400"
                tooltip="Cards whose review date has arrived — ready to study today."
              />
              <StatBox
                label="Reviews"
                value={mem.reviewCount + lc.reviewCount}
                colorClass="text-sky-400"
                tooltip="Cards you've seen before that are scheduled for re-review."
              />
              <StatBox
                label="New"
                value={mem.newCount + lc.newCount}
                colorClass="text-teal-400"
                tooltip="Cards you've never studied yet."
              />
            </div>
          </>
        )}
      </div>

      {/* Start button — only show when no saved session */}
      {!savedSession && (
        <button
          onClick={onStart}
          disabled={isLoading || nothingDue || notConfigured}
          className="w-full max-w-sm py-4 text-base font-semibold rounded-xl transition-all duration-150 bg-indigo-500 text-white shadow-md active:scale-[0.98] hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none mb-3"
        >
          {isLoading
            ? "Loading…"
            : notConfigured
              ? "Configure First"
              : nothingDue
                ? "All caught up!"
                : "Start Learning"}
        </button>
      )}

      {/* Settings */}
      <button
        onClick={onOpenSettings}
        className="flex items-center gap-1.5 px-4 py-2 text-sm text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded-xl border border-transparent hover:border-zinc-700 transition-all mt-1"
      >
        <span className="material-icons-round text-base">settings</span>
        Settings
      </button>
    </div>
  );
}

function ModeRow({
  iconName,
  label,
  limit,
  due,
  reviewCount,
  newCount,
  total,
  configured,
  accentClass,
}: {
  iconName: string;
  label: string;
  limit: number;
  due: number;
  reviewCount: number;
  newCount: number;
  total: number;
  configured: boolean;
  accentClass: string;
}) {
  const actual = Math.min(due, limit);
  return (
    <div className="w-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`material-icons-round text-base ${accentClass}`}>
            {iconName}
          </span>
          <span className="text-sm font-semibold text-zinc-200">{label}</span>
        </div>
        {configured && (
          <span className="text-xs text-zinc-500 tabular-nums">
            <span className={`font-bold ${accentClass}`}>{actual}</span>
            <span> / {limit} slots</span>
          </span>
        )}
      </div>

      {/* Per-mode breakdown */}
      {configured ? (
        <div className="flex items-center gap-2 pl-6">
          <MiniStat
            label="Due"
            value={due}
            color="text-rose-400"
            tooltip="Cards whose review date has arrived — ready to study today."
          />
          <span className="text-zinc-700 text-xs">·</span>
          <MiniStat
            label="Review"
            value={reviewCount}
            color="text-sky-400"
            tooltip="Cards you've seen before that are scheduled for re-review."
          />
          <span className="text-zinc-700 text-xs">·</span>
          <MiniStat
            label="New"
            value={newCount}
            color="text-teal-400"
            tooltip="Cards you've never studied yet."
          />
          <span className="text-zinc-700 text-xs ml-auto">·</span>
          <span className="text-xs text-zinc-600">{total} total</span>
        </div>
      ) : (
        <p className="text-xs text-zinc-600 italic pl-6">not configured</p>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
  tooltip,
}: {
  label: string;
  value: number;
  color: string;
  tooltip: string;
}) {
  return (
    <Tooltip text={tooltip}>
      <span className="text-xs text-zinc-500 cursor-default">
        <span className={`font-semibold tabular-nums ${color}`}>{value}</span>{" "}
        {label}
      </span>
    </Tooltip>
  );
}

function Tooltip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  return (
    <span className="relative group/tip">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-50 rounded-lg bg-zinc-800 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 leading-snug opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50 text-center shadow-xl">
        {text}
      </span>
    </span>
  );
}

function StatBox({
  label,
  value,
  colorClass,
  tooltip,
}: {
  label: string;
  value: number;
  colorClass: string;
  tooltip: string;
}) {
  return (
    <Tooltip text={tooltip}>
      <div className="flex flex-col items-center bg-zinc-800/60 rounded-xl py-3 cursor-default">
        <span className={`text-2xl font-bold tabular-nums ${colorClass}`}>
          {value}
        </span>
        <span className="text-[10px] font-medium text-zinc-600 mt-0.5 uppercase tracking-wide flex items-center gap-0.5">
          {label}
        </span>
      </div>
    </Tooltip>
  );
}

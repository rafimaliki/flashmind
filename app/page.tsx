"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SessionCard,
  Rating,
  AppConfig,
  Mode,
  SessionSnapshot,
} from "@/lib/types";
import StartScreen, { ModeStats } from "./components/StartScreen";
import StudyCard from "./components/StudyCard";
import SessionComplete from "./components/SessionComplete";
import DirectoryConfig from "./components/DirectoryConfig";

type AppState = "start" | "studying" | "complete";

const STORAGE_KEY = "flashbrain_session";

function saveSession(
  cards: SessionCard[],
  index: number,
  stats: { easy: number; medium: number; hard: number },
) {
  const snapshot: SessionSnapshot = {
    cards,
    currentIndex: index,
    sessionStats: stats,
    savedAt: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {}
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function loadSession(): SessionSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw) as SessionSnapshot;
    if (snap.currentIndex >= snap.cards.length) return null;
    return snap;
  } catch {
    return null;
  }
}

const DEFAULT_STATS: ModeStats = {
  total: 0,
  dueCount: 0,
  newCount: 0,
  reviewCount: 0,
  hasDirectories: false,
};

const DEFAULT_CONFIG: AppConfig = {
  modes: {
    memory: { directories: [] },
    leetcode: { directories: [] },
  },
};

export default function Home() {
  const [state, setState] = useState<AppState>("start");
  const [cards, setCards] = useState<SessionCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Record<Mode, ModeStats>>({
    memory: DEFAULT_STATS,
    leetcode: DEFAULT_STATS,
  });
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [showSettings, setShowSettings] = useState(false);
  const [savedSession, setSavedSession] = useState<SessionSnapshot | null>(
    null,
  );

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const [configRes, memRes, lcRes] = await Promise.all([
        fetch("/api/config"),
        fetch("/api/cards?mode=memory&statsOnly=true"),
        fetch("/api/cards?mode=leetcode&statsOnly=true"),
      ]);
      const [configData, memData, lcData] = await Promise.all([
        configRes.json(),
        memRes.json(),
        lcRes.json(),
      ]);
      setAppConfig(configData);
      setStats({
        memory: {
          total: memData.total ?? 0,
          dueCount: memData.dueCount ?? 0,
          newCount: memData.newCount ?? 0,
          reviewCount: memData.reviewCount ?? 0,
          hasDirectories: memData.hasDirectories ?? false,
        },
        leetcode: {
          total: lcData.total ?? 0,
          dueCount: lcData.dueCount ?? 0,
          newCount: lcData.newCount ?? 0,
          reviewCount: lcData.reviewCount ?? 0,
          hasDirectories: lcData.hasDirectories ?? false,
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const snap = loadSession();
    setSavedSession(snap);
    fetchStats();
  }, [fetchStats]);

  const handleResume = () => {
    if (!savedSession) return;
    setCards(savedSession.cards);
    setCurrentIndex(savedSession.currentIndex);
    setSessionStats(savedSession.sessionStats);
    setState("studying");
  };

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const [memRes, lcRes] = await Promise.all([
        fetch("/api/cards?mode=memory&limit=15"),
        fetch("/api/cards?mode=leetcode&limit=5"),
      ]);
      const [memData, lcData] = await Promise.all([
        memRes.json(),
        lcRes.json(),
      ]);
      const combined: SessionCard[] = [
        ...(memData.cards ?? []),
        ...(lcData.cards ?? []),
      ];
      if (!combined.length) return;
      const initStats = { easy: 0, medium: 0, hard: 0 };
      saveSession(combined, 0, initStats);
      setSavedSession(null);
      setCards(combined);
      setCurrentIndex(0);
      setSessionStats(initStats);
      setState("studying");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRate = async (rating: Rating) => {
    const card = cards[currentIndex];
    const newStats = { ...sessionStats, [rating]: sessionStats[rating] + 1 };
    setSessionStats(newStats);

    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: card.id,
        filePath: card.filePath,
        rating,
      }),
    });

    const nextIndex = currentIndex + 1;
    if (nextIndex >= cards.length) {
      clearSession();
      setState("complete");
    } else {
      setCurrentIndex(nextIndex);
      saveSession(cards, nextIndex, newStats);
    }
  };

  const handleRestart = async () => {
    clearSession();
    setSavedSession(null);
    setState("start");
    await fetchStats();
  };

  const handleSaveConfig = async (newConfig: AppConfig) => {
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig),
    });
    setAppConfig(newConfig);
    await fetchStats();
  };

  if (state === "start") {
    return (
      <>
        <StartScreen
          onStart={handleStart}
          onResume={handleResume}
          onOpenSettings={() => setShowSettings(true)}
          isLoading={isLoading}
          stats={stats}
          savedSession={savedSession}
        />
        {showSettings && (
          <DirectoryConfig
            config={appConfig}
            onSave={handleSaveConfig}
            onClose={() => setShowSettings(false)}
          />
        )}
      </>
    );
  }

  if (state === "complete") {
    return <SessionComplete stats={sessionStats} onRestart={handleRestart} />;
  }

  const currentCard = cards[currentIndex];
  return (
    <StudyCard
      key={currentCard.id}
      card={currentCard}
      currentIndex={currentIndex + 1}
      totalCards={cards.length}
      onRate={handleRate}
      mode={currentCard.mode}
    />
  );
}

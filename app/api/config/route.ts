import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CONFIG_PATH } from "@/lib/config";
import { AppConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEFAULT_CONFIG: AppConfig = {
  modes: {
    memory: { directories: [] },
    leetcode: { directories: [] },
  },
};

function loadConfig(): AppConfig {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return { ...DEFAULT_CONFIG };
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (
      !Array.isArray(parsed?.modes?.memory?.directories) ||
      !Array.isArray(parsed?.modes?.leetcode?.directories)
    ) {
      console.warn("[config] corrupt or invalid shape — using defaults");
      return { ...DEFAULT_CONFIG };
    }
    return parsed as AppConfig;
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(data: AppConfig): void {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[config] failed to write config.json:", err);
    throw err; // re-throw so POST handler can return 500
  }
}

export async function GET() {
  return NextResponse.json(loadConfig());
}

export async function POST(request: NextRequest) {
  let body: AppConfig;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body?.modes?.memory?.directories ||
    !body?.modes?.leetcode?.directories
  ) {
    return NextResponse.json(
      { error: "Invalid config structure" },
      { status: 400 },
    );
  }

  // Validate directory paths — only strings, reasonable length, no shell metacharacters
  const allDirs = [
    ...body.modes.memory.directories,
    ...body.modes.leetcode.directories,
  ];
  for (const dir of allDirs) {
    if (typeof dir !== "string" || dir.length > 500) {
      return NextResponse.json(
        { error: "Invalid directory path" },
        { status: 400 },
      );
    }
  }

  try {
    saveConfig(body);
  } catch {
    return NextResponse.json(
      { error: "Failed to write config" },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true });
}

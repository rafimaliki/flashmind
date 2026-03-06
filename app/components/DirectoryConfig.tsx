"use client";

import { useState } from "react";
import { AppConfig, Mode } from "@/lib/types";

interface Props {
  config: AppConfig;
  onSave: (config: AppConfig) => Promise<void>;
  onClose: () => void;
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

export default function DirectoryConfig({ config, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<AppConfig>(
    JSON.parse(JSON.stringify(config)),
  );
  const [inputs, setInputs] = useState<Record<Mode, string>>({
    memory: "",
    leetcode: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addDir = (mode: Mode) => {
    const val = inputs[mode].trim();
    if (!val) return;
    const dirs = draft.modes[mode].directories;
    if (dirs.includes(val)) {
      setError("That directory is already added.");
      return;
    }
    setDraft({
      ...draft,
      modes: {
        ...draft.modes,
        [mode]: { directories: [...dirs, val] },
      },
    });
    setInputs({ ...inputs, [mode]: "" });
    setError(null);
  };

  const removeDir = (mode: Mode, idx: number) => {
    const dirs = draft.modes[mode].directories.filter((_, i) => i !== idx);
    setDraft({
      ...draft,
      modes: { ...draft.modes, [mode]: { directories: dirs } },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-zinc-100">Settings</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Configure directories for each mode
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <span className="material-icons-round text-base">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {(["memory", "leetcode"] as Mode[]).map((mode) => {
            const { label, iconName, color } = MODE_META[mode];
            const dirs = draft.modes[mode].directories;

            return (
              <div key={mode}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`material-icons-round text-base ${color}`}>
                    {iconName}
                  </span>
                  <h3 className="text-sm font-semibold text-zinc-200">
                    {label} Directories
                  </h3>
                </div>

                {dirs.length === 0 ? (
                  <p className="text-xs text-zinc-600 mb-3 italic">
                    No directories added yet.
                  </p>
                ) : (
                  <ul className="space-y-1.5 mb-3">
                    {dirs.map((dir, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2 group"
                      >
                        <span className="flex-1 text-xs text-zinc-400 break-all font-mono leading-relaxed">
                          {dir}
                        </span>
                        <button
                          onClick={() => removeDir(mode, idx)}
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded text-red-500 hover:text-red-400 hover:bg-red-950/40"
                          title="Remove"
                        >
                          <span className="material-icons-round text-sm">
                            close
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputs[mode]}
                    onChange={(e) =>
                      setInputs({ ...inputs, [mode]: e.target.value })
                    }
                    onKeyDown={(e) => e.key === "Enter" && addDir(mode)}
                    placeholder={
                      mode === "memory"
                        ? "C:\\Notes\\References"
                        : "C:\\Notes\\Leetcode"
                    }
                    className="flex-1 text-xs px-3 py-2.5 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 font-mono placeholder:text-zinc-600"
                  />
                  <button
                    onClick={() => addDir(mode)}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1"
                  >
                    <span className="material-icons-round text-sm">add</span>
                    Add
                  </button>
                </div>
              </div>
            );
          })}

          {error && (
            <p className="text-xs text-red-400 text-center pt-1">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-zinc-700 text-zinc-400 text-sm font-medium rounded-xl hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-indigo-500 text-white text-sm font-semibold rounded-xl hover:bg-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

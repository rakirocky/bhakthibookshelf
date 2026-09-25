"use client";

/**
 * Per-device reading state for books saved offline: last page read,
 * bookmarks, and the reader's look (theme + zoom). Stored with
 * Capacitor Preferences like the library index (SharedPreferences on
 * Android, localStorage on the web) — nothing is sent to the server.
 *
 *   progress        ->  Preferences, key "bbs_reading"
 *   reader settings ->  Preferences, key "bbs_reader_prefs"
 */

const PROGRESS_KEY = "bbs_reading";
const PREFS_KEY = "bbs_reader_prefs";

export interface BookProgress {
  page: number;
  total: number;
  bookmarks: number[];
  updatedAt: number;
}

export type ReaderTheme = "day" | "sepia" | "night";

export interface ReaderPrefs {
  theme: ReaderTheme;
  zoom: number;
}

export const ZOOM_STEPS = [1, 1.25, 1.5, 1.75, 2];

const DEFAULT_PREFS: ReaderPrefs = { theme: "day", zoom: 1 };

async function prefs() {
  const mod = await import("@capacitor/preferences");
  // Return the module, not the bare `Preferences` proxy (see the same
  // note in library.ts — an async function returning the proxy makes
  // Capacitor try to call Preferences.then() natively).
  return mod;
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const { Preferences } = await prefs();
    const { value } = await Preferences.get({ key });
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    const { Preferences } = await prefs();
    await Preferences.set({ key, value: JSON.stringify(value) });
  } catch {
    // Reading state is a convenience — never break the reader over it.
  }
}

type ProgressMap = Record<string, BookProgress>;

export async function getAllProgress(): Promise<ProgressMap> {
  return readJson<ProgressMap>(PROGRESS_KEY, {});
}

export async function getProgress(
  downloadId: number
): Promise<BookProgress | null> {
  return (await getAllProgress())[String(downloadId)] ?? null;
}

export async function saveProgress(
  downloadId: number,
  page: number,
  total: number
): Promise<void> {
  const all = await getAllProgress();
  const prev = all[String(downloadId)];
  all[String(downloadId)] = {
    page,
    total,
    bookmarks: prev?.bookmarks ?? [],
    updatedAt: Date.now(),
  };
  await writeJson(PROGRESS_KEY, all);
}

/** Adds or removes a bookmark; returns the updated, sorted list. */
export async function toggleBookmark(
  downloadId: number,
  page: number,
  total: number
): Promise<number[]> {
  const all = await getAllProgress();
  const prev = all[String(downloadId)];
  const marks = new Set(prev?.bookmarks ?? []);

  if (marks.has(page)) {
    marks.delete(page);
  } else {
    marks.add(page);
  }

  const bookmarks = [...marks].sort((a, b) => a - b);
  all[String(downloadId)] = {
    page: prev?.page ?? page,
    total,
    bookmarks,
    updatedAt: prev?.updatedAt ?? Date.now(),
  };
  await writeJson(PROGRESS_KEY, all);
  return bookmarks;
}

/** Drop state for books no longer on the device. */
export async function forgetProgress(downloadId: number): Promise<void> {
  const all = await getAllProgress();
  if (all[String(downloadId)]) {
    delete all[String(downloadId)];
    await writeJson(PROGRESS_KEY, all);
  }
}

export async function getReaderPrefs(): Promise<ReaderPrefs> {
  const p = await readJson<Partial<ReaderPrefs>>(PREFS_KEY, {});
  return {
    theme:
      p.theme === "sepia" || p.theme === "night" ? p.theme : DEFAULT_PREFS.theme,
    zoom: ZOOM_STEPS.includes(p.zoom as number)
      ? (p.zoom as number)
      : DEFAULT_PREFS.zoom,
  };
}

export async function saveReaderPrefs(p: ReaderPrefs): Promise<void> {
  await writeJson(PREFS_KEY, p);
}

import { stableHash } from "./hash";
import type {
  CachedExplanationEntry,
  UserSettings,
  AudienceMode,
  Verbosity
} from "./types";
import { DEFAULT_SETTINGS } from "./types";

const SETTINGS_KEY = "clarte_settings";
const CACHE_KEY = "clarte_cache_entries";
const CACHE_LIMIT = 30;

type StorageArea = "sync" | "local";

function getArea(area: StorageArea): chrome.storage.SyncStorageArea | chrome.storage.LocalStorageArea {
  return area === "sync" ? chrome.storage.sync : chrome.storage.local;
}

function readFromStorage<T>(area: StorageArea, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    getArea(area).get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(result[key] as T | undefined);
    });
  });
}

function writeToStorage(area: StorageArea, key: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    getArea(area).set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}

export function makeCacheKey(input: {
  selectedText: string;
  paragraphContext: string;
  hostname: string;
  audienceMode: AudienceMode;
  verbosity: Verbosity;
}): string {
  const joined = [
    input.selectedText.trim(),
    input.paragraphContext.trim(),
    input.hostname.trim(),
    input.audienceMode,
    input.verbosity
  ].join("||");
  return stableHash(joined);
}

export async function getSettings(): Promise<UserSettings> {
  const stored = await readFromStorage<Partial<UserSettings>>("sync", SETTINGS_KEY);
  return {
    ...DEFAULT_SETTINGS,
    ...stored
  };
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await writeToStorage("sync", SETTINGS_KEY, settings);
}

async function readCache(): Promise<CachedExplanationEntry[]> {
  const stored = await readFromStorage<CachedExplanationEntry[]>("local", CACHE_KEY);
  if (!Array.isArray(stored)) {
    return [];
  }
  return stored;
}

export async function getCachedExplanation(cacheKey: string): Promise<CachedExplanationEntry | null> {
  const entries = await readCache();
  const entry = entries.find((item) => item.key === cacheKey);
  return entry ?? null;
}

export async function putCachedExplanation(entry: CachedExplanationEntry): Promise<void> {
  const entries = await readCache();
  const filtered = entries.filter((item) => item.key !== entry.key);
  const updated = [entry, ...filtered]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, CACHE_LIMIT);
  await writeToStorage("local", CACHE_KEY, updated);
}

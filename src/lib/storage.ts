import { stableHash } from "./hash";
import type {
  CachedExplanationEntry,
  UserSettings,
  AudienceMode,
  Verbosity,
  EnglishLevel,
  TechnicalFamiliarity
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
  const normalizedAudienceMode = normalizeAudienceMode(stored?.audienceMode);
  const normalizedEnglishLevel = normalizeEnglishLevel(stored?.englishLevel);
  const normalizedTechnicalFamiliarity = normalizeTechnicalFamiliarity(stored?.technicalFamiliarity);
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    audienceMode: normalizedAudienceMode,
    englishLevel: normalizedEnglishLevel,
    technicalFamiliarity: normalizedTechnicalFamiliarity
  };
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await writeToStorage("sync", SETTINGS_KEY, settings);
}

function normalizeAudienceMode(value: unknown): AudienceMode {
  if (
    value === "children" ||
    value === "teens" ||
    value === "young_adults" ||
    value === "adults" ||
    value === "seniors"
  ) {
    return value;
  }
  if (value === "older_adults") {
    return "seniors";
  }
  if (value === "older_generation") {
    return "seniors";
  }
  if (value === "general" || value === "non_native" || value === "non_technical") {
    return "adults";
  }
  return DEFAULT_SETTINGS.audienceMode;
}

function normalizeEnglishLevel(value: unknown): EnglishLevel {
  if (value === "1" || value === "2" || value === "3" || value === "4" || value === "5") {
    return value;
  }
  if (value === "beginner") {
    return "2";
  }
  if (value === "intermediate") {
    return "3";
  }
  if (value === "advanced") {
    return "5";
  }
  return DEFAULT_SETTINGS.englishLevel;
}

function normalizeTechnicalFamiliarity(value: unknown): TechnicalFamiliarity {
  if (
    value === "kids" ||
    value === "high_school" ||
    value === "undergrad" ||
    value === "graduate"
  ) {
    return value;
  }
  if (value === "school_students") {
    return "high_school";
  }
  if (value === "beginner") {
    return "kids";
  }
  if (value === "intermediate") {
    return "high_school";
  }
  if (value === "advanced") {
    return "undergrad";
  }
  return DEFAULT_SETTINGS.technicalFamiliarity;
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

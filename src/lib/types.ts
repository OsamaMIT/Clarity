export type AudienceMode = "children" | "teens" | "young_adults" | "adults" | "seniors";

export type Verbosity = "brief" | "balanced" | "detailed";

export type EnglishLevel = "1" | "2" | "3" | "4" | "5";

export type TechnicalFamiliarity = "kids" | "high_school" | "undergrad" | "graduate";
export type ExplanationOrder = "meaning_first" | "simpler_first";

export type SourceType = "social" | "news_article" | "technical" | "blog" | "general";

export type CardState = "hidden" | "loading" | "success" | "low_confidence" | "error" | "timeout";

export interface UserSettings {
  apiKey: string;
  audienceMode: AudienceMode;
  verbosity: Verbosity;
  nativeLanguage: string;
  englishLevel: EnglishLevel;
  technicalFamiliarity: TechnicalFamiliarity;
  explanationOrder: ExplanationOrder;
}

export const DEFAULT_SETTINGS: UserSettings = {
  apiKey: "", // Please don't bankrupt me, this is only exposed for the hackathon
  audienceMode: "adults",
  verbosity: "balanced",
  nativeLanguage: "English",
  englishLevel: "3",
  technicalFamiliarity: "high_school",
  explanationOrder: "meaning_first"
};

export interface SelectionRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

export interface SelectionData {
  selectedText: string;
  paragraphContext: string;
  rect: SelectionRect;
}

export interface SourceInfo {
  sourceType: SourceType;
  domainHint: string;
}

export interface ExplainRequestContext {
  selectedText: string;
  paragraphContext: string;
  pageTitle: string;
  pageUrl: string;
  hostname: string;
  sourceType: SourceType;
  domainHint: string;
}

export interface GeminiOutput {
  meaning: string;
  simpler_version: string;
  confidence: number;
  needs_more_context: boolean;
  uncertainty_reason: string;
}

export interface CachedExplanationEntry {
  key: string;
  createdAt: number;
  selectedText: string;
  paragraphContext: string;
  hostname: string;
  audienceMode: AudienceMode;
  verbosity: Verbosity;
  result: GeminiOutput;
}

export type ExplainErrorCode = "missing_api_key" | "timeout" | "invalid_output" | "api_error";

export type GeminiCallResult =
  | {
      ok: true;
      result: GeminiOutput;
    }
  | {
      ok: false;
      errorCode: ExplainErrorCode;
      message: string;
    };

export interface ExplainCardData {
  selectedText: string;
  state: CardState;
  meaning: string;
  simplerVersion: string;
  explanationOrder: ExplanationOrder;
  confidence: number | null;
  errorMessage: string;
  position: {
    top: number;
    left: number;
  };
}

export const MESSAGE_EXPLAIN_CONTEXT = "CLARTE_EXPLAIN_CONTEXT";

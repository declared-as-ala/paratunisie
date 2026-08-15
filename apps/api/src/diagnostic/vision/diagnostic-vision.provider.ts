export type CosmeticObservationLevel = "low" | "medium" | "high" | "unknown";
export type VisionConfidenceLevel = "low" | "medium" | "high";

export type CosmeticObservations = {
  shine: CosmeticObservationLevel;
  visibleDryness: CosmeticObservationLevel;
  visibleRedness: CosmeticObservationLevel;
  visibleTexture: CosmeticObservationLevel;
  visiblePores: CosmeticObservationLevel;
  unevenTone: CosmeticObservationLevel;
};

export type DiagnosticVisionAnalysisResult = {
  cosmeticObservations: CosmeticObservations;
  confidence: Record<keyof CosmeticObservations, VisionConfidenceLevel>;
  redFlag: boolean;
  redFlagReason: string | null;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  provider: string;
  model: string;
};

export interface DiagnosticVisionProviderOptions {
  /** Optional — each provider resolves its own default from its own env var (e.g. GROQ_API_KEY) when omitted. */
  apiKey?: string;
  model?: string;
  promptVersion?: string;
}

export interface DiagnosticVisionProvider {
  readonly code: string;

  analyzeImage(
    imageBuffer: Buffer,
    mimeType: string,
    options: DiagnosticVisionProviderOptions,
  ): Promise<DiagnosticVisionAnalysisResult>;
}

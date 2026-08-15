export interface ChatMessageInput {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StructuredTurnResult {
  assistantMessage: string;
  profileUpdates?: {
    domain?: "SKIN" | "HAIR";
    skinType?: string;
    concerns?: string[];
    sensitivity?: boolean;
    budgetMaxMillimes?: number;
    preferredBrands?: string[];
    avoidBrands?: string[];
  };
  quickReplies?: string[];
  recommendation?: {
    type: "SINGLE_PRODUCT" | "ROUTINE";
    title: string;
    summary: string;
    productIds: string[];
    routine?: {
      am?: Array<{ productId: string; slot: string; reason: string }>;
      pm?: Array<{ productId: string; slot: string; reason: string }>;
    };
  };
  redFlag?: boolean;
  redFlagReason?: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
}

export interface DiagnosticConversationProviderOptions {
  apiKey?: string;
  model?: string;
}

export interface DiagnosticConversationProvider {
  readonly code: string;

  generateTurn(
    messages: ChatMessageInput[],
    currentProfile: any,
    catalogCandidates: any[],
    options?: DiagnosticConversationProviderOptions,
  ): Promise<StructuredTurnResult>;
}

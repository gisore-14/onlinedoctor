export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  groundingMetadata?: any;
}

export enum Tab {
  HOME = 'home',
  SYMPTOMS = 'symptoms',
  LIVE = 'live',
  IMAGING = 'imaging',
  VIDEO = 'video'
}

export interface VideoGenerationState {
  isGenerating: boolean;
  progressMessage: string;
  videoUri?: string;
}

export interface ImageGenerationConfig {
  aspectRatio: string;
  imageSize?: "1K" | "2K" | "4K";
}

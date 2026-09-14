export enum AppState {
  IDLE = 'IDLE',
  CONFIGURING = 'CONFIGURING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type Language = 'en' | 'es' | 'de';

export interface StencilStyle {
  id: string;
  name: string;
  description: string;
  promptModifier: string;
}

export type BackgroundMode = 'white' | 'transparent' | 'gradient';

export interface PaletteTone {
  name: string;
  hex: string;
}

export interface ArtistInsights {
  complexity: string;
  estTime: string;
  needles: {
    type: string;
    description: string;
  }[];
  palette: PaletteTone[];
}

export interface StencilOptions {
  style: string; // style id
  strength: number;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  lineColor: string;
  invert: boolean;
  brightness: number;
  gradientColors?: [string, string];
  customPrompt?: string;
}

export interface StencilResult {
  originalImage: string; // Base64 or URL
  stencilImage: string; // Base64 or URL
  insights?: ArtistInsights;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface StencilHistoryItem extends StencilResult {
  id: string;
  date: number; // Timestamp
  styleName: string;
}

export interface ProcessingError {
  message: string;
}
export type FilterType = 
  | 'normal' 
  | 'grayscale' 
  | 'sepia' 
  | 'vintage' 
  | 'cyberpunk' 
  | 'warm' 
  | 'filmnoir';

export interface FilterConfig {
  id: FilterType;
  name: string;
  cssFilter: string;
  overlayClass?: string;
  description: string;
}

export type PhotoCount = 3 | 4;

export type LayoutType = 'vertical-strip' | 'grid-2x2';

export interface FrameOption {
  id: string;
  name: string;
  category: 'classic' | 'pastel' | 'neon' | 'pattern';
  bgClass: string;
  hexCode: string;
  textColor: string;
  isPattern?: boolean;
}

export type FontFamilyType = 'outfit' | 'playfair' | 'caveat' | 'spacemono';

export interface PlacedSticker {
  id: string;
  content: string; // emoji character or text badge
  type: 'emoji' | 'stamp';
  x: number; // percentage from left (0 to 100)
  y: number; // percentage from top (0 to 100)
  scale: number; // 0.6 to 2.5
  rotation: number; // degrees (-180 to 180)
}

export interface PhotoboothSession {
  photos: string[]; // base64 data URLs
  filter: FilterType;
  photoCount: PhotoCount;
  frameId: string;
  layout: LayoutType;
  customText: string;
  customDate: string;
  showDate: boolean;
  fontFamily: FontFamilyType;
  textColor: string;
  stickers: PlacedSticker[];
}

export interface SavedStripItem {
  id: string;
  dataUrl: string; // base64 DataURL (JPEG/PNG)
  createdAt: string; // ISO string
  title: string;
  layout: LayoutType;
  photoCount: PhotoCount;
}

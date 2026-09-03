import { FontFamilyType, FrameOption, LayoutType, PhotoCount, PlacedSticker } from '../types';
import { FRAME_OPTIONS, PHOTO_FILTERS } from './constants';

interface ExportOptions {
  photos: string[]; // Data URLs
  filterId: string;
  frameId: string;
  layout: LayoutType;
  photoCount: PhotoCount;
  customText: string;
  customDate: string;
  showDate: boolean;
  fontFamily: FontFamilyType;
  textColor: string;
  stickers: PlacedSticker[];
}

/**
 * Loads an image from a data URL safely
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Maps font family type to actual CSS font string for canvas
 */
function getCanvasFont(family: FontFamilyType, size: number, weight: string = 'bold'): string {
  switch (family) {
    case 'playfair':
      return `italic ${weight} ${size}px 'Playfair Display', serif`;
    case 'caveat':
      return `${weight} ${Math.round(size * 1.3)}px 'Caveat', cursive`;
    case 'spacemono':
      return `${weight} ${size}px 'Space Mono', monospace`;
    case 'outfit':
    default:
      return `${weight} ${size}px 'Outfit', sans-serif`;
  }
}

/**
 * Draw pattern background on canvas
 */
function drawPatternBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: FrameOption
) {
  // Base background
  ctx.fillStyle = frame.hexCode;
  ctx.fillRect(0, 0, width, height);

  if (frame.id === 'pattern-dots' || frame.id === 'pattern-dots-dark') {
    const isDark = frame.id === 'pattern-dots-dark';
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
    const spacing = 36;
    const dotRadius = 3.5;
    for (let x = spacing / 2; x < width; x += spacing) {
      for (let y = spacing / 2; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (frame.id === 'pattern-grid') {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 2;
    const gridSize = 45;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else if (frame.id === 'pattern-stripes') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    const stripeWidth = 28;
    for (let x = -height; x < width + height; x += stripeWidth * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + stripeWidth, 0);
      ctx.lineTo(x + stripeWidth + height, height);
      ctx.lineTo(x + height, height);
      ctx.closePath();
      ctx.fill();
    }
  } else if (frame.id === 'pattern-checker') {
    const size = 48;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < height; y += size) {
      for (let x = 0; x < width; x += size) {
        if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) {
          ctx.fillRect(x, y, size, size);
        }
      }
    }
  }
}

/**
 * Generate high-definition Photobooth Strip Canvas
 */
export async function renderPhotoboothCanvas(options: ExportOptions): Promise<HTMLCanvasElement> {
  const {
    photos,
    filterId,
    frameId,
    layout,
    photoCount,
    customText,
    customDate,
    showDate,
    fontFamily,
    stickers,
  } = options;

  const frame = FRAME_OPTIONS.find((f) => f.id === frameId) || FRAME_OPTIONS[0];
  const filter = PHOTO_FILTERS.find((f) => f.id === filterId) || PHOTO_FILTERS[0];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not create 2D canvas context');

  // Load all images first
  const loadedImages: HTMLImageElement[] = [];
  const activePhotos = photos.slice(0, photoCount);
  for (const p of activePhotos) {
    try {
      const img = await loadImage(p);
      loadedImages.push(img);
    } catch {
      // Create empty fallback
      const fallback = new Image();
      loadedImages.push(fallback);
    }
  }

  // Determine Canvas Dimensions
  let width = 1200;
  let height = photoCount === 3 ? 3400 : 4200;

  if (layout === 'grid-2x2') {
    width = 2000;
    height = 2400;
  }

  canvas.width = width;
  canvas.height = height;

  // 1. Draw Background
  drawPatternBackground(ctx, width, height, frame);

  // 2. Draw Header / Top Accents
  ctx.save();
  ctx.fillStyle = frame.textColor;
  ctx.globalAlpha = 0.5;
  ctx.font = `600 24px 'Outfit', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('• SNAPSTRIP PHOTO STUDIO •', width / 2, 54);
  ctx.restore();

  // 3. Draw Photos
  const photoMarginX = layout === 'grid-2x2' ? 60 : 70;
  const photoMarginTop = 80;
  const footerHeight = layout === 'grid-2x2' ? 360 : 480;

  if (layout === 'vertical-strip') {
    const availableHeight = height - photoMarginTop - footerHeight;
    const gap = 36;
    const photoHeight = Math.floor((availableHeight - gap * (photoCount - 1)) / photoCount);
    const photoWidth = width - photoMarginX * 2;

    for (let i = 0; i < photoCount; i++) {
      const y = photoMarginTop + i * (photoHeight + gap);
      const img = loadedImages[i];

      // Draw photo container border / card shadow
      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      
      const cornerRadius = 14;
      ctx.beginPath();
      ctx.roundRect(photoMarginX, y, photoWidth, photoHeight, cornerRadius);
      ctx.clip();

      if (img && img.width > 0) {
        // Apply filter to image draw
        if (filter.cssFilter && filter.cssFilter !== 'none') {
          ctx.filter = filter.cssFilter;
        }

        // Cover fill aspect ratio
        const imgAspect = img.width / img.height;
        const targetAspect = photoWidth / photoHeight;
        let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

        if (imgAspect > targetAspect) {
          sWidth = img.height * targetAspect;
          sx = (img.width - sWidth) / 2;
        } else {
          sHeight = img.width / targetAspect;
          sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, photoMarginX, y, photoWidth, photoHeight);
      } else {
        ctx.fillStyle = '#262626';
        ctx.fillRect(photoMarginX, y, photoWidth, photoHeight);
      }
      ctx.restore();

      // Subtle photo inner border for clean cut look
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(photoMarginX, y, photoWidth, photoHeight, cornerRadius);
      ctx.stroke();
      ctx.restore();
    }
  } else {
    // 2x2 Grid Layout
    const gap = 36;
    const cols = 2;
    const rows = 2;
    const availableWidth = width - photoMarginX * 2;
    const cellWidth = Math.floor((availableWidth - gap) / cols);
    const availableHeight = height - photoMarginTop - footerHeight;
    const cellHeight = Math.floor((availableHeight - gap) / rows);
    const cornerRadius = 16;

    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = photoMarginX + col * (cellWidth + gap);
      const y = photoMarginTop + row * (cellHeight + gap);
      const img = loadedImages[i];

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.beginPath();
      ctx.roundRect(x, y, cellWidth, cellHeight, cornerRadius);
      ctx.clip();

      if (img && img.width > 0) {
        if (filter.cssFilter && filter.cssFilter !== 'none') {
          ctx.filter = filter.cssFilter;
        }
        const imgAspect = img.width / img.height;
        const targetAspect = cellWidth / cellHeight;
        let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

        if (imgAspect > targetAspect) {
          sWidth = img.height * targetAspect;
          sx = (img.width - sWidth) / 2;
        } else {
          sHeight = img.width / targetAspect;
          sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, cellWidth, cellHeight);
      } else {
        ctx.fillStyle = '#262626';
        ctx.fillRect(x, y, cellWidth, cellHeight);
      }
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(x, y, cellWidth, cellHeight, cornerRadius);
      ctx.stroke();
      ctx.restore();
    }
  }

  // 4. Draw Footer Content (Custom text, date, decorative barcode / watermark)
  const footerStartY = height - footerHeight + 20;

  ctx.save();
  ctx.fillStyle = frame.textColor;

  // Custom Main Message
  if (customText.trim()) {
    const fontSize = layout === 'grid-2x2' ? 76 : 64;
    ctx.font = getCanvasFont(fontFamily, fontSize, 'bold');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(customText.trim(), width / 2, footerStartY + 100);
  }

  // Date Tag
  if (showDate && customDate) {
    const dateFontSize = layout === 'grid-2x2' ? 36 : 32;
    ctx.font = `600 ${dateFontSize}px 'Space Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.85;
    ctx.fillText(customDate, width / 2, footerStartY + 180);
  }

  // Stylized Barcode and Authentic Photobooth Stamp
  const barcodeY = footerStartY + (layout === 'grid-2x2' ? 240 : 260);
  drawStylizedBarcode(ctx, width / 2, barcodeY, frame.textColor);

  // Bottom tiny serial
  ctx.globalAlpha = 0.55;
  ctx.font = `500 22px 'Space Mono', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('MEMORIES NEVER FADE • SNAPSTRIP 2026', width / 2, barcodeY + 70);
  ctx.restore();

  // 5. Draw Stickers on top of everything!
  // Normalized percentage coordinate mapping
  for (const sticker of stickers) {
    const stickerX = (sticker.x / 100) * width;
    const stickerY = (sticker.y / 100) * height;

    ctx.save();
    ctx.translate(stickerX, stickerY);
    ctx.rotate((sticker.rotation * Math.PI) / 180);

    if (sticker.type === 'emoji') {
      const baseSize = 120 * sticker.scale;
      ctx.font = `${baseSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker.content, 0, 0);
    } else {
      // Stamp text badge
      const baseScale = sticker.scale;
      ctx.font = `bold ${Math.round(44 * baseScale)}px 'Outfit', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textMetrics = ctx.measureText(sticker.content);
      const paddingX = 32 * baseScale;
      const paddingY = 16 * baseScale;
      const boxWidth = textMetrics.width + paddingX * 2;
      const boxHeight = 64 * baseScale;

      // Stamp background
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
      ctx.beginPath();
      ctx.roundRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 12 * baseScale);
      ctx.fill();

      // Stamp border
      ctx.strokeStyle = '#e11d48'; // Rose accent
      ctx.lineWidth = 4 * baseScale;
      ctx.stroke();

      // Stamp text
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#e11d48';
      ctx.fillText(sticker.content, 0, 2);
    }

    ctx.restore();
  }

  return canvas;
}

/**
 * Helper to draw a decorative mini barcode
 */
function drawStylizedBarcode(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.75;
  const barWidths = [3, 6, 2, 8, 4, 2, 7, 3, 5, 2, 8, 3, 4, 7, 2, 5, 3, 8, 2, 4, 6, 3];
  const barHeight = 36;
  const totalWidth = barWidths.reduce((a, b) => a + b + 3, 0);
  let curX = centerX - totalWidth / 2;

  for (const bw of barWidths) {
    ctx.fillRect(curX, y, bw, barHeight);
    curX += bw + 3;
  }
  ctx.restore();
}

/**
 * Triggers high quality download of canvas as PNG
 */
export async function downloadPhotoStrip(
  canvas: HTMLCanvasElement,
  filename: string = 'snapstrip-photobooth.png',
  format: 'image/png' | 'image/jpeg' = 'image/png'
) {
  const dataUrl = canvas.toDataURL(format, 0.95);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies canvas image to clipboard if supported
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve(true);
        } catch {
          resolve(false);
        }
      }, 'image/png');
    });
  } catch {
    return false;
  }
}

/**
 * Creates an optimized Base64 JPEG dataURL suitable for LocalStorage persistence.
 * Scales dimension so that each strip is ~150KB-250KB, ensuring 5 items safely
 * fit within browser quotas without noticeable visual degradation.
 */
export function createOptimizedDataUrl(canvas: HTMLCanvasElement): string {
  try {
    const maxDim = 1200;
    const currentMax = Math.max(canvas.width, canvas.height);
    const scale = Math.min(1, maxDim / currentMax);
    const targetWidth = Math.round(canvas.width * scale);
    const targetHeight = Math.round(canvas.height * scale);

    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = targetWidth;
    scaledCanvas.height = targetHeight;
    const ctx = scaledCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
      return scaledCanvas.toDataURL('image/jpeg', 0.85);
    }
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch (err) {
    console.error('Failed to create optimized data URL:', err);
    return canvas.toDataURL('image/jpeg', 0.8);
  }
}

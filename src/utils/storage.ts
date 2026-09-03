import { SavedStripItem } from '../types';

export const STORAGE_KEY = 'snapstrip_history_v1';
export const MAX_HISTORY_ITEMS = 5;

/**
 * Loads saved photo strips from localStorage
 */
export function loadSavedStrips(): SavedStripItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, MAX_HISTORY_ITEMS);
    }
    return [];
  } catch (err) {
    console.error('Failed to load photobooth history from localStorage:', err);
    return [];
  }
}

/**
 * Saves a new photo strip dataURL to localStorage, limiting to 5 items.
 * Implements fallback trimming in case quota limits are encountered.
 */
export function saveStripToStorage(
  dataUrl: string,
  title?: string,
  layout?: string,
  photoCount?: number
): SavedStripItem[] {
  try {
    const current = loadSavedStrips();

    const newItem: SavedStripItem = {
      id: `strip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dataUrl,
      createdAt: new Date().toISOString(),
      title: title?.trim() || 'SnapStrip Photobooth',
      layout: (layout as any) || 'vertical-strip',
      photoCount: (photoCount as any) || 4,
    };

    // Keep only the most recent MAX_HISTORY_ITEMS (max 5)
    const updated = [newItem, ...current].slice(0, MAX_HISTORY_ITEMS);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (quotaError) {
      console.warn('LocalStorage quota warning, trimming older items...', quotaError);
      // Attempt saving with fewer items if quota exceeded
      const reduced = [newItem, ...current.slice(0, Math.min(2, current.length))];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
        return reduced;
      } catch (innerError) {
        console.error('Failed to store even reduced photo strip:', innerError);
        return current;
      }
    }
  } catch (err) {
    console.error('Unexpected error saving to storage:', err);
    return loadSavedStrips();
  }
}

/**
 * Removes a single strip by ID from localStorage
 */
export function deleteStripFromStorage(id: string): SavedStripItem[] {
  try {
    const current = loadSavedStrips();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete item from storage:', err);
    return loadSavedStrips();
  }
}

/**
 * Clears all saved photobooth history from localStorage
 */
export function clearAllStorageStrips(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear storage:', err);
  }
}

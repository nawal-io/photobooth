import React, { useState } from 'react';
import { FilterType, PhotoCount, SavedStripItem, LayoutType } from './types';
import { Navbar } from './components/Navbar';
import { CameraView } from './components/CameraView';
import { StripEditor } from './components/StripEditor';
import { HistoryGallery } from './components/HistoryGallery';
import {
  loadSavedStrips,
  saveStripToStorage,
  deleteStripFromStorage,
  clearAllStorageStrips,
} from './utils/storage';
import { sounds } from './utils/audio';

export default function App() {
  const [currentStep, setCurrentStep] = useState<'camera' | 'edit' | 'gallery'>('camera');
  const [photos, setPhotos] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterType>('normal');
  const [photoCount, setPhotoCount] = useState<PhotoCount>(4);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Automatically loads saved strips from LocalStorage on mount/refresh (Max 5 items)
  const [savedStrips, setSavedStrips] = useState<SavedStripItem[]>(() => loadSavedStrips());

  // Toggle audio effects
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.enabled = nextState;
  };

  // Called when camera captures all 3 or 4 shots
  const handleCaptureComplete = (
    capturedPhotos: string[],
    chosenFilter: FilterType,
    count: PhotoCount
  ) => {
    setPhotos(capturedPhotos);
    setFilter(chosenFilter);
    setPhotoCount(count);
    setCurrentStep('edit');
  };

  // Retake all photos / start fresh
  const handleRetake = () => {
    setPhotos([]);
    setCurrentStep('camera');
  };

  // Save photobooth strip to LocalStorage (limits to 5 items)
  const handleSaveToHistory = (
    dataUrl: string,
    title?: string,
    layout?: LayoutType,
    count?: PhotoCount
  ) => {
    const updated = saveStripToStorage(dataUrl, title, layout, count);
    setSavedStrips(updated);
  };

  // Delete a single strip from LocalStorage
  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteStripFromStorage(id);
    setSavedStrips(updated);
  };

  // Clear all strips from LocalStorage
  const handleClearAllHistory = () => {
    clearAllStorageStrips();
    setSavedStrips([]);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] flex flex-col font-outfit selection:bg-[#00f0ff] selection:text-neutral-950">
      {/* Top Navbar */}
      <Navbar
        currentStep={currentStep}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onReset={photos.length > 0 ? handleRetake : undefined}
        hasPhotos={photos.length > 0}
        savedCount={savedStrips.length}
        onNavigate={setCurrentStep}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {currentStep === 'camera' && (
          <CameraView
            onCaptureComplete={handleCaptureComplete}
            selectedFilter={filter}
            onFilterChange={setFilter}
            photoCount={photoCount}
            onPhotoCountChange={setPhotoCount}
          />
        )}

        {currentStep === 'edit' && (
          <StripEditor
            photos={photos}
            filter={filter}
            photoCount={photoCount}
            onFilterChange={setFilter}
            onRetake={handleRetake}
            onSaveToHistory={handleSaveToHistory}
            onViewGallery={() => setCurrentStep('gallery')}
          />
        )}

        {currentStep === 'gallery' && (
          <HistoryGallery
            items={savedStrips}
            onDelete={handleDeleteHistoryItem}
            onClearAll={handleClearAllHistory}
            onStartNewSession={() => setCurrentStep('camera')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-900/80 bg-[#080808] py-4 px-6 text-center text-xs text-neutral-500">
        <p className="flex items-center justify-center gap-2">
          <span>SnapStrip Photobooth &copy; {new Date().getFullYear()}</span>
          <span className="text-neutral-700">•</span>
          <span className="text-cyan-500/80 font-mono text-[11px]">ELEGANT DARK STUDIO</span>
        </p>
      </footer>
    </div>
  );
}

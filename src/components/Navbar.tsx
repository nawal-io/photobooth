import React from 'react';
import { Camera, Sparkles, Volume2, VolumeX, RotateCcw, Download, Images } from 'lucide-react';
import { sounds } from '../utils/audio';

interface NavbarProps {
  currentStep: 'camera' | 'edit' | 'gallery';
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset?: () => void;
  onQuickDownload?: () => void;
  hasPhotos: boolean;
  savedCount: number;
  onNavigate: (step: 'camera' | 'edit' | 'gallery') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  soundEnabled,
  onToggleSound,
  onReset,
  onQuickDownload,
  hasPhotos,
  savedCount,
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-[#0a0a0a]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <button
          onClick={() => onNavigate('camera')}
          className="flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-outfit text-lg font-bold tracking-tight text-white">
                SnapStrip
              </span>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider text-cyan-300">
                PHOTOBOOTH
              </span>
            </div>
            <p className="hidden text-xs text-neutral-400 sm:block">
              Retro Photobooth Studio Experience
            </p>
          </div>
        </button>

        {/* Step Navigation Tabs */}
        <div className="hidden md:flex items-center gap-1 rounded-full border border-neutral-800 bg-[#0e0e0e] p-1 shadow-inner">
          <button
            onClick={() => onNavigate('camera')}
            className={`flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              currentStep === 'camera'
                ? 'bg-[#00f0ff] text-neutral-950 shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Kamera</span>
          </button>

          <button
            onClick={() => hasPhotos && onNavigate('edit')}
            disabled={!hasPhotos}
            className={`flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              currentStep === 'edit'
                ? 'bg-[#00f0ff] text-neutral-950 shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                : hasPhotos
                ? 'text-neutral-400 hover:text-neutral-200'
                : 'text-neutral-600 cursor-not-allowed'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Editor Strip</span>
          </button>

          <button
            onClick={() => onNavigate('gallery')}
            className={`flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              currentStep === 'gallery'
                ? 'bg-[#00f0ff] text-neutral-950 shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Images className="h-3.5 w-3.5" />
            <span>Galeri Riwayat</span>
            {savedCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                  currentStep === 'gallery'
                    ? 'bg-neutral-950 text-cyan-300'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                {savedCount}
              </span>
            )}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile Galeri Button */}
          <button
            onClick={() => onNavigate(currentStep === 'gallery' ? 'camera' : 'gallery')}
            className={`flex md:hidden items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              currentStep === 'gallery'
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                : 'border-neutral-800 bg-[#111111] text-neutral-300'
            }`}
          >
            <Images className="h-3.5 w-3.5 text-cyan-400" />
            <span>Galeri</span>
            {savedCount > 0 && (
              <span className="rounded-full bg-cyan-500/20 text-cyan-300 px-1.5 text-[10px]">
                {savedCount}
              </span>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              if (!soundEnabled) sounds.playPop();
            }}
            title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-[#111111] text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-cyan-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-neutral-500" />
            )}
          </button>

          {/* Quick Retake when in edit mode */}
          {hasPhotos && onReset && currentStep === 'edit' && (
            <button
              onClick={onReset}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-[#111111] px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:border-neutral-700 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
              <span>Foto Ulang</span>
            </button>
          )}

          {/* Quick Download if in edit mode */}
          {currentStep === 'edit' && onQuickDownload && (
            <button
              onClick={onQuickDownload}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-500 px-3.5 py-1.5 text-xs font-bold text-neutral-950 shadow-sm shadow-cyan-500/30 transition hover:brightness-110 active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

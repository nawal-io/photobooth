import React, { useState, useRef, useId } from 'react';
import confetti from 'canvas-confetti';
import {
  Download,
  RotateCcw,
  Sparkles,
  Palette,
  Smile,
  Type,
  Copy,
  Check,
  Layers,
  Trash2,
  Share2,
  Calendar,
  Eye,
  Camera,
  BookmarkCheck,
  Images,
} from 'lucide-react';
import {
  FilterType,
  FontFamilyType,
  LayoutType,
  PhotoCount,
  PlacedSticker,
} from '../types';
import {
  FRAME_OPTIONS,
  PHOTO_FILTERS,
  STICKER_PALETTE,
  FONT_OPTIONS,
} from '../utils/constants';
import { StickerItem } from './StickerItem';
import {
  renderPhotoboothCanvas,
  downloadPhotoStrip,
  copyCanvasToClipboard,
  createOptimizedDataUrl,
} from '../utils/canvasExport';
import { sounds } from '../utils/audio';

interface StripEditorProps {
  photos: string[];
  filter: FilterType;
  photoCount: PhotoCount;
  onFilterChange: (f: FilterType) => void;
  onRetake: () => void;
  onSaveToHistory?: (dataUrl: string, title?: string, layout?: LayoutType, photoCount?: PhotoCount) => void;
  onViewGallery?: () => void;
}

export const StripEditor: React.FC<StripEditorProps> = ({
  photos,
  filter,
  photoCount,
  onFilterChange,
  onRetake,
  onSaveToHistory,
  onViewGallery,
}) => {
  // Strip Customization States
  const [frameId, setFrameId] = useState<string>('white');
  const [layout, setLayout] = useState<LayoutType>('vertical-strip');
  const [customText, setCustomText] = useState<string>('SNAPSTRIP MOMENTS');
  const [customDate, setCustomDate] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  });
  const [showDate, setShowDate] = useState<boolean>(true);
  const [fontFamily, setFontFamily] = useState<FontFamilyType>('outfit');

  // Interactive Stickers State
  const [stickers, setStickers] = useState<PlacedSticker[]>([
    {
      id: 'st-1',
      content: '✨',
      type: 'emoji',
      x: 82,
      y: 12,
      scale: 1.1,
      rotation: 12,
    },
    {
      id: 'st-2',
      content: '❤️',
      type: 'emoji',
      x: 18,
      y: 42,
      scale: 1.0,
      rotation: -8,
    },
  ]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // Active Tab for Sidebar
  const [activeTab, setActiveTab] = useState<'frame' | 'stickers' | 'text' | 'filter' | 'layout'>('frame');

  // Export Loading States
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [showRetakeConfirm, setShowRetakeConfirm] = useState<boolean>(false);
  const [savedToGalleryNotice, setSavedToGalleryNotice] = useState<boolean>(false);

  const stripContainerRef = useRef<HTMLDivElement | null>(null);

  const currentFrame = FRAME_OPTIONS.find((f) => f.id === frameId) || FRAME_OPTIONS[0];
  const currentFilterObj = PHOTO_FILTERS.find((f) => f.id === filter) || PHOTO_FILTERS[0];

  // Manual save to LocalStorage gallery
  const handleSaveToGalleryOnly = async () => {
    setIsExporting(true);
    try {
      const canvas = await renderPhotoboothCanvas({
        photos,
        filterId: filter,
        frameId,
        layout,
        photoCount,
        customText,
        customDate,
        showDate,
        fontFamily,
        textColor: currentFrame.textColor,
        stickers,
      });

      const dataUrl = createOptimizedDataUrl(canvas);
      if (onSaveToHistory) {
        onSaveToHistory(dataUrl, customText, layout, photoCount);
      }
      sounds.playPop();
      setSavedToGalleryNotice(true);
      setTimeout(() => setSavedToGalleryNotice(false), 3500);
    } catch (err) {
      console.error('Failed to save to gallery:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Add sticker handler
  const handleAddSticker = (content: string, type: 'emoji' | 'stamp') => {
    sounds.playPop();
    const newSticker: PlacedSticker = {
      id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      content,
      type,
      x: 50,
      y: 35 + Math.random() * 25,
      scale: 1.1,
      rotation: (Math.random() - 0.5) * 20,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleUpdateSticker = (updated: PlacedSticker) => {
    setStickers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSticker = (id: string) => {
    sounds.playPop();
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  // Download Action
  const handleDownload = async (format: 'image/png' | 'image/jpeg' = 'image/png') => {
    setIsExporting(true);
    try {
      const canvas = await renderPhotoboothCanvas({
        photos,
        filterId: filter,
        frameId,
        layout,
        photoCount,
        customText,
        customDate,
        showDate,
        fontFamily,
        textColor: currentFrame.textColor,
        stickers,
      });

      // 1. Auto-save to LocalStorage history
      try {
        const storageDataUrl = createOptimizedDataUrl(canvas);
        if (onSaveToHistory) {
          onSaveToHistory(storageDataUrl, customText, layout, photoCount);
        }
        setSavedToGalleryNotice(true);
        setTimeout(() => setSavedToGalleryNotice(false), 4000);
      } catch (saveErr) {
        console.warn('Auto-save to history failed:', saveErr);
      }

      // 2. Trigger browser file download
      const filename = `snapstrip-${Date.now()}.${format === 'image/png' ? 'png' : 'jpg'}`;
      await downloadPhotoStrip(canvas, filename, format);

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#38bdf8', '#fbbf24', '#ffffff'],
      });
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy to Clipboard Action
  const handleCopy = async () => {
    setIsExporting(true);
    try {
      const canvas = await renderPhotoboothCanvas({
        photos,
        filterId: filter,
        frameId,
        layout,
        photoCount,
        customText,
        customDate,
        showDate,
        fontFamily,
        textColor: currentFrame.textColor,
        stickers,
      });

      const success = await copyCanvasToClipboard(canvas);
      if (success) {
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Clipboard copy error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="w-full max-w-7xl mx-auto px-4 py-6"
      onClick={() => setSelectedStickerId(null)}
    >
      {/* Retake Confirmation Dialog */}
      {showRetakeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div
            className="w-full max-w-sm rounded-2xl bg-[#0e0e0e] border border-neutral-800 p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-12 w-12 rounded-full bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center mb-3 border border-cyan-500/20">
              <Camera className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Mulai Ulang Sesi Foto?</h3>
            <p className="text-xs text-neutral-400 mb-5">
              Foto saat ini dan dekorasi stiker yang belum diunduh akan terhapus.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowRetakeConfirm(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowRetakeConfirm(false);
                  onRetake();
                }}
                className="rounded-xl px-4 py-2 text-xs font-bold text-neutral-950 bg-[#00f0ff] hover:brightness-110 shadow-md shadow-cyan-500/30 transition"
              >
                Ya, Foto Ulang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Strip Preview (Left/Center) + Customization Studio (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Photobooth Strip Live Preview Stage */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-center">
          <div className="flex items-center justify-between w-full max-w-sm mb-2 px-1 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 font-medium font-mono">
              <Eye className="h-3.5 w-3.5 text-cyan-400" />
              Preview Photobooth
            </span>
            <span className="text-[11px] text-neutral-500">
              *Tarik stiker langsung di atas foto
            </span>
          </div>

          {/* Realistic Paper Strip Container */}
          <div className="relative w-full flex justify-center py-2">
            <div
              ref={stripContainerRef}
              id="photobooth-strip-container"
              style={{
                backgroundColor: currentFrame.hexCode,
                color: currentFrame.textColor,
              }}
              className={`relative select-none shadow-2xl transition-colors duration-300 ${
                currentFrame.bgClass
              } ${
                layout === 'vertical-strip'
                  ? 'w-[300px] sm:w-[340px] px-4 pt-5 pb-6 rounded-2xl'
                  : 'w-[320px] sm:w-[400px] p-4 pb-6 rounded-2xl'
              }`}
            >
              {/* Subtle vintage paper inner header */}
              <div className="text-center mb-3">
                <span className="text-[10px] uppercase font-mono tracking-widest opacity-60 font-bold">
                  • SNAPSTRIP PHOTO STUDIO •
                </span>
              </div>

              {/* Photos Layout */}
              {layout === 'vertical-strip' ? (
                /* Vertical 3 or 4 cut photobooth strip */
                <div className="flex flex-col gap-3">
                  {photos.slice(0, photoCount).map((p, idx) => (
                    <div
                      key={idx}
                      className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-inner bg-black/10 border border-black/10"
                    >
                      <img
                        src={p}
                        alt={`Cut ${idx + 1}`}
                        style={{ filter: currentFilterObj.cssFilter }}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                /* 2x2 Grid Layout */
                <div className="grid grid-cols-2 gap-2.5">
                  {photos.slice(0, 4).map((p, idx) => (
                    <div
                      key={idx}
                      className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-inner bg-black/10 border border-black/10"
                    >
                      <img
                        src={p}
                        alt={`Grid ${idx + 1}`}
                        style={{ filter: currentFilterObj.cssFilter }}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Interactive Sticker Overlay Layer */}
              <div className="absolute inset-0 pointer-events-auto overflow-hidden rounded-2xl">
                {stickers.map((st) => (
                  <StickerItem
                    key={st.id}
                    sticker={st}
                    isSelected={selectedStickerId === st.id}
                    onSelect={() => setSelectedStickerId(st.id)}
                    onUpdate={handleUpdateSticker}
                    onDelete={() => handleDeleteSticker(st.id)}
                    containerRef={stripContainerRef}
                  />
                ))}
              </div>

              {/* Photobooth Footer */}
              <div className="mt-5 text-center flex flex-col items-center">
                {customText.trim() && (
                  <p
                    className={`font-bold tracking-tight text-lg sm:text-xl leading-tight ${
                      fontFamily === 'caveat'
                        ? 'font-caveat text-2xl'
                        : fontFamily === 'playfair'
                        ? 'font-playfair italic'
                        : fontFamily === 'spacemono'
                        ? 'font-mono-retro text-sm uppercase tracking-widest'
                        : 'font-outfit'
                    }`}
                  >
                    {customText}
                  </p>
                )}

                {showDate && customDate && (
                  <p className="mt-1 font-mono-retro text-[11px] font-medium opacity-80 tracking-wide">
                    {customDate}
                  </p>
                )}

                {/* Decorative Mini Barcode */}
                <div className="mt-3 flex items-center justify-center gap-1 opacity-70">
                  <span className="inline-block h-5 w-1 bg-current" />
                  <span className="inline-block h-5 w-1.5 bg-current" />
                  <span className="inline-block h-5 w-0.5 bg-current" />
                  <span className="inline-block h-5 w-2 bg-current" />
                  <span className="inline-block h-5 w-1 bg-current" />
                  <span className="inline-block h-5 w-0.5 bg-current" />
                  <span className="inline-block h-5 w-1.5 bg-current" />
                  <span className="inline-block h-5 w-2 bg-current" />
                  <span className="inline-block h-5 w-0.5 bg-current" />
                  <span className="inline-block h-5 w-1 bg-current" />
                </div>
                <span className="text-[9px] font-mono-retro tracking-widest opacity-60 mt-1">
                  SNAPSTRIP 2026 #MEMORIES
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Bar under strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <button
              onClick={() => setShowRetakeConfirm(true)}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-[#111111] px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:border-neutral-700 hover:text-white transition"
            >
              <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
              Foto Ulang
            </button>
            <button
              onClick={handleCopy}
              disabled={isExporting}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-[#111111] px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:border-neutral-700 hover:text-white transition"
            >
              {copiedSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-cyan-400 font-bold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-neutral-400" />
                  Salin Gambar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Customization Controls Panel */}
        <div className="lg:col-span-6 xl:col-span-7 bg-[#0e0e0e]/95 border border-neutral-800/80 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-5 backdrop-blur-md">
          
          {/* Tabs Navigation */}
          <div className="flex items-center gap-1.5 border-b border-neutral-800/80 pb-3 overflow-x-auto scrollbar-none no-scrollbar">
            <button
              onClick={() => setActiveTab('frame')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'frame'
                  ? 'bg-[#00f0ff] text-neutral-950 shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              Warna & Frame
            </button>

            <button
              onClick={() => setActiveTab('stickers')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'stickers'
                  ? 'bg-[#00f0ff] text-neutral-950 shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
              }`}
            >
              <Smile className="h-3.5 w-3.5" />
              Stiker & Cap ({stickers.length})
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'text'
                  ? 'bg-[#00f0ff] text-neutral-950 shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
              }`}
            >
              <Type className="h-3.5 w-3.5" />
              Teks & Tanggal
            </button>

            <button
              onClick={() => setActiveTab('filter')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'filter'
                  ? 'bg-[#00f0ff] text-neutral-950 shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Filter ({currentFilterObj.name})
            </button>

            <button
              onClick={() => setActiveTab('layout')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'layout'
                  ? 'bg-[#00f0ff] text-neutral-950 shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Tata Letak
            </button>
          </div>

          {/* Tab Content: 1. Frame & Background */}
          {activeTab === 'frame' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Pilih Warna Frame / Background Strip
                </span>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Tersedia pilihan warna netral, pastel lembut, neon pop, dan pattern retro.
                </p>
              </div>

              {/* Grouped Frames */}
              {(['classic', 'pastel', 'neon', 'pattern'] as const).map((cat) => {
                const framesInCat = FRAME_OPTIONS.filter((f) => f.category === cat);
                const titleMap = {
                  classic: 'Klasik & Netral',
                  pastel: 'Warna Pastel Hangat',
                  neon: 'Neon & Cyberpunk',
                  pattern: 'Pattern & Tekstur Unik',
                };

                return (
                  <div key={cat} className="flex flex-col gap-2">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
                      {titleMap[cat]}
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {framesInCat.map((fr) => {
                        const isSelected = frameId === fr.id;
                        return (
                          <button
                            key={fr.id}
                            onClick={() => {
                              setFrameId(fr.id);
                              sounds.playPop();
                            }}
                            className={`flex items-center gap-2 rounded-xl p-2 border text-left transition-all ${
                              isSelected
                                ? 'border-cyan-400 bg-[#161616] ring-2 ring-cyan-400/40'
                                : 'border-neutral-800 bg-[#111111] hover:border-neutral-700'
                            }`}
                          >
                            <span
                              style={{ backgroundColor: fr.hexCode }}
                              className={`h-6 w-6 rounded-lg border border-neutral-700/60 shadow-sm flex-shrink-0 ${
                                fr.isPattern ? fr.bgClass : ''
                              }`}
                            />
                            <div className="overflow-hidden">
                              <p className="text-xs font-semibold text-white truncate">
                                {fr.name}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab Content: 2. Stickers & Stamps */}
          {activeTab === 'stickers' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Stiker & Emoji Interaktif
                  </span>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Klik stiker untuk menambahkannya ke strip, lalu geser atau ubah ukurannya.
                  </p>
                </div>
                {stickers.length > 0 && (
                  <button
                    onClick={() => {
                      setStickers([]);
                      setSelectedStickerId(null);
                    }}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition font-mono"
                  >
                    <Trash2 className="h-3 w-3" />
                    Hapus Semua
                  </button>
                )}
              </div>

              {/* Photobooth Stamps */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-2 block font-mono">
                  Cap Kata Retro (Stamps)
                </span>
                <div className="flex flex-wrap gap-2">
                  {STICKER_PALETTE.stamps.map((stamp) => (
                    <button
                      key={stamp}
                      onClick={() => handleAddSticker(stamp, 'stamp')}
                      className="rounded-lg bg-[#141414] border border-neutral-800 px-3 py-1.5 text-xs font-bold text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/40 hover:text-cyan-300 transition hover:scale-105 font-mono shadow-sm"
                    >
                      + {stamp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Emojis */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-2 block font-mono">
                  Emoji Photobooth
                </span>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 bg-[#080808] p-3 rounded-2xl border border-neutral-800/80 max-h-56 overflow-y-auto">
                  {STICKER_PALETTE.emojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddSticker(emoji, 'emoji')}
                      className="h-10 w-10 flex items-center justify-center text-2xl hover:scale-125 transition-transform rounded-xl hover:bg-neutral-800/80 active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: 3. Text & Date Customization */}
          {activeTab === 'text' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Teks Kustom & Tanggal
                </span>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Tambahkan judul acara, nama teman, atau tanggal kenangan di bawah strip.
                </p>
              </div>

              {/* Caption Text Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-300 font-mono">
                  Pesan / Judul Strip:
                </label>
                <input
                  type="text"
                  maxLength={36}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Misal: SNAP MOMENT 2026"
                  className="rounded-xl border border-neutral-800 bg-[#080808] px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 focus:outline-none"
                />
              </div>

              {/* Date settings */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 font-mono">
                    <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                    Tampilkan Tanggal:
                  </label>
                  <button
                    onClick={() => setShowDate((d) => !d)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showDate ? 'bg-[#00f0ff]' : 'bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-neutral-950 transition-transform ${
                        showDate ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {showDate && (
                  <input
                    type="text"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    placeholder="Contoh: 03 Sep 2026"
                    className="rounded-xl border border-neutral-800 bg-[#080808] px-4 py-2 text-xs text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 focus:outline-none font-mono"
                  />
                )}
              </div>

              {/* Typography / Font Style Switcher */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-300 font-mono">
                  Gaya Font:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {FONT_OPTIONS.map((f) => {
                    const isSelected = fontFamily === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          setFontFamily(f.id);
                          sounds.playPop();
                        }}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-cyan-400 bg-[#161616] ring-1 ring-cyan-400/50'
                            : 'border-neutral-800 bg-[#080808] hover:border-neutral-700'
                        }`}
                      >
                        <p className="text-[11px] text-neutral-400 font-medium">
                          {f.name}
                        </p>
                        <p className={`mt-1 text-base text-white ${f.className}`}>
                          {customText.trim() || f.preview}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: 4. Filters */}
          {activeTab === 'filter' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Ubah Filter Foto
                </span>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Sesuaikan tone warna seluruh foto dalam strip secara instan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PHOTO_FILTERS.map((f) => {
                  const isSelected = filter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        onFilterChange(f.id);
                        sounds.playPop();
                      }}
                      className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-400/40'
                          : 'border-neutral-800 bg-[#080808] hover:border-neutral-700'
                      }`}
                    >
                      <span
                        className="h-7 w-7 rounded-lg border border-neutral-700 flex-shrink-0 mt-0.5"
                        style={{
                          background:
                            f.id === 'grayscale'
                              ? '#737373'
                              : f.id === 'sepia'
                              ? '#d97706'
                              : f.id === 'vintage'
                              ? '#f59e0b'
                              : f.id === 'cyberpunk'
                              ? '#06b6d4'
                              : f.id === 'warm'
                              ? '#fbbf24'
                              : f.id === 'filmnoir'
                              ? '#171717'
                              : '#e11d48',
                        }}
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{f.name}</p>
                        <p className="text-[11px] text-neutral-400">{f.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Content: 5. Layout */}
          {activeTab === 'layout' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Pilihan Tata Letak (Layout)
                </span>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Pilih bentuk strip vertikal otentik atau grid 2x2.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setLayout('vertical-strip');
                    sounds.playPop();
                  }}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                    layout === 'vertical-strip'
                      ? 'border-cyan-400 bg-[#161616] ring-2 ring-cyan-400/40'
                      : 'border-neutral-800 bg-[#080808] hover:border-neutral-700'
                  }`}
                >
                  {/* Icon illustration */}
                  <div className="flex flex-col gap-1 w-10 h-16 bg-[#111111] border border-neutral-700 rounded p-1">
                    <div className="h-3 bg-cyan-400/40 rounded-sm" />
                    <div className="h-3 bg-cyan-400/40 rounded-sm" />
                    <div className="h-3 bg-cyan-400/40 rounded-sm" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Strip Vertikal</p>
                    <p className="text-[10px] text-neutral-400">Khas Photobooth Klasik</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setLayout('grid-2x2');
                    sounds.playPop();
                  }}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                    layout === 'grid-2x2'
                      ? 'border-cyan-400 bg-[#161616] ring-2 ring-cyan-400/40'
                      : 'border-neutral-800 bg-[#080808] hover:border-neutral-700'
                  }`}
                >
                  {/* Icon illustration */}
                  <div className="grid grid-cols-2 gap-1 w-14 h-14 bg-[#111111] border border-neutral-700 rounded p-1">
                    <div className="bg-cyan-400/40 rounded-sm" />
                    <div className="bg-cyan-400/40 rounded-sm" />
                    <div className="bg-cyan-400/40 rounded-sm" />
                    <div className="bg-cyan-400/40 rounded-sm" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Grid 2x2</p>
                    <p className="text-[10px] text-neutral-400">Format Kotak Modern</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Saved to Gallery Notification Banner */}
          {savedToGalleryNotice && (
            <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-xs text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)] animate-fadeIn">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="h-4 w-4 text-cyan-400" />
                <span>Foto strip berhasil tersimpan di Galeri Riwayat (LocalStorage)!</span>
              </div>
              {onViewGallery && (
                <button
                  onClick={onViewGallery}
                  className="flex items-center gap-1 font-bold text-white hover:underline underline-offset-2 ml-2"
                >
                  <Images className="h-3 w-3 text-cyan-400" />
                  Lihat Galeri
                </button>
              )}
            </div>
          )}

          {/* Bottom Main Download Actions */}
          <div className="mt-4 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleDownload('image/jpeg')}
                disabled={isExporting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-neutral-800 bg-[#161616] px-4 py-3 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 hover:border-neutral-700 transition"
              >
                Unduh JPG
              </button>

              <button
                onClick={handleSaveToGalleryOnly}
                disabled={isExporting}
                title="Simpan foto strip ini ke memori LocalStorage Galeri Riwayat"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition active:scale-95"
              >
                <BookmarkCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>Simpan ke Galeri</span>
              </button>
            </div>

            <button
              onClick={() => handleDownload('image/png')}
              disabled={isExporting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-teal-400 px-6 py-3 text-sm font-extrabold text-neutral-950 shadow-[0_0_25px_rgba(0,240,255,0.35)] hover:shadow-[0_0_35px_rgba(0,240,255,0.55)] hover:scale-[1.02] active:scale-[0.98] transition"
            >
              {isExporting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
                  <span>Merender & Menyimpan...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download Strip (PNG HD)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

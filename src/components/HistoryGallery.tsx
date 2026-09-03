import React, { useState } from 'react';
import {
  Download,
  Trash2,
  Camera,
  Calendar,
  Eye,
  X,
  AlertTriangle,
  Sparkles,
  Images,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { SavedStripItem } from '../types';
import { MAX_HISTORY_ITEMS } from '../utils/storage';
import { sounds } from '../utils/audio';

interface HistoryGalleryProps {
  items: SavedStripItem[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onStartNewSession: () => void;
}

export const HistoryGallery: React.FC<HistoryGalleryProps> = ({
  items,
  onDelete,
  onClearAll,
  onStartNewSession,
}) => {
  const [selectedPreview, setSelectedPreview] = useState<SavedStripItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Trigger brief floating feedback message
  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 2800);
  };

  // Re-download image from LocalStorage Base64 DataURL
  const handleDownload = (item: SavedStripItem) => {
    try {
      sounds.playShutter();
      const link = document.createElement('a');
      link.href = item.dataUrl;
      const dateTag = new Date(item.createdAt).toISOString().slice(0, 10);
      link.download = `snapstrip-gallery-${dateTag}-${Date.now().toString().slice(-4)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showFeedback('Foto berhasil diunduh ulang!');
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Confirm single item deletion
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      sounds.playPop();
      onDelete(itemToDelete);
      if (selectedPreview?.id === itemToDelete) {
        setSelectedPreview(null);
      }
      setItemToDelete(null);
      showFeedback('Foto dihapus dari riwayat.');
    }
  };

  // Confirm clear all
  const handleConfirmClearAll = () => {
    sounds.playPop();
    onClearAll();
    setSelectedPreview(null);
    setShowClearConfirm(false);
    showFeedback('Semua riwayat berhasil dibersihkan.');
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-cyan-500/40 bg-[#0a0a0a]/95 px-5 py-2.5 text-xs font-semibold text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.3)] backdrop-blur-md animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Delete Single Item Confirmation Dialog */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div
            className="w-full max-w-sm rounded-2xl bg-[#0e0e0e] border border-neutral-800 p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center mb-3 border border-red-500/20">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Hapus Foto dari Riwayat?</h3>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              Foto ini akan dihapus permanen dari memori LocalStorage browser Anda.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-700 transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-xl px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/30 transition"
              >
                Hapus Foto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div
            className="w-full max-w-sm rounded-2xl bg-[#0e0e0e] border border-neutral-800 p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center mb-3 border border-red-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Hapus Semua Riwayat?</h3>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              Semua {items.length} foto strip di LocalStorage akan dihapus bersih. Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-700 transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmClearAll}
                className="rounded-xl px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/30 transition"
              >
                Ya, Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-8 bg-[#0e0e0e]/90 border border-neutral-800/80 p-4 sm:p-6 rounded-3xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Images className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Galeri Riwayat
              </h1>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-mono font-bold text-cyan-300">
                {items.length} / {MAX_HISTORY_ITEMS} FOTO
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tersimpan otomatis di LocalStorage browser (Maks. 5 strip terbaru)
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          {items.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3.5 py-2 text-xs font-semibold text-red-300 transition hover:border-red-500/50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus Semua</span>
            </button>
          )}

          <button
            onClick={onStartNewSession}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-teal-400 px-4 py-2 text-xs font-bold text-neutral-950 shadow-md shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Foto Baru</span>
          </button>
        </div>
      </div>

      {/* Gallery Content */}
      {items.length === 0 ? (
        /* Empty State */
        <div className="w-full max-w-md py-16 px-6 text-center rounded-3xl border border-dashed border-neutral-800 bg-[#0a0a0a] flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-[#111111] border border-neutral-800 text-neutral-500 flex items-center justify-center mb-4">
            <Images className="h-8 w-8 text-cyan-500/50" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Belum Ada Riwayat Foto</h3>
          <p className="text-xs text-neutral-400 mb-6 leading-relaxed max-w-sm">
            Setiap kali Anda membuat atau mengunduh strip photobooth, foto akan otomatis tersimpan di
            sini hingga 5 foto terbaru.
          </p>
          <button
            onClick={onStartNewSession}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 px-5 py-2.5 text-xs font-bold text-neutral-950 shadow-lg shadow-cyan-500/30 hover:brightness-110 transition"
          >
            <Camera className="h-4 w-4" />
            <span>Mulai Foto Sekarang</span>
          </button>
        </div>
      ) : (
        /* Grid of Saved Photos */
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="group relative flex flex-col rounded-2xl border border-neutral-800 bg-[#0e0e0e] overflow-hidden shadow-lg hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all duration-200"
            >
              {/* Photo Index / Tag */}
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-0.5 border border-white/10 text-[10px] font-mono text-cyan-300">
                <span>#{index + 1}</span>
                {index === 0 && (
                  <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                    <Sparkles className="h-2.5 w-2.5" />
                    TERBARU
                  </span>
                )}
              </div>

              {/* Strip Image Container with Click-to-zoom */}
              <div
                onClick={() => setSelectedPreview(item)}
                className="relative cursor-pointer aspect-[1/2] w-full bg-[#050505] p-2 flex items-center justify-center overflow-hidden"
              >
                <img
                  src={item.dataUrl}
                  alt={item.title || 'Photobooth Strip'}
                  className="h-full w-auto max-w-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1 text-[11px] font-medium text-white border border-cyan-500/40 shadow-lg">
                    <Eye className="h-3.5 w-3.5 text-cyan-400" />
                    Lihat Penuh
                  </span>
                </div>
              </div>

              {/* Item Details & Actions */}
              <div className="p-3.5 border-t border-neutral-800/80 flex flex-col gap-2.5 bg-[#0a0a0a]">
                <div>
                  <h4 className="text-xs font-bold text-white truncate" title={item.title}>
                    {item.title || 'Photobooth Strip'}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-1 font-mono">
                    <Clock className="h-3 w-3 text-cyan-400/80" />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => handleDownload(item)}
                    title="Download Ulang Foto"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 py-2 text-xs font-bold text-cyan-300 transition active:scale-95"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() => setItemToDelete(item.id)}
                    title="Hapus dari Riwayat"
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-800 bg-[#141414] text-neutral-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal for Full Resolution Preview */}
      {selectedPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6"
          onClick={() => setSelectedPreview(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-xl w-full flex flex-col items-center bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-4 sm:p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate">
                  {selectedPreview.title}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  ({formatDate(selectedPreview.createdAt)})
                </span>
              </div>
              <button
                onClick={() => setSelectedPreview(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="w-full flex-1 flex items-center justify-center overflow-auto my-4 max-h-[68vh] p-2 bg-[#050505] rounded-2xl border border-neutral-900">
              <img
                src={selectedPreview.dataUrl}
                alt={selectedPreview.title}
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Modal Actions */}
            <div className="w-full flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setItemToDelete(selectedPreview.id);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-[#161616] px-3.5 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus</span>
              </button>

              <button
                onClick={() => handleDownload(selectedPreview)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 px-5 py-2 text-xs font-bold text-neutral-950 shadow-md shadow-cyan-500/30 hover:brightness-110 active:scale-95 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Foto Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

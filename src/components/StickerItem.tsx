import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCw, Trash2, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { PlacedSticker } from '../types';

interface StickerItemProps {
  sticker: PlacedSticker;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updated: PlacedSticker) => void;
  onDelete: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const StickerItem: React.FC<StickerItemProps> = ({
  sticker,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  containerRef,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number }>({
    clientX: 0,
    clientY: 0,
    startX: 0,
    startY: 0,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect();

    if (!containerRef.current) return;
    setIsDragging(true);

    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: sticker.x,
      startY: sticker.y,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartRef.current.clientX) / containerRect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.clientY) / containerRect.height) * 100;

    let newX = dragStartRef.current.startX + deltaX;
    let newY = dragStartRef.current.startY + deltaY;

    // Clamp within strip boundaries
    newX = Math.max(5, Math.min(95, newX));
    newY = Math.max(3, Math.min(97, newY));

    onUpdate({
      ...sticker,
      x: newX,
      y: newY,
    });
  }, [isDragging, containerRef, sticker, onUpdate]);

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe catch
      }
    }
  };

  // Adjust rotation
  const handleRotate = (degDelta: number) => {
    let nextRot = (sticker.rotation + degDelta) % 360;
    if (nextRot > 180) nextRot -= 360;
    if (nextRot < -180) nextRot += 360;
    onUpdate({ ...sticker, rotation: nextRot });
  };

  // Adjust scale
  const handleScale = (factor: number) => {
    const nextScale = Math.min(2.5, Math.max(0.6, sticker.scale + factor));
    onUpdate({ ...sticker, scale: parseFloat(nextScale.toFixed(2)) });
  };

  return (
    <div
      style={{
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
        transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
        touchAction: 'none',
      }}
      className="absolute select-none cursor-move group z-20"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Visual representation */}
      {sticker.type === 'emoji' ? (
        <span className="text-4xl sm:text-5xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] block transition-transform pointer-events-none">
          {sticker.content}
        </span>
      ) : (
        <div className="rounded-lg bg-[#0e0e0e] border-2 border-cyan-400 px-3 py-1 text-xs sm:text-sm font-extrabold text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)] uppercase tracking-wider whitespace-nowrap pointer-events-none font-mono">
          {sticker.content}
        </div>
      )}

      {/* Bounding Box & Action Handles when Selected */}
      {isSelected && (
        <div className="absolute -inset-3 border-2 border-dashed border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.35)] rounded-xl pointer-events-none">
          {/* Controls Floating Toolbar */}
          <div
            className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-[#0a0a0a]/95 border border-cyan-500/30 p-1 shadow-2xl pointer-events-auto backdrop-blur-md"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleRotate(-15)}
              title="Putar ke Kiri"
              className="p-1 text-neutral-300 hover:text-cyan-300 hover:bg-neutral-800 rounded-full transition"
            >
              <RotateCw className="h-3.5 w-3.5 -scale-x-100" />
            </button>
            <button
              onClick={() => handleRotate(15)}
              title="Putar ke Kanan"
              className="p-1 text-neutral-300 hover:text-cyan-300 hover:bg-neutral-800 rounded-full transition"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
            <div className="h-3 w-px bg-neutral-700 mx-0.5" />
            <button
              onClick={() => handleScale(0.15)}
              title="Perbesar"
              className="p-1 text-neutral-300 hover:text-cyan-300 hover:bg-neutral-800 rounded-full transition"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleScale(-0.15)}
              title="Perkecil"
              className="p-1 text-neutral-300 hover:text-cyan-300 hover:bg-neutral-800 rounded-full transition"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <div className="h-3 w-px bg-neutral-700 mx-0.5" />
            <button
              onClick={onDelete}
              title="Hapus Stiker"
              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

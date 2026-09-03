import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  FlipHorizontal,
  Sparkles,
  Timer,
  AlertCircle,
  Upload,
  Play,
  RotateCw,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { FilterType, PhotoCount } from '../types';
import { PHOTO_FILTERS } from '../utils/constants';
import { sounds } from '../utils/audio';

interface CameraViewProps {
  onCaptureComplete: (photos: string[], filter: FilterType, photoCount: PhotoCount) => void;
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  photoCount: PhotoCount;
  onPhotoCountChange: (count: PhotoCount) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onCaptureComplete,
  selectedFilter,
  onFilterChange,
  photoCount,
  onPhotoCountChange,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [timerDuration, setTimerDuration] = useState<number>(3); // 3 or 5 seconds

  // Session Capture State
  const [isCapturingSession, setIsCapturingSession] = useState<boolean>(false);
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState<boolean>(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Siap berfoto!');

  // File upload fallback ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser Anda tidak mendukung akses kamera.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 960 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasCameraPermission(true);
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setHasCameraPermission(false);
      const errMsg =
        err instanceof Error
          ? err.message
          : 'Kamera tidak dapat diakses. Pastikan izin kamera aktif pada browser.';
      setCameraError(errMsg);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // Capture single frame from video
  const captureFrame = useCallback((): string => {
    if (!videoRef.current) return '';
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, [isMirrored]);

  // Sequential capture session logic
  const startPhotoSession = async () => {
    if (isCapturingSession) return;
    setIsCapturingSession(true);
    setCapturedPhotos([]);
    setCurrentShotIndex(1);

    const photos: string[] = [];

    for (let shot = 1; shot <= photoCount; shot++) {
      setCurrentShotIndex(shot);
      setStatusMessage(`Pose untuk Foto ${shot} dari ${photoCount}!`);

      // Run countdown (e.g. 3, 2, 1)
      for (let sec = timerDuration; sec > 0; sec--) {
        setCountdown(sec);
        sounds.playBeep(sec === 1);
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Flash & Capture
      setCountdown(0);
      setShowFlash(true);
      sounds.playShutter();

      const photoData = captureFrame();
      if (photoData) {
        photos.push(photoData);
        setCapturedPhotos([...photos]);
      }

      // Turn off flash after brief moment
      setTimeout(() => setShowFlash(false), 350);

      // Brief pause between shots so user can change pose
      if (shot < photoCount) {
        setStatusMessage(`Keren! Siapkan pose berikutnya...`);
        setCountdown(null);
        await new Promise((r) => setTimeout(r, 1600));
      }
    }

    setStatusMessage('Selesai! Menyusun strip foto Anda...');
    setCountdown(null);
    setIsCapturingSession(false);

    // Give user brief second to see final captured set
    setTimeout(() => {
      onCaptureComplete(photos, selectedFilter, photoCount);
    }, 600);
  };

  // Handle uploading photos if user doesn't have camera or prefers custom photos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = [];
    for (let i = 0; i < files.length && i < photoCount; i++) {
      const f = files.item(i);
      if (f) fileList.push(f);
    }
    const loadedUrls: string[] = [];

    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadedUrls.push(event.target.result as string);
          if (loadedUrls.length === fileList.length) {
            // Fill if fewer than requested count
            while (loadedUrls.length < photoCount) {
              loadedUrls.push(loadedUrls[loadedUrls.length - 1]);
            }
            onCaptureComplete(loadedUrls, selectedFilter, photoCount);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Mock demo photos for testing without a real webcam
  const useSamplePhotos = () => {
    const samples = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    ];
    onCaptureComplete(samples.slice(0, photoCount), selectedFilter, photoCount);
  };

  const currentFilterObj = PHOTO_FILTERS.find((f) => f.id === selectedFilter) || PHOTO_FILTERS[0];

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-5xl mx-auto">
      {/* Top Banner / Config Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 bg-[#0e0e0e]/90 border border-neutral-800 p-3 sm:px-5 rounded-2xl shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
            Mode Foto:
          </span>
          <div className="inline-flex rounded-lg bg-[#161616] p-1 border border-neutral-800">
            <button
              onClick={() => !isCapturingSession && onPhotoCountChange(3)}
              disabled={isCapturingSession}
              className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                photoCount === 3
                  ? 'bg-[#00f0ff] text-neutral-950 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              3 Foto
            </button>
            <button
              onClick={() => !isCapturingSession && onPhotoCountChange(4)}
              disabled={isCapturingSession}
              className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                photoCount === 4
                  ? 'bg-[#00f0ff] text-neutral-950 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              4 Foto
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer select */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-300">
            <Timer className="h-3.5 w-3.5 text-cyan-400" />
            <button
              onClick={() => !isCapturingSession && setTimerDuration((prev) => (prev === 3 ? 5 : 3))}
              disabled={isCapturingSession}
              className="rounded-lg bg-[#161616] px-2.5 py-1 font-mono text-xs text-neutral-200 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-500/40 transition"
            >
              {timerDuration}s Delay
            </button>
          </div>

          {/* Mirror toggle */}
          <button
            onClick={() => setIsMirrored((m) => !m)}
            disabled={isCapturingSession}
            title={isMirrored ? 'Mirror Aktif' : 'Mirror Nonaktif'}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
              isMirrored
                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                : 'border-neutral-800 bg-[#161616] text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <FlipHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cermin</span>
          </button>
        </div>
      </div>

      {/* Main Viewfinder Stage */}
      <div className="relative w-full max-w-2xl aspect-[4/3] rounded-3xl overflow-hidden bg-[#050505] border-2 border-neutral-800 shadow-[0_0_35px_rgba(0,0,0,0.8)] flex items-center justify-center">
        {/* Flash Effect Layer */}
        {showFlash && (
          <div className="absolute inset-0 z-30 bg-white animate-flash pointer-events-none" />
        )}

        {/* Video stream */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          style={{
            filter: currentFilterObj.cssFilter,
            transform: isMirrored ? 'scaleX(-1)' : 'none',
          }}
          className="w-full h-full object-cover"
        />

        {/* Photobooth Viewfinder Overlay Guide (corner marks) */}
        <div className="absolute inset-6 pointer-events-none border border-white/20 rounded-2xl flex flex-col justify-between p-4">
          <div className="flex justify-between items-start text-white/50 text-[11px] font-mono">
            <span className="bg-black/50 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm">REC ● 1080P</span>
            <span className="bg-black/50 px-2 py-0.5 rounded border border-cyan-500/20 text-cyan-300 backdrop-blur-sm uppercase">
              {currentFilterObj.name}
            </span>
          </div>
          <div className="flex justify-between items-end text-white/40 text-[10px] font-mono">
            <span className="text-cyan-400/70">[ + ] FOCUS</span>
            <span>SNAPSTRIP ELEGANT DARK</span>
          </div>
        </div>

        {/* Countdown Big Display */}
        {isCapturingSession && countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <div className="font-outfit text-8xl sm:text-9xl font-extrabold text-white drop-shadow-[0_0_35px_rgba(0,240,255,0.85)] animate-pulse">
              {countdown}
            </div>
            <div className="mt-4 rounded-full bg-[#00f0ff] text-neutral-950 px-5 py-1.5 text-sm font-bold tracking-wide shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              Pose {currentShotIndex} dari {photoCount}!
            </div>
          </div>
        )}

        {/* Capture In-progress status banner */}
        {isCapturingSession && countdown === null && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
            <Sparkles className="h-10 w-10 text-cyan-400 animate-spin mb-3" />
            <p className="text-lg font-bold text-white px-4 text-center">{statusMessage}</p>
          </div>
        )}

        {/* Camera Permission / Error Fallback Screen */}
        {hasCameraPermission === false && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a0a0a]/95 p-6 text-center">
            <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Akses Kamera Belum Aktif</h3>
            <p className="text-xs text-neutral-400 max-w-md mb-6">
              {cameraError ||
                'Silakan izinkan akses webcam di browser Anda atau gunakan opsi alternatif di bawah ini untuk mencoba photobooth.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={startCamera}
                className="flex items-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 px-4 py-2.5 text-xs font-semibold text-white border border-neutral-700 transition"
              >
                <RotateCw className="h-3.5 w-3.5" />
                Coba Akses Lagi
              </button>
              <button
                onClick={useSamplePhotos}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:brightness-110 px-4 py-2.5 text-xs font-bold text-neutral-950 shadow-md shadow-cyan-500/25 transition"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Gunakan Contoh Foto
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 px-4 py-2.5 text-xs font-semibold text-neutral-300 border border-neutral-700 transition"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload Foto Sendiri
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* Real-time Filter Carousel */}
      <div className="w-full max-w-2xl mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 font-mono">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            Filter Kamera Real-Time
          </span>
          <span className="text-xs text-neutral-500">
            {currentFilterObj.description}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {PHOTO_FILTERS.map((f) => {
            const isSelected = selectedFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  onFilterChange(f.id);
                  sounds.playPop();
                }}
                disabled={isCapturingSession}
                className={`flex-shrink-0 flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium border transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/15 text-white shadow-[0_0_12px_rgba(0,240,255,0.25)] ring-1 ring-cyan-400/50'
                    : 'border-neutral-800 bg-[#111111] text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full border border-neutral-600 flex-shrink-0"
                  style={{
                    background:
                      f.id === 'grayscale'
                        ? '#888'
                        : f.id === 'sepia'
                        ? '#d97706'
                        : f.id === 'vintage'
                        ? '#f59e0b'
                        : f.id === 'cyberpunk'
                        ? '#00f0ff'
                        : f.id === 'warm'
                        ? '#fbbf24'
                        : f.id === 'filmnoir'
                        ? '#171717'
                        : '#e11d48',
                  }}
                />
                <span>{f.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Shots Progress Thumbnails */}
      {capturedPhotos.length > 0 && (
        <div className="flex items-center justify-center gap-3 my-4">
          <span className="text-xs text-neutral-400 font-medium font-mono">Terekam:</span>
          {Array.from({ length: photoCount }).map((_, idx) => {
            const photo = capturedPhotos[idx];
            return (
              <div
                key={idx}
                className={`relative h-14 w-12 rounded-lg border-2 overflow-hidden bg-[#111111] transition-all ${
                  photo
                    ? 'border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                    : 'border-neutral-800 border-dashed'
                }`}
              >
                {photo ? (
                  <>
                    <img
                      src={photo}
                      alt={`Shot ${idx + 1}`}
                      className="h-full w-full object-cover"
                      style={{ filter: currentFilterObj.cssFilter }}
                    />
                    <div className="absolute top-0.5 right-0.5 rounded-full bg-[#00f0ff] text-neutral-950 p-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-600 font-mono">
                    {idx + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Main Start / Capture Action Button */}
      <div className="mt-4 flex flex-col items-center">
        <button
          onClick={startPhotoSession}
          disabled={isCapturingSession || hasCameraPermission === false}
          className={`group relative flex items-center justify-center gap-3 rounded-full px-8 py-4 text-base font-extrabold text-neutral-950 transition-all ${
            isCapturingSession
              ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed opacity-80'
              : 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-teal-400 shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isCapturingSession ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
              <span>Mengambil Foto ({currentShotIndex}/{photoCount})...</span>
            </>
          ) : (
            <>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-neutral-950">
                <Camera className="h-4 w-4" />
              </div>
              <span>Mulai Sesi Foto ({photoCount} Foto)</span>
            </>
          )}
        </button>

        <p className="mt-2 text-xs text-neutral-400">
          Kamera akan mengambil {photoCount} foto berturut-turut dengan countdown {timerDuration} detik
        </p>
      </div>
    </div>
  );
};

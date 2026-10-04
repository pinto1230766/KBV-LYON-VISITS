import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Download,
  Trash2,
  Bookmark,
  Share2,
  X,
  Volume2,
  Calendar,
  User,
  Sliders,
  Sparkles,
  MessageSquare,
  Upload,
  AlertCircle,
  FileAudio,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useAudioStore } from "../../store/useAudioStore";
import type { AudioMetadata } from "../../lib/audioRecordingStorage";
import { haptic } from "../../lib/haptics";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  const hh = h > 0 ? `${String(h).padStart(2, "0")}:` : "";
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  const cs = String(ms).padStart(2, "0");

  return `${hh}${mm}:${ss}.${cs}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Ko";
  const k = 1024;
  const sizes = ["Octets", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function SamsungVoiceRecorderModal() {
  const {
    isModalOpen,
    activeVisit,
    closeRecorder,
    saveRecording,
    deleteRecording,
    getBlob,
    getVisitRecordings,
  } = useAudioStore();

  const [recordState, setRecordState] = useState<"idle" | "recording" | "paused">("idle");
  const [isStopping, setIsStopping] = useState(false);
  const [justSavedId, setJustSavedId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordingMode, setRecordingMode] = useState<"standard" | "discours" | "interview">("discours");
  const [bookmarks, setBookmarks] = useState<{ time: number; label: string }[]>([]);
  const [bookmarkInput, setBookmarkInput] = useState("");
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [micPermissionError, setMicPermissionError] = useState<"not-allowed" | "unavailable" | null>(null);

  // Playback state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [activeBlobUrl, setActiveBlobUrl] = useState<string | null>(null);

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // AudioContext & Visualizer refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const visitRecordings = activeVisit ? getVisitRecordings(activeVisit.visitId) : [];

  // Cleanup on unmount or modal close
  const cleanupRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
    setRecordState("idle");
    setElapsedSeconds(0);
    setAudioLevel(0);
    setBookmarks([]);
  }, []);

  const handleClose = () => {
    if (isStopping) return;
    if (recordState === "recording" || recordState === "paused") {
      if (
        !window.confirm(
          "Un enregistrement est en cours. Voulez-vous vraiment fermer sans sauvegarder ?"
        )
      ) {
        return;
      }
    }
    cleanupRecording();
    if (activeBlobUrl) {
      URL.revokeObjectURL(activeBlobUrl);
      setActiveBlobUrl(null);
    }
    setJustSavedId(null);
    closeRecorder();
  };

  // Start Visualizer Canvas Loop
  const startVisualizer = useCallback((analyser: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Compute average level for meter
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));

      // Render Samsung style neon waveform
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw subtle grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Draw frequency bars like Samsung Voice Recorder
      const barCount = 48;
      const barWidth = 3;
      const gap = (width - barCount * barWidth) / (barCount - 1);

      for (let i = 0; i < barCount; i++) {
        const step = Math.floor((i / barCount) * (bufferLength / 2));
        const val = dataArray[step] || 0;
        const normalized = val / 255;
        // Symmetric height around center
        const barHeight = Math.max(4, normalized * (height * 0.85));

        const x = i * (barWidth + gap);
        const y = centerY - barHeight / 2;

        // Gradient like Samsung One UI: Vibrant cyan to electric purple
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, "#00E5FF"); // Samsung neon cyan
        gradient.addColorStop(0.5, "#3D82F6"); // Vivid blue
        gradient.addColorStop(1, "#A855F7"); // Neon purple

        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Rounded bar
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    draw();
  }, []);

  // Start recording
  const handleStartRecord = async () => {
    if (isStopping) return;
    haptic("medium");
    setMicPermissionError(null);
    setJustSavedId(null);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }
    audioChunksRef.current = [];

    // Verify browser support
    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicPermissionError("unavailable");
      toast.error("Microphone non pris en charge", {
        description: "Votre navigateur ou environnement actuel ne permet pas l'accès direct au microphone. Utilisez 'Importer audio'.",
        duration: 6000,
      });
      return;
    }

    try {
      let stream: MediaStream;
      try {
        const constraints: MediaStreamConstraints = {
          audio: {
            echoCancellation: recordingMode === "discours",
            noiseSuppression: recordingMode === "discours",
            autoGainControl: true,
          },
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstErr) {
        // If explicitly denied, do not re-prompt
        const isExplicitlyDenied = firstErr instanceof Error && (
          firstErr.name === "NotAllowedError" ||
          firstErr.name === "SecurityError" ||
          firstErr.message.includes("not allowed") ||
          firstErr.message.includes("Permission denied")
        );
        if (isExplicitlyDenied) {
          throw firstErr;
        }
        // Fallback to basic audio constraint
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      streamRef.current = stream;

      // Setup AudioContext for visualizer
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      startVisualizer(analyser);

      // Determine supported MIME type
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ];
      let selectedMime = "";
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const options = selectedMime ? { mimeType: selectedMime } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250); // Emit chunk every 250ms

      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setElapsedSeconds(0);
      setRecordState("recording");

      // Precision timer with decimal seconds
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedSeconds((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
      }, 50);

      toast.success("Enregistrement du discours commencé", {
        description: "Qualité optimisée pour la voix (Samsung One UI)",
      });
    } catch (err: unknown) {
      console.error("Microphone access error:", err);
      const errName = err instanceof Error ? err.name : "";
      const errMessage = err instanceof Error ? err.message : String(err);

      const isNotAllowed =
        errName === "NotAllowedError" ||
        errName === "SecurityError" ||
        errMessage.includes("not allowed") ||
        errMessage.includes("Permission denied") ||
        errMessage.includes("dismissed");

      setMicPermissionError(isNotAllowed ? "not-allowed" : "unavailable");

      if (isNotAllowed) {
        toast.error("Accès au microphone restreint ou refusé", {
          description: "Le navigateur ou l'iframe bloque le micro. Vous pouvez autoriser le micro dans les paramètres du site ou importer directement votre fichier audio.",
          duration: 6000,
        });
      } else {
        toast.error("Impossible d'accéder au microphone", {
          description: "Vérifiez vos branchements et autorisations, ou importez un fichier audio existant.",
          duration: 5000,
        });
      }
    }
  };

  // Import existing audio file (fallback or external recording)
  const handleImportAudioFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/") && !/\.(mp3|m4a|wav|aac|ogg|opus|webm)$/i.test(file.name)) {
      toast.error("Format de fichier non supporté", {
        description: "Veuillez choisir un fichier audio valide (MP3, M4A, WAV, AAC, etc.).",
      });
      return;
    }

    try {
      toast.loading("Chargement de l'enregistrement...", { id: "import-audio" });

      const objectUrl = URL.createObjectURL(file);
      const tempAudio = new Audio();

      const duration = await new Promise<number>((resolve) => {
        tempAudio.addEventListener("loadedmetadata", () => {
          resolve(tempAudio.duration || 0);
        });
        tempAudio.addEventListener("error", () => {
          resolve(0);
        });
        tempAudio.src = objectUrl;
      });

      URL.revokeObjectURL(objectUrl);

      if (activeVisit) {
        const dateStr = activeVisit.visitDate || new Date().toISOString().split("T")[0];
        const speakerName = activeVisit.nom || "Frère";
        const theme = activeVisit.talkTheme || activeVisit.talkNoOrType || "Discours";
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        const autoTitle = cleanName ? `${cleanName}` : `Discours - ${speakerName} (${theme}) - ${dateStr}`;

        const metadata: AudioMetadata = {
          id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          visitId: activeVisit.visitId,
          speakerName: speakerName,
          talkTheme: activeVisit.talkTheme,
          talkNumber: activeVisit.talkNoOrType,
          visitDate: dateStr,
          createdAt: new Date().toISOString(),
          duration: duration || 0,
          size: file.size,
          mimeType: file.type || "audio/mpeg",
          title: autoTitle,
          bookmarks: [],
        };

        await saveRecording(metadata, file);
        setMicPermissionError(null);
        toast.success("Enregistrement importé avec succès !", {
          id: "import-audio",
          description: `${file.name} (${formatDuration(duration || 0)}) sauvegardé avec la visite`,
        });
      }
    } catch (err) {
      console.error("Audio import error:", err);
      toast.error("Erreur lors de l'importation du fichier audio", { id: "import-audio" });
    } finally {
      event.target.value = "";
    }
  };

  // Pause recording
  const handlePauseRecord = () => {
    haptic("light");
    if (isStopping || !mediaRecorderRef.current || recordState !== "recording") return;

    mediaRecorderRef.current.pause();
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setRecordState("paused");
    toast.info("Enregistrement en pause");
  };

  // Resume recording
  const handleResumeRecord = () => {
    haptic("light");
    if (isStopping || !mediaRecorderRef.current || recordState !== "paused") return;

    mediaRecorderRef.current.resume();
    const pauseStart = Date.now() - (startTimeRef.current + elapsedSeconds * 1000);
    pausedTimeRef.current += pauseStart;

    timerIntervalRef.current = window.setInterval(() => {
      setElapsedSeconds((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
    }, 50);

    setRecordState("recording");
    toast.success("Enregistrement repris");
  };

  // Stop & Save recording
  const handleStopAndSave = async () => {
    haptic("success");
    if (isStopping) return;
    if (!mediaRecorderRef.current || recordState === "idle") {
      cleanupRecording();
      return;
    }

    setIsStopping(true);

    // 1. GELER LE COMPTEUR IMMÉDIATEMENT : l'utilisateur voit l'arrêt instantané
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLevel(0);

    const recorder = mediaRecorderRef.current;
    const finalDuration = Math.max(1, Math.round(elapsedSeconds));
    const finalBookmarks = [...bookmarks];

    // 2. Attendre l'arrêt complet du recorder
    try {
      if (recorder.state !== "inactive") {
        await new Promise<void>((resolve) => {
          recorder.onstop = () => resolve();
          try {
            recorder.stop();
          } catch (err) {
            console.warn("MediaRecorder stop error:", err);
            resolve();
          }
        });
      }
    } catch (e) {
      console.warn("Recorder stop error:", e);
    }

    // 3. Libérer les pistes audio du microphone immédiatement
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    const mime = recorder.mimeType || "audio/webm";
    const audioBlob = new Blob(audioChunksRef.current, { type: mime });
    audioChunksRef.current = []; // Vider immédiatement pour ne pas accumuler dans les futurs fichiers

    if (!audioBlob || audioBlob.size === 0) {
      toast.error("L'enregistrement est vide");
      cleanupRecording();
      setIsStopping(false);
      return;
    }

    if (activeVisit) {
      const dateStr = activeVisit.visitDate || new Date().toISOString().split("T")[0];
      const speakerName = activeVisit.nom || "Frère";
      const theme = activeVisit.talkTheme || activeVisit.talkNoOrType || "Discours";
      const autoTitle = `Discours - ${speakerName} (${theme}) - ${dateStr}`;
      const recId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const metadata: AudioMetadata = {
        id: recId,
        visitId: activeVisit.visitId,
        speakerName: speakerName,
        talkTheme: activeVisit.talkTheme,
        talkNumber: activeVisit.talkNoOrType,
        visitDate: dateStr,
        createdAt: new Date().toISOString(),
        duration: finalDuration,
        size: audioBlob.size,
        mimeType: mime,
        title: autoTitle,
        bookmarks: finalBookmarks,
      };

      try {
        await saveRecording(metadata, audioBlob);
        setJustSavedId(recId);
        toast.success("Discours enregistré avec succès !", {
          description: `${formatDuration(finalDuration)} sauvegardé dans la fiche de l'orateur`,
        });
      } catch (e) {
        console.error("Save audio error:", e);
        toast.error("Erreur lors de la sauvegarde de l'enregistrement");
      }
    }

    cleanupRecording();
    setIsStopping(false);
  };

  // Add bookmark during recording
  const handleAddBookmark = () => {
    haptic("light");
    if (recordState !== "recording" && recordState !== "paused") return;
    const currentTime = elapsedSeconds;
    const defaultLabel = `Signet ${bookmarks.length + 1} (${formatDuration(currentTime)})`;
    setBookmarkInput(defaultLabel);
    setShowBookmarkDialog(true);
  };

  const confirmAddBookmark = () => {
    const label = bookmarkInput.trim() || `Signet ${bookmarks.length + 1}`;
    setBookmarks((prev) => [...prev, { time: elapsedSeconds, label }]);
    setShowBookmarkDialog(false);
    toast.success("Signet ajouté", { description: label });
  };

  // 1-tap quick chapter preset
  const handleQuickAddBookmark = (tag: string) => {
    haptic("selection");
    if (recordState !== "recording" && recordState !== "paused") return;
    const currentTime = elapsedSeconds;
    const label = `${tag} (${formatDuration(currentTime)})`;
    setBookmarks((prev) => [...prev, { time: currentTime, label }]);
    toast.success(`Chapitre : ${tag}`, {
      description: `Marqué à ${formatDuration(currentTime)}`,
    });
  };

  // WhatsApp share with summary & audio file prompt
  const handleShareWhatsApp = async (meta: AudioMetadata) => {
    haptic("medium");
    const m = Math.floor((meta.duration || 0) / 60);
    const s = Math.floor((meta.duration || 0) % 60);
    const durStr = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

    let chaptersText = "";
    if (meta.bookmarks && meta.bookmarks.length > 0) {
      chaptersText =
        "\n\n📌 *Chapitres / Repères :*\n" +
        meta.bookmarks.map((b) => `• ${formatDuration(b.time)} - ${b.label}`).join("\n");
    }

    const text = `🎤 *Discours KBV Lyon*\n👤 *Orateur* : ${meta.speakerName}\n📖 *Thème* : ${
      meta.talkTheme || meta.talkNumber || "Discours public"
    }\n📅 *Date* : ${meta.visitDate}\n⏱️ *Durée* : ${durStr}${chaptersText}\n\n_Enregistré via Samsung Voice Recorder (KBV Visites)_`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");

    // Also offer audio file download/share
    await handleShare(meta);
  };

  // Playback handlers
  const handlePlayRecording = async (meta: AudioMetadata) => {
    haptic("selection");
    if (playingId === meta.id && isPlaying) {
      audioElementRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    try {
      if (playingId !== meta.id) {
        if (activeBlobUrl) {
          URL.revokeObjectURL(activeBlobUrl);
        }
        const blob = await getBlob(meta.id);
        if (!blob) {
          toast.error("Fichier audio introuvable");
          return;
        }
        const url = URL.createObjectURL(blob);
        setActiveBlobUrl(url);
        setPlayingId(meta.id);
        setPlaybackDuration(meta.duration || 0);

        if (audioElementRef.current) {
          audioElementRef.current.src = url;
          audioElementRef.current.playbackRate = playbackRate;
          audioElementRef.current.play();
          setIsPlaying(true);
        }
      } else {
        audioElementRef.current?.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Play error:", err);
      toast.error("Erreur lors de la lecture audio");
    }
  };

  const handleSeek = (newTime: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = newTime;
      setPlaybackTime(newTime);
    }
  };

  const handleSkip = (delta: number) => {
    haptic("light");
    if (audioElementRef.current) {
      const target = Math.max(0, Math.min(playbackDuration, audioElementRef.current.currentTime + delta));
      audioElementRef.current.currentTime = target;
      setPlaybackTime(target);
    }
  };

  const handleRateChange = () => {
    haptic("light");
    const rates = [0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = nextRate;
    }
    toast.info(`Vitesse de lecture : ${nextRate}x`);
  };

  const handleDownload = async (meta: AudioMetadata) => {
    haptic("medium");
    const blob = await getBlob(meta.id);
    if (!blob) {
      toast.error("Fichier audio introuvable");
      return;
    }
    const ext = meta.mimeType.includes("mp4") ? "m4a" : "webm";
    const filename = `${meta.title.replace(/[^a-zA-Z0-9_\-]/g, "_")}.${ext}`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Téléchargement du discours lancé", { description: filename });
  };

  const handleShare = async (meta: AudioMetadata) => {
    haptic("medium");
    const blob = await getBlob(meta.id);
    if (!blob) {
      toast.error("Fichier audio introuvable");
      return;
    }
    const ext = meta.mimeType.includes("mp4") ? "m4a" : "webm";
    const filename = `${meta.title.replace(/[^a-zA-Z0-9_\-]/g, "_")}.${ext}`;
    const file = new File([blob], filename, { type: meta.mimeType });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: meta.title,
          text: `Enregistrement du discours de ${meta.speakerName} (${meta.visitDate})`,
        });
        toast.success("Partagé avec succès !");
      } catch {
        // User cancelled or fallback
      }
    } else {
      handleDownload(meta);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    haptic("warning");
    if (window.confirm(`Supprimer l'enregistrement "${title}" ? Cette action est irréversible.`)) {
      if (playingId === id) {
        audioElementRef.current?.pause();
        setIsPlaying(false);
        setPlayingId(null);
      }
      await deleteRecording(id);
      toast.success("Enregistrement supprimé");
    }
  };

  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, [cleanupRecording]);

  if (!isModalOpen || !activeVisit) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
        {/* Hidden Audio Element for playback */}
        <audio
          ref={audioElementRef}
          onTimeUpdate={() => {
            if (audioElementRef.current) {
              setPlaybackTime(audioElementRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (audioElementRef.current) {
              setPlaybackDuration(audioElementRef.current.duration || 0);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setPlaybackTime(0);
          }}
        />

        {/* Samsung S10 Ultra / S26 Ultra Voice Recorder Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-2xl bg-[#0f1117] text-white rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden max-h-[95dvh]"
        >
          {/* Top Bar - Samsung One UI Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10 bg-[#161922]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    Samsung Voice Recorder
                  </span>
                  <span className="text-[11px] text-white/50 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    HD Audio
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <User className="w-4 h-4 text-cyan-400" />
                  {activeVisit.nom}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => audioFileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white/90 text-xs font-semibold transition-all active:scale-95"
                title="Importer un enregistrement (MP3, M4A, WAV...)"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Importer audio</span>
              </button>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-95"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader Info Pill */}
          <div className="px-6 py-2 bg-white/[0.02] border-b border-white/5 flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center gap-2 truncate">
              <Calendar className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <span className="font-semibold text-white/80">{activeVisit.visitDate}</span>
              {activeVisit.talkTheme && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="truncate max-w-[260px] text-white/70">{activeVisit.talkTheme}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Sliders className="w-3 h-3 text-cyan-400" />
              <span className="text-[11px] font-medium text-cyan-300">
                {recordingMode === "discours" ? "Mode Discours" : "Standard"}
              </span>
            </div>
          </div>

          {/* Scrollable Content Container for Landscape / Small Screens */}
          <div className="flex-1 overflow-y-auto min-h-0 flex flex-col overscroll-contain">
            {/* Main Visualizer & Live Counter Area */}
            <div className="p-4 sm:p-6 flex flex-col items-center justify-center bg-gradient-to-b from-[#12151e] via-[#0f1117] to-[#0a0c10] relative shrink-0">

            {/* Permission Warning Banner if mic blocked */}
            {micPermissionError && (
              <div className="w-full max-w-xl mx-auto mb-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5 text-left">
                    <p className="font-bold text-amber-300">
                      {micPermissionError === "not-allowed"
                        ? "Microphone restreint par le navigateur ou le contexte de l'application"
                        : "Microphone indisponible"}
                    </p>
                    <p className="text-amber-200/80 leading-relaxed text-[11px]">
                      {micPermissionError === "not-allowed"
                        ? "L'accès au micro a été refusé ou n'est pas permis dans cet environnement. Vous pouvez autoriser le micro dans les paramètres du site (icône cadenas à gauche de l'URL), ou importer directement votre fichier audio (MP3, M4A, WAV)."
                        : "Le micro n'a pas pu être initialisé. Vous pouvez importer un fichier audio enregistré depuis votre téléphone ou un autre appareil."}
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => audioFileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Importer un fichier audio</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMicPermissionError(null);
                          handleStartRecord();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                      >
                        Réessayer le micro
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mode Selector Tabs (One UI style) */}
            <div className="flex items-center p-1 bg-white/5 rounded-full border border-white/10 mb-6">
              {[
                { id: "discours", label: "Discours (Voix claire)" },
                { id: "standard", label: "Standard" },
                { id: "interview", label: "Interview" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    if (recordState === "idle") {
                      setRecordingMode(mode.id as typeof recordingMode);
                    }
                  }}
                  disabled={recordState !== "idle"}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    recordingMode === mode.id
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                      : "text-white/60 hover:text-white disabled:opacity-40"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Live Waveform Canvas */}
            <div className="w-full h-32 relative flex items-center justify-center rounded-2xl bg-black/40 border border-white/10 overflow-hidden shadow-inner mb-5">
              <canvas
                ref={canvasRef}
                width={560}
                height={128}
                className="w-full h-full object-cover"
              />

              {recordState === "idle" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 pointer-events-none">
                  <Mic className="w-8 h-8 text-white/20 mb-1 animate-pulse" />
                  <span className="text-xs text-white/50 font-medium">
                    Prêt à enregistrer le discours du frère
                  </span>
                </div>
              )}

              {/* Sound level indicator in top-right */}
              {recordState !== "idle" && (
                <div className="absolute top-2.5 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] text-cyan-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  {audioLevel}% dB
                </div>
              )}
            </div>

            {/* Giant Monospace Timer */}
            <div className="flex flex-col items-center mb-6">
              <div className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-white flex items-baseline drop-shadow-[0_2px_12px_rgba(0,229,255,0.2)]">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {isStopping && (
                  <span className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    FINALISATION & SAUVEGARDE EN COURS...
                  </span>
                )}
                {!isStopping && recordState === "recording" && (
                  <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    ENREGISTREMENT EN COURS
                  </span>
                )}
                {!isStopping && recordState === "paused" && (
                  <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold">
                    <Pause className="w-3 h-3" />
                    EN PAUSE
                  </span>
                )}
                {!isStopping && recordState === "idle" && (
                  <span className="text-xs text-white/40 font-medium">
                    {justSavedId
                      ? "Enregistrement sauvegardé. Prêt pour un nouveau si besoin."
                      : "Appuyez sur le bouton rouge pour démarrer"}
                  </span>
                )}
              </div>
            </div>

            {/* Quick 1-tap Chapter Chips (Point 5) */}
            <div className="flex flex-col items-center gap-1.5 mb-5 w-full">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                Marqueurs de temps / Chapitres rapides
              </span>
              <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-md">
                {[
                  { label: "Cantique", icon: "🎵" },
                  { label: "Intro", icon: "🎤" },
                  { label: "Point clé", icon: "💡" },
                  { label: "Verset", icon: "📖" },
                  { label: "Conclusion", icon: "🏁" },
                  { label: "Prière", icon: "🤲" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    disabled={recordState === "idle" || isStopping}
                    onClick={() => handleQuickAddBookmark(preset.label)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 touch-manipulation"
                    title={`Marquer ${preset.label} à ${formatDuration(elapsedSeconds)}`}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Samsung Primary Recording Controls Bar */}
            <div className="flex items-center justify-center gap-6 sm:gap-8 w-full">
              {/* Bookmark Button */}
              <button
                type="button"
                onClick={handleAddBookmark}
                disabled={recordState === "idle" || isStopping}
                className="flex flex-col items-center gap-1 text-white/70 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
                title="Ajouter un signet / point clé"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-[11px] font-semibold">Signet</span>
              </button>

              {/* Central Big Action Button (Samsung Style) */}
              {recordState === "idle" ? (
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    disabled={isStopping}
                    onClick={handleStartRecord}
                    className="group relative w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-xl shadow-red-600/40 active:scale-95 transition-all touch-manipulation hover:brightness-110 disabled:opacity-50"
                    title={justSavedId ? "Lancer un autre enregistrement" : "Démarrer l'enregistrement"}
                  >
                    <div className="absolute inset-0 rounded-full border-4 border-red-400/30 group-hover:scale-105 transition-all" />
                    <div className="w-7 h-7 rounded-full bg-white shadow-inner" />
                  </button>
                  <span className="text-[11px] font-semibold text-white/70">
                    {justSavedId ? "Nouvel enregistrement" : "Enregistrer"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Pause / Resume button */}
                  {recordState === "recording" ? (
                    <button
                      type="button"
                      disabled={isStopping}
                      onClick={handlePauseRecord}
                      className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-all touch-manipulation disabled:opacity-40"
                      title="Mettre en pause"
                    >
                      <Pause className="w-7 h-7 fill-white" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isStopping}
                      onClick={handleResumeRecord}
                      className="w-16 h-16 rounded-full bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 flex items-center justify-center text-red-400 active:scale-95 transition-all touch-manipulation disabled:opacity-40"
                      title="Reprendre l'enregistrement"
                    >
                      <Play className="w-7 h-7 fill-red-400" />
                    </button>
                  )}

                  {/* Stop & Save button */}
                  <button
                    type="button"
                    disabled={isStopping}
                    onClick={handleStopAndSave}
                    className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 active:scale-95 transition-all touch-manipulation disabled:opacity-80"
                    title="Arrêter et sauvegarder le discours"
                  >
                    {isStopping ? (
                      <Loader2 className="w-7 h-7 text-white animate-spin" />
                    ) : (
                      <Square className="w-6 h-6 fill-white" />
                    )}
                  </button>
                </div>
              )}

              {/* Reset / Cancel button */}
              <button
                type="button"
                onClick={() => {
                  if (recordState !== "idle") {
                    if (window.confirm("Annuler l'enregistrement en cours ?")) {
                      cleanupRecording();
                    }
                  }
                }}
                disabled={recordState === "idle" || isStopping}
                className="flex flex-col items-center gap-1 text-white/70 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
                title="Annuler"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-white/60" />
                </div>
                <span className="text-[11px] font-semibold">Annuler</span>
              </button>
            </div>

            {/* Post-save Success Banner */}
            {justSavedId && recordState === "idle" && (
              <div className="mt-5 px-4 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-3 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold text-white truncate">Discours sauvegardé avec succès !</p>
                    <p className="text-[11px] text-emerald-300/80">Disponible dans la liste ci-dessous</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shrink-0 transition-all active:scale-95 shadow-xs"
                >
                  Terminer
                </button>
              </div>
            )}

            {/* Quick Import Option when Idle */}
            {recordState === "idle" && !justSavedId && (
              <div className="mt-4 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => audioFileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-medium transition-all active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ou importer un fichier audio (MP3, M4A, WAV)</span>
                </button>
              </div>
            )}

            {/* Live Bookmarks display */}
            {bookmarks.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5 justify-center max-w-lg">
                {bookmarks.map((b, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium"
                  >
                    <Bookmark className="w-2.5 h-2.5" />
                    {b.label} ({formatDuration(b.time)})
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Saved Talk Recordings List for this Visit */}
          <div className="flex-1 overflow-y-auto px-6 py-4 bg-[#0d0e14] border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                Discours enregistrés pour cette visite ({visitRecordings.length})
              </h3>
              <span className="text-[11px] text-white/40">
                Stockage sécurisé sur l&apos;appareil
              </span>
            </div>

            {visitRecordings.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center flex flex-col items-center justify-center">
                <Mic className="w-8 h-8 text-white/20 mb-2" />
                <p className="text-sm font-medium text-white/60">
                  Aucun enregistrement audio pour ce discours pour l&apos;instant
                </p>
                <p className="text-xs text-white/40 mt-1 max-w-sm">
                  Utilisez le micro pour enregistrer en direct ou importez un fichier audio (MP3, M4A, WAV).
                </p>
                <button
                  type="button"
                  onClick={() => audioFileInputRef.current?.click()}
                  className="mt-3.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Importer un fichier audio</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {visitRecordings.map((rec) => {
                  const isCurrentPlaying = playingId === rec.id;

                  return (
                    <div
                      key={rec.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrentPlaying
                          ? "bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                          : "bg-white/[0.03] hover:bg-white/[0.06] border-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate flex items-center gap-2">
                            {rec.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-white/50 mt-0.5">
                            <span className="font-semibold text-cyan-400">
                              {formatDuration(rec.duration)}
                            </span>
                            <span>•</span>
                            <span>{formatBytes(rec.size)}</span>
                            <span>•</span>
                            <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleShareWhatsApp(rec)}
                            className="h-8 px-2.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-all active:scale-95 touch-manipulation"
                            title="Partager le résumé et le fichier sur WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShare(rec)}
                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
                            title="Partager le discours (fichier audio)"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(rec)}
                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
                            title="Télécharger le fichier audio"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(rec.id, rec.title)}
                            className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-all"
                            title="Supprimer l'enregistrement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Integrated Audio Player Bar if playing */}
                      {isCurrentPlaying ? (
                        <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
                          {/* Progress Scrubber */}
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-mono text-cyan-300 w-10">
                              {formatDuration(playbackTime)}
                            </span>
                            <input
                              type="range"
                              min={0}
                              max={playbackDuration || rec.duration || 100}
                              step={0.1}
                              value={playbackTime}
                              onChange={(e) => handleSeek(parseFloat(e.target.value))}
                              className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                            <span className="text-[11px] font-mono text-white/40 w-10 text-right">
                              {formatDuration(playbackDuration || rec.duration)}
                            </span>
                          </div>

                          {/* Player Controls */}
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSkip(-5)}
                                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80"
                                title="Reculer de 5 secondes"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePlayRecording(rec)}
                                className="w-9 h-9 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center justify-center shadow-md shadow-cyan-500/30"
                                title={isPlaying ? "Pause" : "Lecture"}
                              >
                                {isPlaying ? (
                                  <Pause className="w-4 h-4 fill-black" />
                                ) : (
                                  <Play className="w-4 h-4 fill-black ml-0.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSkip(5)}
                                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80"
                                title="Avancer de 5 secondes"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Speed Rate Button */}
                            <button
                              type="button"
                              onClick={handleRateChange}
                              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-cyan-300"
                              title="Changer la vitesse"
                            >
                              {playbackRate}x
                            </button>
                          </div>

                          {/* Bookmarks Jump List */}
                          {rec.bookmarks && rec.bookmarks.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {rec.bookmarks.map((bm, bIdx) => (
                                <button
                                  key={bIdx}
                                  type="button"
                                  onClick={() => handleSeek(bm.time)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] text-amber-300 font-medium"
                                  title={`Aller à ${formatDuration(bm.time)}`}
                                >
                                  <Bookmark className="w-2.5 h-2.5" />
                                  {bm.label} ({formatDuration(bm.time)})
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            onClick={() => handlePlayRecording(rec)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30 transition-all active:scale-95"
                          >
                            <Play className="w-3.5 h-3.5 fill-cyan-400" />
                            Écouter le discours
                          </button>
                          {rec.bookmarks && rec.bookmarks.length > 0 && (
                            <span className="text-[11px] text-amber-300/70 flex items-center gap-1 font-medium">
                              <Bookmark className="w-3 h-3 text-amber-400" />
                              {rec.bookmarks.length} signet{rec.bookmarks.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hidden audio file input for import */}
            <input
              ref={audioFileInputRef}
              type="file"
              accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg,.opus,.webm"
              className="hidden"
              onChange={handleImportAudioFile}
            />
          </div>
        </div>
      </motion.div>

        {/* Bookmark Input Modal */}
        {showBookmarkDialog && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-[#161922] text-white p-5 rounded-2xl border border-white/10 shadow-2xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                Ajouter un signet à {formatDuration(elapsedSeconds)}
              </h4>
              <input
                type="text"
                value={bookmarkInput}
                onChange={(e) => setBookmarkInput(e.target.value)}
                placeholder="Ex: Introduction, Verset clé, Conclusion..."
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookmarkDialog(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmAddBookmark}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black"
                >
                  Enregistrer le signet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}

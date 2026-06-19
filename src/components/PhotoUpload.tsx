import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { compressImage } from "../lib/imageCompress";

interface PhotoUploadProps {
  photoUrl?: string;
  onPhotoChange: (base64: string | undefined) => void;
  size?: "sm" | "md";
}

export function PhotoUpload({ photoUrl, onPhotoChange, size = "md" }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const { t: _t } = useTranslation();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Allow up to 15 MB raw — we compress aggressively below.
    if (file.size > 15 * 1024 * 1024) return;
    setBusy(true);
    try {
      const dataUrl = await compressImage(file, { maxDim: 800, quality: 0.82 });
      onPhotoChange(dataUrl);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const dim = size === "sm" ? "w-16 h-16" : "w-20 h-20";

  return (
    <div className="flex items-center gap-3">
      <div className={`${dim} rounded-xl overflow-hidden bg-muted flex items-center justify-center relative group cursor-pointer border-2 border-dashed border-border hover:border-primary/50 transition-colors`}
        onClick={() => inputRef.current?.click()}
      >
        {photoUrl ? (
          <>
            <img src={photoUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary-foreground" />
            </div>
          </>
        ) : busy ? (
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        ) : (
          <Camera className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      {photoUrl && (
        <button
          type="button"
          onClick={() => onPhotoChange(undefined)}
          aria-label="Supprimer la photo"
          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
        >
          <X aria-hidden="true" className="w-4 h-4 text-destructive" />
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

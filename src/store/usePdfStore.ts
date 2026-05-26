import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface StoredPdf {
  id: string;
  name: string;
  dataUrl: string; // base64
  size: number;    // bytes
  uploadedAt: string;
}

interface PdfStore {
  pdfs: Record<string, StoredPdf>; // key = slug, e.g. "3007-f"
  storePdf: (slug: string, pdf: StoredPdf) => void;
  removePdf: (slug: string) => void;
}

export const usePdfStore = create<PdfStore>()(
  persist(
    (set) => ({
      pdfs: {},
      storePdf: (slug, pdf) =>
        set((s) => ({ pdfs: { ...s.pdfs, [slug]: pdf } })),
      removePdf: (slug) =>
        set((s) => {
          const next = { ...s.pdfs };
          delete next[slug];
          return { pdfs: next };
        }),
    }),
    { name: "kbv-pdfs" }
  )
);

// IndexedDB storage for talk audio recordings.
// Stores metadata and binary audio Blobs directly without localStorage limits.

export interface AudioBookmark {
  time: number; // in seconds
  label: string;
}

export interface AudioMetadata {
  id: string;
  visitId: string;
  speakerName: string;
  talkTheme?: string;
  talkNumber?: string;
  visitDate: string;
  createdAt: string;
  duration: number; // in seconds
  size: number; // bytes
  mimeType: string;
  title: string;
  bookmarks: AudioBookmark[];
}

const DB_NAME = "kbv-audio-store";
const DB_VERSION = 1;
const STORE_META = "recordings-meta";
const STORE_BLOBS = "recordings-blobs";

let dbPromise: Promise<IDBDatabase> | null = null;

function getAudioDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not supported on this device"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_META)) {
          const metaStore = db.createObjectStore(STORE_META, { keyPath: "id" });
          metaStore.createIndex("visitId", "visitId", { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_BLOBS)) {
          db.createObjectStore(STORE_BLOBS);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
    });
  }
  return dbPromise;
}

export async function saveAudioRecording(
  meta: AudioMetadata,
  blob: Blob
): Promise<void> {
  const db = await getAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_META, STORE_BLOBS], "readwrite");
    const metaStore = tx.objectStore(STORE_META);
    const blobStore = tx.objectStore(STORE_BLOBS);

    metaStore.put(meta);
    blobStore.put(blob, meta.id);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(new Error("Transaction aborted"));
  });
}

export async function getAllAudioMetadata(): Promise<AudioMetadata[]> {
  const db = await getAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_META, "readonly");
    const store = tx.objectStore(STORE_META);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as AudioMetadata[]) || []);
    req.onerror = () => reject(req.error);
  });
}

export async function getAudioMetadataByVisit(visitId: string): Promise<AudioMetadata[]> {
  const db = await getAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_META, "readonly");
    const store = tx.objectStore(STORE_META);
    const index = store.index("visitId");
    const req = index.getAll(visitId);
    req.onsuccess = () => resolve((req.result as AudioMetadata[]) || []);
    req.onerror = () => reject(req.error);
  });
}

export async function getAudioBlobById(id: string): Promise<Blob | null> {
  const db = await getAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BLOBS, "readonly");
    const store = tx.objectStore(STORE_BLOBS);
    const req = store.get(id);
    req.onsuccess = () => resolve((req.result as Blob) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAudioRecording(id: string): Promise<void> {
  const db = await getAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_META, STORE_BLOBS], "readwrite");
    tx.objectStore(STORE_META).delete(id);
    tx.objectStore(STORE_BLOBS).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateAudioTitle(id: string, newTitle: string): Promise<void> {
  const db = await getAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_META, "readwrite");
    const store = tx.objectStore(STORE_META);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const meta = getReq.result as AudioMetadata | undefined;
      if (meta) {
        meta.title = newTitle;
        store.put(meta);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function addBookmarkToAudio(
  id: string,
  bookmark: AudioBookmark
): Promise<void> {
  const db = await getAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_META, "readwrite");
    const store = tx.objectStore(STORE_META);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const meta = getReq.result as AudioMetadata | undefined;
      if (meta) {
        meta.bookmarks = [...(meta.bookmarks || []), bookmark].sort((a, b) => a.time - b.time);
        store.put(meta);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

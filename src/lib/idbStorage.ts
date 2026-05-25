// Minimal IndexedDB key-value storage adapter compatible with Zustand's
// `createJSONStorage`. Used for stores that may hold large Base64 photos and
// would otherwise blow past the ~5 Mo localStorage quota.

import type { StateStorage } from "zustand/middleware";
import { logger } from "./logger";

const DB_NAME = "kbv-store";
const STORE_NAME = "kv";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB not available"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

async function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await getDB();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE_NAME, mode);
    const store = t.objectStore(STORE_NAME);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const idbStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const v = await tx<string | undefined>("readonly", (s) => s.get(name) as IDBRequest<string | undefined>);
      if (v !== undefined && v !== null) {
        return v;
      }
      // Safe migration from localStorage to IndexedDB
      if (typeof window !== "undefined" && window.localStorage) {
        const localVal = window.localStorage.getItem(name);
        if (localVal) {
          logger.log(`[idbStorage] Migrating key "${name}" from localStorage to IndexedDB`);
          await tx("readwrite", (s) => s.put(localVal, name));
          window.localStorage.removeItem(name);
          return localVal;
        }
      }
      return null;
    } catch (e) {
      logger.warn("idbStorage.getItem failed:", e);
      return null;
    }
  },
  setItem: async (name, value) => {
    try {
      await tx("readwrite", (s) => s.put(value, name));
    } catch (e) {
      logger.warn("idbStorage.setItem failed:", e);
    }
  },
  removeItem: async (name) => {
    try {
      await tx("readwrite", (s) => s.delete(name));
    } catch (e) {
      logger.warn("idbStorage.removeItem failed:", e);
    }
  },
};

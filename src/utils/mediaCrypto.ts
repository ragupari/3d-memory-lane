import { useEffect, useState } from "react";

const VERIFIER_PLAINTEXT = "PARISHI_AMMU_VERIFIED_V1";

interface EncryptedFileEntry {
  encPath: string;
  iv: string;
  mimeType: string;
}

export interface EncryptedManifest {
  version: 1;
  salt: string;
  iterations: number;
  keyLength: number;
  verifier: {
    iv: string;
    data: string;
  };
  files: Record<string, EncryptedFileEntry>;
}

let manifestPromise: Promise<EncryptedManifest> | null = null;
let activeCryptoKey: CryptoKey | null = null;
const encryptedBufferCache = new Map<string, Promise<ArrayBuffer>>();
const decryptedBlobUrlCache = new Map<string, Promise<string>>();
const unlockListeners = new Set<() => void>();

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const binary = window.atob(b64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function fetchEncryptedBytes(encPath: string): Promise<ArrayBuffer> {
  const existing = encryptedBufferCache.get(encPath);
  if (existing) return existing;
  const p = fetch(encPath).then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to fetch encrypted media: ${encPath}`);
    }
    return res.arrayBuffer();
  });
  p.catch(() => encryptedBufferCache.delete(encPath));
  encryptedBufferCache.set(encPath, p);
  return p;
}

export function fetchEncryptedManifest(): Promise<EncryptedManifest> {
  if (!manifestPromise) {
    manifestPromise = fetch("/encrypted/manifest.json", {
      cache: "no-store",
    }).then((res) => {
      if (!res.ok) {
        throw new Error("Could not load encrypted media manifest.");
      }
      return res.json() as Promise<EncryptedManifest>;
    });
    // Pre-fetch the encrypted BGM bytes so decryption is instantaneous on unlock
    manifestPromise
      .then((m) => {
        const bgmEntry = m.files["/audio/bgm.mp3"];
        if (bgmEntry) {
          void fetchEncryptedBytes(bgmEntry.encPath);
        }
      })
      .catch(() => {});
  }
  return manifestPromise;
}

export function isMediaUnlocked(): boolean {
  return activeCryptoKey !== null;
}

export function onMediaUnlocked(listener: () => void): () => void {
  unlockListeners.add(listener);
  return () => {
    unlockListeners.delete(listener);
  };
}

/**
 * Derives an AES-256-GCM key from the user-entered passcode via PBKDF2-SHA256
 * and verifies it against the encrypted manifest verifier.
 * Returns true only if the passcode matches the SECRET_KEY from .env.
 */
export async function unlockWithPasscode(rawInput: string): Promise<boolean> {
  const normalized = rawInput.trim().toUpperCase();
  if (!normalized) return false;

  try {
    const manifest = await fetchEncryptedManifest();
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(normalized),
      "PBKDF2",
      false,
      ["deriveKey"],
    );

    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: base64ToBytes(manifest.salt),
        iterations: manifest.iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );

    const verifierPlainBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64ToBytes(manifest.verifier.iv),
      },
      derivedKey,
      base64ToBytes(manifest.verifier.data),
    );

    const text = new TextDecoder().decode(verifierPlainBuffer);
    if (text !== VERIFIER_PLAINTEXT) {
      return false;
    }

    activeCryptoKey = derivedKey;
    unlockListeners.forEach((fn) => fn());
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches and decrypts a protected media file (/photos/*, /videos/*, /audio/*)
 * in memory using the unlocked AES-256-GCM key, returning a blob: Object URL.
 */
export async function getDecryptedMediaUrl(webPath?: string): Promise<string> {
  if (!webPath) return "";
  if (webPath.startsWith("blob:") || webPath.startsWith("data:")) {
    return webPath;
  }
  if (!activeCryptoKey) {
    throw new Error("Media is locked. Enter the secret key first.");
  }

  const cached = decryptedBlobUrlCache.get(webPath);
  if (cached) return cached;

  const task = (async () => {
    const manifest = await fetchEncryptedManifest();
    const entry = manifest.files[webPath];
    if (!entry) {
      throw new Error(`Protected media entry not found for ${webPath}`);
    }
    if (!activeCryptoKey) {
      throw new Error("Media is locked.");
    }

    const encryptedBuffer = await fetchEncryptedBytes(entry.encPath);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64ToBytes(entry.iv),
      },
      activeCryptoKey,
      encryptedBuffer,
    );

    const blob = new Blob([decryptedBuffer], { type: entry.mimeType });
    return URL.createObjectURL(blob);
  })();

  task.catch(() => {
    decryptedBlobUrlCache.delete(webPath);
  });

  decryptedBlobUrlCache.set(webPath, task);
  return task;
}

/**
 * React hook that resolves a protected media path to its decrypted blob: URL
 * once unlocked.
 */
export function useDecryptedUrl(webPath?: string): string {
  const [url, setUrl] = useState<string>("");
  const [unlockedTick, setUnlockedTick] = useState(() =>
    isMediaUnlocked() ? 1 : 0,
  );

  useEffect(() => {
    return onMediaUnlocked(() => {
      setUnlockedTick((n) => n + 1);
    });
  }, []);

  useEffect(() => {
    if (!webPath || !activeCryptoKey) {
      setUrl("");
      return;
    }
    let cancelled = false;
    getDecryptedMediaUrl(webPath)
      .then((resolved) => {
        if (!cancelled) setUrl(resolved);
      })
      .catch(() => {
        if (!cancelled) setUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [webPath, unlockedTick]);

  return url;
}

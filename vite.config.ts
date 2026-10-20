import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const PBKDF2_ITERATIONS = 100_000;
const VERIFIER_PLAINTEXT = "PARISHI_AMMU_VERIFIED_V1";
const PROTECTED_DIRS = ["photos", "videos", "audio"];

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".opus": "audio/ogg; codecs=opus",
  ".ogg": "audio/ogg",
};

interface EncryptedFileEntry {
  encPath: string;
  iv: string;
  mimeType: string;
}

interface EncryptedManifest {
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

function encryptBuffer(plain: Buffer, key: Buffer): { iv: Buffer; encrypted: Buffer } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Web Crypto AES-GCM expects ciphertext || 16-byte authTag
  return { iv, encrypted: Buffer.concat([ciphertext, authTag]) };
}

function collectMediaFiles(publicDir: string): { webPath: string; absPath: string }[] {
  const results: { webPath: string; absPath: string }[] = [];
  for (const dir of PROTECTED_DIRS) {
    const dirPath = path.join(publicDir, dir);
    if (!fs.existsSync(dirPath)) continue;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || entry.name.startsWith(".")) continue;
      results.push({
        webPath: `/${dir}/${entry.name}`,
        absPath: path.join(dirPath, entry.name),
      });
    }
  }
  return results;
}

function encryptedMediaPlugin(rawSecretKey: string): Plugin {
  const secretKey = rawSecretKey.trim().toUpperCase();
  if (!secretKey) {
    throw new Error(
      "Missing SECRET_KEY in .env! Set SECRET_KEY in .env to encrypt and protect media files.",
    );
  }

  const publicDir = path.resolve(process.cwd(), "public");
  // Deterministic salt from secretKey so dev server & build produce consistent encryption per key
  const salt = crypto
    .createHash("sha256")
    .update(`parishi-ammu-salt:${secretKey}`)
    .digest()
    .subarray(0, 16);
  const derivedKey = crypto.pbkdf2Sync(
    Buffer.from(secretKey, "utf-8"),
    salt,
    PBKDF2_ITERATIONS,
    32,
    "sha256",
  );

  const buildMemoryStore = () => {
    const mediaFiles = collectMediaFiles(publicDir);
    const ver = encryptBuffer(Buffer.from(VERIFIER_PLAINTEXT, "utf-8"), derivedKey);
    const files: Record<string, EncryptedFileEntry> = {};
    const blobs = new Map<string, Buffer>();

    for (const item of mediaFiles) {
      const hash = crypto
        .createHash("sha256")
        .update(item.webPath)
        .digest("hex")
        .slice(0, 28);
      const encPath = `/encrypted/${hash}.enc`;
      const ext = path.extname(item.absPath).toLowerCase();
      const mimeType = MIME_BY_EXT[ext] ?? "application/octet-stream";
      const rawBytes = fs.readFileSync(item.absPath);
      const { iv, encrypted } = encryptBuffer(rawBytes, derivedKey);

      files[item.webPath] = {
        encPath,
        iv: iv.toString("base64"),
        mimeType,
      };
      blobs.set(encPath, encrypted);
    }

    const manifest: EncryptedManifest = {
      version: 1,
      salt: salt.toString("base64"),
      iterations: PBKDF2_ITERATIONS,
      keyLength: secretKey.length,
      verifier: {
        iv: ver.iv.toString("base64"),
        data: ver.encrypted.toString("base64"),
      },
      files,
    };

    return { manifest, blobs };
  };

  return {
    name: "encrypted-media-plugin",
    configureServer(server) {
      let cache: ReturnType<typeof buildMemoryStore> | null = null;
      const getStore = () => {
        if (!cache) cache = buildMemoryStore();
        return cache;
      };

      // Invalidate cache if any file in public/photos, public/videos, public/audio changes
      server.watcher.on("all", (_, filePath) => {
        if (filePath.includes(path.join("public", "photos")) ||
            filePath.includes(path.join("public", "videos")) ||
            filePath.includes(path.join("public", "audio"))) {
          cache = null;
        }
      });

      server.middlewares.use((req, res, next) => {
        const urlPath = (req.url ?? "").split("?")[0];

        // Block direct unencrypted access to sensitive photos, videos, and audio
        if (
          urlPath.startsWith("/photos/") ||
          urlPath.startsWith("/videos/") ||
          urlPath.startsWith("/audio/")
        ) {
          res.statusCode = 403;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end("403 Forbidden: Media is encrypted and requires unlocking with SECRET_KEY.");
          return;
        }

        if (urlPath === "/encrypted/manifest.json") {
          const { manifest } = getStore();
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify(manifest));
          return;
        }

        if (urlPath.startsWith("/encrypted/") && urlPath.endsWith(".enc")) {
          const { blobs } = getStore();
          const buf = blobs.get(urlPath);
          if (buf) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/octet-stream");
            res.end(buf);
            return;
          }
        }

        next();
      });
    },
    closeBundle() {
      const distDir = path.resolve(process.cwd(), "dist");
      if (!fs.existsSync(distDir)) return;

      const { manifest, blobs } = buildMemoryStore();
      const encDir = path.join(distDir, "encrypted");
      fs.mkdirSync(encDir, { recursive: true });

      fs.writeFileSync(
        path.join(encDir, "manifest.json"),
        JSON.stringify(manifest),
        "utf-8",
      );

      for (const [encPath, buf] of blobs.entries()) {
        const fileName = path.basename(encPath);
        fs.writeFileSync(path.join(encDir, fileName), buf);
      }

      // Remove unencrypted photos, videos, and audio from dist/ so public hosting never exposes them
      for (const dir of PROTECTED_DIRS) {
        const target = path.join(distDir, dir);
        if (fs.existsSync(target)) {
          fs.rmSync(target, { recursive: true, force: true });
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const secretKey = env.SECRET_KEY || env.VITE_SECRET_KEY || "";

  return {
    plugins: [react(), tailwindcss(), encryptedMediaPlugin(secretKey)],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            three: ["three", "@react-three/fiber", "@react-three/drei"],
          },
        },
      },
    },
  };
});

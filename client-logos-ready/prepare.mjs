import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import sharp from "sharp";

const OUTPUT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(OUTPUT_DIR, "..");
const SOURCE_DIR = path.join(PROJECT_ROOT, "src", "assets", "logos-clientes");
const MANIFEST_PATH = path.join(OUTPUT_DIR, "manifest.v1.json");

const CANVAS = Object.freeze({ width: 480, height: 180 });
const MAX_SOURCE_BYTES = 2_000_000;
const MAX_EMBEDDED_IMAGE_PIXELS = 40_000_000;
const MAX_FILE_BYTES = 150_000;
const MAX_TOTAL_BYTES = 460_000;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

// This is the approved visual order. Source filenames intentionally remain unchanged.
const CLIENTS = Object.freeze([
  { sourceFile: "5.svg", name: "Banco Topázio", slug: "banco-topazio" },
  { sourceFile: "10.svg", name: "Sicredi", slug: "sicredi" },
  { sourceFile: "4.svg", name: "Peccin", slug: "peccin" },
  { sourceFile: "8.svg", name: "Panvel", slug: "panvel" },
  { sourceFile: "2.svg", name: "Mundial S.A.", slug: "mundial-sa" },
  { sourceFile: "9.svg", name: "STIHL", slug: "stihl" },
  { sourceFile: "1.svg", name: "Ação Sistemas", slug: "acao-sistemas" },
  { sourceFile: "7.svg", name: "Getnet", slug: "getnet" },
  { sourceFile: "3.svg", name: "Saque e Pague", slug: "saque-e-pague" },
  { sourceFile: "12.svg", name: "GHC", slug: "ghc" },
  { sourceFile: "6.svg", name: "OLFAR", slug: "olfar" },
  { sourceFile: "11.svg", name: "Sementes Estrela", slug: "sementes-estrela" },
]);

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function validateEmbeddedPng(reference, sourceFile) {
  const base64 = reference.slice("data:image/png;base64,".length);
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
    throw new Error(`${sourceFile}: malformed embedded PNG encoding`);
  }

  const png = Buffer.from(base64, "base64");
  if (
    png.length < 33 ||
    !png.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE) ||
    png.readUInt32BE(8) !== 13 ||
    png.toString("ascii", 12, 16) !== "IHDR"
  ) {
    throw new Error(`${sourceFile}: invalid embedded PNG signature`);
  }

  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (
    width === 0 ||
    height === 0 ||
    width * height > MAX_EMBEDDED_IMAGE_PIXELS
  ) {
    throw new Error(`${sourceFile}: embedded PNG dimensions exceed the safety limit`);
  }

  let offset = 8;
  while (offset + 12 <= png.length) {
    const chunkLength = png.readUInt32BE(offset);
    const nextOffset = offset + 12 + chunkLength;
    if (nextOffset > png.length) {
      throw new Error(`${sourceFile}: malformed embedded PNG chunk`);
    }
    if (png.toString("ascii", offset + 4, offset + 8) === "acTL") {
      throw new Error(`${sourceFile}: animated PNG resources are not allowed`);
    }
    offset = nextOffset;
  }
}

export function validateSvgSource(source, sourceFile) {
  if (source.length > MAX_SOURCE_BYTES) {
    throw new Error(`${sourceFile}: source exceeds ${MAX_SOURCE_BYTES} bytes`);
  }

  const svg = source.toString("utf8");
  if (!/^\s*<svg\b/i.test(svg)) {
    throw new Error(`${sourceFile}: expected an SVG document`);
  }
  if (/<!DOCTYPE|<!ENTITY|<script\b|<foreignObject\b|@import\b/i.test(svg)) {
    throw new Error(`${sourceFile}: unsafe SVG construct detected`);
  }
  const cssReferences = svg.matchAll(
    /url\(\s*(?:"([^"]+)"|'([^']+)'|([^\s)]+))\s*\)/gi,
  );
  for (const match of cssReferences) {
    const reference = match[1] ?? match[2] ?? match[3];
    if (!reference.startsWith("#")) {
      throw new Error(`${sourceFile}: external CSS resource detected`);
    }
  }

  const resourceReferences = [
    ...svg.matchAll(/\b(?:href|xlink:href)\s*=\s*["']([^"']+)["']/gi),
  ];
  if (resourceReferences.length === 0) {
    throw new Error(`${sourceFile}: expected an embedded raster image`);
  }
  for (const [, reference] of resourceReferences) {
    if (!reference.startsWith("data:image/png;base64,")) {
      throw new Error(`${sourceFile}: only embedded PNG resources are allowed`);
    }
    validateEmbeddedPng(reference, sourceFile);
  }
}

async function buildLogo(client, index) {
  const sourcePath = path.join(SOURCE_DIR, client.sourceFile);
  const filename = `${client.slug}.webp`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  const source = await readFile(sourcePath);
  validateSvgSource(source, client.sourceFile);

  const sourceMetadata = await sharp(source, { failOn: "error" }).metadata();
  if (sourceMetadata.format !== "svg") {
    throw new Error(`${client.sourceFile}: expected SVG input`);
  }

  const { data, info } = await sharp(source, {
    density: 192,
    failOn: "error",
    limitInputPixels: 40_000_000,
  })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(CANVAS.width, CANVAS.height, {
      fit: "contain",
      position: "centre",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({
      quality: 92,
      alphaQuality: 100,
      smartSubsample: true,
      effort: 6,
    })
    .toBuffer({ resolveWithObject: true });

  if (info.width !== CANVAS.width || info.height !== CANVAS.height) {
    throw new Error(`${filename}: expected ${CANVAS.width}x${CANVAS.height}`);
  }
  if (info.channels !== 4) {
    throw new Error(`${filename}: transparency channel was not preserved`);
  }
  if (info.size > MAX_FILE_BYTES) {
    throw new Error(`${filename}: ${info.size} bytes exceeds ${MAX_FILE_BYTES}`);
  }

  const outputMetadata = await sharp(data, { failOn: "error" }).metadata();
  const outputStats = await sharp(data, { failOn: "error" }).stats();
  const alpha = outputStats.channels[3];
  if (
    outputMetadata.format !== "webp" ||
    outputMetadata.width !== CANVAS.width ||
    outputMetadata.height !== CANVAS.height ||
    !outputMetadata.hasAlpha ||
    !alpha ||
    alpha.min >= 255 ||
    alpha.max !== 255 ||
    (outputMetadata.pages ?? 1) !== 1
  ) {
    throw new Error(`${filename}: output verification failed`);
  }

  return {
    outputPath,
    data,
    manifestEntry: {
      source: path.posix.join("src", "assets", "logos-clientes", client.sourceFile),
      sourceSha256: sha256(source),
      name: client.name,
      slug: client.slug,
      filename,
      order: index + 1,
      bytes: data.length,
      sha256: sha256(data),
    },
  };
}

async function writeVerifiedOutput(outputPath, data) {
  try {
    const existingTarget = await lstat(outputPath);
    if (!existingTarget.isFile()) {
      throw new Error(`${path.basename(outputPath)}: unsafe output target`);
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  await writeFile(outputPath, data);
  const persisted = await readFile(outputPath);
  if (persisted.length !== data.length || sha256(persisted) !== sha256(data)) {
    throw new Error(`${path.basename(outputPath)}: persisted output verification failed`);
  }
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const generatedLogos = [];
  for (const [index, client] of CLIENTS.entries()) {
    generatedLogos.push(await buildLogo(client, index));
  }

  const clients = generatedLogos.map(({ manifestEntry }) => manifestEntry);
  const totalBytes = clients.reduce((sum, client) => sum + client.bytes, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    throw new Error(`logo set: ${totalBytes} bytes exceeds ${MAX_TOTAL_BYTES}`);
  }

  const manifest = {
    schemaVersion: 1,
    assetVersion: "v1",
    generatedBy: "node client-logos-ready/prepare.mjs",
    sourceDirectory: "src/assets/logos-clientes",
    outputDirectory: "client-logos-ready",
    canvas: { ...CANVAS, fit: "contain", background: "transparent" },
    encoding: {
      format: "webp",
      quality: 92,
      alphaQuality: 100,
      smartSubsample: true,
      effort: 6,
    },
    limits: {
      maxFileBytes: MAX_FILE_BYTES,
      maxTotalBytes: MAX_TOTAL_BYTES,
    },
    totals: {
      clientCount: clients.length,
      bytes: totalBytes,
    },
    clients,
  };

  let committedManifest;
  try {
    committedManifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  if (
    committedManifest &&
    JSON.stringify(committedManifest) !== JSON.stringify(manifest)
  ) {
    throw new Error("manifest.v1.json does not match the generated assets");
  }

  for (const { outputPath, data } of generatedLogos) {
    await writeVerifiedOutput(outputPath, data);
  }

  console.log(
    committedManifest
      ? `Validated ${clients.length} logos (${totalBytes} bytes) and manifest.v1.json.`
      : JSON.stringify(manifest, null, 2),
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  await main();
}

#!/usr/bin/env node
/**
 * Downloads exercise demo GIFs for self-hosting on Hostinger.
 *
 * Reads source URLs from database/seed_exercise_media.sql, saves files to:
 *   hostinger-upload/fitguide/media/exercises/{slug}.gif
 *
 * Emits Hostinger SQL:
 *   database/seed_exercise_media_hostinger.sql
 *
 * Usage:
 *   node scripts/download-exercise-media.mjs
 *   MEDIA_BASE_URL=https://lpsynch.com/fitguide/media/exercises node scripts/download-exercise-media.mjs
 *   node scripts/download-exercise-media.mjs --force
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const SOURCE_SQL = path.join(ROOT, 'database/seed_exercise_media.sql');
const OUTPUT_SQL = path.join(ROOT, 'database/seed_exercise_media_hostinger.sql');
const OUTPUT_DIR = path.join(ROOT, 'hostinger-upload/fitguide/media/exercises');
const MANIFEST_PATH = path.join(ROOT, 'hostinger-upload/manifest.json');

const DEFAULT_MEDIA_BASE_URL = 'https://lpsynch.com/fitguide/media/exercises';
const CONCURRENCY = 4;

const force = process.argv.includes('--force');
const mediaBaseUrl = (process.env.MEDIA_BASE_URL ?? DEFAULT_MEDIA_BASE_URL).replace(/\/$/, '');

function parseSeedSql(content) {
  const pattern = /UPDATE exercises SET thumbnail_url = '([^']+)' WHERE slug = '([^']+)';/g;
  const entries = [];

  for (const match of content.matchAll(pattern)) {
    entries.push({ sourceUrl: match[1], slug: match[2] });
  }

  return entries;
}

function sqlEscape(value) {
  return value.replace(/'/g, "''");
}

async function downloadFile(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(destination, buffer);
  return buffer.length;
}

async function runPool(items, worker) {
  const results = new Array(items.length);
  let index = 0;

  async function next() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, () => next()));
  return results;
}

async function main() {
  if (!fs.existsSync(SOURCE_SQL)) {
    throw new Error(`Missing ${SOURCE_SQL}. Run: npm run link-media`);
  }

  const entries = parseSeedSql(fs.readFileSync(SOURCE_SQL, 'utf8'));
  if (!entries.length) {
    throw new Error('No exercise media rows found in seed_exercise_media.sql');
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.error(`Downloading ${entries.length} GIFs → ${OUTPUT_DIR}`);
  console.error(`Hostinger base URL: ${mediaBaseUrl}\n`);

  const manifest = {
    generatedAt: new Date().toISOString(),
    mediaBaseUrl,
    uploadPath: 'public_html/fitguide/media/exercises/',
    files: [],
  };

  const results = await runPool(entries, async (entry, i) => {
    const filename = `${entry.slug}.gif`;
    const destination = path.join(OUTPUT_DIR, filename);
    const hostingerUrl = `${mediaBaseUrl}/${filename}`;

    process.stderr.write(`[${i + 1}/${entries.length}] ${entry.slug} … `);

    try {
      if (fs.existsSync(destination) && !force) {
        const size = fs.statSync(destination).size;
        process.stderr.write(`skipped (${Math.round(size / 1024)} KB exists)\n`);
        manifest.files.push({
          slug: entry.slug,
          filename,
          hostingerUrl,
          bytes: size,
          status: 'skipped',
        });
        return { slug: entry.slug, hostingerUrl, ok: true };
      }

      const bytes = await downloadFile(entry.sourceUrl, destination);
      process.stderr.write(`ok (${Math.round(bytes / 1024)} KB)\n`);
      manifest.files.push({
        slug: entry.slug,
        filename,
        hostingerUrl,
        sourceUrl: entry.sourceUrl,
        bytes,
        status: 'downloaded',
      });
      return { slug: entry.slug, hostingerUrl, ok: true };
    } catch (error) {
      process.stderr.write(`failed (${error.message})\n`);
      manifest.files.push({
        slug: entry.slug,
        filename,
        hostingerUrl,
        sourceUrl: entry.sourceUrl,
        status: 'failed',
        error: error.message,
      });
      return { slug: entry.slug, hostingerUrl, ok: false };
    }
  });

  const ok = results.filter((row) => row.ok);
  const failed = results.filter((row) => !row.ok);
  const totalBytes = manifest.files.reduce((sum, file) => sum + (file.bytes ?? 0), 0);

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  const sqlLines = [
    '-- Fit Guide — self-hosted exercise demo GIFs (Hostinger)',
    '-- Upload hostinger-upload/fitguide/media/exercises/*.gif to:',
    '--   public_html/fitguide/media/exercises/',
    `-- Base URL: ${mediaBaseUrl}`,
    '-- Run in Supabase SQL Editor after files are uploaded.\n',
  ];

  for (const row of ok) {
    sqlLines.push(
      `UPDATE exercises SET thumbnail_url = '${sqlEscape(row.hostingerUrl)}' WHERE slug = '${sqlEscape(row.slug)}';`,
    );
  }

  fs.writeFileSync(OUTPUT_SQL, `${sqlLines.join('\n')}\n`);

  console.error(`\nDone: ${ok.length}/${entries.length} ready`);
  console.error(`Total size: ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
  console.error(`Local upload folder: hostinger-upload/fitguide/media/exercises/`);
  console.error(`SQL file: database/seed_exercise_media_hostinger.sql`);
  console.error(`Manifest: hostinger-upload/manifest.json`);

  if (failed.length) {
    console.error(`\nFailed (${failed.length}): ${failed.map((row) => row.slug).join(', ')}`);
    console.error('Re-run with --force after fixing network issues.');
    process.exitCode = 1;
  } else {
    console.error('\nNext steps:');
    console.error('1. Upload hostinger-upload/fitguide/media/exercises/ to Hostinger File Manager');
    console.error('   Target path: public_html/fitguide/media/exercises/');
    console.error('2. Verify in browser, e.g.:');
    console.error(`   ${mediaBaseUrl}/barbell-bench-press.gif`);
    console.error('3. Run database/seed_exercise_media_hostinger.sql in Supabase SQL Editor');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

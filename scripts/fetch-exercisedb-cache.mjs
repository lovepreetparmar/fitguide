#!/usr/bin/env node
/**
 * Downloads ExerciseDB catalog to scripts/data/exercisedb-cache.json
 * Run: npm run fetch-exercisedb
 *
 * The API reports total=1500 but hasNextPage can stay true forever,
 * so we stop once we have that many unique exercise IDs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'data/exercisedb-cache.json');
const API = 'https://oss.exercisedb.dev/api/v1/exercises';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(cursor) {
  const url = new URL(API);
  url.searchParams.set('limit', '25');
  if (cursor) url.searchParams.set('cursor', cursor);

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(url);
    if (response.status === 429) {
      await sleep(2000 * (attempt + 1));
      continue;
    }
    if (!response.ok) {
      throw new Error(`ExerciseDB failed: ${response.status}`);
    }
    return response.json();
  }

  throw new Error('ExerciseDB rate limit exceeded');
}

async function main() {
  const items = [];
  const seenIds = new Set();
  let cursor;
  let page = 0;
  let expectedTotal = 1500;

  for (;;) {
    page += 1;
    const payload = await fetchPage(cursor);
    expectedTotal = payload.meta?.total ?? expectedTotal;

    for (const item of payload.data ?? []) {
      if (seenIds.has(item.exerciseId)) continue;
      seenIds.add(item.exerciseId);
      items.push(item);
    }

    process.stderr.write(`page ${page}: ${items.length}/${expectedTotal} unique exercises\n`);

    if (items.length >= expectedTotal) break;
    if (!payload.meta?.hasNextPage || !payload.meta?.nextCursor) break;
    cursor = payload.meta.nextCursor;
    await sleep(900);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(items, null, 2));
  const sizeKb = Math.round(fs.statSync(OUT).size / 1024);
  process.stderr.write(`saved ${items.length} exercises (${sizeKb} KB) -> ${OUT}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Maps Fit Guide exercises to free exercise demo GIFs and emits SQL updates.
 * Source: ExerciseGymGifsDB via jsDelivr CDN (free, no API key)
 * https://github.com/JahelCuadrado/ExerciseGymGifsDB
 *
 * Run: node scripts/link-exercise-media.mjs > database/seed_exercise_media.sql
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const GIF_INDEX_URL =
  'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/api/en/search.json';

/** Fit Guide slug → remote GIF catalog slug when names differ. */
const SLUG_ALIASES = {
  'barbell-squat': 'barbell-full-squat',
  deadlift: 'barbell-deadlift',
  'overhead-press': 'barbell-seated-overhead-press',
  'romanian-deadlift': 'barbell-romanian-deadlift',
  'sumo-deadlift': 'barbell-sumo-deadlift',
  'lat-pulldown': 'cable-pulldown-pro-lat-bar',
  'tricep-pushdown': 'cable-triceps-pushdown-v-bar',
  'hip-thrust': 'barbell-glute-bridge',
  'leg-press': 'sled-45-leg-press',
  'dumbbell-bicep-curl': 'dumbbell-biceps-curl',
  plank: 'weighted-front-plank',
  'incline-dumbbell-press': 'dumbbell-incline-bench-press',
  'incline-barbell-bench-press': 'barbell-incline-bench-press',
  'decline-bench-press': 'barbell-decline-bench-press',
  'close-grip-bench-press': 'barbell-close-grip-bench-press',
  'cable-chest-fly': 'cable-incline-fly',
  'machine-chest-press': 'lever-chest-press',
  'pec-deck-fly': 'lever-seated-fly',
  'floor-press': 'barbell-one-arm-floor-press',
  'incline-cable-fly': 'cable-incline-fly',
  'bent-over-barbell-row': 'barbell-bent-over-row',
  'seated-cable-row': 'cable-seated-row',
  't-bar-row': 'lever-t-bar-row',
  'single-arm-dumbbell-row': 'dumbbell-one-arm-bent-over-row',
  'face-pull': 'cable-standing-rear-delt-row-with-rope',
  'chest-supported-row': 'lever-seated-row',
  'pendlay-row': 'barbell-pendlay-row',
  'straight-arm-pulldown': 'cable-straight-arm-pulldown',
  'rack-pull': 'barbell-rack-pull',
  'dumbbell-shoulder-press': 'dumbbell-standing-overhead-press',
  'lateral-raise': 'dumbbell-lateral-raise',
  'arnold-press': 'dumbbell-arnold-press',
  'front-raise': 'dumbbell-front-raise',
  'rear-delt-fly': 'dumbbell-rear-fly',
  'upright-row': 'barbell-upright-row',
  'push-press': 'dumbbell-push-press',
  'machine-shoulder-press': 'lever-shoulder-press',
  'skull-crusher': 'barbell-lying-triceps-extension',
  'overhead-tricep-extension': 'dumbbell-standing-triceps-extension',
  'tricep-kickback': 'dumbbell-kickback',
  'parallel-bar-dip': 'weighted-tricep-dips',
  'cable-overhead-extension': 'cable-overhead-triceps-extension-rope-attachment',
  'single-arm-cable-pushdown': 'cable-one-arm-tricep-pushdown',
  'reverse-grip-pushdown': 'cable-reverse-grip-pushdown',
  'bench-dip': 'weighted-bench-dip',
  'spider-curl': 'ez-barbell-spider-curl',
  'cable-hammer-curl': 'cable-hammer-curl-with-rope',
  'machine-bicep-curl': 'smith-machine-bicep-curl',
  'cable-pull-through': 'cable-pull-through-with-rope',
  'hammer-curl': 'dumbbell-hammer-curl',
  'preacher-curl': 'dumbbell-preacher-curl',
  'concentration-curl': 'dumbbell-concentration-curl',
  'incline-dumbbell-curl': 'dumbbell-incline-curl',
  'ez-bar-curl': 'ez-barbell-curl',
  'reverse-curl': 'barbell-reverse-curl',
  'drag-curl': 'barbell-drag-curl',
  'cross-body-hammer-curl': 'dumbbell-cross-body-hammer-curl',
  'walking-lunge': 'dumbbell-walking-lunge',
  'leg-curl': 'lever-lying-leg-curl',
  'bulgarian-split-squat': 'dumbbell-single-leg-split-squat',
  'standing-calf-raise': 'barbell-standing-calf-raise',
  'goblet-squat': 'dumbbell-goblet-squat',
  'leg-extension': 'lever-leg-extension',
  'front-squat': 'barbell-front-squat',
  'hack-squat': 'sled-hack-squat',
  'step-up': 'dumbbell-step-up',
  'single-leg-romanian-deadlift': 'dumbbell-romanian-deadlift',
  'seated-calf-raise': 'lever-seated-calf-raise',
  'machine-high-row': 'lever-high-row',
  'jm-press': 'barbell-jm-bench-press',
  'bradford-press': 'barbell-standing-bradford-press',
  'y-raise': 'dumbbell-incline-y-raise',
  'landmine-press': 'landmine-lateral-raise',
  'svend-press': 'weighted-svend-press',
  'resistance-band-chest-press': 'resistance-band-seated-chest-press',
  'meadows-row': 'barbell-one-arm-bent-over-row',
  'wide-grip-cable-row': 'cable-seated-wide-grip-row',
  'resistance-band-row': 'resistance-band-seated-straight-back-row',
  'seal-row': 'cambered-bar-lying-row',
  'lu-raise': 'dumbbell-incline-y-raise',
  'cable-face-pull-to-press': 'cable-standing-rear-delt-row-with-rope',
  'plate-front-raise': 'weighted-front-raise',
  'landmine-shoulder-press': 'landmine-lateral-raise',
  'ez-bar-skull-crusher': 'ez-barbell-decline-triceps-extension',
  'floor-skull-crusher': 'barbell-lying-triceps-extension-skull-crusher',
  'resistance-band-pushdown': 'band-side-triceps-extension',
  'machine-tricep-extension': 'lever-triceps-extension',
  '21s-curl': 'dumbbell-biceps-curl',
  'resistance-band-curl': 'resistance-band-seated-biceps-curl',
  'box-squat': 'barbell-full-squat',
  'nordic-hamstring-curl': 'glute-ham-raise',
};

/** Search-name hints when slug aliases are insufficient. */
const NAME_ALIASES = {
  'barbell-bench-press': 'barbell bench press',
  'barbell-squat': 'barbell full squat',
  deadlift: 'barbell deadlift',
  'pull-up': 'pull up',
  'push-up': 'push up',
  'lat-pulldown': 'cable pulldown',
  'overhead-press': 'barbell overhead press',
  'dumbbell-bicep-curl': 'dumbbell bicep curl',
  'romanian-deadlift': 'barbell romanian deadlift',
  plank: 'front plank',
  'tricep-pushdown': 'triceps pushdown',
  'hip-thrust': 'barbell hip thrust',
  'leg-press': 'sled 45 leg press',
  'dumbbell-bench-press': 'dumbbell bench press',
  'incline-dumbbell-press': 'incline dumbbell bench press',
  'incline-barbell-bench-press': 'incline barbell bench press',
  'decline-bench-press': 'decline barbell bench press',
  'close-grip-bench-press': 'close grip bench press',
  'cable-chest-fly': 'cable chest fly',
  'diamond-push-up': 'diamond push up',
  'machine-chest-press': 'chest press machine',
  'pec-deck-fly': 'pec deck fly',
  'dumbbell-pullover': 'dumbbell pullover',
  'landmine-press': 'landmine press',
  'floor-press': 'barbell floor press',
  'incline-cable-fly': 'incline cable fly',
  'bent-over-barbell-row': 'barbell bent over row',
  'seated-cable-row': 'seated cable row',
  't-bar-row': 't bar row',
  'single-arm-dumbbell-row': 'dumbbell one arm row',
  'face-pull': 'face pull',
  'chest-supported-row': 'chest supported row',
  'pendlay-row': 'pendlay row',
  'straight-arm-pulldown': 'straight arm pulldown',
  'inverted-row': 'inverted row',
  'rack-pull': 'rack pull',
  'dumbbell-shoulder-press': 'dumbbell shoulder press',
  'lateral-raise': 'dumbbell lateral raise',
  'arnold-press': 'arnold press',
  'front-raise': 'dumbbell front raise',
  'rear-delt-fly': 'dumbbell rear delt fly',
  'cable-lateral-raise': 'cable lateral raise',
  'upright-row': 'barbell upright row',
  'push-press': 'barbell push press',
  'machine-shoulder-press': 'shoulder press machine',
  'skull-crusher': 'barbell lying triceps extension',
  'overhead-tricep-extension': 'dumbbell overhead triceps extension',
  'tricep-kickback': 'triceps kickback',
  'bench-dip': 'bench dip',
  'parallel-bar-dip': 'parallel bar dip',
  'cable-overhead-extension': 'cable overhead triceps extension',
  'single-arm-cable-pushdown': 'single arm cable triceps pushdown',
  'reverse-grip-pushdown': 'reverse grip triceps pushdown',
  'hammer-curl': 'dumbbell hammer curl',
  'barbell-curl': 'barbell curl',
  'preacher-curl': 'preacher curl',
  'concentration-curl': 'concentration curl',
  'cable-curl': 'cable curl',
  'incline-dumbbell-curl': 'incline dumbbell curl',
  'ez-bar-curl': 'ez bar curl',
  'spider-curl': 'spider curl',
  'cable-hammer-curl': 'cable hammer curl',
  'reverse-curl': 'reverse curl',
  'drag-curl': 'drag curl',
  'cross-body-hammer-curl': 'cross body hammer curl',
  'walking-lunge': 'dumbbell walking lunge',
  'leg-curl': 'lying leg curl',
  'bulgarian-split-squat': 'bulgarian split squat',
  'standing-calf-raise': 'standing calf raise',
  'goblet-squat': 'goblet squat',
  'leg-extension': 'leg extension',
  'front-squat': 'barbell front squat',
  'hack-squat': 'hack squat',
  'step-up': 'dumbbell step up',
  'single-leg-romanian-deadlift': 'single leg romanian deadlift',
  "seated-calf-raise": 'seated calf raise',
  'sumo-deadlift': 'sumo deadlift',
  'box-squat': 'box squat',
  'nordic-hamstring-curl': 'nordic hamstring curl',
  'cable-pull-through': 'cable pull through',
};

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function tokenize(value) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function scoreMatch(localName, localSlug, remoteName) {
  const alias = NAME_ALIASES[localSlug];
  if (alias && normalize(alias) === normalize(remoteName)) return 100;

  const localNorm = normalize(localName);
  const remoteNorm = normalize(remoteName);
  if (localNorm === remoteNorm) return 95;
  if (localNorm.includes(remoteNorm) || remoteNorm.includes(localNorm)) return 80;

  const localTokens = new Set(tokenize(localName));
  const remoteTokens = tokenize(remoteName);
  if (!remoteTokens.length) return 0;

  let overlap = 0;
  for (const token of remoteTokens) {
    if (localTokens.has(token)) overlap += 1;
  }
  const ratio = overlap / Math.max(localTokens.size, remoteTokens.length);
  return Math.round(ratio * 70);
}

function parseLocalExercises() {
  const files = ['database/setup_supabase.sql', 'database/seed_exercises_additional.sql'];
  const exercises = new Map();
  const pattern = /\n  '([^']+)',\n  '([a-z0-9-]+)',\n  'c1111111/g;

  for (const file of files) {
    const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
    for (const match of content.matchAll(pattern)) {
      const [, name, slug] = match;
      exercises.set(slug, name);
    }
  }

  return [...exercises.entries()].map(([slug, name]) => ({ slug, name }));
}

function pickBestMatch(local, remoteList) {
  let best = null;
  let bestScore = 0;

  for (const remote of remoteList) {
    const score = scoreMatch(local.name, local.slug, remote.name);
    if (score > bestScore) {
      bestScore = score;
      best = remote;
    }
  }

  return bestScore >= 85 ? { remote: best, score: bestScore } : null;
}

function findMatchForExercise(local, bySlug, allItems) {
  const slugCandidates = [local.slug, SLUG_ALIASES[local.slug]].filter(Boolean);
  for (const slug of slugCandidates) {
    const hit = bySlug.get(slug);
    if (hit?.gifUrl) {
      return { remote: hit, score: 100, method: 'slug' };
    }
  }

  const aliasName = NAME_ALIASES[local.slug];
  if (aliasName) {
    const aliasNorm = normalize(aliasName);
    const exact = allItems.find((item) => normalize(item.name) === aliasNorm);
    if (exact?.gifUrl) {
      return { remote: exact, score: 100, method: 'name-alias' };
    }
  }

  const nameMatch = pickBestMatch(local, allItems);
  if (nameMatch?.remote?.gifUrl) {
    return { ...nameMatch, method: 'fuzzy' };
  }

  return null;
}

function sqlEscape(value) {
  return value.replace(/'/g, "''");
}

async function loadGifCatalog() {
  const response = await fetch(GIF_INDEX_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch GIF catalog: ${response.status}`);
  }
  const payload = await response.json();
  const items = payload.items ?? [];
  const bySlug = new Map(items.map((item) => [item.slug, item]));
  return { items, bySlug };
}

async function main() {
  console.error('Loading exercise GIF catalog from jsDelivr…');
  const { items, bySlug } = await loadGifCatalog();
  console.error(`Catalog: ${items.length} exercises`);

  const localExercises = parseLocalExercises();
  const matches = [];
  const unmatched = [];

  for (const local of localExercises) {
    const result = findMatchForExercise(local, bySlug, items);
    if (result?.remote?.gifUrl) {
      matches.push({
        slug: local.slug,
        name: local.name,
        gifUrl: result.remote.gifUrl,
        matchedName: result.remote.name,
        score: result.score,
        method: result.method,
      });
    } else {
      unmatched.push(local);
    }
  }

  console.error(`Matched ${matches.length}/${localExercises.length} exercises`);
  if (unmatched.length) {
    console.error('Unmatched:', unmatched.map((e) => e.slug).join(', '));
  }

  console.log('-- Fit Guide — exercise demo GIF URLs (ExerciseGymGifsDB via jsDelivr)');
  console.log('-- Run in Supabase SQL Editor after setup_supabase.sql');
  console.log('-- Source: https://github.com/JahelCuadrado/ExerciseGymGifsDB\n');

  for (const match of matches) {
    console.log(
      `UPDATE exercises SET thumbnail_url = '${sqlEscape(match.gifUrl)}' WHERE slug = '${sqlEscape(match.slug)}';`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

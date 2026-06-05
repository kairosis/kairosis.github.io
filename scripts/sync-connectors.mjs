#!/usr/bin/env node
/**
 * Reads each connector in ../../kairosis/connectors/ and generates
 * a Starlight doc page under src/content/docs/connectors/catalog/.
 *
 * Run: node scripts/sync-connectors.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const CONNECTORS_SRC = process.env.CONNECTORS_PATH
  ? resolve(process.env.CONNECTORS_PATH)
  : resolve(import.meta.dirname, '../../kairosis/connectors');
const CATALOG_OUT    = resolve(import.meta.dirname, '../src/content/docs/connectors/catalog');

const TYPE_BADGE = {
  webhook: { text: 'webhook', variant: 'note' },
  poller:  { text: 'poller',  variant: 'tip' },
  device:  { text: 'device',  variant: 'caution' },
  import:  { text: 'import',  variant: 'default' },
  sync:    { text: 'sync',    variant: 'success' },
};

mkdirSync(CATALOG_OUT, { recursive: true });

const dirs = readdirSync(CONNECTORS_SRC, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

const catalogEntries = [];

for (const name of dirs) {
  const dir = join(CONNECTORS_SRC, name);
  const readmePath = join(dir, 'README.md');
  const srcDir = join(dir, 'src');

  if (!existsSync(readmePath)) {
    console.warn(`  skip ${name} — no README.md`);
    continue;
  }

  // --- parse manifest fields from the connector TS source ---
  let connectorType = 'unknown';
  let authType = 'none';
  let description = '';
  let connectorName = name;
  let version = '';

  const tsSources = existsSync(srcDir)
    ? readdirSync(srcDir).filter(f => f.endsWith('.connector.ts')).map(f => join(srcDir, f))
    : [];

  for (const tsFile of tsSources) {
    const src = readFileSync(tsFile, 'utf8');

    const nameMatch   = src.match(/name:\s*['"`]([^'"`]+)['"`]/);
    const descMatch   = src.match(/description:\s*['"`]([^'"`]+)['"`]/);
    const typeMatch   = src.match(/type:\s*['"`](webhook|poller|device|import|sync)['"`]/);
    const authMatch   = src.match(/authType:\s*['"`](oauth2|apikey|basic|none)['"`]/);
    const verMatch    = src.match(/version:\s*['"`]([^'"`]+)['"`]/);

    if (nameMatch)  connectorName  = nameMatch[1];
    if (descMatch)  description    = descMatch[1];
    if (typeMatch)  connectorType  = typeMatch[1];
    if (authMatch)  authType       = authMatch[1];
    if (verMatch)   version        = verMatch[1];
  }

  // --- process README ---
  const readme = readFileSync(readmePath, 'utf8');

  // strip the leading H1 (we use frontmatter title instead)
  const withoutH1 = readme.replace(/^#\s+.+\n/, '').trimStart();

  // extract first paragraph as description fallback
  if (!description) {
    const firstPara = withoutH1.match(/^([^\n]+)/);
    if (firstPara) description = firstPara[1].replace(/\*\*/g, '').trim();
  }

  const badge = TYPE_BADGE[connectorType] ?? TYPE_BADGE.import;

  const frontmatter = [
    '---',
    `title: ${connectorName}`,
    `description: ${description}`,
    'sidebar:',
    '  badge:',
    `    text: ${badge.text}`,
    `    variant: ${badge.variant}`,
    '---',
    '',
  ].join('\n');

  const outPath = join(CATALOG_OUT, `${name}.md`);
  writeFileSync(outPath, frontmatter + withoutH1);
  console.log(`  wrote ${name}.md  (${connectorType})`);

  catalogEntries.push({ name, connectorName, connectorType, description });
}

// --- write catalog index page ---
const typeOrder = ['webhook', 'poller', 'device', 'import', 'sync', 'unknown'];
const grouped = Object.fromEntries(typeOrder.map(t => [t, []]));
for (const e of catalogEntries) {
  (grouped[e.connectorType] ?? grouped['unknown']).push(e);
}

const typeLabels = {
  webhook: 'Webhook connectors',
  poller:  'Poller connectors',
  device:  'Device connectors',
  import:  'Import connectors',
  sync:    'Sync connectors',
  unknown: 'Other',
};

let indexContent = `---
title: Connector Catalog
description: All available Kairosis connectors.
---

`;

for (const type of typeOrder) {
  const entries = grouped[type];
  if (!entries.length) continue;

  indexContent += `## ${typeLabels[type]}\n\n`;
  indexContent += `| Connector | Description |\n|---|---|\n`;
  for (const { name, connectorName, description } of entries) {
    indexContent += `| [${connectorName}](/connectors/catalog/${name}/) | ${description} |\n`;
  }
  indexContent += '\n';
}

writeFileSync(join(CATALOG_OUT, 'index.md'), indexContent);
console.log(`  wrote catalog/index.md  (${catalogEntries.length} connectors)`);

#!/usr/bin/env node
/**
 * Reads each event package in ../../kairosis/events/ and generates
 * a Starlight reference page under src/content/docs/events/.
 *
 * Run: node scripts/sync-events.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const EVENTS_SRC = process.env.EVENTS_PATH
  ? resolve(process.env.EVENTS_PATH)
  : resolve(import.meta.dirname, '../../kairosis/events');

const EVENTS_OUT = resolve(import.meta.dirname, '../src/content/docs/events');

mkdirSync(EVENTS_OUT, { recursive: true });

// ─── Zod type parser ─────────────────────────────────────────────────────────

function zodTypeToHuman(expr) {
  let s = expr.trim().replace(/,$/, '').trim();

  const isOptional = s.includes('.optional()');
  const isNullable = s.includes('.nullable()');
  const defaultMatch = s.match(/\.default\(([^)]*)\)/);
  const hasDefault  = defaultMatch !== null;
  const defaultVal  = hasDefault ? defaultMatch[1] : null;

  // strip modifiers so we can read the base type cleanly
  s = s
    .replace(/\.optional\(\)/g, '')
    .replace(/\.nullable\(\)/g, '')
    .replace(/\.default\([^)]*\)/g, '')
    .replace(/\.catch\([^)]*\)/g, '')
    .trim();

  let typeStr;

  if (s.startsWith('z.string')) {
    if      (s.includes('.url()'))      typeStr = 'string (URL)';
    else if (s.includes('.datetime()')) typeStr = 'string (ISO 8601)';
    else if (s.includes('.email()'))    typeStr = 'string (email)';
    else if (s.includes('.uuid()'))     typeStr = 'string (UUID)';
    else                                typeStr = 'string';
  } else if (s.startsWith('z.coerce') || s.startsWith('z.number')) {
    if      (s.includes('.int()') && s.includes('.positive()'))    typeStr = 'integer > 0';
    else if (s.includes('.int()') && s.includes('.nonnegative()')) typeStr = 'integer ≥ 0';
    else if (s.includes('.int()'))                                  typeStr = 'integer';
    else                                                            typeStr = 'number';
  } else if (s.startsWith('z.boolean')) {
    typeStr = 'boolean';
  } else if (s.startsWith('z.array')) {
    const inner = s.match(/z\.array\((.+)\)$/);
    typeStr = inner ? `${zodTypeToHuman(inner[1]).typeStr}[]` : 'array';
  } else if (s.startsWith('z.enum')) {
    const vals = s.match(/z\.enum\(\[([^\]]+)\]\)/);
    typeStr = vals
      ? vals[1].split(',').map(v => v.trim()).join(' \\| ')
      : 'enum';
  } else if (s.startsWith('z.record')) {
    typeStr = 'Record\\<string, unknown\\>';
  } else if (s.startsWith('z.unknown')) {
    typeStr = 'unknown';
  } else if (!s.startsWith('z.')) {
    // named schema reference — strip trailing Schema suffix
    typeStr = s.replace(/Schema$/, '');
  } else {
    typeStr = s;
  }

  if (isNullable) typeStr += ' \\| null';

  return { typeStr, isOptional, hasDefault, defaultVal };
}

// Extract the content inside the first z.object({...}) block (brace-balanced)
function extractObjectBody(src) {
  const startIdx = src.indexOf('z.object({');
  if (startIdx === -1) return null;

  let depth = 0;
  let bodyStart = -1;

  for (let i = startIdx + 'z.object('.length; i < src.length; i++) {
    if (src[i] === '{') {
      if (depth === 0) bodyStart = i + 1;
      depth++;
    } else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(bodyStart, i);
    }
  }
  return null;
}

function parseFields(objectBody) {
  if (!objectBody) return [];
  const fields = [];

  for (const line of objectBody.split('\n')) {
    const match = line.trim().match(/^(\w+):\s+(.+?),?\s*$/);
    if (!match) continue;

    const [, fieldName, zodExpr] = match;
    // skip lines that are TS keywords or imports leaked in
    if (['import', 'export', 'const', 'type', 'from'].includes(fieldName)) continue;

    const { typeStr, isOptional, hasDefault, defaultVal } = zodTypeToHuman(zodExpr);
    fields.push({ fieldName, typeStr, isOptional: isOptional || hasDefault, defaultVal });
  }

  return fields;
}

function fieldsToTable(fields) {
  if (!fields.length) return '_No fields._\n';
  let t = '| Field | Type | Required | Default |\n|---|---|---|---|\n';
  for (const { fieldName, typeStr, isOptional, defaultVal } of fields) {
    const req = isOptional ? 'No' : 'Yes';
    const def = defaultVal != null ? `\`${defaultVal}\`` : '—';
    t += `| \`${fieldName}\` | \`${typeStr}\` | ${req} | ${def} |\n`;
  }
  return t;
}

// ─── Event-type constant parser ───────────────────────────────────────────────

function parseEventTypes(src) {
  const block = src.match(/=\s*\{([\s\S]*?)\}\s*as const/);
  if (!block) return [];

  const entries = [];
  for (const line of block[1].split('\n')) {
    const m = line.trim().match(/^(\w+):\s*'([^']+)'/);
    if (m) entries.push({ constant: m[1], routingKey: m[2] });
  }
  return entries;
}

// ─── Per-package page generator ───────────────────────────────────────────────

function generatePackagePage(name, dir) {
  const pkgPath = join(dir, 'package.json');
  if (!existsSync(pkgPath)) return null;

  const pkg     = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const pkgName = pkg.name;
  const version = pkg.version ?? '0.1.0';
  const srcDir  = join(dir, 'src');

  // ── event types ──
  const eventTypesPath = join(srcDir, 'event-types.ts');
  const eventTypes = existsSync(eventTypesPath)
    ? parseEventTypes(readFileSync(eventTypesPath, 'utf8'))
    : [];

  // ── payload schemas ──
  const payloadsDir = join(srcDir, 'payloads');
  const payloads = [];

  if (existsSync(payloadsDir)) {
    for (const file of readdirSync(payloadsDir).filter(f => f.endsWith('.ts')).sort()) {
      const src    = readFileSync(join(payloadsDir, file), 'utf8');
      const nameM  = src.match(/export const (\w+Payload)\s*=/);
      if (!nameM) continue;

      const schemaName = nameM[1];
      const body   = extractObjectBody(src);
      const fields = parseFields(body);

      // find which event type(s) this payload matches by routing-key fragment
      const fragment = file.replace('.ts', '').replace(/-/g, '.').replace(/_/g, '.');
      const matched  = eventTypes
        .filter(e => e.routingKey.includes(fragment))
        .map(e => `\`${e.routingKey}\``);

      payloads.push({ schemaName, fields, matched });
    }
  }

  // ── core-package special files (actor, subject, normalized-event) ──
  const coreSchemas = [];
  if (name === 'core') {
    for (const file of ['actor.ts', 'subject.ts', 'normalized-event.ts']) {
      const fp = join(srcDir, file);
      if (!existsSync(fp)) continue;
      const src = readFileSync(fp, 'utf8');
      // grab all exported z.object schemas
      const schemaRe = /export const (\w+Schema)\s*=\s*z\.object/g;
      let m;
      while ((m = schemaRe.exec(src)) !== null) {
        const schemaName = m[1];
        const body   = extractObjectBody(src.slice(m.index));
        const fields = parseFields(body);
        coreSchemas.push({ schemaName, fields });
      }
    }
  }

  // ── build page ──
  const title = pkgName;
  const description = pkg.description ?? `Event types and payload schemas for ${name}.`;

  let md = `---
title: "${title}"
description: ${description}
---

import { Badge } from '@astrojs/starlight/components';

<Badge text="v${version}" variant="note" /> <Badge text="npm" variant="tip" />

\`\`\`sh
npm install ${pkgName}
\`\`\`

`;

  // core: schemas section
  if (coreSchemas.length) {
    md += `## Schemas\n\n`;
    for (const { schemaName, fields } of coreSchemas) {
      md += `### \`${schemaName}\`\n\n${fieldsToTable(fields)}\n`;
    }
  }

  // event types table
  if (eventTypes.length) {
    md += `## Event types\n\n`;
    md += `| Constant | Routing key |\n|---|---|\n`;
    for (const { constant, routingKey } of eventTypes) {
      md += `| \`${constant}\` | \`${routingKey}\` |\n`;
    }
    md += '\n';
  }

  // payload sections
  if (payloads.length) {
    md += `## Payload schemas\n\n`;
    for (const { schemaName, fields, matched } of payloads) {
      md += `### \`${schemaName}\`\n\n`;
      if (matched.length) md += `Used by: ${matched.join(', ')}\n\n`;
      md += fieldsToTable(fields) + '\n';
    }
  }

  if (!coreSchemas.length && !eventTypes.length && !payloads.length) {
    md += `_This package only re-exports types from other \`@kairosis\` packages._\n`;
  }

  return { slug: name, content: md };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

// "events" sub-directory is just a barrel re-export — skip it
const SKIP = new Set(['events']);

const dirs = readdirSync(EVENTS_SRC, { withFileTypes: true })
  .filter(d => d.isDirectory() && !SKIP.has(d.name))
  .map(d => d.name)
  .sort();

const indexEntries = [];

for (const name of dirs) {
  const result = generatePackagePage(name, join(EVENTS_SRC, name));
  if (!result) { console.warn(`  skip ${name}`); continue; }

  const outPath = join(EVENTS_OUT, `${result.slug}.md`);
  writeFileSync(outPath, result.content);
  console.log(`  wrote events/${result.slug}.md`);
  indexEntries.push(result.slug);
}

// ── index page ──
let index = `---
title: Event Packages
description: Published npm packages containing event type constants and Zod payload schemas.
---

All Kairosis event packages are published under the \`@kairosis\` scope and versioned independently.

## Packages

| Package | Description |
|---|---|
`;

const pkgDescs = {
  core:        'Core envelope — NormalizedEvent, Actor, Subject',
  browser:     'Browser activity — page visits, tab events',
  calendar:    'Calendar events — created, updated, deleted',
  email:       'Email events — received, sent, read',
  github:      'GitHub events — commits, PRs, issues, releases',
  health:      'Health metrics — heartbeat, sleep, recorded metrics',
  location:    'Location events — position updates, geofence transitions',
  notion:      'Notion events — page and database changes',
  obsidian:    'Obsidian events — note created, modified, deleted',
  slack:       'Slack events — messages, reactions, channel joins',
  spotify:     'Spotify listening — tracks, sessions, podcasts',
  synthesized: 'Synthesized events — AI-generated patterns and summaries',
  terminal:    'Terminal events — commands executed, directory changes',
};

for (const slug of indexEntries) {
  const pkgName = slug === 'core' ? '@kairosis/events-core' : `@kairosis/${slug}-events`;
  const desc    = pkgDescs[slug] ?? '';
  index += `| [\`${pkgName}\`](/events/${slug}/) | ${desc} |\n`;
}

writeFileSync(join(EVENTS_OUT, 'index.md'), index);
console.log(`  wrote events/index.md  (${indexEntries.length} packages)`);

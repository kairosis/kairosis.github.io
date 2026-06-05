---
title: Connectors Overview
description: The available connector types and how they work.
---

A connector is a plugin that knows how to talk to one external system. It receives raw data from that system and normalizes it into `NormalizedEvent[]`.

## Connector types

| Type | How data arrives | Key methods |
|---|---|---|
| `webhook` | HTTP POST from external service | `verifyWebhook()` + `normalize()` |
| `poller` | Kairosis fetches on a cron schedule | `poll(config, workspaceId)` |
| `device` | Push from a local device or app | `normalize()` |
| `import` | Bulk one-time or periodic import | `import()` as `AsyncGenerator` |
| `sync` | Bidirectional — import + export + live sync | `import()` + `export()` + `sync?()` |

## Built-in connectors

| Connector | Type | Status | Events emitted |
|---|---|---|---|
| GitHub | webhook | Stable | `github.commit.pushed`, `github.pr.*`, `github.issue.*` |
| Slack | webhook | Planned | `slack.message.*`, `slack.reaction.*` |
| Email | poller | Planned | `email.received`, `email.sent` |
| Google Calendar | poller | Planned | `calendar.event.*` |
| Obsidian | device | Planned | `obsidian.note.*` |
| Notion | poller | Planned | `notion.page.*` |

## Connector interface

Every connector implements `IKairosisConnector`:

```typescript
export interface IKairosisConnector {
  manifest:      ConnectorManifest;
  configSchema(): ZodSchema;
  secretsSchema?(): ZodSchema;
  onInit?(config: unknown): Promise<void>;
  onDestroy?(): Promise<void>;
}
```

Plus the type-specific interface (`IWebhookConnector`, `IPollerConnector`, etc.).

## Manifest

Each connector declares a manifest describing its identity and capabilities:

```typescript
{
  id:                'github',          // kebab-case, unique
  name:              'GitHub',
  description:       'GitHub webhook connector',
  version:           '1.0.0',
  author:            'Kairosis',
  type:              'webhook',
  triggers:          ['github.commit.pushed', 'github.pr.opened', ...],
  requiresAuth:      true,
  authType:          'none',            // auth handled via webhook secret
  setupInstructions: [
    'Create a webhook in your GitHub repository settings.',
    'Set the payload URL to the webhook URL shown below.',
    ...
  ],
}
```

## Config vs. secrets

Every connector has two separate Zod schemas:

| Schema | Stored as | Returned via API |
|---|---|---|
| `configSchema()` | JSONB (plaintext) | Yes |
| `secretsSchema()` | BYTEA (AES-256-GCM) | Never — only `hasSecrets: boolean` |

Never merge config and secrets. Never return secrets via the API.

## Next steps

- [Webhook Connectors](/connectors/webhook/) — deep dive into the webhook flow
- [Poller Connectors](/connectors/poller/) — how scheduled polling works
- [Building a Connector](/connectors/building/) — create your own connector

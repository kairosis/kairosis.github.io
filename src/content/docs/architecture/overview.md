---
title: Architecture Overview
description: How Kairosis is structured and how the components relate.
---

Kairosis is a fan-in event pipeline. It has three moving parts: the **API**, the **poller worker**, and the **dashboard**. All three share the same PostgreSQL database and publish to the same RabbitMQ exchange.

## High-level diagram

```
External sources
  ├── GitHub (webhook)       ─┐
  ├── Slack (webhook)         │
  ├── Email (poller)          ├─▶  API (NestJS :3200)
  ├── Calendar (poller)       │       │
  └── Device/mobile    ───────┘       │ publish
                                      ▼
                               RabbitMQ topic exchange
                               kairosis.topic
                                      │
                               ┌──────┴──────┐
                               ▼             ▼
                          Consumer A    Consumer B
                          (your app)    (your app)
```

## Components

### API (`apps/api`)

The central NestJS application. Responsibilities:

- Receive and verify webhook payloads (`POST /webhooks/:connectorId/:webhookToken`)
- Expose connector configuration endpoints
- Serve the live SSE event stream (`GET /events/stream`)
- Handle first-run setup

### Poller Worker (`apps/poller-worker`)

A NestJS standalone application that runs scheduled polling jobs. For each enabled poller connector, it calls `connector.poll()` on the configured cron schedule and publishes the resulting events. The poller is currently a stub — not yet wired.

### Dashboard (`apps/dashboard`)

A Next.js 15 App Router application. Provides:
- Setup wizard (first run)
- Connector management (enable, configure, view webhook URLs)
- Live event stream viewer

### Connectors (`connectors/`)

Internal connector implementations. Each connector lives in `connectors/<name>/` and is registered in `apps/api/src/connectors/connectors.module.ts`. Connectors are never published to npm — use `packages/connector-sdk` for that.

### Event packages (`events/`)

Published as `@kairosis/*` scoped npm packages. Define the shared event type constants and Zod payload schemas consumed by both Kairosis and downstream applications.

## Database schema

```sql
workspaces         -- workspace registry (multi-tenant ready)
connector_configs  -- per-workspace connector state + encrypted secrets
system_config      -- first-run flag, global settings
```

Connector secrets are stored as AES-256-GCM encrypted BYTEA. Config (non-sensitive) is stored as plain JSONB.

## Security model

- Webhook URLs use opaque tokens — `workspaceId` is never in the URL
- Secrets are encrypted at rest (AES-256-GCM)
- Webhook payloads are HMAC-verified before normalization
- Secrets are never returned via API — only `hasSecrets: boolean` is exposed

## Next steps

- [Event Flow](/architecture/event-flow/) — trace a single event through the system
- [Normalized Events](/architecture/normalized-events/) — the `NormalizedEvent` schema

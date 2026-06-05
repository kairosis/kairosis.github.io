---
title: Introduction
description: What Kairosis is and why you'd use it.
---

Kairosis is a self-hosted event collection and normalization platform. It connects to external tools via webhooks, polling, local agents, and device integrations — normalizes every signal into a common `NormalizedEvent` envelope — and publishes it to a RabbitMQ topic exchange.

**One job: collect, normalize, publish.**

Kairosis does not store knowledge, build graphs, or process events beyond normalization. That is downstream consumers' responsibility.

## Why Kairosis?

Modern systems generate events from dozens of sources — GitHub push events, Slack messages, calendar invites, health metrics from wearables, location updates from mobile devices. Each source has its own API, authentication scheme, and payload shape.

Kairosis solves the fan-in problem: instead of each downstream consumer wiring up and normalizing every source independently, Kairosis does it once and publishes a uniform stream to RabbitMQ.

## How it works

1. **Connect** — configure a connector for each source (webhook URL, API key, cron schedule)
2. **Verify** — webhook payloads are HMAC-verified before processing
3. **Normalize** — each connector maps the raw payload to a `NormalizedEvent`
4. **Publish** — validated events are published to `kairosis.topic` exchange
5. **Consume** — downstream systems subscribe with routing key patterns like `github.pr.#` or `#`

## Components

| Component | Description |
|---|---|
| `apps/api` | NestJS REST API — webhook receiver, connector config, SSE stream |
| `apps/dashboard` | Next.js UI — setup wizard, connector management, live event stream |
| `apps/poller-worker` | NestJS standalone — scheduled polling for poller connectors |
| `connectors/` | Internal connector implementations |
| `events/` | Published npm packages — shared event type contracts (`@kairosis/*`) |
| `packages/connector-sdk` | Published npm tooling for external connector authors |

## Next steps

- [Install Kairosis](/getting-started/installation/) — get the stack running locally
- [Quick Start](/getting-started/quick-start/) — receive your first event end-to-end
- [Architecture Overview](/architecture/overview/) — deeper understanding of the event flow

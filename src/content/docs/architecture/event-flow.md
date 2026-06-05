---
title: Event Flow
description: Trace a single event from source to RabbitMQ.
---

## Webhook flow

```
POST /webhooks/:connectorId/:webhookToken
  │
  ├─ 1. Look up workspace from webhookToken
  ├─ 2. Load connector config + decrypt secrets
  ├─ 3. connector.verifyWebhook({ body, headers, rawBody, secrets })
  │        └─ if invalid → 401, log, stop
  ├─ 4. TenantContext.run({ workspaceId })
  ├─ 5. connector.normalize(body, workspaceId, config) → NormalizedEvent[]
  ├─ 6. NormalizedEventSchema.parse() each event
  └─ 7. publisher.publish() each event → RabbitMQ kairosis.topic
```

The raw HTTP body (`req.rawBody`) is passed to `verifyWebhook` so connectors can perform byte-exact HMAC verification (required by GitHub, Slack, etc.).

## Poller flow

```
PollerScheduler (cron)
  │
  ├─ for each enabled poller connector per workspace
  ├─ TenantContext.run({ workspaceId })
  ├─ load config + decrypt secrets
  ├─ connector.poll(config, workspaceId) → NormalizedEvent[]
  ├─ NormalizedEventSchema.parse() each event
  └─ publisher.publish() each event → RabbitMQ kairosis.topic
```

## RabbitMQ routing

Kairosis publishes to a single topic exchange (`kairosis.topic`). The routing key matches the event type exactly:

| Routing key | Matches |
|---|---|
| `github.commit.pushed` | GitHub push events |
| `github.pr.opened` | GitHub PR opened events |
| `github.#` | All GitHub events |
| `email.#` | All email events |
| `#` | Everything |

Downstream consumers bind queues to `kairosis.topic` with the routing key patterns they care about.

## Tenant isolation

`TenantContext` uses Node.js `AsyncLocalStorage` to carry `workspaceId` through the async call chain without passing it as a function argument. It is set once — at the webhook handler or poller entry point — and never set inside service layers.

## Error handling

- **RabbitMQ unavailable on startup** → app crashes; Docker restart policy handles recovery
- **Invalid webhook signature** → 401, event dropped, logged
- **Zod validation failure** → event dropped, error logged
- No reconnection logic, no silent failures

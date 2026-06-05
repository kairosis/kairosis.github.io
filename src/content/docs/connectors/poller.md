---
title: Poller Connectors
description: Fetch data from external APIs on a scheduled cron interval.
---

A poller connector fetches data from an external API on a configurable cron schedule and normalizes the results into `NormalizedEvent[]`. No inbound HTTP is required — Kairosis initiates all requests.

## Interface

```typescript
export interface IPollerConnector extends IKairosisConnector {
  poll(config: unknown, workspaceId: string): Promise<NormalizedEvent[]>;
}
```

## How polling works

The poller worker runs a `PollerScheduler` that iterates over all enabled poller connectors for each workspace. For each one it:

1. Sets `TenantContext` with the `workspaceId`
2. Loads the connector config and decrypts secrets
3. Calls `connector.poll(config, workspaceId)`
4. Validates each returned event with `NormalizedEventSchema.parse()`
5. Publishes to RabbitMQ

:::note
The poller worker is currently a stub. The scheduling loop is not yet wired up.
:::

## Implementing `poll`

```typescript
async poll(config: unknown, workspaceId: string): Promise<NormalizedEvent[]> {
  const { inboxId } = EmailConfigSchema.parse(config);
  const secrets = await this.loadSecrets(); // use secretsSchema

  const messages = await fetchNewMessages(inboxId, secrets.apiKey);

  return messages.map(msg => NormalizedEventSchema.parse({
    id:          randomUUID(),
    type:        EmailEventType.RECEIVED,
    workspaceId,
    occurredAt:  msg.receivedAt,
    source:      'email',
    actor: {
      id:    msg.from.address,
      name:  msg.from.name,
      email: msg.from.address,
    },
    subject: {
      id:   msg.messageId,
      type: 'email',
    },
    payload: EmailReceivedPayload.parse({
      subject:     msg.subject,
      body:        msg.textBody,
      attachments: msg.attachments.length,
    }),
  }));
}
```

## Cron schedule

The poll interval is configured per-connector-instance via `configSchema()`. Expose a `schedule` field using a cron expression or a simple interval string:

```typescript
configSchema() {
  return z.object({
    inboxId:  z.string(),
    schedule: z.string().default('*/5 * * * *'), // every 5 minutes
  });
}
```

## Idempotency

Poller connectors are responsible for deduplication. Use a cursor, a `lastSeenId`, or a timestamp stored in the connector config to avoid re-publishing events already seen on previous poll runs.

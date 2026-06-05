---
title: Webhook Connectors
description: Receive and process inbound HTTP webhooks from external services.
---

A webhook connector receives HTTP POST requests from an external service, verifies the payload signature, and normalizes the body into `NormalizedEvent[]`.

## Interface

```typescript
export interface IWebhookConnector extends IKairosisConnector {
  verifyWebhook(params: WebhookVerifyParams): Promise<boolean>;
  normalize(body: unknown, workspaceId: string, config: unknown): Promise<NormalizedEvent[]>;
}
```

## Webhook URL format

```
POST /webhooks/:connectorId/:webhookToken
```

The `webhookToken` is an opaque random string generated when the connector is configured. It maps to a `workspaceId` internally. The workspace ID is never in the URL.

## Implementing `verifyWebhook`

Always verify the payload signature before normalizing. Most services use HMAC-SHA256:

```typescript
async verifyWebhook({ body, headers, rawBody, secrets }: WebhookVerifyParams): Promise<boolean> {
  const sig = headers['x-hub-signature-256'] as string;
  const expected = 'sha256=' + createHmac('sha256', secrets.webhookSecret)
    .update(rawBody)
    .digest('hex');
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
```

`rawBody` is always available because the API is started with `{ rawBody: true }`. Never use the parsed body for HMAC verification — byte-exact comparison is required.

## Implementing `normalize`

Map the raw payload to one or more `NormalizedEvent` objects:

```typescript
async normalize(body: unknown, workspaceId: string, config: unknown): Promise<NormalizedEvent[]> {
  const payload = GithubWebhookPayloadSchema.parse(body);

  return [{
    id:          randomUUID(),
    type:        GithubEventType.COMMIT_PUSHED,
    workspaceId,
    occurredAt:  new Date().toISOString(),
    source:      'github',
    actor: {
      id:   payload.sender.id.toString(),
      name: payload.sender.login,
    },
    subject: {
      id:   payload.repository.full_name,
      type: 'repository',
      url:  payload.repository.html_url,
    },
    payload: GithubCommitPushedPayload.parse({ ... }),
  }];
}
```

## Registering a webhook connector

1. Implement the connector in `connectors/<name>/`
2. Register it in `apps/api/src/connectors/connectors.module.ts`:

```typescript
async onModuleInit() {
  ConnectorRegistry.register(new GithubConnector());
  ConnectorRegistry.register(new YourConnector());
}
```

3. Add the path alias to `tsconfig.base.json`

---
title: Building a Connector
description: Step-by-step guide to creating a new connector for Kairosis.
---

This guide walks through creating a new webhook connector from scratch. The same principles apply to poller and other connector types.

## 1. Generate the library

```bash
npm run generate:connector --name=my-service
# creates connectors/my-service/ as an Nx lib
```

## 2. Define the manifest

```typescript
// connectors/my-service/src/my-service.connector.ts
import { ConnectorManifest } from '@kairosis/connectors';

export const manifest: ConnectorManifest = {
  id:          'my-service',
  name:        'My Service',
  description: 'Receives events from My Service via webhook.',
  version:     '1.0.0',
  author:      'Your Name',
  type:        'webhook',
  triggers:    ['my-service.thing.created', 'my-service.thing.updated'],
  requiresAuth: true,
  authType:    'none',
  setupInstructions: [
    'Go to My Service → Settings → Webhooks.',
    'Add a new webhook pointing to the URL shown below.',
    'Copy the signing secret and paste it in the Secret field.',
  ],
};
```

## 3. Define config and secrets schemas

```typescript
import { z } from 'zod';

export const MyServiceConfig = z.object({
  teamId: z.string().describe('Your My Service team ID'),
});

export const MyServiceSecrets = z.object({
  signingSecret: z.string().describe('Webhook signing secret'),
});
```

Keep config and secrets in separate schemas. Config is stored as JSONB; secrets are encrypted with AES-256-GCM.

## 4. Define event types and payloads

Create an event package if publishing to npm, or add to an existing one for internal use:

```typescript
// events/my-service/src/event-types.ts
export const MyServiceEventType = {
  THING_CREATED: 'my-service.thing.created',
  THING_UPDATED: 'my-service.thing.updated',
} as const;

// events/my-service/src/payloads/thing-created.ts
export const MyServiceThingCreatedPayload = z.object({
  thingId:   z.string(),
  thingName: z.string(),
  url:       z.string().url(),
});
```

## 5. Implement the connector class

```typescript
import { IWebhookConnector, WebhookVerifyParams } from '@kairosis/connectors';
import { NormalizedEvent, NormalizedEventSchema } from '@kairosis/events-core';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { randomUUID } from 'node:crypto';

export class MyServiceConnector implements IWebhookConnector {
  manifest = manifest;

  configSchema() { return MyServiceConfig; }
  secretsSchema() { return MyServiceSecrets; }

  async verifyWebhook({ headers, rawBody, secrets }: WebhookVerifyParams): Promise<boolean> {
    const sig = headers['x-my-service-signature'] as string;
    const { signingSecret } = MyServiceSecrets.parse(secrets);
    const expected = createHmac('sha256', signingSecret)
      .update(rawBody)
      .digest('hex');
    try {
      return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  async normalize(body: unknown, workspaceId: string, config: unknown): Promise<NormalizedEvent[]> {
    const { teamId } = MyServiceConfig.parse(config);
    const event = MyServiceWebhookPayload.parse(body);

    return [NormalizedEventSchema.parse({
      id:          randomUUID(),
      type:        MyServiceEventType.THING_CREATED,
      workspaceId,
      occurredAt:  event.createdAt,
      source:      'my-service',
      actor: {
        id:   event.user.id,
        name: event.user.name,
      },
      subject: {
        id:   event.thing.id,
        type: 'thing',
        url:  event.thing.url,
      },
      payload: MyServiceThingCreatedPayload.parse({
        thingId:   event.thing.id,
        thingName: event.thing.name,
        url:       event.thing.url,
      }),
    })];
  }
}
```

## 6. Register the connector

Add it to `apps/api/src/connectors/connectors.module.ts`:

```typescript
async onModuleInit() {
  ConnectorRegistry.register(new GithubConnector());
  ConnectorRegistry.register(new MyServiceConnector()); // add this
}
```

## 7. Add the path alias

In `tsconfig.base.json`, add a path alias so Nx can resolve the new lib:

```json
{
  "compilerOptions": {
    "paths": {
      "@kairosis/connectors-my-service": ["connectors/my-service/src/index.ts"]
    }
  }
}
```

## Rules to follow

- Always call `verifyWebhook()` before `normalize()` — never normalize an unverified payload
- Always validate with `NormalizedEventSchema.parse()` before returning
- Never write to a database inside a connector
- Never call `TenantContext` inside a connector — `workspaceId` is passed as a parameter
- Keep config and secrets in separate Zod schemas
- Never use `any` without a comment explaining why
- Routing keys must match the format `<source>.<subject>.<verb>` in dot notation

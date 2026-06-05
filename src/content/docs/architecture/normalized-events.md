---
title: Normalized Events
description: The NormalizedEvent schema — the single output contract of every connector.
---

Every connector in Kairosis produces `NormalizedEvent[]`. This is the only output type. The schema is defined in `@kairosis/events-core` and shared across Kairosis and all downstream consumers.

## Schema

```typescript
import { NormalizedEventSchema } from '@kairosis/events-core';

// inferred type
type NormalizedEvent = z.infer<typeof NormalizedEventSchema>;
```

A `NormalizedEvent` contains:

```typescript
{
  id:          string;       // unique event ID (UUID)
  type:        string;       // routing key — e.g. 'github.commit.pushed'
  workspaceId: string;       // tenant identifier
  occurredAt:  string;       // ISO 8601 timestamp
  source:      string;       // connector ID — e.g. 'github'
  actor: {
    id:        string;       // source-system user ID
    name?:     string;
    email?:    string;
    avatarUrl?: string;
  };
  subject: {
    id:        string;       // the thing the event is about
    type:      string;       // e.g. 'pull_request', 'commit', 'message'
    url?:      string;
  };
  payload:     Record<string, unknown>;  // connector-specific, Zod-validated
}
```

## Payload schemas

Each event package defines Zod schemas for connector-specific payloads:

```typescript
// @kairosis/github-events
import { GithubCommitPushedPayload } from '@kairosis/github-events';

const payload = GithubCommitPushedPayload.parse(event.payload);
// payload.commits, payload.ref, payload.repository, ...
```

## Event type constants

Routing keys are defined as constants in each event package:

```typescript
import { GithubEventType } from '@kairosis/github-events';

GithubEventType.COMMIT_PUSHED  // 'github.commit.pushed'
GithubEventType.PR_OPENED      // 'github.pr.opened'
GithubEventType.PR_MERGED      // 'github.pr.merged'
GithubEventType.ISSUE_OPENED   // 'github.issue.opened'
```

## Available event packages

| Package | Events |
|---|---|
| `@kairosis/events-core` | `NormalizedEvent`, `ActorSchema`, `SubjectSchema`, `RoutingKey` |
| `@kairosis/github-events` | commit, PR, issue events |
| `@kairosis/slack-events` | message, reaction, channel events |
| `@kairosis/email-events` | email received/sent events |
| `@kairosis/calendar-events` | event created/updated/cancelled |
| `@kairosis/browser-events` | page view, tab focus events |
| `@kairosis/terminal-events` | command executed events |
| `@kairosis/health-events` | health metric events |
| `@kairosis/location-events` | location update events |
| `@kairosis/obsidian-events` | note created/updated events |
| `@kairosis/notion-events` | page/block change events |
| `@kairosis/synthesized-events` | AI-synthesized higher-order events |

## Validation rule

Every event **must** be validated with `NormalizedEventSchema.parse()` before being published. Connectors never bypass this step.

```typescript
// always
const event = NormalizedEventSchema.parse(raw);
await publisher.publish(event);

// never
await publisher.publish(raw);
```

---
title: "@kairosis/events-core"
description: Core event types and schemas for Kairosis
---

import { Badge } from '@astrojs/starlight/components';

<Badge text="v0.1.0" variant="note" /> <Badge text="npm" variant="tip" />

```sh
npm install @kairosis/events-core
```

## Schemas

### `ActorSchema`

| Field | Type | Required | Default |
|---|---|---|---|
| `id` | `string` | Yes | — |
| `displayName` | `string` | No | — |
| `email` | `string (email)` | No | — |

### `SubjectSchema`

| Field | Type | Required | Default |
|---|---|---|---|
| `id` | `string` | Yes | — |
| `displayName` | `string` | No | — |
| `url` | `string (URL)` | No | — |

### `ClaimCheckSchema`

| Field | Type | Required | Default |
|---|---|---|---|
| `objectKey` | `string` | Yes | — |
| `url` | `string (URL)` | Yes | — |
| `expiresAt` | `string (ISO 8601)` | Yes | — |

### `NormalizedEventSchema`

| Field | Type | Required | Default |
|---|---|---|---|
| `id` | `string (UUID)` | Yes | — |
| `workspaceId` | `string (UUID)` | Yes | — |
| `connectorId` | `string` | Yes | — |
| `occurredAt` | `string (ISO 8601)` | Yes | — |
| `ingestedAt` | `string (ISO 8601)` | Yes | — |
| `actor` | `Actor` | No | — |
| `subject` | `Subject` | No | — |
| `payload` | `Record\<string, unknown\>` | Yes | — |
| `raw` | `unknown` | No | — |
| `version` | `string` | No | `'1'` |
| `claimCheck` | `ClaimCheck` | No | — |


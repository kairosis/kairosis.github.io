---
title: "@kairosis/email-events"
description: Email event types for Kairosis
---

import { Badge } from '@astrojs/starlight/components';

<Badge text="v0.1.0" variant="note" /> <Badge text="npm" variant="tip" />

```sh
npm install @kairosis/email-events
```

## Event types

| Constant | Routing key |
|---|---|
| `RECEIVED` | `email.received` |
| `SENT` | `email.sent` |
| `READ` | `email.read` |

## Payload schemas

### `EmailReceivedPayload`

Used by: `email.received`

| Field | Type | Required | Default |
|---|---|---|---|
| `name` | `string` | No | — |
| `address` | `string` | Yes | — |


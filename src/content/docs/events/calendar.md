---
title: "@kairosis/calendar-events"
description: Calendar event types for Kairosis
---

import { Badge } from '@astrojs/starlight/components';

<Badge text="v0.1.0" variant="note" /> <Badge text="npm" variant="tip" />

```sh
npm install @kairosis/calendar-events
```

## Event types

| Constant | Routing key |
|---|---|
| `EVENT_CREATED` | `calendar.event.created` |
| `EVENT_UPDATED` | `calendar.event.updated` |
| `EVENT_DELETED` | `calendar.event.deleted` |
| `EVENT_STARTED` | `calendar.event.started` |
| `EVENT_ENDED` | `calendar.event.ended` |

## Payload schemas

### `CalendarEventPayload`

Used by: `calendar.event.created`, `calendar.event.updated`, `calendar.event.deleted`, `calendar.event.started`, `calendar.event.ended`

| Field | Type | Required | Default |
|---|---|---|---|
| `email` | `string` | Yes | — |
| `displayName` | `string` | No | — |
| `responseStatus` | `string` | No | — |
| `self` | `boolean` | No | — |


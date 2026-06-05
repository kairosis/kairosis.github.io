---
title: "@kairosis/browser-events"
description: Browser event types for Kairosis
---

import { Badge } from '@astrojs/starlight/components';

<Badge text="v0.1.0" variant="note" /> <Badge text="npm" variant="tip" />

```sh
npm install @kairosis/browser-events
```

## Event types

| Constant | Routing key |
|---|---|
| `PAGE_VISITED` | `browser.page.visited` |
| `TAB_OPENED` | `browser.tab.opened` |
| `TAB_CLOSED` | `browser.tab.closed` |
| `TAB_ACTIVATED` | `browser.tab.activated` |

## Payload schemas

### `BrowserPageVisitedPayload`

Used by: `browser.page.visited`

| Field | Type | Required | Default |
|---|---|---|---|
| `url` | `string (URL)` | Yes | — |
| `title` | `string` | Yes | — |
| `tabId` | `integer` | Yes | — |
| `windowId` | `integer` | No | — |
| `transitionType` | `string` | No | — |

### `BrowserTabEventPayload`

| Field | Type | Required | Default |
|---|---|---|---|
| `tabId` | `integer` | Yes | — |
| `windowId` | `integer` | No | — |
| `url` | `string (URL)` | No | — |
| `title` | `string` | No | — |


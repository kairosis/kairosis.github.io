---
title: "@kairosis/terminal-events"
description: Terminal event types for Kairosis
---

import { Badge } from '@astrojs/starlight/components';

<Badge text="v0.1.0" variant="note" /> <Badge text="npm" variant="tip" />

```sh
npm install @kairosis/terminal-events
```

## Event types

| Constant | Routing key |
|---|---|
| `COMMAND_EXECUTED` | `terminal.command.executed` |
| `DIRECTORY_CHANGED` | `terminal.directory.changed` |

## Payload schemas

### `TerminalCommandExecutedPayload`

Used by: `terminal.command.executed`

| Field | Type | Required | Default |
|---|---|---|---|
| `command` | `string` | Yes | — |
| `exitCode` | `integer` | No | — |
| `cwd` | `string` | Yes | — |
| `shell` | `string` | No | — |
| `duration` | `number` | No | — |
| `hostname` | `string` | No | — |
| `user` | `string` | No | — |

### `TerminalDirectoryChangedPayload`

Used by: `terminal.directory.changed`

| Field | Type | Required | Default |
|---|---|---|---|
| `cwd` | `string` | Yes | — |
| `hostname` | `string` | No | — |
| `user` | `string` | No | — |


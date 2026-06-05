---
title: "@kairosis/slack-events"
description: Slack event types for Kairosis
---

import { Badge } from '@astrojs/starlight/components';

<Badge text="v0.1.0" variant="note" /> <Badge text="npm" variant="tip" />

```sh
npm install @kairosis/slack-events
```

## Event types

| Constant | Routing key |
|---|---|
| `MESSAGE_RECEIVED` | `slack.message.received` |
| `REACTION_ADDED` | `slack.reaction.added` |
| `CHANNEL_JOINED` | `slack.channel.joined` |

## Payload schemas

### `SlackChannelJoinedPayload`

Used by: `slack.channel.joined`

| Field | Type | Required | Default |
|---|---|---|---|
| `teamId` | `string` | Yes | — |
| `userId` | `string` | Yes | — |
| `channelId` | `string` | Yes | — |

### `SlackMessageReceivedPayload`

Used by: `slack.message.received`

| Field | Type | Required | Default |
|---|---|---|---|
| `teamId` | `string` | Yes | — |
| `channelId` | `string` | Yes | — |
| `userId` | `string` | Yes | — |
| `text` | `string` | Yes | — |
| `ts` | `string` | Yes | — |
| `threadTs` | `string` | No | — |

### `SlackReactionAddedPayload`

Used by: `slack.reaction.added`

| Field | Type | Required | Default |
|---|---|---|---|
| `teamId` | `string` | Yes | — |
| `userId` | `string` | Yes | — |
| `reaction` | `string` | Yes | — |
| `itemType` | `string` | Yes | — |
| `channelId` | `string` | No | — |
| `itemTs` | `string` | Yes | — |


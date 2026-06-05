---
title: REST API Reference
description: Complete reference for the Kairosis REST API.
---

The API runs on port `3200` by default. All endpoints return JSON.

## Setup

### `GET /setup/status`

Returns the current setup state.

**Response**

```json
{
  "setupComplete": true,
  "workspaceId": "uuid",
  "hasActiveConnectors": true
}
```

### `POST /setup`

Creates the first workspace. Only valid when `setupComplete` is `false`.

**Body**

```json
{ "workspaceName": "My Workspace" }
```

**Response**

```json
{ "workspaceId": "uuid" }
```

---

## Connectors

### `GET /connectors`

Returns all registered connector manifests.

**Response**

```json
[
  {
    "id": "github",
    "name": "GitHub",
    "type": "webhook",
    "triggers": ["github.commit.pushed", "github.pr.opened"],
    ...
  }
]
```

### `GET /connectors/:id`

Returns a single connector's manifest plus its config and secrets JSON Schemas.

**Response**

```json
{
  "manifest": { ... },
  "configSchema": { "$schema": "...", "type": "object", "properties": { ... } },
  "secretsSchema": { "$schema": "...", "type": "object", "properties": { ... } }
}
```

### `GET /connectors/:id/config?workspaceId=<uuid>`

Returns the current config for a connector in a given workspace.

**Response**

```json
{
  "enabled": true,
  "hasSecrets": true,
  "webhookUrl": "http://localhost:3200/webhooks/github/<token>",
  "config": { ... }
}
```

### `POST /connectors/:id/configure`

Saves or updates the connector config for a workspace.

**Body**

```json
{
  "workspaceId": "uuid",
  "enabled": true,
  "config": { ... },
  "secrets": { ... }
}
```

**Response**

```json
{
  "ok": true,
  "webhookUrl": "http://localhost:3200/webhooks/github/<token>"
}
```

---

## Webhooks

### `POST /webhooks/:connectorId/:webhookToken`

Entry point for inbound webhooks. The connector verifies the payload and normalizes it to events.

**Response**

```json
{ "ok": true, "published": 3 }
```

Returns `401` if the webhook signature is invalid.

---

## Events

### `GET /events/stream?workspaceId=<uuid>`

Server-Sent Events (SSE) stream of `NormalizedEvent` objects for the given workspace.

Each SSE message data is a JSON-serialized `NormalizedEvent`:

```
data: {"id":"...","type":"github.commit.pushed","workspaceId":"...","occurredAt":"...","source":"github","actor":{...},"subject":{...},"payload":{...}}
```

Connect with `EventSource` in the browser or any SSE client library.

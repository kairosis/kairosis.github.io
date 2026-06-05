---
title: Quick Start
description: Receive your first event end-to-end in under 10 minutes.
---

This guide walks you through configuring the GitHub connector and receiving a real push event.

## 1. Complete setup

Make sure you've followed the [Installation guide](/getting-started/installation/) and the setup wizard is complete.

## 2. Configure the GitHub connector

Open the dashboard at [http://localhost:3001/connectors](http://localhost:3001/connectors) and click **GitHub**.

On the configure page:
1. Toggle **Enabled** on
2. Enter your GitHub webhook secret (any string — keep it secure)
3. Click **Save**

The page will display your webhook URL:

```
http://localhost:3200/webhooks/github/<token>
```

## 3. Register the webhook in GitHub

In your GitHub repository:
1. Go to **Settings → Webhooks → Add webhook**
2. Set **Payload URL** to your webhook URL from above
3. Set **Content type** to `application/json`
4. Set **Secret** to the same secret you entered in the dashboard
5. Choose which events to send (or select **Send me everything**)
6. Click **Add webhook**

## 4. Watch the event stream

Open [http://localhost:3001/events](http://localhost:3001/events) in the dashboard.

Push a commit to your GitHub repository. Within seconds you should see a `github.commit.pushed` event appear in the stream.

## 5. Consume events downstream

Subscribe to the RabbitMQ topic exchange `kairosis.topic` with a routing key pattern:

```typescript
// all GitHub events
channel.bindQueue(queue, 'kairosis.topic', 'github.#');

// only push events
channel.bindQueue(queue, 'kairosis.topic', 'github.commit.pushed');

// everything
channel.bindQueue(queue, 'kairosis.topic', '#');
```

Each message is a `NormalizedEvent` JSON object — see [Normalized Events](/architecture/normalized-events/) for the schema.

## Next steps

- [Architecture Overview](/architecture/overview/) — understand how events flow through Kairosis
- [Connectors Overview](/connectors/overview/) — explore all available connectors
- [Building a Connector](/connectors/building/) — add your own data source

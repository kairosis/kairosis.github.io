---
title: Installation
description: Get Kairosis running locally with Docker.
---

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm

## Clone the repository

```bash
git clone https://github.com/pascalwilbrink/kairosis.git
cd kairosis
```

## Start infrastructure

Kairosis requires PostgreSQL and RabbitMQ. Start them with Docker Compose:

```bash
docker compose up -d
```

This starts:
- PostgreSQL 16 on port `5432`
- RabbitMQ on port `5672` (management UI on `15672`)

## Install dependencies

```bash
npm install
```

## Configure environment

Copy the example env file and fill in the required values:

```bash
cp .env.example .env
```

Key variables:

```sh
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=kairosis
POSTGRES_USER=kairosis
POSTGRES_PASSWORD=kairosis_dev

RABBITMQ_URL=amqp://kairosis:kairosis_dev@localhost:5672
RABBITMQ_EXCHANGE=kairosis.topic

# Generate with: openssl rand -hex 32
ENCRYPTION_KEY=your_32_byte_hex_key

API_PUBLIC_URL=http://localhost:3200
NEXT_PUBLIC_API_URL=http://localhost:3200
```

## Start the application

```bash
npm run dev
```

This starts:
- **API** on [http://localhost:3200](http://localhost:3200)
- **Dashboard** on [http://localhost:3001](http://localhost:3001)
- **Poller worker** in the background

## First-run setup

Open the dashboard at [http://localhost:3001](http://localhost:3001). You'll be redirected to the setup wizard (`/setup`) to create your first workspace.

Once setup is complete, you're ready to configure connectors and receive events.

## Next steps

- [Quick Start](/getting-started/quick-start/) — configure a connector and receive your first event

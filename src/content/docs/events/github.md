---
title: "@kairosis/github-events"
description: GitHub event types and payload schemas for Kairosis
---

import { Badge } from '@astrojs/starlight/components';

<Badge text="v0.1.0" variant="note" /> <Badge text="npm" variant="tip" />

```sh
npm install @kairosis/github-events
```

## Event types

| Constant | Routing key |
|---|---|
| `COMMIT_PUSHED` | `github.commit.pushed` |
| `PR_OPENED` | `github.pr.opened` |
| `PR_MERGED` | `github.pr.merged` |
| `PR_CLOSED` | `github.pr.closed` |
| `PR_REVIEWED` | `github.pr.reviewed` |
| `ISSUE_OPENED` | `github.issue.opened` |
| `ISSUE_CLOSED` | `github.issue.closed` |
| `ISSUE_REOPENED` | `github.issue.reopened` |
| `ISSUE_COMMENTED` | `github.issue.commented` |
| `RELEASE_CREATED` | `github.release.created` |

## Payload schemas

### `GithubCommitPushedPayload`

Used by: `github.commit.pushed`

| Field | Type | Required | Default |
|---|---|---|---|
| `repository` | `string` | Yes | — |
| `branch` | `string` | Yes | — |
| `commitSha` | `string` | Yes | — |
| `message` | `string` | Yes | — |
| `authorName` | `string` | Yes | — |
| `url` | `string (URL)` | Yes | — |
| `additions` | `integer ≥ 0` | No | — |
| `deletions` | `integer ≥ 0` | No | — |

### `GithubIssuePayload`

Used by: `github.issue.opened`, `github.issue.closed`, `github.issue.reopened`, `github.issue.commented`

| Field | Type | Required | Default |
|---|---|---|---|
| `repository` | `string` | Yes | — |
| `issueNumber` | `integer > 0` | Yes | — |
| `title` | `string` | Yes | — |
| `body` | `string \| null` | No | — |
| `authorName` | `string` | Yes | — |
| `state` | `'open' \| 'closed'` | Yes | — |
| `url` | `string (URL)` | Yes | — |
| `labels` | `string[]` | No | `[]` |

### `GithubPrMergedPayload`

Used by: `github.pr.merged`

| Field | Type | Required | Default |
|---|---|---|---|
| `repository` | `string` | Yes | — |
| `prNumber` | `integer > 0` | Yes | — |
| `title` | `string` | Yes | — |
| `authorName` | `string` | Yes | — |
| `mergedBy` | `string` | Yes | — |
| `headBranch` | `string` | Yes | — |
| `baseBranch` | `string` | Yes | — |
| `url` | `string (URL)` | Yes | — |
| `mergeCommit` | `string` | No | — |

### `GithubPrOpenedPayload`

Used by: `github.pr.opened`

| Field | Type | Required | Default |
|---|---|---|---|
| `repository` | `string` | Yes | — |
| `prNumber` | `integer > 0` | Yes | — |
| `title` | `string` | Yes | — |
| `body` | `string` | No | — |
| `authorName` | `string` | Yes | — |
| `headBranch` | `string` | Yes | — |
| `baseBranch` | `string` | Yes | — |
| `url` | `string (URL)` | Yes | — |
| `draft` | `boolean` | No | `false` |


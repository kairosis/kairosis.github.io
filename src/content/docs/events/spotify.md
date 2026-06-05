---
title: "@kairosis/spotify-events"
description: Spotify event types and payload schemas for Kairosis
---

import { Badge } from '@astrojs/starlight/components';

<Badge text="v0.1.0" variant="note" /> <Badge text="npm" variant="tip" />

```sh
npm install @kairosis/spotify-events
```

## Event types

| Constant | Routing key |
|---|---|
| `TRACK_STARTED` | `spotify.track.started` |
| `TRACK_COMPLETED` | `spotify.track.completed` |
| `TRACK_SAVED` | `spotify.track.saved` |
| `PLAYLIST_STARTED` | `spotify.playlist.started` |
| `PODCAST_EPISODE_STARTED` | `spotify.podcast.episode.started` |
| `PODCAST_EPISODE_COMPLETED` | `spotify.podcast.episode.completed` |
| `ARTIST_PLAYED` | `spotify.artist.played` |
| `LISTENING_SESSION_ENDED` | `spotify.listening.session.ended` |

## Payload schemas

### `SpotifyArtistPlayedPayload`

Used by: `spotify.artist.played`

| Field | Type | Required | Default |
|---|---|---|---|
| `artistId` | `string` | Yes | — |
| `artistName` | `string` | Yes | — |
| `genres` | `string[]` | Yes | — |
| `popularity` | `number` | Yes | — |
| `url` | `string` | No | — |

### `SpotifyListeningSessionEndedPayload`

Used by: `spotify.listening.session.ended`

| Field | Type | Required | Default |
|---|---|---|---|
| `durationMinutes` | `number` | Yes | — |
| `trackCount` | `number` | Yes | — |
| `topGenres` | `string[]` | Yes | — |
| `skippedCount` | `number` | Yes | — |
| `startedAt` | `string (ISO 8601)` | Yes | — |
| `endedAt` | `string (ISO 8601)` | Yes | — |

### `SpotifyPlaylistStartedPayload`

Used by: `spotify.playlist.started`

| Field | Type | Required | Default |
|---|---|---|---|
| `playlistId` | `string` | Yes | — |
| `playlistName` | `string` | Yes | — |
| `trackCount` | `number` | Yes | — |
| `owner` | `string` | Yes | — |
| `uri` | `string` | Yes | — |

### `SpotifyPodcastEpisodeCompletedPayload`

Used by: `spotify.podcast.episode.completed`

| Field | Type | Required | Default |
|---|---|---|---|
| `episodeId` | `string` | Yes | — |
| `episodeTitle` | `string` | Yes | — |
| `showName` | `string` | Yes | — |
| `durationMs` | `number` | Yes | — |
| `listenedPercent` | `number` | Yes | — |

### `SpotifyPodcastEpisodeStartedPayload`

Used by: `spotify.podcast.episode.started`

| Field | Type | Required | Default |
|---|---|---|---|
| `episodeId` | `string` | Yes | — |
| `episodeTitle` | `string` | Yes | — |
| `showName` | `string` | Yes | — |
| `showId` | `string` | Yes | — |
| `durationMs` | `number` | Yes | — |
| `description` | `string` | No | — |
| `url` | `string` | No | — |

### `SpotifyTrackCompletedPayload`

Used by: `spotify.track.completed`

| Field | Type | Required | Default |
|---|---|---|---|
| `trackId` | `string` | Yes | — |
| `trackName` | `string` | Yes | — |
| `artist` | `string` | Yes | — |
| `durationMs` | `number` | Yes | — |
| `listenedPercent` | `number` | Yes | — |

### `SpotifyTrackPlayedPayload`

| Field | Type | Required | Default |
|---|---|---|---|
| `id` | `string` | Yes | — |
| `name` | `string` | Yes | — |
| `url` | `string` | No | — |

### `SpotifyTrackPlayingPayload`

| Field | Type | Required | Default |
|---|---|---|---|
| `id` | `string` | Yes | — |
| `name` | `string` | Yes | — |
| `url` | `string` | No | — |

### `SpotifyTrackSavedPayload`

Used by: `spotify.track.saved`

| Field | Type | Required | Default |
|---|---|---|---|
| `trackId` | `string` | Yes | — |
| `trackName` | `string` | Yes | — |
| `artist` | `string` | Yes | — |
| `album` | `string` | Yes | — |
| `savedAt` | `string (ISO 8601)` | Yes | — |

### `SpotifyTrackStartedPayload`

Used by: `spotify.track.started`

| Field | Type | Required | Default |
|---|---|---|---|
| `trackId` | `string` | Yes | — |
| `trackName` | `string` | Yes | — |
| `artist` | `string` | Yes | — |
| `artistId` | `string` | Yes | — |
| `album` | `string` | Yes | — |
| `albumId` | `string` | Yes | — |
| `durationMs` | `number` | Yes | — |
| `popularity` | `number` | Yes | — |
| `explicit` | `boolean` | Yes | — |
| `url` | `string` | Yes | — |
| `previewUrl` | `string \| null` | No | — |
| `genres` | `string[]` | Yes | — |
| `contextType` | `'playlist' \| 'album' \| 'artist'` | No | — |
| `contextUri` | `string` | No | — |


---
name: quave-alarm
description: Call the user's attention through Quave Alarm when work is blocked and normal chat may be missed.
---

# Quave Alarm

Use Quave Alarm only when the user explicitly asks you to page them, or when your workflow is blocked on their decision, credential, device action, approval, or real-world action and a normal chat update may be missed.

Do not use this for routine progress updates, success notifications, or questions you can continue without.

## Setup

Use the user's API key from `QUAVE_ALARM_API_KEY`. If it is missing, ask the user to create or rotate a key in the Quave Alarm Android app and provide it through an environment variable or approved secret store. Never paste the key into files, commits, URLs, command arguments, or chat logs.

Discovery:

- API base URL: `https://alarm.quave.ai`
- OpenAPI: `https://alarm.quave.ai/openapi.json`
- Install metadata: `https://alarm.quave.ai/.well-known/quave-alarm.json`

## Dry Run

Before the first real page, print the payload locally and inspect it. This does not contact the API:

```bash
printf '%s\n' '{"title":"Quave Alarm","body":"Quave Alarm dry-run from agent setup.","severity":"critical"}'
```

## Page The User

Use a short message that says where the user should look and what is blocked. Include `--link` when a URL will take the user directly to the work.

```bash
curl -fsS -X POST https://alarm.quave.ai/api/alarms \
  -H "Authorization: Bearer $QUAVE_ALARM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quave Alarm",
    "body": "Look at Codex: I need your decision to continue.",
    "severity": "critical",
    "link": "https://chatgpt.com/codex"
  }'
```

Useful options:

- `body`: required message.
- `title`: defaults to `Quave Alarm`.
- `severity`: `info`, `warning`, or `critical`; defaults to `critical`.
- `link`: optional `http://` or `https://` destination.
- `delaySeconds`: relative scheduling.
- `scheduledAt`: exact ISO or local wall-clock timestamp.
- `timeZone`: IANA time zone for local wall-clock timestamps.
- `ttlSeconds`: delivery window.

Do not combine `delaySeconds` and `scheduledAt`.

## Inspect, Edit, And Remove Alarms

When you need to correct or remove a previously created alarm, use the API directly. Removed alarms are logically deleted from normal lists and delivery.

List active alarms:

```bash
curl -fsS https://alarm.quave.ai/api/alarms \
  -H "Authorization: Bearer $QUAVE_ALARM_API_KEY"
```

Edit an alarm:

```bash
curl -fsS -X PATCH https://alarm.quave.ai/api/alarms/<alarm-id> \
  -H "Authorization: Bearer $QUAVE_ALARM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduledAt": "2026-06-13 16:19:00",
    "timeZone": "America/Campo_Grande",
    "status": "pending"
  }'
```

Remove an alarm from normal lists and delivery:

```bash
curl -fsS -X DELETE https://alarm.quave.ai/api/alarms/<alarm-id> \
  -H "Authorization: Bearer $QUAVE_ALARM_API_KEY"
```

Lifecycle helpers:

```bash
curl -fsS -X POST https://alarm.quave.ai/api/alarms/<alarm-id>/cancel \
  -H "Authorization: Bearer $QUAVE_ALARM_API_KEY"
curl -fsS -X POST https://alarm.quave.ai/api/alarms/<alarm-id>/dismiss \
  -H "Authorization: Bearer $QUAVE_ALARM_API_KEY"
curl -fsS -X POST https://alarm.quave.ai/api/alarms/<alarm-id>/snooze \
  -H "Authorization: Bearer $QUAVE_ALARM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"delaySeconds":600}'
```

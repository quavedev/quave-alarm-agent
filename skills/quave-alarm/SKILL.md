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

Run a dry-run before the first real page:

```bash
npx -y github:quavedev/quave-alarm-agent trigger --dry-run --message "Quave Alarm dry-run from agent setup."
```

## Page The User

Use a short message that says where the user should look and what is blocked. Include `--link` when a URL will take the user directly to the work.

```bash
npx -y github:quavedev/quave-alarm-agent trigger \
  --message "Look at Codex: I need your decision to continue." \
  --link "https://chatgpt.com/codex"
```

Useful options:

- `--message`: required.
- `--title`: defaults to `Quave Alarm`.
- `--severity`: `info`, `warning`, or `critical`; defaults to `critical`.
- `--link`: optional `http://` or `https://` destination.
- `--delay-seconds`: relative scheduling.
- `--scheduled-at`: exact ISO or local wall-clock timestamp.
- `--time-zone`: IANA time zone for local wall-clock timestamps.
- `--ttl-seconds`: delivery window.
- `--dry-run`: print the redacted payload without ringing.

Do not combine `--delay-seconds` and `--scheduled-at`.

# Quave Alarm Agent

Install this package so an AI agent can call your attention through Quave Alarm.

## Android app

Download the latest public APK:

```text
https://github.com/quavedev/quave-alarm-agent/releases/latest/download/QuaveAlarm.apk
```

Install it on Android, open Quave Alarm, create or verify your account, and grant the requested alarm permissions:

- notifications
- full-screen alarm alerts
- exact alarms
- Do Not Disturb bypass / notification policy access
- ignore battery optimization / unrestricted battery usage

Copy the generated API key only into `QUAVE_ALARM_API_KEY` for your agent environment or approved secret store.

## Agent install

```bash
npx skills add quavedev/quave-alarm-agent --skill quave-alarm -g -a '*'
```

Set your API key as `QUAVE_ALARM_API_KEY`. Create or rotate the key from the Quave Alarm Android app.

Dry-run:

```bash
npx -y github:quavedev/quave-alarm-agent trigger --dry-run --message "Quave Alarm setup test."
```

Real page:

```bash
QUAVE_ALARM_API_KEY="<your key>" \
  npx -y github:quavedev/quave-alarm-agent trigger \
  --message "Look at Codex: I need your decision to continue." \
  --link "https://chatgpt.com/codex"
```

Never commit, log, or paste API keys into chat, URLs, or command arguments.

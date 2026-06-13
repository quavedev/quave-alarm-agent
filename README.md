# Quave Alarm Agent

Install this package so an AI agent can call your attention through Quave Alarm.

```bash
npx skills add quavedev/quave-alarm-agent --skill quave-alarm -g -a '*'
```

Set your API key as `QUAVE_ALARM_API_KEY`. Create or rotate the key from the Quave Alarm Android app.

Dry-run:

```bash
npx quave-alarm-agent trigger --dry-run --message "Quave Alarm setup test."
```

Real page:

```bash
QUAVE_ALARM_API_KEY="<your key>" \
  npx quave-alarm-agent trigger \
  --message "Look at Codex: I need your decision to continue." \
  --link "https://chatgpt.com/codex"
```

Never commit, log, or paste API keys into chat, URLs, or command arguments.

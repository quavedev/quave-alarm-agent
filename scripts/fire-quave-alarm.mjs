#!/usr/bin/env node

const args = parseArgs(process.argv.slice(2));
const command = args._[0] || "trigger";

if (command !== "trigger") {
  fail(`Unsupported command: ${command}`);
}

const message = args.message || args.body;
if (!message) {
  fail("--message is required");
}

if (args["delay-seconds"] && args["scheduled-at"]) {
  fail("Use either --delay-seconds or --scheduled-at, not both.");
}

const baseUrl = (args["base-url"] || process.env.QUAVE_ALARM_BASE_URL || "https://alarm.quave.ai").replace(/\/+$/, "");
const payload = {
  title: args.title || "Quave Alarm",
  body: message,
  severity: args.severity || "critical"
};

copyIfPresent(payload, "link", args.link);
copyIfPresent(payload, "deviceId", args["device-id"]);
copyIfPresent(payload, "scheduledAt", args["scheduled-at"]);
copyIfPresent(payload, "timeZone", args["time-zone"]);
copyNumberIfPresent(payload, "delaySeconds", args["delay-seconds"]);
copyNumberIfPresent(payload, "ttlSeconds", args["ttl-seconds"]);

if (args["dry-run"]) {
  console.log(JSON.stringify({ dryRun: true, baseUrl, payload }, null, 2));
  process.exit(0);
}

const apiKey = process.env.QUAVE_ALARM_API_KEY;
if (!apiKey) {
  fail("QUAVE_ALARM_API_KEY is required. Ask the user to create or rotate a key in the Quave Alarm Android app and expose it as an environment variable.");
}

const response = await fetch(`${baseUrl}/api/alarms`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
});

const body = await response.json().catch(() => ({}));
if (!response.ok) {
  fail(`Quave Alarm request failed: HTTP ${response.status} ${JSON.stringify(body)}`);
}

console.log(JSON.stringify({
  ok: true,
  alarmId: body.alarm?.id,
  scheduledAt: body.alarm?.scheduledAt,
  timeZone: body.alarm?.timeZone,
  expiresAt: body.alarm?.expiresAt,
  link: body.alarm?.link
}, null, 2));

function parseArgs(values) {
  const parsed = { _: [] };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) {
      parsed._.push(value);
      continue;
    }
    const key = value.slice(2);
    const next = values[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    index += 1;
  }
  return parsed;
}

function copyIfPresent(target, field, value) {
  if (typeof value === "string" && value.trim()) {
    target[field] = value.trim();
  }
}

function copyNumberIfPresent(target, field, value) {
  if (value !== undefined && value !== true && value !== "") {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      fail(`${field} must be a number.`);
    }
    target[field] = number;
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

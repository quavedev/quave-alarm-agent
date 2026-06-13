#!/usr/bin/env node

const args = parseArgs(process.argv.slice(2));
const command = args._[0] || "trigger";

const supportedCommands = new Set(["trigger", "list", "edit", "remove", "cancel", "dismiss", "snooze"]);
if (!supportedCommands.has(command)) {
  fail(`Unsupported command: ${command}. Use trigger, list, edit, remove, cancel, dismiss, or snooze.`);
}

if (args["delay-seconds"] && args["scheduled-at"]) {
  fail("Use either --delay-seconds or --scheduled-at, not both.");
}

if (command === "trigger") {
  const message = args.message || args.body;
  if (!message) {
    fail("--message is required");
  }
}

const baseUrl = (args["base-url"] || process.env.QUAVE_ALARM_BASE_URL || "https://alarm.quave.ai").replace(/\/+$/, "");
const request = buildRequest(command, args);

if (!request) {
  fail(`Could not build request for ${command}.`);
}

if (args["dry-run"]) {
  console.log(JSON.stringify({ dryRun: true, baseUrl, request }, null, 2));
  process.exit(0);
}

const apiKey = process.env.QUAVE_ALARM_API_KEY;
if (!apiKey) {
  fail("QUAVE_ALARM_API_KEY is required. Ask the user to create or rotate a key in the Quave Alarm Android app and expose it as an environment variable.");
}

const headers = { "Authorization": `Bearer ${apiKey}` };
if (request.body) {
  headers["Content-Type"] = "application/json";
}

const response = await fetch(`${baseUrl}${request.path}`, {
  method: request.method,
  headers,
  body: request.body ? JSON.stringify(request.body) : undefined
});

const body = await response.json().catch(() => ({}));
if (!response.ok) {
  fail(`Quave Alarm request failed: HTTP ${response.status} ${JSON.stringify(body)}`);
}

console.log(JSON.stringify(formatResponse(command, body), null, 2));

function buildRequest(commandName, parsedArgs) {
  if (commandName === "trigger") {
    const payload = {
      title: parsedArgs.title || "Quave Alarm",
      body: parsedArgs.message || parsedArgs.body,
      severity: parsedArgs.severity || "critical"
    };

    copyIfPresent(payload, "link", parsedArgs.link);
    copyIfPresent(payload, "deviceId", parsedArgs["device-id"]);
    copyIfPresent(payload, "scheduledAt", parsedArgs["scheduled-at"]);
    copyIfPresent(payload, "timeZone", parsedArgs["time-zone"]);
    copyNumberIfPresent(payload, "delaySeconds", parsedArgs["delay-seconds"]);
    copyNumberIfPresent(payload, "ttlSeconds", parsedArgs["ttl-seconds"]);

    return { method: "POST", path: "/api/alarms", body: payload };
  }

  if (commandName === "list") {
    const query = parsedArgs["include-removed"] ? "?includeRemoved=true" : "";
    return { method: "GET", path: `/api/alarms${query}` };
  }

  const alarmId = parsedArgs.id || parsedArgs._[1];
  if (!alarmId) {
    fail(`${commandName} requires --id <alarm-id> or an alarm ID argument.`);
  }
  const encodedId = encodeURIComponent(alarmId);

  if (commandName === "remove") {
    return { method: "DELETE", path: `/api/alarms/${encodedId}` };
  }

  if (commandName === "cancel" || commandName === "dismiss") {
    return { method: "POST", path: `/api/alarms/${encodedId}/${commandName}`, body: {} };
  }

  if (commandName === "snooze") {
    const payload = {};
    copyIfPresent(payload, "scheduledAt", parsedArgs["scheduled-at"]);
    copyIfPresent(payload, "timeZone", parsedArgs["time-zone"]);
    copyNumberIfPresent(payload, "delaySeconds", parsedArgs["delay-seconds"]);
    return { method: "POST", path: `/api/alarms/${encodedId}/snooze`, body: payload };
  }

  const payload = {};
  copyIfPresent(payload, "title", parsedArgs.title);
  copyIfPresent(payload, "body", parsedArgs.message || parsedArgs.body);
  copyIfPresent(payload, "severity", parsedArgs.severity);
  copyIfPresent(payload, "link", parsedArgs.link);
  copyIfPresent(payload, "deviceId", parsedArgs["device-id"]);
  copyIfPresent(payload, "scheduledAt", parsedArgs["scheduled-at"]);
  copyIfPresent(payload, "timeZone", parsedArgs["time-zone"]);
  copyIfPresent(payload, "expiresAt", parsedArgs["expires-at"]);
  copyIfPresent(payload, "status", parsedArgs.status);
  copyNumberIfPresent(payload, "delaySeconds", parsedArgs["delay-seconds"]);
  copyNumberIfPresent(payload, "ttlSeconds", parsedArgs["ttl-seconds"]);
  copyBooleanIfPresent(payload, "clearLink", parsedArgs["clear-link"]);
  copyBooleanIfPresent(payload, "clearDeviceId", parsedArgs["clear-device-id"]);

  if (Object.keys(payload).length === 0) {
    fail("edit requires at least one editable field.");
  }

  return { method: "PATCH", path: `/api/alarms/${encodedId}`, body: payload };
}

function formatResponse(commandName, body) {
  if (commandName === "list") {
    return {
      ok: true,
      alarms: Array.isArray(body.alarms) ? body.alarms.map((alarm) => ({
        id: alarm.id,
        title: alarm.title,
        body: alarm.body,
        status: alarm.status,
        scheduledAt: alarm.scheduledAt,
        timeZone: alarm.timeZone,
        expiresAt: alarm.expiresAt,
        removedAt: alarm.removedAt
      })) : []
    };
  }

  return {
    ok: true,
    alarmId: body.alarm?.id,
    status: body.alarm?.status,
    scheduledAt: body.alarm?.scheduledAt,
    timeZone: body.alarm?.timeZone,
    expiresAt: body.alarm?.expiresAt,
    removedAt: body.alarm?.removedAt,
    link: body.alarm?.link
  };
}

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

function copyBooleanIfPresent(target, field, value) {
  if (value !== undefined) {
    target[field] = value === true || value === "true";
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

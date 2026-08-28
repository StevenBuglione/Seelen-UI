import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { AGENT_CONTRACTS_SHA256, AGENT_PROTOCOL_VERSION, parseRuntimeTrace, replayRuntimeTrace } from "../src/index.ts";

const replayText = readFileSync(
  join("tools", "shell-studio", "src", "replay", "m04-thinking-to-result.runtime-events.jsonl"),
  "utf8",
);
const incompatibleText = readFileSync(
  join("tools", "shell-studio", "src", "replay", "m04-protocol-incompatible.runtime-events.jsonl"),
  "utf8",
);

test("generated protocol is pinned and JSON-safe", () => {
  assert.deepEqual(AGENT_PROTOCOL_VERSION, { major: 1, minor: 0 });
  assert.match(AGENT_CONTRACTS_SHA256, /^[0-9a-f]{64}$/u);
  const generated = readFileSync(
    join("libs", "agent-runtime-client", "src", "generated", "agent-contracts.ts"),
    "utf8",
  );
  assert.doesNotMatch(generated, /bigint/u);
  assert.match(generated, /"runtime\.state_snapshot"/u);
});

test("typed runtime replay drives the approved real-surface snapshot contract", () => {
  const result = replayRuntimeTrace(replayText);
  assert.equal(result.frames.length, 2);
  assert.equal(result.frames[0]?.snapshot.state.fixture, "thinking");
  assert.deepEqual(
    result.frames[0]?.snapshot.plan.surfaces.map((surface) => surface.kind),
    ["orb", "capsule"],
  );
  assert.equal(result.finalSnapshot.state.fixture, "result-summary");
  assert.deepEqual(
    result.finalSnapshot.plan.surfaces.map((surface) => surface.kind),
    ["orb", "toast"],
  );
  assert.equal(result.finalSnapshot.clockMs, 900);
});

test("protocol incompatibility becomes a visible fail-closed stage", () => {
  const result = replayRuntimeTrace(incompatibleText);
  assert.equal(result.finalSnapshot.state.fixture, "error-fatal");
  assert.equal(result.finalSnapshot.state.phase, "error");
  assert.match(result.finalSnapshot.state.message, /Windows remains unchanged/u);
  assert.deepEqual(
    result.finalSnapshot.plan.surfaces.map((surface) => surface.kind),
    ["orb", "stage"],
  );
});

test("malformed, out-of-order, and unsafe incompatibility traces are rejected", () => {
  assert.throws(() => parseRuntimeTrace('{"seq":1}'), /must be/u);
  assert.throws(
    () => parseRuntimeTrace(replayText.replace('"seq":2', '"seq":1')),
    /strictly increasing/u,
  );
  assert.throws(
    () => replayRuntimeTrace(incompatibleText.replace("Windows remains unchanged", "Retry now")),
    /fail-closed/u,
  );
});

test("browser runtime client contains no native pipe or Tauri bridge", () => {
  const source = readFileSync(
    join("libs", "agent-runtime-client", "src", "runtime-replay.ts"),
    "utf8",
  );
  assert.doesNotMatch(source, /@tauri-apps|__TAURI__|NamedPipe|\\\\\.\\pipe/iu);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { AGENT_CONTRACTS_SHA256, AGENT_PROTOCOL_VERSION, parseRuntimeTrace, replayRuntimeTrace } from "../src/index.ts";

const replayText = readFileSync(
  join(
    "tools",
    "shell-studio",
    "src",
    "replay",
    "m04-thinking-to-result.runtime-events.jsonl",
  ),
  "utf8",
);
const incompatibleText = readFileSync(
  join(
    "tools",
    "shell-studio",
    "src",
    "replay",
    "m04-protocol-incompatible.runtime-events.jsonl",
  ),
  "utf8",
);
const m05TextTurn = readFileSync(
  join(
    "tools",
    "shell-studio",
    "src",
    "replay",
    "m05-text-turn.runtime-events.jsonl",
  ),
  "utf8",
);
const m05Approval = readFileSync(
  join(
    "tools",
    "shell-studio",
    "src",
    "replay",
    "m05-approval.runtime-events.jsonl",
  ),
  "utf8",
);
const m05Restart = readFileSync(
  join(
    "tools",
    "shell-studio",
    "src",
    "replay",
    "m05-restart.runtime-events.jsonl",
  ),
  "utf8",
);

test("generated protocol is pinned and JSON-safe", () => {
  assert.deepEqual(AGENT_PROTOCOL_VERSION, { major: 1, minor: 1 });
  assert.equal(
    AGENT_CONTRACTS_SHA256,
    "b1c55a571ff8e9a3d265a7d7ee580c3e429cfd659d86f03e49b29bb47729cf4b",
  );
  const generated = readFileSync(
    join(
      "libs",
      "agent-runtime-client",
      "src",
      "generated",
      "agent-contracts.ts",
    ),
    "utf8",
  );
  assert.doesNotMatch(generated, /bigint/u);
  assert.match(generated, /"runtime\.state_snapshot"/u);
});

test("M05 text input streams through a capsule and completes in a result stage", () => {
  const result = replayRuntimeTrace(m05TextTurn);
  assert.equal(result.frames.length, 4);
  assert.equal(result.frames[0]?.snapshot.state.composerOpen, true);
  assert.equal(result.frames[1]?.snapshot.state.phase, "thinking");
  assert.equal(
    result.frames[2]?.snapshot.state.message,
    "AGENT OS M05 LIVE VERIFIED",
  );
  assert.equal(result.finalSnapshot.state.fixture, "result-summary");
  assert.equal(result.finalSnapshot.state.artifact?.label, "Codex response");
  assert.deepEqual(
    result.finalSnapshot.plan.surfaces.map((surface) => surface.kind),
    ["orb", "stage"],
  );
  assert.equal(
    result.finalSnapshot.state.runtime?.threadId,
    "thread:m05:coordinator",
  );
});

test("M05 Codex approval is exact and restart replay restores the durable thread", () => {
  const approval = replayRuntimeTrace(m05Approval).finalSnapshot;
  assert.equal(approval.state.fixture, "waiting-for-approval");
  assert.deepEqual(approval.state.approval, {
    action: "Run a Codex project command",
    target: "D:/work/agent-os-runtime",
    data: "cargo test --locked",
    reason: "Run the verified project test suite",
    risk: "medium",
    allowForWorkflow: true,
  });
  const restart = replayRuntimeTrace(m05Restart);
  assert.equal(restart.frames[0]?.snapshot.state.fixture, "reconnecting");
  assert.equal(restart.finalSnapshot.state.heading, "Session restored");
  assert.equal(
    restart.finalSnapshot.state.runtime?.threadId,
    "thread:m05:coordinator",
  );
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
  assert.match(
    result.finalSnapshot.state.message,
    /Windows remains unchanged/u,
  );
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
    () =>
      replayRuntimeTrace(
        incompatibleText.replace("Windows remains unchanged", "Retry now"),
      ),
    /fail-closed/u,
  );
  assert.throws(
    () =>
      replayRuntimeTrace(
        m05Approval.replace(
          '"pendingApproval":{',
          '"pendingApproval":null,"ignored":{',
        ),
      ),
    /exactly one pending approval/u,
  );
});

test("browser runtime client contains no native pipe or Tauri bridge", () => {
  const source = readFileSync(
    join("libs", "agent-runtime-client", "src", "runtime-replay.ts"),
    "utf8",
  );
  assert.doesNotMatch(source, /@tauri-apps|__TAURI__|NamedPipe|\\\\\.\\pipe/iu);
});
